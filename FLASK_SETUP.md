# Flask Job Backend Setup

## Quick Start

To enable the enhanced Flask-powered job search functionality, start the Flask backend server:

```bash
python flask_job_backend.py
```

The server will start on `http://localhost:5000` and provide:

- Enhanced job matching with realistic company data
- Skill-based scoring system
- Company perks and benefits
- Salary ranges based on company types
- Remote work indicators
- Advanced job filtering

## Features

### Flask Backend Advantages:
- **Faster Response Times**: Direct backend processing
- **Enhanced Job Data**: Realistic company profiles, salaries, and perks
- **Smart Matching**: Skill-based job scoring
- **Rich Metadata**: Company logos, benefits, remote work status
- **Scalable Architecture**: Ready for real job API integration

### AI Search Fallback:
- Automatic fallback when Flask backend is unavailable
- Web search integration for real job listings
- Natural language job descriptions
- Broad search capabilities

## Integration Status

✅ **Supabase**: Configured with provided credentials  
✅ **OpenAI API**: Configured for AI job search  
✅ **Flask Backend**: Created and ready to start  
✅ **React Frontend**: Updated with dual-mode job search  
✅ **Enhanced UI**: Company logos, perks, match scores  

## API Endpoints

### `POST /api/jobs`
Search for job listings with enhanced filtering:

```json
{
  "query": "Software Engineer",
  "location": "New York",
  "skills": ["Python", "React", "Node.js"]
}
```

### `GET /health`
Check backend health status

## Next Steps

1. **Start Flask Backend**: Run `python flask_job_backend.py`
2. **Test Job Search**: Use the enhanced job finder interface
3. **Real API Integration**: Replace mock data with real job APIs (Indeed, LinkedIn, etc.)
4. **Database Storage**: Add job search history and favorites
5. **User Preferences**: Save search filters and recommendations

## Troubleshooting

- **Flask not starting**: Ensure Python and Flask dependencies are installed
- **CORS issues**: Backend includes CORS headers for frontend integration
- **Port conflicts**: Change port in `flask_job_backend.py` if needed
- **Fallback mode**: App automatically switches to AI search if Flask unavailable
