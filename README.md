# ServiceDesk Pro – AI-Powered IT Helpdesk & Asset Management System

**ServiceDesk Pro** is an enterprise-grade full-stack IT Helpdesk and Asset Management web application. The backend is built with **Spring Boot 3 (Java 21/25)**, **Spring Data JPA**, **Spring Security**, and an embedded persistent **H2 database** (with zero external dependencies required), serving a modern **React (Vite)** frontend. It combines ITIL ticket lifecycle tracking, hardware/software inventory management, SLA compliance monitoring, and an **AI Helpdesk Assistant powered by Retrieval-Augmented Generation (RAG)**.

---

## 🌟 Key Features

### 1. Role-Based Access Control (RBAC) & Authentication
- **5 Distinct Roles**:
  - **Admin**: Full system management, user directory, role assignment, system-wide analytics.
  - **IT Manager**: Ticket queue oversight, SLA breach alerts, technician workload balancing.
  - **Technician**: Ticket resolution, assignment claim, internal IT private notes, repair logs.
  - **Asset Manager**: Hardware lifecycle, procurement cost tracking, warranty horizon, repair tracking.
  - **Employee (Self-Service)**: Submit tickets, view assigned laptops/software, interact with AI assistant.
- **Security**: JWT tokens with Bearer authorization, BCrypt password hashing, and role-scoped endpoints.

### 2. AI Helpdesk Chatbot (RAG-Powered)
- **Natural Language Understanding**: Employees describe IT issues naturally.
- **Issue Classification**: Automatic category (`Hardware`, `Software`, `Network`, `Access & Security`, `Email & Communication`, `Cloud Services`) and priority ranking (`Urgent`, `High`, `Medium`, `Low`).
- **Internal Knowledge Retrieval (RAG)**: Retrieves relevant company knowledge articles, formats step-by-step troubleshooting checklist, and cites internal sources (`KB-201`, `KB-202`, etc.).
- **1-Click Ticket Escalation**: If self-troubleshooting fails, proposes a pre-filled ticket with summary, category, and priority.
- **Employee Confirmation Modal**: Ensures user reviews ticket parameters before submitting to the IT queue.
- **Flexible AI Providers**: Built-in intelligent RAG engine by default, with optional drop-in support for OpenAI and Google Gemini API keys.

---

## 🏗️ Project Architecture

```
ram-tt/
├── backend/
│   ├── pom.xml                               # Maven project configuration (Spring Boot 3.4)
│   ├── src/main/java/com/servicedesk/pro/
│   │   ├── ServiceDeskApplication.java       # Main entry point
│   │   ├── config/                           # Security, JWT, CORS, Exception Handling
│   │   ├── model/                            # JPA Entities (User, Ticket, Asset, KB, etc.)
│   │   ├── repository/                       # Spring Data JPA Repositories
│   │   ├── service/                          # Business logic & AI RAG Engine
│   │   ├── controller/                       # REST Controllers (/api/auth, /api/tickets, etc.)
│   │   ├── dto/                              # Request/Response DTOs
│   │   └── seed/                             # DataInitializer (auto-seeds demo users & data)
│   ├── src/main/resources/
│   │   └── application.properties            # Port 5000, persistent H2, JWT settings
│   └── src-node-backup/                      # Preserved Node.js backend files
├── frontend/                                 # React + Vite frontend
└── README.md
```
│   │   ├── controllers/     # Auth, Ticket, Asset, KB, AI, Dashboard, User controllers
│   │   ├── middleware/      # JWT auth, RBAC authorize, error handler
│   │   ├── models/          # User, Ticket, Asset, KnowledgeBase, Notification schemas
│   │   ├── routes/          # Express API route definitions
│   │   ├── seed/            # Seed script with realistic demo data
│   │   ├── services/        # AI Service (RAG retrieval & LLM pipeline)
│   │   └── server.js        # Express server entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Sidebar, Navbar, Layout, AIChatWidget, Badges, StatCard
│   │   ├── context/         # AuthContext, ToastContext
│   │   ├── pages/
│   │   │   ├── auth/        # Login (with 1-click Demo Role Switcher), Register
│   │   │   ├── dashboard/   # Multi-role Dashboard
│   │   │   ├── tickets/     # TicketList, TicketDetail, CreateTicket
│   │   │   ├── assets/      # AssetList, AssetDetail, CreateAsset
│   │   │   ├── kb/          # KnowledgeBaseList, KnowledgeBaseDetail, KnowledgeBaseEditor
│   │   │   ├── ai/          # AIChatPage full-screen workspace
│   │   │   ├── reports/     # SLA Analytics & Technician Leaderboard
│   │   │   ├── users/       # Admin User Management
│   │   │   └── profile/     # User Profile & Password settings
│   │   ├── services/        # Axios API client with JWT interceptor
│   │   ├── App.jsx          # React Router configuration
│   │   ├── index.css        # Modern design system & dark-blue theme
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Java** (JDK 17, 21, or 25)
- **Apache Maven** (v3.8+ recommended)
- **Node.js** (v18+ for the frontend)
- *Note: No external database server (MongoDB/MySQL) is required! The backend uses an embedded persistent H2 database.*

