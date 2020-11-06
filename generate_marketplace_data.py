from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.db import models, transaction
from django.db.utils import IntegrityError
from oscar.core.loading import get_model
from snap.apps.vendor.models import Vendor
from snap.apps.marketplace.stripe import stripe_retrieve_and_update_stripe_account
from snap.apps.marketplace.models import (Dispute, Order, Payment, Payout,
                                          Transaction)
from snap.apps.catalogue.utils import _create_product
User = get_user_model()
Product = get_model("catalogue", "Product")
ProductClass = get_model("catalogue", "ProductClass")

class Command(BaseCommand):
    help = 'Create marketplace data'

    def handle(self, *args, **options):
        for email in ["admin@crimzon.nl", "vendor@crimzon.nl", "test@crimzon.nl"]:
            with transaction.atomic():
                user, did_not_already_exist = User.objects.get_or_create(
                    email=email
                )
                user.set_password("admin")
                user.username = user.email.replace("@crimzon.nl", "")
                user.age = 20
                user.gender = "male"
                user.save()

                vendor, vendor_did_not_already_exist = Vendor.objects.get_or_create(
                    user=user
                )
                vendor.country = "NL"
                vendor.first_language = "english"
                vendor.second_language = "english"
                vendor.snapchat = "Testvendor2020"
                vendor.instagram = "Testvendor2020"
                vendor.facebook = "Testvendor2020"
                vendor.twitter = "Testvendor2020"
                vendor.stripe_id = "acct_1HWe3dDl4bXoCPsU"
                stripe_retrieve_and_update_stripe_account(vendor)
                vendor.save()
                profile = vendor.vendorprofile
                profile.title = "Welcome to my page"
                profile.description = "Lorem ipsum"
                profile.small_description = "Lorem ipsum"
                profile.save()
                print(f"I just created the user: {user.email}")
        test_vendor, _ = Vendor.objects.get_or_create(
            user__email="vendor@crimzon.nl"
        )
        # Create product 1
        with transaction.atomic():
            product_1 = _create_product(
                title="German Shepherd",
                vendor=test_vendor,
                slug="german-shepard",
                attributes=None,
                images=None,
                price_excl_tax=20,
                category_str="Dog",
                status="live",
                description="German Shepherd"
            )
            order_1, _ = Order.objects.get_or_create(
                status="completed",
                currency="EUR",
                product=product_1
            )
            order_2, _ = Order.objects.get_or_create(
                status="open",
                currency="EUR",
                product=product_1
            )
            payment_1, _ = Payment.objects.get_or_create(
                order=order_1,
                status="success",
                amount=20
            )
            transaction_1, _ = Transaction.objects.get_or_create(
                vendor=test_vendor,
                payment=payment_1,
                _type="Payment-from-client"
            )
            print(f"Created new product: {product_1.title}")
            try:
                dispute_1, _ = Dispute.objects.get_or_create(
                    vendor=test_vendor,
                    status="Open",
                    solved="Progress",
                    buyer_reason="No product yet.",
                    number=1
                )
                dispute_1.order = order_1
                dispute_1.save()
                print(f"Created new dispute: {dispute_1.pk} - {dispute_1.vendor}")
            except IntegrityError:
                pass
            # Create product 2
            product_2 = _create_product(
                title="German Shepherd",
                vendor=test_vendor,
                slug="german-shepard",
                attributes=None,
                images=None,
                price_excl_tax=20,
                category_str="Dog",
                status="live",
                description="German Shepherd"
            )
            order_3, _ = Order.objects.get_or_create(
                status="completed",
                currency="EUR",
                product=product_2
            )
            order_4, _ = Order.objects.get_or_create(
                status="open",
                currency="EUR",
                product=product_2
            )
            payment_2, _ = Payment.objects.get_or_create(
                order=order_3,
                status="success",
                amount=20
            )
            transaction_2, _ = Transaction.objects.get_or_create(
                vendor=test_vendor,
                payment=payment_2,
                _type="Payment-from-client"
            )
            print(f"Created new product: {product_2.title}")
            try:
                dispute_2, _ = Dispute.objects.get_or_create(
                    vendor=test_vendor,
                    status="Closed",
                    solved="Postive",
                    buyer_reason="My order was late",
                    number=2
                )
                dispute_2.order = order_3
                dispute_2.save()
                print(f"Created new dispute: {dispute_2.pk} - {dispute_2.vendor}")
            except IntegrityError:
                pass
