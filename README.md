<div align="center">

# 🚀 Taskora

### Fullstack Task Management Platform

*Manage projects, tasks, and team collaboration — all in one place.*

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python\&logoColor=white)](https://python.org)
[![Django](https://img.shields.io/badge/Django-REST_Framework-green?logo=django\&logoColor=white)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react\&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Production_DB-336791?logo=postgresql\&logoColor=white)](https://www.postgresql.org/)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render\&logoColor=white)](https://render.com)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel\&logoColor=white)](https://vercel.com)

<br />

[🌐 Live App](https://your-vercel-app-url.vercel.app) · [⚙️ Backend API](https://taskora-rzc2.onrender.com) · [🐛 Report Bug](https://github.com/hodajafari/taskora/issues)

</div>

---

## 📌 Overview

**Taskora** is a production-ready fullstack task management application built with **Django REST Framework** and **React/Vite**.

It follows a clean, decoupled API-driven architecture where the frontend communicates with the backend entirely through REST APIs.

It demonstrates real-world fullstack development, including API design, authentication, and production deployment.

---

## 🔗 Live Application

| Service        | URL                                    |
| -------------- | -------------------------------------- |
| 🌐 Frontend    | https://taskora-ir2uqv4et-hodajafaris-projects.vercel.app/|
| ⚙️ Backend API | https://taskora-rzc2.onrender.com    |

---

## ✨ Features

* 🔐 **User Authentication & Authorization**
* 📁 **Project & Task Management** — Full CRUD operations
* 👥 **Role-Based Access Control** — Granular permissions for project members
* 💬 **Activity & Commenting System**
* 🔎 **Advanced Filtering** — by project, status, and assignee
* 🌍 **Fully Deployed** on Render + Vercel

---

## 🏗️ Architecture

```
┌─────────────────────┐        REST API        ┌───────────────────────┐
│   React / Vite      │ ─────────────────────▶ │ Django REST Framework  │
│   (Vercel)          │ ◀───────────────────── │ (Render)               │
└─────────────────────┘       JSON Responses   └──────────┬────────────┘
                                                          │
                                                 ┌────────▼────────┐
                                                 │  PostgreSQL DB   │
                                                 └─────────────────┘
```

---

## 📦 Tech Stack

### Backend

| Technology            | Purpose             |
| --------------------- | ------------------- |
| Python + Django       | Core web framework  |
| Django REST Framework | API layer           |
| PostgreSQL            | Production database |
| Django Filters        | Query filtering     |

### Frontend

| Technology        | Purpose      |
| ----------------- | ------------ |
| React + Vite      | UI framework |
| Axios / Fetch API | HTTP client  |

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

| Layer    | Platform                     |
| -------- | ---------------------------- |
| Backend  | Render (auto-deploy on push) |
| Frontend | Vercel                       |
| Database | PostgreSQL (managed)         |

---

## 🧠 Key Learnings

* Designed and implemented RESTful APIs using Django REST Framework
* Integrated frontend and backend in a real deployment environment
* Implemented role-based permissions and filtering logic
* Migrated from SQLite to PostgreSQL for production-ready persistence

---

## 📈 Roadmap

* [ ] JWT authentication
* [ ] Docker & Docker Compose support
* [ ] Real-time updates via WebSockets
* [ ] Automated test suite
* [ ] CI/CD with GitHub Actions

---

## 👨‍💻 Author

**Hoda Jafari** — Fullstack portfolio project focused on backend architecture and real-world deployment.

[![GitHub](https://img.shields.io/badge/GitHub-hodajafari-181717?logo=github)](https://github.com/hodajafari)

---

<div align="center">⭐ If this project helped you, give it a star!</div>
