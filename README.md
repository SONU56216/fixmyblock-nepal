# FixMyBlock Nepal

## Civic Issue Reporting App

FixMyBlock Nepal is a citizen reporting app that allows people to report infrastructure issues like potholes, broken streetlights, drainage problems, and garbage collection issues directly to local authorities.

### Features

- 📱 **Citizen Reporting** - Report issues with photos and GPS location
- 🔍 **Real-time Feed** - View all reports instantly
- 👑 **Admin Dashboard** - Manage and track reports
- 📊 **Excel Export** - Download all reports as CSV
- 🔐 **Secure Admin Login** - Only authorized admins can access the dashboard
- 📷 **Photo Upload** - Upload photos with reports
- 📍 **GPS Location** - Auto-capture location
- 📱 **Mobile Responsive** - Works on all devices

### Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Hosting**: Firebase Hosting

### Setup Instructions

1. **Create Firebase Project**
   - Go to [console.firebase.google.com](https://console.firebase.google.com)
   - Create a new project

2. **Enable Services**
   - Authentication (Email/Password)
   - Firestore Database
   - Storage

3. **Update Configuration**
   - Copy your Firebase config to `js/firebase-config.js`

4. **Create Admin User**
   - Run the createAdmin function in `js/auth.js` (run once)

5. **Deploy**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   firebase deploy