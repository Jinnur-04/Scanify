# Use official Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the correct port (Hugging Face uses port 7860)
EXPOSE 7860

# Run the app
CMD ["python", "app.py"]
