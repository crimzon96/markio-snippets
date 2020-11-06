import pytest

from snap.apps.basket.utilsss import BasketVendor
from tests.factories.basket.models import LineFactory
from tests.factories.catalogue.models import ProductClassFactory, ProductFactory
from tests.factories.partner.models import StockRecordFactory, PartnerFactory
from tests.factories.users.models import UserFactory
from tests.factories.vendor.models import VendorFactory


from oscar.core.loading import get_model

Basket = get_model("basket", "Basket")


@pytest.mark.django_db
def test_create_new_basket():
    user = UserFactory(
        first_name="tester-1", email="test@crimzon.nl", username="tester-1"
    )
    product = ProductFactory(product_class=ProductClassFactory())
    vendor = VendorFactory(user=user)
    user = UserFactory()
    basket_vendor = BasketVendor(user, vendor, product)
    basket_vendor.create_new_basket()
    assert len(Basket.objects.all()) == 1


@pytest.mark.django_db
def test_create_new_basket_duplicate():
    user = UserFactory(
        first_name="tester-1", email="test@crimzon.nl", username="tester-1"
    )
    product = ProductFactory(product_class=ProductClassFactory())
    vendor = VendorFactory(user=user)
    user = UserFactory()
    basket_vendor = BasketVendor(user, vendor, product)
    basket_vendor.create_new_basket()
    basket_vendor.create_new_basket()
    assert len(Basket.objects.all()) == 1


@pytest.mark.django_db
def test_validate_product_vendor_true():
    user = UserFactory(
        first_name="tester-1", email="test@crimzon.nl", username="tester-1"
    )
    vendor1 = VendorFactory(user=user)
    product = ProductFactory(product_class=ProductClassFactory(), vendor=vendor1)
    user = UserFactory()
    basket_vendor = BasketVendor(user, vendor1, product)
    basket_vendor.create_new_basket()
    partner = PartnerFactory()
    stock_record = StockRecordFactory(product=product, partner=partner, partner_sku=1)
    LineFactory(
        basket=Basket.objects.first(), product=product, stockrecord=stock_record
    )
    basket = Basket.objects.first()
    assert basket_vendor.validate_product_vendor(basket)
    assert len(Basket.objects.all()) == 1


@pytest.mark.django_db
def test_validate_product_vendor_false():
    user = UserFactory(
        first_name="tester-1", email="test@crimzon.nl", username="tester-1"
    )
    vendor1 = VendorFactory(user=user)
    vendor2 = VendorFactory(user=user)
    product = ProductFactory(product_class=ProductClassFactory(), vendor=vendor2)
    basket_vendor = BasketVendor(user, vendor1, product)
    basket_vendor.create_new_basket()
    partner = PartnerFactory()
    stock_record = StockRecordFactory(product=product, partner=partner, partner_sku=1)
    LineFactory(
        basket=Basket.objects.first(), product=product, stockrecord=stock_record
    )
    basket = Basket.objects.first()
    assert not basket_vendor.validate_product_vendor(basket)
    assert len(Basket.objects.all()) == 1


@pytest.mark.django_db
def test_scenario_1():
    user = UserFactory(
        first_name="tester-1", email="test@crimzon.nl", username="tester-1"
    )
    product = ProductFactory(product_class=ProductClassFactory())
    vendor = VendorFactory(user=user)
    basket_vendor = BasketVendor(user, vendor, product)
    basket_vendor.get_or_create_new_basket_vendor()
    assert len(Basket.objects.all()) == 1


@pytest.mark.django_db
def test_scenario_2():
    user = UserFactory()
    vendor1 = VendorFactory(user=user)
    vendor2 = VendorFactory(user=user)
    product1 = ProductFactory(product_class=ProductClassFactory(), vendor=vendor1)
    product1 = ProductFactory(product_class=ProductClassFactory(), vendor=vendor1)
    ProductFactory(product_class=ProductClassFactory(), vendor=vendor1)
    basket_vendor = BasketVendor(user, vendor1, product1)
    basket_vendor.create_new_basket()

    product = ProductFactory(product_class=ProductClassFactory(), vendor=vendor1)
    partner = PartnerFactory()
    stock_record = StockRecordFactory(product=product, partner=partner, partner_sku=1)
    LineFactory(
        basket=Basket.objects.first(), product=product, stockrecord=stock_record
    )
    basket_vendor.get_or_create_new_basket_vendor()
    assert len(Basket.objects.all()) == 1
    assert Basket.objects.last().status == Basket.OPEN
    assert not Basket.objects.filter(status=Basket.OPEN).first().lines.all().exists()


@pytest.mark.django_db
def test_scenario_3():
    user1 = UserFactory(
        first_name="tester-1", email="test1@crimzon.nl", username="tester-1"
    )
    user2 = UserFactory(
        first_name="tester-2", email="test2@crimzon.nl", username="tester-2"
    )
    vendor1 = VendorFactory(user=user1)
    vendor2 = VendorFactory(user=user2)
    product1 = ProductFactory(
        product_class=ProductClassFactory(), vendor=vendor1, slug="product1"
    )
    product2 = ProductFactory(
        product_class=ProductClassFactory(), vendor=vendor1, slug="product2"
    )
    basket_vendor = BasketVendor(user1, vendor2, product2)
    basket_vendor.create_new_basket()
    partner = PartnerFactory()
    stock_record = StockRecordFactory(product=product1, partner=partner, partner_sku=1)
    LineFactory(
        basket=Basket.objects.first(), product=product1, stockrecord=stock_record
    )
    basket_vendor.get_or_create_new_basket_vendor()
    assert Basket.objects.first().status == Basket.OTHER_VENDOR
