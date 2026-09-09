# =========================
# Base Image
# =========================
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# =========================
# Workdir
# =========================
WORKDIR /app

# =========================
# Dependencies
# =========================
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# =========================
# Copy Project
# =========================
COPY . .
RUN chmod +x /app/entrypoint.sh
# =========================
# Collect Static
# =========================
RUN python manage.py collectstatic --noinput

# =========================
# Run Server (Production)
# =========================
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]