# STAYGUARD - Hostel Booking and Management Platform

> *"Find your stay. Book with confidence."*

STAYGUARD is a modern, full-stack hostel booking and property management platform designed for travelers, backpackers, students, and hostel owners across India. Built with React (Vite), Express.js, MongoDB (Mongoose), and Razorpay test mode integration.

---

## 🌟 Key Highlights & Features

### 👤 Customer Experience
- **Hero & Location Search**: Search by destination city (Hyderabad, Bangalore, Goa, Mumbai, Delhi, Chennai, Pune), check-in / check-out dates, and number of guests.
- **Explore & Multi-Filter Engine**: Filter by City, Max Price/night slider (₹), Star Rating (3.5+ to 4.5+), and Amenities (Wi-Fi, AC, Locker, Breakfast, Pool, Workstation).
- **Sorting Options**: Recommended, Price: Low to High, Price: High to Low, Highest Rated.
- **Hostel Property Details**: Multi-photo gallery, house rules, cancellation policy, direct contact, and verified guest reviews.
- **Room Selection & Live Bed Counts**: Choose Private Rooms, 4-Bed Dorms, 6-Bed Dorms, or 8-Bed Dorms with live remaining bed counts.
- **Transparent Price Breakdown**: Accurate calculation of nights, base room charges, and 12% GST in Indian Rupees (₹).
- **Razorpay Test Mode Payment**: Seamless Razorpay checkout supporting UPI (Google Pay, PhonePe, Paytm), Cards, and Net Banking.
- **Booking Confirmation Pass**: Printable guest voucher with reference code, QR/status badge, and celebration confetti.
- **My Bookings Dashboard**: Manage Upcoming, Past, and Cancelled reservations with instant cancellation support.
- **User Profile Management**: Update full name, phone number, avatar URL, and secure password.

