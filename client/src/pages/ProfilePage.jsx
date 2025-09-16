
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user, apiCall } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    location: user?.profile?.location || '',
    bio: user?.profile?.bio || '',
    skills: user?.profile?.skills?.join(', ') || '',
    experience: user?.profile?.experience || '',
    education: user?.profile?.education || '',
    linkedIn: user?.profile?.linkedIn || '',
    portfolio: user?.profile?.portfolio || '',
    resume: user?.profile?.resume || null
  });

  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    if (user?.profile) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.profile.phone || '',
        location: user.profile.location || '',
        bio: user.profile.bio || '',
        skills: user.profile.skills?.join(', ') || '',
        experience: user.profile.experience || '',
        education: user.profile.education || '',
        linkedIn: user.profile.linkedIn || '',
        portfolio: user.profile.portfolio || '',
        resume: user.profile.resume || null
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setMessage({ type: 'error', text: 'Please upload a PDF file only.' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB.' });
        return;
      }
      setResumeFile(file);
      setMessage({ type: '', text: '' });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      
      // Add profile data
      const profileUpdate = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        profile: {
          phone: profileData.phone,
          location: profileData.location,
          bio: profileData.bio,
          skills: profileData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
          experience: profileData.experience,
          education: profileData.education,
          linkedIn: profileData.linkedIn,
          portfolio: profileData.portfolio
        }
      };

      formData.append('profileData', JSON.stringify(profileUpdate));
      
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      const response = await apiCall('/api/auth/profile', {
        method: 'PUT',
        body: formData,
        headers: {} // Remove Content-Type to let browser set it for FormData
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        setResumeFile(null);
        
        // Update profile data with response
        if (data.data?.user) {
          setProfileData({
            firstName: data.data.user.firstName,
            lastName: data.data.user.lastName,
            email: data.data.user.email,
            phone: data.data.user.profile?.phone || '',
            location: data.data.user.profile?.location || '',
            bio: data.data.user.profile?.bio || '',
            skills: data.data.user.profile?.skills?.join(', ') || '',
            experience: data.data.user.profile?.experience || '',
            education: data.data.user.profile?.education || '',
            linkedIn: data.data.user.profile?.linkedIn || '',
            portfolio: data.data.user.profile?.portfolio || '',
            resume: data.data.user.profile?.resume || null
          });
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.profile?.phone || '',
      location: user?.profile?.location || '',
      bio: user?.profile?.bio || '',
      skills: user?.profile?.skills?.join(', ') || '',
      experience: user?.profile?.experience || '',
      education: user?.profile?.education || '',
      linkedIn: user?.profile?.linkedIn || '',
      portfolio: user?.profile?.portfolio || '',
      resume: user?.profile?.resume || null
    });
    setResumeFile(null);
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const getCompletionPercentage = () => {
    const fields = [
      profileData.firstName,
      profileData.lastName,
      profileData.email,
      profileData.phone,
      profileData.location,
      profileData.bio,
      profileData.skills,
      profileData.experience,
      profileData.education,
      profileData.resume?.fileName
    ];
    
    const completedFields = fields.filter(field => field && field.trim()).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-red-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-green-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            👤 My Profile
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light">
            Complete your profile to unlock better job matches and opportunities
          </p>
        </div>

        {/* Profile Completion */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Profile Completion</h3>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              {getCompletionPercentage()}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-cyan-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            {getCompletionPercentage() === 100 
              ? '🎉 Perfect! Your profile is complete' 
              : 'Complete your profile to improve job matching accuracy'
            }
          </p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`p-4 rounded-xl mb-6 ${
            message.type === 'success' 
              ? 'bg-green-500/20 border border-green-500/50 text-green-300' 
              : 'bg-red-500/20 border border-red-500/50 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">👤 Personal Information</h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  disabled
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="+1 (555) 123-4567"
                  className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-300 font-medium mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="City, State, Country"
                  className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">💼 Professional Information</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Professional Bio *</label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell us about yourself, your experience, and career goals..."
                  className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed resize-y"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Skills *</label>
                <input
                  type="text"
                  name="skills"
                  value={profileData.skills}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="JavaScript, React, Node.js, Python, SQL..."
                  className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Work Experience *</label>
                <textarea
                  name="experience"
                  value={profileData.experience}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Describe your work experience, previous roles, and achievements..."
                  className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed resize-y"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Education *</label>
                <textarea
                  name="education"
                  value={profileData.education}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Your educational background, degrees, certifications..."
                  className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed resize-y"
                />
              </div>
            </div>
          </div>

          {/* Links & Documents */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">🔗 Links & Documents</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">LinkedIn Profile</label>
                <input
                  type="url"
                  name="linkedIn"
                  value={profileData.linkedIn}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Portfolio Website</label>
                <input
                  type="url"
                  name="portfolio"
                  value={profileData.portfolio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="https://yourportfolio.com"
                  className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">Resume *</label>
                {profileData.resume?.fileName && (
                  <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">📄</span>
                        <div>
                          <p className="text-green-300 font-medium">{profileData.resume.fileName}</p>
                          <p className="text-green-400 text-sm">
                            Uploaded: {profileData.resume.uploadDate ? new Date(profileData.resume.uploadDate).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                      {profileData.resume.fileUrl && (
                        <a
                          href={profileData.resume.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-300 hover:text-green-200 underline"
                        >
                          View
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                {isEditing && (
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
                  />
                )}
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">Upload PDF only. Max size: 5MB</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
                <span>{loading ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          )}
        </form>
      </div>

      <Footer />
    </div>
  );
}
