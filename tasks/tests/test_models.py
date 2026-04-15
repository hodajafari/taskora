import pytest
from django.contrib.auth import get_user_model
from projects.models import Project, Membership
from tasks.models import Task, TaskActivity

User = get_user_model()


# ✅ 1. Task creation
@pytest.mark.django_db
def test_task_creation():
    user = User.objects.create_user(
        email="test@test.com",
        password="123456"
    )

    project = Project.objects.create(
        name="Test Project",
        owner=user
    )

    Membership.objects.create(
        user=user,
        project=project,
        role="admin"
    )

    task = Task.objects.create(
        title="Test Task",
        project=project,
        assigned_to=user
    )

    assert task.title == "Test Task"
    assert task.project == project
    assert task.assigned_to == user
    assert task.status == "todo"   # default check


# ✅ 2. Task string representation
@pytest.mark.django_db
def test_task_str():
    user = User.objects.create_user(email="test@test.com", password="123456")
    project = Project.objects.create(name="Test Project", owner=user)

    task = Task.objects.create(
        title="My Task",
        project=project
    )

    assert str(task) == "My Task"


# ✅ 3. Task ordering (Meta ordering)
@pytest.mark.django_db
def test_task_ordering():
    user = User.objects.create_user(email="test@test.com", password="123456")
    project = Project.objects.create(name="Test Project", owner=user)

    t1 = Task.objects.create(title="Task1", project=project, status="todo", position=2)
    t2 = Task.objects.create(title="Task2", project=project, status="todo", position=1)

    tasks = Task.objects.all()

    assert tasks[0] == t2
    assert tasks[1] == t1


# ✅ 4. TaskActivity creation
@pytest.mark.django_db
def test_task_activity_creation():
    user = User.objects.create_user(email="test@test.com", password="123456")
    project = Project.objects.create(name="Test Project", owner=user)

    task = Task.objects.create(title="Task1", project=project)

    activity = TaskActivity.objects.create(
        task=task,
        user=user,
        action="created",
        changes={"field": "title"}
    )

    assert activity.task == task
    assert activity.user == user
    assert activity.action == "created"


# ✅ 5. TaskActivity string representation
@pytest.mark.django_db
def test_task_activity_str():
    user = User.objects.create_user(email="test@test.com", password="123456")
    project = Project.objects.create(name="Test Project", owner=user)
    task = Task.objects.create(title="Task1", project=project)

    activity = TaskActivity.objects.create(
        task=task,
        user=user,
        action="created"
    )

    assert "created" in str(activity)


# ✅ 6. get_user_display method
@pytest.mark.django_db
def test_task_activity_user_display():
    user = User.objects.create_user(email="test@test.com", password="123456")
    project = Project.objects.create(name="Test Project", owner=user)
    task = Task.objects.create(title="Task1", project=project)

    activity = TaskActivity.objects.create(
        task=task,
        user=user,
        action="created"
    )

    assert activity.get_user_display() == user.email


# ✅ 7. activity without user (system action)
@pytest.mark.django_db
def test_task_activity_system_user():
    user = User.objects.create_user(email="test@test.com", password="123456")
    project = Project.objects.create(name="Test Project", owner=user)
    task = Task.objects.create(title="Task1", project=project)

    activity = TaskActivity.objects.create(
        task=task,
        action="deleted"
    )

    assert activity.get_user_display() == "System"