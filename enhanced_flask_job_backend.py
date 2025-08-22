from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import json
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Enhanced mock data with comprehensive job information
TECH_COMPANIES = [
    {"name": "Google", "size": "Large", "rating": 4.4, "industry": "Technology"},
    {"name": "Microsoft", "size": "Large", "rating": 4.5, "industry": "Technology"},
    {"name": "Amazon", "size": "Large", "rating": 4.1, "industry": "Technology"},
    {"name": "Apple", "size": "Large", "rating": 4.3, "industry": "Technology"},
    {"name": "Tesla", "size": "Large", "rating": 3.9, "industry": "Automotive/Tech"},
    {"name": "Netflix", "size": "Medium", "rating": 4.2, "industry": "Entertainment"},
    {"name": "Meta", "size": "Large", "rating": 4.0, "industry": "Social Media"},
    {"name": "Spotify", "size": "Medium", "rating": 4.3, "industry": "Music/Tech"},
    {"name": "Uber", "size": "Large", "rating": 3.8, "industry": "Transportation"},
    {"name": "Airbnb", "size": "Medium", "rating": 4.1, "industry": "Travel/Tech"},
    {"name": "Stripe", "size": "Medium", "rating": 4.6, "industry": "FinTech"},
    {"name": "Salesforce", "size": "Large", "rating": 4.2, "industry": "CRM/SaaS"}
]

FINANCE_COMPANIES = [
    {"name": "Goldman Sachs", "size": "Large", "rating": 4.0, "industry": "Investment Banking"},
    {"name": "JPMorgan Chase", "size": "Large", "rating": 4.1, "industry": "Banking"},
    {"name": "Morgan Stanley", "size": "Large", "rating": 4.0, "industry": "Investment Banking"},
    {"name": "Bank of America", "size": "Large", "rating": 3.9, "industry": "Banking"}
]

HEALTHCARE_COMPANIES = [
    {"name": "Pfizer", "size": "Large", "rating": 4.0, "industry": "Pharmaceuticals"},
    {"name": "Johnson & Johnson", "size": "Large", "rating": 4.1, "industry": "Healthcare"},
    {"name": "Merck", "size": "Large", "rating": 4.0, "industry": "Pharmaceuticals"},
    {"name": "UnitedHealth Group", "size": "Large", "rating": 3.8, "industry": "Health Insurance"}
]

ALL_COMPANIES = TECH_COMPANIES + FINANCE_COMPANIES + HEALTHCARE_COMPANIES

JOB_LEVELS = ["Entry", "Junior", "Mid-level", "Senior", "Lead", "Principal", "Staff", "Director"]

SKILLS_DATABASE = {
    "Software Engineer": ["Python", "JavaScript", "React", "Node.js", "SQL", "Git", "AWS", "Docker"],
    "Data Scientist": ["Python", "R", "SQL", "Machine Learning", "TensorFlow", "Pandas", "Jupyter", "Statistics"],
    "Frontend Developer": ["JavaScript", "React", "Vue.js", "HTML", "CSS", "TypeScript", "Webpack", "SCSS"],
    "Backend Developer": ["Python", "Java", "Node.js", "PostgreSQL", "MongoDB", "API Design", "Microservices"],
    "DevOps Engineer": ["AWS", "Docker", "Kubernetes", "Jenkins", "Terraform", "Linux", "CI/CD", "Monitoring"],
    "Product Manager": ["Agile", "Scrum", "Analytics", "Roadmapping", "User Research", "A/B Testing", "SQL"],
    "UI/UX Designer": ["Figma", "Sketch", "Adobe XD", "Prototyping", "User Research", "Design Systems", "Usability"],
    "Marketing Manager": ["SEO", "Google Analytics", "Social Media", "Content Marketing", "PPC", "Email Marketing"]
}

def calculate_skill_match(job_skills, user_skills):
    """Calculate skill match percentage"""
    if not user_skills or not job_skills:
        return 0.6
    
    user_skills_lower = [skill.lower().strip() for skill in user_skills]
    job_skills_lower = [skill.lower().strip() for skill in job_skills]
    
    matches = sum(1 for skill in job_skills_lower if any(user_skill in skill or skill in user_skill for user_skill in user_skills_lower))
    return min(0.95, 0.4 + (matches / len(job_skills_lower)) * 0.55)

