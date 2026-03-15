# <p align="center">🚀 CemManagement - Personnel Management System (SENG-384)</p>

<p align="center">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
</p>

---

## 🌟 Overview
**CemManagement** is a secure, containerized full-stack application developed for the **SENG-384 Docker Assignment**. It provides a professional interface for managing personnel records with a complete CRUD (Create, Read, Update, Delete) lifecycle, fully integrated with a containerized PostgreSQL database.

---

## 📸 Screenshots

### 🖥️ Registration Portal
<p align="center">
  <img src="screenshots/form.png" width="800" alt="Registration Form" />
</p>

### 📊 Personnel Database
<p align="center">
  <img src="screenshots/table.png" width="800" alt="People Table" />
</p>

---

## 🏗️ System Architecture & Requirements Met

### 🛰️ Core Features
- **Route `/`**: A high-fidelity registration form with real-time validation for adding personnel.
- **Route `/people`**: A secure database view where authorized users can **List**, **Edit**, and **Delete** records.
- **Database Initialization**: Uses `db/init.sql` to automatically provision the `people` table (id, full_name, email) on container startup.

### 🐳 Docker Orchestration
- **Container Networking**: Frontend, Backend, and Database communicate seamlessly within a private Docker bridge network.
- **Persistence**: Relational data is preserved across container restarts via the `pgdata` named volume.
- **Health Checks**: The backend implementation includes retry logic and waits for the PostgreSQL service to be `healthy`.

---

## 🛠️ Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/cozalss/SENG384-project.git
    cd SENG384-project
    ```

2.  **Environment Configuration:**
    Create a `.env` file based on the provided example:
    ```bash
    cp .env.example .env
    ```

3.  **Launch with Docker:**
    Make sure Docker Desktop is running, then execute:
    ```bash
    docker compose up --build
    ```

4.  **Verify Services:**
    Access the interactive dashboard at `http://localhost:5173`.

---

## 📝 Assignment Compliance Checklist
- [x] **Database Schema**: `people` table with `id`, `full_name`, and `email` (unique constraint).
- [x] **Backend CRUD API**: Managed through Express.js with PostgreSQL integration.
- [x] **React Routing**: Multi-page navigation for registration and data management.
- [x] **Dockerization**: Independent Dockerfiles for each service.
- [x] **Orchestration**: Managed via `docker-compose.yml` with health checks.

---

<p align="center">
  Developed with ❤️ by <b>Cem Özal</b><br>
  <i>SENG-384 Docker Assignment - 202228203</i>
</p>