import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import hostelService from '../../services/hostelService';
import reviewService from '../../services/reviewService';
import RoomCard from '../../components/RoomCard';
import ReviewCard from '../../components/ReviewCard';
import BackButton from '../../components/BackButton';
import { HostelDetailsSkeleton } from '../../components/SkeletonLoader';
import {
  Star,
  MapPin,
  Wifi,
  Wind,
  Shield,
  Coffee,
  Car,
  Camera,
  Clock,
  Waves,
  Laptop,
  Dumbbell,
  Utensils,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  Share2,
  ChevronRight,
  ChevronLeft,
  X,
  Maximize2,
  Image as ImageIcon,
  Phone,
  Mail,
  RefreshCw,
  Building,
  Bed,
} from 'lucide-react';

const CATEGORY_NAMES = [
  'Building / Exterior',
  'Room',
  'Beds / Dormitory',
  'Bathroom',
  'Common Area',
  'Corridor / Facilities',
];

const THUMBNAILS_CONFIG = [
  { index: 1, label: 'ROOM', name: 'Private Room' },
  { index: 2, label: 'BEDS', name: 'Beds / Dormitory' },
];

const HostelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  // Lightbox Modal state
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Review Form State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchHostelDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!id) {
        throw new Error('No hostel ID specified in the URL.');
      }
      const res = await hostelService.getHostelById(id);
      if (res && res.success && res.data) {
        setHostel(res.data);
        if (res.data.rooms && res.data.rooms.length > 0) {
          setSelectedRoom(res.data.rooms[0]);
        }
      } else {
        setError(res?.message || 'Could not retrieve hostel details.');
      }
    } catch (err) {
      console.error('Error fetching hostel details:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load hostel details. Please ensure the backend server is online.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostelDetails();
  }, [id]);

  // Guaranteed safe image list with strict categorization
  const defaultBuilding = '/images/hostels/hostel-1/building.jpg';
  const defaultRoom = '/images/hostels/hostel-1/room.jpg';
  const defaultBeds = '/images/hostels/hostel-1/beds.jpg';

  const buildingImage = hostel?.images?.[0] || defaultBuilding;
  const roomImage = hostel?.images?.[1] || defaultRoom;
  const bedsImage = hostel?.images?.[2] || defaultBeds;

  // Exact 3 primary categorized images
  const categorizedImages = [buildingImage, roomImage, bedsImage];
  
  // All images for lightbox (if more than 3 exist)
  const allImages = (hostel?.images && hostel.images.length > 0) ? hostel.images : categorizedImages;

  const currentMainImage = categorizedImages[activeImageIndex] || buildingImage;

  const handleImageError = (idx) => {
    setImageErrors((prev) => ({ ...prev, [idx]: true }));
  };

  useEffect(() => {
    if (!showGalleryModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowGalleryModal(false);
      else if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      else if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % allImages.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGalleryModal, allImages.length]);

  if (loading) {
    return <HostelDetailsSkeleton />;
  }

  // Error State Handling
  if (error) {
    return (
      <div className="container py-5 text-center">
        <BackButton fallback="/explore" />
        <div className="bg-white p-5 rounded-4 shadow-sm border mt-3 max-w-lg mx-auto">
          <AlertCircle size={48} className="text-danger mb-3 mx-auto" />
          <h3 className="fw-bold text-dark mb-2">Unable to Load Hostel Details</h3>
          <p className="text-muted mb-4">{error}</p>
          <div className="d-flex justify-content-center gap-2">
            <button
              onClick={fetchHostelDetails}
              className="btn btn-outline-primary rounded-pill px-4 d-flex align-items-center gap-2"
            >
              <RefreshCw size={16} />
              <span>Retry</span>
            </button>
            <Link to="/explore" className="btn btn-stayguard rounded-pill px-4">
              Explore Hostels
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State Handling
  if (!hostel) {
    return (
      <div className="container py-5 text-center">
        <BackButton fallback="/explore" />
        <div className="bg-white p-5 rounded-4 shadow-sm border mt-3 max-w-lg mx-auto">
          <AlertCircle size={48} className="text-danger mb-3 mx-auto" />
          <h3 className="fw-bold text-dark">Hostel Not Found</h3>
          <p className="text-muted mb-4">The property you are looking for might have been removed or is temporarily unavailable.</p>
          <Link to="/explore" className="btn btn-stayguard rounded-pill px-4">
            Explore Hostels
          </Link>
        </div>
      </div>
    );
  }

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    navigate(`/booking?hostelId=${hostel._id}&roomId=${room._id}`);
  };

  const handleSelectRoomAndBook = (room) => {
    handleSelectRoom(room);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const res = await reviewService.addReview({
        hostelId: hostel._id,
        rating: reviewRating,
        comment: reviewComment,
      });

      if (res.success && res.data) {
        setReviewSuccess('Thank you! Your review has been published.');
        setHostel((prev) => ({
          ...prev,
          reviews: [res.data, ...(prev.reviews || [])],
          numReviews: (prev.numReviews || 0) + 1,
        }));
        setReviewComment('');
        setTimeout(() => setShowReviewModal(false), 1500);
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getAmenityIcon = (name) => {
    switch (name.toLowerCase()) {
      case 'wi-fi':
      case 'wifi':
        return <Wifi size={18} className="text-primary" />;
      case 'ac':
        return <Wind size={18} className="text-info" />;
      case 'locker':
        return <Shield size={18} className="text-success" />;
      case 'breakfast':
        return <Coffee size={18} className="text-warning" />;
      case 'parking':
        return <Car size={18} className="text-secondary" />;
      case 'cctv':
        return <Camera size={18} className="text-danger" />;
      case '24/7 reception':
        return <Clock size={18} className="text-primary" />;
      case 'swimming pool':
        return <Waves size={18} className="text-info" />;
      case 'coworking space':
      case 'workstation':
        return <Laptop size={18} className="text-primary" />;
      case 'gym':
        return <Dumbbell size={18} className="text-success" />;
      case 'cafe':
        return <Utensils size={18} className="text-warning" />;
      default:
        return <CheckCircle2 size={18} className="text-primary" />;
    }
  };

  return (
    <div className="hostel-details-page bg-light py-4">
      <div className="container">
        <BackButton fallback="/explore" />

        <nav aria-label="breadcrumb" className="mb-3 mt-3">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/" className="text-muted">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/explore" className="text-muted">Explore</Link></li>
            <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">{hostel.name}</li>
          </ol>
        </nav>

        <div className="d-flex flex-column flex-md-row justify-content-between mb-3 gap-2">
          <div>
            <h2 className="fw-bold text-dark mb-1">{hostel.name}</h2>
            <div className="d-flex align-items-center gap-1 text-muted small">
              <MapPin size={16} className="text-primary" />
              <span>{hostel.location?.address}, {hostel.location?.city}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1.5"
            onClick={() => {
              if (navigator.share) navigator.share({ title: hostel.name, url: window.location.href });
              else alert('Link copied to clipboard!');
            }}
          >
            <Share2 size={15} />
            <span>Share</span>
          </button>
        </div>

        {/* Interactive Background & Photo Category Switcher Tabs */}
        <div className="d-flex align-items-center gap-2 mb-3 overflow-x-auto pb-1">
          <span className="text-muted small fw-semibold me-1 d-none d-sm-inline">Select View:</span>
          
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 fw-semibold d-inline-flex align-items-center gap-1.5 ${
              activeImageIndex === 0 ? 'btn-primary shadow-sm' : 'btn-white border text-secondary'
            }`}
            onClick={() => setActiveImageIndex(0)}
          >
            <Building size={14} />
            <span>Building / Exterior</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 fw-semibold d-inline-flex align-items-center gap-1.5 ${
              activeImageIndex === 1 ? 'btn-primary shadow-sm' : 'btn-white border text-secondary'
            }`}
            onClick={() => setActiveImageIndex(1)}
          >
            <Bed size={14} />
            <span>Private Room</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 fw-semibold d-inline-flex align-items-center gap-1.5 ${
              activeImageIndex === 2 ? 'btn-primary shadow-sm' : 'btn-white border text-secondary'
            }`}
            onClick={() => setActiveImageIndex(2)}
          >
            <Bed size={14} />
            <span>Beds / Dormitory</span>
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-dark rounded-pill px-3 fw-semibold ms-auto d-inline-flex align-items-center gap-1.5"
            onClick={() => {
              setLightboxIndex(activeImageIndex);
              setShowGalleryModal(true);
            }}
          >
            <ImageIcon size={14} />
            <span>All Photos ({allImages.length})</span>
          </button>
        </div>

        {/* 1. Multi-Image Gallery Layout (Large Main on Left + Stacked ROOM & BEDS on Right) */}
        <div className="row g-3 mb-4">
          <div className="col-lg-8">
            <div
              className="rounded-4 overflow-hidden shadow-sm position-relative cursor-pointer bg-dark"
              style={{ height: '420px' }}
              onClick={() => {
                setLightboxIndex(activeImageIndex);
                setShowGalleryModal(true);
              }}
            >
              {imageErrors[activeImageIndex] ? (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-dark text-white p-4">
                  <ImageIcon size={48} className="mb-2 opacity-50" />
                  <span className="text-white-50">Photo Unavailable</span>
                </div>
              ) : (
                <img
                  src={currentMainImage}
                  alt={`${hostel.name} - ${CATEGORY_NAMES[activeImageIndex] || 'Building / Exterior'}`}
                  className="w-100 h-100 object-fit-cover"
                  style={{ transition: 'all 0.3s ease' }}
                  onError={() => handleImageError(activeImageIndex)}
                />
              )}

              {/* Category Tag on Main Photo */}
              <div className="position-absolute bottom-0 start-0 m-3 d-flex align-items-center gap-2">
                <span className="badge bg-dark bg-opacity-75 text-white px-3 py-2 rounded-pill fw-medium d-inline-flex align-items-center gap-1.5 shadow" style={{ backdropFilter: 'blur(4px)' }}>
                  <ImageIcon size={14} />
                  <span>{CATEGORY_NAMES[activeImageIndex] || 'Building / Exterior'}</span>
                </span>

                {activeImageIndex !== 0 && (
                  <button
                    type="button"
                    className="badge bg-primary text-white border-0 px-2.5 py-2 rounded-pill fw-medium shadow d-inline-flex align-items-center gap-1 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveImageIndex(0);
                    }}
                  >
                    <span>↺ Building View</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4 d-flex flex-column gap-3">
            {THUMBNAILS_CONFIG.map((thumb) => {
              const thumbUrl = categorizedImages[thumb.index];
              const isActive = activeImageIndex === thumb.index;

              return (
                <div
                  key={thumb.label}
                  className={`rounded-4 overflow-hidden position-relative border ${
                    isActive ? 'border-primary border-3 shadow' : 'border-light'
                  }`}
                  style={{ height: '202px', cursor: 'pointer', background: '#0f172a' }}
                  onClick={() => {
                    if (isActive) {
                      setActiveImageIndex(0); // Clicking again switches back to Building
                    } else {
                      setActiveImageIndex(thumb.index); // Switch to clicked category
                    }
                  }}
                  title={`Click to view ${thumb.name}`}
                >
                  {imageErrors[thumb.index] ? (
                    <div className="d-flex align-items-center justify-content-center h-100 bg-secondary text-white small">
                      <ImageIcon size={20} />
                    </div>
                  ) : (
                    <img
                      src={thumbUrl}
                      alt={`${hostel.name} - ${thumb.name}`}
                      className="w-100 h-100 object-fit-cover opacity-90 hover-opacity-100"
                      onError={() => handleImageError(thumb.index)}
                    />
                  )}

                  <div className="position-absolute top-0 start-0 m-2.5">
                    <span className="badge bg-dark bg-opacity-80 text-white px-2.5 py-1 rounded-pill fw-bold" style={{ fontSize: '0.72rem', backdropFilter: 'blur(4px)' }}>
                      {thumb.label}
                    </span>
                  </div>

                  <div className="position-absolute bottom-0 start-0 m-2.5">
                    <span className="badge bg-dark bg-opacity-65 text-white px-2 py-0.5 rounded small" style={{ fontSize: '0.68rem' }}>
                      {isActive ? '✓ Selected (Click to reset)' : 'Click to preview'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full-Screen Lightbox Modal */}
        {showGalleryModal && (
          <div
            className="hostel-lightbox-modal"
            onClick={() => setShowGalleryModal(false)}
            role="dialog"
            aria-modal="true"
          >
            <div className="lightbox-header" onClick={(e) => e.stopPropagation()}>
              <div>
                <h5 className="fw-bold mb-0 text-white">{hostel.name}</h5>
                <small className="text-white-50">
                  {CATEGORY_NAMES[lightboxIndex] || 'Photo'} • {lightboxIndex + 1} of {allImages.length}
                </small>
              </div>
              <button
                type="button"
                className="btn btn-outline-light btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                onClick={() => setShowGalleryModal(false)}
                aria-label="Close photo gallery"
              >
                <X size={22} />
              </button>
            </div>

            <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
              {allImages.length > 1 && (
                <button
                  type="button"
                  className="lightbox-nav-btn prev"
                  onClick={() => setLightboxIndex((i) => (i - 1 + allImages.length) % allImages.length)}
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              <img
                src={allImages[lightboxIndex] || defaultBuilding}
                alt={`${hostel.name} photo ${lightboxIndex + 1}`}
                className="lightbox-main-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = defaultBuilding;
                }}
              />

              {allImages.length > 1 && (
                <button
                  type="button"
                  className="lightbox-nav-btn next"
                  onClick={() => setLightboxIndex((i) => (i + 1) % allImages.length)}
                  aria-label="Next photo"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            <div className="lightbox-footer-filmstrip" onClick={(e) => e.stopPropagation()}>
              {allImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`lightbox-filmstrip-thumb ${lightboxIndex === idx ? 'active' : ''}`}
                  onClick={() => setLightboxIndex(idx)}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = defaultBuilding;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="row g-4">
          <div className="col-lg-8">
            {/* Description Card */}
            <div className="bg-white p-4 rounded-4 border shadow-sm mb-4">
              <h4 className="fw-bold text-dark mb-3">About this hostel</h4>
              <p className="text-secondary mb-0" style={{ lineHeight: '1.7' }}>
                {hostel.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white p-4 rounded-4 border shadow-sm mb-4">
              <h4 className="fw-bold text-dark mb-3">Hostel Amenities & Facilities</h4>
              <div className="row g-3">
                {hostel.amenities?.map((amenity, idx) => (
                  <div className="col-6 col-md-4" key={idx}>
                    <div className="d-flex align-items-center gap-2 p-2.5 bg-light rounded-3">
                      {getAmenityIcon(amenity)}
                      <span className="fw-semibold text-dark small">{amenity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rooms & Dorms Selection */}
            <div id="rooms" className="bg-white p-4 rounded-4 border shadow-sm mb-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h4 className="fw-bold text-dark mb-1">Available Rooms & Dorm Beds</h4>
                  <p className="text-muted small mb-0">Select your preferred bed or room to proceed with booking</p>
                </div>
              </div>

              <div className="d-flex flex-column gap-3">
                {hostel.rooms && hostel.rooms.length > 0 ? (
                  hostel.rooms.map((room) => (
                    <RoomCard
                      key={room._id}
                      room={room}
                      isSelected={selectedRoom?._id === room._id}
                      onSelectRoom={handleSelectRoom}
                    />
                  ))
                ) : (
                  <div className="p-4 text-center bg-light rounded-3 text-muted">
                    No active rooms listed for this hostel at the moment.
                  </div>
                )}
              </div>
            </div>

            {/* Room Comparison Table */}
            <div className="bg-white p-4 rounded-4 border shadow-sm mb-4">
              <h4 className="fw-bold text-dark mb-3">Room Options Comparison</h4>
              <div className="table-responsive">
                <table className="table table-bordered align-middle small mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Room Category</th>
                      <th scope="col">Capacity</th>
                      <th scope="col">Climate Control</th>
                      <th scope="col">Lockers</th>
                      <th scope="col">Bathroom</th>
                      <th scope="col">Price / Night</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-bold text-dark">Deluxe AC Shared Dorm</td>
                      <td>4 - 8 Beds</td>
                      <td><span className="badge bg-success-subtle text-success">24/7 Air Conditioned</span></td>
                      <td>Electronic RFID Locker</td>
                      <td>En-Suite Shared</td>
                      <td className="fw-bold text-primary">₹850 - ₹1,800</td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-dark">Private Pod / Room</td>
                      <td>1 - 2 Guests</td>
                      <td><span className="badge bg-success-subtle text-success">Dedicated Split AC</span></td>
                      <td>Private Wardrobe</td>
                      <td>Attached Private</td>
                      <td className="fw-bold text-primary">₹2,800 - ₹3,500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hostel Rules & Cancellation Policy */}
            <div className="bg-white p-4 rounded-4 border shadow-sm mb-4">
              <h4 className="fw-bold text-dark mb-3">Hostel Rules & Policies</h4>
              <div className="row g-4">
                <div className="col-md-6">
                  <h6 className="fw-bold text-dark mb-2">House Rules</h6>
                  <ul className="list-unstyled d-flex flex-column gap-2 text-secondary small mb-0">
                    {hostel.rules && hostel.rules.length > 0 ? (
                      hostel.rules.map((rule, idx) => (
                        <li key={idx} className="d-flex align-items-start gap-2">
                          <CheckCircle2 size={16} className="text-primary flex-shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="d-flex align-items-start gap-2">
                          <CheckCircle2 size={16} className="text-primary flex-shrink-0 mt-0.5" />
                          <span>Valid Government ID required at check-in.</span>
                        </li>
                        <li className="d-flex align-items-start gap-2">
                          <CheckCircle2 size={16} className="text-primary flex-shrink-0 mt-0.5" />
                          <span>Quiet hours observed from 11:00 PM to 7:00 AM.</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="col-md-6 border-start-md">
                  <h6 className="fw-bold text-dark mb-2">Cancellation Policy</h6>
                  <div className="p-3 bg-light rounded-3 border">
                    <p className="text-secondary small mb-0">
                      {hostel.cancellationPolicy ||
                        'Free cancellation up to 24 hours before check-in date. Instant refund to original payment source.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nearby Places & Connectivity */}
            <div className="bg-white p-4 rounded-4 border shadow-sm mb-4">
              <h4 className="fw-bold text-dark mb-3">Nearby Places & Transit</h4>
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <MapPin size={20} className="text-primary mb-1" />
                    <span className="d-block fw-bold text-dark small">Metro Station</span>
                    <small className="text-muted">450m (6 mins walk)</small>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <Coffee size={20} className="text-primary mb-1" />
                    <span className="d-block fw-bold text-dark small">Cafes & Co-work</span>
                    <small className="text-muted">200m (3 mins walk)</small>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <Laptop size={20} className="text-primary mb-1" />
                    <span className="d-block fw-bold text-dark small">IT / Tech Hub</span>
                    <small className="text-muted">1.2 km (8 mins)</small>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <Car size={20} className="text-primary mb-1" />
                    <span className="d-block fw-bold text-dark small">Airport Express</span>
                    <small className="text-muted">32 km (40 mins)</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white p-4 rounded-4 border shadow-sm mb-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <h4 className="fw-bold text-dark mb-1">Guest Reviews & Ratings</h4>
                  <div className="d-flex align-items-center gap-2">
                    <div className="rating-pill">
                      <Star size={14} className="fill-warning text-warning" />
                      <span>{hostel.rating ? hostel.rating.toFixed(1) : '4.8'}</span>
                    </div>
                    <span className="text-muted small">Based on {hostel.reviews?.length || 18} verified stays</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold"
                >
                  Write a Review
                </button>
              </div>

              {/* 5-Star Rating Breakdown Bars */}
              <div className="p-3 bg-light rounded-3 mb-4">
                <div className="d-flex flex-column gap-2">
                  {[
                    { stars: 5, pct: 78 },
                    { stars: 4, pct: 16 },
                    { stars: 3, pct: 6 },
                    { stars: 2, pct: 0 },
                    { stars: 1, pct: 0 },
                  ].map((item) => (
                    <div className="d-flex align-items-center gap-3" key={item.stars}>
                      <span className="small text-muted fw-bold text-nowrap" style={{ width: '40px' }}>
                        {item.stars} ★
                      </span>
                      <div className="rating-progress-bar">
                        <div className="rating-progress-fill" style={{ width: `${item.pct}%` }} />
                      </div>
                      <span className="small text-muted" style={{ width: '35px', textAlign: 'right' }}>
                        {item.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review List */}
              <div className="d-flex flex-column gap-2">
                {hostel.reviews && hostel.reviews.length > 0 ? (
                  hostel.reviews.map((rev) => (
                    <ReviewCard key={rev._id} review={rev} />
                  ))
                ) : (
                  <div className="text-center py-4 text-muted small">
                    No guest reviews yet. Be the first to review after your stay!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Floating Booking Sticky Card */}
          <div className="col-lg-4">
            <div className="sticky-top bg-white p-4 rounded-4 border shadow-md" style={{ top: '90px' }}>
              <div className="d-flex align-items-baseline justify-content-between mb-3 pb-3 border-bottom">
                <div>
                  <span className="text-muted small d-block" style={{ fontSize: '0.75rem' }}>Price per night</span>
                  <div className="d-flex align-items-baseline gap-1">
                    <span className="fs-3 fw-extrabold text-primary">
                      ₹{(selectedRoom?.price || selectedRoom?.pricePerNight || hostel.startingPrice || 1200).toLocaleString('en-IN')}
                    </span>
                    <span className="text-muted small">/ night</span>
                  </div>
                </div>
                <div className="rating-pill">
                  <Star size={14} className="fill-warning text-warning" />
                  <span className="fw-bold">{hostel.rating ? hostel.rating.toFixed(1) : '4.6'}</span>
                </div>
              </div>

              {/* Booking Box Header */}
              <div className="mb-3">
                <span className="badge bg-primary-subtle text-primary fw-bold px-2.5 py-1 rounded-pill mb-2" style={{ fontSize: '0.72rem' }}>
                  BOOK YOUR STAY
                </span>
                <h6 className="fw-bold text-dark mb-0">Select Room & Reserve</h6>
              </div>

              {/* Room Selection Dropdown */}
              {hostel.rooms && hostel.rooms.length > 0 && (
                <div className="mb-3">
                  <label className="form-label small text-muted fw-semibold mb-1">Select Room Type</label>
                  <select
                    className="form-select form-select-sm fw-bold text-dark rounded-3"
                    value={selectedRoom?._id || ''}
                    onChange={(e) => {
                      const found = hostel.rooms.find((r) => r._id === e.target.value);
                      if (found) setSelectedRoom(found);
                    }}
                  >
                    {hostel.rooms.map((rm) => (
                      <option key={rm._id} value={rm._id}>
                        {rm.roomType || rm.type} - ₹{(rm.price || rm.pricePerNight).toLocaleString('en-IN')}/night ({rm.availableBeds} beds left)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quick Features List */}
              <div className="d-flex flex-column gap-2 text-secondary small mb-3.5 pb-3 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <CheckCircle2 size={15} className="text-success flex-shrink-0" />
                  <span>Free High-Speed Wi-Fi & AC included</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <CheckCircle2 size={15} className="text-success flex-shrink-0" />
                  <span>Personal secure locker with RFID card</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <CheckCircle2 size={15} className="text-success flex-shrink-0" />
                  <span>Free cancellation up to 24h prior</span>
                </div>
              </div>

              {/* Reserve Now Action Button */}
              <button
                type="button"
                onClick={() => {
                  if (selectedRoom) {
                    handleSelectRoomAndBook(selectedRoom);
                  } else if (hostel.rooms && hostel.rooms.length > 0) {
                    handleSelectRoomAndBook(hostel.rooms[0]);
                  } else {
                    const roomsEl = document.getElementById('rooms');
                    if (roomsEl) roomsEl.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="btn btn-stayguard w-100 py-2.5 rounded-pill fw-bold shadow mb-3"
              >
                Reserve Now
              </button>

              {/* Contact Hostel Directly */}
              <div className="pt-2 text-muted small">
                <span className="fw-semibold text-dark d-block mb-1">Hostel Front Desk:</span>
                <div className="d-flex align-items-center gap-1.5 mb-1">
                  <Phone size={13} className="text-primary flex-shrink-0" />
                  <span>{hostel.contactInfo?.phone || '+91 98450 12345'}</span>
                </div>
                <div className="d-flex align-items-center gap-1.5">
                  <Mail size={13} className="text-primary flex-shrink-0" />
                  <span>{hostel.contactInfo?.email || 'contact@stayguard.com'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="modal-title fw-bold text-dark">Review {hostel.name}</h5>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setShowReviewModal(false)}
                />
              </div>

              {reviewError && <div className="alert alert-danger py-2 small">{reviewError}</div>}
              {reviewSuccess && <div className="alert alert-success py-2 small">{reviewSuccess}</div>}

              <form onSubmit={handleReviewSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">Your Star Rating</label>
                  <div className="d-flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`btn btn-sm ${
                          reviewRating >= star ? 'btn-warning text-dark' : 'btn-light border text-muted'
                        }`}
                        onClick={() => setReviewRating(star)}
                      >
                        ★ {star}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-dark">Your Review Comments</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Share details of your stay, Wi-Fi speed, cleanliness, host vibe..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                  />
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-3"
                    onClick={() => setShowReviewModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-stayguard rounded-pill px-4"
                    disabled={submittingReview}
                  >
                    {submittingReview ? 'Publishing...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelDetails;
