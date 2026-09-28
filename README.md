# JVM CAMPUS FIX

> **Campus Complaint & Issue Tracking System**  
> A simple, responsive, and reliable web application for college campus complaint reporting, real-time tracking, and administrative resolution.

---

## 1. Project Overview

**JVM CAMPUS FIX** is purpose-built for college campus environments to replace slow, manual, or untracked grievance reporting. It connects students directly with campus administrators/moderators through an intuitive paper-minimal/neobrutalist interface, robust role-based authentication, and automated email notifications powered by Resend.

- **Frontend Deployment**: [https://campus-fix-flax.vercel.app/](https://campus-fix-flax.vercel.app/)
- **Backend Deployment**: [https://campusfix-backend-figy.onrender.com](https://campusfix-backend-figy.onrender.com/)

---

## 2. Key Features

- **Role-Based Authentication**: Secure registration and login for students and moderators with bcrypt password hashing and 7-day JWT sessions.
- **Location-Free Complaint Reporting**: Tailored specifically for the campus—students select title, category, description, and priority without redundant location prompts.
- **Unique Public Tracking IDs**: Every issue receives a human-readable identifier (e.g. `CF-XXXXXX`) for public tracking without requiring credentials.
- **Student Dashboard**: Real-time summary counts (Total, Pending, Resolved) and personal grievance history.
- **Moderator Portal**: Role-guarded dashboard displaying all campus complaints with one-click resolution.
- **Dynamic Resolution Notification Emails**: Automatically sends a professional resolution email to the student who submitted the issue using Resend.
- **Persistent Navbar Navigation**: Dynamic navigation menus that update based on authentication status and preserve active sessions between page visits.
- **Responsive Paper-Neobrutalist Styling**: High-contrast, clean typography, distinctive borders, and tactile interactive feedback on both mobile and desktop.

---

## 3. Technology Stack

### Frontend
- **HTML5**: Semantic document structuring with ARIA accessibility roles.
- **CSS3**: Custom paper/neobrutalist design system with CSS custom properties, responsive media queries, and zero heavy frameworks.
- **JavaScript (Vanilla ES6+)**: Native Fetch API client, state-driven dynamic navigation, and DOM manipulation.

### Backend
- **Node.js & Express.js**: RESTful API service handling authentication, route middleware, and database operations.
- **Mongoose & MongoDB Atlas**: Cloud-hosted NoSQL document database with strict schema validation and indexed queries.
- **JWT (`jsonwebtoken`)**: Stateless token-based session verification (`Bearer <token>`).
- **bcryptjs**: Cryptographic password hashing (10 salt rounds).
- **CORS & Dotenv**: Cross-origin resource sharing and environment variable management.

### Email Service
- **Resend SDK (`resend`)**: Transactional email dispatch for complaint resolution alerts.

---

## 4. Project Structure

```
CampusFix/
├── .env                       # Local environment secrets (IGNORED by Git)
├── .gitignore                  # Git ignore rules (.env, node_modules/)
├── package.json               # Node.js dependencies and scripts
├── package-lock.json          # Dependency lockfile
├── vercel.json                # Vercel deployment configuration
├── public/                    # Frontend client files
│   ├── css/
│   │   └── style.css          # Neobrutalist design stylesheet
│   ├── js/
│   │   ├── script.js          # Main client logic (auth, forms, navigation)
│   │   └── moderator.js       # Moderator portal management
│   ├── index.html             # Homepage
│   ├── login.html             # Fresh login page (autofill-guarded)
│   ├── register.html          # Student registration page
│   ├── complaint.html         # Issue reporting form
│   ├── track.html             # Public complaint tracking
│   ├── dashboard.html         # Student dashboard & history
│   ├── forgotpassword.html    # Password recovery page
│   └── moderator.html         # Protected moderator resolution portal
└── server/                    # Backend server files
    ├── models/
    │   ├── user.js            # User schema (student / moderator)
    │   └── Complaint.js       # Complaint schema (CF-XXXXXX)
    ├── routes/
    │   ├── auth.js            # Authentication routes (register, login)
    │   └── complaints.js      # Complaint routes (CRUD, resolve, track)
    ├── utils/
    │   └── email.js           # Resend resolution email dispatch utility
    └── server.js              # Express app entrypoint & MongoDB connector
```

---

## 5. How to Run Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB Atlas cluster or local MongoDB instance

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/rishikeshdev-code/CampusFix.git
   cd CampusFix
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:
   ```ini
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   RESEND_API_KEY=re_your_resend_api_key
   EMAIL_FROM=onboarding@resend.dev
   ```

4. Start the application:
   ```bash
   npm start
   ```

5. Open your browser:
   - Website: `http://localhost:5000`
   - API Health Check: `http://localhost:5000/api/health`

---

## 6. Environment Variables

| Variable | Description | Required | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Local server port (defaults to 5000) | No | `5000` |
| `MONGO_URI` | MongoDB Atlas SRV connection string | **Yes** | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | **Yes** | `your-secret-key` |
| `RESEND_API_KEY` | Resend API key for dispatching resolution emails | **Yes** | `re_xxxxxxxx...` |
| `EMAIL_FROM` | Sender address verified in Resend | **Yes** | `onboarding@resend.dev` |

> [!NOTE]
> Never commit `.env` to version control. The `.env` file is excluded in `.gitignore`.

---

## 7. API Specification

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` — Create a new student account (`name`, `email`, `password`).
- `POST /api/auth/login` — Authenticate student or moderator and return JWT token.
- `POST /api/auth/forgot-password` — Request password recovery.

### Complaint Routes (`/api/complaints`)
- `POST /api/complaints` — Submit a complaint (`title`, `category`, `description`, `priority`). *(Requires `Bearer <token>`)*
- `GET /api/complaints/my` — Retrieve complaints submitted by the logged-in student. *(Requires `Bearer <token>`)*
- `GET /api/complaints/:complaintId` — Public complaint tracking by ID.
- `GET /api/complaints/all` — View all campus complaints. *(Requires Moderator token)*
- `PATCH /api/complaints/:complaintId/resolve` — Mark complaint as `resolved` and send Resend email to the student. *(Requires Moderator token)*

### System Route
- `GET /api/health` — Service health check.

---

## 8. User Workflows

### Student Workflow
1. Navigate to **Register** and create an account.
2. Log in; the navbar updates dynamically to display **Report**, **Track**, **Dashboard**, and **Logout**.
3. Open **Report** to submit a problem (Title, Category, Description, Priority).
4. Receive a unique complaint tracking ID (e.g. `CF-AB12CD`).
5. Track status anytime under **Track** or view history under **Dashboard**.
6. Receive an automated email once the complaint is resolved.

### Moderator Workflow
1. Log in using verified moderator credentials.
2. The navbar dynamically switches to **Home**, **Track**, **Moderator**, and **Logout**.
3. Open **Moderator** to view all campus grievances.
4. Click **Resolve Complaint** on any pending issue.
5. The backend marks the issue `resolved` in MongoDB, finds the student's registered email, and dispatches the resolution email via Resend.

---

## 9. Security Features

- **Password Encryption**: Passwords salted and hashed via `bcryptjs`.
- **Role Validation**: Critical management endpoints (`/api/complaints/all`, `/api/complaints/:complaintId/resolve`) enforce `role: "moderator"`.
- **Fresh Login Protection**: Login forms use `autocomplete="off"`/`"new-password"` and dynamic reset triggers to eliminate unwanted browser autofill prefilling.
- **Zero Secret Leakage**: API keys and database credentials reside strictly on the server in `process.env`.
- **Safe Population**: Null-safe student user lookups prevent server crashes when resolving issues.

---

## 10. Resend Email Sandbox Note

In Resend's free testing tier (`onboarding@resend.dev`), emails can only be delivered to the verified account owner (`dubeyrishikesh9059@gmail.com`). 

To send resolution notifications to arbitrary college student emails in production:
1. Add and verify your college domain under [resend.com/domains](https://resend.com/domains).
2. Set `EMAIL_FROM=notifications@yourcollegedomain.edu` in your deployment environment variables.
