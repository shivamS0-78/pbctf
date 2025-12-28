# ✅ CORRECTED - Next.js API Routes

The backend APIs are **Next.js API routes** in `/app/api/` - they run in the **same application**!

No external backend needed. Everything works out of the box.

## API Routes Location

```
/app/api/
  ├── auth/login/          → POST /api/auth/login
  ├── registration/        → POST /api/registration
  ├── users/[id]/         → GET/PUT /api/users/:id
  ├── team/               → Team endpoints
  ├── admin/              → Admin endpoints
  └── evaluator/          → Evaluator endpoints
```

## Configuration

All APIs use **relative paths** (no base URL needed):
- ✅ `/api/registration`
- ✅ `/api/auth/login`
- ✅ `/api/users/:id`

## Run Application

```bash
npm run dev
```

That's it! Frontend and backend run together on `http://localhost:3000`

No separate backend server needed! 🎉