def get_company_benefits(company_info):
    """Get realistic benefits based on company type and size"""
    base_benefits = ["Health Insurance", "401(k)", "Paid Time Off"]
    
    if company_info["industry"] == "Technology":
        tech_benefits = ["Stock Options", "Flexible Hours", "Remote Work", "Tech Budget", "Free Meals", "Gym Membership"]
        return base_benefits + random.sample(tech_benefits, min(4, len(tech_benefits)))
    elif company_info["industry"] in ["Investment Banking", "Banking"]:
        finance_benefits = ["Bonus", "Retirement Plan", "Premium Health", "Commuter Benefits"]
        return base_benefits + random.sample(finance_benefits, 3)
    else:
        general_benefits = ["Wellness Program", "Learning Budget", "Flexible PTO", "Team Events"]
        return base_benefits + random.sample(general_benefits, 2)

def generate_salary_range(company_info, job_level, location):
    """Generate realistic salary ranges"""
    base_salaries = {
        "Entry": (60, 90),
        "Junior": (70, 110),
        "Mid-level": (90, 140),
        "Senior": (120, 180),
        "Lead": (150, 220),
        "Principal": (180, 280),
        "Staff": (200, 320),
        "Director": (250, 400)
    }
    
    base_min, base_max = base_salaries.get(job_level, (80, 120))
    
    # Adjust for company type
    if company_info["industry"] in ["Investment Banking", "Banking"]:
        multiplier = 1.3
    elif company_info["industry"] == "Technology" and company_info["size"] == "Large":
        multiplier = 1.2
    else:
        multiplier = 1.0
    
    # Adjust for location (simple simulation)
    location_multipliers = {
        "San Francisco": 1.4, "New York": 1.3, "Seattle": 1.2, "Austin": 1.1,
        "Boston": 1.2, "Los Angeles": 1.2, "Chicago": 1.0, "Remote": 1.0
    }
    
    location_mult = location_multipliers.get(location, 1.0)
    
    final_min = int(base_min * multiplier * location_mult)
    final_max = int(base_max * multiplier * location_mult)
    
    return f"${final_min}K - ${final_max}K"

def generate_comprehensive_jobs(query, location, skills, filters=None):
    """Generate comprehensive job listings with enhanced features"""
    
    # Determine job-specific skills
    job_skills = SKILLS_DATABASE.get(query, ["Communication", "Problem Solving", "Teamwork"])
    
    # Add user skills to job requirements for better matching
    if skills:
        additional_skills = random.sample(skills, min(3, len(skills)))
        job_skills.extend(additional_skills)
    
    jobs = []
    num_jobs = random.randint(12, 20)
    
    for i in range(num_jobs):
        company_info = random.choice(ALL_COMPANIES)
        job_level = random.choice(JOB_LEVELS)
        
        # Skill matching
        skill_match = calculate_skill_match(job_skills, skills)
        
        # Random job details
        days_ago = random.randint(0, 45)
        is_remote = random.choice([True, False, False])  # 33% chance remote
        work_type = random.choice(["Full-time", "Contract", "Part-time"])
        
        # Location handling
        if is_remote:
            job_location = "Remote"
        else:
            job_location = location or random.choice([
                "San Francisco", "New York", "Seattle", "Austin", "Boston", 
                "Los Angeles", "Chicago", "Denver", "Atlanta", "Miami"
            ])
        
        # Generate salary
        salary = generate_salary_range(company_info, job_level, job_location)
        
        # Generate benefits
        benefits = get_company_benefits(company_info)
        
        # Generate job description
        description_templates = [
            f"Join our {random.choice(['innovative', 'dynamic', 'fast-growing'])} team as a {job_level} {query}. We're seeking someone with strong expertise in {', '.join(random.sample(job_skills, min(3, len(job_skills))))}.",
            f"We're looking for a passionate {job_level} {query} to help us {random.choice(['scale our platform', 'build the future', 'solve complex challenges'])}. Experience with {', '.join(random.sample(job_skills, min(3, len(job_skills))))} is essential.",
            f"Exciting opportunity for a {job_level} {query} to make a significant impact. You'll work with {', '.join(random.sample(job_skills, min(3, len(job_skills))))} in a collaborative environment."
        ]
        
        job = {
            "id": f"job_{i}_{random.randint(1000, 9999)}",
            "title": f"{job_level} {query}",
            "company": company_info["name"],
            "company_size": company_info["size"],
            "company_rating": company_info["rating"],
            "industry": company_info["industry"],
            "location": job_location,
            "description": random.choice(description_templates),
            "requirements": job_skills[:6],  # Limit to 6 requirements
            "posted_date": (datetime.now() - timedelta(days=days_ago)).strftime("%b %d"),
            "posted_days_ago": days_ago,
            "score": round(skill_match, 2),
            "salary": salary,
            "work_type": work_type,
            "is_remote": is_remote,
            "benefits": benefits,
            "logo_color": f"hsl({random.randint(0, 360)}, 70%, {random.randint(50, 70)}%)",
            "experience_level": job_level,
            "application_url": f"https://careers.{company_info['name'].lower().replace(' ', '')}.com/jobs/{random.randint(10000, 99999)}",
            "easy_apply": random.choice([True, False]),
            "visa_sponsorship": random.choice([True, False]) if not is_remote else False,
            "tags": random.sample(["Fast Growing", "Great Benefits", "Work-Life Balance", "Learning Opportunities", "Diverse Team"], random.randint(1, 3))
        }
        
        jobs.append(job)
    
    # Apply filters if provided
    if filters:
        jobs = apply_filters(jobs, filters)
    
    # Sort by skill match score (descending) and posting date
    jobs.sort(key=lambda x: (x['score'], -x['posted_days_ago']), reverse=True)
    
    return jobs

