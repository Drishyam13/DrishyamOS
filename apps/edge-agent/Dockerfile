# Production Dockerfile for Drishyam Python AI Edge Agent Detector

FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV & FFmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY apps/edge-agent/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/edge-agent/ ./

ENV PYTHONUNBUFFERED=1

CMD ["python", "main.py"]
