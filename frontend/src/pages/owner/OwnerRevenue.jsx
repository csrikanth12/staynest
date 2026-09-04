import React, { useState, useEffect } from 'react';
import analyticsService from '../../services/analyticsService';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import {
  TrendingUp,
  Calendar,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  Filter,
  Building2,
  X,
  Search,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LabelList,
  Cell,
} from 'recharts';

const CustomHostelTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className="bg-white p-2.5 rounded-3 shadow-lg border"
        style={{ minWidth: '170px', zIndex: 1000, borderColor: '#e2e8f0' }}
      >
        <div className="d-flex align-items-center gap-1.5 mb-1 text-dark fw-bold small">
          <Building2 size={14} className="text-teal flex-shrink-0" style={{ color: '#0d9488' }} />
          <span className="text-truncate" style={{ maxWidth: '210px' }} title={data.name}>
            {data.name}
          </span>
        </div>
        <div className="d-flex align-items-center justify-content-between pt-1 border-top" style={{ borderColor: '#f1f5f9' }}>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Total Bookings:</span>
          <span
            className="badge rounded-pill fw-bold"
            style={{ backgroundColor: '#ccfbf1', color: '#0f766e', fontSize: '0.78rem', padding: '3px 8px' }}
          >
            {data.bookings} {data.bookings === 1 ? 'booking' : 'bookings'}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const OwnerRevenue = () => {
  const [timeframe, setTimeframe] = useState('30d');
  const [revenueData, setRevenueData] = useState(null);
  const [bookingAnalytics, setBookingAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllHostelsModal, setShowAllHostelsModal] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState('');

  useEffect(() => {
    const fetchRevenueStats = async () => {
      setLoading(true);
      try {
        const [revRes, bookRes] = await Promise.all([
          analyticsService.getRevenueAnalytics(timeframe),
          analyticsService.getBookingsAnalytics(),
        ]);

        if (revRes.success) {
          setRevenueData(revRes.data);
        }
        if (bookRes.success) {
          setBookingAnalytics(bookRes.data);
        }
      } catch (err) {
        console.error('Error fetching revenue statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueStats();
  }, [timeframe]);

  const summary = revenueData?.summary || {
    totalRevenue: 0,
    periodRevenue: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    avgBookingValue: 0,
  };

  const timeline = revenueData?.revenueTimeline || [];
  const hostelDistribution = bookingAnalytics?.hostelDistribution || [];

  // Sort hostels descending by bookings
  const sortedHostels = [...hostelDistribution].sort((a, b) => b.bookings - a.bookings);
  const top8Hostels = sortedHostels.slice(0, 8);
  const totalHostelBookings = sortedHostels.reduce((sum, h) => sum + (h.bookings || 0), 0);

  // Filtered list for View All modal
  const modalFilteredHostels = sortedHostels.filter((h) =>
    h.name.toLowerCase().includes(modalSearchTerm.toLowerCase())
  );

  const truncateLabel = (text) => {
    if (!text) return '';
    return text.length > 18 ? `${text.substring(0, 16)}...` : text;
  };

  return (
    <div className="owner-revenue-page pb-5">
      <BackButton />

      {/* Header & Timeframe Filter */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Financial & Revenue Analytics</h2>
          <p className="text-muted small mb-0">Track total earnings, booking volumes, and property revenues</p>
        </div>

        {/* Timeframe Selector */}
        <div className="d-flex align-items-center gap-1 bg-white p-1.5 rounded-pill border shadow-sm">
          {[
            { id: 'today', label: 'Today' },
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '90d', label: '90 Days' },
            { id: 'this_year', label: 'This Year' },
          ].map((tf) => (
            <button
              key={tf.id}
              type="button"
              onClick={() => setTimeframe(tf.id)}
              className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
                timeframe === tf.id ? 'btn-primary' : 'btn-light border-0 text-secondary'
              }`}
              style={{ fontSize: '0.82rem' }}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Revenue Cards */}
      <div className="row g-3 mb-4">
        {/* Total Revenue */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="metric-card bg-white h-100">
            <span className="text-muted small fw-bold text-uppercase">Total Lifetime Revenue</span>
            <h3 className="fw-extrabold text-primary my-2">
              ₹{summary.totalRevenue?.toLocaleString('en-IN')}
            </h3>
            <div className="d-flex align-items-center gap-1 text-success small fw-semibold">
              <ArrowUpRight size={14} />
              <span>All properties combined</span>
            </div>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="metric-card bg-white h-100">
            <span className="text-muted small fw-bold text-uppercase">Today's Revenue</span>
            <h3 className="fw-extrabold text-dark my-2">
              ₹{summary.todayRevenue?.toLocaleString('en-IN')}
            </h3>
            <small className="text-muted">Settlements received today</small>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="metric-card bg-white h-100">
            <span className="text-muted small fw-bold text-uppercase">This Month's Revenue</span>
            <h3 className="fw-extrabold text-dark my-2">
              ₹{summary.monthlyRevenue?.toLocaleString('en-IN')}
            </h3>
            <small className="text-muted">Current calendar month</small>
          </div>
        </div>

        {/* Average Booking Value */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="metric-card bg-white h-100">
            <span className="text-muted small fw-bold text-uppercase">Avg. Booking Value</span>
            <h3 className="fw-extrabold text-dark my-2">
              ₹{summary.avgBookingValue?.toLocaleString('en-IN')}
            </h3>
            <small className="text-muted">Per confirmed reservation</small>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      {loading ? (
        <Loader message="Compiling financial trends..." />
      ) : (
        <div className="row g-4">
          {/* Revenue Timeline Chart */}
          <div className="col-lg-8">
            <div className="bg-white p-4 rounded-4 border shadow-sm h-100">
              <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <div>
                  <h5 className="fw-bold text-dark mb-0">Revenue Timeline</h5>
                  <small className="text-muted">Revenue accrued over selected timeframe</small>
                </div>
                <span className="badge bg-primary text-white rounded-pill px-3 py-1">
                  Timeline View
                </span>
              </div>

              <div style={{ height: '330px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4F46E5"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#revGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bookings by Hostel Component */}
          <div className="col-lg-4">
            <div className="bg-white p-4 rounded-4 border shadow-sm h-100 d-flex flex-column">
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                <div>
                  <h5 className="fw-bold text-dark mb-0">Bookings by Hostel</h5>
                  <small className="text-muted">Distribution across active properties</small>
                </div>
                {sortedHostels.length > 8 && (
                  <button
                    type="button"
                    onClick={() => {
                      setModalSearchTerm('');
                      setShowAllHostelsModal(true);
                    }}
                    className="btn btn-sm btn-outline-primary rounded-pill px-2.5 py-1 d-flex align-items-center gap-1.5 shadow-none"
                    style={{ fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    <span>View All</span>
                    <span className="badge bg-primary-subtle text-primary rounded-pill px-1.5" style={{ fontSize: '0.7rem' }}>
                      {sortedHostels.length}
                    </span>
                  </button>
                )}
              </div>

              {top8Hostels.length === 0 ? (
                <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-center py-5">
                  <Building2 size={32} className="text-muted opacity-50 mb-2" />
                  <p className="text-muted small mb-0">No property bookings recorded yet</p>
                </div>
              ) : (
                <div className="flex-grow-1" style={{ height: '330px', width: '100%', minHeight: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={top8Hostels}
                      layout="vertical"
                      margin={{ top: 8, right: 35, left: 0, bottom: 20 }}
                      barCategoryGap="16%"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis
                        type="number"
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                        domain={[0, (dataMax) => Math.max(Math.ceil(dataMax * 1.25), 5)]}
                        allowDecimals={false}
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        label={{
                          value: 'Number of Bookings',
                          position: 'insideBottom',
                          offset: -12,
                          fontSize: 11,
                          fill: '#64748b',
                          fontWeight: 500,
                        }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#64748b"
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                        width={115}
                        tickFormatter={truncateLabel}
                        tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                      />
                      <Tooltip content={<CustomHostelTooltip />} cursor={{ fill: 'rgba(13, 148, 136, 0.06)' }} />
                      <Bar
                        dataKey="bookings"
                        name="Bookings"
                        radius={[0, 6, 6, 0]}
                        barSize={18}
                      >
                        <LabelList
                          dataKey="bookings"
                          position="right"
                          fill="#0f766e"
                          fontSize={11}
                          fontWeight={700}
                          offset={8}
                        />
                        {top8Hostels.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? '#0f766e' : index < 3 ? '#0d9488' : '#14b8a6'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: View All Hostels Booking Distribution */}
      {showAllHostelsModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1055 }}
          onClick={() => setShowAllHostelsModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              {/* Modal Header */}
              <div className="modal-header bg-light border-bottom p-4">
                <div className="d-flex align-items-center gap-2">
                  <div className="p-2 bg-teal-subtle rounded-3" style={{ backgroundColor: '#ccfbf1', color: '#0f766e' }}>
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0">All Properties - Bookings Distribution</h5>
                    <small className="text-muted">
                      Complete ranking across all {sortedHostels.length} active hostels ({totalHostelBookings} total bookings)
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setShowAllHostelsModal(false)}
                />
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4">
                {/* Search Bar */}
                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Filter properties by name..."
                      value={modalSearchTerm}
                      onChange={(e) => setModalSearchTerm(e.target.value)}
                    />
                    {modalSearchTerm && (
                      <button
                        className="btn btn-outline-secondary border-start-0"
                        type="button"
                        onClick={() => setModalSearchTerm('')}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Hostels List Table */}
                <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-muted small text-uppercase">
                      <tr>
                        <th style={{ width: '60px' }}>Rank</th>
                        <th>Hostel Property</th>
                        <th className="text-center" style={{ width: '120px' }}>Bookings</th>
                        <th style={{ width: '180px' }}>Share of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalFilteredHostels.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-muted small">
                            No properties match "{modalSearchTerm}"
                          </td>
                        </tr>
                      ) : (
                        modalFilteredHostels.map((hostel, idx) => {
                          const percentage =
                            totalHostelBookings > 0
                              ? Math.round((hostel.bookings / totalHostelBookings) * 100)
                              : 0;
                          return (
                            <tr key={hostel.name}>
                              <td>
                                <span
                                  className={`badge rounded-pill fw-bold ${
                                    idx === 0
                                      ? 'bg-warning text-dark'
                                      : idx === 1
                                      ? 'bg-secondary-subtle text-dark border'
                                      : idx === 2
                                      ? 'bg-danger-subtle text-danger border'
                                      : 'bg-light text-secondary border'
                                  }`}
                                  style={{ fontSize: '0.75rem', minWidth: '28px' }}
                                >
                                  #{idx + 1}
                                </span>
                              </td>
                              <td>
                                <div className="fw-semibold text-dark">{hostel.name}</div>
                              </td>
                              <td className="text-center">
                                <span
                                  className="badge rounded-pill fw-bold"
                                  style={{ backgroundColor: '#ccfbf1', color: '#0f766e', fontSize: '0.8rem', padding: '4px 10px' }}
                                >
                                  {hostel.bookings}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div className="progress flex-grow-1" style={{ height: '6px', backgroundColor: '#e2e8f0' }}>
                                    <div
                                      className="progress-bar rounded-pill"
                                      role="progressbar"
                                      style={{
                                        width: `${percentage}%`,
                                        backgroundColor: idx < 3 ? '#0d9488' : '#14b8a6',
                                      }}
                                      aria-valuenow={percentage}
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                    />
                                  </div>
                                  <span className="text-muted small fw-medium" style={{ width: '36px', fontSize: '0.75rem' }}>
                                    {percentage}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer bg-light border-top p-3 d-flex justify-content-between">
                <span className="text-muted small">
                  Showing {modalFilteredHostels.length} of {sortedHostels.length} active properties
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm rounded-pill px-4"
                  onClick={() => setShowAllHostelsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerRevenue;
