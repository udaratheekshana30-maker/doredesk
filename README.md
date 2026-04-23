# 🏰 DormDesk | Smart Hostel Management System

DormDesk is a premium, full-stack hostel management platform designed for modern universities. It features a high-fidelity React frontend, a robust Express/Node.js backend, and intelligent system-aware features like AI-assisted room booking and facility management.

## 📁 Project Structure

```text
.
├── .github/                # GitHub templates & workflows
├── backend/                # Express.js Server & MongoDB Models
├── frontend/               # React (Vite) Application
├── docs/                   # Project documentation & Team info
├── .gitignore              # Files to exclude from Git
└── README.md               # You are here
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas Account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/udaratheekshana30-maker/ITPM-Group-07.git
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env # Add your MONGO_URI
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 👥 The Team

This project is maintained by a 3-member development team. For specific focus areas, see [TEAM_ROLES.md](./docs/TEAM_ROLES.md).

## 🛠 Features
- **Intelligent Room Booking**: System-aware AI assistant to help students find rooms.
- **Facility Management**: Automated booking for Gym, Study areas, and more.
- **Laundry Tracking**: Real-time machine monitoring.
- **Admin Dashboard**: Comprehensive oversight of students, rooms, and payments.

---
Built with ❤️ by the DormDesk Team.