def apply_filters(jobs, filters):
    """Apply advanced filtering to job results"""
    filtered_jobs = jobs
    
    if filters.get('salary_min'):
        filtered_jobs = [j for j in filtered_jobs if extract_salary_min(j['salary']) >= filters['salary_min']]
    
    if filters.get('work_type'):
        filtered_jobs = [j for j in filtered_jobs if j['work_type'] == filters['work_type']]
    
    if filters.get('remote_only'):
        filtered_jobs = [j for j in filtered_jobs if j['is_remote']]
    
    if filters.get('company_size'):
        filtered_jobs = [j for j in filtered_jobs if j['company_size'] == filters['company_size']]
    
    if filters.get('posted_within_days'):
        filtered_jobs = [j for j in filtered_jobs if j['posted_days_ago'] <= filters['posted_within_days']]
    
    return filtered_jobs

def extract_salary_min(salary_str):
    """Extract minimum salary from salary string"""
    try:
        return int(salary_str.split('$')[1].split('K')[0])
    except:
        return 0

@app.route('/api/jobs', methods=['POST'])
def get_jobs():
    """Main job search endpoint with comprehensive filtering"""
    try:
        data = request.get_json()
        query = data.get('query', 'Software Engineer')
        location = data.get('location', '')
        skills = data.get('skills', [])
        filters = data.get('filters', {})
        
        jobs = generate_comprehensive_jobs(query, location, skills, filters)
        
        # Analytics data
        analytics = {
            "total_found": len(jobs),
            "avg_match_score": round(sum(j['score'] for j in jobs) / len(jobs), 2) if jobs else 0,
            "remote_percentage": round((sum(1 for j in jobs if j['is_remote']) / len(jobs)) * 100, 1) if jobs else 0,
            "top_companies": list(set([j['company'] for j in jobs[:5]])),
            "salary_ranges": {
                "min": min([extract_salary_min(j['salary']) for j in jobs]) if jobs else 0,
                "max": max([extract_salary_min(j['salary']) for j in jobs]) if jobs else 0
            }
        }
        
        return jsonify({
            "status": "success",
            "count": len(jobs),
            "jobs": jobs[:20],  # Return top 20 jobs
            "analytics": analytics,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Job search failed: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/job/<job_id>', methods=['GET'])
def get_job_details(job_id):
    """Get detailed information about a specific job"""
    # In a real app, this would fetch from database
    return jsonify({
        "status": "success",
        "message": f"Job details for {job_id} - This would contain full job description, company details, similar jobs, etc."
    })

@app.route('/api/companies', methods=['GET'])
def get_companies():
    """Get list of companies for filtering"""
    return jsonify({
        "status": "success",
        "companies": [{"name": c["name"], "industry": c["industry"], "size": c["size"], "rating": c["rating"]} for c in ALL_COMPANIES]
    })

@app.route('/api/skills', methods=['GET'])
def get_skills():
    """Get list of skills for autocomplete"""
    all_skills = []
    for skill_list in SKILLS_DATABASE.values():
        all_skills.extend(skill_list)
    unique_skills = sorted(list(set(all_skills)))
    
    return jsonify({
        "status": "success",
        "skills": unique_skills
    })

@app.route('/api/locations', methods=['GET'])
def get_locations():
    """Get list of popular job locations"""
    locations = [
        "Remote", "San Francisco", "New York", "Seattle", "Austin", 
        "Boston", "Los Angeles", "Chicago", "Denver", "Atlanta", 
        "Miami", "Portland", "Nashville", "Raleigh", "Phoenix"
    ]
    
    return jsonify({
        "status": "success",
        "locations": locations
    })

@app.route('/api/analytics', methods=['POST'])
def get_job_analytics():
    """Get job market analytics and insights"""
    data = request.get_json()
    query = data.get('query', 'Software Engineer')
    location = data.get('location', '')
    
    # Generate mock analytics
    analytics = {
        "market_trends": {
            "demand": random.choice(["High", "Medium", "Growing"]),
            "competition": random.choice(["Medium", "High", "Low"]),
            "growth_rate": f"{random.randint(5, 25)}% YoY"
        },
        "salary_insights": {
            "average": f"${random.randint(80, 200)}K",
            "range": f"${random.randint(60, 100)}K - ${random.randint(150, 300)}K",
            "percentile_75": f"${random.randint(120, 250)}K"
        },
        "top_skills": random.sample(SKILLS_DATABASE.get(query, ["Python", "JavaScript"]), min(5, len(SKILLS_DATABASE.get(query, ["Python", "JavaScript"])))),
        "hiring_companies": random.sample([c["name"] for c in ALL_COMPANIES], 5)
    }
    
    return jsonify({
        "status": "success",
        "analytics": analytics
    })

@app.route('/')
def home():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🚀 Enhanced HDTN Jobs API</title>
        <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
            .container { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
            h1 { font-size: 3em; margin-bottom: 10px; text-align: center; }
            .status { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
            .endpoint { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 15px 0; border-left: 4px solid #4facfe; }
            .feature { display: inline-block; background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 20px; margin: 5px; font-size: 0.9em; }
            code { background: rgba(0,0,0,0.3); padding: 3px 8px; border-radius: 5px; font-family: 'Monaco', monospace; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Enhanced HDTN Jobs API</h1>
            <div class="status">✅ Flask Backend Running with Full Features!</div>
            
            <h2>🎯 Available Endpoints</h2>
            
            <div class="endpoint">
                <h3>POST /api/jobs</h3>
                <p><strong>Enhanced job search with comprehensive filtering</strong></p>
                <p>Features: Skill matching, salary analysis, company ratings, remote options</p>
            </div>
            
            <div class="endpoint">
                <h3>GET /api/companies</h3>
                <p>Get company directory with ratings and industry info</p>
            </div>
            
            <div class="endpoint">
                <h3>GET /api/skills</h3>
                <p>Skills database for autocomplete and recommendations</p>
            </div>
            
            <div class="endpoint">
                <h3>POST /api/analytics</h3>
                <p>Job market insights and salary analytics</p>
            </div>
            
            <h2>🌟 Enhanced Features</h2>
            <div>
                <span class="feature">🎯 AI Skill Matching</span>
                <span class="feature">💰 Salary Analytics</span>
                <span class="feature">🏢 Company Ratings</span>
                <span class="feature">📍 Location Intelligence</span>
                <span class="feature">🔔 Real-time Data</span>
                <span class="feature">📊 Market Insights</span>
                <span class="feature">🚀 Fast Search</span>
                <span class="feature">🎨 Rich Job Cards</span>
            </div>
            
            <h2>🚀 Integration Status</h2>
            <p>✅ Advanced filtering system active</p>
            <p>✅ Comprehensive job matching enabled</p>
            <p>✅ Company database with 20+ top employers</p>
            <p>✅ Real-time salary insights</p>
            <p>✅ Skills-based job scoring</p>
            <p>✅ React frontend integration ready</p>
            
            <div style="text-align: center; margin-top: 30px; opacity: 0.8;">
                <p>🎯 Ready for comprehensive job finder experience!</p>
            </div>
        </div>
    </body>
    </html>
    """

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "service": "Enhanced HDTN Jobs Finder Backend",
        "version": "2.0.0",
        "features": ["advanced_search", "skill_matching", "salary_analytics", "company_ratings"],
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Starting Enhanced HDTN Jobs Finder Backend...")
    print("📍 Server URL: http://localhost:5000")
    print("🔗 Main API: http://localhost:5000/api/jobs")
    print("📊 Analytics: http://localhost:5000/api/analytics")
    print("🏢 Companies: http://localhost:5000/api/companies")
    print("🎯 Enhanced features enabled!")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)
