# Installation Guide

This project uses a Java Servlet backend with JDBC and an embedded H2 database. You do not need Docker or PostgreSQL to run it.

## 1. Install Java JDK 17

### Windows

Open PowerShell as a normal user and run:

```powershell
winget install EclipseAdoptium.Temurin.17.JDK
```

Close and reopen PowerShell, then check Java:

```powershell
java -version
javac -version
```

Both commands should show version 17 or newer.

### Ubuntu/Debian Linux

```bash
sudo apt update
sudo apt install openjdk-17-jdk
java -version
javac -version
```

### macOS

```bash
brew install openjdk@17
java -version
javac -version
```

## 2. Install Maven

Maven builds and runs the Java backend.

### Windows

```powershell
winget install Apache.Maven
```

Close and reopen PowerShell, then check Maven:

```powershell
mvn -version
```

### Ubuntu/Debian Linux

```bash
sudo apt install maven
mvn -version
```

### macOS

```bash
brew install maven
mvn -version
```

## 3. Run the Backend

From the project root:

```bash
cd backend
mvn jetty:run
```

The backend will start at:

```text
http://localhost:8080
```

Test it in a browser:

```text
http://localhost:8080/api/health
```

You should see:

```json
{"status":"ok"}
```

## 4. Default Admin Login

```text
Email: admin@example.com
Password: admin123
```

## 5. Database

The backend uses JDBC with an embedded H2 file database. The database file is created automatically when the backend starts:

```text
data/jobsite
```

No Docker, PostgreSQL installation, or manual database setup is required.

## 6. Useful Backend Commands

Run backend:

```bash
cd backend
mvn jetty:run
```

Package backend as a WAR file:

```bash
cd backend
mvn package
```

Clean build files:

```bash
cd backend
mvn clean
```

## 7. Run the Frontend

Install Node.js 20 or newer. On Windows:

```powershell
winget install OpenJS.NodeJS.LTS
```

Close and reopen PowerShell, then check Node:

```powershell
node -v
npm -v
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Run the React app:

```bash
npm run dev
```

The frontend will start at:

```text
http://localhost:5173
```

Build the frontend:

```bash
npm run build
```
