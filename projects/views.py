

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListCreateAPIView
from django.shortcuts import get_object_or_404
from .serializers import ProjectSerializer
from .models import Project, Membership
from .pagination import CustomPagination

class ProjectListCreateView(ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        return Project.objects.filter(
            owner=self.request.user
        ).order_by("order")
    def post(self, request):
        serializer = ProjectSerializer(data=request.data)

        if serializer.is_valid():
            project = serializer.save(owner=request.user)

            Membership.objects.create(
                user=request.user,
                project=project,
                role='admin'
            )

            return Response(serializer.data, status=201)  

        return Response(serializer.errors, status=400)  
class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, id):
        project = get_object_or_404(Project, id=id, owner=request.user)

        serializer = ProjectSerializer(project, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)  

    def delete(self, request, id):
        project = get_object_or_404(Project, id=id, owner=request.user)
        project.delete()
        return Response({"message": "Deleted"}, status=204)  
    def get(self, request, id):
        project = get_object_or_404(
        Project,
        id=id,
        owner=request.user
    )

        serializer = ProjectSerializer(project)
        return Response(serializer.data)
class JoinProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)

        if Membership.objects.filter(user=request.user, project=project).exists():
            return Response({"message": "Already a member"}, status=200)  

        Membership.objects.create(
            user=request.user,
            project=project,
            role='member'
        )

        return Response({"message": "Joined successfully"}, status=201)  
class ReorderProjectsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order = request.data.get("order", [])

        for index, project_id in enumerate(order):
            Project.objects.filter(
                id=project_id,
                owner=request.user
            ).update(order=index)

        return Response({"status": "ok"})