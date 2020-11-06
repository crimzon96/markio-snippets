import pytest
from unittest import mock
from tests.factories.users.models import UserFactory
from snap.apps.users.views import RegisterView, activate, LoginView
from snap.apps.profile.models import VendorProfile
from snap.apps.users.api_views import UserApiView
from rest_framework.test import APIRequestFactory, force_authenticate
from tests.factories.vendor.models import VendorFactory
from tests.factories.profile.models import VendorProfileFactory
from django.contrib.auth import get_user_model
from django.core import mail
from bs4 import BeautifulSoup
import re

User = get_user_model()


@pytest.mark.django_db
def test_registration_view(rf, anonymous_user):
    request = rf.post(
        "/register/",
        data={
            "username": "test_user",
            "email": "test@example.com",
            "gender": "male",
            "age": 22,
            "client_or_vendor": "vendor",
            "password1": "admin",
            "password2": "admin",
            "tos": True,
            "older_than_18": True,
        },
    )
    with mock.patch("requests.session") as mock_session:
        request.session = mock_session
    request.user = anonymous_user
    view = RegisterView.as_view()
    response = view(request)
    assert response.status_code == 302
    assert User.objects.count() >= 1
    assert not User.objects.first().is_active
    href = BeautifulSoup(mail.outbox[0].alternatives[0][0], "html.parser").find("a")[
        "href"
    ]
    uid = re.search("(?<=activate\/)\w+", href).group()
    token = re.search("[^/]+(?=/$)", href, re.MULTILINE).group()
    response = activate(request, uid, token)
    assert response.status_code == 302
    assert User.objects.first().is_active


def test_registration_view_not_older_than_18(rf, anonymous_user):
    request = rf.post(
        "/register/",
        data={
            "username": "test_user",
            "email": "test@example.com",
            "gender": "male",
            "age": 22,
            "client_or_vendor": "vendor",
            "password1": "admin",
            "password2": "admin",
            "tos": True,
            "older_than_18": False,
        },
    )
    with mock.patch("requests.session") as mock_session:
        request.session = mock_session
    request.user = anonymous_user
    view = RegisterView.as_view()
    response = view(request)
    assert response.status_code == 200
    assert User.objects.count() == 0


def test_registration_view_vendor(rf, anonymous_user):
    request = rf.post(
        "/register/",
        data={
            "username": "test_user",
            "email": "test@example.com",
            "gender": "male",
            "age": 22,
            "client_or_vendor": "vendor",
            "password1": "admin",
            "password2": "admin",
            "tos": True,
            "older_than_18": True,
        },
    )
    with mock.patch("requests.session") as mock_session:
        request.session = mock_session
    request.user = anonymous_user
    view = RegisterView.as_view()
    response = view(request)
    assert response.status_code == 302
    assert User.objects.count() >= 1
    assert not User.objects.first().is_active
    href = BeautifulSoup(mail.outbox[0].alternatives[0][0], "html.parser").find("a")[
        "href"
    ]
    uid = re.search("(?<=activate\/)\w+", href).group()
    token = re.search("[^/]+(?=/$)", href, re.MULTILINE).group()
    response = activate(request, uid, token)
    assert response.status_code == 302
    assert User.objects.first().is_active
    assert VendorProfile.objects.get(vendor__user=User.objects.first())


@pytest.mark.django_db
def test_Login_view(rf):
    user = UserFactory()
    request = rf.post(
        "/login/", data={"email": user.email, "passwor2d1": user.password,}
    )
    with mock.patch("requests.session") as mock_session:
        request.session = mock_session
    request.user = user
    view = LoginView.as_view()
    response = view(request)
    assert response.status_code == 302


@pytest.mark.django_db
def test_user_api_view_retrieve(rf, user_vendor):
    user = user_vendor
    factory = APIRequestFactory()
    view = UserApiView.as_view({"get": "retrieve"})
    request = factory.get(f"api/users/{user.id}/")
    force_authenticate(request, user=user)
    response = view(request, pk=user.id)
    assert response.status_code == 200
    assert response.data.get("id") == user.id
    assert response.data.get("username") == "crimzon"
    assert response.data.get("vendor").get("country") == "NL"
    assert (
        response.data.get("vendor").get("vendorprofile").get("title")
        == "Welcome to my page"
    )


