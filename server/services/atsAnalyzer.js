import { GeminiService } from './geminiService.js';
import crypto from 'crypto';

class AtsAnalyzer {
  // Simple in-memory cache for analysis results
  static cache = new Map();
  static maxCacheSize = 100;

  /**
   * Run ATS analysis on resume and job description
   * @param {string} resumeText - Extracted resume text
   * @param {string} jobDescriptionText - Job description text
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis results
   */
  static async run(resumeText, jobDescriptionText, options = {}) {
    try {
      // Validate inputs
      if (!resumeText || !jobDescriptionText) {
        throw new Error('Both resume text and job description are required');
      }

      // Generate cache key
      const cacheKey = this.generateCacheKey(resumeText, jobDescriptionText);
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        console.log('Returning cached ATS analysis result');
        return this.cache.get(cacheKey);
      }

      console.log('Running ATS analysis with Gemini API...');
      
      // Run the analysis with retries
      const analysis = await this.runWithRetries(resumeText, jobDescriptionText, options);
      
      // Enhance the analysis with additional processing
      const enhancedAnalysis = this.enhanceAnalysis(analysis, resumeText, jobDescriptionText);
      
      // Cache the result
      this.cacheResult(cacheKey, enhancedAnalysis);
      
      return enhancedAnalysis;
    } catch (error) {
      console.error('ATS Analysis error:', error);
      throw new Error(`ATS analysis failed: ${error.message}`);
    }
  }

  /**
   * Run analysis with retry logic
   * @param {string} resumeText - Resume text
   * @param {string} jobDescriptionText - Job description text
   * @param {Object} options - Options
   * @returns {Promise<Object>} Analysis result
   */
  static async runWithRetries(resumeText, jobDescriptionText, options) {
    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await GeminiService.analyzeResume(resumeText, jobDescriptionText);
      } catch (error) {
        console.error(`ATS analysis attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }

  /**
   * Enhance analysis results with additional processing
   * @param {Object} analysis - Basic analysis from Gemini
   * @param {string} resumeText - Original resume text
   * @param {string} jobDescriptionText - Original job description
   * @returns {Object} Enhanced analysis
   */
  static enhanceAnalysis(analysis, resumeText, jobDescriptionText) {
    const enhanced = { ...analysis };

    // Add metadata
    enhanced.metadata = {
      analyzedAt: new Date().toISOString(),
      resumeLength: resumeText.length,
      jobDescriptionLength: jobDescriptionText.length,
      analysisVersion: '2.0'
    };

    // Enhance keyword matching
    enhanced.detailedKeywordAnalysis = this.analyzeKeywords(
      resumeText, 
      jobDescriptionText, 
      analysis.keywordMatches || []
    );

    // Add skill gap analysis
    enhanced.skillGapAnalysis = this.analyzeSkillGaps(
      resumeText,
      jobDescriptionText,
      analysis.matchingSkills || [],
      analysis.missingSkills || []
    );

    // Add scoring breakdown
    enhanced.scoringBreakdown = this.calculateScoringBreakdown(analysis);

    // Add recommendations
    enhanced.recommendations = this.generateRecommendations(analysis, resumeText, jobDescriptionText);

    // Add ATS optimization suggestions
    enhanced.atsOptimization = this.generateAtsOptimizationTips(resumeText, analysis);

    // Normalize match percentage
    if (typeof enhanced.matchPercentage !== 'number') {
      enhanced.matchPercentage = this.extractMatchPercentage(analysis);
    }

    return enhanced;
  }

  /**
   * Analyze keyword matching in detail
   * @param {string} resumeText - Resume text
   * @param {string} jobDescriptionText - Job description text
   * @param {Array} existingMatches - Existing keyword matches
   * @returns {Object} Detailed keyword analysis
   */
  static analyzeKeywords(resumeText, jobDescriptionText, existingMatches) {
    const resumeLower = resumeText.toLowerCase();
    const jobLower = jobDescriptionText.toLowerCase();

    // Technical keywords to look for
    const technicalKeywords = [
      'javascript', 'python', 'java', 'react', 'node.js', 'angular', 'vue',
      'html', 'css', 'sql', 'mongodb', 'mysql', 'aws', 'azure', 'docker',
      'kubernetes', 'git', 'typescript', 'rest api', 'graphql', 'agile', 'scrum'
    ];

    const matched = [];
    const missing = [];
    const keywordFrequency = {};

    technicalKeywords.forEach(keyword => {
      const inJob = jobLower.includes(keyword);
      const inResume = resumeLower.includes(keyword);

      if (inJob) {
        if (inResume) {
          matched.push(keyword);
          // Count frequency in resume
          const matches = (resumeLower.match(new RegExp(keyword, 'g')) || []).length;
          keywordFrequency[keyword] = matches;
        } else {
          missing.push(keyword);
        }
      }
    });

    return {
      matched,
      missing,
      keywordFrequency,
      matchRate: matched.length / (matched.length + missing.length) || 0,
      totalJobKeywords: matched.length + missing.length
    };
  }

  /**
   * Analyze skill gaps
   * @param {string} resumeText - Resume text
   * @param {string} jobDescriptionText - Job description text
   * @param {Array} matchingSkills - Skills that match
   * @param {Array} missingSkills - Skills that are missing
   * @returns {Object} Skill gap analysis
   */
  static analyzeSkillGaps(resumeText, jobDescriptionText, matchingSkills = [], missingSkills = []) {
    return {
      criticalSkills: missingSkills.filter(skill => 
        jobDescriptionText.toLowerCase().includes('required') && 
        jobDescriptionText.toLowerCase().includes(skill.toLowerCase())
      ),
      preferredSkills: missingSkills.filter(skill => 
        jobDescriptionText.toLowerCase().includes('preferred') && 
        jobDescriptionText.toLowerCase().includes(skill.toLowerCase())
      ),
      strongMatches: matchingSkills.slice(0, 5), // Top 5 matching skills
      improvementAreas: missingSkills.slice(0, 3), // Top 3 areas to improve
      skillCoverage: matchingSkills.length / (matchingSkills.length + missingSkills.length) || 0
    };
  }

  /**
   * Calculate detailed scoring breakdown
   * @param {Object} analysis - Analysis object
   * @returns {Object} Scoring breakdown
   */
  static calculateScoringBreakdown(analysis) {
    const scores = {
      keywordMatch: 0,
      skillsMatch: 0,
      experienceMatch: 0,
      educationMatch: 0,
      overall: 0
    };

    // Keyword matching score (0-30 points)
    if (analysis.keywordMatches && Array.isArray(analysis.keywordMatches)) {
      scores.keywordMatch = Math.min(30, analysis.keywordMatches.length * 2);
    }

    // Skills matching score (0-25 points)
    if (analysis.matchingSkills && Array.isArray(analysis.matchingSkills)) {
      scores.skillsMatch = Math.min(25, analysis.matchingSkills.length * 3);
    }

    // Experience matching score (0-25 points)
    if (analysis.overallAssessment) {
      const assessment = analysis.overallAssessment.toLowerCase();
      if (assessment.includes('experience') && assessment.includes('match')) {
        scores.experienceMatch = 20;
      } else if (assessment.includes('experience')) {
        scores.experienceMatch = 15;
      }
    }

    // Education matching score (0-20 points)
    if (analysis.overallAssessment) {
      const assessment = analysis.overallAssessment.toLowerCase();
      if (assessment.includes('education') || assessment.includes('degree')) {
        scores.educationMatch = 15;
      }
    }

    // Calculate overall score
    scores.overall = scores.keywordMatch + scores.skillsMatch + scores.experienceMatch + scores.educationMatch;

    return {
      ...scores,
      maxPossible: 100,
      percentage: Math.min(100, scores.overall)
    };
  }

  /**
   * Generate actionable recommendations
   * @param {Object} analysis - Analysis results
   * @param {string} resumeText - Resume text
   * @param {string} jobDescriptionText - Job description text
   * @returns {Array} Recommendations
   */
  static generateRecommendations(analysis, resumeText, jobDescriptionText) {
    const recommendations = [];

    // Missing skills recommendations
    if (analysis.missingSkills && analysis.missingSkills.length > 0) {
      recommendations.push({
        type: 'skills',
        priority: 'high',
        title: 'Add Missing Skills',
        description: `Consider adding these skills to your resume: ${analysis.missingSkills.slice(0, 3).join(', ')}`,
        action: 'Update your resume to include relevant experience with these technologies'
      });
    }

    // Keyword optimization
    if (analysis.keywordMatches && analysis.keywordMatches.length < 5) {
      recommendations.push({
        type: 'keywords',
        priority: 'medium',
        title: 'Improve Keyword Matching',
        description: 'Your resume could benefit from including more job-specific keywords',
        action: 'Review the job description and incorporate relevant terms naturally into your resume'
      });
    }

    // Format recommendations
    if (resumeText.length < 500) {
      recommendations.push({
        type: 'content',
        priority: 'medium',
        title: 'Expand Resume Content',
        description: 'Your resume appears to be quite brief',
        action: 'Consider adding more details about your experience, projects, and achievements'
      });
    }

    // Experience alignment
    if (analysis.overallAssessment && analysis.overallAssessment.toLowerCase().includes('junior')) {
      recommendations.push({
        type: 'experience',
        priority: 'low',
        title: 'Highlight Relevant Experience',
        description: 'Emphasize projects and experiences that align with the job requirements',
        action: 'Reorganize your resume to lead with the most relevant experience'
      });
    }

    return recommendations;
  }

  /**
   * Generate ATS optimization tips
   * @param {string} resumeText - Resume text
   * @param {Object} analysis - Analysis results
   * @returns {Array} ATS optimization tips
   */
  static generateAtsOptimizationTips(resumeText, analysis) {
    const tips = [];

    // Format tips
    tips.push({
      category: 'Format',
      tip: 'Use a simple, clean format with standard fonts',
      implemented: true // Assume text extraction worked, so format is readable
    });

    // Keyword density
    const wordCount = resumeText.split(/\s+/).length;
    const keywordCount = analysis.keywordMatches ? analysis.keywordMatches.length : 0;
    const keywordDensity = keywordCount / wordCount;

    tips.push({
      category: 'Keywords',
      tip: 'Include relevant keywords naturally throughout your resume',
      implemented: keywordDensity > 0.02 // At least 2% keyword density
    });

    // Standard sections
    const hasContactInfo = /email|phone/i.test(resumeText);
    tips.push({
      category: 'Structure',
      tip: 'Include standard resume sections: Contact Info, Experience, Skills, Education',
      implemented: hasContactInfo
    });

    return tips;
  }

  /**
   * Extract match percentage from analysis
   * @param {Object} analysis - Analysis object
   * @returns {number} Match percentage
   */
  static extractMatchPercentage(analysis) {
    if (analysis.matchPercentage && typeof analysis.matchPercentage === 'number') {
      return analysis.matchPercentage;
    }

    // Try to extract from assessment text
    if (analysis.overallAssessment) {
      const match = analysis.overallAssessment.match(/(\d+)%/);
      if (match) {
        return parseInt(match[1]);
      }
    }

    // Calculate based on available data
    const keywordScore = analysis.keywordMatches ? Math.min(50, analysis.keywordMatches.length * 10) : 0;
    const skillScore = analysis.matchingSkills ? Math.min(30, analysis.matchingSkills.length * 6) : 0;
    const baseScore = 20; // Base score for having a resume

    return Math.min(100, keywordScore + skillScore + baseScore);
  }

  /**
   * Generate cache key for analysis result
   * @param {string} resumeText - Resume text
   * @param {string} jobDescriptionText - Job description text
   * @returns {string} Cache key
   */
  static generateCacheKey(resumeText, jobDescriptionText) {
    const combined = resumeText + '|||' + jobDescriptionText;
    return crypto.createHash('md5').update(combined).digest('hex');
  }

  /**
   * Cache analysis result
   * @param {string} key - Cache key
   * @param {Object} result - Analysis result
   */
  static cacheResult(key, result) {
    // Implement simple LRU cache
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, result);
  }

  /**
   * Clear analysis cache
   */
  static clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  static getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate: 0 // Could implement hit rate tracking if needed
    };
  }
}

export { AtsAnalyzer };