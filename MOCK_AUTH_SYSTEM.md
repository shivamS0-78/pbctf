# Mock Auth System - Pure UI Implementation

## Overview
The application now uses a **pure UI mock authentication system** with **zero backend integration**. All authentication state is managed using React Context and localStorage.

## Architecture

### Mock Auth Provider (`hooks/useMockAuth.tsx`)
A React Context provider that manages authentication state using localStorage.

**Features:**
- ✅ User registration (stored in localStorage)
- ✅ User login with email/password validation
- ✅ Auto-login after registration
- ✅ Logout functionality
- ✅ Persistent sessions across page reloads
- ✅ Multiple users support (stored in localStorage as "database")

### Data Storage

**localStorage Keys:**
1. **`mockUser`**: Currently logged-in user (without password)
2. **`mockUsers`**: Array of all registered users (with passwords)

**User Object Structure:**
```typescript
{
  uid: string;           // Timestamp-based unique ID
  name: string;
  email: string;
  password: string;      // Only in mockUsers array
  phone?: string;
  age?: number;
  organisation?: string;
  bio?: string;
  github_link?: string;
  linkedin_link?: string;
  portfolio_link?: string;
  leetcode_profile?: string;
  kaggle_link?: string;
  devfolio_link?: string;
  resume_link?: string;
  profile_picture?: string;
  teamId?: string;
  isAdmin?: boolean;
  isLooking?: boolean;
}
```

## How It Works

### Registration Flow
1. User fills registration form at `/register`
2. Form data is validated client-side
3. `register()` function creates user object
4. User is added to `mockUsers` array in localStorage
5. User is automatically logged in
6. User data (without password) stored in `mockUser`
7. Redirect to `/dashboard`

### Login Flow
1. User enters email/password at `/login`
2. `login()` function searches `mockUsers` array
3. If email not found → Error: "User not found. Please register first."
4. If password doesn't match → Error: "Invalid password"
5. On success, user data stored in `mockUser`
6. Redirect to `/dashboard`

### Logout Flow
1. User clicks logout button
2. `logout()` removes `mockUser` from localStorage
3. User state set to null
4. Redirect to `/login`

### Session Persistence
1. On app load, `MockAuthProvider` checks for `mockUser` in localStorage
2. If found, automatically logs user in
3. User stays logged in across page refreshes

## API

### `useMockAuth()` Hook

Returns:
```typescript
{
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: FormData | object) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
```

### Methods

#### `register(formData)`
```typescript
await register(formData);
// Throws error if email already exists
// Auto-logs in user after registration
```

#### `login(email, password)`
```typescript
await login('user@example.com', 'password123');
// Throws error if user not found or password incorrect
```

#### `logout()`
```typescript
logout();
// Clears session immediately
```

#### `refreshUser()`
```typescript
await refreshUser();
// Reloads user data from localStorage
```

## Updated Components

All components now use `useMockAuth` instead of `useAuth`:

1. ✅ `components/registration/registration-container.tsx`
2. ✅ `app/login/page.tsx`
3. ✅ `components/registration/app-container.tsx`
4. ✅ `app/participants/page.tsx`
5. ✅ `app/layout.tsx` - Wrapped in `<MockAuthProvider>`

## Simulated Delays

To make it feel realistic:
- **Registration**: 1000ms delay
- **Login**: 500ms delay

These can be adjusted in `useMockAuth.tsx`.

## Error Handling

The mock system throws realistic errors:
- "User not found. Please register first."
- "Invalid password"
- "Email already registered"

## Testing

### Test Registration
1. Go to `/register`
2. Click "Auto-Fill (Debug)" (if DEBUG_MODE is on)
3. Click "Create Account"
4. Automatically logged in → redirected to `/dashboard`

### Test Login
1. Register a user first (or use debug auto-fill)
2. Go to `/login`
3. Use credentials: `testuser123@example.com` / `password123`
4. Click "Login"
5. Redirected to `/dashboard`

### Test Session Persistence
1. Login
2. Refresh page
3. Still logged in ✅

### Test Multiple Users
1. Register user A
2. Logout
3. Register user B
4. Logout
5. Login as user A
6. Both users exist in system ✅

## Inspecting Data

Open browser DevTools → Application → Local Storage:

**View all registered users:**
```javascript
JSON.parse(localStorage.getItem('mockUsers'))
```

**View current user:**
```javascript
JSON.parse(localStorage.getItem('mockUser'))
```

**Clear all data:**
```javascript
localStorage.clear()
```

## Advantages

✅ **No Backend Required**: Perfect for frontend development and demos
✅ **Instant Setup**: No API configuration needed
✅ **Realistic UX**: Includes delays and error handling
✅ **Persistent**: Sessions survive page refreshes
✅ **Multi-User**: Supports multiple registered users
✅ **Easy Migration**: When backend is ready, just swap `useMockAuth` → `useAuth`

## Future Migration to Real Backend

When ready to integrate with real backend:

1. Keep both `useAuth.ts` (real) and `useMockAuth.tsx` (mock)
2. Create a config flag:
```typescript
// config.ts
export const USE_MOCK_AUTH = false; // Toggle this
```

3. Create a wrapper:
```typescript
// hooks/useAppAuth.ts
import { USE_MOCK_AUTH } from '@/config';
import { useAuth } from './useAuth';
import { useMockAuth } from './useMockAuth';

export const useAppAuth = USE_MOCK_AUTH ? useMockAuth : useAuth;
```

4. Update imports:
```typescript
import { useAppAuth } from '@/hooks/useAppAuth';
const { user, login, register } = useAppAuth();
```

## Notes

- Passwords are stored in plain text in localStorage (mock only!)
- This is for **development and demo purposes only**
- Do not use this in production
- All data is stored client-side only
- Clearing browser data will log user out

**The app is now 100% UI-focused with zero backend dependencies!** 🎉

