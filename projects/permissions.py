from rest_framework.permissions import BasePermission
from .models import Membership


class BaseProjectPermission(BasePermission):
    message = "You do not have permission to access this project."

    def get_project_id(self, request, view, obj=None):
        return (
            request.data.get('project')
            or request.query_params.get('project')
            or view.kwargs.get('project_id')
            or (obj.project.id if obj else None)
        )

    def get_membership(self, request, project_id):
        if not hasattr(request, '_membership_cache'):
            request._membership_cache = {}

        if project_id not in request._membership_cache:
            request._membership_cache[project_id] = Membership.objects.filter(
                user=request.user,
                project_id=project_id
            ).select_related('project').first()

        return request._membership_cache[project_id]

    def is_owner(self, request, project_id): 
        if not project_id:
            return False
        return request.user.owned_projects.filter(id=project_id).exists()


#  Member Access
class IsProjectMember(BaseProjectPermission):
    message = "You must be a member of this project."

    def has_permission(self, request, view):
        project_id = self.get_project_id(request, view)

        if not project_id:
            return False

        return (
            self.get_membership(request, project_id) is not None
            or self.is_owner(request, project_id)
        )



class IsProjectAdmin(BaseProjectPermission):
    message = "Only project admins can perform this action."

    def has_permission(self, request, view):
        project_id = self.get_project_id(request, view)

        if not project_id:
            return False

        membership = self.get_membership(request, project_id)

        return (
            (membership and membership.role == 'admin')
            or self.is_owner(request, project_id)
        )



class IsProjectMemberObject(BaseProjectPermission):
    message = "You must be a member of this project."

    def has_object_permission(self, request, view, obj):
        project_id = self.get_project_id(request, view, obj)

        if not project_id:
            return False

        return (
            self.get_membership(request, project_id) is not None
            or obj.project.owner == request.user
        )



