# 🏥 Tbibi — Healthcare Management Portal

![Angular](https://img.shields.io/badge/Angular-17+-DD0031?style=flat-square&logo=angular&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

**Tbibi** is a complete, modern healthcare management platform that connects patients with healthcare professionals — doctors, pharmacists, physiotherapists, and laboratories. It simplifies appointment scheduling, medical record tracking, prescription management, and secures interactions between all stakeholders in the healthcare ecosystem.

---

## ✨ Features

### 🧑‍⚕️ For Patients

- **Registration & authentication** — Secure login with full profile management.
- **Appointment booking** — Dynamic search for doctors by specialty and available time slots.
- **Health monitoring** — Dashboard for chronic disease tracking and real-time vital signs.
- **Prescription history** — Secure, digital access to all issued prescriptions.

### 👨‍⚕️ For Healthcare Professionals

- **Specialized registration** — Select a medical specialty (Cardiology, Neurology, etc.) and securely upload credentials (medical license, diploma).
- **Appointment management** — View, confirm, reschedule, or decline consultation requests.
- **Patient record tracking** — Consolidated overview of patients, procedures, and medical alerts.
- **Notifications** — Email and in-app alerts when new appointments are booked.

### 🛡️ Security & Architecture

- **Multi-role JWT authentication** — Roles for Patient, Doctor, Pharmacist, Physiotherapist, Laboratory, and Admin.
- **Account verification** — Token-based email activation flow.
- **Relational data management** — MySQL with Spring Data JPA & Hibernate.

---

## 🛠️ Tech Stack

| Layer    | Technologies |
|----------|-------------|
| Frontend | Angular 17+, Tailwind CSS, RxJS, Angular Router, JWT Interceptors |
| Backend  | Java Spring Boot 3, Spring Security, JWT |
| Database | MySQL, Hibernate, JPA |
| Tooling  | Lombok, Java Mail Sender, RESTful API |

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- Angular CLI — `npm install -g @angular/cli`
- JDK 17+
- MySQL Server
- Maven

### 1. Database setup

1. Start your MySQL server and create a database named `tbibi`.
2. Open `backend/src/main/resources/application.properties` (or `.yml`).
3. Update the credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/tbibi
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

### 2. Start the backend (Spring Boot)

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

### 3. Start the frontend (Angular)

```bash
cd healthcare-front-office/healthcare-portal
npm install
ng serve
```

The app will be available at `http://localhost:4200`.

---

## 📂 Project Structure

```
Tbibi/
├── backend/                        # Spring Boot — controllers, services, security, DTOs, JPA entities
├── healthcare-front-office/
│   └── healthcare-portal/          # Angular — services, guards, interceptors, views
└── README.md
```

---

## 🤝 Contributing

This project is actively evolving. If you encounter a bug or have ideas to improve the interface or API, feel free to open an issue or submit a pull request.
