from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from projects.models import Membership
from .models import Task, TaskActivity
from .serializers import TaskSerializer, TaskActivitySerializer
from .permissions import (
    CanEditTask,
    CanDeleteTask,
    CanCreateTask
)
from .utils import log_task_activity
from projects.permissions import IsProjectMember,IsProjectMemberObject




class TaskViewSet(ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'assigned_to', 'project']

    def get_queryset(self):
        user = self.request.user
        project_id = self.request.query_params.get("project")

        queryset = Task.objects.filter(
            project__memberships__user=user
        )

        if project_id:
            queryset = queryset.filter(project_id=project_id)

        return queryset.distinct()

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated(), CanCreateTask()]

        elif self.action in ['update', 'partial_update']:
            return [IsAuthenticated(), CanEditTask()]

        elif self.action == 'destroy':
            return [IsAuthenticated(), CanDeleteTask()]

        elif self.action == 'retrieve':
            return [IsAuthenticated(), IsProjectMember()]
        
        elif self.action == 'activity':
            return [IsAuthenticated()]

        return [IsAuthenticated()]

    # ================= CREATE =================
    def perform_create(self, serializer):
        user = self.request.user
        project = serializer.validated_data["project"]

        is_member = Membership.objects.filter(
            user=user,
            project=project
        ).exists()

        if not is_member:
            raise PermissionDenied("You are not a member of this project")

        task = serializer.save()

        # ✅ لاگ ساخت تسک
        log_task_activity(
            task=task,
            user=user,
            action='created'
        )

    # ================= UPDATE =================
    def perform_update(self, serializer):
        old_instance = self.get_object()

        # 🔥 تغییر مهم: assigned_to به جای assigned_to_id
        tracked_fields = ['title', 'status', 'assigned_to', 'position', 'order']

        # 🧠 گرفتن مقدار قبلی
        old_data = {f: getattr(old_instance, f) for f in tracked_fields}

        task = serializer.save()

        # 🧠 گرفتن مقدار جدید
        new_data = {f: getattr(task, f) for f in tracked_fields}

        changes = {}

        for field in tracked_fields:
            if old_data[field] != new_data[field]:

                # 🔥 اصلاح مهم برای assigned_to (نمایش ایمیل به جای ID)
                if field == "assigned_to":
                    changes[field] = {
                        "from": getattr(old_data[field], "email", None),
                        "to": getattr(new_data[field], "email", None)
                    }
                else:
                    changes[field] = {
                        "from": old_data[field],
                        "to": new_data[field]
                    }

        if changes:

            # 🧠 تعیین نوع اکشن هوشمند
            if 'status' in changes:
                action = 'status_changed'
            elif 'assigned_to' in changes:
                action = 'assigned'
            elif 'order' in changes:
                action = 'reordered'
            else:
                action = 'updated'

            log_task_activity(
                task=task,
                user=self.request.user,
                action=action,
                changes=changes
            )

    # ================= DELETE =================
    def perform_destroy(self, instance):
        # 🧠 نگه داشتن اطلاعات قبل از حذف
        task_data = {
            "title": instance.title,
            "status": instance.status,
            "assigned_to": getattr(instance.assigned_to, "email", None)  # ✅ اصلاح شد
        }

        log_task_activity(
            task=instance,
            user=self.request.user,
            action='deleted',
            changes=task_data
        )

        instance.delete()

    # ================= REORDER =================
    @action(detail=False, methods=["post"])
    def reorder(self, request):
        """
        [{id: 1, order: 0, status: 'todo'}]
        """

        for item in request.data:
            task = Task.objects.get(id=item["id"])

            old_status = task.status
            old_order = task.order

            # ✅ safe update (خیلی مهم)
            task.order = item.get("order", task.order)
            task.status = item.get("status", task.status)
            task.save()

            changes = {}

            if old_status != task.status:
                changes["status"] = {
                    "from": old_status,
                    "to": task.status
                }

            if old_order != task.order:
                changes["order"] = {
                    "from": old_order,
                    "to": task.order
                }

            if changes:
                log_task_activity(
                    task=task,
                    user=request.user,
                    action="reordered" if "order" in changes else "status_changed",
                    changes=changes
                )

        # ✅ باید بیرون حلقه باشه
        return Response({"status": "ok"})

    # ================= ACTIVITY =================
    @action(detail=True, methods=['get'])
    def activities(self, request, pk=None):
        task = self.get_object()
        self.check_object_permissions(request, task)
        activities = TaskActivity.objects.filter(
            task=task
        ).order_by('-created_at')

        serializer = TaskActivitySerializer(activities, many=True)

        return Response(serializer.data)

    # ================= FIX ORDER =================
    def reorder_tasks(self, task):
        tasks = Task.objects.filter(
            project=task.project,
            status=task.status
        ).order_by("order")

        for index, t in enumerate(tasks):
            if t.order != index:
                t.order = index
                t.save()