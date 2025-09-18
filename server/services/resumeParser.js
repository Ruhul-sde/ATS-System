import mammoth from 'mammoth';

class ResumeParser {
  /**
   * Extract text content from resume buffer based on file type
   * @param {Buffer} buffer - File buffer
   * @param {string} mimetype - MIME type of the file
   * @param {string} filename - Original filename
   * @returns {Promise<string>} Extracted text content
   */
  static async extractText(buffer, mimetype, filename) {
    try {
      const ext = filename?.split('.').pop()?.toLowerCase();
      
      switch (mimetype) {
        case 'application/pdf':
          return await this.extractPdfText(buffer);
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          return await this.extractDocxText(buffer);
        
        case 'text/plain':
          return buffer.toString('utf-8');
        
        default:
          // Try to determine by file extension
          if (ext === 'pdf') {
            return await this.extractPdfText(buffer);
          } else if (ext === 'docx') {
            return await this.extractDocxText(buffer);
          } else if (ext === 'txt') {
            return buffer.toString('utf-8');
          } else {
            throw new Error(`Unsupported file type: ${mimetype}. Supported types: PDF, DOCX, TXT`);
          }
      }
    } catch (error) {
      console.error('Error extracting text from resume:', error);
      throw new Error(`Failed to extract text from resume: ${error.message}`);
    }
  }

  /**
   * Extract text from PDF buffer
   * @param {Buffer} buffer - PDF file buffer
   * @returns {Promise<string>} Extracted text
   */
  static async extractPdfText(buffer) {
    try {
      // Dynamic import for pdf-parse since it's already installed
      const pdfParse = await import('pdf-parse');
      const data = await pdfParse.default(buffer);
      return data.text;
    } catch (error) {
      throw new Error(`PDF parsing error: ${error.message}`);
    }
  }

  /**
   * Extract text from DOCX buffer
   * @param {Buffer} buffer - DOCX file buffer
   * @returns {Promise<string>} Extracted text
   */
  static async extractDocxText(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error(`DOCX parsing error: ${error.message}`);
    }
  }

  /**
   * Validate file type and size
   * @param {Object} file - Multer file object
   * @returns {boolean} Whether file is valid
   */
  static validateResumeFile(file) {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    const allowedExtensions = ['pdf', 'docx', 'doc', 'txt'];
    const ext = file.originalname?.split('.').pop()?.toLowerCase();

    // Check MIME type and extension
    const isValidType = allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext);
    
    // Check file size (10MB limit)
    const isValidSize = file.size <= 10 * 1024 * 1024;

    if (!isValidType) {
      throw new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.');
    }

    if (!isValidSize) {
      throw new Error('File too large. Maximum size allowed is 10MB.');
    }

    return true;
  }

  /**
   * Clean and normalize extracted text
   * @param {string} text - Raw extracted text
   * @returns {string} Cleaned text
   */
  static cleanText(text) {
    if (!text) return '';

    return text
      .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
      .replace(/[\r\n]+/g, '\n')  // Normalize line breaks
      .trim();
  }

  /**
   * Extract key information from resume text
   * @param {string} text - Resume text
   * @returns {Object} Extracted information
   */
  static extractKeyInfo(text) {
    const info = {
      email: null,
      phone: null,
      skills: [],
      experience: null,
      education: null
    };

    // Extract email
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      info.email = emailMatch[0];
    }

    // Extract phone number
    const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
      info.phone = phoneMatch[0];
    }

    // Extract common skills (basic pattern matching)
    const skillKeywords = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue',
      'HTML', 'CSS', 'SQL', 'MongoDB', 'MySQL', 'AWS', 'Azure', 'Docker',
      'Kubernetes', 'Git', 'TypeScript', 'C++', 'C#', '.NET', 'Spring',
      'Django', 'Flask', 'Express', 'Machine Learning', 'AI', 'Data Science'
    ];

    skillKeywords.forEach(skill => {
      if (text.toLowerCase().includes(skill.toLowerCase())) {
        info.skills.push(skill);
      }
    });

    return info;
  }
}

export { ResumeParser };