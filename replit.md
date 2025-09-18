# ATS Pro - Applicant Tracking System

## Overview
A comprehensive Applicant Tracking System (ATS) with AI-powered resume analysis built with React/Vite frontend and Node.js/Express backend. The system allows companies to manage job postings, track candidates, and analyze resumes using Google's Gemini AI.

## Recent Changes (Sept 18, 2025)
- Successfully imported and configured for Replit environment
- Fixed port configurations (Frontend: 5000, Backend: 8000)
- Configured Vite to allow all hosts for Replit proxy
- Fixed MongoDB connection warnings
- Set up deployment configuration for VM target
- Verified application functionality

## Project Architecture

### Frontend (`/client`)
- **Framework**: React 19 with Vite 7
- **Styling**: Tailwind CSS 4.1
- **Port**: 5000 (configured for Replit proxy)
- **Key Features**: 
  - Authentication system
  - Dashboard for admins and job seekers
  - Resume upload and analysis
  - Job application management

### Backend (`/server`)
- **Framework**: Node.js with Express 5
- **Database**: MongoDB with Mongoose
- **Port**: 8000
- **AI Integration**: Google Gemini API for resume analysis
- **Key Features**:
  - User authentication with JWT
  - File upload handling (PDF/DOC resumes)
  - AI-powered resume matching
  - RESTful API endpoints

## Environment Configuration
- `PORT`: 8000 (backend)
- `MONGODB_URI`: mongodb://localhost:27017/ats
- `GEMINI_API_KEY`: Configured for AI analysis
- `NODE_ENV`: development
- `JWT_SECRET`: Configured for authentication

## Deployment Settings
- **Target**: VM (for maintaining application state)
- **Build**: Client build process with Vite
- **Run**: Server-only in production (serves built client files)

## Key Components
- **User Management**: Admin and applicant roles
- **Job Management**: Create, edit, and manage job postings
- **Application Tracking**: Monitor candidate progress through hiring pipeline
- **AI Analysis**: Automatic resume-job matching with Gemini AI
- **Dashboard**: Real-time analytics and candidate insights

## Technology Stack
- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express, Mongoose, JWT
- AI: Google Gemini API
- File Handling: Multer, PDF-Parse
- Authentication: bcryptjs, JWT tokens

## Current Status
✅ Fully configured and running in Replit environment
✅ All dependencies installed
✅ Frontend and backend integrated
✅ AI service configured
✅ Ready for production deployment