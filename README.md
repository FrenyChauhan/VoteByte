# VoteByte - Secure Online Voting System

A comprehensive, secure online voting platform with face recognition authentication, built with modern web technologies. VoteByte ensures election integrity through biometric verification, role-based access control, and real-time result tracking.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

## 🎯 Features

### Core Functionality
- **Secure User Authentication** - JWT-based authentication with role-based access control
- **Election Management** - Create, manage, and monitor elections with flexible scheduling
- **Candidate Registration** - Comprehensive candidate profiles with manifestos and symbols
- **Real-time Voting** - Secure voting interface with instant vote casting
- **Live Results** - Real-time election results with visual analytics and charts
- **Voter Management** - Automated voter registration and verification system

### Advanced Security Features
- **Face Recognition Authentication** - Biometric verification using face-api.js
  - Face capture during user registration
  - Face verification required before voting
  - Prevents unauthorized voting attempts
- **Multiple Authentication Types** - Support for OTP, Aadhar, Face Recognition, and Student ID
- **Role-Based Access Control (RBAC)** - Separate interfaces for Users, Admins, and Super Admins
- **Vote Integrity** - One vote per user per election with face verification
- **Complaint System** - Users can submit complaints with resolution tracking

### User Experience
- **Modern UI/UX** - Built with React, Tailwind CSS, and Framer Motion
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Feedback** - Toast notifications and loading states
- **Accessibility** - User-friendly interface with clear navigation

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Zustand** - State management
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **face-api.js** - Face detection and recognition (via CDN)

### Backend
- **Node.js** - Runtime environment
- **Express.js 5** - Web framework
- **Prisma** - ORM for database management
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Cloudinary** - Image storage and management
- **Multer** - File upload handling
- **Nodemailer** - Email service
- **Node-cron** - Scheduled tasks

### Database
- **PostgreSQL** - Primary database
- **Prisma Migrations** - Database schema management

## 📁 Project Structure

```
VoteByte/
├── Voting System/
│   ├── backend/
│   │   ├── config/           # Configuration files (DB, Cloudinary, Multer)
│   │   ├── controllers/      # Request handlers
│   │   ├── middlewares/      # Auth and RBAC middlewares
│   │   ├── models/           # Prisma models
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Helper functions
│   │   ├── face_storage/     # Face descriptor storage
│   │   ├── prisma/           # Database schema and migrations
│   │   └── app.js            # Express app entry point
│   │
│   └── frontend/
│       ├── src/
│       │   ├── components/   # Reusable React components
│       │   ├── pages/        # Page components
│       │   ├── routes/       # Route protection components
│       │   ├── services/     # API service functions
│       │   ├── store/        # Zustand state stores
│       │   └── utils/        # Utility functions
│       ├── public/           # Static assets
│       └── vite.config.js    # Vite configuration
│
├── LICENSE
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn**
- **Cloudinary account** (for image storage)
- **Email service** (for OTP/notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd VoteByte/Voting\ System
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Database Setup**
   ```bash
   cd ../backend
   # Create a PostgreSQL database
   # Update DATABASE_URL in .env file
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Environment Variables**

   Create a `.env` file in the `backend` directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/votebyte?schema=public"

   # JWT
   JWT_SECRET="your-super-secret-jwt-key"
   EXPRESS_SESSION_SECRET="your-session-secret"

   # Cloudinary
   CLOUDINARY_NAME="your-cloudinary-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"

   # Email (Nodemailer)
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT=587
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"

   # Client URL
   CLIENT_URL="http://localhost:5173"
   ```

6. **Create Face Storage Directory**
   ```bash
   # Windows PowerShell
   mkdir backend\face_storage

   # Linux/Mac
   mkdir backend/face_storage
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev    # Development mode with nodemon
   # or
   npm start      # Production mode
   ```
   Backend runs on `http://localhost:3000` (or port specified in your config)

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

3. **Access the Application**
   - Open your browser and navigate to `http://localhost:5173`
   - Register a new account or login with existing credentials

## 📚 Usage Guide

### For Voters

1. **Registration**
   - Navigate to Sign Up page
   - Fill in personal details (name, email, password, etc.)
   - **Capture your face** using the camera (required for voting)
   - Complete registration

2. **Voting**
   - Login to your account
   - Browse active elections
   - Select a candidate
   - **Verify your face** when prompted
   - Cast your vote
   - View confirmation

3. **Viewing Results**
   - Navigate to Results section
   - View election results with visual charts
   - Check voter turnout and statistics

### For Admins

1. **Election Management**
   - Create new elections with start/end times
   - Set authentication type (Face Recognition, OTP, etc.)
   - Manage election status

2. **Candidate Management**
   - Approve/reject candidate registrations
   - View candidate profiles and manifestos

3. **Voter Management**
   - View registered voters
   - Verify voter eligibility
   - Monitor voting activity

### For Super Admins

1. **System Management**
   - Full access to all features
   - Manage admins and users
   - Resolve complaints
   - System-wide analytics

## 🔐 Face Recognition System

VoteByte includes a comprehensive face recognition system for enhanced security:

### How It Works

