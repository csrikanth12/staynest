import React from 'react';
import { Users, Bed, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';

const RoomCard = ({ room, onSelectRoom, isSelected = false }) => {
  if (!room) return null;

  const isSoldOut = room.availableBeds <= 0 || !room.isAvailable;

  return (
    <div
      className={`card border rounded-4 p-3.5 transition-all ${
        isSelected
          ? 'border-primary shadow-md'
          : isSoldOut
          ? 'border-light bg-light opacity-75'
          : 'border-slate-200 bg-white shadow-sm hover-shadow'
      }`}
      style={{
        transition: 'all 0.2s ease',
        borderColor: isSelected ? 'var(--primary)' : '#e2e8f0',
        backgroundColor: isSelected ? '#f8faff' : isSoldOut ? '#f8fafc' : '#ffffff',
      }}
    >
      <div className="row g-3 align-items-center">
        {/* Room Image & Badges */}
        <div className="col-md-3 col-12">
          <div className="position-relative rounded-3 overflow-hidden" style={{ height: '120px' }}>
            <img
              src={
                room.image ||
                '/images/hostels/hostel-1/room.jpg'
              }
              alt={room.roomType}
              className="w-100 h-100 object-fit-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/hostels/hostel-1/room.jpg';
              }}
            />
            <div className="position-absolute top-0 start-0 m-2">
              <span className="badge bg-dark text-white rounded-pill px-2 py-1 small">
                Room #{room.roomNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Room Details */}
        <div className="col-md-6 col-12">
          <div className="d-flex align-items-center gap-2 mb-1">
            <h5 className="fw-bold text-dark mb-0">{room.roomType}</h5>
            {room.roomType.includes('Private') && (
              <span className="badge bg-indigo-subtle text-indigo px-2 py-1 rounded-pill small fw-semibold" style={{ color: '#4338ca', backgroundColor: '#e0e7ff' }}>
                <Sparkles size={12} className="me-1" />
                Popular
              </span>
            )}
          </div>

          <div className="d-flex flex-wrap align-items-center gap-3 text-muted small mb-2">
            <div className="d-flex align-items-center gap-1">
              <Users size={15} className="text-primary" />
              <span>Max Capacity: {room.capacity} {room.capacity > 1 ? 'Guests' : 'Guest'}</span>
            </div>
            <div className="d-flex align-items-center gap-1">
              <Bed size={15} className="text-secondary" />
              <span className={room.availableBeds <= 2 ? 'text-danger fw-semibold' : ''}>
                {room.availableBeds} {room.availableBeds === 1 ? 'Bed' : 'Beds'} Available
              </span>
            </div>
          </div>

          {/* Room Amenities */}
          <div className="d-flex flex-wrap gap-1">
            {room.amenities && room.amenities.length > 0 ? (
              room.amenities.slice(0, 4).map((am, i) => (
                <span
                  key={i}
                  className="badge bg-light text-secondary border px-2 py-1 rounded-pill"
                  style={{ fontSize: '0.75rem' }}
                >
                  <CheckCircle size={11} className="text-success me-1" />
                  {am}
                </span>
              ))
            ) : (
              <span className="badge bg-light text-muted border px-2 py-1 rounded-pill small">
                AC • Wi-Fi • Lockers included
              </span>
            )}
          </div>
        </div>

        {/* Price & Selection */}
        <div className="col-md-3 col-12 text-md-end border-top border-md-top-0 pt-3 pt-md-0 d-flex flex-row flex-md-column justify-content-between align-items-center align-items-md-end">
          <div className="mb-md-2">
            <span className="text-muted small d-block">Price / night</span>
            <div className="d-flex align-items-baseline gap-1 justify-content-md-end">
              <span className="fs-4 fw-bold text-primary">₹{room.price?.toLocaleString('en-IN')}</span>
              <span className="text-muted small">/ night</span>
            </div>
            <span className="text-success small fw-medium d-block">Free Cancellation</span>
          </div>

          <div>
            {isSoldOut ? (
              <button className="btn btn-secondary btn-sm rounded-pill px-3" disabled>
                Sold Out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectRoom(room)}
                className={`btn btn-sm rounded-pill px-4 fw-semibold ${
                  isSelected ? 'btn-success' : 'btn-stayguard'
                }`}
              >
                {isSelected ? 'Selected ✓' : 'Select Room'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
