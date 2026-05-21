# 🎓 UniPortal — University Management System (MERN Stack)

UniPortal is a modern web-based university management platform designed to simplify academic administration and improve communication between students and institutional staff.

The system provides secure authentication, user management, academic record handling, and scalable infrastructure for educational institutions.

This project is being developed as a real-world SaaS product using the MERN stack (MongoDB, Express.js, React, Node.js).

---

## 🚀 Project Status

🟢 MVP Development In Progress
✅ Day 1 Completed — Backend Setup & Database Connection

---

## 🧠 Vision

The goal of UniPortal is to create an affordable, scalable, and user-friendly academic portal tailored for universities and educational institutions, particularly in developing regions.

The platform will support:

* Student information management
* Course registration
* Academic results tracking
* Administrative dashboards
* Secure authentication & authorization
* Multi-role access (Students, Admin, Staff)

---

## 🏗️ Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication
* bcrypt (password hashing)

### Frontend (Planned)

* React.js
* Tailwind CSS
* Axios
* React Router

### Dev Tools

* Nodemon
* Git & GitHub
* Postman / Thunder Client
* dotenv

---

## 📂 Project Structure

```
uniportal/
│
├── client/               # React frontend (planned)
│
├── server/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── utils/
│   │
│   ├── config.env
│   ├── package.json
│   └── nodemon.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/uniportal.git
cd uniportal/server
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Create Environment File

Create `config.env` in the server folder:

```
PORT=5000
DATABASE=your_mongodb_connection_string
DATABASE_PASSWORD=your_password
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 4️⃣ Run Development Server

```bash
npm run dev
```

Server will start on:

```
http://localhost:5000
```

---

## 🔌 API Endpoints (Current)

### Health Check

```
GET /api/v1/health
```

### Authentication (Planned / In Progress)

```
POST /api/v1/auth/register
POST /api/v1/auth/login
```

---

## 🔐 Security Features

* Password hashing with bcrypt
* JWT authentication
* Environment variable protection
* Role-based authorization (planned)

---

## 📈 Roadmap

### Phase 1 — Backend Foundation ✅

* Express server setup
* MongoDB connection
* Environment configuration

### Phase 2 — Authentication (Current)

* User model
* Register/Login
* JWT protection

### Phase 3 — Core Features

* Student management
* Course management
* Enrollment system
* Dashboard

### Phase 4 — Frontend

* React UI
* Authentication pages
* Admin panel

### Phase 5 — Deployment

* Cloud hosting
* Production database
* Domain configuration

---

## 🌍 Target Users

* Universities
* Colleges
* Training Institutes
* Educational Organizations

---

# UniPortal

A MERN university management SaaS platform for students and admins.

## Features

- JWT authentication
- Role-based access control
- Course management
- Student enrollment
- Profile management
- Dashboard UI
- Session restore with `/auth/me`
- Toast notifications
- Form validation

## Tech Stack

- React
- Vite
- Node.js
- Express
- MongoDB
- JWT

## Setup

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## Deployment

### Render Backend

Create a Render Web Service with:

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/v1/health`

Required backend environment variables:

```env
NODE_ENV=production
PORT=10000
DATABASE=your_mongodb_atlas_connection_string
DATABASE_PASSWORD=only_required_if_DATABASE_contains_<PASSWORD>
JWT_SECRET=your_strong_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-vercel-app.vercel.app
```

`DATABASE` may be either a full MongoDB Atlas URI or a URI containing
`<PASSWORD>`. If it contains `<PASSWORD>`, set `DATABASE_PASSWORD` separately.
Do not commit real secret values.

`CLIENT_URL` is used for CORS. Use the exact Vercel origin, for example:

```env
CLIENT_URL=https://uniportal-rho.vercel.app
```

Multiple origins can be provided as a comma-separated list. `CORS_ORIGINS` is
also supported for additional comma-separated frontend origins.

### Vercel Frontend

Create a Vercel project with:

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`

Required frontend environment variable:

```env
VITE_API_URL=https://your-render-service.onrender.com/api/v1
```

The frontend includes `client/vercel.json` so React Router routes refresh to
`index.html`.

After deployment, verify:

```text
GET https://your-render-service.onrender.com/api/v1/health
```

Then log in from the Vercel URL and confirm the browser network requests use
the Render `/api/v1` base URL.

---

## 👨‍💻 Author

**Peter Jur Makender Makech**
Full-Stack MERN Developer
Founder — Sky High Tech
Juba, South Sudan

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ Future Goals

* Multi-institution SaaS version
* Mobile app integration
* Payment integration
* AI academic analytics

---

## 🤝 Contributions

Contributions, suggestions, and collaborations are welcome.

---

## 📬 Contact

For partnerships or inquiries:

Email: pmakec@gmail.com
Company: Sky High Tech

---

> Building technology solutions for education in Africa 🚀
