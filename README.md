# 📚 Complete Updated README.md

Here's the full updated README for your project – ready to copy and paste.

---

## 📄 `README.md`

```markdown
# 🏗️ FixMyBlock Nepal

> A modern civic reporting platform that connects citizens with local authorities to fix infrastructure issues in Nepal.

## 🌐 Live Demo

| App | URL |
|-----|-----|
| **Citizen App** | [https://sonu56216.github.io/Fixmyblock-nepal/](https://sonu56216.github.io/Fixmyblock-nepal/) |
| **Admin Login** | [https://sonu56216.github.io/Fixmyblock-nepal/login.html](https://sonu56216.github.io/Fixmyblock-nepal/login.html) |

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Database Structure](#-database-structure)
- [Admin Credentials](#-admin-credentials)
- [Setup & Installation](#-setup--installation)
- [Firebase Setup](#-firebase-setup)
- [Cloud Functions (Email Alerts)](#-cloud-functions-email-alerts)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Future Scope](#-future-scope)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**FixMyBlock Nepal** is a civic technology platform that allows Nepali citizens to:

- ✅ Report infrastructure issues (potholes, streetlights, drainage, garbage, landslides)
- ✅ Upload photos (up to 5 per report)
- ✅ Mark reports as **Emergency** (highlighted in red for admins)
- ✅ Track report status in real-time
- ✅ Support existing reports ("I'm Also Affected")
- ✅ Submit multiple issues at once (bulk reporting)

For **government administrators**, it provides:

- ✅ Real-time dashboard with all reports
- ✅ **Emergency reports highlighted in red**
- ✅ Priority scoring based on community support
- ✅ Status management (Submitted → In Progress → Resolved)
- ✅ Bulk status updates
- ✅ Activity logging
- ✅ Excel export
- ✅ **Email alerts on admin login** (via SendGrid)

---

## ✨ Features

### 👤 Citizen Features

| Feature | Description |
|---------|-------------|
| 📝 **Bulk Reporting** | Submit up to 10 issues at once |
| 📸 **Multiple Photos** | Upload up to 5 photos per report entry |
| 🗺️ **Map Location Picker** | Click on map or drag marker to set exact location |
| 📍 **GPS Location** | Auto-detect location using device GPS |
| 🚨 **Emergency Reports** | Mark reports as urgent – highlighted in red for admins |
| 📋 **Real-time Updates** | See reports update instantly without refreshing |
| 🔍 **Duplicate Detection** | Prevents multiple reports for same issue |
| 🤝 **Community Support** | "I'm Also Affected" – support existing reports |
| 🏷️ **Priority System** | Auto-calculated based on affected count |
| 🇳🇵 **Language Toggle** | Switch between English and Nepali |
| 🌓 **Dark/Light Theme** | Toggle between dark and light modes |
| 📱 **Mobile Responsive** | Works on all devices |
| 📶 **Offline Support** | Detects offline/online status |

### 👑 Admin Features

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Real-time stats: Total, Submitted, In Progress, Resolved, Emergency |
| 🔴 **Emergency Highlighting** | Emergency reports shown with red background and flashing badge |
| 📋 **Report Management** | View, filter, sort, and manage all reports |
| 🏷️ **Priority Badges** | Visual indicators (Low, Medium, High, Critical) |
| 🔄 **Status Updates** | Change report status instantly |
| 🗑️ **Delete Reports** | Remove invalid or spam reports |
| 🔍 **Search & Filter** | Find reports by ID, location, description, priority |
| 📈 **Sort Options** | Newest, Oldest, Most Supported, Highest Priority |
| 📦 **Bulk Status Update** | Select multiple reports and update status at once |
| 📊 **Export Excel** | Download all data as CSV for analysis |
| 🗺️ **Map View** | See report locations on interactive map |
| 📧 **Login Email Alert** | Receive email when admin logs in (via SendGrid) |
| 📋 **Activity Log** | Track all admin actions |
| 🔐 **Secure Login** | Admin-only access with credentials + security code |

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) | UI and interactivity |
| **Backend** | Firebase (Firestore, Authentication, Functions) | Database, auth, serverless functions |
| **Maps** | Leaflet + OpenStreetMap | Interactive maps (free, no API key) |
| **Photos** | ImgBB API | Free image hosting |
| **Email Alerts** | SendGrid API | Admin login notifications |
| **Hosting** | GitHub Pages, Firebase Hosting | Live deployment |
| **Icons** | Font Awesome | UI icons |
| **Fonts** | Google Fonts (Inter) | Modern typography |

---

## 📁 Project Structure

```
FixMyBlock-Nepal/
│
├── index.html              # Citizen reporting app
├── login.html              # Admin login page
├── admin.html              # Admin dashboard
│
├── css/
│   ├── style.css           # Main styles
│   ├── admin.css           # Admin styles
│   └── responsive.css      # Mobile responsive
│
├── js/
│   ├── firebase-config.js  # Firebase configuration
│   ├── app.js              # Main app logic
│   ├── admin.js            # Admin dashboard logic
│   ├── auth.js             # Authentication logic
│   ├── report.js           # Report CRUD operations
│   ├── duplicate-check.js  # Duplicate detection
│   ├── haversine.js        # GPS distance calculation
│   ├── priority.js         # Priority calculation
│   ├── support.js          # Community support logic
│   ├── storage.js          # Photo upload (ImgBB)
│   ├── utils.js            # Utility functions
│   ├── translations.js     # English/Nepali translations
│   └── map-utils.js        # Leaflet map utilities
│
├── functions/
│   ├── index.js            # Cloud Functions (email alerts)
│   └── package.json        # Functions dependencies
│
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Firestore indexes
├── firebase.json           # Firebase configuration
├── .firebaserc             # Firebase project reference
├── package.json            # Project dependencies
└── README.md               # This file
```

---

## 🗄️ Database Structure

### `reports` Collection

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Auto-generated document ID |
| `category` | String | pothole, streetlight, drainage, garbage, landslide |
| `description` | String | User's description of the issue |
| `location` | String | Address or coordinate string |
| `latitude` | Number | GPS latitude |
| `longitude` | Number | GPS longitude |
| `photoUrls` | Array | List of ImgBB image URLs (up to 5) |
| `status` | String | submitted, reviewing, in_progress, resolved, rejected |
| `submittedBy` | String | User's name (optional) |
| `createdAt` | Timestamp | Date/time of submission |
| `updatedAt` | String | Last update timestamp |
| `affectedCount` | Number | Number of citizens affected |
| `supportedBy` | Array | List of user IDs who supported |
| `priority` | String | LOW, MEDIUM, HIGH, CRITICAL |
| `isEmergency` | Boolean | True if marked as emergency |
| `rating` | Number | Average rating (0-5) |
| `ratingCount` | Number | Number of ratings |

### `admins` Collection

| Field | Type | Description |
|-------|------|-------------|
| `email` | String | Admin's email address |
| `role` | String | "admin" |
| `createdAt` | Timestamp | Creation date |

### `admin_logs` Collection

| Field | Type | Description |
|-------|------|-------------|
| `action` | String | Action performed |
| `reportId` | String | Affected report ID |
| `adminId` | String | Admin's UID |
| `adminEmail` | String | Admin's email |
| `details` | Object | Additional details |
| `timestamp` | Timestamp | Time of action |

---

## 🔑 Admin Credentials

| Field | Value |
|-------|-------|
| **Email** | `admin@fixmyblock.gov.np` |
| **Password** | `admin123` |
| **Security Code** | `1234` |

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js (v16+)
- Firebase CLI
- GitHub account
- SendGrid account (free tier)

### Step 1: Clone or Download

```bash
git clone https://github.com/SONU56216/Fixmyblock-nepal.git
cd Fixmyblock-nepal
```

### Step 2: Install Dependencies

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Install functions dependencies
cd functions
npm install
cd ..
```

