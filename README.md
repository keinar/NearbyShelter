# 🛡️ NearbyShelter

NearbyShelter is a comprehensive full-stack application designed to help
users quickly locate nearby bomb shelters during emergencies. It
combines real-time GPS data, crowdsourced shelter locations, and Google
Places API integration to provide the safest route.

------------------------------------------------------------------------

## 🚀 Features

### **User Features**

-   **Real-time Navigation:** Interactive map displaying user location
    and nearby shelters.
-   **Smart Aggregation:** Combines data from a verified backend
    database and Google Maps Places API.
-   **One-Tap Navigation:** Seamless integration with Waze and Google
    Maps.
-   **Crowdsourcing:** Users can submit new shelter locations for
    review.
-   **Localization:** Full support for Hebrew (RTL) and English.

### **Admin Features (Hidden)**

-   **Stealth Access:** Admin interface is hidden from the main UI to
    prevent misuse.
-   **Shelter Management:** Approve or reject user-submitted shelters.
-   **Secure Authentication:** JWT-based protected routes.

------------------------------------------------------------------------

## 🛠 Tech Stack

### **Frontend (Mobile)**

-   React Native (v0.75) + TypeScript\
-   React Navigation (Stack + Tabs)\
-   `react-native-maps` & Google Maps SDK\
-   Axios + hooks\
-   Async Storage

### **Backend (API)**

-   Node.js + Express\
-   MongoDB (Mongoose)\
-   `bcryptjs` (hashing), `jsonwebtoken` (auth), `cors`

------------------------------------------------------------------------

## 📦 Installation

### **Prerequisites**

-   Node.js (\>=18)
-   MongoDB (Local or Atlas)
-   Google Maps API Key

------------------------------------------------------------------------

## 1️⃣ Backend Setup

``` bash
cd backend
npm install
```

Create **.env** file in the backend folder:

    PORT=5001
    MONGO_URI=mongodb://localhost:27017/nearbyshelter
    JWT_SECRET=your_super_secret_key_here

Start the server:

``` bash
npm start
```

------------------------------------------------------------------------

## 2️⃣ Frontend Setup

``` bash
cd frontend
npm install
```

Create **.env** file in the frontend folder:

    API_URL=http://<YOUR_LOCAL_IP>:5001
    GOOGLE_MAPS_API_KEY=your_google_maps_api_key

Run the app:

``` bash
# Android
npm run android

# iOS
npm run ios
```

------------------------------------------------------------------------

## 🔐 Admin Access Guide

The admin interface is intentionally hidden to prevent misuse.

1.  Open the app.\
2.  Locate the **"NearbyShelter"** logo text in the header.\
3.  Tap the logo **7 times rapidly**.\
4.  The Admin Login screen will appear.

------------------------------------------------------------------------

## 📡 API Endpoints

  ----------------------------------------------------------------------------------------
  Method          Endpoint                            Description              Auth
  --------------- ----------------------------------- ------------------------ -----------
  GET             `/api/shelters`                     Get all approved         Public
                                                      shelters                 

  POST            `/api/shelters`                     Submit a new shelter     Public

  POST            `/api/admin/login`                  Admin login              Public

  GET             `/api/admin/shelters/pending`       Get pending shelters     Token

  PATCH           `/api/admin/shelters/approve/:id`   Approve a shelter        Token

  DELETE          `/api/admin/shelters/reject/:id`    Reject a shelter         Token
  ----------------------------------------------------------------------------------------

------------------------------------------------------------------------

## 📄 License

ISC
