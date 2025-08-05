
export const config = {
  // API Configuration
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    rateLimitDelay: 1000, // 1 second between requests
    maxRetries: 3
  },
  
  // Application Configuration
  app: {
    name: 'ATS Pro Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    host: '0.0.0.0'
  },
  
  // Feature Flags
  features: {
    aiAnalysis: true,
    batchProcessing: true,
    exportResults: true,
    fileUpload: true
  }
};

// Validation function
export const validateEnvironment = () => {
  const errors = [];
  
  if (!config.gemini.apiKey) {
    errors.push('GEMINI_API_KEY is not configured');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper to check if we're in development
export const isDevelopment = () => config.app.environment === 'development';

// Helper to check if we're in production
export const isProduction = () => config.app.environment === 'production';
