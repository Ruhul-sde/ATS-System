
import { config } from '../config/environment.js';

const { apiKey: GEMINI_API_KEY, apiUrl: GEMINI_API_URL, rateLimitDelay } = config.gemini;

export class GeminiService {
  static validateApiKey() {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
      throw new Error('Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables.');
    }
    return true;
  }

  static validateEnvironment() {
    const errors = [];
    
    if (!GEMINI_API_KEY) {
      errors.push('GEMINI_API_KEY is not configured');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async analyzeResume(resumeText, jobDescription) {
    this.validateApiKey();
    
    if (!resumeText || resumeText.trim() === '') {
      throw new Error('Resume text is required for analysis');
    }
    
    if (!jobDescription || jobDescription.trim() === '') {
      throw new Error('Job description is required for analysis');
    }

    const prompt = `
Analyze the following resume against the job description and provide a comprehensive match analysis.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}

Please provide a detailed analysis including:
1. Overall match percentage (0-100)
2. Specific matching skills and technologies
3. Missing critical skills
4. Experience level assessment
5. Education relevance
6. Strengths and areas for improvement
7. Actionable recommendations

Respond in this exact JSON format:
{
  "matchPercentage": number,
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "experienceMatch": "entry/mid/senior",
  "educationRelevance": "high/medium/low",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "keywordMatches": number,
  "overallAssessment": "brief overall assessment",
  "interviewReadiness": "ready/needs-preparation/not-ready"
}
`;

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(`Gemini API error: ${errorMessage}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from Gemini API');
      }
      
      const responseText = data.candidates[0].content.parts[0].text;
      
      // Extract and parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedResult = JSON.parse(jsonMatch[0]);
          
          // Validate and enhance the response
          return {
            matchPercentage: Math.min(100, Math.max(0, parsedResult.matchPercentage || 0)),
            matchingSkills: Array.isArray(parsedResult.matchingSkills) ? parsedResult.matchingSkills : [],
            missingSkills: Array.isArray(parsedResult.missingSkills) ? parsedResult.missingSkills : [],
            experienceMatch: parsedResult.experienceMatch || 'unknown',
            educationRelevance: parsedResult.educationRelevance || 'unknown',
            strengths: Array.isArray(parsedResult.strengths) ? parsedResult.strengths : [],
            weaknesses: Array.isArray(parsedResult.weaknesses) ? parsedResult.weaknesses : [],
            recommendations: Array.isArray(parsedResult.recommendations) ? parsedResult.recommendations : [],
            keywordMatches: parsedResult.keywordMatches || 0,
            overallAssessment: parsedResult.overallAssessment || 'Analysis completed',
            interviewReadiness: parsedResult.interviewReadiness || 'unknown',
            analysisTimestamp: new Date().toISOString(),
            processingTime: Date.now() // Will be calculated by caller
          };
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          throw new Error(`Failed to parse AI response JSON: ${parseError.message}`);
        }
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Please check your internet connection');
      }
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  static async batchAnalyzeResumes(resumes, jobDescription, onProgress) {
    this.validateApiKey();
    
    if (!Array.isArray(resumes) || resumes.length === 0) {
      throw new Error('No resumes provided for analysis');
    }
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    const startTime = Date.now();
    
    console.log(`Starting batch analysis of ${resumes.length} resumes...`);
    
    for (let i = 0; i < resumes.length; i++) {
      const processStart = Date.now();
      
      try {
        const resume = resumes[i];
        
        if (!resume.fileName || !resume.text) {
          throw new Error('Invalid resume format: missing fileName or text');
        }
        
        console.log(`Analyzing resume ${i + 1}/${resumes.length}: ${resume.fileName}`);
        
        const analysis = await this.analyzeResume(resume.text, jobDescription);
        analysis.processingTime = Date.now() - processStart;
        
        results.push({
          fileName: resume.fileName,
          fileSize: resume.text.length,
          ...analysis,
          status: 'success'
        });
        
        successCount++;
        
        if (onProgress) {
          onProgress(i + 1, resumes.length, {
            successCount,
            errorCount,
            currentFile: resume.fileName,
            estimatedTimeRemaining: this.calculateETA(i + 1, resumes.length, Date.now() - startTime)
          });
        }
        
        // Add intelligent delay based on API response time
        const delay = Math.max(rateLimitDelay, analysis.processingTime * 0.1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error) {
        console.error(`Error analyzing ${resumes[i]?.fileName || 'unknown file'}:`, error);
        errorCount++;
        
        results.push({
          fileName: resumes[i]?.fileName || 'unknown',
          fileSize: resumes[i]?.text?.length || 0,
          matchPercentage: 0,
          matchingSkills: [],
          missingSkills: [],
          experienceMatch: 'unknown',
          educationRelevance: 'unknown',
          strengths: [],
          weaknesses: [],
          recommendations: ['Analysis failed - please try again'],
          keywordMatches: 0,
          overallAssessment: 'Analysis failed due to error',
          interviewReadiness: 'unknown',
          error: error.message,
          status: 'error',
          processingTime: Date.now() - processStart,
          analysisTimestamp: new Date().toISOString()
        });
        
        if (onProgress) {
          onProgress(i + 1, resumes.length, {
            successCount,
            errorCount,
            currentFile: resumes[i]?.fileName || 'unknown',
            estimatedTimeRemaining: this.calculateETA(i + 1, resumes.length, Date.now() - startTime)
          });
        }
        
        // Shorter delay on errors to speed up processing
        await new Promise(resolve => setTimeout(resolve, rateLimitDelay * 0.5));
      }
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`Batch analysis complete: ${successCount} successful, ${errorCount} errors in ${totalTime}ms`);
    
    return {
      results,
      summary: {
        total: resumes.length,
        successful: successCount,
        failed: errorCount,
        totalProcessingTime: totalTime,
        averageProcessingTime: totalTime / resumes.length,
        successRate: (successCount / resumes.length) * 100
      }
    };
  }

  static calculateETA(current, total, elapsedTime) {
    if (current === 0) return 'Calculating...';
    const averageTime = elapsedTime / current;
    const remaining = total - current;
    const eta = remaining * averageTime;
    
    const minutes = Math.floor(eta / 60000);
    const seconds = Math.floor((eta % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  static async generateJobAnalytics(jobDescription) {
    this.validateApiKey();
    
    const prompt = `
Analyze this job description and provide insights for better recruitment:

JOB DESCRIPTION:
${jobDescription}

Provide analysis in this JSON format:
{
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "experienceLevel": "entry/mid/senior",
  "industry": "industry name",
  "estimatedSalaryRange": "range",
  "competitionLevel": "low/medium/high",
  "suggestions": ["suggestion1", "suggestion2"]
}
`;

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.candidates[0].content.parts[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse job analytics response');
    } catch (error) {
      console.error('Job analytics error:', error);
      throw error;
    }
  }

  static getApiKeyStatus() {
    try {
      this.validateApiKey();
      return { 
        configured: true, 
        message: 'API key is configured and ready',
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return { 
        configured: false, 
        message: error.message,
        lastChecked: new Date().toISOString()
      };
    }
  }

  static getServiceHealth() {
    const status = this.getApiKeyStatus();
    const envStatus = this.validateEnvironment();
    
    return {
      status: status.configured && envStatus.isValid ? 'healthy' : 'unhealthy',
      apiKey: status,
      environment: envStatus,
      rateLimitDelay,
      features: {
        singleAnalysis: status.configured,
        batchAnalysis: status.configured,
        jobAnalytics: status.configured
      }
    };
  }
}
