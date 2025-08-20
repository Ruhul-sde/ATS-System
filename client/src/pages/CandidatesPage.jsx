import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function CandidatesPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      position: 'Senior React Developer',
      matchScore: 96,
      status: 'interview',
      location: 'San Francisco, CA',
      experience: '6 years',
      salary: '$140k',
      appliedDate: '2024-01-20',
      avatar: '👩‍💻',
      skills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'AWS'],
      education: 'MS Computer Science - Stanford',
      previousCompany: 'Meta',
      phone: '+1 (555) 123-4567',
      linkedin: 'linkedin.com/in/sarahchen',
      summary: 'Experienced frontend developer with expertise in React ecosystem...',
      strengths: ['Strong technical skills', 'Team leadership', 'Problem solving'],
      concerns: ['Salary expectations might be high', 'Remote work preference']
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      email: 'mike.rodriguez@email.com',
      position: 'Product Manager',
      matchScore: 89,
      status: 'screening',
      location: 'New York, NY',
      experience: '4 years',
      salary: '$130k',
      appliedDate: '2024-01-18',
      avatar: '👨‍💼',
      skills: ['Product Strategy', 'Agile', 'Data Analysis', 'Roadmapping', 'Stakeholder Management'],
      education: 'MBA - Wharton, BS Engineering - MIT',
      previousCompany: 'Google',
      phone: '+1 (555) 234-5678',
      linkedin: 'linkedin.com/in/mikerodriguez',
      summary: 'Strategic product manager with proven track record in B2B SaaS...',
      strengths: ['Strategic thinking', 'Cross-functional collaboration', 'Data-driven decisions'],
      concerns: ['Limited experience in our industry', 'Relocation required']
    },
    {
      id: 3,
      name: 'Emma Thompson',
      email: 'emma.thompson@email.com',
      position: 'UX Designer',
      matchScore: 92,
      status: 'offer',
      location: 'Remote',
      experience: '5 years',
      salary: '$110k',
      appliedDate: '2024-01-15',
      avatar: '👩‍🎨',
      skills: ['UI/UX Design', 'Figma', 'User Research', 'Prototyping', 'Design Systems'],
      education: 'MFA Design - RISD',
      previousCompany: 'Airbnb',
      phone: '+1 (555) 345-6789',
      linkedin: 'linkedin.com/in/emmathompson',
      summary: 'Creative UX designer passionate about creating intuitive user experiences...',
      strengths: ['Creative vision', 'User empathy', 'Design thinking'],
      concerns: ['Portfolio shows limited B2B experience']
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.kim@email.com',
      position: 'DevOps Engineer',
      matchScore: 85,
      status: 'rejected',
      location: 'Seattle, WA',
      experience: '7 years',
      salary: '$125k',
      appliedDate: '2024-01-12',
      avatar: '👨‍💻',
      skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD'],
      education: 'BS Computer Science - University of Washington',
      previousCompany: 'Microsoft',
      phone: '+1 (555) 456-7890',
      linkedin: 'linkedin.com/in/davidkim',
      summary: 'Experienced DevOps engineer specializing in cloud infrastructure...',
      strengths: ['Strong technical expertise', 'Automation mindset', 'Problem solving'],
      concerns: ['Overqualified for the role', 'Salary expectations too high']
    },
    {
      id: 5,
      name: 'Lisa Wang',
      email: 'lisa.wang@email.com',
      position: 'Senior React Developer',
      matchScore: 94,
      status: 'new',
      location: 'Austin, TX',
      experience: '5 years',
      salary: '$120k',
      appliedDate: '2024-01-22',
      avatar: '👩‍🔬',
      skills: ['React', 'Vue.js', 'Node.js', 'Python', 'MongoDB'],
      education: 'BS Software Engineering - UT Austin',
      previousCompany: 'Spotify',
      phone: '+1 (555) 567-8901',
      linkedin: 'linkedin.com/in/lisawang',
      summary: 'Full-stack developer with strong frontend focus and startup experience...',
      strengths: ['Versatile skill set', 'Fast learner', 'Startup experience'],
      concerns: ['Recent graduate, limited senior experience']
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-gradient-to-r from-blue-400 to-cyan-500';
      case 'screening': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'interview': return 'bg-gradient-to-r from-purple-400 to-pink-500';
      case 'offer': return 'bg-gradient-to-r from-green-400 to-emerald-500';
      case 'hired': return 'bg-gradient-to-r from-emerald-500 to-teal-500';
      case 'rejected': return 'bg-gradient-to-r from-red-400 to-rose-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return '🏆';
    if (score >= 80) return '⭐';
    if (score >= 70) return '👍';
    return '📊';
  };

  const filteredAndSortedCandidates = candidates
    .filter(candidate => {
      if (activeFilter === 'all') return true;
      return candidate.status === activeFilter;
    })
    .filter(candidate =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'score': return b.matchScore - a.matchScore;
        case 'name': return a.name.localeCompare(b.name);
        case 'date': return new Date(b.appliedDate) - new Date(a.appliedDate);
        default: return 0;
      }
    });

  const CandidateCard = ({ candidate }) => (
    <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="text-6xl">{candidate.avatar}</div>
            <div className="absolute -bottom-2 -right-2 text-2xl">
              {getScoreBadge(candidate.matchScore)}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">{candidate.name}</h3>
            <p className="text-xl text-purple-300 mb-3">{candidate.position}</p>
            <div className="flex items-center space-x-4 text-gray-400">
              <span className="flex items-center space-x-1">
                <span>📍</span>
                <span>{candidate.location}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>💼</span>
                <span>{candidate.experience}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>💰</span>
                <span>{candidate.salary}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(candidate.matchScore)}`}>
              {candidate.matchScore}%
            </div>
            <div className="text-sm text-gray-400">Match</div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium text-white ${getStatusColor(candidate.status)}`}>
            {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-300 leading-relaxed">{candidate.summary}</p>
      </div>

      <div className="mb-6">
        <h4 className="text-white font-semibold mb-3">Skills:</h4>
        <div className="flex flex-wrap gap-2">
          {candidate.skills.map((skill, index) => (
            <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-lg border border-blue-500/30">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h5 className="text-green-400 font-medium mb-2">✅ Strengths</h5>
          <ul className="text-sm text-gray-300 space-y-1">
            {candidate.strengths.map((strength, index) => (
              <li key={index}>• {strength}</li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="text-yellow-400 font-medium mb-2">⚠️ Considerations</h5>
          <ul className="text-sm text-gray-300 space-y-1">
            {candidate.concerns.map((concern, index) => (
              <li key={index}>• {concern}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
        <div>
          <div className="text-sm text-gray-400 mb-1">Education</div>
          <div className="text-white font-medium text-sm">{candidate.education}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">Previous</div>
          <div className="text-white font-medium text-sm">{candidate.previousCompany}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">Applied</div>
          <div className="text-white font-medium text-sm">{new Date(candidate.appliedDate).toLocaleDateString()}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">Contact</div>
          <div className="text-blue-400 font-medium text-sm hover:underline cursor-pointer">{candidate.email}</div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button 
          onClick={() => setSelectedCandidate(candidate)}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105"
        >
          View Details
        </button>
        <button className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105">
          Schedule Interview
        </button>
        <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
          💬
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-cyan-400/8 to-blue-600/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-gradient-to-br from-pink-400/8 to-red-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-br from-green-400/8 to-cyan-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <Navbar softwareName="Akshay ATS Pro" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            👥 Candidates Hub
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 max-w-4xl mx-auto font-light">
            Discover and manage your talent pipeline with AI-powered insights
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-6 space-y-6 lg:space-y-0">
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-2 border border-white/20">
            {['all', 'new', 'screening', 'interview', 'offer', 'hired', 'rejected'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  activeFilter === filter
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Search and Sort */}
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
            >
              <option value="score">Sort by Match Score</option>
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Application Date</option>
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 text-center">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="text-3xl mb-3">👥</div>
            <div className="text-2xl font-bold text-blue-400 mb-2">{candidates.length}</div>
            <div className="text-gray-300 text-sm">Total</div>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="text-3xl mb-3">🆕</div>
            <div className="text-2xl font-bold text-green-400 mb-2">{candidates.filter(c => c.status === 'new').length}</div>
            <div className="text-gray-300 text-sm">New</div>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="text-3xl mb-3">🎤</div>
            <div className="text-2xl font-bold text-purple-400 mb-2">{candidates.filter(c => c.status === 'interview').length}</div>
            <div className="text-gray-300 text-sm">Interview</div>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="text-3xl mb-3">💼</div>
            <div className="text-2xl font-bold text-yellow-400 mb-2">{candidates.filter(c => c.status === 'offer').length}</div>
            <div className="text-gray-300 text-sm">Offers</div>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="text-3xl mb-3">🏆</div>
            <div className="text-2xl font-bold text-emerald-400 mb-2">{Math.round(candidates.reduce((sum, c) => sum + c.matchScore, 0) / candidates.length)}%</div>
            <div className="text-gray-300 text-sm">Avg Match</div>
          </div>
        </div>

        {/* Candidates List */}
        <div className="space-y-8">
          {filteredAndSortedCandidates.length > 0 ? (
            filteredAndSortedCandidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-3xl font-bold text-gray-400 mb-4">No candidates found</h3>
              <p className="text-gray-500 text-lg">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}