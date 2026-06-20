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

### Configure Gmail email verification

New accounts must verify a six-digit code sent by email. Use a Gmail App Password, not your normal
Google account password.

1. Enable 2-Step Verification on the Google account.
2. Open Google Account App Passwords: `https://myaccount.google.com/apppasswords`
3. Create an app password named `CareerBridge`.
4. Store the generated 16-character password in an environment variable without spaces. Do not add it to Git.

Linux/macOS:

```bash
export SMTP_USERNAME="your-gmail-address@gmail.com"
export SMTP_APP_PASSWORD="your-16-character-app-password"
export OTP_SECRET="$(openssl rand -hex 32)"
```

Windows PowerShell, for the current terminal:

```powershell
$env:SMTP_USERNAME="your-gmail-address@gmail.com"
$env:SMTP_APP_PASSWORD="your-16-character-app-password"
$env:OTP_SECRET="replace-with-a-long-random-secret"
```

The default SMTP settings use Gmail:

```text
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_AUTH=true
SMTP_STARTTLS=true
```

These defaults can be overridden with environment variables when another SMTP server is used.

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
