from django.urls import path
from .views import ProjectDetailView, ProjectListCreateView, JoinProjectView, ReorderProjectsView
from projects import views

urlpatterns = [
    path('', ProjectListCreateView.as_view()),
    path('<int:id>/', ProjectDetailView.as_view()),
    path('projects/<int:project_id>/join/', JoinProjectView.as_view()),
    path("reorder/", ReorderProjectsView.as_view()),
]