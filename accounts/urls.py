from django.urls import path

from accounts.views.users import UserListView
from .views import RegisterView, TestView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import MeView, ChangePasswordView, LogoutView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('test/', TestView.as_view(), name='test'),
    path('me/', MeView.as_view(), name='me'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('users/', UserListView.as_view()),
]
