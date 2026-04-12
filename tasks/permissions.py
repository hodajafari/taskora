from rest_framework.permissions import BasePermission
from projects.permissions import BaseProjectPermission


class CanEditTask(BaseProjectPermission):
    message = "You cannot edit this task."

    def has_object_permission(self, request, view, obj):
        project_id = self.get_project_id(request, view, obj)
        membership = self.get_membership(request, project_id)

        
        if obj.project.owner == request.user:
            return True

        
        if not membership:
            return False

        if obj.status == 'done':
            return membership.role == 'admin'

        
        if membership.role == 'admin':
            return True

        
        if obj.created_by == request.user:
            return True

        
        if obj.assigned_to == request.user:
            return True

        return False



class CanDeleteTask(BaseProjectPermission):
    message = "Only admins or owner can delete tasks."

    def has_object_permission(self, request, view, obj):
        project_id = self.get_project_id(request, view, obj)
        membership = self.get_membership(request, project_id)

        if obj.project.owner == request.user:
            return True

        
        if membership and membership.role == 'admin':
            return True

        return False



class CanCreateTask(BaseProjectPermission):
    message = "You cannot create tasks in this project."

    ALLOWED_ROLES = ['admin', 'member']

    def has_permission(self, request, view):
        project_id = self.get_project_id(request, view)

        if not project_id:
            return False

        membership = self.get_membership(request, project_id)

       
        if self.is_owner(request, project_id):
            return True

        
        if membership and membership.role in self.ALLOWED_ROLES:
            return True

        return False