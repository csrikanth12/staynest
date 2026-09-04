import React, { useState, useEffect } from 'react';
import paymentService from '../../services/paymentService';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import OwnerFilterPanel from '../../components/OwnerFilterPanel';
import {
  CreditCard,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

const OwnerPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPayments = async () => {
    try {
      const res = await paymentService.getOwnerPayments();
      if (res.success && res.data) {
        setPayments(res.data);
      }
    } catch (err) {
      console.error('Error fetching payments ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.paymentId?.toLowerCase().includes(q) ||
        p.customer?.name?.toLowerCase().includes(q) ||
        p.customer?.email?.toLowerCase().includes(q) ||
        p.hostel?.name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCollected = payments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalRefunded = payments
    .filter((p) => p.status === 'Refunded')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="owner-payments-page pb-5">
      <BackButton />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Payments & Settlement Ledger</h2>
          <p className="text-muted small mb-0">Live transaction records processed through Razorpay payment gateway</p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="metric-card bg-white">
            <span className="text-muted small fw-bold text-uppercase">Net Settlements Paid</span>
            <h3 className="fw-extrabold text-primary my-1">₹{totalCollected.toLocaleString('en-IN')}</h3>
            <small className="text-success fw-semibold">Processed to bank account</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="metric-card bg-white">
            <span className="text-muted small fw-bold text-uppercase">Total Transactions</span>
            <h3 className="fw-extrabold text-dark my-1">{payments.length}</h3>
            <small className="text-muted">Successful checkouts</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="metric-card bg-white">
            <span className="text-muted small fw-bold text-uppercase">Refunds & Reversals</span>
            <h3 className="fw-extrabold text-danger my-1">₹{totalRefunded.toLocaleString('en-IN')}</h3>
            <small className="text-muted">Cancelled reservations</small>
          </div>
        </div>
      </div>

      {/* Enhanced Scrollable Filter Panel with Sticky Actions */}
      <OwnerFilterPanel
        title="Filter Transactions"
        subtitle="Filter ledger by settlement status and search keywords"
        activeCount={(statusFilter !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0)}
        onClear={() => {
          setStatusFilter('all');
          setSearchQuery('');
        }}
        onApply={() => {}}
      >
        <div className="row g-3">
          <div className="col-12 col-md-7">
            <label className="form-label fw-bold text-dark small text-uppercase mb-2">
              Payment Status
            </label>
            <div className="owner-filter-pills">
              {['all', 'Paid', 'Refunded', 'Pending', 'Failed'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                    statusFilter === status
                      ? 'btn-primary'
                      : 'btn-light border text-secondary'
                  }`}
                >
                  {status === 'all' ? 'All Transactions' : status}
                </button>
              ))}
            </div>
          </div>

          <div className="col-12 col-md-5">
            <label className="form-label fw-bold text-dark small text-uppercase mb-2">
              Search Transactions
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control form-control-sm bg-light"
                placeholder="Search payment ID, customer, hostel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </OwnerFilterPanel>

      {/* Payments Table */}
      <div className="bg-white rounded-4 border shadow-sm overflow-hidden">
        {loading ? (
          <Loader message="Loading payment transactions..." />
        ) : filteredPayments.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <CreditCard size={48} className="text-muted opacity-40 mb-3" />
            <h5 className="fw-bold text-dark mb-1">No Payments Found</h5>
            <p className="small mb-0">No payment records match your search criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 sg-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Hostel Property</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <span className="fw-bold text-dark small font-monospace">
                        {p.paymentId}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted small">
                        #{p.booking?._id ? p.booking._id.toString().substring(0, 8).toUpperCase() : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark small">{p.customer?.name || 'Guest'}</div>
                      <small className="text-muted">{p.customer?.email}</small>
                    </td>
                    <td className="small text-dark fw-medium">{p.hostel?.name}</td>
                    <td>
                      <span className="fw-extrabold text-primary small">
                        ₹{p.amount?.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border rounded-pill px-2.5 py-1 small">
                        {p.method || 'UPI / Card'}
                      </span>
                    </td>
                    <td className="small text-muted">
                      {new Date(p.createdAt).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td>
                      <span
                        className={`sg-badge ${
                          p.status === 'Paid'
                            ? 'sg-badge-success'
                            : p.status === 'Refunded'
                            ? 'sg-badge-info'
                            : p.status === 'Failed'
                            ? 'sg-badge-danger'
                            : 'sg-badge-warning'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerPayments;
