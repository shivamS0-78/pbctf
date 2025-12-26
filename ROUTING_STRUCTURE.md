# Zenith Application Routing Structure

## Overview
The application now has a clean, logical routing structure that follows best practices.

## Routes

### Public Routes (No Authentication Required)

#### `/` (Home Page)
- **File**: `app/page.tsx`
- **Purpose**: Landing page that redirects to `/register`
- **Behavior**: Automatically redirects users to the registration page

#### `/login`
- **File**: `app/login/page.tsx`
- **Purpose**: User login page
- **Features**:
  - Email and password authentication
  - Sticky error alerts
  - Redirects to `/dashboard` on successful login
  - Link to registration page

#### `/register`
- **File**: `app/register/page.tsx`
- **Purpose**: User registration page
- **Features**:
  - Complete registration form with personal details, resume upload, social links
  - Client-side validation with inline error messages
  - Sticky success/error alerts
  - Automatically logs user in after successful registration
  - Redirects to `/dashboard` after registration
  - Link to login page

### Protected Routes (Authentication Required)

#### `/dashboard`
- **File**: `app/dashboard/page.tsx`
- **Purpose**: Main authenticated user dashboard
- **Features**:
  - Profile completeness indicator
  - Team status overview
  - Quick actions
  - Navigation to profile, team, and submission views
- **Access**: Requires authentication, redirects to `/login` if not authenticated

#### `/participants` (Legacy)
- **File**: `app/participants/page.tsx`
- **Purpose**: Legacy route that redirects to proper routes
- **Behavior**:
  - If authenticated: redirects to `/dashboard`
  - If not authenticated: redirects to `/login`
- **Note**: This route exists for backward compatibility

## Application Flow

### New User Journey
1. User visits `/` → redirects to `/register`
2. User fills out registration form
3. On successful registration:
   - User is automatically logged in
   - Sticky success alert appears
   - User is redirected to `/dashboard`
4. User sees their dashboard with profile and team status

### Returning User Journey
1. User visits `/login`
2. User enters credentials
3. On successful login:
   - User is redirected to `/dashboard`
4. User sees their dashboard

### Logout Flow
1. User clicks logout from navbar
2. User is redirected to `/login`
3. Success message displayed

## Components Structure

### Navigation
- **NavBar**: Displays logo and logout button (when authenticated)
- **Logo**: Uses Figma asset (`/images/pblogo-nobg.webp`)

### Alert System
- **StickyAlert**: Fixed position alert at top of page
  - Auto-dismisses after 5 seconds
  - User can manually close
  - Stays visible even when scrolling
  - Better UX than inline alerts

### Container Components (Business Logic)
- **AppContainer**: Main app wrapper, manages authentication state and view routing
- **RegistrationContainer**: Handles registration form logic and API calls
- **DashboardContainer**: Manages dashboard data and navigation
- **ProfileContainer**: Handles profile editing
- **TeamContainer**: Manages team creation/joining
- **SubmissionContainer**: Handles project submissions

### UI Components (Presentation)
- **FormInput**: Reusable input with error handling
- **FormTextarea**: Reusable textarea
- **FormSelect**: Reusable select dropdown
- **FormFileUpload**: File upload with drag-and-drop
- **FormSection**: Glassmorphic section wrapper
- **Button**: Styled button with variants (primary, secondary, danger)
- **StatusBadge**: Colored status indicators
- **DotPattern**: Background pattern

## Design System

### Colors (CSS Variables)
- `--background`: #171717 (dark background)
- `--foreground`: #fcfcfc (white text)
- `--primary`: #ff4d00 (orange accent)
- `--glass-bg`: rgba(138,138,138,0.2) (glassmorphism)
- `--glass-border`: rgba(255,255,255,0.38)

### Typography
- **Heading Font**: Instrument Serif (Google Font)
- **Body Font**: Google Sans Flex (Google Font)
- Applied via CSS variables: `var(--font-heading)`, `var(--font-body)`

### Visual Effects
- Glassmorphism with backdrop blur
- Subtle shadows and borders
- Smooth transitions
- Radial gradient backgrounds

## API Integration

### Registration API
- **Endpoint**: `/api/registration`
- **Method**: POST
- **Data**: FormData with multipart file uploads
- **Response**: User object with UID and authentication token
- **Integration**: `useAuth` hook's `register()` function automatically logs user in

### Login API
- **Endpoint**: `/api/auth/login`
- **Method**: POST
- **Data**: JSON with email and password
- **Response**: User object and token
- **Integration**: `useAuth` hook's `login()` function

## Authentication State Management

### useAuth Hook
- Manages global authentication state
- Provides: `user`, `isAuthenticated`, `isLoading`, `login()`, `register()`, `logout()`
- Stores auth data in local storage
- Auto-refreshes on app load

## Error Handling

### Registration Errors
- Inline field validation (red border + error text below field)
- Sticky alert for API errors
- Clear error messages

### Login Errors
- Sticky alert for authentication failures
- Network error handling

### Best Practices
- Errors appear at top of page (fixed position)
- Auto-dismiss after 5 seconds
- User can manually close
- Clear, user-friendly messages

