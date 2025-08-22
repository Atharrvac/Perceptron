#!/bin/bash

echo "🚀 Starting HDTN Jobs Finder Flask Backend..."
echo "📍 Server will run on: http://localhost:5000"
echo "🔗 API endpoint: http://localhost:5000/api/jobs"
echo "🎯 Ready for React frontend integration!"

# Check if Python is available
if command -v python3 &> /dev/null; then
    python3 flask_job_backend.py
elif command -v python &> /dev/null; then
    python flask_job_backend.py
else
    echo "❌ Python not found. Please install Python to run the Flask backend."
    exit 1
fi
