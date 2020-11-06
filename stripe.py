def stripe_create_payout(vendor, amount, currency):
    # Request payout for connected account ( Seller )
    Transaction = apps.get_model("marketplace", "Transaction")
    Payout = apps.get_model("marketplace", "Payout")
    stripe_amount = stripe_convert_application_to_stripe_amount(amount)
    fee = stripe_convert_stripe_to_application_fee(stripe_amount)
    if stripe_retrieve_first_bank_account(vendor.stripe_id):
        currency = stripe_retrieve_first_bank_account(vendor.stripe_id).get("currency")
    else:
        currency = None
    if currency:
        response = stripe.Payout.create(
            amount=stripe_amount, currency=currency, stripe_account=vendor.stripe_id
        )
    else:
        return {
            "status": "failed",
            "message": "Vendor first needs to add approved bank account",
        }

    with atomic_transaction.atomic():
        payout = Payout.objects.create(
            currency=currency,
            stripe_id=response.get("id"),
            method="stripe_payout",
            fee=fee,
            amount=amount,
            status=Payout.OMW
            if response.get("failure_code") is not (None or "null")
            else Payout.FAILED,
            data=response,
        )
        Transaction.objects.create(vendor=vendor, payout=payout, type="payout")
    return response


def stripe_update_bank_account(
    vendor_id,
    country,
    currency,
    account_number,
    bank_account_obj="bank_account",
    routing_number=None,
):
    account = stripe_retrieve_account(vendor_id)
    if account and account.get("external_accounts"):
        # Get first bank account
        bank_account = stripe.Account.modify_external_account(
            id=vendor_id,
            external_account={
                "object": bank_account_obj,
                "country": country,
                "currency": currency,
                "account_number": account_number,
                "routing_number": routing_number,
            },
        )
        if bank_account and bank_account.get("status") == "new":
            return (True, "Success")
    return (False, "Something went wrong it looks like you dont have a bank account")
