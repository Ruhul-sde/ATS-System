
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
Analyze the following resume against the job description and provide a detailed match analysis.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}

Please provide:
1. Match percentage (0-100)
2. Key matching skills found
3. Missing skills
4. Experience level match
5. Overall assessment

Respond in JSON format:
{
  "matchPercentage": number,
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "experienceMatch": "entry/mid/senior",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendation": "brief recommendation"
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
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(`Gemini API error: ${errorMessage}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from Gemini API');
      }
      
      const responseText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedResult = JSON.parse(jsonMatch[0]);
          
          return {
            matchPercentage: parsedResult.matchPercentage || 0,
            matchingSkills: Array.isArray(parsedResult.matchingSkills) ? parsedResult.matchingSkills : [],
            missingSkills: Array.isArray(parsedResult.missingSkills) ? parsedResult.missingSkills : [],
            experienceMatch: parsedResult.experienceMatch || 'unknown',
            strengths: Array.isArray(parsedResult.strengths) ? parsedResult.strengths : [],
            weaknesses: Array.isArray(parsedResult.weaknesses) ? parsedResult.weaknesses : [],
            recommendation: parsedResult.recommendation || 'No recommendation available'
          };
        } catch (parseError) {
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
    
    for (let i = 0; i < resumes.length; i++) {
      try {
        const resume = resumes[i];
        
        if (!resume.fileName || !resume.text) {
          throw new Error('Invalid resume format: missing fileName or text');
        }
        
        const analysis = await this.analyzeResume(resume.text, jobDescription);
        results.push({
          fileName: resume.fileName,
          ...analysis,
          status: 'success'
        });
        successCount++;
        
        if (onProgress) {
          onProgress(i + 1, resumes.length);
        }
        
        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
        
      } catch (error) {
        console.error(`Error analyzing ${resumes[i].fileName}:`, error);
        errorCount++;
        
        results.push({
          fileName: resumes[i].fileName,
          matchPercentage: 0,
          matchingSkills: [],
          missingSkills: [],
          experienceMatch: 'unknown',
          strengths: [],
          weaknesses: [],
          recommendation: 'Analysis failed due to error',
          error: error.message,
          status: 'error'
        });
        
        if (onProgress) {
          onProgress(i + 1, resumes.length);
        }
      }
    }
    
    console.log(`Batch analysis complete: ${successCount} successful, ${errorCount} errors`);
    return results;
  }

  static getApiKeyStatus() {
    try {
      this.validateApiKey();
      return { configured: true, message: 'API key is configured' };
    } catch (error) {
      return { configured: false, message: error.message };
    }
  }
}
