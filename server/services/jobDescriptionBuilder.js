class JobDescriptionBuilder {
  /**
   * Build a comprehensive job description text from JobRole object
   * @param {Object} jobRole - JobRole model instance
   * @returns {string} Formatted job description text
   */
  static fromRole(jobRole) {
    if (!jobRole) {
      throw new Error('JobRole object is required');
    }

    const sections = [];

    // Job Title and Company
    if (jobRole.title) {
      sections.push(`Position: ${jobRole.title}`);
    }

    if (jobRole.company) {
      sections.push(`Company: ${jobRole.company}`);
    }

    // Department and Location
    if (jobRole.department) {
      sections.push(`Department: ${jobRole.department}`);
    }

    if (jobRole.location) {
      sections.push(`Location: ${jobRole.location}`);
    }

    // Job Description
    if (jobRole.description) {
      sections.push(`\nJob Description:\n${jobRole.description}`);
    }

    // Key Responsibilities
    if (jobRole.responsibilities && jobRole.responsibilities.length > 0) {
      sections.push(`\nKey Responsibilities:\n${this.formatList(jobRole.responsibilities)}`);
    }

    // Required Skills and Qualifications
    if (jobRole.requiredSkills && jobRole.requiredSkills.length > 0) {
      sections.push(`\nRequired Skills:\n${this.formatList(jobRole.requiredSkills)}`);
    }

    // Preferred Skills
    if (jobRole.preferredSkills && jobRole.preferredSkills.length > 0) {
      sections.push(`\nPreferred Skills:\n${this.formatList(jobRole.preferredSkills)}`);
    }

    // Experience Requirements
    if (jobRole.experienceLevel || jobRole.minExperience || jobRole.maxExperience) {
      let experienceText = '\nExperience Requirements:\n';
      
      if (jobRole.experienceLevel) {
        experienceText += `- Experience Level: ${jobRole.experienceLevel}\n`;
      }
      
      if (jobRole.minExperience !== undefined && jobRole.maxExperience !== undefined) {
        experienceText += `- ${jobRole.minExperience}-${jobRole.maxExperience} years of experience\n`;
      } else if (jobRole.minExperience !== undefined) {
        experienceText += `- Minimum ${jobRole.minExperience} years of experience\n`;
      } else if (jobRole.maxExperience !== undefined) {
        experienceText += `- Up to ${jobRole.maxExperience} years of experience\n`;
      }
      
      sections.push(experienceText.trim());
    }

    // Education Requirements
    if (jobRole.educationLevel) {
      sections.push(`\nEducation: ${jobRole.educationLevel}`);
    }

    // Employment Type and Work Mode
    if (jobRole.employmentType) {
      sections.push(`\nEmployment Type: ${jobRole.employmentType}`);
    }

    if (jobRole.workMode) {
      sections.push(`Work Mode: ${jobRole.workMode}`);
    }

    // Salary Information
    if (jobRole.salaryRange && (jobRole.salaryRange.min || jobRole.salaryRange.max)) {
      let salaryText = '\nSalary: ';
      if (jobRole.salaryRange.min && jobRole.salaryRange.max) {
        salaryText += `$${jobRole.salaryRange.min}k - $${jobRole.salaryRange.max}k`;
      } else if (jobRole.salaryRange.min) {
        salaryText += `$${jobRole.salaryRange.min}k+`;
      } else if (jobRole.salaryRange.max) {
        salaryText += `Up to $${jobRole.salaryRange.max}k`;
      }
      
      if (jobRole.salaryRange.currency && jobRole.salaryRange.currency !== 'USD') {
        salaryText += ` (${jobRole.salaryRange.currency})`;
      }
      
      sections.push(salaryText);
    }

    // Benefits
    if (jobRole.benefits && jobRole.benefits.length > 0) {
      sections.push(`\nBenefits:\n${this.formatList(jobRole.benefits)}`);
    }

    // Company Culture and Additional Info
    if (jobRole.companyCulture) {
      sections.push(`\nCompany Culture:\n${jobRole.companyCulture}`);
    }

    if (jobRole.additionalInfo) {
      sections.push(`\nAdditional Information:\n${jobRole.additionalInfo}`);
    }

    // Application Instructions
    if (jobRole.applicationInstructions) {
      sections.push(`\nApplication Instructions:\n${jobRole.applicationInstructions}`);
    }

    return sections.join('\n\n').trim();
  }

  /**
   * Build job description from custom data object
   * @param {Object} jobData - Custom job data object
   * @returns {string} Formatted job description
   */
  static fromCustomData(jobData) {
    const {
      title = '',
      company = '',
      department = '',
      location = '',
      description = '',
      requirements = [],
      skills = [],
      experience = '',
      salary = '',
      benefits = []
    } = jobData;

    const sections = [];

    if (title) sections.push(`Position: ${title}`);
    if (company) sections.push(`Company: ${company}`);
    if (department) sections.push(`Department: ${department}`);
    if (location) sections.push(`Location: ${location}`);
    
    if (description) sections.push(`\nJob Description:\n${description}`);
    
    if (requirements.length > 0) {
      sections.push(`\nRequirements:\n${this.formatList(requirements)}`);
    }
    
    if (skills.length > 0) {
      sections.push(`\nRequired Skills:\n${this.formatList(skills)}`);
    }
    
    if (experience) sections.push(`\nExperience: ${experience}`);
    if (salary) sections.push(`\nSalary: ${salary}`);
    
    if (benefits.length > 0) {
      sections.push(`\nBenefits:\n${this.formatList(benefits)}`);
    }

    return sections.join('\n\n').trim();
  }

  /**
   * Format array of items as bullet points
   * @param {Array} items - Array of items to format
   * @returns {string} Formatted list
   */
  static formatList(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return '';
    }

    return items.map(item => `• ${item}`).join('\n');
  }

  /**
   * Extract key requirements and skills from job description text
   * @param {string} jobDescriptionText - Job description text
   * @returns {Object} Extracted requirements and skills
   */
  static extractKeywords(jobDescriptionText) {
    if (!jobDescriptionText) {
      return { skills: [], requirements: [], keywords: [] };
    }

    const text = jobDescriptionText.toLowerCase();
    
    // Common technical skills
    const technicalSkills = [
      'javascript', 'python', 'java', 'react', 'node.js', 'angular', 'vue',
      'html', 'css', 'sql', 'mongodb', 'mysql', 'postgresql', 'aws', 'azure',
      'docker', 'kubernetes', 'git', 'typescript', 'c++', 'c#', '.net',
      'spring', 'django', 'flask', 'express', 'rest api', 'graphql',
      'microservices', 'agile', 'scrum', 'ci/cd', 'jenkins', 'terraform',
      'redis', 'elasticsearch', 'kafka', 'rabbitmq', 'machine learning',
      'artificial intelligence', 'data science', 'analytics', 'tableau',
      'power bi', 'excel', 'figma', 'sketch', 'photoshop', 'illustrator'
    ];

    // Soft skills and requirements
    const softSkills = [
      'communication', 'leadership', 'teamwork', 'problem solving',
      'analytical', 'creative', 'detail-oriented', 'time management',
      'project management', 'mentoring', 'collaboration', 'adaptability'
    ];

    const foundSkills = [];
    const foundRequirements = [];
    const allKeywords = [];

    // Find technical skills
    technicalSkills.forEach(skill => {
      if (text.includes(skill)) {
        foundSkills.push(skill);
        allKeywords.push(skill);
      }
    });

    // Find soft skills
    softSkills.forEach(skill => {
      if (text.includes(skill)) {
        foundRequirements.push(skill);
        allKeywords.push(skill);
      }
    });

    // Extract degree requirements
    const degreePatterns = [
      "bachelor's degree", "bachelor degree", "bs degree", "ba degree",
      "master's degree", "master degree", "ms degree", "ma degree", "mba",
      "phd", "doctorate", "engineering degree", "computer science degree"
    ];

    degreePatterns.forEach(pattern => {
      if (text.includes(pattern)) {
        foundRequirements.push(pattern);
        allKeywords.push(pattern);
      }
    });

    return {
      skills: [...new Set(foundSkills)], // Remove duplicates
      requirements: [...new Set(foundRequirements)],
      keywords: [...new Set(allKeywords)]
    };
  }

  /**
   * Validate job description completeness
   * @param {string} jobDescription - Job description text
   * @returns {Object} Validation result with score and suggestions
   */
  static validateCompleteness(jobDescription) {
    const result = {
      score: 0,
      maxScore: 10,
      suggestions: [],
      isComplete: false
    };

    if (!jobDescription || jobDescription.trim().length === 0) {
      result.suggestions.push('Job description is empty');
      return result;
    }

    const text = jobDescription.toLowerCase();

    // Check for essential components
    const checks = [
      { pattern: /(position|role|title|job).*:/i, points: 1, message: 'Job title/position' },
      { pattern: /(description|summary|overview)/i, points: 2, message: 'Job description/summary' },
      { pattern: /(skill|requirement|qualification)/i, points: 2, message: 'Skills/requirements' },
      { pattern: /(experience|year)/i, points: 1, message: 'Experience requirements' },
      { pattern: /(responsibility|duties|role)/i, points: 2, message: 'Key responsibilities' },
      { pattern: /(education|degree|qualification)/i, points: 1, message: 'Education requirements' },
      { pattern: /(salary|compensation|pay)/i, points: 1, message: 'Salary information' }
    ];

    checks.forEach(check => {
      if (check.pattern.test(text)) {
        result.score += check.points;
      } else {
        result.suggestions.push(`Consider adding ${check.message}`);
      }
    });

    result.isComplete = result.score >= 7;

    return result;
  }
}

export { JobDescriptionBuilder };