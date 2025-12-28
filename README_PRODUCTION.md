# 🚀 PRODUCTION BUILD - Real APIs Only

## ✅ Configuration

**Mode:** PRODUCTION  
**Mock Code:** COMPLETELY REMOVED  
**APIs:** Real backend endpoints only  
**Debug Features:** Disabled

---

## 📡 Backend Configuration

Set your backend URL in `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

For production deployment:
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

---

## 🌐 API Endpoints

All endpoints configured in `/lib/api-config.ts`:

```
POST /api/registration          → Register user
POST /api/auth/login            → Login
GET  /api/users/:userId         → Get user
PUT  /api/users/:userId         → Update user
POST /api/teams                 → Create team
POST /api/teams/join            → Join team
POST /api/teams/:id/submission  → Submit project
```

Full API docs: [Notion Documentation](https://www.notion.so/Zenith-Event-Management-System-API-Documentation-2d481956342f80cb8ccbf196e427de6c)

---

## 🔧 Run Application

```bash
npm run dev
```

Visit: http://localhost:3000

---

## ✅ Production Ready

- ✅ All mock code removed
- ✅ Real API integration active
- ✅ Token-based authentication
- ✅ FormData file uploads
- ✅ Error handling
- ✅ No debug features

---

## 🐛 Troubleshooting

### Connection Issues
1. Verify backend is running
2. Check `.env.local` URL
3. Enable CORS on backend
4. Restart dev server after changing `.env.local`

### Token Issues
- Tokens stored in localStorage
- Auto-added to Authorization headers
- Check backend token validation

---

**Ready for production deployment!** 🎉

