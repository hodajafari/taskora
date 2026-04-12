from rest_framework import serializers
from django.db.models import Max
from .models import Task
from django.db import transaction
from .models import TaskActivity

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_email = serializers.EmailField(
        source='assigned_to.email',
        read_only=True
    )

    class Meta:
        model = Task
        fields = '__all__'
        extra_kwargs = {
            'position': {'required': False}
        }

    def validate_title(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Title too short")
        return value

    def create(self, validated_data):
        project = validated_data.get('project')
        status = validated_data.get('status', 'todo')

        with transaction.atomic():
            last_position = Task.objects.select_for_update().filter(
                project=project,
                status=status
            ).aggregate(Max('position'))['position__max']

            validated_data['position'] = (
                last_position + 1 if last_position is not None else 0
            )

            return super().create(validated_data)
    def update(self, instance, validated_data):
        request = self.context.get("request")
        user = request.user if request else None

        old_status = instance.status
        old_title = instance.title
        old_assigned = instance.assigned_to

        instance = super().update(instance, validated_data)

        changes = {}

        # 🟡 status
        if old_status != instance.status:
            changes["status"] = {
                "from": old_status,
                "to": instance.status
            }

        # ✏️ title
        if old_title != instance.title:
            changes["title"] = {
                "from": old_title,
                "to": instance.title
            }

        # 👤 assign
        if old_assigned != instance.assigned_to:
            changes["assigned_to"] = {
                "from": getattr(old_assigned, "email", None),
                "to": getattr(instance.assigned_to, "email", None)
            }

        # 🔥 اگر چیزی تغییر کرده → لاگ بساز
        if changes:
            TaskActivity.objects.create(
                task=instance,
                user=user,
                action="updated",
                changes=changes
            )

        return instance
class TaskActivitySerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = TaskActivity
        fields = ["id", "action", "changes", "created_at", "user_email"]        