FROM python:3.12-slim

# Prevent Python from creating .pyc files
# and ensure logs appear immediately.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install dependencies first so Docker can cache this layer.
COPY requirements-backend.txt .

RUN pip install --upgrade pip \
    && pip install -r requirements-backend.txt

# Copy only what the API needs.
COPY Src ./Src
COPY Reports/project1/Models_package ./Reports/project1/Models_package
COPY Reports/project2/Models_package ./Reports/project2/Models_package

# Render provides PORT dynamically.
ENV PORT=8000

EXPOSE 8000

CMD ["sh", "-c", "uvicorn Src.api.main:app --host 0.0.0.0 --port ${PORT}"]