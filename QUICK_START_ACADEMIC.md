# 🚀 Quick Start Guide - FIS Connect Academic Module

## ✅ Implementation Complete!

The FIS Connect academic module has been successfully integrated into Publientis without breaking any existing ecommerce functionality.

---

## 📍 Available Routes

### Frontend Routes (Already Configured)
- **`/academic/feed`** - Public academic feed (no login required)
- **`/academic/profile/:userId`** - Public profile page
- **`/academic/dashboard`** - Faculty moderation panel (protected, requires FACULTY role)

### Backend API Endpoints
All under **`/api/academic/`** prefix:

**Profiles:**
- `GET /api/academic/profile/me` - Get my profile
- `GET /api/academic/profile/:userId` - Get user profile
- `PUT /api/academic/profile/:userId` - Update profile

**Publications:**
- `GET /api/academic/publications/feed` - Public feed (only approved)
- `POST /api/academic/publications` - Create publication (STUDENT role)
- `GET /api/academic/publications/user/my` - My publications
- `GET /api/academic/publications/moderation/pending` - Pending publications (FACULTY)
- `PUT /api/academic/publications/:id/approve` - Approve (FACULTY)
- `PUT /api/academic/publications/:id/reject` - Reject (FACULTY)
- `POST /api/academic/publications/:id/like` - Toggle like

---

## 🏃‍♂️ How to Start

### 1. Start the Servers

**Backend:**
```bash
cd backend
npm install  # If first time
npm start
```

**Frontend:**
```bash
cd frontend
npm install  # If first time
npm start
```

### 2. Create Test Users

You can use the existing admin panel or create users directly via API:

**Create a Student:**
```bash
POST /api/auth/register
{
  "name": "Juan Estudiante",
  "email": "juan@universidad.edu",
  "password": "password123",
  "role": "STUDENT"
}
```

**Create a Faculty Member:**
```bash
POST /api/auth/register
{
  "name": "Dra. María Profesora",
  "email": "maria@universidad.edu",
  "password": "password123",
  "role": "FACULTY"
}
```

### 3. Test the Academic Flow

#### As STUDENT:

1. **Login** with student credentials
2. **Create Academic Profile:**
   ```bash
   PUT /api/academic/profile/{your-user-id}
   {
     "bio": "Estudiante de Ingeniería de Sistemas",
     "university": "Universidad Nacional",
     "faculty": "Ingeniería",
     "researchLine": "Inteligencia Artificial",
     "skills": ["Python", "Machine Learning", "React"],
     "isPublic": true
   }
   ```

3. **Create a Publication:**
   ```bash
   POST /api/academic/publications
   {
     "title": "Mi primer proyecto de IA",
     "description": "Desarrollo de un sistema de reconocimiento de imágenes...",
     "type": "RESEARCH_PROJECT",
     "tags": ["IA", "Python", "TensorFlow"],
     "featuredImage": "https://cloudinary.com/image.jpg"
   }
   ```
   Status will be `PENDING`

#### As FACULTY:

1. **Login** with faculty credentials
2. **Access Dashboard:** Navigate to `/academic/dashboard`
3. **Review Pending Publications**
4. **Approve or Reject** with feedback

#### As VISITOR (no login):

1. **View Public Feed:** Navigate to `/academic/feed`
2. **Filter by Type:** Click type badges to filter
3. **View Profiles:** Click on any student profile

---

## 🎨 Adding Navigation Link to Header

To add an "Academic" link to your main navigation, edit `frontend/src/layouts/Header.jsx`:

```jsx
// Add this link wherever appropriate in your navigation
<Link to="/academic/feed" className="nav-link">
  🎓 Academic
</Link>
```

---

## 🧪 Quick API Test (Using cURL or Postman)

### Get Public Feed
```bash
curl http://localhost:8070/api/academic/publications/feed
```

### Create Publication (requires auth token)
```bash
curl -X POST http://localhost:8070/api/academic/publications \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Publication",
    "description": "This is a test",
    "type": "ACHIEVEMENT",
    "tags": ["test"]
  }'
```

---

## 📊 Role Assignment

To assign roles to existing users, you can:

1. **Via Admin Panel:** Update user role in the admin interface
2. **Via Database:** Update the `role` field directly in MongoDB
3. **Via API:** Create a new endpoint to update roles (recommended for production)

---

## 🎯 Next Steps

### Immediate Enhancements:
1. **Add Publication Create Form** - Build a UI form for students to create publications
2. **Add Profile Edit Form** - Build a UI form to edit academic profiles
3. **Add Cloudinary Upload** - Integrate image upload for featured images
4. **Add Navigation Link** - Add "Academic" to main menu

### Roadmap Features (from your original plan):
- **Phase 4:** Followers/Following system + Notifications
- **Phase 5:** Public search for employers/visitors
- **Phase 6:** Announcements system for faculty
- **Phase 7:** Security (rate limiting, reports, email verification)

---

## 🐛 Troubleshooting

### Backend Not Starting?
- Check MongoDB is running
- Verify `.env` file has all required variables
- Check console for error messages

### Routes Not Found?
- Ensure backend shows: "🎓 FIS Connect - Academic module routes disponibles"
- Verify frontend routes are loaded correctly

### Cloudinary Upload Issues?
- Check `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in backend `.env`
- Test with existing Cloudinary setup used by ecommerce

### Authentication Issues?
- Clear browser cookies
- Check JWT token is being sent correctly
- Verify user role is correct in database

---

## 📁 Project Structure Reference

```
publientis/
├── backend/
│   ├── models/
│   │   └── userModel.js (MODIFIED - roles extended)
│   ├── routes/
│   │   └── index.js (MODIFIED - academic routes added)
│   └── modules/
│       └── academic/ (NEW)
│           ├── models/
│           ├── controllers/
│           ├── middlewares/
│           └── routes/
│
├── frontend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── index.js (MODIFIED - academic routes added)
│   │   └── modules/
│   │       └── academic/ (NEW)
│   │           ├── components/
│   │           ├── pages/
│   │           ├── hooks/
│   │           └── services/
│
└── Documentation/
    ├── PROJECT_CONTEXT.md
    ├── ACADEMIC_MODULE_CONTEXT.md
    ├── ACADEMIC_MODULE_IMPLEMENTATION.md
    └── QUICK_START_ACADEMIC.md (this file)
```

---

## 💡 Tips

- **Always test with STUDENT role first** before testing faculty features
- **Publications must be APPROVED** to appear in public feed
- **Profile visibility** controlled by `isPublic` field
- **All academic routes** are isolated under `/api/academic/` and `/academic/`
- **No ecommerce functionality affected** - both systems coexist peacefully

---

## 🎉 You're Ready!

The academic module is fully functional and ready for development. Start by creating test users and exploring the features.

**Happy Coding! 🚀**
