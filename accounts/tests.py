from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthTest(APITestCase):

    def test_register_success(self):
        url = reverse('register')
        data = {
            "email": "test@test.com",
            "password": "123456"
        }

        response = self.client.post(url, data)

       
        self.assertEqual(response.status_code, 201)

      
        self.assertIn('email', response.data)
        self.assertEqual(response.data['email'], data['email'])

       
        self.assertTrue(
            User.objects.filter(email=data['email']).exists()
        )

    def test_register_invalid(self):
        url = reverse('register')
        data = {
            "email": "", 
            "password": "123"
        }

        response = self.client.post(url, data)

        
        self.assertEqual(response.status_code, 400)
def test_login(self):
       
        User.objects.create_user(
            email="test@test.com",
            password="123456"
        )

        url = reverse('login')
        data = {
            "email": "test@test.com",
            "password": "123456"
        }

        response = self.client.post(url, data)

      
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)   
def test_protected_view(self):
   
    User.objects.create_user(
        email="test@test.com",
        password="123456"
    )

    login_url = reverse('login')
    login_data = {
        "email": "test@test.com",
        "password": "123456"
    }
    login_response = self.client.post(login_url, login_data)

    access_token = login_response.data['access']

    
    url = reverse('test')
    self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    response = self.client.get(url)

    self.assertEqual(response.status_code, 200)  
def test_protected_view_unauthorized(self):
    url = reverse('test')
    response = self.client.get(url)

    self.assertEqual(response.status_code, 401)               
