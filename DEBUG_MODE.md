# Debug Mode Instructions

## Overview
Debug mode has been added to both the Login and Registration pages to speed up testing.

## Features

### Registration Page (`/register`)
- **Auto-Fill Button**: Click the "Auto-Fill (Debug)" button to populate the entire registration form with test data
- **Test Data Includes**:
  - Random user with unique email (e.g., `testuser123@example.com`)
  - Pre-filled password: `password123`
  - Phone number, age, organization
  - Sample bio about being a developer
  - Social links (GitHub, LinkedIn, Portfolio, LeetCode, Kaggle, Devfolio)
  - Referral code: `TEST2024`
  - Dummy PDF resume file (automatically created)

### Login Page (`/login`)
- **Auto-Fill Button**: Click the "Auto-Fill (Debug)" button to fill in test credentials
- **Test Credentials**:
  - Email: `testuser@example.com`
  - Password: `password123`

## Visual Indicators

When debug mode is active, you'll see:
1. **"Auto-Fill (Debug)" button** with a lightning bolt (⚡) icon
2. **Orange warning banner** stating "Debug Mode Active" with instructions

## Disabling Debug Mode for Production

### IMPORTANT: Before deploying to production, you MUST disable debug mode!

**Step 1: Registration Page**
```typescript
// File: /Users/rudraksha/proj/Zenith/components/registration/registration-container.tsx
// Line ~16

// Change this:
const DEBUG_MODE = true;

// To this:
const DEBUG_MODE = false;
```

**Step 2: Login Page**
```typescript
// File: /Users/rudraksha/proj/Zenith/app/login/page.tsx
// Line ~14

// Change this:
const DEBUG_MODE = true;

// To this:
const DEBUG_MODE = false;
```

## What Happens When Debug Mode is Disabled?

When `DEBUG_MODE = false`:
- ✅ The "Auto-Fill (Debug)" button is hidden
- ✅ The orange warning banner is hidden
- ✅ The auto-fill function is still in the code but not accessible to users
- ✅ The page looks exactly as it should in production

## Usage

### Testing Registration Flow
1. Go to `/register`
2. Click "Auto-Fill (Debug)" button
3. Form is instantly populated with valid test data
4. Click "Create Account"
5. You'll be logged in and redirected to `/dashboard`

### Testing Login Flow
1. Go to `/login`
2. Click "Auto-Fill (Debug)" button
3. Credentials are instantly filled
4. Click "Login"
5. You'll be redirected to `/dashboard`

## Benefits

✅ **Faster Testing**: No need to manually type form data repeatedly
✅ **Consistent Test Data**: Same format every time for reliable testing
✅ **Easy to Disable**: Just flip one boolean flag per file
✅ **Visual Warning**: Orange banner reminds you that debug mode is on
✅ **No Production Impact**: When disabled, leaves no trace in the UI

## Checklist Before Production Deployment

- [ ] Set `DEBUG_MODE = false` in `components/registration/registration-container.tsx`
- [ ] Set `DEBUG_MODE = false` in `app/login/page.tsx`
- [ ] Verify no "Auto-Fill (Debug)" buttons are visible
- [ ] Verify no orange warning banners are visible
- [ ] Test that registration still works with manual input
- [ ] Test that login still works with manual input

## Note

The debug mode only affects the **frontend**. The backend API validation and security remain unchanged. This is purely a convenience feature for development and testing.