### Step 3: Set Up Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable:
   - Authentication (Email/Password)
   - Firestore Database
   - Cloud Functions

3. Get your Firebase config and update all HTML files:
   - `index.html`
   - `login.html`
   - `admin.html`

### Step 4: Set Up ImgBB API Key

1. Go to [api.imgbb.com](https://api.imgbb.com)
2. Get your free API key
3. Add it to `index.html`:

```javascript
const IMGBB_API_KEY = 'YOUR_IMGBB_API_KEY';
```

### Step 5: Set Up SendGrid (for Email Alerts)

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create a Sender Identity
3. Generate an API Key
4. Set environment variables:

```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
firebase functions:config:set admin.email="admin@fixmyblock.gov.np"
```

### Step 6: Deploy Firebase Functions

```bash
firebase deploy --only functions
```

### Step 7: Deploy Hosting

```bash
firebase deploy --only hosting
```

---

## 🔥 Firebase Setup

### Authentication

1. Go to Firebase Console → Authentication → Sign-in methods
2. Enable **Email/Password**
3. Create admin user:
   - Email: `admin@fixmyblock.gov.np`
   - Password: `admin123`

### Firestore Database

1. Go to Firebase Console → Firestore → Create database
2. Start in **test mode**
3. Add `admins` collection with admin user document

### Cloud Functions

1. Go to Firebase Console → Functions
2. Ensure the `sendLoginAlert` function is deployed
3. Check logs for any errors

---

## 📧 Cloud Functions (Email Alerts)

### Function: `sendLoginAlert`

This function sends an email when an admin logs into the dashboard.

**Triggers:** Called from `admin.html` on successful admin login

**Email Contains:**
- Admin email
- Display name
- Login time
- IP address (approximate)
- User agent (device/browser)

**Configuration:**

```bash
# Set environment variables
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
firebase functions:config:set admin.email="admin@fixmyblock.gov.np"

# Deploy
firebase deploy --only functions
```

---

## 🚀 Deployment

### GitHub Pages (Frontend)

```bash
# Add all changes
git add .
git commit -m "Update project"
git push origin main
```

Live URL: `https://sonu56216.github.io/Fixmyblock-nepal/`

### Firebase Hosting (Frontend + Functions)

```bash
# Deploy hosting
firebase deploy --only hosting

# Deploy functions
firebase deploy --only functions

# Deploy everything
firebase deploy
```

---

## 🧪 Testing

### Citizen Flow

| Test | Expected Result |
|------|-----------------|
| Submit report | ✅ Report appears in Firestore |
| Upload photos | ✅ Photos appear in admin |
| Mark emergency | ✅ Admin sees red badge |
| Language toggle | ✅ Text switches to Nepali |
| Dark theme | ✅ Colors change |
| Bulk reporting | ✅ Multiple reports submitted |

### Admin Flow

| Test | Expected Result |
|------|-----------------|
| Login | ✅ Dashboard loads |
| View reports | ✅ All reports displayed |
| Emergency reports | ✅ Red background + flashing badge |
| Update status | ✅ Status changes instantly |
| Delete report | ✅ Report removed |
| Export Excel | ✅ CSV downloads |
| Login alert | ✅ Email received |
| Bulk update | ✅ Multiple reports updated |

---

## 🔮 Future Scope

| Feature | Priority |
|---------|----------|
| Mobile App (APK) | High |
| Push Notifications | High |
| Full Nepali Support | High |
| Interactive Map View | Medium |
| Citizen Login System | Medium |
| Advanced Analytics | Medium |
| WhatsApp Integration | Medium |
| AI Auto-Categorization | Low |
| Google Sheets Sync | Low |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the **MIT License**.

---

## 🙏 Acknowledgments

- **OpenStreetMap** for free map tiles
- **ImgBB** for free image hosting
- **SendGrid** for free email API
- **Firebase** for real-time backend
- **GitHub Pages** for free hosting
- **Font Awesome** for beautiful icons

---

## 📞 Contact

**Project Maintainer:** Sonu Kumar Sah  
**GitHub:** [SONU56216](https://github.com/SONU56216)  
**Project URL:** [https://sonu56216.github.io/Fixmyblock-nepal/](https://sonu56216.github.io/Fixmyblock-nepal/)

---

**FixMyBlock Nepal – Building a better Nepal, one reported pothole at a time.** 🇳🇵🚀

---

*Documentation Version: 3.0*  
*Last Updated: August 2026*  
*Project Status: ✅ Live & Operational*
```



