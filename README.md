🚗 FLEETFOCUS — Fleet Telemetry Management System
A full-stack application for managing vehicles, drivers, trips, maintenance, and simulated fleet telemetry in one place.

FLEETFOCUS brings everyday fleet operations into a centralized web application. It helps organize vehicle records, driver information, trip dispatch, and maintenance activities, while demonstrating how telemetry monitoring can fit into a fleet management workflow.
Project type: Academic team project
Development environment: AmyPO Coder
Telemetry scope: Simulated data; no physical GPS or vehicle sensor integration is claimed.

Contents
- Overview
- Features
- Application Screenshots
- Technology Stack
- Architecture
- Project Structure
- Getting Started
- Configuration and Security
- Future Enhancements
- Project Credits
Overview
Managing a fleet involves coordinating vehicles, drivers, trips, and maintenance records. When these activities are handled separately, tracking operational information becomes more difficult.

FLEETFOCUS explores a centralized approach through a React frontend, a Spring Boot REST API, and a MySQL database. It was developed as a practical full-stack engineering project involving application workflows, database integration, authentication, and backend services.
Features
- Vehicle management: Organize vehicle records, registration details, status, and mileage.
- Driver management: Maintain driver information for fleet operations.
- Trip and dispatch management: Coordinate trips and vehicle/driver assignments.
- Maintenance tracking: Record and review vehicle maintenance information.
- Fleet monitoring: Explore monitoring workflows using simulated telemetry data.
- Authentication: JWT-based login with Spring Security integration.
- Integrated interface: Connect React screens to backend REST APIs for data management.
Application Screenshots
Dashboard
<img width="1600" height="766" alt="dashboard" src="https://github.com/user-attachments/assets/e712a819-a465-4630-9fd7-fc95aac5dbef" />

Live Fleet Monitoring
<img width="1600" height="764" alt="livefleet" src="https://github.com/user-attachments/assets/fca29b91-7ce8-499a-a24e-85bf69afd717" />

Trip Management
<img width="1600" height="572" alt="trips" src="https://github.com/user-attachments/assets/eb4ea33b-5ffe-4265-985e-cb040aa0aa2b" />

Dispatch
<img width="1600" height="693" alt="dispatch" src="https://github.com/user-attachments/assets/396e3eb0-ecd1-4ca0-8064-04c2cf4196b3" />

Vehicle Management
<img width="1600" height="623" alt="vehicles" src="https://github.com/user-attachments/assets/0ae06d72-c924-4257-af5e-de330c8c58c1" />

Driver Management
<img width="1600" height="765" alt="driver" src="https://github.com/user-attachments/assets/f5b4d1b1-8e7e-4360-99ac-06c083aed0cb" />

Maintenance
<img width="1600" height="640" alt="maintanance" src="https://github.com/user-attachments/assets/605fc907-4708-430e-a37a-3e5c1a0f29d8" />

Login

<img width="533" height="513" alt="loginpage" src="https://github.com/user-attachments/assets/13f4fda4-5759-4c51-adc0-09d34d345eee" />

Registration

<img width="510" height="843" alt="register" src="https://github.com/user-attachments/assets/07feb176-f91f-4ce8-b0ff-11cc3f464070" />


Screenshot paths reflect the current filenames in the screenshots/ directory, including maintanance.jpeg.

Technology Stack
Layer	Technologies
Frontend	React, JavaScript, HTML, CSS
State management	Redux Toolkit
API communication	Axios, REST APIs
Backend	Java, Spring Boot
Security	Spring Security, JWT
Persistence	Spring Data JPA, Hibernate
Database	MySQL
Build tools	Maven, npm


Architecture
<img width="1002" height="1280" alt="mermaid-diagram" src="https://github.com/user-attachments/assets/16a40186-3706-4120-964a-a83a02402b20" />

The diagram is a high-level overview of the application's components, not a deployment diagram.
Project Structure
FLEETFOCUS/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   └── mvnw
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── screenshots/
│   ├── dashboard.jpeg
│   ├── dispatch.jpeg
│   ├── driver.jpeg
│   ├── livefleet.jpeg
│   ├── loginpage.jpeg
│   ├── maintanance.jpeg
│   ├── register.jpeg
│   ├── trips.jpeg
│   └── vehicles.jpeg
├── .gitignore
└── README.md
Getting Started
Prerequisites
- A Java version compatible with backend/pom.xml
- Maven (or the included Maven wrapper)
- Node.js and npm
- MySQL Server
- Git
1. Clone the repository
git clone https://github.com/mshruthi2306/FLEETFOCUS.git
cd FLEETFOCUS
2. Prepare MySQL
Create the database used by your backend configuration. For example:
CREATE DATABASE fleetfocus;
Confirm the database name and connection URL against backend/src/main/resources/application.properties.
3. Configure backend environment variables
The application expects credentials to be supplied locally rather than committed to GitHub. For example, in PowerShell:
$env:DB_USERNAME = "your_local_db_username"
$env:DB_PASSWORD = "your_local_db_password"
$env:JWT_SECRET = "your_own_strong_random_secret_at_least_32_bytes"
These are placeholders, not usable credentials. If your datasource URL uses ${DB_URL}, also set DB_URL to your local JDBC URL. Set environment variables in the terminal used to launch the backend.
4. Start the backend
cd backend
.\mvnw.cmd spring-boot:run
On macOS or Linux, use ./mvnw spring-boot:run. Check the console for the actual backend port.
5. Start the frontend
Open another terminal in the repository's frontend folder:
npm install
npm run dev
Open the local URL printed by the frontend development server. Ensure the frontend API base URL points to the backend's running address.
Startup commands and required configuration may vary with the checked-in project version. Review the backend properties and frontend scripts if your environment differs.

Configuration and Security
- Never commit real database passwords, JWT signing keys, API tokens, or .env files.
- spring.datasource.password should reference an environment variable such as ${DB_PASSWORD}.
- The JWT signing key is read from the JWT_SECRET environment variable.
- Use a securely generated random JWT key with at least 32 bytes of entropy for HS256.
- Rotate any real credentials that were previously exposed, even if they have since been removed from the repository.
- Keep sensitive configuration on the backend; frontend source code is visible to browser users.
The repository demonstrates application-level authentication concepts; it should not be assumed production-hardened without additional security testing and review.
Future Enhancements
- Connect real GPS and vehicle telemetry hardware.
- Add live vehicle locations and route visualization.
- Introduce maintenance reminders and scheduling.
- Build fleet analytics and operational reports.
- Add historical telemetry trends and alerts.
- Expand automated tests and deployment workflows.
These are proposed improvements, not features claimed to be implemented today.
Project Credits
FLEETFOCUS was developed as an academic team project using the AmyPO Coder development environment. The repository documents the application and its full-stack design.

Individual contributions and team member credits can be added here to accurately reflect the work completed by each collaborator.
Thanks for exploring FLEETFOCUS! 🚗
