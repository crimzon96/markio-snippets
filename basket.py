import logging

from oscar.core.loading import get_model

logger = logging.getLogger(__name__)
Basket = get_model("basket", "Basket")


class BasketVendor:
    """
    Get basket of requested user.

    A basket is always unique to one requested user and vendor!!

    Check if current basket of requested user is already made with a different vendor.

    Scenario 1
    User has no basket:

    When the requested user has no basket the basket get created with the vendor id of the product.

    Scenario 2
    User has basket and wants to buy other product of the same vendor:

    When the requested user has a basket with a vendor and wants to add other product.
    The basked get cleared and add new product.

    Scenario 3
    User has basket with already a product of a vendor and wants to add a product of another vendor:


    Scenario 4
    Django oscar creates a basket for every user should counter this in the future but for now.
    Add the first vendor to the basket

    When the requested user has a basket filled with a product of a vendor and wants to buy another vendors product.
    It should "close" the basket of the current vendor. We can later use this for analytics.
    And make a new basket with the new vendors product in it.
    """

    def __init__(self, user, vendor, product):
        self.vendor = vendor
        self.user = user
        self.product = product

    def create_new_basket(self):
        if self.user.get_user_basket is None:
            basket = Basket.objects.create(owner=self.user, vendor=self.vendor)
            return basket

    def validate_product_vendor(self, basket):
        if basket.lines.exists():
            line = basket.lines.first()
            if line and line.product.vendor != self.vendor:
                logger.info(
                    "The vendor of the product is not the same as the vendor in de basket"
                )
                return False
            return True

    def remove_current_product(self, basket):
        """
        The requested user requested a other product of the same vendor.
        This function should remove the current product.
        """
        if basket.lines.exists():
            line = basket.lines.first()
            if line and line.product != self.product:
                line.delete()
                logger.info("Delete current product of the same vendor from the basket")
                return True
            return False

    def change_current_basket_status(self, basket):
        # Change current basket status to other vendor
        basket.status = Basket.OTHER_VENDOR
        basket.save(update_fields=["status"])
        self.create_new_basket()

    def get_or_create_new_basket_vendor(self):
        basket = self.user.get_user_basket
        # Catch Scenario 1 when the user has no basket
        if not basket:
            basket = self.create_new_basket()
            logger.info("Create a new basket")
            return basket

        # Catch Scenario 2
        elif (
            self.vendor == self.product.vendor
            and basket.lines.exists()
            and self.product != basket.lines.first().product
        ):
            self.remove_current_product(basket)
            logger.info("Remove current product from basket")

        # Catch Scenario 3
        elif self.vendor != self.product.vendor and basket.lines.exists():
            self.change_current_basket_status(basket)
            logger.info(
                "Put status from basket to other vendor and create a new basket"
            )

        # Catch Scenario 4
        elif not basket.vendor:
            basket.vendor = self.vendor
            basket.save(update_fields=["vendor"])

        return basket