1. **During Registration**
   - User captures face photo using webcam
   - System generates 128-dimensional face descriptor
   - Face photo stored in Cloudinary
   - Face descriptor stored locally on server

2. **During Voting**
   - User must verify face before casting vote
   - System compares live face with registered face
   - Vote only allowed if face matches (threshold: 0.6)
   - Prevents unauthorized voting

### Configuration

Face matching threshold can be adjusted in:
- `backend/services/faceRecognitionService.js`
- `backend/controllers/faceVerificationController.js`

**Recommended Values:**
- `0.4` - Very strict (high false rejection)
- `0.6` - Balanced (recommended)
- `0.8` - Lenient (higher false acceptance risk)

### Requirements

- **HTTPS** - Required for camera access in production
- **Camera Permission** - Browser must allow camera access
- **Good Lighting** - Ensures accurate face detection

For detailed face recognition documentation, see:
- `FACE_RECOGNITION_README.md`
- `QUICK_START.md`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Elections
- `GET /api/elections` - List all elections
- `GET /api/elections/:id` - Get election details
- `POST /api/elections` - Create election (Admin)
- `PUT /api/elections/:id` - Update election (Admin)
- `DELETE /api/elections/:id` - Delete election (Admin)

### Candidates
- `GET /api/candidates` - List candidates
- `GET /api/candidates/:id` - Get candidate details
- `POST /api/candidates` - Register as candidate
- `PUT /api/candidates/:id` - Update candidate (Admin)
- `POST /api/candidates/:id/approve` - Approve candidate (Admin)

### Voting
- `POST /api/votes/verify-face` - Verify face for voting
- `POST /api/votes/face-verify/:electionId` - Verify and mark as verified
- `POST /api/votes/cast` - Cast vote
- `GET /api/votes/voter-status/:electionId` - Get voter status

### Results
- `GET /api/results` - List all results
- `GET /api/results/:electionId` - Get election results
- `POST /api/results/generate/:electionId` - Generate results (Admin)

### Voters
- `GET /api/voters` - List voters
- `GET /api/voters/:electionId` - Get voters for election
- `POST /api/voters/register/:electionId` - Register as voter

## 🗄️ Database Schema

### Key Models

- **User** - User accounts with profile information
- **Election** - Election details and scheduling
- **Candidate** - Candidate profiles and registration
- **Voter** - Voter registration and verification status
- **Vote** - Individual vote records
- **ElectionResult** - Calculated election results
- **Admin** - Admin user management
- **SuperAdmin** - Super admin accounts
- **Complaint** - User complaints and resolutions

See `backend/prisma/schema.prisma` for complete schema definition.

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Face Recognition** - Biometric verification for voting
- **Role-Based Access Control** - Granular permissions
- **HTTPS Support** - Secure data transmission
- **Input Validation** - Server-side validation
- **SQL Injection Prevention** - Prisma ORM protection
- **CORS Configuration** - Controlled cross-origin access

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration with face capture
- [ ] User login and authentication
- [ ] Election creation (Admin)
- [ ] Candidate registration
- [ ] Face verification during voting
- [ ] Vote casting
- [ ] Results generation and viewing
- [ ] Complaint submission
- [ ] Admin panel access

## 🐛 Troubleshooting

### Common Issues

**Face Recognition Not Working**
- Ensure camera permissions are granted
- Check HTTPS is enabled (required for camera)
- Verify face-api.js models are loading (check browser console)
- Ensure good lighting conditions

**Database Connection Errors**
- Verify DATABASE_URL in .env
- Check PostgreSQL is running
- Run `npx prisma migrate dev` to apply migrations

**Cloudinary Upload Failures**
- Verify Cloudinary credentials in .env
- Check API key permissions
- Ensure internet connectivity

**CORS Errors**
- Update CLIENT_URL in backend .env
- Check allowedOrigins in app.js

## 📝 Development

### Code Structure

- **Controllers** - Handle HTTP requests/responses
- **Services** - Business logic and data processing
- **Models** - Database models (Prisma)
- **Routes** - API endpoint definitions
- **Middlewares** - Authentication and authorization
- **Utils** - Helper functions and utilities

### Adding New Features

1. Update Prisma schema if database changes needed
2. Run migrations: `npx prisma migrate dev`
3. Create/update services for business logic
4. Create/update controllers for API endpoints
5. Add routes in appropriate route file
6. Update frontend components/pages as needed

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For support, email [your-email] or open an issue in the repository.

## 🙏 Acknowledgments

- **face-api.js** - Face detection and recognition library
- **Prisma** - Modern database toolkit
- **React Team** - Amazing UI library
- **Express.js** - Robust web framework
- All open-source contributors

## 📚 Additional Documentation

- [Face Recognition Guide](Voting%20System/FACE_RECOGNITION_README.md)
- [Quick Start Guide](Voting%20System/QUICK_START.md)
- [Implementation Summary](Voting%20System/IMPLEMENTATION_SUMMARY.md)
- [Code Reference](Voting%20System/CODE_REFERENCE.md)

---

**Built with ❤️ by Team VoteByte for secure and transparent elections**

