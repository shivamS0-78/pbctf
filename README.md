# 🚀 Zenith - Production Ready

## ✅ Status: PRODUCTION MODE

All mock code **completely removed**. Application uses **real backend APIs only**.

---

## 🔧 Backend Configuration

Create/edit `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

For production:
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

---

## 🌐 API Endpoints

Configured in `/lib/api-config.ts`:

- `POST /api/registration` - Register user
- `POST /api/auth/login` - Login  
- `GET /api/users/:userId` - Get user details
- `PUT /api/users/:userId` - Update user profile
- `POST /api/teams` - Create team
- `POST /api/teams/join` - Join team
- `POST /api/teams/:teamId/submission` - Submit project

Full documentation: [Notion API Docs](https://www.notion.so/Zenith-Event-Management-System-API-Documentation-2d481956342f80cb8ccbf196e427de6c)

---

## 🏃 Run

```bash
npm run dev
```

Visit: http://localhost:3000

---

## ✅ Production Checklist

- ✅ Mock code deleted
- ✅ Real API integration active
- ✅ Token authentication enabled
- ✅ FormData file uploads
- ✅ Error handling
- ✅ Debug features disabled

---

## 🐛 Troubleshooting

### Failed to fetch
- Backend not running
- Wrong URL in `.env.local`
- CORS not enabled on backend

### 401 Unauthorized
- Token invalid/expired
- Backend token validation issues

---

**Ready for deployment!** 🎉
