<div align="center">

# 🚀 Taskora

### Fullstack Task Management Platform

*Manage projects, tasks, and team collaboration — all in one place.*

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)](https://python.org)
[![Django](https://img.shields.io/badge/Django-REST_Framework-green?logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Production_DB-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=white)](https://render.com)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)

<br />

[🌐 Live App](https://taskora-cyan.vercel.app) ·
[⚙️ Backend API](https://taskora-rzc2.onrender.com) ·
[🐛 Report Bug](https://github.com/hodajafari/taskora/issues)

</div>

---

## 📌 Overview

**Taskora** is a fullstack task management platform built with **Django REST Framework** and **React/Vite**.

The application follows a decoupled, API-driven architecture where the React frontend communicates with the Django backend through REST APIs.

The project demonstrates real-world fullstack development, including authentication, role-based access control, automated testing, Docker containerization, CI/CD, health monitoring, and production deployment.

---

## 🔗 Live Application

| Service | URL |
|---|---|
| 🌐 Frontend | https://taskora-cyan.vercel.app |
| ⚙️ Backend API | https://taskora-rzc2.onrender.com |

---

## ✨ Features

- 🔐 **User Authentication & Authorization**
- 🎫 **JWT Authentication**
- 📁 **Project & Task Management** — Full CRUD operations
- 👥 **Role-Based Access Control** — Granular permissions for project members
- 💬 **Activity & Commenting System**
- 🔎 **Advanced Filtering** — By project, status, and assignee
- 🤖 **AI Task Suggestions** — Real-time suggestions with debounce optimization
- ⚡ **Bulk AI Generator** — Generate multiple tasks from a single prompt
- 🐳 **Docker & Docker Compose** — Containerized local development
- ⚙️ **CI/CD Pipeline** — Automated tests, Docker build, container test, and deployment
- 🩺 **Health Monitoring** — Post-deployment health checks
- 🔁 **Rollback Mechanism** — Fail-safe deployment strategy
- 🌍 **Production Deployment** — Backend on Render, frontend on Vercel, PostgreSQL database

---

## 🏗️ Architecture

```text
┌─────────────────────┐        REST API        ┌───────────────────────┐
│   React / Vite       │ ─────────────────────▶ │ Django REST Framework │
│   (Vercel)            │ ◀───────────────────── │ (Render)               │
└─────────────────────┘       JSON Responses    └──────────┬────────────┘
                                                            │
                                                   ┌────────▼────────┐
                                                   │  PostgreSQL DB   │
                                                   └─────────────────┘


                    GitHub Actions CI/CD
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
       Backend Tests   Frontend Build   Docker Build
            │                             │
            │                             ▼
            │                        Container Test
            │                             │
            └──────────────┬──────────────┘
                            ▼
                     Docker Image Push
                            │
                            ▼
                   Backend Deployment
                            │
                            ▼
                      Health Check
                            │
                            ▼
                   Frontend Deployment
                            │
                            ▼
                        Rollback
```

---

## 📦 Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| Python 3.11 | Programming language |
| Django | Backend web framework |
| Django REST Framework | REST API development |
| PostgreSQL | Production database |
| Django Filter | API filtering |
| JWT | Authentication |
| pytest / pytest-django | Automated testing |

### Frontend

| Technology | Purpose |
|---|---|
| React | UI development |
| Vite | Frontend build tool |
| JavaScript | Frontend programming |
| Axios / Fetch API | API communication |

### DevOps & Deployment

| Technology | Purpose |
|---|---|
| Docker | Application containerization |
| Docker Compose | Local multi-container development |
| GitHub Actions | CI/CD automation |
| Docker Hub | Container image registry |
| Render | Backend deployment |
| Vercel | Frontend deployment |
| PostgreSQL | Production database |

---

## 🧩 API Highlights

```python
class TaskViewSet(ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsProjectMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'status', 'assigned_to']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def activities(self, request, pk=None):
        task = self.get_object()
        activities = TaskActivity.objects.filter(task=task)
        return Response(TaskActivitySerializer(activities, many=True).data)
```

---

## ⚙️ Local Setup

```bash
git clone https://github.com/hodajafari/taskora.git
cd taskora

# Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd taskfront
npm install
npm run dev
```

---

## 🌍 Deployment

| Layer | Platform |
|---|---|
| Backend | Render |
| Frontend | Vercel |
| Database | PostgreSQL |
| Container Registry | Docker Hub |
| CI/CD | GitHub Actions |

---

## 🧠 Key Learnings

- Designed and implemented RESTful APIs using Django REST Framework
- Designed relational database models using PostgreSQL
- Implemented JWT authentication and role-based permissions
- Implemented filtering and access-control logic
- Built a decoupled React frontend communicating with a Django REST API
- Integrated AI-powered task suggestions with debounce optimization
- Containerized the backend using Docker
- Created a local multi-container environment using Docker Compose
- Built a CI/CD pipeline with GitHub Actions
- Automated backend testing and frontend build validation
- Implemented Docker image build, container testing, and Docker Hub publishing
- Implemented post-deployment health checks
- Implemented a basic rollback strategy for failed deployments
- Deployed the application using Render and Vercel

---

## 🧪 Testing

This project includes an automated test suite to ensure the reliability and correctness of core backend features.

### 🔍 Covered Test Cases

- Task creation with proper permissions
- Access control (prevent non-members from creating tasks)
- Filtering tasks based on user membership
- Task reordering (Kanban-style ordering logic)
- Task activity endpoint response

### ▶️ Run Tests

```bash
pytest
```

### 📁 Example Test

```python
@pytest.mark.django_db
def test_reorder_task(client, user, project, member):
    client.force_authenticate(user=user)

    task = Task.objects.create(
        title="Task1",
        project=project,
        order=0,
        status="todo"
    )

    response = client.post("/api/tasks/reorder/", [
        {"id": task.id, "order": 2, "status": "done"}
    ], format="json")

    task.refresh_from_db()

    assert response.status_code == 200
    assert task.order == 2
```

### ⚙️ Testing Stack

- pytest
- pytest-django
- Django REST Framework (APIClient)

### 🤖 AI Integration

- **AI Task Suggestions** — Generate task suggestions from user input
- **Bulk AI Generator** — Generate multiple tasks from a single prompt
- **Debounced Input** — Reduces unnecessary API requests while typing

---

## ⚙️ CI/CD

This project implements a robust CI/CD pipeline to ensure reliability, code quality, and safe production deployments.

### Pipeline

```text
Git Push
   │
   ├── Backend Tests
   │
   ├── Frontend Build
   │
   ├── Docker Build
   │
   ├── Docker Container Test
   │
   └── Deployment
          │
          ├── Backend Deployment
          │
          ├── Health Check
          │
          └── Frontend Deployment
                    │
                    └── Rollback on Failure
Deployment only continues when the required validation steps pass.
```

---

## 📈 Roadmap

- [x] JWT authentication
- [x] Docker & Docker Compose support
- [x] Automated test suite (pytest)
- [x] CI/CD with GitHub Actions
- [x] AI Task Suggestions
- [x] Bulk AI Generator
- [ ] Real-time updates via WebSockets
- [ ] Improve test coverage with factory_boy

---

## 👨‍💻 Author

**Hoda Jafari** — Fullstack portfolio project focused on backend architecture and real-world deployment.

[![GitHub](https://img.shields.io/badge/GitHub-hodajafari-181717?logo=github)](https://github.com/hodajafari)

---

<div align="center">⭐ If this project helped you, give it a star!</div>
