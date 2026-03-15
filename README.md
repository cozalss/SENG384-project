# <p align="center">🚀 LexiAI - Personnel Management System (SENG-384)</p>

<p align="center">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
</p>

---

## 🌟 Overview
**LexiAI** has been refactored into a secure **Personnel Management System** to meet all requirements of the **SENG-384 Docker Assignment**. The platform now features a full CRUD (Create, Read, Update, Delete) lifecycle for managing personnel records, fully integrated with a containerized PostgreSQL database.

---

## 🛠️ Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/cozalss/SENG384-project.git
    cd SENG384-project
    ```

2.  **Environment Configuration:**
    Create a `.env` file based on `.env.example`:
    ```bash
    cp .env.example .env
    ```

3.  **Launch with Docker:**
    ```bash
    docker compose up --build
    ```

---

## 🏗️ System Architecture & Requirements Met

### 🛰️ Core Features
- **Route `/`**: A registration form with real-time validation for adding new people.
- **Route `/people`**: A secure database view where you can **List**, **Edit**, and **Delete** personnel records.
- **Database Init**: Uses `db/init.sql` to automatically create the `people` table (id, full_name, email) on startup.

### 🐳 Docker Orchestration
- **Container Networking**: Frontend, Backend, and DB communicate seamlessly within the Docker bridge network.
- **Persistence**: PostgreSQL data is preserved via a named volume `pgdata`.
- **Health Checks**: The backend waits for the DB to be `healthy` before starting.

---

## 📝 Assignment Compliance Checklist
- [x] **Database Schema**: `people` table with `id`, `full_name`, and `email` (unique).
- [x] **Backend CRUD**: 
    - `POST /api/people` (Create)
    - `GET /api/people` (Read)
    - `PUT /api/people/:id` (Update)
    - `DELETE /api/people/:id` (Delete)
- [x] **Frontend Routes**: 
    - `/` (Registration Form)
    - `/people` (People Table)
- [x] **Database Init**: `init.sql` mounted to `/docker-entrypoint-initdb.d/`.
- [x] **Environment Variables**: `.env.example` provided and used by backend.

---

## 🎨 Creative Design
Maintaining the **Cyberpunk / Terminal** aesthetic:
- **GSAP Animations**: Fluid transitions between registration and database views.
- **Interactive Terminal UI**: High-fidelity terminal emulator for data entry.
- **Responsive Table**: Engineered for clarity and functionality across all screens.

---

<p align="center">
  Developed with ❤️ by <b>Cem Özal</b><br>
  <i>SENG-384 Docker Assignment - 202228203</i>
</p>
