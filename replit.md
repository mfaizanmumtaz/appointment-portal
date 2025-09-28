# Overview

This is an appointment booking portal for Irfan Malik (CEO of Xeven Solutions), built with Next.js 14. The application allows users to book business consultations and student sessions, with AI chat functionality and intelligent triage system. The system provides separate booking flows for business clients and students, with integrated AI assistants (IrfanGPT and XevenGPT) and a comprehensive admin dashboard for managing appointments, slots, and user interactions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: Next.js 14 with App Router for file-based routing and server-side rendering
- **Styling**: Tailwind CSS 4 with CSS variables for theming and shadcn/ui component library (New York style) for consistent UI components
- **Type Safety**: TypeScript with strict mode for enhanced development experience
- **State Management**: React hooks and context for local state, with real-time subscriptions for live data updates
- **Form Handling**: React Hook Form with Zod validation for robust form validation and submission

## Backend Architecture
- **Database**: Supabase (PostgreSQL) for data persistence with real-time subscriptions
- **API Layer**: Supabase Edge Functions for serverless backend processing
- **Authentication**: Currently uses admin-level access patterns (no user authentication system)
- **Real-time Features**: Supabase real-time subscriptions for live updates in admin dashboard

## Key Features and Components
- **Dual Booking System**: Separate flows for business consultations (paid) and student sessions (free/paid)
- **AI Triage System**: Automated evaluation of free session requests using Edge Functions
- **Unified Calendar**: Shared calendar component supporting both business and student booking types
- **Admin Dashboard**: Comprehensive management interface with calendar view, request queue, chat management, and analytics
- **Meeting Management**: Automatic Zoom link generation and venue address assignment based on meeting type

## Data Storage Design
- **Appointments Table**: Core booking data with status tracking and meeting details
- **Time Slots Table**: Available booking slots with type classification (business/student/both)
- **Student Triage Log**: AI evaluation results for free session requests
- **Instant Messages**: Quick contact form submissions with admin reply functionality
- **Gallery Management**: Image storage and metadata for portfolio display

## External Dependencies

- **Supabase**: Primary database and backend services including Edge Functions for email notifications and AI triage processing
- **Vercel Analytics**: Application performance and usage analytics
- **Zoom Integration**: Programmatic meeting link generation for online sessions
- **Gmail SMTP**: Email delivery through Supabase Edge Functions for booking confirmations, reminders, and admin notifications
- **Radix UI**: Headless component primitives providing accessible UI foundations
- **Recharts**: Data visualization library for admin dashboard analytics and reporting
- **Lucide React**: Icon library for consistent visual elements throughout the application