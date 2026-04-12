def log_task_activity(task, user, action, changes=None):
    from .models import TaskActivity

    TaskActivity.objects.create(
        task=task,
        user=user,
        action=action,
        changes=changes or {}
    )