# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an appointment booking portal for Irfan Malik (CEO of Xeven Solutions), built with Next.js 14. The application allows users to book business consultations and student sessions, with AI chat integration and an admin dashboard.

## Commands

### Development
- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run Next.js linting

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS 4 with CSS variables
- **UI Components**: Radix UI primitives + shadcn/ui (New York style)
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React

### Directory Structure

#### `/app` - Next.js App Router pages
- `/admin` - Admin dashboard with calendar, chat, gallery, requests, settings, slots, tools, and triage
- `/business` - Business consultation booking flow
- `/student` - Student session booking flow
- `/chat/irfan` - IrfanGPT chat interface
- `/chat/xeven` - XevenGPT chat interface
- `/gallery` - Photo gallery
- `/legal` - Privacy policy, refund policy, terms of service
- `/thanks` - Thank you page after booking

#### `/components` - React components organized by feature
- `/admin/*` - Admin dashboard components (sidebar, calendar, chat, etc.)
- `/business/*` - Business consultation components (calendar, checkout, options)
- `/student/*` - Student session components (calendar, checkout, options)
- `/chat/*` - Chat interfaces (floating widget, main interface)
- `/ui/*` - Reusable UI components from shadcn/ui

#### `/lib` - Utility functions
- `utils.ts` - Contains `cn()` function for className merging using clsx and tailwind-merge

#### `/hooks` - Custom React hooks
- `use-mobile.ts` - Mobile device detection
- `use-toast.ts` - Toast notifications

### Key Patterns

1. **Path Aliases**: Use `@/` prefix for imports (configured in tsconfig.json and components.json)
   - `@/components` for components
   - `@/lib/utils` for utilities
   - `@/hooks` for hooks

2. **Styling**:
   - Use `cn()` utility from `@/lib/utils` to merge Tailwind classes
   - CSS variables defined in `app/globals.css` for theming
   - Custom heading font class: `heading-font` uses Fraunces font
   - Custom button classes: `btn-hero`, `btn-primary`, `btn-secondary`

3. **Client Components**: Most interactive components use `"use client"` directive

4. **Form Validation**: React Hook Form + Zod for type-safe form validation

5. **User Types**: The app handles three main user types:
   - Business consultations (paid/free sessions)
   - Student sessions (paid/free sessions)
   - In-person meetings

6. **Admin Features**: Comprehensive dashboard with analytics, calendar management, chat history, photo gallery, and session triage