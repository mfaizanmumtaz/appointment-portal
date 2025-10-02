# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an appointment booking portal for Irfan Malik (CEO of Xeven Solutions), built with Next.js 14. The application allows users to book business consultations and student sessions with AI-powered triage, includes AI chat integration (IrfanGPT and XevenGPT), event invitation management, instant messaging, and a comprehensive admin dashboard.

## Commands

### Development
- `npm run dev` - Start development server (http://0.0.0.0:5000)
- `npm run build` - Build for production
- `npm start` - Start production server (http://0.0.0.0:5000)
- `npm run lint` - Run Next.js linting

### Supabase
- `npx supabase functions deploy [function-name]` - Deploy edge function
- `npx supabase secrets set KEY="value"` - Set environment secret

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript with strict mode
- **Database**: Supabase (PostgreSQL)
- **Email**: Supabase Edge Functions with Resend API
- **Styling**: Tailwind CSS 4 with CSS variables
- **UI Components**: Radix UI primitives + shadcn/ui (New York style)
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Fonts**: Geist (body), Fraunces (headings)

### Directory Structure

#### `/app` - Next.js App Router pages
- `/admin` - Admin dashboard (protected route)
- `/business` - Business consultation booking flow
- `/student` - Student session booking flow with AI triage
- `/chat/irfan` - IrfanGPT chat interface
- `/chat/xeven` - XevenGPT chat interface
- `/gallery` - Photo gallery
- `/legal` - Privacy policy, refund policy, terms of service
- `/thanks` - Thank you page after booking
- `page.tsx` - Homepage with quick message and event invitation forms

#### `/components` - React components organized by feature

##### `/admin/*` - Admin dashboard components
- `admin-sidebar.tsx` - Collapsible navigation sidebar
- `admin-dashboard.tsx` - Analytics and statistics overview
- `admin-calendar.tsx` - Calendar view of all appointments
- `admin-slots.tsx` - Time slot management with bulk creation
- `admin-requests.tsx` - Appointment request management (approve/decline)
- `admin-settings.tsx` - Application settings and configuration
- `admin-chat.tsx` - Chat history viewer
- `admin-gallery.tsx` - Photo gallery manager
- `admin-tools.tsx` - Utility tools (instant messages, etc.)
- `admin-triage.tsx` - Student triage log viewer
- `admin-locations.tsx` - Location management for in-person meetings
- `admin-events.tsx` - Event invitation management

##### `/business/*` - Business consultation components
- `calendar.tsx` - Available slot picker for business sessions
- `checkout.tsx` - Booking confirmation and payment
- `consultation-options.tsx` - Meeting mode and duration selector

##### `/student/*` - Student session components
- `student-calendar.tsx` - Available slot picker for student sessions
- `student-checkout.tsx` - Booking confirmation
- `student-options.tsx` - Session type selector (online free/paid, in-person)

##### `/chat/*` - Chat interfaces
- `floating-chat-widget.tsx` - Floating chat button and widget
- `chat-interface.tsx` - Main chat interface component

##### `/shared/*` - Shared components
- `unified-calendar.tsx` - Reusable calendar component
- `unified-checkout.tsx` - Reusable checkout component

##### `/ui/*` - Reusable UI components (shadcn/ui)
- Standard shadcn/ui components (button, card, dialog, etc.)
- `meeting-details.tsx` - Meeting information display
- `offline-status.tsx` - Offline/online status indicators
- `footer.tsx` - Application footer

#### `/lib` - Utility functions and configurations

##### Core utilities
- `utils.ts` - Contains `cn()` function for className merging (clsx + tailwind-merge)
- `supabase.ts` - Supabase client configuration

##### Business logic utilities
- `meeting-utils.ts` - Meeting booking utilities, Zoom link generation, email orchestration
- `calendar-utils.ts` - Calendar data fetching, date/time formatting
- `venue-config.ts` - Location management for in-person meetings
- `message-utils.ts` - Instant message handling
- `ai-triage-utils.ts` - Student triage AI logic and evaluation
- `event-utils.ts` - Event invitation management

##### `/lib/types/*` - TypeScript type definitions
- `database.ts` - Complete Supabase database types, including:
  - `Appointment`, `TimeSlot`, `GalleryImage`, `AdminSetting`
  - `InstantMessage`, `StudentTriageLog`, `Location`, `EventInvitation`
  - Type unions: `AppointmentType`, `SessionType`, `MeetingType`, etc.

#### `/hooks` - Custom React hooks
- `use-mobile.ts` - Mobile device detection
- `use-toast.ts` - Toast notification system
- `use-offline.ts` - Offline/online status detection
- `use-admin-counts.ts` - Real-time admin dashboard counts

#### `/supabase` - Backend configuration

##### `/supabase/functions/*` - Edge Functions
- `send-booking-email/` - Sends all booking emails via Resend API
- `send-chat-reply/` - AI chat response handler
- `ai-triage-student/` - AI-powered student session triage

##### `/supabase/migrations/*` - Database migrations
- `20250929_add_locations_table.sql` - Locations table for venues
- `20250929_add_meeting_mode_duration_to_time_slots.sql` - Enhanced slot metadata
- `20250930_add_event_invitations_table.sql` - Event invitations table

##### Database schema
- `supabase-schema.sql` - Complete database schema with tables, indexes, RLS policies

### Key Patterns

#### 1. Path Aliases
Use `@/` prefix for all imports (configured in tsconfig.json and components.json):
```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
```

#### 2. Styling
- **Utility function**: Use `cn()` from `@/lib/utils` to merge Tailwind classes
- **CSS variables**: Defined in `app/globals.css` for theming
- **Custom font classes**:
  - `heading-font` - Fraunces font for headings
  - Body text uses Geist font family
- **Custom button classes**: `btn-hero`, `btn-primary`, `btn-secondary`

#### 3. Client Components
Most interactive components use `"use client"` directive at the top

#### 4. Form Validation
React Hook Form + Zod for type-safe form validation

#### 5. Database Access
```typescript
import { supabase } from "@/lib/supabase"

// Fetch with RLS
const { data, error } = await supabase
  .from('appointments')
  .select('*')
  .eq('status', 'pending')
```

#### 6. Offline Support
Use `useOffline()` hook for offline status and error handling:
```typescript
const { isOnline, error, lastUpdated, refresh } = useOffline()
```

### Application Features

#### User Flows

##### Business Consultation Booking
1. **Meeting Overview** - Choose meeting mode (online/in-person) and duration (15/30/60 min)
2. **Calendar** - Select available slot
3. **Contact Info** - Provide details and purpose
4. **Payment/Confirmation** - Complete booking (auto-confirms paid, pending for free)

##### Student Session Booking
1. **Form** - Basic information and purpose
2. **AI Triage** - AI evaluates request (approve/decline/uncertain)
3. **Options** - Choose session type (online free/paid, in-person)
4. **Calendar** - Select available slot
5. **Checkout** - Complete booking

##### Event Invitation Submission
- Form on homepage to submit event speaking invitations
- Fields: event title, organizer, date/time, venue, audience size, travel expenses
- Optional file attachment support
- Admin reviews and approves/declines in admin dashboard

##### Instant Messaging
- Quick message form on homepage
- Messages appear in admin tools section
- Admin can reply directly from dashboard

#### Admin Dashboard Features

1. **Dashboard** - Analytics with charts:
   - Total appointments over time
   - Appointments by type (business/student/in-person)
   - Session type distribution (free/paid)
   - Real-time counts: pending appointments, unread messages, pending events

2. **Calendar** - Visual calendar view of all appointments

3. **Slots** - Time slot management:
   - Create single slots with meeting mode, duration, location
   - Bulk slot creation with date ranges and time patterns
   - View/edit/delete existing slots
   - Filter by type and availability

4. **Requests** - Appointment management:
   - Approve/decline free session requests
   - Add meeting URLs or venue addresses
   - Send confirmation/decline emails
   - Cancel bookings

5. **Settings** - Configure:
   - Pricing for different session types
   - Availability hours by day
   - Buffer times between sessions
   - Notification preferences
   - Email templates

6. **Chat** - View chat history from IrfanGPT/XevenGPT

7. **Gallery** - Manage photo gallery images

8. **Tools** - Access instant messages and other utilities

9. **Triage** - Review student triage decisions:
   - AI confidence scores
   - Approval/decline reasoning
   - Manual review overrides

10. **Locations** - Manage in-person meeting venues

11. **Events** - Review and manage event invitations

### Database Schema

#### Core Tables

**appointments**
- Stores all booking records
- Fields: type, session_type, name, email, phone, company, date, time, status
- Meeting details: meeting_type, meeting_url, venue_address, meeting_notes, purpose
- Foreign key: slot_id → time_slots(id)

**time_slots**
- Available booking slots
- Fields: date, time, is_available, slot_type, session_type
- Enhanced fields: meeting_mode, duration, location_id
- Unique constraint on (date, time, slot_type, session_type, meeting_mode, duration, location_id)

**locations**
- Physical meeting locations
- Fields: name (unique)

**event_invitations**
- Event speaking invitations
- Fields: event_title, organiser_name, event_date, event_time, venue
- Additional: audience_size, travel_expenses, event_details, attachment_url
- Status tracking: status, rejection_reason, admin_notes, confirmed_at, rejected_at

**instant_messages**
- Quick messages from users
- Fields: name, email, phone, message, status
- Admin response: admin_reply, replied_at

**student_triage_log**
- AI triage decisions for student requests
- AI fields: ai_decision, ai_reasoning, ai_confidence
- Manual review: manual_review, manual_decision, manual_notes, reviewed_by, reviewed_at

**gallery_images**
- Photo gallery management
- Fields: url, title, description, order

**admin_settings**
- Application configuration
- JSONB key-value storage

#### Indexes
Optimized indexes on frequently queried fields:
- appointments: date, status, slot_id
- time_slots: date, location_id, is_available
- locations: name
- instant_messages: status, created_at
- student_triage_log: ai_decision, created_at, student_email

#### Row Level Security (RLS)
- Public can: view available slots, create appointments, create messages, create triage logs
- Admin: full access to all tables (adjust auth based on your setup)

## Email Configuration

The application uses Supabase Edge Functions to send all emails through the Resend API.

### Setup Requirements

1. **Resend API Key**: Get your API key from [Resend dashboard](https://resend.com)
2. **Supabase Secrets**: Set environment variables:
   ```bash
   npx supabase secrets set RESEND_API_KEY="re_..."
   npx supabase secrets set CEO_EMAIL="irfan@xevensolutions.com"
   ```

3. **Deploy Edge Function**:
   ```bash
   npx supabase functions deploy send-booking-email
   ```

### Email Function Details
- **Location**: `supabase/functions/send-booking-email/index.ts`
- **Method**: Resend API via HTTPS
- **Templates**: Built-in HTML email templates for different scenarios
- **Integration**: Called from `lib/meeting-utils.ts` wrapper functions

### Email Types Supported
1. **Booking Confirmations** - Client and admin notifications for new bookings
2. **Free Session Approvals** - CEO approval confirmations with meeting details
3. **Free Session Declines** - Alternative options when free sessions are declined
4. **Meeting Cancellations** - Cancellation notifications with rebooking options

### Email Wrapper Functions (in `lib/meeting-utils.ts`)
- `sendBookingEmails()` - Send client and admin booking confirmations
- `sendApprovalEmail()` - Send free session approval with meeting details
- `sendDeclineEmail()` - Send free session decline notification
- `sendCancellationEmail()` - Send cancellation notification
- `sendBusinessBookingNotifications()` - Business-specific booking emails
- `sendStudentBookingNotifications()` - Student-specific booking emails

### Troubleshooting
- Ensure Resend API key is valid and has sending permissions
- Check Supabase function logs: `npx supabase functions logs send-booking-email`
- Verify environment variables are set in Supabase (not local .env files)
- Test email function directly: `npx supabase functions invoke send-booking-email --body '{...}'`

## Environment Variables

### Local Development (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Secrets (for Edge Functions)
```bash
RESEND_API_KEY=your_resend_api_key
CEO_EMAIL=ceo@company.com
OPENAI_API_KEY=your_openai_key  # For AI triage
```

## AI Features

### Student Triage System
- **Purpose**: Automatically evaluate student session requests
- **AI Model**: GPT-4 via OpenAI API
- **Logic**: Located in `lib/ai-triage-utils.ts`
- **Edge Function**: `supabase/functions/ai-triage-student/`
- **Decisions**: approved, declined, uncertain (manual review)
- **Confidence Score**: 0.0 to 1.0
- **Logging**: All decisions stored in `student_triage_log` table

### Chat Interfaces
- **IrfanGPT**: Personal AI assistant for Irfan Malik
- **XevenGPT**: Company AI assistant for Xeven Solutions
- **Edge Function**: `supabase/functions/send-chat-reply/`
- **Storage**: Messages stored in `instant_messages` or separate chat tables

## Best Practices

### When Adding New Features
1. Add types to `lib/types/database.ts`
2. Create utility functions in appropriate `lib/*.ts` file
3. Build reusable components in `/components/ui/*` or `/components/shared/*`
4. Use existing patterns for database queries and error handling
5. Implement offline support with `useOffline()` hook
6. Add proper loading states and error boundaries

### When Modifying Database
1. Update `supabase-schema.sql` for new tables/columns
2. Create migration file in `supabase/migrations/`
3. Update TypeScript types in `lib/types/database.ts`
4. Update RLS policies for appropriate access control

### When Working with Forms
1. Use React Hook Form with Zod validation
2. Show loading states during submission
3. Display toast notifications for success/error
4. Clear form after successful submission
5. Handle offline scenarios gracefully

### When Sending Emails
1. Always use the edge function via `lib/meeting-utils.ts` wrappers
2. Include both client and admin notifications where appropriate
3. Provide clear subject lines and actionable content
4. Test email templates in both HTML and plain text

## Common Tasks

### Add a new admin page
1. Create component in `components/admin/`
2. Add route to sidebar in `components/admin/admin-sidebar.tsx`
3. Update admin counts hook if needed

### Add a new email template
1. Add template type to edge function in `supabase/functions/send-booking-email/`
2. Create wrapper function in `lib/meeting-utils.ts`
3. Call wrapper from appropriate booking flow

### Add a new location
1. Use admin dashboard → Locations
2. Or insert directly: `INSERT INTO locations (name) VALUES ('New Location')`

### Create time slots programmatically
1. Use admin dashboard → Slots → Bulk Creation
2. Or use `lib/calendar-utils.ts` helpers

## Deployment

### Vercel (Frontend)
1. Connect GitHub repository
2. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy main branch

### Supabase (Backend)
1. Deploy edge functions: `npx supabase functions deploy`
2. Set secrets: `npx supabase secrets set`
3. Run migrations: Apply via Supabase dashboard or CLI

## Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Resend API](https://resend.com/docs)

## Notes for Claude Code

- Always use TypeScript with strict type checking
- Prefer composition over prop drilling (use context when needed)
- Keep components focused and reusable
- Follow existing naming conventions (kebab-case for files, PascalCase for components)
- Use the `cn()` utility for conditional className logic
- Implement proper error handling with try-catch and user feedback
- Test offline scenarios for critical flows
- Ensure all database queries include proper error handling
- Use existing UI components before creating new ones
- Keep business logic in utility files, not components
- Document complex logic with inline comments
