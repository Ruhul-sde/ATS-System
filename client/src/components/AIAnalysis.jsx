
import { useState } from 'react';

export default function AIAnalysis({ results, loading, onExportResults }) {
  const [sortBy, setSortBy] = useState('matchPercentage');
  const [sortOrder, setSortOrder] = useState('desc');

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis in Progress</h3>
          <p className="text-gray-600">Analyzing resumes with Google Gemini AI...</p>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  const sortedResults = [...results].sort((a, b) => {
    const aVal = a[sortBy] || 0;
    const bVal = b[sortBy] || 0;
    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
  });

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">🤖 AI Analysis Results</h3>
        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="matchPercentage">Match %</option>
            <option value="fileName">File Name</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
          <button
            onClick={onExportResults}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm hover:shadow-lg transition-all duration-200"
          >
            📊 Export Results
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedResults.map((result, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-gray-900 truncate">{result.fileName}</h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(result.matchPercentage)}`}>
                {result.matchPercentage}% match
              </span>
            </div>

            {result.error ? (
              <p className="text-red-600 text-sm">Error: {result.error}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-green-700 mb-2">✅ Matching Skills</h5>
                  <div className="flex flex-wrap gap-1">
                    {result.matchingSkills?.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-red-700 mb-2">❌ Missing Skills</h5>
                  <div className="flex flex-wrap gap-1">
                    {result.missingSkills?.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h5 className="font-medium text-blue-700 mb-2">💡 AI Recommendation</h5>
                  <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                    {result.recommendation}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
