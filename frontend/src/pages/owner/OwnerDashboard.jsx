import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import analyticsService from '../../services/analyticsService';
import Loader from '../../components/Loader';
import {
  CalendarCheck,
  Calendar,
  Users,
  BedDouble,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  CreditCard,
  Building2,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

const OwnerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await analyticsService.getDashboardStats();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader fullScreen message="Loading business overview..." />;
  }

  const kpis = stats?.kpis || {
    totalBookings: 0,
    todayBookings: 0,
    totalCustomers: 0,
    availableRooms: 0,
    totalRevenue: 0,
    occupancyRate: 0,
  };

  const trendData = stats?.trendData || [];
  const occupancyChart = stats?.occupancyChart || [];
  const recentBookings = stats?.recentBookings || [];

  return (
    <div className="owner-dashboard-page pb-5">
      {/* Top Banner / Welcome */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Hostel Operations Dashboard</h2>
          <p className="text-muted small mb-0">Real-time overview of bookings, revenue, and room availability</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link to="/owner/bookings" className="btn btn-white border rounded-pill px-3 py-1.5 small fw-semibold shadow-sm">
            View All Bookings
          </Link>
          <Link to="/owner/rooms" className="btn btn-stayguard btn-sm rounded-pill px-3">
            + Manage Inventory
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="row g-3 mb-4">
        {/* KPI 1: Total Bookings */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="metric-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted small fw-bold text-uppercase">Total Bookings</span>
              <div className="metric-icon-bubble bg-primary-subtle text-primary">
                <CalendarCheck size={22} />
              </div>
            </div>
            <h3 className="fw-extrabold text-dark mb-1">{kpis.totalBookings.toLocaleString('en-IN')}</h3>
            <div className="d-flex align-items-center gap-1 text-success small fw-semibold">
              <ArrowUpRight size={14} />
              <span>All-time reservations</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Today's Bookings */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="metric-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted small fw-bold text-uppercase">Today's Bookings</span>
              <div className="metric-icon-bubble bg-info-subtle text-info">
                <Clock size={22} />
              </div>
            </div>
            <h3 className="fw-extrabold text-dark mb-1">{kpis.todayBookings}</h3>
            <div className="d-flex align-items-center gap-1 text-muted small">
              <span>New check-in requests</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Total Customers */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="metric-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted small fw-bold text-uppercase">Total Customers</span>
              <div className="metric-icon-bubble bg-warning-subtle text-warning">
                <Users size={22} />
              </div>
            </div>
            <h3 className="fw-extrabold text-dark mb-1">{kpis.totalCustomers.toLocaleString('en-IN')}</h3>
            <div className="d-flex align-items-center gap-1 text-muted small">
              <span>Unique registered guests</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Available Rooms / Beds */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="metric-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted small fw-bold text-uppercase">Available Beds</span>
              <div className="metric-icon-bubble bg-success-subtle text-success">
                <BedDouble size={22} />
              </div>
            </div>
            <h3 className="fw-extrabold text-dark mb-1">
              {kpis.availableBeds || kpis.availableRooms} / {kpis.totalBeds || kpis.totalRooms}
            </h3>
            <div className="d-flex align-items-center gap-1 text-primary small fw-semibold">
              <span>{kpis.occupancyRate}% Occupancy</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Total Revenue */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="metric-card h-100" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted small fw-bold text-uppercase">Total Revenue</span>
              <div className="metric-icon-bubble bg-indigo-subtle text-indigo" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
                <TrendingUp size={22} />
              </div>
            </div>
            <h3 className="fw-extrabold text-primary mb-1">₹{kpis.totalRevenue.toLocaleString('en-IN')}</h3>
            <div className="d-flex align-items-center gap-1 text-success small fw-semibold">
              <span>Paid bookings (INR)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="row g-4 mb-4">
        {/* Chart 1: Revenue & Booking Trend */}
        <div className="col-lg-8">
          <div className="bg-white p-4 rounded-4 border shadow-sm h-100">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <h5 className="fw-bold text-dark mb-0">Revenue & Booking Trends</h5>
                <small className="text-muted">Monthly performance over the last 6 months</small>
              </div>
              <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1.5 fw-semibold">
                Monthly Breakdown
              </span>
            </div>

            <div style={{ height: '320px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis yAxisId="left" stroke="#94a3b8" tickFormatter={(v) => `₹${v / 1000}k`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                  <Tooltip
                    formatter={(val, name) => [
                      name === 'Revenue (₹)' ? `₹${Number(val).toLocaleString('en-IN')}` : val,
                      name,
                    ]}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue (₹)"
                    stroke="#4F46E5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                  <Bar yAxisId="right" dataKey="bookings" name="Bookings Count" fill="#10B981" radius={[4, 4, 0, 0]} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 2: Room Occupancy Breakdown */}
        <div className="col-lg-4">
          <div className="bg-white p-4 rounded-4 border shadow-sm h-100 d-flex flex-column">
            <div className="mb-3 pb-2 border-bottom">
              <h5 className="fw-bold text-dark mb-0">Room Occupancy</h5>
              <small className="text-muted">Live bed utilization by room type</small>
            </div>

            <div className="flex-grow-1" style={{ height: '240px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyChart} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis type="category" dataKey="name" stroke="#64748b" width={80} style={{ fontSize: '0.78rem' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="occupied" name="Occupied Beds" fill="#4F46E5" stackId="a" />
                  <Bar dataKey="available" name="Available Beds" fill="#E2E8F0" stackId="a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center text-secondary small">
              <span>Overall Average Occupancy:</span>
              <strong className="text-primary fs-6">{kpis.occupancyRate}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white p-4 rounded-4 border shadow-sm">
        <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
          <div>
            <h5 className="fw-bold text-dark mb-0">Recent Bookings</h5>
            <small className="text-muted">Latest guest reservations requiring host attention</small>
          </div>
          <Link to="/owner/bookings" className="btn btn-link text-primary fw-bold text-decoration-none p-0 d-flex align-items-center gap-1 small">
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="small text-muted fw-bold">Booking ID</th>
                <th className="small text-muted fw-bold">Customer</th>
                <th className="small text-muted fw-bold">Hostel</th>
                <th className="small text-muted fw-bold">Room Type</th>
                <th className="small text-muted fw-bold">Dates</th>
                <th className="small text-muted fw-bold">Amount</th>
                <th className="small text-muted fw-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted small">
                    No recent bookings recorded.
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <span className="fw-bold text-dark small">
                        #{b._id.toString().substring(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark small">{b.customer?.name || b.guestDetails?.name || 'Guest'}</div>
                      <small className="text-muted">{b.customer?.email}</small>
                    </td>
                    <td className="small text-dark fw-medium">{b.hostel?.name}</td>
                    <td className="small text-muted">{b.room?.roomType}</td>
                    <td className="small text-muted">
                      {new Date(b.checkIn).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} -{' '}
                      {new Date(b.checkOut).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="fw-bold text-primary small">₹{b.totalAmount?.toLocaleString('en-IN')}</td>
                    <td>
                      <span
                        className={`sg-badge ${
                          b.bookingStatus === 'Confirmed'
                            ? 'sg-badge-success'
                            : b.bookingStatus === 'Cancelled'
                            ? 'sg-badge-danger'
                            : 'sg-badge-warning'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
