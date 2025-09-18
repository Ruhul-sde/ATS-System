
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
  const [completionStatus, setCompletionStatus] = useState({});
  const [universities, setUniversities] = useState([]);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [profilePictureUploading, setProfilePictureUploading] = useState(false);

  // Predefined options for dropdowns
  const skillLevels = {
    'Beginner': 'Beginner',
    'Intermediate': 'Intermediate', 
    'Advanced': 'Advanced',
    'Expert': 'Expert'
  };

  const languageProficiency = {
    'Basic': 'Basic',
    'Conversational': 'Conversational',
    'Proficient': 'Proficient',
    'Advanced': 'Advanced',
    'Native': 'Native'
  };

  const availabilityOptions = [
    'Available Immediately',
    'Available in 2 weeks',
    'Available in 1 month',
    'Available in 2 months',
    'Available in 3 months',
    'Currently not available'
  ];

  const workAuthorizationIndia = [
    'Indian Citizen',
    'Person of Indian Origin (PIO)',
    'Overseas Citizen of India (OCI)',
    'Work Permit Holder',
    'Student Visa',
    'Dependent Visa',
    'Other'
  ];

  const workPreferences = [
    'Full-time',
    'Part-time',
    'Contract',
    'Freelance',
    'Internship',
    'Remote Only',
    'Hybrid',
    'On-site Only',
    'Flexible Schedule',
    'Night Shift',
    'Weekend Work',
    'Rotational Shifts'
  ];

  const noticePeriodOptions = [
    'Serving Notice Period',
    'Immediate',
    '15 Days',
    '1 Month',
    '2 Months',
    '3 Months',
    'More than 3 Months'
  ];

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    dateOfBirth: '',
    gender: '',
    // Address Information
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    },
    // Professional Information
    bio: '',
    currentCompany: '',
    currentDesignation: '',
    totalExperience: '',
    relevantExperience: '',
    skills: [],
    expectedSalary: '',
    currentSalary: '',
    noticePeriod: '',
    workAuthorization: '',
    availability: '',
    preferredLocation: [],
    workPreferences: [],
    resume: null,
    profilePicture: null,
    // Academic Information
    education: '',
    degree: '',
    university: '',
    graduationYear: '',
    gpa: '',
    abcId: '',
    // Enhanced Information
    certifications: [],
    languages: [],
    linkedIn: '',
    portfolio: '',
    github: '',
    // Consent and Legal
    consents: {
      dataProcessing: false,
      backgroundVerification: false,
      contactConsent: false,
      thirdPartySharing: false,
      marketingCommunication: false
    }
  });

  // Indian cities for preferred location
  const indianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
    'Pune', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur',
    'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad',
    'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
    'Kochi', 'Coimbatore', 'Kozhikode', 'Thiruvananthapuram', 'Gurgaon', 'Noida'
  ];

  // Popular skills with categories
  const skillCategories = {
    'Programming Languages': [
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'TypeScript',
      'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Dart', 'Elixir', 'Haskell', 'Clojure'
    ],
    'Web Technologies': [
      'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'HTML5', 'CSS3', 'SASS', 'Bootstrap', 'Tailwind CSS',
      'Next.js', 'Nuxt.js', 'Svelte', 'jQuery', 'Redux', 'Vuex', 'GraphQL', 'REST API', 'WebRTC', 'Socket.io'
    ],
    'Databases': [
      'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQLite', 'Oracle', 'SQL Server',
      'DynamoDB', 'Cassandra', 'Neo4j', 'InfluxDB', 'CouchDB', 'Firebase', 'Supabase', 'PlanetScale'
    ],
    'Cloud & DevOps': [
      'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'Terraform',
      'Ansible', 'Puppet', 'Chef', 'Vagrant', 'Helm', 'Istio', 'Prometheus', 'Grafana', 'ELK Stack'
    ],
    'Mobile Development': [
      'React Native', 'Flutter', 'Android', 'iOS', 'Ionic', 'Xamarin',
      'Cordova', 'PhoneGap', 'NativeScript', 'Unity', 'Unreal Engine', 'ARCore', 'ARKit'
    ],
    'Data Science & Analytics': [
      'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
      'Jupyter', 'Apache Spark', 'Hadoop', 'Tableau', 'Power BI', 'D3.js', 'Matplotlib', 'Seaborn'
    ],
    'Testing & Quality': [
      'Jest', 'Cypress', 'Selenium', 'Postman', 'JUnit', 'TestNG', 'Mocha', 'Chai',
      'Puppeteer', 'Playwright', 'SonarQube', 'ESLint', 'Prettier', 'Lighthouse'
    ],
    'Design & UI/UX': [
      'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'InVision', 'Zeplin',
      'Material Design', 'Bootstrap', 'Ant Design', 'Chakra UI', 'Semantic UI'
    ],
    'Project Management': [
      'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence', 'Trello', 'Asana', 'Monday.com',
      'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Azure DevOps', 'Linear'
    ],
    'Security & Networking': [
      'OAuth', 'JWT', 'SSL/TLS', 'VPN', 'Firewall', 'Penetration Testing', 'OWASP',
      'Network Security', 'Cryptography', 'Blockchain', 'Web3', 'Ethereum', 'Solidity'
    ]
  };

  useEffect(() => {
    loadProfile();
    fetchUniversities();
  }, []);

  // Load user profile
  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/job-seeker/profile');
      
      if (response.ok) {
        const data = await response.json();
        const profile = data.data;
        
        console.log('Profile loaded:', profile);
        console.log('Profile picture:', profile.profile?.profilePicture);
        console.log('Resume:', profile.profile?.resume);
        
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phone: profile.profile?.phone || '',
          alternatePhone: profile.profile?.alternatePhone || '',
          dateOfBirth: profile.profile?.dateOfBirth ? profile.profile.dateOfBirth.split('T')[0] : '',
          gender: profile.profile?.gender || '',
          address: {
            street: profile.profile?.address?.street || '',
            city: profile.profile?.address?.city || '',
            state: profile.profile?.address?.state || '',
            postalCode: profile.profile?.address?.postalCode || '',
            country: profile.profile?.address?.country || 'India'
          },
          bio: profile.profile?.bio || '',
          currentCompany: profile.profile?.currentCompany || '',
          currentDesignation: profile.profile?.currentDesignation || '',
          totalExperience: profile.profile?.totalExperience || '',
          relevantExperience: profile.profile?.relevantExperience || '',
          skills: profile.profile?.skills || [],
          expectedSalary: profile.profile?.expectedSalary || '',
          currentSalary: profile.profile?.currentSalary || '',
          noticePeriod: profile.profile?.noticePeriod || '',
          workAuthorization: profile.profile?.workAuthorization || '',
          availability: profile.profile?.availability || '',
          preferredLocation: profile.profile?.preferredLocation || [],
          workPreferences: profile.profile?.workPreferences || [],
          resume: profile.profile?.resume || null,
          profilePicture: profile.profile?.profilePicture || null,
          education: profile.profile?.education || '',
          degree: profile.profile?.degree || '',
          university: profile.profile?.university || '',
          graduationYear: profile.profile?.graduationYear || '',
          gpa: profile.profile?.gpa || '',
          abcId: profile.profile?.abcId || '',
          certifications: profile.profile?.certifications || [],
          languages: profile.profile?.languages || [],
          linkedIn: profile.profile?.linkedIn || '',
          portfolio: profile.profile?.portfolio || '',
          github: profile.profile?.github || '',
          consents: {
            dataProcessing: profile.profile?.consents?.dataProcessing || false,
            backgroundVerification: profile.profile?.consents?.backgroundVerification || false,
            contactConsent: profile.profile?.consents?.contactConsent || false,
            thirdPartySharing: profile.profile?.consents?.thirdPartySharing || false,
            marketingCommunication: profile.profile?.consents?.marketingCommunication || false
          }
        });
        
        updateCompletionStatus(profile);
      } else {
        const error = await response.json();
        setMessage({ text: error.error || 'Failed to load profile', type: 'error' });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ text: 'Failed to load profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Indian universities
  const fetchUniversities = async () => {
    try {
      setLoadingUniversities(true);
      const response = await fetch('https://colleges-api.onrender.com/colleges');
      const data = await response.json();
      const sortedUniversities = data
        .map(college => college.name)
        .filter((name, index, array) => array.indexOf(name) === index)
        .sort();
      setUniversities(sortedUniversities);
    } catch (error) {
      console.error('Error fetching universities:', error);
      // Fallback universities list
      setUniversities([
        'Indian Institute of Technology (IIT)',
        'Indian Institute of Science (IISc)',
        'Jawaharlal Nehru University (JNU)',
        'University of Delhi',
        'Banaras Hindu University',
        'Aligarh Muslim University',
        'Anna University',
        'Jamia Millia Islamia'
      ]);
    } finally {
      setLoadingUniversities(false);
    }
  };

  // Update completion status
  const updateCompletionStatus = (profile) => {
    const status = {
      personal: checkPersonalCompletion(profile),
      professional: checkProfessionalCompletion(profile),
      academic: checkAcademicCompletion(profile),
      additional: checkAdditionalCompletion(profile),
      legal: checkLegalCompletion(profile)
    };
    setCompletionStatus(status);
  };

  const checkPersonalCompletion = (profile) => {
    const required = ['firstName', 'lastName', 'phone'];
    const addressRequired = ['street', 'city', 'state', 'postalCode'];
    
    const basicComplete = required.every(field => profile[field]);
    const addressComplete = addressRequired.every(field => profile.profile?.address?.[field]);
    const hasProfilePicture = profile.profile?.profilePicture?.fileName;
    
    return basicComplete && addressComplete && hasProfilePicture;
  };

  const checkProfessionalCompletion = (profile) => {
    const required = ['bio', 'totalExperience', 'workAuthorization', 'availability'];
    const hasRequiredFields = required.every(field => profile.profile?.[field]);
    const hasResume = profile.profile?.resume?.fileName;
    return hasRequiredFields && hasResume;
  };

  const checkAcademicCompletion = (profile) => {
    const required = ['degree', 'university', 'graduationYear'];
    return required.every(field => profile.profile?.[field]);
  };

  const checkAdditionalCompletion = (profile) => {
    return (profile.profile?.skills?.length > 0) && (profile.profile?.languages?.length > 0);
  };

  const checkLegalCompletion = (profile) => {
    const requiredConsents = ['dataProcessing', 'backgroundVerification', 'contactConsent'];
    return requiredConsents.every(consent => profile.profile?.consents?.[consent]);
  };

  // Handle form submission
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
        
        // Move to next incomplete section
        const nextSection = getNextIncompleteSection();
        if (nextSection && nextSection !== activeSection) {
          setTimeout(() => setActiveSection(nextSection), 1000);
        }
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

  const getNextIncompleteSection = () => {
    const sections = ['personal', 'professional', 'academic', 'additional', 'legal'];
    return sections.find(section => !completionStatus[section]);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (field, value, type = 'comma') => {
    if (type === 'comma') {
      const array = value.split(',').map(item => item.trim()).filter(item => item);
      setFormData(prev => ({ ...prev, [field]: array }));
    }
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const addLanguage = () => {
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, { name: '', proficiency: '' }]
    }));
  };

  const removeLanguage = (index) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const updateLanguage = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.map((lang, i) =>
        i === index ? { ...lang, [field]: value } : lang
      )
    }));
  };

  const handleConsentChange = (consent) => {
    setFormData(prev => ({
      ...prev,
      consents: {
        ...prev.consents,
        [consent]: !prev.consents[consent]
      }
    }));
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ text: 'Please upload only JPEG, PNG, or GIF images', type: 'error' });
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: 'Image size must be less than 2MB', type: 'error' });
      return;
    }

    setProfilePictureUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('profilePicture', file);

    try {
      // Use apiCall method for consistent token handling
      const response = await apiCall('/api/job-seeker/upload-profile-picture', {
        method: 'POST',
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          profilePicture: data.data.profilePicture
        }));
        setMessage({ text: 'Profile picture uploaded successfully!', type: 'success' });
        
        // Reload profile to get updated data
        setTimeout(() => {
          loadProfile();
        }, 1000);
      } else {
        const error = await response.json();
        setMessage({ text: error.error || 'Failed to upload profile picture', type: 'error' });
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      setMessage({ text: 'Failed to upload profile picture', type: 'error' });
    } finally {
      setProfilePictureUploading(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ text: 'Please upload only PDF, DOC, or DOCX files', type: 'error' });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'File size must be less than 5MB', type: 'error' });
      return;
    }

    setResumeUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('resume', file);

    try {
      // Use apiCall method for consistent token handling
      const response = await apiCall('/api/job-seeker/upload-resume', {
        method: 'POST',
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          resume: data.data.resume
        }));
        setMessage({ text: 'Resume uploaded successfully!', type: 'success' });
        
        // Reload profile to get updated data
        setTimeout(() => {
          loadProfile();
        }, 1000);
      } else {
        const error = await response.json();
        setMessage({ text: error.error || 'Failed to upload resume', type: 'error' });
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      setMessage({ text: 'Failed to upload resume', type: 'error' });
    } finally {
      setResumeUploading(false);
    }
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

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            👤 Complete Your Profile
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-light">
            Build a comprehensive profile to attract the best opportunities
          </p>
          
          {/* Progress Indicator */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-400">Profile Completion</span>
              <span className="text-sm font-medium text-gray-400">
                {Math.round((Object.values(completionStatus).filter(Boolean).length / 5) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(Object.values(completionStatus).filter(Boolean).length / 5) * 100}%` }}
              ></div>
            </div>
          </div>
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
        <div className="flex justify-center mb-8 overflow-x-auto">
          <div className="flex space-x-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-2 border border-white/20 min-w-max">
            {[
              { key: 'personal', label: 'Personal', icon: '👤' },
              { key: 'professional', label: 'Professional', icon: '💼' },
              { key: 'academic', label: 'Academic', icon: '🎓' },
              { key: 'additional', label: 'Additional', icon: '📋' },
              { key: 'legal', label: 'Legal & Consent', icon: '📜' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 relative ${
                  activeSection === tab.key
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </div>
                {completionStatus[tab.key] && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          
          {/* Personal Information */}
          {activeSection === 'personal' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">👤 Personal Information</h3>
                {completionStatus.personal && <span className="text-green-400 text-sm">✓ Complete</span>}
              </div>

              {/* Profile Picture Upload Section */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">📸 Profile Picture *</h4>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {formData.profilePicture ? (
                      <img
                        src={formData.profilePicture.fileUrl}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl">
                        👤
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="border-2 border-dashed border-gray-600 rounded-xl p-4 text-center hover:border-gray-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        className="hidden"
                        id="profile-picture-upload"
                        required={!formData.profilePicture}
                      />
                      <label htmlFor="profile-picture-upload" className="cursor-pointer block">
                        {formData.profilePicture ? (
                          <div>
                            <p className="text-green-400 font-medium mb-2">✓ Profile Picture Uploaded</p>
                            <p className="text-gray-300 text-sm">{formData.profilePicture.fileName}</p>
                            <p className="text-blue-400 text-sm mt-2 hover:text-white">
                              Click to change picture
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div className="text-3xl mb-2">📷</div>
                            <p className="text-white font-medium mb-2">Upload Profile Picture</p>
                            <p className="text-gray-400 text-sm mb-3">
                              {profilePictureUploading ? 'Uploading...' : 'Click to browse or drag and drop'}
                            </p>
                            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all">
                              <span>📎</span>
                              <span>{profilePictureUploading ? 'Uploading...' : 'Choose Image'}</span>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                      Supported formats: JPEG, PNG, GIF • Max size: 2MB
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Primary Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Alternate Phone</label>
                  <input
                    type="tel"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 focus:bg-white/15"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Address Section */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">📍 Address Information</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Street Address *</label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                      placeholder="House number, building, street name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">City *</label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                        placeholder="Enter city name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">State *</label>
                      <input
                        type="text"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                        placeholder="Enter state name"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Postal Code *</label>
                      <input
                        type="text"
                        name="address.postalCode"
                        value={formData.address.postalCode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                        placeholder="Enter PIN code"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Country</label>
                      <input
                        type="text"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleInputChange}
                        disabled
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Professional Information */}
          {activeSection === 'professional' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">💼 Professional Information</h3>
                {completionStatus.professional && <span className="text-green-400 text-sm">✓ Complete</span>}
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Professional Summary *</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                  placeholder="Write a compelling summary of your professional background, key achievements, and career aspirations..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Current Company</label>
                  <input
                    type="text"
                    name="currentCompany"
                    value={formData.currentCompany}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                    placeholder="Current employer name"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Current Designation</label>
                  <input
                    type="text"
                    name="currentDesignation"
                    value={formData.currentDesignation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                    placeholder="Current job title"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Total Experience *</label>
                  <input
                    type="text"
                    name="totalExperience"
                    value={formData.totalExperience}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                    placeholder="e.g., 5 years 3 months"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Relevant Experience</label>
                  <input
                    type="text"
                    name="relevantExperience"
                    value={formData.relevantExperience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                    placeholder="e.g., 3 years 6 months"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Current Salary (Annual)</label>
                  <input
                    type="text"
                    name="currentSalary"
                    value={formData.currentSalary}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                    placeholder="e.g., ₹12,00,000"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Expected Salary (Annual)</label>
                  <input
                    type="text"
                    name="expectedSalary"
                    value={formData.expectedSalary}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                    placeholder="e.g., ₹15,00,000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Notice Period *</label>
                  <select
                    name="noticePeriod"
                    value={formData.noticePeriod}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="">Select notice period</option>
                    {noticePeriodOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Work Authorization *</label>
                  <select
                    name="workAuthorization"
                    value={formData.workAuthorization}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="">Select work authorization</option>
                    {workAuthorizationIndia.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Availability *</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="">Select availability</option>
                    {availabilityOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Work Preferences</label>
                  <select
                    multiple
                    value={formData.workPreferences}
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData(prev => ({ 
                        ...prev, 
                        workPreferences: selectedOptions
                      }));
                    }}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 min-h-[120px]"
                  >
                    {workPreferences.map(preference => (
                      <option key={preference} value={preference}>{preference}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple preferences</p>
                  {formData.workPreferences.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-400 mb-2">Selected preferences:</p>
                      <div className="flex flex-wrap gap-1">
                        {formData.workPreferences.map((preference, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30">
                            {preference}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Preferred Work Locations</label>
                <select
                  multiple
                  value={formData.preferredLocation}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData(prev => ({ 
                      ...prev, 
                      preferredLocation: selectedOptions
                    }));
                  }}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 min-h-[160px]"
                >
                  <optgroup label="Major Cities">
                    {indianCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Location Preferences">
                    <option value="Open to Relocation">Open to Relocation</option>
                    <option value="Any Location in India">Any Location in India</option>
                    <option value="Metro Cities Only">Metro Cities Only</option>
                    <option value="Tier 2 Cities Preferred">Tier 2 Cities Preferred</option>
                  </optgroup>
                </select>
                <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple locations</p>
                {formData.preferredLocation.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-2">Selected locations:</p>
                    <div className="flex flex-wrap gap-1">
                      {formData.preferredLocation.map((location, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">
                          {location}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Resume Upload Section */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">📄 Resume Upload *</h4>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-gray-500 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                      id="resume-upload"
                      required={!formData.resume}
                    />
                    <label 
                      htmlFor="resume-upload" 
                      className="cursor-pointer block"
                    >
                      <div className="text-4xl mb-3">📄</div>
                      {formData.resume ? (
                        <div>
                          <p className="text-green-400 font-medium mb-2">✓ Resume Uploaded</p>
                          <p className="text-gray-300 text-sm">{formData.resume.fileName}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            Uploaded on {new Date(formData.resume.uploadDate).toLocaleDateString()}
                          </p>
                          <p className="text-blue-400 text-sm mt-2 hover:text-white">
                            Click to replace resume
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-white font-medium mb-2">Upload Your Resume</p>
                          <p className="text-gray-400 text-sm mb-3">
                            {resumeUploading ? 'Uploading...' : 'Click to browse or drag and drop'}
                          </p>
                          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all">
                            <span>📎</span>
                            <span>{resumeUploading ? 'Uploading...' : 'Choose File'}</span>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Supported formats: PDF, DOC, DOCX • Max size: 5MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Academic Information */}
          {activeSection === 'academic' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">🎓 Academic Information</h3>
                {completionStatus.academic && <span className="text-green-400 text-sm">✓ Complete</span>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Highest Degree *</label>
                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="">Select degree</option>
                    <option value="Bachelor of Technology (B.Tech)">Bachelor of Technology (B.Tech)</option>
                    <option value="Bachelor of Engineering (B.E.)">Bachelor of Engineering (B.E.)</option>
                    <option value="Bachelor of Computer Applications (BCA)">Bachelor of Computer Applications (BCA)</option>
                    <option value="Bachelor of Science (B.Sc)">Bachelor of Science (B.Sc)</option>
                    <option value="Master of Technology (M.Tech)">Master of Technology (M.Tech)</option>
                    <option value="Master of Computer Applications (MCA)">Master of Computer Applications (MCA)</option>
                    <option value="Master of Science (M.Sc)">Master of Science (M.Sc)</option>
                    <option value="Master of Business Administration (MBA)">Master of Business Administration (MBA)</option>
                    <option value="Doctor of Philosophy (Ph.D)">Doctor of Philosophy (Ph.D)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">University/Institution *</label>
                  <select
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                    disabled={loadingUniversities}
                  >
                    <option value="">
                      {loadingUniversities ? 'Loading universities...' : 'Select university'}
                    </option>
                    {universities.map(uni => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Graduation Year *</label>
                  <select
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="">Select year</option>
                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">GPA/Percentage</label>
                  <input
                    type="text"
                    name="gpa"
                    value={formData.gpa}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                    placeholder="e.g., 8.5 CGPA or 85%"
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                  placeholder="Enter ABC ID if applicable"
                />
                <p className="text-sm text-gray-500 mt-2">ABC ID is for students pursuing higher education in India (Optional)</p>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Additional Education Details</label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                  placeholder="Additional courses, certifications, training programs..."
                />
              </div>
            </div>
          )}

          {/* Additional Information */}
          {activeSection === 'additional' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">📋 Skills & Additional Information</h3>
                {completionStatus.additional && <span className="text-green-400 text-sm">✓ Complete</span>}
              </div>
              
              {/* Skills Section */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">🛠️ Technical Skills *</h4>
                <div className="space-y-4">
                  {Object.entries(skillCategories).map(([category, skills]) => (
                    <div key={category}>
                      <label className="block text-gray-300 font-medium mb-2">{category}</label>
                      <select
                        multiple
                        className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 min-h-[120px]"
                        value={formData.skills.filter(skill => skills.includes(skill))}
                        onChange={(e) => {
                          const selectedSkills = Array.from(e.target.selectedOptions, option => option.value);
                          const otherSkills = formData.skills.filter(skill => !skills.includes(skill));
                          setFormData(prev => ({
                            ...prev,
                            skills: [...otherSkills, ...selectedSkills]
                          }));
                        }}
                      >
                        {skills.map(skill => (
                          <option key={skill} value={skill}>{skill}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple skills</p>
                    </div>
                  ))}
                  
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Other Skills (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="Additional skills not listed above..."
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                      onBlur={(e) => {
                        if (e.target.value) {
                          const newSkills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                          setFormData(prev => ({ 
                            ...prev, 
                            skills: [...new Set([...prev.skills, ...newSkills])]
                          }));
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                  
                  {formData.skills.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-white font-medium mb-2">Selected Skills:</h5>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-lg border border-blue-500/30 flex items-center space-x-1"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  skills: prev.skills.filter(s => s !== skill)
                                }));
                              }}
                              className="text-blue-300 hover:text-white ml-1"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Languages Section */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">🗣️ Languages *</h4>
                <div className="space-y-3">
                  {formData.languages.map((lang, index) => (
                    <div key={index} className="flex space-x-4">
                      <select
                        value={lang.name || ''}
                        onChange={(e) => updateLanguage(index, 'name', e.target.value)}
                        className="flex-1 px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                      >
                        <option value="">Select Language</option>
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Tamil">Tamil</option>
                        <option value="Telugu">Telugu</option>
                        <option value="Bengali">Bengali</option>
                        <option value="Marathi">Marathi</option>
                        <option value="Gujarati">Gujarati</option>
                        <option value="Kannada">Kannada</option>
                        <option value="Malayalam">Malayalam</option>
                        <option value="Punjabi">Punjabi</option>
                        <option value="Urdu">Urdu</option>
                        <option value="Assamese">Assamese</option>
                        <option value="Odia">Odia</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Other">Other</option>
                      </select>
                      <select
                        value={lang.proficiency || ''}
                        onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                        className="w-48 px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                      >
                        <option value="">Select proficiency</option>
                        {Object.entries(languageProficiency).map(([key, value]) => (
                          <option key={key} value={value}>{value}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeLanguage(index)}
                        className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30"
                  >
                    Add Language
                  </button>
                </div>
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">Certifications</label>
                <input
                  type="text"
                  value={formData.certifications.join(', ')}
                  onChange={(e) => handleArrayChange('certifications', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                  placeholder="AWS Certified Developer, Google Cloud Professional (comma-separated)"
                />
              </div>

              {/* Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">LinkedIn Profile</label>
                  <input
                    type="url"
                    name="linkedIn"
                    value={formData.linkedIn}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Portfolio Website</label>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">GitHub Profile</label>
                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Legal & Consent */}
          {activeSection === 'legal' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">📜 Legal & Consent</h3>
                {completionStatus.legal && <span className="text-green-400 text-sm">✓ Complete</span>}
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-yellow-400">⚠️</span>
                  <h4 className="text-yellow-300 font-semibold">Important Legal Information</h4>
                </div>
                <p className="text-yellow-200 text-sm">
                  Please read and accept the following consents to complete your profile. These are required for compliance with Indian data protection laws.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consents.dataProcessing}
                      onChange={() => handleConsentChange('dataProcessing')}
                      className="mt-1 rounded bg-white/10 border border-white/20"
                      required
                    />
                    <div>
                      <span className="text-white font-medium">Data Processing Consent *</span>
                      <p className="text-gray-300 text-sm mt-1">
                        I consent to the processing of my personal data for job matching, recruitment, and related services as per the Privacy Policy. This includes sharing my profile with potential employers.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consents.backgroundVerification}
                      onChange={() => handleConsentChange('backgroundVerification')}
                      className="mt-1 rounded bg-white/10 border border-white/20"
                      required
                    />
                    <div>
                      <span className="text-white font-medium">Background Verification Consent *</span>
                      <p className="text-gray-300 text-sm mt-1">
                        I authorize potential employers to conduct background verification checks including but not limited to employment history, educational qualifications, and reference checks.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consents.contactConsent}
                      onChange={() => handleConsentChange('contactConsent')}
                      className="mt-1 rounded bg-white/10 border border-white/20"
                      required
                    />
                    <div>
                      <span className="text-white font-medium">Contact Consent *</span>
                      <p className="text-gray-300 text-sm mt-1">
                        I consent to being contacted by potential employers and recruitment consultants via phone, email, and other communication channels for job opportunities.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consents.thirdPartySharing}
                      onChange={() => handleConsentChange('thirdPartySharing')}
                      className="mt-1 rounded bg-white/10 border border-white/20"
                    />
                    <div>
                      <span className="text-white font-medium">Third-Party Sharing</span>
                      <p className="text-gray-300 text-sm mt-1">
                        I consent to my profile being shared with trusted third-party recruitment partners and job portals to increase my job opportunities.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consents.marketingCommunication}
                      onChange={() => handleConsentChange('marketingCommunication')}
                      className="mt-1 rounded bg-white/10 border border-white/20"
                    />
                    <div>
                      <span className="text-white font-medium">Marketing Communications</span>
                      <p className="text-gray-300 text-sm mt-1">
                        I consent to receiving marketing communications, newsletters, and promotional content about career opportunities and services.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-blue-400">ℹ️</span>
                  <h4 className="text-blue-300 font-semibold">Data Protection Rights</h4>
                </div>
                <p className="text-blue-200 text-sm mb-2">
                  You have the right to access, update, or delete your personal data at any time. You can also withdraw your consent by contacting our support team.
                </p>
                <p className="text-blue-200 text-sm">
                  For more information, please read our <a href="#" className="underline hover:text-white">Privacy Policy</a> and <a href="#" className="underline hover:text-white">Terms of Service</a>.
                </p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-center pt-8">
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={saving}
                className={`px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  saving ? 'animate-pulse' : ''
                }`}
              >
                {saving ? 'Saving...' : (activeSection === 'legal' ? 'Submit Profile' : 'Save Section')}
              </button>
              
              {activeSection !== 'legal' && getNextIncompleteSection() && (
                <button
                  type="button"
                  onClick={() => setActiveSection(getNextIncompleteSection())}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  Next Section →
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
