import React, { useState, useEffect } from 'react';
import bookingService from '../../services/bookingService';
import authService from '../../services/authService';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import OwnerFilterPanel from '../../components/OwnerFilterPanel';
import {
  Users,
  Search,
  Eye,
  Mail,
  Phone,
  CalendarCheck,
  CreditCard,
  Building,
  CheckCircle,
  X,
  Filter,
} from 'lucide-react';

const OwnerCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');

  // Selected customer for modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const fetchCustomersAndStats = async () => {
      try {
        const [usersRes, bookingsRes] = await Promise.all([
          authService.getAllCustomers(),
          bookingService.getOwnerBookings(),
        ]);

        const rawCustomers = usersRes.success ? usersRes.data : [];
        const rawBookings = bookingsRes.success ? bookingsRes.data : [];
        setAllBookings(rawBookings);

        // Aggregate customer stats
        const customerStatsMap = {};
        rawBookings.forEach((b) => {
          const cId = b.customer?._id || b.customer;
          if (cId) {
            if (!customerStatsMap[cId]) {
              customerStatsMap[cId] = {
                bookingCount: 0,
                totalSpent: 0,
                lastBookingDate: null,
                bookings: [],
              };
            }
            customerStatsMap[cId].bookingCount += 1;
            if (b.paymentStatus === 'Paid') {
              customerStatsMap[cId].totalSpent += b.totalAmount || 0;
            }
            const bDate = new Date(b.createdAt);
            if (!customerStatsMap[cId].lastBookingDate || bDate > customerStatsMap[cId].lastBookingDate) {
              customerStatsMap[cId].lastBookingDate = bDate;
            }
            customerStatsMap[cId].bookings.push(b);
          }
        });

        const compiled = rawCustomers.map((c) => {
          const stats = customerStatsMap[c._id] || {
            bookingCount: 0,
            totalSpent: 0,
            lastBookingDate: null,
            bookings: [],
          };
          return {
            ...c,
            ...stats,
          };
        });

        setCustomers(compiled);
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomersAndStats();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    if (activityFilter === 'frequent' && (c.bookingCount || 0) < 2) return false;
    if (activityFilter === 'hasBookings' && (c.bookingCount || 0) === 0) return false;
    if (activityFilter === 'noBookings' && (c.bookingCount || 0) > 0) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatDate = (d) => {
    if (!d) return 'No bookings yet';
    return new Date(d).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const activeCount = (activityFilter !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <div className="owner-customers-page pb-5">
      <BackButton />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Customer Directory</h2>
          <p className="text-muted small mb-0">Track verified guest profiles, reservation frequencies, and total guest spending</p>
        </div>
      </div>

      {/* Enhanced Scrollable Filter Panel with Sticky Actions */}
      <OwnerFilterPanel
        title="Filter Guest Directory"
        subtitle="Search profiles and filter by reservation frequency"
        activeCount={activeCount}
        onClear={() => {
          setActivityFilter('all');
          setSearchQuery('');
        }}
        onApply={() => {}}
      >
        <div className="row g-3">
          {/* Reservation Activity */}
          <div className="col-12 col-md-7">
            <label className="form-label fw-bold text-dark small text-uppercase mb-2">
              Guest Reservation History
            </label>
            <div className="owner-filter-pills">
              {[
                { id: 'all', label: `All Guests (${customers.length})` },
                { id: 'hasBookings', label: 'With Active Bookings' },
                { id: 'frequent', label: 'Frequent Travelers (2+)' },
                { id: 'noBookings', label: 'New Registered Users' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setActivityFilter(opt.id)}
                  className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                    activityFilter === opt.id
                      ? 'btn-primary'
                      : 'btn-light border text-secondary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="col-12 col-md-5">
            <label className="form-label fw-bold text-dark small text-uppercase mb-2">
              Search Profiles
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control form-control-sm bg-light"
                placeholder="Search name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </OwnerFilterPanel>

      {/* Customers Table */}
      <div className="bg-white rounded-4 border shadow-sm overflow-hidden">
        {loading ? (
          <Loader message="Loading customer profiles..." />
        ) : filteredCustomers.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <Users size={48} className="text-muted opacity-40 mb-3" />
            <h5 className="fw-bold text-dark mb-1">No Customers Found</h5>
            <p className="small mb-0">No guest records match your search query.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 sg-table">
              <thead>
                <tr>
                  <th>Customer Profile</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Total Bookings</th>
                  <th>Last Booking</th>
                  <th>Total Spent</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((cust) => (
                  <tr key={cust._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2.5">
                        <img
                          src={
                            cust.profileImage ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
                          }
                          alt={cust.name}
                          className="rounded-circle object-fit-cover shadow-sm"
                          style={{ width: '38px', height: '38px' }}
                        />
                        <div>
                          <div className="fw-bold text-dark small">{cust.name}</div>
                          <small className="text-muted">ID: {cust._id.substring(0, 6)}</small>
                        </div>
                      </div>
                    </td>
                    <td className="small text-muted">{cust.email}</td>
                    <td className="small text-muted">{cust.phone || 'N/A'}</td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 fw-bold">
                        {cust.bookingCount || 0} Bookings
                      </span>
                    </td>
                    <td className="small text-muted">{formatDate(cust.lastBookingDate)}</td>
                    <td>
                      <span className="fw-bold text-primary small">
                        ₹{cust.totalSpent?.toLocaleString('en-IN') || 0}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-light btn-sm border rounded-pill px-3 py-1 text-primary d-flex align-items-center gap-1 ms-auto"
                        onClick={() => setSelectedCustomer(cust)}
                      >
                        <Eye size={14} />
                        <span className="small">Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 p-4">
              <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={
                      selectedCustomer.profileImage ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
                    }
                    alt={selectedCustomer.name}
                    className="rounded-circle shadow-sm"
                    style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                  />
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0">{selectedCustomer.name}</h5>
                    <div className="text-muted small">Registered Guest • {selectedCustomer.email}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setSelectedCustomer(null)}
                />
              </div>

              {/* Stats Bar */}
              <div className="row g-3 mb-4">
                <div className="col-4">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <span className="text-muted small d-block mb-1">Total Bookings</span>
                    <h5 className="fw-bold text-dark mb-0">{selectedCustomer.bookingCount || 0}</h5>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <span className="text-muted small d-block mb-1">Total Spend</span>
                    <h5 className="fw-bold text-primary mb-0">₹{selectedCustomer.totalSpent?.toLocaleString('en-IN') || 0}</h5>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <span className="text-muted small d-block mb-1">Phone Number</span>
                    <h6 className="fw-bold text-dark mb-0">{selectedCustomer.phone || 'N/A'}</h6>
                  </div>
                </div>
              </div>

              {/* Customer's Booking History */}
              <h6 className="fw-bold text-dark mb-2">Guest Reservation History</h6>
              <div className="border rounded-3 overflow-hidden mb-4">
                {selectedCustomer.bookings && selectedCustomer.bookings.length > 0 ? (
                  <div className="table-responsive" style={{ maxHeight: '240px' }}>
                    <table className="table table-sm table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="small text-muted">ID</th>
                          <th className="small text-muted">Hostel</th>
                          <th className="small text-muted">Room</th>
                          <th className="small text-muted">Dates</th>
                          <th className="small text-muted">Amount</th>
                          <th className="small text-muted">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCustomer.bookings.map((b) => (
                          <tr key={b._id}>
                            <td className="small fw-bold">#{b._id.toString().substring(0, 8)}</td>
                            <td className="small text-dark">{b.hostel?.name || 'Hostel'}</td>
                            <td className="small text-muted">{b.room?.roomType}</td>
                            <td className="small text-muted">
                              {new Date(b.checkIn).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </td>
                            <td className="small fw-bold text-primary">₹{b.totalAmount}</td>
                            <td>
                              <span
                                className={`sg-badge ${
                                  b.bookingStatus === 'Confirmed'
                                    ? 'sg-badge-success'
                                    : 'sg-badge-warning'
                                }`}
                                style={{ fontSize: '0.65rem' }}
                              >
                                {b.bookingStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-3 text-center text-muted small">No stay records available.</div>
                )}
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4"
                  onClick={() => setSelectedCustomer(null)}
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

export default OwnerCustomers;