@pytest.mark.django_db
def test_user_api_view_retrieve_with_different_user(rf, user_vendor):
    user = user_vendor
    user_2 = UserFactory(
        id=50,
        username="crimzon2",
        email="example2@crimzon.nl",
        age=18,
        older_than_18=True,
        tos=True,
    )
    vendorprofile = VendorProfileFactory(
        id=50,
        title="Welcome to my page",
        description="Lorem ipsum dolor sit amet",
        small_description="Lorem ipsum",
    )
    VendorFactory(
        id=50,
        user=user_2,
        country="NL",
        first_language="Dutch",
        second_language="English",
        stripe_id="123456",
        snapchat="example",
        instagram="example",
        facebook="example",
        twitter="example",
        vendorprofile=vendorprofile,
    )
    factory = APIRequestFactory()
    view = UserApiView.as_view({"get": "retrieve"})
    request = factory.get(f"api/users/{user.id}/")
    force_authenticate(request, user=user_2)
    response = view(request, pk=user.id)
    assert response.status_code == 403
    response.data.get("detail") == "You do not have permission to perform this action."


@pytest.mark.django_db
def test_user_api_view_retrieve_with_super_user(rf, user_vendor):
    user = user_vendor
    user_2 = UserFactory(
        id=50,
        username="crimzon2",
        email="example2@crimzon.nl",
        age=18,
        older_than_18=True,
        tos=True,
        is_superuser=True,
    )
    vendorprofile = VendorProfileFactory(
        id=50,
        title="Welcome to my page",
        description="Lorem ipsum dolor sit amet",
        small_description="Lorem ipsum",
    )
    VendorFactory(
        id=50,
        user=user_2,
        country="NL",
        first_language="Dutch",
        second_language="English",
        stripe_id="123456",
        snapchat="example",
        instagram="example",
        facebook="example",
        twitter="example",
        vendorprofile=vendorprofile,
    )
    factory = APIRequestFactory()
    view = UserApiView.as_view({"get": "retrieve"})
    request = factory.get(f"api/users/{user.id}/")
    force_authenticate(request, user=user_2)
    response = view(request, pk=user.id)
    assert response.status_code == 200
    assert response.data.get("id") == user.id
    assert response.data.get("username") == "crimzon"
    assert response.data.get("vendor").get("country") == "NL"
    assert (
        response.data.get("vendor").get("vendorprofile").get("title")
        == "Welcome to my page"
    )


@pytest.mark.django_db
def test_user_api_view_update(user_vendor):
    user = user_vendor
    factory = APIRequestFactory()
    view = UserApiView.as_view({"put": "update"})
    request = factory.put(
        f"api/users/{user.id}/", data={"age": 20, "first_name": "example"}
    )
    force_authenticate(request, user=user)
    response = view(request, pk=user.id)
    requested_user = User.objects.get(id=user.id)
    assert response.status_code == 200
    assert requested_user.age == "20"
    assert requested_user.first_name == "example"


@pytest.mark.django_db
def test_user_api_view_update_invalid(user_vendor):
    user = user_vendor
    UserFactory(
        id=50,
        username="crimzon2",
        email="example2@crimzon.nl",
        age=18,
        older_than_18=True,
        tos=True,
        is_superuser=True,
    )
    factory = APIRequestFactory()
    view = UserApiView.as_view({"put": "update"})
    request = factory.put(
        f"api/users/{user.id}/", data={"age": 16, "username": "crimzon2"}
    )
    force_authenticate(request, user=user)
    response = view(request, pk=user.id)
    requested_user = User.objects.get(id=user.id)
    assert response.status_code == 400
    assert requested_user.age == "18"
    assert (
        response.data.get("age")[0]
        == "If you under the age of 18 you can't sell. We assume that you are old enough."
    )
    assert response.data.get("username")[0] == "User with this username already exists."


@pytest.mark.django_db
def test_user_api_view_update_profile(user_vendor):
    user = user_vendor
    factory = APIRequestFactory()
    view = UserApiView.as_view({"put": "update"})
    request = factory.put(
        f"api/users/{user.id}/",
        data={
            "title": "Welcome back to my page",
            "description": "Lorem ipsum",
            "small_description": "Lorem",
            "type": "profile",
        },
    )
    force_authenticate(request, user=user)
    response = view(request, pk=user.id)
    requested_user = User.objects.get(id=user.id)
    vendor_profile = requested_user.vendor.vendorprofile
    assert response.status_code == 200
    assert vendor_profile.title == "Welcome back to my page"
    assert vendor_profile.description == "Lorem ipsum"
    assert vendor_profile.small_description == "Lorem"


@pytest.mark.django_db
def test_user_api_view_update_vendor(user_vendor):
    user = user_vendor
    factory = APIRequestFactory()
    view = UserApiView.as_view({"put": "update"})
    request = factory.put(
        f"api/users/{user.id}/",
        data={
            "first_language": "arabic",
            "second_language": "dutch",
            "facebook": "exampleFB",
            "type": "vendor",
        },
    )
    force_authenticate(request, user=user)
    response = view(request, pk=user.id)
    requested_user = User.objects.get(id=user.id)
    vendor = requested_user.vendor
    assert response.status_code == 200
    assert vendor.first_language == "arabic"
    assert vendor.second_language == "dutch"
    assert vendor.facebook == "exampleFB"
