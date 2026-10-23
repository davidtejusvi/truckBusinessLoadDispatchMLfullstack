# syntax=docker/dockerfile:1

# ---- builder stage: build a virtualenv with all dependencies ----
FROM python:3.12-slim AS builder

WORKDIR /app

COPY requirements.txt .

RUN python -m venv /opt/venv \
    && /opt/venv/bin/pip install --no-cache-dir --upgrade pip \
    && /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# ---- runner stage: slim runtime as a non-root user ----
FROM python:3.12-slim

WORKDIR /app

# Create a non-root user with a fixed uid (1001).
RUN groupadd --system --gid 1001 appuser \
    && useradd --system --uid 1001 --gid appuser --create-home appuser

# Copy the prebuilt virtualenv from the builder stage.
COPY --from=builder /opt/venv /opt/venv

# Copy the application source.
COPY app ./app

# Make the virtualenv binaries take precedence on PATH.
ENV PATH="/opt/venv/bin:$PATH"

EXPOSE 8000

USER appuser

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