### 🏢 Hostel Owner Portal (Zero AI / Pure Business Operations)
- **Operations Dashboard**: Real-time KPI summary (Total Bookings, Today's Bookings, Total Customers, Available Beds, Total Revenue) and interactive **Recharts** (Monthly Revenue Area Chart, Booking Volume Bar Chart, Room Occupancy Breakdown).
- **Booking Management**: View, filter, and search reservations with live status controls (`Confirmed`, `Pending`, `Cancelled`, `Completed`) and payment states (`Paid`, `Pending`, `Refunded`, `Failed`).
- **Hostel Property Management**: Add, edit, delete, and manage hostel listings with address, photos, amenities, and policies.
- **Room Inventory Control**: Manage dorm rooms and private suites, set prices per night, and adjust live available beds (+ / -).
- **Customer Directory**: Track registered travelers, total bookings, last visit date, and total guest lifetime spending.
- **Payments Ledger**: View transparent transaction logs with Razorpay Payment IDs, customer details, and settlement statuses.
- **Financial Analytics**: Timeframe filters (`Today`, `7 Days`, `30 Days`, `90 Days`, `This Year`), Revenue Timeline chart, and Booking Distribution by Hostel.
- **Guest Feedback & Reviews**: View traveler ratings and post official property management replies.
- **Owner Profile Settings**: Update manager contact details, avatar, and security passwords.

---

## 📁 Project Structure

```
STAYGUARD/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   │   └── images/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── HostelCard.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FilterSidebar.jsx
│   │   │   ├── RoomCard.jsx
│   │   │   ├── BookingCard.jsx
│   │   │   ├── ReviewCard.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── customer/
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── ExploreHostels.jsx
│   │   │   │   ├── HostelDetails.jsx
│   │   │   │   ├── Booking.jsx
│   │   │   │   ├── Payment.jsx
│   │   │   │   ├── BookingConfirmation.jsx
│   │   │   │   ├── MyBookings.jsx
│   │   │   │   └── Profile.jsx
│   │   │   ├── owner/
│   │   │   │   ├── OwnerDashboard.jsx
│   │   │   │   ├── OwnerBookings.jsx
│   │   │   │   ├── OwnerHostels.jsx
│   │   │   │   ├── OwnerRooms.jsx
│   │   │   │   ├── OwnerCustomers.jsx
│   │   │   │   ├── OwnerPayments.jsx
│   │   │   │   ├── OwnerRevenue.jsx
│   │   │   │   ├── OwnerReviews.jsx
│   │   │   │   └── OwnerSettings.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── NotFound.jsx
│   │   ├── layouts/
│   │   │   ├── CustomerLayout.jsx
│   │   │   └── OwnerLayout.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── hostelService.js
│   │   │   ├── bookingService.js
│   │   │   ├── paymentService.js
│   │   │   ├── reviewService.js
│   │   │   └── analyticsService.js
│   │   ├── data/
│   │   │   └── hostels.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── hostelController.js
│   │   ├── roomController.js
│   │   ├── bookingController.js
│   │   ├── paymentController.js
│   │   ├── reviewController.js
│   │   └── analyticsController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Hostel.js
│   │   ├── Room.js
│   │   ├── Booking.js
│   │   ├── Payment.js
│   │   ├── Review.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── hostelRoutes.js
│   │   ├── roomRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── analyticsRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── seeder.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .env.example
│
└── README.md
```

---

## 🔑 Demo Accounts

Use these pre-configured accounts for instant login:

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Hostel Owner** | `owner@stayguard.com` | `password123` | Full Owner Dashboard & Property Management |
| **Customer** | `customer@stayguard.com` | `password123` | Customer Stays, Bookings & Payment Gateway |

*(Quick one-click demo login buttons are also built directly into the Login page!)*

---

## 🛠️ Technology Stack & Dependencies

### Frontend (`/frontend`)
- **React 18** + **Vite**
- **React Router DOM 6** (Multi-layout routing & protected role routes)
- **Axios** (JWT interceptor & REST API client)
- **Bootstrap 5** + **Vanilla CSS Design Tokens**
- **Lucide React** (Modern clean startup iconography)
- **Recharts** (Area, Bar, and Line analytics charts)
- **Canvas Confetti** (Booking celebration effect)

### Backend (`/backend`)
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose** (With automatic in-memory MongoDB fallback for zero-friction local execution)
- **JWT (JSON Web Tokens)** + **bcryptjs** (Secure password hashing)
- **Razorpay SDK** (Test mode order creation and signature verification)
- **CORS** + **dotenv**

---

## 🚀 Quick Setup & Installation

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Seed Realistic Demo Data (12 Hostels, 40+ Rooms, 25+ Customers, 65+ Bookings, 35+ Reviews)
```bash
cd ../backend
npm run seed
```

---

## ⚙️ Environment Variables

### Backend `.env` (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/stayguard
JWT_SECRET=stayguard_jwt_super_secret_key_2025_secure
RAZORPAY_KEY_ID=rzp_test_stayguard12345
RAZORPAY_KEY_SECRET=stayguard_secret_test_key_98765
```

### Frontend `.env` (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_stayguard12345
```

---

## 🏃 Running the Application

### Start Backend API Server (Port 5000)
```bash
cd backend
npm start
# or npm run dev
```
Backend API will be accessible at: `http://localhost:5000/api`

### Start Frontend Client (Port 5173)
```bash
cd frontend
npm run dev
```
Frontend web application will open at: `http://localhost:5173`

---

## 💳 Razorpay Test Payment Flow
1. Browse hostels and choose your dates and room in `/booking`.
2. Proceed to `/payment/:bookingId`.
3. Choose UPI or Card and click **Pay Securely**.
4. The backend generates a Razorpay test order, verifies the test signature, updates the booking to `Confirmed` and `Paid`, decrements room bed availability, and redirects to `/booking-confirmation/:id`.
5. View and print your official **STAYGUARD PASS** voucher.
