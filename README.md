# Task Management Web Application

A modern web application for managing tasks and improving productivity. This application helps users organize their work, track progress, and collaborate with team members effectively.

**Project Live link** : https://multitask-management.vercel.app

## Installation

### Prerequisites
- Node.js (v14.0 or higher)
- npm (v6.0 or higher)
- MongoDB (v4.4 or higher)

### Backend Setup

1. Navigate to the backend directory
```bash
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the backend directory and add:
```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
APP_URL=your_frontend_url
```

4. Start the backend server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory
```bash
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the frontend directory and add:
```bash
REACT_APP_API_URL=http://localhost:5000
```

4. Start the frontend application
```bash
npm start
```

The frontend application will run on `http://localhost:3000`

## Features

### 1. User Authentication
- Secure signup and login functionality
- JWT-based authentication
- Password reset capability
- Role-based access control (Admin/User)

### 2. Task Management
- Create, read, update, and delete tasks
- Set task priorities (High, Medium, Low)
- Add due dates and reminders
- Task categorization and labeling
- Task status tracking (Backlog, To Do, Completed)

### 3. Dashboard
- Overview of all tasks
- Task statistics and progress tracking
- Priority , status and due-date based task filtering

## Screenshots

- Login Page![Screenshot from 2025-02-19 16-50-19](https://github.com/user-attachments/assets/6373101d-ab21-44d4-a708-490a4c84b7a2)
- Signup Page![Screenshot from 2025-02-19 16-50-27](https://github.com/user-attachments/assets/f7756c11-cf3b-4946-a6bd-75dbfdf8f4de)
- Dashboard![Screenshot from 2025-02-19 17-27-52](https://github.com/user-attachments/assets/8dd24e4f-8ca2-4115-af49-4960dac12434)
- Drag And Drop Functionality![Screenshot from 2025-02-19 17-27-10](https://github.com/user-attachments/assets/8985868f-eb33-4837-ae6e-abf40a929b61)
- Create new task![Screenshot from 2025-02-19 17-28-10](https://github.com/user-attachments/assets/02e24360-4cbd-4666-bf17-6356896731b9)
- Edit a task![Screenshot from 2025-02-19 17-28-35](https://github.com/user-attachments/assets/eacc785c-5df5-45a8-8033-4edc71a85293)
- Mobile View ![IMG_20250219_174308_278](https://github.com/user-attachments/assets/47c8a7bc-340b-4706-9db7-e0ee588524bd)

## Technology Stack

### Frontend
- React.js
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- RESTful API architecture
- Middleware for validation and authentication

## Contact

Your Name - Astha Niharika
Project Link: [https://github.com/niharikastha/task_management.git]
