const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const net = require('net');
const path = require('path');
const connectDB = require('./config/db');
const freePort = require('./utils/freePort');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route files
const authRoutes = require('./routes/authRoutes');
const hostelRoutes = require('./routes/hostelRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Models for initial empty check
const Hostel = require('./models/Hostel');

// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Serve frontend public images statically if requested directly from backend
app.use('/images', express.static(path.join(__dirname, '../frontend/public/images')));

// Base route / health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'STAYGUARD API Server is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Reseed endpoint for demo resetting
app.post('/api/reseed', async (req, res, next) => {
  try {
    const { seedData } = require('./utils/seeder');
    await seedData();
    res.json({ success: true, message: 'Database reseeded successfully with authentic Indian hostels & PGs data' });
  } catch (err) {
    next(err);
  }
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '5000', 10);

/**
 * Checks if a port is currently open for binding
 */
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false);
        } else {
          resolve(true);
        }
      })
      .once('listening', () => {
        tester.once('close', () => resolve(true)).close();
      })
      .listen(port);
  });
};

/**
 * Robust server bootstrapper
 */
const startServer = async () => {
  try {
    // Check if port is available; if not, free it automatically so server can bind cleanly
    const portFree = await isPortAvailable(PORT);
    if (!portFree) {
      console.log(`⚠️ Port ${PORT} is occupied. Freeing port ${PORT} for clean startup...`);
      freePort(PORT);
      // Brief pause to allow OS socket release
      await new Promise((r) => setTimeout(r, 600));
    }

    // Connect to database (with automatic in-memory MongoDB fallback)
    await connectDB();

    // Auto-seed if database is empty
    try {
      const hostelCount = await Hostel.countDocuments();
      if (hostelCount === 0) {
        console.log('🌱 Database is empty, auto-populating seed demo data...');
        const { seedData } = require('./utils/seeder');
        await seedData();
      }
    } catch (err) {
      console.log('Database check completed:', err.message);
    }

    // Start Express HTTP Server
    const server = app.listen(PORT, () => {
      console.log(`🚀 STAYGUARD Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n⚠️ Port ${PORT} became occupied during startup.`);
        console.log(`💡 Freeing port ${PORT} and retrying...`);
        freePort(PORT);
        setTimeout(() => {
          app.listen(PORT, () => {
            console.log(`🚀 STAYGUARD Server recovered & running on http://localhost:${PORT}`);
          });
        }, 1000);
      } else {
        console.error(`❌ Server error: ${err.message}`);
      }
    });

    // Graceful termination
    const handleExit = () => {
      console.log('\n🛑 Shutting down STAYGUARD server...');
      server.close(() => {
        console.log('👋 Server closed cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);
  } catch (startupError) {
    console.error('❌ Critical startup error:', startupError);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
});

startServer();
