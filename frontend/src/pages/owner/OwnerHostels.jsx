import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import hostelService from '../../services/hostelService';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import OwnerFilterPanel from '../../components/OwnerFilterPanel';
import { AMENITIES_LIST, POPULAR_CITIES } from '../../data/hostels';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Star,
  BedDouble,
  ExternalLink,
  Check,
  X,
  Phone,
  Mail,
  AlertTriangle,
  Search,
} from 'lucide-react';

const OwnerHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Delete modal state
  const [hostelToDelete, setHostelToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form data
  const initialFormState = {
    name: '',
    description: '',
    address: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '',
    landmark: '',
    exteriorImage: '/images/hostels/hostel-1/building.jpg',
    roomImage: '/images/hostels/hostel-1/room.jpg',
    bedsImage: '/images/hostels/hostel-1/beds.jpg',
    bathroomImage: '/images/hostels/hostel-1/bathroom.jpg',
    commonAreaImage: '/images/hostels/hostel-1/common.jpg',
    facilitiesImage: '/images/hostels/hostel-1/corridor.jpg',
    otherViewImage: '/images/hostels/hostel-1/building.jpg',
    amenities: ['Wi-Fi', 'AC', 'Locker', 'Breakfast'],
    rules: 'Valid Government ID required, Quiet hours from 11 PM to 7 AM',
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
    phone: '+91 98450 12345',
    email: 'contact@stayguard.com',
    startingPrice: 1200,
    isFeatured: false,
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchHostels = async () => {
    try {
      const res = await hostelService.getOwnerHostels();
      if (res.success && res.data) {
        setHostels(res.data);
      }
    } catch (err) {
      console.error('Error fetching owner hostels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialFormState);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (hostel) => {
    setIsEditing(true);
    setEditingId(hostel._id);
    const imgs = hostel.images || [];
    setFormData({
      name: hostel.name,
      description: hostel.description,
      address: hostel.location?.address || '',
      city: hostel.location?.city || 'Hyderabad',
      state: hostel.location?.state || 'Telangana',
      pincode: hostel.location?.pincode || '',
      landmark: hostel.location?.landmark || '',
      exteriorImage: imgs[0] || '',
      roomImage: imgs[1] || '',
      bedsImage: imgs[2] || '',
      bathroomImage: imgs[3] || '',
      commonAreaImage: imgs[4] || '',
      facilitiesImage: imgs[5] || '',
      otherViewImage: imgs[6] || '',
      amenities: hostel.amenities || [],
      rules: hostel.rules?.join(', ') || '',
      cancellationPolicy: hostel.cancellationPolicy || '',
      phone: hostel.contactInfo?.phone || '',
      email: hostel.contactInfo?.email || '',
      startingPrice: hostel.startingPrice || 1200,
      isFeatured: hostel.isFeatured || false,
    });
    setError('');
    setShowModal(true);
  };

  const handleAmenityToggle = (amenity) => {
    const current = formData.amenities || [];
    if (current.includes(amenity)) {
      setFormData({ ...formData, amenities: current.filter((a) => a !== amenity) });
    } else {
      setFormData({ ...formData, amenities: [...current, amenity] });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const imagesArr = [
        formData.exteriorImage,
        formData.roomImage,
        formData.bedsImage,
        formData.bathroomImage,
        formData.commonAreaImage,
        formData.facilitiesImage,
        formData.otherViewImage,
      ]
        .map((img) => (img ? img.trim() : ''))
        .filter(Boolean);

      const rulesArr = formData.rules
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name,
        description: formData.description,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          landmark: formData.landmark,
        },
        images: imagesArr.length > 0 ? imagesArr : [formData.exteriorImage],
        amenities: formData.amenities,
        rules: rulesArr,
        cancellationPolicy: formData.cancellationPolicy,
        contactInfo: {
          phone: formData.phone,
          email: formData.email,
        },
        startingPrice: Number(formData.startingPrice),
        isFeatured: formData.isFeatured,
      };

      if (isEditing) {
        await hostelService.updateHostel(editingId, payload);
      } else {
        await hostelService.createHostel(payload);
      }

      await fetchHostels();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save hostel');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHostel = async () => {
    if (!hostelToDelete) return;
    setDeleting(true);
    try {
      await hostelService.deleteHostel(hostelToDelete._id);
      await fetchHostels();
      setHostelToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete hostel');
    } finally {
      setDeleting(false);
    }
  };

  const filteredHostels = hostels.filter((h) => {
    if (selectedCity !== 'all' && h.location?.city?.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    if (searchKeyword) {
      const q = searchKeyword.toLowerCase();
      return (
        h.name?.toLowerCase().includes(q) ||
        h.location?.address?.toLowerCase().includes(q) ||
        h.location?.city?.toLowerCase().includes(q) ||
        h.location?.landmark?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="owner-hostels-page pb-5">
      <BackButton />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">My Hostels & Properties</h2>
          <p className="text-muted small mb-0">Manage listings, descriptions, amenities, and property policies</p>
        </div>

        <button onClick={openAddModal} className="btn btn-stayguard rounded-pill px-4 fw-semibold">
          <Plus size={18} />
          <span>Add New Hostel</span>
        </button>
      </div>

      {/* Enhanced Scrollable Filter Panel with Sticky Actions */}
      <OwnerFilterPanel
        title="Filter Hostels"
        subtitle="Filter by destination city and property keywords"
        activeCount={(selectedCity !== 'all' ? 1 : 0) + (searchKeyword ? 1 : 0)}
        onClear={() => {
          setSelectedCity('all');
          setSearchKeyword('');
        }}
        onApply={() => {}}
      >
        <div className="row g-3">
          {/* City Selection */}
          <div className="col-12 col-md-7">
            <label className="form-label fw-bold text-dark small text-uppercase mb-2">
              Destination City
            </label>
            <div className="owner-filter-pills">
              <button
                type="button"
                onClick={() => setSelectedCity('all')}
                className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                  selectedCity === 'all'
                    ? 'btn-primary'
                    : 'btn-light border text-secondary'
                }`}
              >
                All Cities ({hostels.length})
              </button>
              {POPULAR_CITIES.map((c) => {
                const countInCity = hostels.filter(
                  (h) => h.location?.city?.toLowerCase() === c.name.toLowerCase()
                ).length;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedCity(c.name)}
                    className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                      selectedCity.toLowerCase() === c.name.toLowerCase()
                        ? 'btn-primary'
                        : 'btn-light border text-secondary'
                    }`}
                  >
                    {c.name} {countInCity > 0 ? `(${countInCity})` : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Keyword */}
          <div className="col-12 col-md-5">
            <label className="form-label fw-bold text-dark small text-uppercase mb-2">
              Search Properties
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control form-control-sm bg-light"
                placeholder="Search by name, address, landmark..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>
        </div>
      </OwnerFilterPanel>

      {/* Hostels Grid */}
      {loading ? (
        <Loader message="Loading your properties..." />
      ) : hostels.length === 0 ? (
        <div className="bg-white rounded-4 border p-5 text-center shadow-sm">
          <Building2 size={54} className="text-muted opacity-40 mb-3" />
          <h4 className="fw-bold text-dark mb-2">No Hostels Listed Yet</h4>
          <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '440px' }}>
            Click the "Add New Hostel" button to create your first hostel listing and start receiving guest bookings.
          </p>
          <button onClick={openAddModal} className="btn btn-stayguard rounded-pill px-4">
            <Plus size={18} />
            <span>Add New Hostel</span>
          </button>
        </div>
      ) : filteredHostels.length === 0 ? (
        <div className="bg-white rounded-4 border p-5 text-center shadow-sm">
          <Building2 size={48} className="text-muted opacity-40 mb-3" />
          <h5 className="fw-bold text-dark mb-1">No properties match your filter</h5>
          <p className="text-muted small mb-0">Try selecting a different city or clearing the search keyword.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredHostels.map((hostel) => (
            <div className="col-12 col-lg-6" key={hostel._id}>
              <div className="card sg-card border-0 overflow-hidden h-100">
                <div className="row g-0 h-100">
                  <div className="col-sm-5 position-relative">
                    <img
                      src={
                        hostel.images?.[0] ||
                        '/images/hostels/hostel-1/building.jpg'
                      }
                      alt={hostel.name}
                      className="w-100 h-100 object-fit-cover"
                      style={{ minHeight: '220px' }}
                    />
                    <div className="position-absolute top-0 start-0 m-2">
                      <span className="rating-pill">
                        <Star size={13} className="fill-warning text-warning" />
                        <span>{hostel.rating || 4.5}</span>
                      </span>
                    </div>
                  </div>

                  <div className="col-sm-7 p-3.5 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center gap-1 text-muted small mb-1">
                        <MapPin size={14} className="text-primary" />
                        <span>{hostel.location?.city}</span>
                      </div>

                      <h5 className="fw-bold text-dark mb-1 text-truncate-2">{hostel.name}</h5>
                      <p className="text-muted small text-truncate-2 mb-3" style={{ fontSize: '0.82rem' }}>
                        {hostel.description}
                      </p>

                      <div className="d-flex flex-wrap gap-2 text-secondary small mb-3">
                        <span className="badge bg-light text-dark border px-2.5 py-1 rounded-pill">
                          {hostel.roomCount || 0} Rooms Listed
                        </span>
                        <span className="badge bg-primary-subtle text-primary border border-primary border-opacity-25 px-2.5 py-1 rounded-pill">
                          From ₹{hostel.startingPrice}/night
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                      <Link
                        to={`/hostels/${hostel._id}`}
                        target="_blank"
                        className="btn btn-link text-secondary p-0 small text-decoration-none d-flex align-items-center gap-1"
                      >
                        <ExternalLink size={14} />
                        <span>Public View</span>
                      </Link>

                      <div className="d-flex gap-2">
                        <button
                          onClick={() => openEditModal(hostel)}
                          className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setHostelToDelete(hostel)}
                          className="btn btn-outline-danger btn-sm rounded-pill px-2.5"
                          title="Delete Hostel"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Hostel Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 p-4">
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  {isEditing ? 'Edit Hostel Property' : 'Add New Hostel Property'}
                </h5>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setShowModal(false)}
                />
              </div>

              {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

              <form onSubmit={handleFormSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-8">
                    <label className="form-label small fw-bold text-dark">Hostel Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. The Hyderabad Backpackers Haven"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-dark">Starting Price (₹/night) *</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="499"
                      value={formData.startingPrice}
                      onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-bold text-dark">Description *</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="3"
                      placeholder="Describe the atmosphere, community vibe, workstations, and proximity to attractions..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Location Grid */}
                <h6 className="fw-bold text-dark mb-2">Location Details</h6>
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Street Address *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Plot 42, Silicon Valley Lane"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small text-muted">City *</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    >
                      {POPULAR_CITIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                      <option value="Other">Other City</option>
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small text-muted">State *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Telangana"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small text-muted">Landmark (e.g. Near Cyber Towers)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Near Metro Station"
                      value={formData.landmark}
                      onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    />
                  </div>
                </div>

                {/* Categorized Hostel Images */}
                <div className="p-3 bg-light rounded-3 border mb-3">
                  <h6 className="fw-bold text-dark mb-1 d-flex align-items-center justify-content-between">
                    <span>Hostel Photo Collection</span>
                    <span className="badge bg-primary text-white font-normal" style={{ fontSize: '0.7rem' }}>Dedicated Property Categories</span>
                  </h6>
                  <p className="text-muted small mb-3" style={{ fontSize: '0.78rem' }}>
                    Provide dedicated photo URLs for each category to ensure a professional card presentation on Explore, Home, and Details pages.
                  </p>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">1. Exterior Facade URL *</label>
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.exteriorImage}
                        onChange={(e) => setFormData({ ...formData, exteriorImage: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">2. Bedroom / Private Room URL</label>
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.roomImage}
                        onChange={(e) => setFormData({ ...formData, roomImage: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-dark mb-1">3. Beds / Dormitory Bunk Beds URL</label>
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.bedsImage}
                        onChange={(e) => setFormData({ ...formData, bedsImage: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-dark mb-1">4. Bathroom / Washroom URL</label>
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.bathroomImage}
                        onChange={(e) => setFormData({ ...formData, bathroomImage: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-dark mb-1">5. Common Area / Reception URL</label>
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.commonAreaImage}
                        onChange={(e) => setFormData({ ...formData, commonAreaImage: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">6. Lounge / Rooftop / Cafe URL (Optional)</label>
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.facilitiesImage}
                        onChange={(e) => setFormData({ ...formData, facilitiesImage: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">7. Other Property View URL (Optional)</label>
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.otherViewImage}
                        onChange={(e) => setFormData({ ...formData, otherViewImage: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Live Image Previews */}
                  <label className="form-label small text-muted mb-1.5">Live Photo Preview Strip:</label>
                  <div className="d-flex gap-2 overflow-x-auto pb-1">
                    {[
                      { label: 'Exterior', url: formData.exteriorImage },
                      { label: 'Bedroom', url: formData.roomImage },
                      { label: 'Beds', url: formData.bedsImage },
                      { label: 'Bathroom', url: formData.bathroomImage },
                      { label: 'Common Area', url: formData.commonAreaImage },
                      { label: 'Lounge/Cafe', url: formData.facilitiesImage },
                      { label: 'Property View', url: formData.otherViewImage },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="rounded-2 border overflow-hidden position-relative flex-shrink-0 bg-white shadow-sm text-center"
                        style={{ width: '85px', height: '65px' }}
                      >
                        {item.url ? (
                          <img
                            src={item.url}
                            alt={item.label}
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center h-100 small text-muted" style={{ fontSize: '0.65rem' }}>
                            Empty
                          </div>
                        )}
                        <span
                          className="position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-75 text-white py-0.5 text-truncate px-1"
                          style={{ fontSize: '0.62rem' }}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities Picker */}
                <h6 className="fw-bold text-dark mb-2">Amenities Included</h6>
                <div className="d-flex flex-wrap gap-1.5 mb-3">
                  {AMENITIES_LIST.map((amenity) => {
                    const active = formData.amenities?.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        className={`btn btn-sm rounded-pill px-2.5 py-1 ${
                          active ? 'btn-primary' : 'btn-light border text-secondary'
                        }`}
                        style={{ fontSize: '0.78rem' }}
                        onClick={() => handleAmenityToggle(amenity)}
                      >
                        {active ? `✓ ${amenity}` : `+ ${amenity}`}
                      </button>
                    );
                  })}
                </div>

                {/* Contact & Policy */}
                <div className="row g-2 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Hostel Phone</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Hostel Email</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-muted">House Rules (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={formData.rules}
                      onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                    />
                  </div>
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
                    {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Hostel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {hostelToDelete && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 p-4">
              <div className="text-center mb-3">
                <div className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-10 text-danger mb-2">
                  <AlertTriangle size={32} />
                </div>
                <h5 className="modal-title fw-bold text-dark">Delete Hostel Listing?</h5>
                <p className="text-muted small">
                  Are you sure you want to remove <strong>{hostelToDelete.name}</strong>? All associated room inventories will also be deleted.
                </p>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-3"
                  onClick={() => setHostelToDelete(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteHostel}
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

export default OwnerHostels;
