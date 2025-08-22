import React, { useState, useEffect } from 'react';
import { getResponseWithGoogleSearch, getStructuredResponse, aiService } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';

interface JobListing {
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  requirements: string[];
  url?: string;
  postedDate?: string;
  jobType?: string;
}

interface JobSearchFilters {
  jobTitle: string;
  location: string;
  experienceLevel: string;
  jobType: string;
  salaryRange: string;
  skills: string;
}

const JobFinderPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<JobSearchFilters>({
    jobTitle: '',
    location: '',
    experienceLevel: 'any',
    jobType: 'any',
    salaryRange: 'any',
    skills: ''
  });

  const searchJobs = async (query: string, useFilters: boolean = false) => {
    setLoading(true);
    try {
      let searchPrompt = `Find current job listings for: ${query}`;
      
      if (useFilters) {
        const filterDetails = [];
        if (filters.location) filterDetails.push(`location: ${filters.location}`);
        if (filters.experienceLevel !== 'any') filterDetails.push(`experience level: ${filters.experienceLevel}`);
        if (filters.jobType !== 'any') filterDetails.push(`job type: ${filters.jobType}`);
        if (filters.salaryRange !== 'any') filterDetails.push(`salary range: ${filters.salaryRange}`);
        if (filters.skills) filterDetails.push(`required skills: ${filters.skills}`);
        
        if (filterDetails.length > 0) {
          searchPrompt += ` with ${filterDetails.join(', ')}`;
        }
      }

      searchPrompt += `. Please provide detailed job listings with company names, locations, job descriptions, requirements, and any available salary information. Focus on recent and legitimate job postings.`;

      const response = await getResponseWithGoogleSearch(searchPrompt);
      
      // Try to extract structured job data
      const structuredJobs = await getStructuredResponse<JobListing[]>(
        `Based on this job search result: "${response.text}", extract and format job listings as an array of job objects with title, company, location, description, requirements (as array), salary, url, postedDate, and jobType fields.`,
        [
          {
            title: "Software Developer",
            company: "Tech Company",
            location: "San Francisco, CA",
            description: "We are looking for a skilled developer...",
            requirements: ["JavaScript", "React", "Node.js"],
            salary: "$80,000 - $120,000",
            url: "https://example.com/job",
            postedDate: "2024-01-15",
            jobType: "Full-time"
          }
        ]
      );

      if (structuredJobs && Array.isArray(structuredJobs) && structuredJobs.length > 0) {
        setJobs(structuredJobs);
      } else if (response.text && response.text !== 'Error fetching response.' && !response.text.startsWith('Error:')) {
        // Fallback: create jobs from the text response
        const fallbackJobs = parseJobsFromText(response.text);
        setJobs(fallbackJobs);
      } else {
        // API error case - show helpful message
        setJobs([{
          title: 'Job Search Temporarily Unavailable',
          company: 'HDTN Connect',
          location: 'Online',
          description: 'Our AI job search is currently experiencing issues. Please try again later or use traditional job boards like LinkedIn, Indeed, or Glassdoor in the meantime.',
          requirements: ['Try again later'],
          jobType: 'Notice'
        }]);
      }

    } catch (error) {
      console.error('Error searching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const parseJobsFromText = (text: string): JobListing[] => {
    // Simple parsing logic - in a real app, this would be more sophisticated
    const jobSections = text.split(/\n\n|\d+\.|•/).filter(section => 
      section.trim().length > 50 && 
      (section.toLowerCase().includes('job') || 
       section.toLowerCase().includes('position') || 
       section.toLowerCase().includes('role'))
    );

    return jobSections.slice(0, 10).map((section, index) => ({
      title: `Job Opportunity ${index + 1}`,
      company: 'Various Companies',
      location: 'Multiple Locations',
      description: section.trim(),
      requirements: ['See description for details'],
      jobType: 'Various'
    }));
  };

  const getAIRecommendations = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const userProfile = `
        User Profile:
        - Name: ${profile.full_name || 'User'}
        - Bio: ${profile.bio || 'No bio provided'}
        - Skills: ${profile.skills || 'No skills listed'}
        - Experience: ${profile.experience_level || 'Not specified'}
        - Location: ${profile.location || 'Not specified'}
      `;

      const prompt = `Based on this user profile: ${userProfile}
      
      Please provide personalized job recommendations and career advice. Include:
      1. Recommended job titles and roles
      2. Skills to develop or highlight
      3. Industry sectors to consider
      4. Tips for job searching
      5. Suggested keywords for job searches
      
      Make the recommendations specific and actionable.`;

      const response = await getResponseWithGoogleSearch(prompt);
      setAiRecommendations(response.text);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      setAiRecommendations('Sorry, unable to generate recommendations at this time.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      getAIRecommendations();
    }
  }, [profile]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchJobs(searchQuery, false);
    }
  };

  const handleFilteredSearch = () => {
    if (filters.jobTitle.trim()) {
      searchJobs(filters.jobTitle, true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-teal-400 mb-4">AI Job Finder</h1>
        <p className="text-slate-300 text-lg">
          Discover your next career opportunity with AI-powered job search and personalized recommendations
        </p>
      </div>

      {/* Quick Search */}
      <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for jobs (e.g., 'software engineer', 'marketing manager')"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Jobs'}
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-colors"
          >
            Filters
          </button>
        </form>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 p-4 bg-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Job Title</label>
                <input
                  type="text"
                  value={filters.jobTitle}
                  onChange={(e) => setFilters({...filters, jobTitle: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-slate-100"
                  placeholder="e.g., Software Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-slate-100"
                  placeholder="e.g., New York, NY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Experience Level</label>
                <select
                  value={filters.experienceLevel}
                  onChange={(e) => setFilters({...filters, experienceLevel: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-slate-100"
                >
                  <option value="any">Any Level</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Job Type</label>
                <select
                  value={filters.jobType}
                  onChange={(e) => setFilters({...filters, jobType: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-slate-100"
                >
                  <option value="any">Any Type</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Salary Range</label>
                <select
                  value={filters.salaryRange}
                  onChange={(e) => setFilters({...filters, salaryRange: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-slate-100"
                >
                  <option value="any">Any Salary</option>
                  <option value="30k-50k">$30k - $50k</option>
                  <option value="50k-75k">$50k - $75k</option>
                  <option value="75k-100k">$75k - $100k</option>
                  <option value="100k+">$100k+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Skills</label>
                <input
                  type="text"
                  value={filters.skills}
                  onChange={(e) => setFilters({...filters, skills: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-slate-100"
                  placeholder="e.g., JavaScript, Python"
                />
              </div>
            </div>
            <button
              onClick={handleFilteredSearch}
              disabled={loading || !filters.jobTitle}
              className="mt-4 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Apply Filters & Search
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Recommendations */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-teal-400 mb-4">AI Career Recommendations</h2>
            {loading && !aiRecommendations ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Generating recommendations...</p>
              </div>
            ) : aiRecommendations ? (
              <div className="prose prose-slate prose-invert max-w-none">
                <div className="text-slate-300 whitespace-pre-line leading-relaxed">
                  {aiRecommendations}
                </div>
              </div>
            ) : (
              <p className="text-slate-400">Complete your profile to get personalized recommendations.</p>
            )}
            <button
              onClick={getAIRecommendations}
              disabled={loading}
              className="mt-4 w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Refresh Recommendations'}
            </button>
          </div>
        </div>

        {/* Job Listings */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-teal-400 mb-6">Job Listings</h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Searching for jobs...</p>
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-6">
                {jobs.map((job, index) => (
                  <div key={index} className="bg-slate-700 rounded-lg p-6 hover:bg-slate-650 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-100 mb-2">{job.title}</h3>
                        <p className="text-teal-400 font-medium">{job.company}</p>
                        <p className="text-slate-400">{job.location}</p>
                      </div>
                      {job.salary && (
                        <div className="text-right">
                          <p className="text-green-400 font-semibold">{job.salary}</p>
                          {job.jobType && <p className="text-slate-400 text-sm">{job.jobType}</p>}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-slate-300 mb-4 line-clamp-3">{job.description}</p>
                    
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-slate-300 mb-2">Requirements:</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.slice(0, 5).map((req, reqIndex) => (
                            <span key={reqIndex} className="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded">
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      {job.postedDate && (
                        <p className="text-slate-500 text-sm">Posted: {job.postedDate}</p>
                      )}
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded transition-colors"
                        >
                          Apply Now
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">Start Your Job Search</h3>
                <p className="text-slate-400 mb-6">
                  Use the search bar above to find job opportunities or get AI-powered recommendations based on your profile.
                </p>
                <button
                  onClick={() => searchJobs('popular jobs')}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
                >
                  Browse Popular Jobs
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobFinderPage;
