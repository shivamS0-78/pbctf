# Firebase Authentication & Token Management

## Overview

The application uses **Firebase Authentication** for secure user management. Firebase automatically handles token refresh on the client-side, eliminating the need for custom refresh endpoints.

## How It Works

### 1. **Firebase Client SDK** (`lib/firebase-client.ts`)

Manages all client-side authentication:

```typescript
import { getAuthToken } from '@/lib/firebase-client';

// Get current auth token (automatically refreshed by Firebase)
const token = await getAuthToken();
```

### 2. **Automatic Token Refresh**

Firebase SDK automatically refreshes expired tokens:

```typescript
// Firebase handles this internally
const token = await user.getIdToken(true); // Force refresh if needed
```

**Benefits:**
- ✅ No custom refresh endpoint needed
- ✅ Automatic background refresh
- ✅ Handles all edge cases (network errors, expiration, etc.)
- ✅ Industry-standard security

### 3. **Authentication Flow**

```
1. User logs in via /api/user/login
   ↓
2. Backend validates credentials with Firebase Admin SDK
   ↓
3. Returns Firebase token + user data
   ↓
4. Frontend stores Firebase user session
   ↓
5. Firebase SDK automatically manages token lifecycle
   ↓
6. All API calls use getAuthToken() for current valid token
```

### 4. **Making Authenticated API Calls**

```typescript
import { useAuth } from '@/hooks/useAuth';
import { API_ENDPOINTS } from '@/lib/api-config';

function MyComponent() {
  const { getToken } = useAuth();

  const fetchData = async () => {
    // Get token (automatically refreshed by Firebase if expired)
    const token = await getToken();
    
    const response = await fetch(API_ENDPOINTS.userProfile, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    // Handle response...
  };

  return (
    // Component JSX...
  );
}
```

## API Response Structures

### User Profile Response

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "uid": "firebase_uid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "resume_link": "https://res.cloudinary.com/...",
    "profile_picture": null,
    "github_link": "https://github.com/johndoe",
    "linkedin_link": "https://linkedin.com/in/johndoe",
    "bio": "Test bio",
    "age": 25,
    "organisation": "Test Org",
    "role": "user",
    "isLooking": false,
    "teamCode": "ZN7K4X"
  },
  "timestamp": "2024-12-28T11:32:38.391Z"
}
```

### Team Response

```json
{
  "success": true,
  "data": {
    "teamCode": "ZN7K4X",
    "teamName": "Code Warriors",
    "teamLead": "user_uid",
    "teamMembers": [...],
    "memberCount": 3,
    "appliedFor": {...},
    "teamStatus": "submitted",
    "isEvaluated": false
  }
}
```

## Error Handling

### Token Expired (401)

```json
{
  "success": false,
  "message": "Authentication token has expired",
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Authentication token has expired"
  },
  "timestamp": "2025-12-28T11:32:38.391Z"
}
```

**Solution:** Call `getToken()` again - Firebase will automatically refresh it.

### Invalid Token (401)

```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID",
    "message": "Invalid authentication token"
  }
}
```

**Solution:** User must log in again.

## Environment Variables Required

```env
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (for backend)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Best Practices

1. **Always use `getToken()`** before API calls
2. **Don't store tokens manually** - let Firebase SDK handle it
3. **Check for null tokens** - means user needs to log in
4. **Handle 401 errors gracefully** - redirect to login

## Comparison: Custom vs Firebase Token Refresh

| Feature | Custom Implementation | Firebase SDK |
|---------|----------------------|--------------|
| Token Refresh | Manual endpoint needed | ✅ Automatic |
| Security | Must implement yourself | ✅ Battle-tested |
| Edge Cases | Must handle all manually | ✅ Handled |
| Maintenance | High | ✅ Low |
| Reliability | Depends on implementation | ✅ Industry standard |

## Migration Checklist

- [x] Removed custom `/api/auth/refresh` endpoint
- [x] Removed custom `api-client.ts` wrapper
- [x] Added Firebase client SDK configuration
- [x] Updated `useAuth` to use Firebase tokens
- [x] Updated dashboard to use `getToken()`
- [ ] Update profile-container.tsx
- [ ] Update team-container.tsx
- [ ] Update submission-container.tsx
- [ ] Update other components making authenticated calls

