import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()
@pytest.fixture
def client():
    return APIClient()


# ✅ Test successful user registration
@pytest.mark.django_db
def test_register_success(client):
    url = reverse('register')

    data = {
        "email": "test@test.com",
        "password": "123456"
    }

    response = client.post(url, data)

    # Check response status
    assert response.status_code == 201

    # Check response data
    assert "email" in response.data
    assert response.data["email"] == data["email"]

    # Ensure user is created in database
    assert User.objects.filter(email=data["email"]).exists()


# ❌ Test invalid registration (bad input)
@pytest.mark.django_db
def test_register_invalid(client):
    url = reverse('register')

    data = {
        "email": "",
        "password": "123"
    }

    response = client.post(url, data)

    # Should return validation error
    assert response.status_code == 400


# 🔐 Test login and JWT token generation
@pytest.mark.django_db
def test_login(client):
    # Create user
    User.objects.create_user(
        email="test@test.com",
        password="123456"
    )

    url = reverse('login')

    data = {
        "email": "test@test.com",
        "password": "123456"
    }

    response = client.post(url, data)

    # Check login success
    assert response.status_code == 200

    # Check JWT tokens exist
    assert "access" in response.data
    assert "refresh" in response.data


# 🔒 Test accessing protected endpoint with valid token
@pytest.mark.django_db
def test_protected_view(client):
    # Create user
    User.objects.create_user(
        email="test@test.com",
        password="123456"
    )

    # Login to get token
    login_response = client.post(reverse('login'), {
        "email": "test@test.com",
        "password": "123456"
    })

    access_token = login_response.data["access"]

    # Send authenticated request
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    response = client.get(reverse('test'))

    # Should be authorized
    assert response.status_code == 200


# ❌ Test accessing protected endpoint without authentication
@pytest.mark.django_db
def test_protected_view_unauthorized(client):
    response = client.get(reverse('test'))

    # Should be unauthorized
    assert response.status_code == 403