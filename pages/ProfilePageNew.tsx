import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { UserProfile, EducationEntry } from '../services/userProfileService'
import DatabaseSetup from '../components/DatabaseSetup'

const defaultAvatar = "https://api.dicebear.com/7.x/initials/svg?seed=Guest&backgroundColor=00897b,00acc1,26a69a,26c6da,4db6ac,80cbc4,a7ffeb,c0fff3&backgroundType=gradientLinear&radius=50&fontFamily=Arial"

const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile, loading, profileLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showDatabaseSetup, setShowDatabaseSetup] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    skills: [] as string[],
    location: [0, 0] as [number, number],
    education: [] as EducationEntry[]
  })
  const [skillsInput, setSkillsInput] = useState('')
  const [newEducation, setNewEducation] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startYear: '',
    endYear: ''
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        location: profile.location || [0, 0],
        education: profile.education || []
      })
      setSkillsInput(profile.skills?.join(', ') || '')
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const skillsArray = skillsInput
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill)

    const updates = {
      full_name: formData.full_name,
      bio: formData.bio,
      skills: skillsArray,
      location: formData.location,
      education: formData.education
    }

    const result = await updateProfile(updates)
    if (result) {
      setIsEditing(false)
    }
  }

  const addEducation = () => {
    if (newEducation.institution && newEducation.degree) {
      const educationEntry: EducationEntry = {
        ...newEducation,
        id: Date.now().toString()
      }
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, educationEntry]
      }))
      setNewEducation({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startYear: '',
        endYear: ''
      })
    }
  }

  const removeEducation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }))
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: [position.coords.latitude, position.coords.longitude]
        }))
        alert('Location updated successfully!')
      },
      (error) => {
        console.error('Geolocation error:', error)
        let message = 'Error getting location: '

        switch(error.code) {
          case error.PERMISSION_DENIED:
            message += 'Location access denied by user. Please enable location permissions.'
            break
          case error.POSITION_UNAVAILABLE:
            message += 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            message += 'Location request timed out.'
            break
          default:
            message += 'An unknown error occurred.'
        }

        alert(message)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Please log in to view your profile.</p>
      </div>
    )
  }

  // Display mode
  if (!isEditing && profile) {
    return (
      <div className="space-y-8 animate-fadeIn p-4 md:p-0">
        <div className="bg-slate-800 shadow-2xl rounded-xl p-6 md:p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          
          <div className="relative z-10">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-5 rounded-md transition-colors duration-200 text-sm flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                <span>Edit Profile</span>
              </button>
            </div>
            
            <div className="flex flex-col items-center md:flex-row md:items-start">
              <div className="w-32 h-32 mb-6 md:mb-0 md:mr-10">
                <img
                  src={profile.avatar_url || defaultAvatar}
                  alt={profile.full_name || 'User'}
                  className="w-full h-full rounded-full border-4 border-teal-500 shadow-teal-500/30 object-cover"
                />
              </div>
              
              <div className="text-center md:text-left flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-teal-400 mb-3">
                  {profile.full_name || 'Unnamed User'}
                </h1>
                <p className="text-slate-400 text-sm mb-2">{user.email}</p>
                <p className="text-slate-300 text-md md:text-lg mb-6 leading-relaxed max-w-2xl whitespace-pre-wrap">
                  {profile.bio || 'No bio added yet.'}
                </p>
                {profile.location && profile.location[0] !== 0 && profile.location[1] !== 0 && (
                  <div className="text-sm text-slate-400">
                    <p><strong>Location:</strong> Lat: {profile.location[0]}, Lon: {profile.location[1]}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-slate-800 shadow-xl rounded-xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-teal-500 mb-5 border-b-2 border-slate-700 pb-3">
            Skills
          </h2>
          {profile.skills && profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-default shadow-md hover:shadow-lg"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No skills listed. Add some by editing your profile!</p>
          )}
        </div>

        {/* Education Section */}
        {profile.education && profile.education.length > 0 && (
          <div className="bg-slate-800 shadow-xl rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-teal-500 mb-5 border-b-2 border-slate-700 pb-3">
              Education
            </h2>
            <div className="space-y-4">
              {profile.education.map((edu) => (
                <div key={edu.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <h3 className="text-lg font-semibold text-teal-300">{edu.institution}</h3>
                  <p className="text-slate-200">{edu.degree} in {edu.fieldOfStudy}</p>
                  <p className="text-sm text-slate-400">{edu.startYear} - {edu.endYear}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Edit mode
  return (
    <div className="space-y-8 animate-fadeIn p-4 md:p-0">
      <form onSubmit={handleSubmit} className="bg-slate-800 shadow-2xl rounded-xl p-6 md:p-10">
        <h2 className="text-3xl font-bold text-teal-400 mb-8 text-center">
          {profile ? 'Edit Profile' : 'Create Your Profile'}
        </h2>
  console.log(user, profile, updateProfile, loading, profileLoading);
  
        {/* Basic Info */}
        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows={4}
              className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Skills (comma-separated)</label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="React, JavaScript, Python, etc."
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
            <div className="flex space-x-4">
              <input
                type="number"
                step="any"
                value={formData.location[0]}
                onChange={(e) => setFormData({...formData, location: [parseFloat(e.target.value) || 0, formData.location[1]]})}
                className="flex-1 bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Latitude"
              />
              <input
                type="number"
                step="any"
                value={formData.location[1]}
                onChange={(e) => setFormData({...formData, location: [formData.location[0], parseFloat(e.target.value) || 0]})}
                className="flex-1 bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Longitude"
              />
              <button
                type="button"
                onClick={getLocation}
                className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-3 rounded-md transition-colors"
              >
                Get Current
              </button>
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="border-t border-slate-700 pt-8 mb-8">
          <h3 className="text-xl font-semibold text-teal-500 mb-4">Education</h3>
          
          {/* Existing Education */}
          {formData.education.map((edu) => (
            <div key={edu.id} className="bg-slate-700/50 p-4 rounded-md mb-3 border border-slate-600 flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-200">{edu.institution}</p>
                <p className="text-sm text-slate-300">{edu.degree} in {edu.fieldOfStudy}</p>
                <p className="text-xs text-slate-400">{edu.startYear} - {edu.endYear}</p>
              </div>
              <button
                type="button"
                onClick={() => removeEducation(edu.id)}
                className="text-red-400 hover:text-red-300 px-3 py-1 rounded-md transition-colors"
              >
                Remove
              </button>
            </div>
          ))}

          {/* Add New Education */}
          <div className="bg-slate-700/30 p-4 rounded-md border border-slate-600 border-dashed">
            <h4 className="text-lg font-medium text-slate-200 mb-3">Add Education</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Institution"
                value={newEducation.institution}
                onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                className="bg-slate-600 border border-slate-500 text-slate-100 rounded-md p-2 focus:ring-1 focus:ring-teal-500"
              />
              <input
                type="text"
                placeholder="Degree"
                value={newEducation.degree}
                onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                className="bg-slate-600 border border-slate-500 text-slate-100 rounded-md p-2 focus:ring-1 focus:ring-teal-500"
              />
              <input
                type="text"
                placeholder="Field of Study"
                value={newEducation.fieldOfStudy}
                onChange={(e) => setNewEducation({...newEducation, fieldOfStudy: e.target.value})}
                className="bg-slate-600 border border-slate-500 text-slate-100 rounded-md p-2 focus:ring-1 focus:ring-teal-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Start Year"
                  value={newEducation.startYear}
                  onChange={(e) => setNewEducation({...newEducation, startYear: e.target.value})}
                  className="bg-slate-600 border border-slate-500 text-slate-100 rounded-md p-2 focus:ring-1 focus:ring-teal-500"
                />
                <input
                  type="text"
                  placeholder="End Year"
                  value={newEducation.endYear}
                  onChange={(e) => setNewEducation({...newEducation, endYear: e.target.value})}
                  className="bg-slate-600 border border-slate-500 text-slate-100 rounded-md p-2 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addEducation}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md transition-colors"
            >
              Add Education
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-8 border-t border-slate-700">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="bg-slate-600 hover:bg-slate-500 text-slate-100 font-medium py-3 px-6 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-md transition-colors shadow-md"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfilePage
