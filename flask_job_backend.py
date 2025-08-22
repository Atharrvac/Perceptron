from flask import Flask, request, jsonify
from flask_cors import CORS
import random
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Enhanced mock data generator with more realistic job details
def generate_mock_jobs(query, location, skills):
    tech_companies = ["Google", "Microsoft", "Amazon", "Apple", "Tesla", "Netflix", 
                     "Meta", "Twitter", "Uber", "Airbnb", "Stripe", "Salesforce"]
    finance_companies = ["Goldman Sachs", "JPMorgan Chase", "Morgan Stanley", "Bank of America"]
    healthcare_companies = ["Pfizer", "Johnson & Johnson", "Merck", "UnitedHealth Group"]
    
    all_companies = tech_companies + finance_companies + healthcare_companies
    job_types = ["Senior", "Junior", "Mid-level", "Lead", "Principal", "Staff"]
    
    jobs = []
    num_jobs = random.randint(8, 15)
    
    for i in range(num_jobs):
        skill_match = random.uniform(0.5, 0.95) if skills else 0.7
        days_ago = random.randint(0, 30)
        is_remote = random.choice([True, False])
        company = random.choice(all_companies)
        
        # Company-specific details
        if company in tech_companies:
            salary_range = f"${random.randint(90, 250)}K"
            perks = ["Stock options", "Flexible hours", "Tech budget"]
        elif company in finance_companies:
            salary_range = f"${random.randint(100, 300)}K"
            perks = ["Bonus", "Retirement plan", "Health insurance"]
        else:
            salary_range = f"${random.randint(80, 200)}K"
            perks = ["Health benefits", "Paid leave", "Wellness program"]
        
        jobs.append({
            "title": f"{random.choice(job_types)} {query}",
            "company": company,
            "location": location if not is_remote else "Remote",
            "description": f"We're looking for a {query} with experience in {', '.join(skills) if skills else 'relevant technologies'}. " +
                          f"Join our {random.choice(['innovative', 'fast-growing', 'award-winning'])} team and work on " +
                          f"{random.choice(['cutting-edge', 'exciting', 'challenging'])} projects!",
            "posted_date": (datetime.now() - timedelta(days=days_ago)).strftime("%b %d"),
            "score": skill_match,
            "salary": salary_range,
            "is_remote": is_remote,
            "perks": random.sample(perks, 2),
            "logo_color": f"hsl({random.randint(0, 360)}, 70%, 60%)"  # Random vibrant color for logo
        })
    
    return sorted(jobs, key=lambda x: x['score'], reverse=True)

@app.route('/api/jobs', methods=['POST'])
def get_jobs():
    try:
        data = request.get_json()
        query = data.get('query', 'Software Engineer')
        location = data.get('location', 'New York')
        skills = data.get('skills', [])
        
        jobs = generate_mock_jobs(query, location, skills)
        
        return jsonify({
            "status": "success",
            "count": len(jobs),
            "jobs": jobs[:12]  # Return top 12 jobs
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/')
def home():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HDTN Jobs Finder API</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #333;
                text-align: center;
            }
            .status {
                background: #4CAF50;
                color: white;
                padding: 10px;
                border-radius: 5px;
                text-align: center;
                margin: 20px 0;
            }
            .endpoint {
                background: #f9f9f9;
                padding: 15px;
                border-radius: 5px;
                margin: 10px 0;
                border-left: 4px solid #2196F3;
            }
            code {
                background: #eee;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: monospace;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 HDTN Jobs Finder API</h1>
            <div class="status">✅ Flask Backend is Running!</div>
            
            <h2>Available Endpoints</h2>
            
            <div class="endpoint">
                <h3>POST /api/jobs</h3>
                <p>Search for job listings with advanced filtering</p>
                <p><strong>Request Body:</strong></p>
                <pre><code>{
  "query": "Software Engineer",
  "location": "New York", 
  "skills": ["Python", "JavaScript", "React"]
}</code></pre>
                <p><strong>Response:</strong> JSON array of job listings with company details, salaries, and match scores</p>
            </div>
            
            <h2>Integration Status</h2>
            <p>✅ CORS enabled for frontend integration</p>
            <p>✅ Mock job data generator active</p>
            <p>✅ AI-powered job matching simulation</p>
            <p>✅ Ready for React frontend integration</p>
            
            <h2>Next Steps</h2>
            <ol>
                <li>Your React app will automatically connect to this backend</li>
                <li>Job searches will now use enhanced Flask functionality</li>
                <li>Enjoy improved job matching with realistic company data!</li>
            </ol>
        </div>
    </body>
    </html>
    """

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "service": "HDTN Jobs Finder Backend",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Starting HDTN Jobs Finder Backend...")
    print("📍 Server will run on: http://localhost:5000")
    print("🔗 API endpoint: http://localhost:5000/api/jobs")
    print("🎯 Ready for React frontend integration!")
    app.run(host='0.0.0.0', port=5000, debug=True)
