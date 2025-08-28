# UniSync Campus Management System

A full-stack MERN application for managing campus operations with role-based authentication and real-time features.

## 🚀 Features

### **Admin Dashboard**
- Student/Teacher/Course management (CRUD operations)
- Analytics and reporting with interactive charts
- Notice management and calendar events
- Export functionality for data
- System statistics and performance metrics

### **Teacher Portal**
- Course management and student enrollment
- Attendance tracking with visual trends
- Grade submission and management
- Performance analytics

### **Student Portal**
- Course enrollment and progress tracking
- Timetable and schedule management
- Notice board and announcements
- Academic performance visualization

## 🛠️ Tech Stack

### **Backend**
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** authentication with bcrypt
- **Role-based** authorization middleware
- **File upload** support with Multer
- **Data validation** with express-validator

### **Frontend**
- **React 18** with React Router
- **Axios** for API communication
- **Recharts** for data visualization
- **Lucide React** for modern icons
- **Responsive design** with glassmorphism effects

## 📦 Installation & Setup

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### **Quick Start**
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd unisyncc
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**
   Create `.env` file in backend directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/campus_db
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

5. **Database Seeding**
   ```bash
   cd backend
   npm run seed
   ```

6. **Start Development Servers**
   
   **Option 1: Use the batch script (Windows)**
   ```bash
   # Double-click start-dev.bat or run:
   start-dev.bat
   ```
   
   **Option 2: Manual startup**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@campus.edu | admin123 |
| **Teacher** | teacher@campus.edu | teacher123 |
| **Student** | student@campus.edu | student123 |

## 🌐 API Endpoints

### **Authentication**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get user profile

### **Admin Routes** (`/admin`)
- **Students**: GET, POST, PUT, DELETE `/students`
- **Teachers**: GET, POST, PUT, DELETE `/teachers`
- **Courses**: GET, POST, PUT, DELETE `/courses`
- **Analytics**: Various endpoints for charts and statistics
- **Calendar**: CRUD operations for events

### **Teacher Routes** (`/teacher`)
- `GET /courses` - Get assigned courses
- `POST /attendance` - Mark attendance
- `POST /grades` - Submit grades

### **Student Routes** (`/student`)
- `GET /courses` - Get enrolled courses
- `GET /attendance` - View attendance
- `GET /grades` - View grades
- `GET /timetable` - Get schedule

## 🎨 UI Features

- **Dark Theme** with neon blue accents (#00d4ff)
- **Glassmorphism** cards with backdrop blur effects
- **Responsive Design** with collapsible sidebar
- **Interactive Charts** (bar, line, pie, radial)
- **Modal Forms** for CRUD operations
- **Loading States** and error handling
- **Role-based Navigation** and access control

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

## 🔧 Development Scripts

### **Backend**
```bash
npm run dev      # Start with nodemon
npm start        # Production start
npm run seed     # Seed database with sample data
```

### **Frontend**
```bash
npm start        # Start development server
npm run build    # Create production build
npm test         # Run tests
```

## 📊 Database Schema

### **User Model**
- name, email, password (hashed)
- role (Admin/Teacher/Student)
- department, year (for students)
- timestamps

### **Course Model**
- name, code, description
- department, credits, semester
- instructor (Teacher reference)
- students (Student references array)

### **Additional Models**
- Attendance, CalendarEvent, Notice
- Grade, Department, Timetable

## 🚀 Deployment

The application is ready for deployment on platforms like:
- **Backend**: Heroku, Railway, DigitalOcean
- **Frontend**: Netlify, Vercel, GitHub Pages
- **Database**: MongoDB Atlas

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ using MERN Stack**
