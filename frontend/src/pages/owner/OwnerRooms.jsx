import React, { useState, useEffect } from 'react';
import hostelService from '../../services/hostelService';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import OwnerFilterPanel from '../../components/OwnerFilterPanel';
import { ROOM_TYPES } from '../../data/hostels';
import {
  BedDouble,
  Plus,
  Edit2,
  Trash2,
  Users,
  Bed,
  CheckCircle,
  XCircle,
  Building2,
  AlertTriangle,
  Search,
  Filter,
} from 'lucide-react';

const OwnerRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHostelFilter, setSelectedHostelFilter] = useState('all');
  const [selectedRoomType, setSelectedRoomType] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Delete Modal
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const initialFormState = {
    hostel: '',
    roomNumber: '101',
    roomType: '4 Bed Dorm',
    capacity: 4,
    price: 1500,
    availableBeds: 4,
    amenities: 'Air Conditioning, High-Speed Wi-Fi, Lockers, Reading Lamp',
    image: '/images/hostels/hostel-1/room.jpg',
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    try {
      const [hostelsRes, roomsRes] = await Promise.all([
        hostelService.getOwnerHostels(),
        hostelService.getRooms(),
      ]);

      if (hostelsRes.success && hostelsRes.data) {
        setHostels(hostelsRes.data);
      }
      if (roomsRes.success && roomsRes.data) {
        setRooms(roomsRes.data);
      }
    } catch (err) {
      console.error('Error fetching room inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      ...initialFormState,
      hostel: hostels[0]?._id || '',
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setIsEditing(true);
    setEditingId(room._id);
    setFormData({
      hostel: room.hostel?._id || room.hostel || '',
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      capacity: room.capacity,
      price: room.price,
      availableBeds: room.availableBeds,
      amenities: room.amenities?.join(', ') || '',
      image: room.image || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const amenitiesArr = formData.amenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const payload = {
        hostel: formData.hostel,
        roomNumber: formData.roomNumber,
        roomType: formData.roomType,
        capacity: Number(formData.capacity),
        price: Number(formData.price),
        availableBeds: Number(formData.availableBeds),
        amenities: amenitiesArr,
        image: formData.image,
      };

      if (isEditing) {
        await hostelService.updateRoom(editingId, payload);
      } else {
        await hostelService.createRoom(payload);
      }

      await fetchData();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save room details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;
    setDeleting(true);
    try {
      await hostelService.deleteRoom(roomToDelete._id);
      await fetchData();
      setRoomToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete room');
    } finally {
      setDeleting(false);
    }
  };

  const handleBedAdjust = async (room, increment) => {
    const newCount = Math.max(0, Math.min(room.capacity, room.availableBeds + increment));
    try {
      await hostelService.updateRoom(room._id, { availableBeds: newCount });
      setRooms((prev) =>
        prev.map((r) => (r._id === room._id ? { ...r, availableBeds: newCount } : r))
      );
    } catch (err) {
      console.error('Error updating bed count:', err);
    }
  };

  // Filter rooms by hostel, room type, availability, and search
  const filteredRooms = rooms.filter((r) => {
    const hId = r.hostel?._id || r.hostel;
    if (selectedHostelFilter !== 'all' && hId !== selectedHostelFilter) return false;
    if (selectedRoomType !== 'all' && r.roomType !== selectedRoomType) return false;
    if (selectedAvailability === 'available' && r.availableBeds <= 0) return false;
    if (selectedAvailability === 'occupied' && r.availableBeds > 0) return false;
    if (searchKeyword) {
      const q = searchKeyword.toLowerCase();
      const hName = r.hostel?.name?.toLowerCase() || '';
      const rNum = (r.roomNumber || '').toLowerCase();
      const rType = (r.roomType || '').toLowerCase();
      return hName.includes(q) || rNum.includes(q) || rType.includes(q);
    }
    return true;
  });

  const activeFilterCount =
    (selectedHostelFilter !== 'all' ? 1 : 0) +
    (selectedRoomType !== 'all' ? 1 : 0) +
    (selectedAvailability !== 'all' ? 1 : 0) +
    (searchKeyword ? 1 : 0);

  return (
    <div className="owner-rooms-page pb-5">
      <BackButton />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Room & Bed Inventory</h2>
          <p className="text-muted small mb-0">Configure room types, pricing per night, and adjust live bed availability</p>
        </div>

        <button
          onClick={openAddModal}
          disabled={hostels.length === 0}
          className="btn btn-stayguard rounded-pill px-4 fw-semibold"
        >
          <Plus size={18} />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Enhanced Scrollable Filter Panel with Sticky Actions */}
      <OwnerFilterPanel
        title="Filter Rooms & Inventory"
        subtitle="Filter by property, room type, and bed availability"
        activeCount={activeFilterCount}
        onClear={() => {
          setSelectedHostelFilter('all');
          setSelectedRoomType('all');
          setSelectedAvailability('all');
          setSearchKeyword('');
        }}
        onApply={() => {}}
      >
        <div className="row g-3">
          {/* Hostel Selection */}
          <div className="col-12 col-md-6 col-lg-4">
            <label className="form-label fw-bold text-dark small text-uppercase mb-2">
              Property / Hostel
            </label>
            <select
              className="form-select form-select-sm"
              value={selectedHostelFilter}
              onChange={(e) => setSelectedHostelFilter(e.target.value)}
            >
              <option value="all">All Hostels ({rooms.length} total rooms)</option>
              {hostels.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Room Type Selection */}
          <div className="col-12 col-md-6 col-lg-4">
            <label className="form-label fw-bold text-dark small text-uppercase mb-2">
              Room Type
            </label>
            <select
              className="form-select form-select-sm"
              value={selectedRoomType}
              onChange={(e) => setSelectedRoomType(e.target.value)}
            >
              <option value="all">All Room Types</option>
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Status */}
          <div className="col-12 col-md-6 col-lg-4">
            <label className="form-label fw-bold text-dark small text-uppercase mb-2">
              Bed Availability
            </label>
            <div className="owner-filter-pills">
              {[
                { id: 'all', label: 'All Beds' },
                { id: 'available', label: 'Available Beds Only' },
                { id: 'occupied', label: 'Fully Occupied' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedAvailability(opt.id)}
                  className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                    selectedAvailability === opt.id
                      ? 'btn-primary'
                      : 'btn-light border text-secondary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </OwnerFilterPanel>

      {/* Rooms Table */}
      <div className="bg-white rounded-4 border shadow-sm overflow-hidden">
        {loading ? (
          <Loader message="Loading room inventory..." />
        ) : filteredRooms.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <BedDouble size={48} className="text-muted opacity-40 mb-3" />
            <h5 className="fw-bold text-dark mb-1">No Rooms Listed</h5>
            <p className="small mb-3">Add private rooms or dorm beds to your hostel listings.</p>
            <button onClick={openAddModal} className="btn btn-stayguard btn-sm rounded-pill px-3">
              + Add Room
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 sg-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Room #</th>
                  <th>Hostel Property</th>
                  <th>Room Type</th>
                  <th>Capacity</th>
                  <th>Price / Night</th>
                  <th>Live Available Beds</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => (
                  <tr key={room._id}>
                    <td>
                      <div
                        className="rounded-2 overflow-hidden border bg-light shadow-sm"
                        style={{ width: '48px', height: '36px' }}
                      >
                        <img
                          src={room.image || '/images/hostels/hostel-1/room.jpg'}
                          alt={`Room ${room.roomNumber}`}
                          className="w-100 h-100 object-fit-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/images/hostels/hostel-1/room.jpg';
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-dark text-white rounded-pill px-2.5 py-1 fw-bold">
                        #{room.roomNumber}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold text-dark small">
                        {room.hostel?.name || 'My Hostel'}
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark small">{room.roomType}</span>
                    </td>
                    <td className="small text-muted">
                      <div className="d-flex align-items-center gap-1">
                        <Users size={14} className="text-primary" />
                        <span>{room.capacity} Guests</span>
                      </div>
                    </td>
                    <td>
                      <span className="fw-bold text-primary small">
                        ₹{room.price?.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-light border py-0 px-2 fw-bold text-muted"
                          onClick={() => handleBedAdjust(room, -1)}
                          disabled={room.availableBeds <= 0}
                        >
                          -
                        </button>
                        <span
                          className={`fw-bold small ${
                            room.availableBeds === 0
                              ? 'text-danger'
                              : room.availableBeds <= 2
                              ? 'text-warning'
                              : 'text-success'
                          }`}
                        >
                          {room.availableBeds} / {room.capacity}
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-light border py-0 px-2 fw-bold text-muted"
                          onClick={() => handleBedAdjust(room, 1)}
                          disabled={room.availableBeds >= room.capacity}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-1.5">
                        <button
                          onClick={() => openEditModal(room)}
                          className="btn btn-light btn-sm border rounded-pill px-2.5 py-1 text-primary d-flex align-items-center gap-1"
                        >
                          <Edit2 size={13} />
                          <span className="small">Edit</span>
                        </button>
                        <button
                          onClick={() => setRoomToDelete(room)}
                          className="btn btn-outline-danger btn-sm rounded-pill px-2"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Room Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 p-4">
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  {isEditing ? 'Edit Room Inventory' : 'Add New Room / Dorm'}
                </h5>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setShowModal(false)}
                />
              </div>

              {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

              <form onSubmit={handleFormSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">Assign to Hostel Property *</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.hostel}
                    onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                    required
                  >
                    {hostels.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.name} ({h.location?.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-dark">Room # / Identifier *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. 101, A-1"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-6">
                    <label className="form-label small fw-bold text-dark">Room Type *</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.roomType}
                      onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                      required
                    >
                      {ROOM_TYPES.map((rt) => (
                        <option key={rt} value={rt}>
                          {rt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-4">
                    <label className="form-label small fw-bold text-dark">Capacity *</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control form-control-sm"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-4">
                    <label className="form-label small fw-bold text-dark">Avail. Beds *</label>
                    <input
                      type="number"
                      min="0"
                      max={formData.capacity}
                      className="form-control form-control-sm"
                      value={formData.availableBeds}
                      onChange={(e) => setFormData({ ...formData, availableBeds: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-4">
                    <label className="form-label small fw-bold text-dark">Price / Night (₹) *</label>
                    <input
                      type="number"
                      min="100"
                      className="form-control form-control-sm"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted">Room Amenities (comma-separated)</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small text-muted">Room Image URL</label>
                  <input
                    type="url"
                    className="form-control form-control-sm mb-2"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                  {formData.image && (
                    <div className="d-flex align-items-center gap-2 p-2 bg-light rounded-3 border">
                      <div
                        className="rounded-2 overflow-hidden border bg-dark flex-shrink-0"
                        style={{ width: '60px', height: '45px' }}
                      >
                        <img
                          src={formData.image}
                          alt="Room Preview"
                          className="w-100 h-100 object-fit-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="small text-muted" style={{ fontSize: '0.78rem' }}>
                        Live Photo Preview for Room #{formData.roomNumber || 'New'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-3"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-stayguard rounded-pill px-4"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : isEditing ? 'Save Room' : 'Add Room'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {roomToDelete && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 p-4">
              <div className="text-center mb-3">
                <div className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-10 text-danger mb-2">
                  <AlertTriangle size={32} />
                </div>
                <h5 className="modal-title fw-bold text-dark">Delete Room?</h5>
                <p className="text-muted small">
                  Are you sure you want to remove Room #{roomToDelete.roomNumber} ({roomToDelete.roomType})?
                </p>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-3"
                  onClick={() => setRoomToDelete(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteRoom}
                  className="btn btn-danger rounded-pill px-4 fw-bold"
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerRooms;
