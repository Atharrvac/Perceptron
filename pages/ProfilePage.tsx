import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import AvatarDisplay from "../components/AvatarDisplay";
import { useUser } from "../contexts/UserContext";
import { UserProfile, EducationEntry } from "../types";

const defaultAvatar =
  "https://api.dicebear.com/7.x/initials/svg?seed=Guest&backgroundColor=00897b,00acc1,26a69a,26c6da,4db6ac,80cbc4,a7ffeb,c0fff3&backgroundType=gradientLinear&radius=50&fontFamily=Arial";

interface FormData {
  name: string;
  bio: string;
  skillsString: string;
  latitude: string;
  longitude: string;
  education: EducationEntry[];
}

const initialNewEducationEntry: Omit<EducationEntry, "id"> = {
  institution: "",
  degree: "",
  fieldOfStudy: "",
  startYear: "",
  endYear: "",
};

const ProfilePage: React.FC = () => {
  const { currentUser, setCurrentUser } = useUser();

  const [isEditing, setIsEditing] = useState(!currentUser);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    bio: "",
    skillsString: "",
    latitude: "",
    longitude: "",
    education: [],
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [newEducationEntry, setNewEducationEntry] = useState(
    initialNewEducationEntry
  );

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        bio: currentUser.bio,
        skillsString: currentUser.skills.join(", "),
        latitude: currentUser.location[0]?.toString() || "",
        longitude: currentUser.location[1]?.toString() || "",
        education: currentUser.education || [],
      });
      setAvatarPreview(currentUser.avatarUrl);
      setIsEditing(false);
    } else {
      setIsEditing(true);
      setFormData({
        name: "",
        bio: "",
        skillsString: "",
        latitude: "",
        longitude: "",
        education: [],
      });
      setAvatarPreview(defaultAvatar);
    }
  }, [currentUser]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewEducationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEducationEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEducation = () => {
    if (newEducationEntry.institution && newEducationEntry.degree) {
      setFormData((prev) => ({
        ...prev,
        education: [
          ...prev.education,
          { ...newEducationEntry, id: Date.now().toString() },
        ],
      }));
      setNewEducationEntry(initialNewEducationEntry);
    } else {
      alert(
        "Please fill in at least Institution and Degree for education entry."
      );
    }
  };

  const handleRemoveEducation = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
          alert("Location fetched successfully!");
        },
        (error) => {
          console.error("Error fetching location: ", error);
          alert(
            `Error fetching location: ${error.message}. Please ensure location services are enabled and permission is granted.`
          );
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const skillsArray = formData.skillsString
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill);
    const lat = parseFloat(formData.latitude);
    const lon = parseFloat(formData.longitude);

    const newProfileData: UserProfile = {
      id: currentUser?.id || Date.now().toString(),
      name: formData.name,
      bio: formData.bio,
      skills: skillsArray,
      avatarUrl: avatarPreview || defaultAvatar,
      location: [isNaN(lat) ? 0 : lat, isNaN(lon) ? 0 : lon],
      education: formData.education,
    };
    setCurrentUser(newProfileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        bio: currentUser.bio,
        skillsString: currentUser.skills.join(", "),
        latitude: currentUser.location[0]?.toString() || "",
        longitude: currentUser.location[1]?.toString() || "",
        education: currentUser.education || [],
      });
      setAvatarPreview(currentUser.avatarUrl);
      setIsEditing(false);
    } else {
      setFormData({
        name: "",
        bio: "",
        skillsString: "",
        latitude: "",
        longitude: "",
        education: [],
      });
      setAvatarPreview(defaultAvatar);
    }
  };

  // Handle GLB file upload
  const handleGlbUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const iframe = document.getElementById(
          "glb-viewer"
        ) as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          try {
            iframe.contentWindow.postMessage(
              {
                type: "SET_GLB",
                arrayBuffer: event.target?.result,
              },
              "https://glb.ee"
            );
          } catch (error) {
            console.error("Error loading GLB file:", error);
            alert("Error loading 3D model. Please try a different file.");
          }
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Handle fullscreen for GLB viewer
  const handleFullscreen = () => {
    const iframe = document.getElementById("glb-viewer") as HTMLIFrameElement;
    if (iframe) {
      try {
        if (iframe.requestFullscreen) {
          iframe.requestFullscreen();
        } else if ((iframe as any).webkitRequestFullscreen) {
          (iframe as any).webkitRequestFullscreen();
        } else if ((iframe as any).msRequestFullscreen) {
          (iframe as any).msRequestFullscreen();
        }
      } catch (error) {
        console.error("Fullscreen not supported:", error);
      }
    }
  };

  if (!currentUser && !isEditing) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-xl text-slate-400 mb-6">
          Create your profile to get started!
        </p>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
        >
          Create Profile
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-8 animate-fadeIn p-2 md:p-0">
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800 shadow-2xl rounded-xl p-6 md:p-10"
        >
          <h2 className="text-3xl font-bold text-teal-400 mb-8 text-center">
            {currentUser ? "Edit Profile" : "Create Your Profile"}
          </h2>

          <div className="flex flex-col items-center mb-8">
            <AvatarDisplay
              src={avatarPreview || defaultAvatar}
              alt="Avatar Preview"
              size="large"
              className="mb-4 border-4 border-teal-500 shadow-teal-500/30"
            />
            <label
              htmlFor="avatarUpload"
              className="cursor-pointer bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Change Avatar
            </label>
            <input
              type="file"
              id="avatarUpload"
              name="avatarUrl"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Personal Info */}
          <h3 className="text-xl font-semibold text-teal-500 mb-3 border-b border-slate-700 pb-2">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label
                htmlFor="skillsString"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Skills (comma-separated)
              </label>
              <input
                type="text"
                name="skillsString"
                id="skillsString"
                value={formData.skillsString}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
          <div className="mb-6">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Bio
            </label>
            <textarea
              name="bio"
              id="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 custom-scrollbar"
            ></textarea>
          </div>

          {/* Location */}
          <h3 className="text-xl font-semibold text-teal-500 mb-3 mt-8 border-t border-slate-700 pt-6">
            Location
          </h3>
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            className="mb-4 bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center space-x-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
            <span>Use My Current Location</span>
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label
                htmlFor="latitude"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Latitude
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                id="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label
                htmlFor="longitude"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Longitude
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                id="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Education Section */}
          <h3 className="text-xl font-semibold text-teal-500 mb-4 mt-8 border-t border-slate-700 pt-6">
            Education
          </h3>
          {formData.education.map((edu, index) => (
            <div
              key={edu.id}
              className="bg-slate-700 p-4 rounded-md mb-3 border border-slate-600"
            >
              <p className="font-semibold text-slate-200">{edu.institution}</p>
              <p className="text-sm text-slate-300">
                {edu.degree} in {edu.fieldOfStudy}
              </p>
              <p className="text-xs text-slate-400">
                {edu.startYear} - {edu.endYear}
              </p>
              <button
                type="button"
                onClick={() => handleRemoveEducation(edu.id)}
                className="mt-2 text-xs bg-red-600 hover:bg-red-500 text-white py-1 px-3 rounded-md transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600 border-dashed mt-4">
            <h4 className="text-lg font-medium text-slate-200 mb-3">
              Add New Education
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <input
                type="text"
                name="institution"
                placeholder="Institution Name"
                value={newEducationEntry.institution}
                onChange={handleNewEducationChange}
                className="w-full bg-slate-600 border border-slate-500 text-slate-100 rounded-md p-2.5 focus:ring-1 focus:ring-teal-500"
              />
              <input
                type="text"
                name="degree"
                placeholder="Degree/Certificate"
                value={newEducationEntry.degree}
                onChange={handleNewEducationChange}
                className="w-full bg-slate-600 border border-slate-500 text-slate-100 rounded-md p-2.5 focus:ring-1 focus:ring-teal-500"
              />
              <input
                type="text"
                name="fieldOfStudy"
                placeholder="Field of Study"
                value={newEducationEntry.fieldOfStudy}
                onChange={handleNewEducationChange}
                className="w-full bg-slate-600 border border-slate-500 text-slate-100 rounded-md p-2.5 focus:ring-1 focus:ring-teal-500"
              />
              <input
                type="text"
                name="startYear"
                placeholder="Start Year"
                value={newEducationEntry.startYear}
                onChange={handleNewEducationChange}
                className="w-full bg-slate-600 border border-slate-500 text-slate-100 rounded-md p-2.5 focus:ring-1 focus:ring-teal-500"
              />
              <input
                type="text"
                name="endYear"
                placeholder="End Year or 'Present'"
                value={newEducationEntry.endYear}
                onChange={handleNewEducationChange}
                className="w-full bg-slate-600 border border-slate-500 text-slate-100 rounded-md p-2.5 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <button
              type="button"
              onClick={handleAddEducation}
              className="mt-4 bg-green-600 hover:bg-green-500 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Add Education Entry
            </button>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-8 mt-8 border-t border-slate-700">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-slate-600 hover:bg-slate-500 text-slate-100 font-medium py-2.5 px-6 rounded-md transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2.5 px-6 rounded-md transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              {currentUser ? "Save Changes" : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center p-8 text-slate-400">
        Loading profile or create one...
      </div>
    );
  }

  // Display mode
  return (
    <div className="space-y-8 animate-fadeIn p-2 md:p-0">
      <div className="bg-slate-800 shadow-2xl rounded-xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

        <div className="relative z-10">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-5 rounded-md transition-colors duration-200 text-sm flex items-center space-x-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
              <span>Edit Profile</span>
            </button>
          </div>
          <div className="flex flex-col items-center md:flex-row md:items-start">
            <AvatarDisplay
              src={currentUser.avatarUrl || defaultAvatar}
              alt={currentUser.name}
              size="large"
              className="mb-6 md:mb-0 md:mr-10 border-4 border-teal-500 shadow-teal-500/30"
            />
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-teal-400 mb-3">
                {currentUser.name}
              </h1>
              <p className="text-slate-300 text-md md:text-lg mb-6 leading-relaxed max-w-2xl whitespace-pre-wrap">
                {currentUser.bio}
              </p>
              <div className="text-sm text-slate-400">
                <p>
                  <strong>Location:</strong> Lat: {currentUser.location[0]},
                  Lon: {currentUser.location[1]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 shadow-xl rounded-xl p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-teal-500 mb-5 border-b-2 border-slate-700 pb-3">
          Skills
        </h2>
        {currentUser.skills.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {currentUser.skills.map((skill) => (
              <span
                key={skill}
                className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-default shadow-md hover:shadow-lg"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">
            No skills listed. Add some by editing your profile!
          </p>
        )}
      </div>

      {currentUser.education && currentUser.education.length > 0 && (
        <div className="bg-slate-800 shadow-xl rounded-xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-teal-500 mb-5 border-b-2 border-slate-700 pb-3">
            Education
          </h2>
          <div className="space-y-4">
            {currentUser.education.map((edu) => (
              <div
                key={edu.id}
                className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
              >
                <h3 className="text-lg font-semibold text-teal-300">
                  {edu.institution}
                </h3>
                <p className="text-slate-200">
                  {edu.degree} in {edu.fieldOfStudy}
                </p>
                <p className="text-sm text-slate-400">
                  {edu.startYear} - {edu.endYear}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-800 shadow-xl rounded-xl p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-teal-500 mb-5 border-b-2 border-slate-700 pb-3">
          3D Avatar
        </h2>
        <p className="text-slate-400 mb-6">
          Upload and view your 3D avatar in GLB format. Your avatar will be
          displayed here and can be used in the platform.
        </p>

        <div className="mt-4 p-6 bg-slate-700/50 rounded-lg border border-slate-600">
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md h-64 bg-slate-800 rounded-lg mb-6 flex items-center justify-center border-2 border-dashed border-slate-600">
              <iframe
                id="glb-viewer"
                src="https://glb.ee/viewer.html"
                className="w-full h-full border-0 rounded-lg"
                title="3D Model Viewer"
                allow="fullscreen"
              ></iframe>
            </div>

            <div className="w-full max-w-md">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Upload GLB File
              </label>
              <div className="flex items-center space-x-2">
                <label className="flex-1 cursor-pointer bg-teal-600 hover:bg-teal-500 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200 text-center">
                  Choose File
                  <input
                    type="file"
                    id="glb-upload"
                    accept=".glb"
                    className="hidden"
                    onChange={handleGlbUpload}
                  />
                </label>
                <button
                  onClick={handleFullscreen}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200"
                  title="Enter fullscreen"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Supported format: .glb (GLB 3D model)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
