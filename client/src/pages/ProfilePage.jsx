
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user, apiCall } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: [],
    experience: '',
    education: '',
    linkedIn: '',
    portfolio: '',
    // Enhanced fields
    currentCompany: '',
    expectedSalary: '',
    noticePeriod: '',
    workAuthorization: '',
    availability: '',
    totalExperience: '',
    relevantExperience: '',
    degree: '',
    university: '',
    graduationYear: '',
    gpa: '',
    abcId: '',
    certifications: [],
    languages: [],
    preferredLocation: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/job-seeker/profile');
      
      if (response.ok) {
        const data = await response.json();
        const profile = data.data;
        
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phone: profile.profile?.phone || '',
          location: profile.profile?.location || '',
          bio: profile.profile?.bio || '',
          skills: profile.profile?.skills || [],
          experience: profile.profile?.experience || '',
          education: profile.profile?.education || '',
          linkedIn: profile.profile?.linkedIn || '',
          portfolio: profile.profile?.portfolio || '',
          // Enhanced fields
          currentCompany: profile.profile?.currentCompany || '',
          expectedSalary: profile.profile?.expectedSalary || '',
          noticePeriod: profile.profile?.noticePeriod || '',
          workAuthorization: profile.profile?.workAuthorization || '',
          availability: profile.profile?.availability || '',
          totalExperience: profile.profile?.totalExperience || '',
          relevantExperience: profile.profile?.relevantExperience || '',
          degree: profile.profile?.degree || '',
          university: profile.profile?.university || '',
          graduationYear: profile.profile?.graduationYear || '',
          gpa: profile.profile?.gpa || '',
          abcId: profile.profile?.abcId || '',
          certifications: profile.profile?.certifications || [],
          languages: profile.profile?.languages || [],
          preferredLocation: profile.profile?.preferredLocation || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ text: 'Failed to load profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await apiCall('/api/job-seeker/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } else {
        const error = await response.json();
        setMessage({ text: error.error || 'Failed to update profile', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (skillsText) => {
    const skillsArray = skillsText.split(',').map(skill => skill.trim()).filter(skill => skill);
    setFormData(prev => ({ ...prev, skills: skillsArray }));
  };

  const handleCertificationsChange = (certsText) => {
    const certsArray = certsText.split(',').map(cert => cert.trim()).filter(cert => cert);
    setFormData(prev => ({ ...prev, certifications: certsArray }));
  };

  const handleLanguagesChange = (languagesText) => {
    const languagesArray = languagesText.split(',').map(lang => lang.trim()).filter(lang => lang);
    setFormData(prev => ({ ...prev, languages: languagesArray }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-red-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            👤 My Profile
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-light">
            Keep your profile updated to attract better opportunities
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {message.text}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-2 border border-white/20">
            {[
              { key: 'personal', label: '👤 Personal', icon: '👤' },
              { key: 'professional', label: '💼 Professional', icon: '💼' },
              { key: 'academic', label: '🎓 Academic', icon: '🎓' },
              { key: 'additional', label: '📋 Additional', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeSection === tab.key
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          
          {/* Personal Information */}
          {activeSection === 'personal' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">👤 Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-gray-400 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="City, State/Country"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">LinkedIn Profile</label>
                  <input
                    type="url"
                    name="linkedIn"
                    value={formData.linkedIn}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Portfolio Website</label>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Professional Information */}
          {activeSection === 'professional' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">💼 Professional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Current Company</label>
                  <input
                    type="text"
                    name="currentCompany"
                    value={formData.currentCompany}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="Current employer"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Total Experience</label>
                  <input
                    type="text"
                    name="totalExperience"
                    value={formData.totalExperience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="e.g., 5 years"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Relevant Experience</label>
                  <input
                    type="text"
                    name="relevantExperience"
                    value={formData.relevantExperience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="e.g., 3 years"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Notice Period</label>
                  <select
                    name="noticePeriod"
                    value={formData.noticePeriod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="">Select notice period</option>
                    <option value="Immediate">Immediate</option>
                    <option value="2 weeks">2 weeks</option>
                    <option value="1 month">1 month</option>
                    <option value="2 months">2 months</option>
                    <option value="3 months">3 months</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Expected Salary</label>
                  <input
                    type="text"
                    name="expectedSalary"
                    value={formData.expectedSalary}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="e.g., $80k - $100k"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Work Authorization</label>
                  <select
                    name="workAuthorization"
                    value={formData.workAuthorization}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="">Select work authorization</option>
                    <option value="US Citizen">US Citizen</option>
                    <option value="Green Card">Green Card</option>
                    <option value="H1B Visa">H1B Visa</option>
                    <option value="F1 Visa">F1 Visa</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Skills</label>
                <input
                  type="text"
                  value={formData.skills.join(', ')}
                  onChange={(e) => handleSkillsChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  placeholder="JavaScript, React, Node.js, Python (comma-separated)"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Certifications</label>
                <input
                  type="text"
                  value={formData.certifications.join(', ')}
                  onChange={(e) => handleCertificationsChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  placeholder="AWS Certified Developer, Google Cloud Professional (comma-separated)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Availability</label>
                  <input
                    type="text"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="e.g., Available immediately"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Preferred Location</label>
                  <input
                    type="text"
                    name="preferredLocation"
                    value={formData.preferredLocation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="Preferred work location"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Academic Information */}
          {activeSection === 'academic' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">🎓 Academic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Degree</label>
                  <input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="e.g., Bachelor of Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">University</label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="University name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Graduation Year</label>
                  <input
                    type="number"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="e.g., 2022"
                    min="1990"
                    max="2030"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">GPA</label>
                  <input
                    type="text"
                    name="gpa"
                    value={formData.gpa}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="e.g., 3.8 or 8.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">ABC ID (Academic Bank of Credits)</label>
                <input
                  type="text"
                  name="abcId"
                  value={formData.abcId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  placeholder="Enter ABC ID if applicable"
                />
                <p className="text-sm text-gray-500 mt-2">ABC ID is applicable for Indian students pursuing higher education</p>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Education Details</label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  placeholder="Additional education details, courses, etc."
                />
              </div>
            </div>
          )}

          {/* Additional Information */}
          {activeSection === 'additional' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">📋 Additional Information</h3>
              
              <div>
                <label className="block text-gray-300 font-medium mb-2">Languages</label>
                <input
                  type="text"
                  value={formData.languages.join(', ')}
                  onChange={(e) => handleLanguagesChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  placeholder="English, Spanish, French (comma-separated)"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Professional Experience</label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  placeholder="Describe your professional experience, key projects, and achievements..."
                />
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={saving}
              className={`px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                saving ? 'animate-pulse' : ''
              }`}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