---

### 2. Spring Boot Backend Setup

1. Open a terminal in the `backend` directory:
   ```bash
   cd backend
   ```
2. Start the Spring Boot backend server:
   ```bash
   mvn spring-boot:run
   ```
   *Or build and run the executable JAR:*
   ```bash
   mvn clean package -DskipTests
   java -jar target/servicedesk-pro-backend-1.0.0.jar
   ```
   *The backend will automatically start on `http://localhost:5000` and seed all default demo accounts, tickets, assets, and knowledge base articles.*
   *Database console is available at `http://localhost:5000/h2-console` (JDBC URL: `jdbc:h2:file:./data/servicedesk`).*

---

### 3. Frontend Setup

1. Open a new terminal in the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🔑 Demo Login Credentials

The login screen includes **1-Click Quick Demo Login buttons** to instantly switch between roles:

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Admin** | `admin@servicedesk.pro` | `Admin@123` | Full system access, User directory, Global IT reports |
| **IT Manager** | `manager@servicedesk.pro` | `Manager@123` | Ticket assignment, SLA compliance, Workload monitoring |
| **Technician (Sr.)** | `tech.alex@servicedesk.pro` | `Tech@123` | Assigned tickets, Resolution notes, Internal IT notes |
| **Technician (Cloud)** | `tech.sarah@servicedesk.pro` | `Tech@123` | Cloud/Server tickets, Claim unassigned queue |
| **Asset Manager** | `asset.john@servicedesk.pro` | `Asset@123` | Hardware registration, Warranty alerts, Maintenance logs |
| **Employee 1** | `employee.jane@servicedesk.pro` | `Emp@123` | Self-service tickets, Assigned MacBook, AI Helpdesk |
| **Employee 2** | `employee.mike@servicedesk.pro` | `Emp@123` | Self-service tickets, Assigned Dell Latitude, AI Helpdesk |

---

## 🤖 AI Helpdesk & RAG Configuration

ServiceDesk Pro comes with an **Intelligent Knowledge Retrieval Engine** out of the box that requires **zero external API keys** to run locally.

### How it Works:
1. When an employee types: *"My VPN keeps dropping with certificate errors"*, the AI queries the MongoDB `KnowledgeBase` collection for matching approved articles.
2. It classifies the category as **Network** and priority as **High**.
3. It generates an actionable step-by-step resolution checklist citing **KB-201**.
4. If the user indicates the issue remains unresolved, it presents a **"Create Support Ticket"** action with all diagnostic context pre-filled.

### Optional: Using External OpenAI or Google Gemini
To connect external LLMs, update `backend/.env`:
- For OpenAI:
  ```env
  AI_PROVIDER=openai
  OPENAI_API_KEY=sk-proj-...
  ```
- For Google Gemini:
  ```env
  AI_PROVIDER=gemini
  GEMINI_API_KEY=AIzaSy...
  ```

---

## 📡 REST API Summary

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new employee |
| `POST` | `/api/auth/login` | Public | Authenticate user & get JWT |
| `GET` | `/api/auth/me` | Private | Get authenticated profile |
| `GET` | `/api/dashboard/metrics` | Private | Role-tailored metrics & stats |
| `GET` | `/api/tickets` | Private | List tickets (filtered by role) |
| `POST` | `/api/tickets` | Private | Create new support ticket |
| `GET` | `/api/tickets/:id` | Private | Get ticket details & activity log |
| `PUT` | `/api/tickets/:id/assign` | IT Staff | Assign ticket to technician |
| `PUT` | `/api/tickets/:id/status` | Private | Update status (Resolve / Close) |
| `POST` | `/api/tickets/:id/comments` | Private | Post public or internal comment |
| `GET` | `/api/assets` | Private | List hardware & software inventory |
| `POST` | `/api/assets` | Asset/Admin | Register new IT asset |
| `POST` | `/api/assets/:id/repairs` | IT Staff | Log maintenance/repair record |
| `GET` | `/api/kb` | Private | Search knowledge base articles |
| `POST` | `/api/kb` | IT Staff | Create knowledge base article |
| `POST` | `/api/kb/:id/vote` | Private | Upvote / Downvote article helpfulness |
| `POST` | `/api/ai/chat` | Private | RAG Chatbot diagnostic query |
| `POST` | `/api/ai/create-ticket` | Private | Create confirmed ticket from AI |
| `GET` | `/api/users` | Admin/Staff | User directory |
| `PUT` | `/api/users/:id` | Admin | Update user role & status |
#   r a m - t t  
 