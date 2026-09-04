import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from '../components/NotificationDropdown';
import {
  LayoutDashboard,
  CalendarCheck,
  Building2,
  BedDouble,
  Users,
  CreditCard,
  TrendingUp,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

const OwnerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/owner/bookings', label: 'Bookings', icon: CalendarCheck },
    { to: '/owner/hostels', label: 'Hostels', icon: Building2 },
    { to: '/owner/rooms', label: 'Rooms', icon: BedDouble },
    { to: '/owner/customers', label: 'Customers', icon: Users },
    { to: '/owner/payments', label: 'Payments', icon: CreditCard },
    { to: '/owner/revenue', label: 'Revenue', icon: TrendingUp },
    { to: '/owner/reviews', label: 'Reviews', icon: Star },
    { to: '/owner/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-3 d-lg-none"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Owner Sidebar */}
      <aside className={`owner-sidebar ${sidebarOpen ? 'show' : ''}`}>
        {/* Brand Header */}
        <div className="p-3 border-bottom border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
          <Link to="/owner/dashboard" className="d-flex align-items-center gap-2 text-decoration-none">
            <div
              className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-sm"
              style={{ width: '36px', height: '36px', background: 'var(--primary-gradient)' }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="fw-bold fs-5 text-white tracking-tight">STAYGUARD</span>
              <span className="d-block text-secondary text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                Owner Portal
              </span>
            </div>
          </Link>
          <button
            className="btn btn-sm text-secondary d-lg-none p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-grow-1 py-3 overflow-y-auto">
          <div className="px-3 mb-2">
            <span className="text-secondary text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
              Management
            </span>
          </div>
          <nav className="d-flex flex-column gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/owner/dashboard'}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* View Customer Website Link & Owner Card */}
        <div className="p-3 border-top border-secondary border-opacity-25">
          <Link
            to="/"
            className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-2 mb-3 rounded-pill text-light border-secondary border-opacity-50"
            style={{ fontSize: '0.82rem' }}
          >
            <ExternalLink size={14} />
            <span>Go to Customer Site</span>
          </Link>

          <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-secondary bg-opacity-10">
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <img
                src={
                  user?.profileImage ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                }
                alt={user?.name}
                className="rounded-circle"
                style={{ width: '34px', height: '34px', objectFit: 'cover' }}
              />
              <div className="overflow-hidden">
                <div className="text-white fw-bold small text-truncate">{user?.name}</div>
                <div className="text-secondary small text-truncate" style={{ fontSize: '0.72rem' }}>
                  {user?.email}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-sm btn-link text-danger p-1"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="owner-main-content flex-grow-1">
        {/* Top Navbar */}
        <header className="bg-white border-bottom sticky-top py-2.5 px-4 shadow-sm d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-light d-lg-none p-1.5 border"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="d-none d-sm-block">
              <span className="text-muted small">Hostel Operations & Management</span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="d-none d-md-flex align-items-center gap-2 bg-light px-3 py-1.5 rounded-pill border">
              <span className="badge bg-success-subtle text-success rounded-circle p-1">●</span>
              <span className="text-secondary small fw-semibold">Live System Online</span>
            </div>
            <NotificationDropdown isOwnerView={true} />
            <Link to="/owner/hostels" className="btn btn-stayguard btn-sm rounded-pill px-3">
              <Building2 size={15} />
              <span>+ Add Hostel</span>
            </Link>
          </div>
        </header>

        {/* Page Content View */}
        <main className="p-3 p-md-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;
