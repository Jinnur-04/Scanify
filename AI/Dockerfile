# Use official slim Python image
FROM python:3.10-slim

# Set environment variables
ENV TRANSFORMERS_CACHE=/app/hf_cache \
    HF_HOME=/app/hf_cache \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set working directory inside the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Create writable HuggingFace cache directory
RUN mkdir -p /app/hf_cache

# Pre-download SentenceTransformer model
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-mpnet-base-v2')"

# Copy application source code
COPY . .

# Expose port (change if your app uses a different one)
EXPOSE 7860

# Start the app
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "app:app"]

