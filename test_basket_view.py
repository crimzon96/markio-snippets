import pytest

from rest_framework.test import APIRequestFactory, force_authenticate
from snap.apps.basket.views import AddProductToBasket
from tests.factories.users.models import UserFactory
from tests.factories.catalogue.models import ProductFactory, ProductClassFactory
from tests.factories.vendor.models import VendorFactory
from tests.factories.partner.models import PartnerFactory, StockRecordFactory


@pytest.mark.django_db
def test_add_product_to_basket():
    user = UserFactory()

    vendor = VendorFactory(id=2, user=user)
    product = ProductFactory(
        id=2,
        product_class=ProductClassFactory(),
        vendor=vendor,
        title="Test product",
        description="Test description",
    )

    partner = PartnerFactory()
    StockRecordFactory(product=product, partner=partner, partner_sku=1)
    factory = APIRequestFactory()
    view = AddProductToBasket.as_view()
    data = {"vendor_id": 2, "product_id": 2}
    request = factory.post("/api/add_product/", data, format="json")
    force_authenticate(request, user=user)
    response = view(request)
    data = response.data
    assert response.status_code == 200
    assert data.get("title") == "Test product"
    assert data.get("description") == "Test description"
    assert data.get("url") == "http://testserver/oscarapi/products/2/"
