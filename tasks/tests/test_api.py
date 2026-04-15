import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from projects.models import Project, Membership
from tasks.models import Task

User = get_user_model()


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def user():
    return User.objects.create_user(
        email="test@test.com",
        password="pass"
    )


@pytest.fixture
def project(user):
    return Project.objects.create(
        name="Test Project",
        owner=user
    )


@pytest.fixture
def member(user, project):
    return Membership.objects.create(
        user=user,
        project=project,
        role="admin"
    )


# ✅ 1. create task (success)
@pytest.mark.django_db
def test_create_task_success(client, user, project, member):
    client.force_authenticate(user=user)

    response = client.post("/api/tasks/", {
        "title": "New Task",
        "project": project.id
    })

    assert response.status_code == 201
    assert Task.objects.count() == 1


# ❌ 2. create task without membership
@pytest.mark.django_db
def test_create_task_forbidden(client, user):
    client.force_authenticate(user=user)

    project = Project.objects.create(
        name="No Access Project",
        owner=user
    )

    response = client.post("/api/tasks/", {
        "title": "Hack Task",
        "project": project.id
    })

    assert response.status_code == 403


# 🔍 3. queryset filtering
@pytest.mark.django_db
def test_user_sees_only_his_tasks(client, user):
    client.force_authenticate(user=user)

    other_user = User.objects.create_user(
        email="other@test.com",
        password="pass"
    )

    project1 = Project.objects.create(name="P1", owner=user)
    project2 = Project.objects.create(name="P2", owner=other_user)

    Membership.objects.create(user=user, project=project1, role="admin")
    Membership.objects.create(user=other_user, project=project2, role="admin")

    Task.objects.create(title="Task1", project=project1)
    Task.objects.create(title="Task2", project=project2)

    response = client.get("/api/tasks/")

    assert response.status_code == 200

    if isinstance(response.data, dict):
        assert len(response.data["results"]) == 1
    else:
        assert len(response.data) == 1


# 🔁 4. reorder
@pytest.mark.django_db
def test_reorder_task(client, user, project, member):
    client.force_authenticate(user=user)

    task = Task.objects.create(
        title="Task1",
        project=project,
        position=0,
        status="todo"
    )

    response = client.post("/api/tasks/reorder/", [
        {
            "id": task.id,
            "order": 2,
            "status": "done"
        }
    ], format="json")

    task.refresh_from_db()

    assert response.status_code == 200
    assert task.order == 2
    assert task.status == "done"


# 📜 5. activity endpoint
@pytest.mark.django_db
def test_task_activity_endpoint(client, user, project, member):
    client.force_authenticate(user=user)

    task = Task.objects.create(
        title="Task1",
        project=project,
        order=0,
        status="todo"
    )

    response = client.get(f"/api/tasks/{task.id}/activities/")

    assert response.status_code == 200