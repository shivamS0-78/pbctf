# Contributing to Zenith Event Management System

This document describes how to contribute to the **Zenith Event Management System**, including backend APIs, authentication, business logic, database design, and evaluation workflows.

Contributions may include backend features, API improvements, documentation, tests, performance fixes, or security hardening.

---

## Table of Contents

1. Overview  
2. System Architecture  
3. Authentication  
4. Core Features  
5. API Endpoints  
6. Database Schemas  
7. Business Logic  
8. Error Handling  
9. Implementation Checklist  

---

## Overview

The Zenith Event Management System is a comprehensive platform for managing hackathons or competitions with three primary components:

- **Main Website**: Participant registration, team formation, and submission
- **Admin Portal**: Participant, team, and evaluator management
- **Evaluator Portal**: Team evaluation and scoring

### Key Capabilities

- Individual and team registration
- Dynamic team formation with unique team codes
- Team discovery and matchmaking
- Submission handling (YouTube video + PDF)
- Multi-stage evaluation workflow
- RSVP confirmation for shortlisted teams

---

## System Architecture

### Technology Stack

- Backend: Node.js with Express
- Database: MongoDB
- Authentication: Firebase Authentication
- File Storage: Cloudinary
- Video Hosting: YouTube (validated links only)

### Important Configuration

- Submission deadline enforced globally
- RSVP requires confirmation from all team members

### User Roles

- Participant
- Admin
- Evaluator

---

## Authentication

All endpoints except registration and login require a Firebase authentication token.

```
Authorization: Bearer <firebase_token>
```

### Authentication Flow

1. User registers with Firebase
2. User data is stored in MongoDB
3. Token is verified on every request
4. Role-based access control is enforced

### Authentication Middleware (Pseudo-code)

```js
async function authenticateUser(req, res, next) {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'AUTH_REQUIRED' });

    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ uid: decodedToken.uid });
    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'AUTH_INVALID' });
  }
}
```

---

## Role-Based Access Control

### Authorization Helpers

- `requireAdmin`
- `requireEvaluator`
- `requireTeamLead`
- `requireTeamMember`

These middlewares enforce strict access control for every protected endpoint.

---

## Core Features

### Admin Portal

- View and filter participants
- Manage teams and evaluators
- Assign evaluators
- Finalize selections
- Export data

### Participant Features

- Profile management
- Team creation and joining
- Submission uploads
- RSVP confirmation

### Evaluator Features

- View assigned teams
- Review submissions
- Submit and update evaluations

---

## API Endpoints

### Base URL

```
https://api.zenith.example.com/v1
```

### Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "error": null,
  "timestamp": "ISO-8601"
}
```

---

## Database Schemas

### Users Collection

```js
{
  uid: String,
  email: String,
  name: String,
  phone: String,
  age: Number,
  organisation: String,
  bio: String,
  isLooking: Boolean,
  teamCode: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Teams Collection

```js
{
  teamCode: String,
  teamName: String,
  teamLead: String,
  teamMembers: [],
  teamStatus: String,
  appliedFor: String,
  isEvaluated: Boolean,
  isShortlisted: Boolean,
  scores: {},
  createdAt: Date
}
```

### Evaluators Collection

```js
{
  uid: String,
  email: String,
  assignedTeams: [],
  stats: {}
}
```

### Problem Statements Collection

```js
{
  title: String,
  description: String,
  isActive: Boolean,
  teamCount: Number
}
```

---

## Business Logic

### Team Code Generation

```js
function generateTeamCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const len = Math.floor(Math.random() * 3) + 6;
  return Array.from({ length: len }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}
```

### Score Calculation

```js
function calculateTotalScore({ tech, ux, presentation }) {
  return tech + ux + presentation;
}
```

### YouTube URL Validation

```js
function validateYouTubeURL(url) {
  return /youtube\.com\/watch\?v=|youtu\.be\//.test(url);
}
```

---

## Error Handling

### Standard Error Format

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Optional details"
  },
  "timestamp": "ISO-8601"
}
```

---

## Contribution Guidelines

- Keep PRs focused and small
- Add tests for new features
- Follow consistent API response formats
- Do not break authentication or RBAC
- Document any business logic changes clearly
