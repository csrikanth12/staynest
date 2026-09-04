const Booking = require('../models/Booking');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const User = require('../models/User');

// @desc    Get Owner Dashboard Overview KPIs & Charts
// @route   GET /api/analytics/dashboard
// @access  Private (Owner/Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const ownerHostels = await Hostel.find({ owner: req.user._id }).select('_id');
    const hostelIds = ownerHostels.map((h) => h._id);

    // 1. Total Bookings
    const totalBookings = await Booking.countDocuments({ hostel: { $in: hostelIds } });

    // 2. Today's Bookings
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayBookings = await Booking.countDocuments({
      hostel: { $in: hostelIds },
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });

    // 3. Total Customers (Unique customers who have booked at owner's hostels)
    const uniqueCustomers = await Booking.distinct('customer', { hostel: { $in: hostelIds } });
    const totalCustomers = uniqueCustomers.length;

    // 4. Available Rooms / Beds
    const rooms = await Room.find({ hostel: { $in: hostelIds } });
    const availableRooms = rooms.filter((r) => r.availableBeds > 0).length;
    const totalRooms = rooms.length;
    const totalBeds = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
    const availableBeds = rooms.reduce((acc, r) => acc + (r.availableBeds || 0), 0);
    const occupiedBeds = totalBeds - availableBeds;

    // 5. Total Revenue (Paid bookings)
    const paidBookings = await Booking.find({
      hostel: { $in: hostelIds },
      paymentStatus: 'Paid',
    });
    const totalRevenue = paidBookings.reduce((acc, b) => acc + b.totalAmount, 0);

    // 6. Recent Bookings
    const recentBookings = await Booking.find({ hostel: { $in: hostelIds } })
      .populate('customer', 'name email')
      .populate('hostel', 'name')
      .populate('room', 'roomNumber roomType')
      .sort({ createdAt: -1 })
      .limit(5);

    // 7. Booking & Revenue Trend (Last 6-12 Months or recent 7 days)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const trendData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthLabel = months[startOfMonth.getMonth()];

      const monthBookings = await Booking.find({
        hostel: { $in: hostelIds },
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      const monthRevenue = monthBookings
        .filter((b) => b.paymentStatus === 'Paid')
        .reduce((sum, b) => sum + b.totalAmount, 0);

      trendData.push({
        month: monthLabel,
        bookings: monthBookings.length,
        revenue: monthRevenue,
      });
    }

    // 8. Room Occupancy breakdown by type
    const occupancyByType = {};
    rooms.forEach((r) => {
      const type = r.roomType || 'Standard';
      if (!occupancyByType[type]) {
        occupancyByType[type] = { total: 0, occupied: 0, available: 0 };
      }
      occupancyByType[type].total += r.capacity;
      occupancyByType[type].available += r.availableBeds;
      occupancyByType[type].occupied += Math.max(0, r.capacity - r.availableBeds);
    });

    const occupancyChart = Object.keys(occupancyByType).map((type) => ({
      name: type,
      total: occupancyByType[type].total,
      occupied: occupancyByType[type].occupied,
      available: occupancyByType[type].available,
      rate:
        occupancyByType[type].total > 0
          ? Math.round((occupancyByType[type].occupied / occupancyByType[type].total) * 100)
          : 0,
    }));

    res.json({
      success: true,
      data: {
        kpis: {
          totalBookings,
          todayBookings,
          totalCustomers,
          availableRooms,
          totalRooms,
          availableBeds,
          totalBeds,
          occupiedBeds,
          occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
          totalRevenue,
        },
        trendData,
        occupancyChart,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Owner Revenue Analytics
// @route   GET /api/analytics/revenue
// @access  Private (Owner/Admin)
const getRevenueAnalytics = async (req, res, next) => {
  try {
    const { timeframe = '30d' } = req.query;
    const ownerHostels = await Hostel.find({ owner: req.user._id }).select('_id');
    const hostelIds = ownerHostels.map((h) => h._id);

    const now = new Date();
    let startDate = new Date();

    if (timeframe === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeframe === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeframe === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (timeframe === '90d') {
      startDate.setDate(now.getDate() - 90);
    } else if (timeframe === 'this_year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const allPaidBookings = await Booking.find({
      hostel: { $in: hostelIds },
      paymentStatus: 'Paid',
    });

    const filteredPaidBookings = allPaidBookings.filter(
      (b) => new Date(b.createdAt) >= startDate
    );

    const totalRevenue = allPaidBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const periodRevenue = filteredPaidBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    // Today's revenue
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayRevenue = allPaidBookings
      .filter((b) => new Date(b.createdAt) >= startOfToday)
      .reduce((sum, b) => sum + b.totalAmount, 0);

    // This month's revenue
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = allPaidBookings
      .filter((b) => new Date(b.createdAt) >= startOfMonth)
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const avgBookingValue =
      filteredPaidBookings.length > 0
        ? Math.round(periodRevenue / filteredPaidBookings.length)
        : 0;

    // Daily / weekly trend series
    const dailyMap = {};
    filteredPaidBookings.forEach((b) => {
      const dateKey = new Date(b.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });
      dailyMap[dateKey] = (dailyMap[dateKey] || 0) + b.totalAmount;
    });

    const revenueTimeline = Object.keys(dailyMap).map((date) => ({
      date,
      revenue: dailyMap[date],
    }));

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          periodRevenue,
          todayRevenue,
          monthlyRevenue,
          avgBookingValue,
          paidBookingsCount: filteredPaidBookings.length,
        },
        revenueTimeline: revenueTimeline.length > 0 ? revenueTimeline : [{ date: 'Today', revenue: todayRevenue }],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Owner Bookings Analytics
// @route   GET /api/analytics/bookings
// @access  Private (Owner/Admin)
const getBookingsAnalytics = async (req, res, next) => {
  try {
    const ownerHostels = await Hostel.find({ owner: req.user._id }).select('_id name');
    const hostelIds = ownerHostels.map((h) => h._id);

    const bookings = await Booking.find({ hostel: { $in: hostelIds } });

    // Status breakdown
    const statusCounts = {
      Confirmed: 0,
      Pending: 0,
      Cancelled: 0,
      Completed: 0,
    };

    bookings.forEach((b) => {
      if (statusCounts[b.bookingStatus] !== undefined) {
        statusCounts[b.bookingStatus]++;
      }
    });

    const statusChart = Object.keys(statusCounts).map((status) => ({
      name: status,
      value: statusCounts[status],
    }));

    // Bookings per hostel
    const hostelBookingsMap = {};
    bookings.forEach((b) => {
      const hId = b.hostel.toString();
      hostelBookingsMap[hId] = (hostelBookingsMap[hId] || 0) + 1;
    });

    const hostelDistribution = ownerHostels.map((h) => ({
      name: h.name,
      bookings: hostelBookingsMap[h._id.toString()] || 0,
    }));

    res.json({
      success: true,
      data: {
        total: bookings.length,
        statusCounts,
        statusChart,
        hostelDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getRevenueAnalytics,
  getBookingsAnalytics,
};
