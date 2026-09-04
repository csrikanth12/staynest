import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import FilterSidebar from '../../components/FilterSidebar';
import HostelCard from '../../components/HostelCard';
import { HostelCardSkeleton } from '../../components/SkeletonLoader';
import BackButton from '../../components/BackButton';
import hostelService from '../../services/hostelService';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  ArrowUpDown,
  Building,
  X,
  List,
  Map as MapIcon,
  Star,
  ExternalLink,
} from 'lucide-react';

const ExploreHostels = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL search params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '8000',
    rating: searchParams.get('rating') || '',
    amenities: searchParams.get('amenities') || '',
    sort: searchParams.get('sort') || 'recommended',
  });

  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [activeMapHostel, setActiveMapHostel] = useState(null);

  // Sync state with URL search params changes
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      city: searchParams.get('city') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '8000',
      rating: searchParams.get('rating') || '',
      amenities: searchParams.get('amenities') || '',
      sort: searchParams.get('sort') || 'recommended',
    });
  }, [searchParams]);

  // Fetch filtered hostels whenever filters change
  useEffect(() => {
    const fetchFilteredHostels = async () => {
      setLoading(true);
      try {
        const queryParams = {};
        if (filters.search && filters.search.trim()) queryParams.search = filters.search.trim();
        if (
          filters.city &&
          filters.city.trim() &&
          filters.city.toLowerCase() !== 'all' &&
          filters.city.toLowerCase() !== 'all cities'
        ) {
          queryParams.city = filters.city.trim();
        }
        if (filters.minPrice && Number(filters.minPrice) > 0) queryParams.minPrice = filters.minPrice;
        if (filters.maxPrice && Number(filters.maxPrice) < 8000) queryParams.maxPrice = filters.maxPrice;
        if (filters.rating && Number(filters.rating) > 0) queryParams.rating = filters.rating;
        if (filters.amenities && filters.amenities.trim()) queryParams.amenities = filters.amenities.trim();
        if (filters.sort) queryParams.sort = filters.sort;

        const res = await hostelService.getAllHostels(queryParams);
        if (res.success && res.data) {
          setHostels(res.data);
          if (res.data.length > 0) {
            setActiveMapHostel(res.data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching filtered hostels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredHostels();
  }, [filters]);

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.keys(newFilters).forEach((k) => {
      const val = newFilters[k];
      if (
        val &&
        val !== 'all' &&
        val !== 'All' &&
        !(k === 'maxPrice' && Number(val) >= 8000) &&
        !(k === 'sort' && val === 'recommended')
      ) {
        params.set(k, val);
      }
    });
    setSearchParams(params);
  };

  const resetFilters = () => {
    const defaultFilters = {
      search: '',
      city: '',
      minPrice: '',
      maxPrice: '8000',
      rating: '',
      amenities: '',
      sort: 'recommended',
    };
    setFilters(defaultFilters);
    setSearchParams({});
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('search', filters.search);
  };

  // Helper coordinate pins generator for map view
  const getMapCoordinates = (index, total) => {
    const coords = [
      { top: '35%', left: '42%' },
      { top: '48%', left: '55%' },
      { top: '60%', left: '38%' },
      { top: '28%', left: '62%' },
      { top: '55%', left: '70%' },
      { top: '40%', left: '25%' },
      { top: '72%', left: '50%' },
      { top: '22%', left: '45%' },
      { top: '65%', left: '28%' },
    ];
    return coords[index % coords.length];
  };

  return (
    <div className="explore-page bg-light py-4 min-vh-100">
      <div className="container">
        <BackButton fallback="/" />

        {/* Header Title & Search Ribbon */}
        <div className="bg-white p-4 rounded-4 border shadow-sm mb-4">
          <div className="row g-3 align-items-center justify-content-between">
            <div className="col-lg-6 col-md-5">
              <h2 className="fw-bold text-dark mb-1">
                {filters.city ? `Hostels in ${filters.city}` : 'Explore All Hostels'}
              </h2>
              <p className="text-muted small mb-0">
                Found <span className="fw-bold text-primary">{hostels.length} verified stays</span> matching your criteria
              </p>
            </div>

            {/* Quick Keyword Search Form */}
            <div className="col-lg-6 col-md-7">
              <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 bg-light"
                    placeholder="Search by hostel name, landmark, or city..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-stayguard px-3">
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* Active Filter Pills Bar */}
          {(filters.city || filters.search || filters.rating || filters.amenities || filters.maxPrice < 8000) && (
            <div className="d-flex flex-wrap align-items-center gap-2 mt-3 pt-3 border-top">
              <span className="text-muted small fw-semibold">Active Filters:</span>
              {filters.city && (
                <span className="badge bg-primary-subtle text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1.5 d-flex align-items-center gap-1">
                  <span>City: {filters.city}</span>
                  <X size={13} className="cursor-pointer" onClick={() => updateFilter('city', '')} />
                </span>
              )}
              {filters.search && (
                <span className="badge bg-primary-subtle text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1.5 d-flex align-items-center gap-1">
                  <span>Keyword: "{filters.search}"</span>
                  <X size={13} className="cursor-pointer" onClick={() => updateFilter('search', '')} />
                </span>
              )}
              {filters.rating && (
                <span className="badge bg-warning-subtle text-warning-emphasis border border-warning border-opacity-25 rounded-pill px-3 py-1.5 d-flex align-items-center gap-1">
                  <span>★ {filters.rating}+</span>
                  <X size={13} className="cursor-pointer" onClick={() => updateFilter('rating', '')} />
                </span>
              )}
              {filters.maxPrice < 8000 && (
                <span className="badge bg-light text-secondary border rounded-pill px-3 py-1.5 d-flex align-items-center gap-1">
                  <span>Up to ₹{Number(filters.maxPrice).toLocaleString('en-IN')}</span>
                  <X size={13} className="cursor-pointer" onClick={() => updateFilter('maxPrice', '8000')} />
                </span>
              )}
              {filters.amenities && (
                <span className="badge bg-primary-subtle text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1.5 d-flex align-items-center gap-1">
                  <span>Amenities: {filters.amenities}</span>
                  <X size={13} className="cursor-pointer" onClick={() => updateFilter('amenities', '')} />
                </span>
              )}
              <button
                onClick={resetFilters}
                className="btn btn-link btn-sm text-danger text-decoration-none p-0 fw-semibold"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Main Grid: Sidebar + Results */}
        <div className="row g-4">
          {/* Mobile Filter Trigger Button */}
          <div className="col-12 d-lg-none">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="btn btn-white w-100 border d-flex align-items-center justify-content-center gap-2 py-2.5 shadow-sm rounded-3 fw-bold text-primary"
            >
              <SlidersHorizontal size={18} />
              <span>Filter Options ({hostels.length} Stays)</span>
            </button>
          </div>

          {/* Left Filter Sidebar (Desktop) */}
          <div className="col-lg-4 col-xl-3 d-none d-lg-block">
            <div className="sticky-top" style={{ top: '90px', zIndex: 10 }}>
              <FilterSidebar
                filters={filters}
                onFilterChange={updateFilter}
                onResetFilters={resetFilters}
              />
            </div>
          </div>

          {/* Right Results Column */}
          <div className="col-lg-8 col-xl-9">
            {/* Sorting & View Toggle Bar */}
            <div className="d-flex flex-wrap align-items-center justify-content-between bg-white p-3 rounded-4 border shadow-sm mb-4 gap-2">
              <div className="d-flex align-items-center gap-2">
                {/* List / Map View Toggle Buttons */}
                <div className="btn-group bg-light p-1 rounded-pill" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-1.5 ${
                      viewMode === 'list' ? 'btn-primary shadow-sm text-white' : 'btn-light bg-transparent text-secondary border-0'
                    }`}
                    onClick={() => setViewMode('list')}
                  >
                    <List size={15} />
                    <span>List View</span>
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-1.5 ${
                      viewMode === 'map' ? 'btn-primary shadow-sm text-white' : 'btn-light bg-transparent text-secondary border-0'
                    }`}
                    onClick={() => setViewMode('map')}
                  >
                    <MapIcon size={15} />
                    <span>Map View</span>
                  </button>
                </div>

                <div className="text-muted small ms-2 d-none d-sm-inline">
                  Showing <strong className="text-dark">{hostels.length}</strong> stays
                </div>
              </div>

              {/* Sort By Dropdown */}
              <div className="d-flex align-items-center gap-2">
                <ArrowUpDown size={15} className="text-muted" />
                <label className="text-muted small fw-semibold text-nowrap mb-0">Sort By:</label>
                <select
                  className="form-select form-select-sm border-0 bg-light fw-bold text-dark rounded-pill px-3 py-1.5 shadow-none"
                  style={{ width: 'auto' }}
                  value={filters.sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Content Display: List vs Map */}
            {loading ? (
              <div className="row g-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div className="col-12 col-md-6" key={n}>
                    <HostelCardSkeleton />
                  </div>
                ))}
              </div>
            ) : hostels.length === 0 ? (
              <div className="text-center py-5 bg-white rounded-4 border p-5 shadow-sm">
                <Building size={48} className="text-muted mb-3 opacity-50" />
                <h4 className="fw-bold text-dark mb-2">No hostels match your filters</h4>
                <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '420px' }}>
                  Try broadening your search criteria, raising your price ceiling, or clearing some filters.
                </p>
                <button onClick={resetFilters} className="btn btn-stayguard rounded-pill px-4">
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'list' ? (
              <div className="row g-4">
                {hostels.map((hostel) => (
                  <div className="col-12 col-md-6" key={hostel._id}>
                    <HostelCard hostel={hostel} />
                  </div>
                ))}
              </div>
            ) : (
              /* Interactive Map View */
              <div className="map-canvas-container shadow-sm p-4">
                <div className="map-grid-bg rounded-4 p-4 position-relative">
                  <div className="position-absolute top-0 start-0 m-3 z-3 bg-white p-2 px-3 rounded-pill shadow-sm small fw-bold text-primary d-flex align-items-center gap-1.5">
                    <MapIcon size={16} />
                    <span>Interactive City Map ({filters.city || 'India'})</span>
                  </div>

                  {/* Marker Pins */}
                  {hostels.map((h, i) => {
                    const pos = getMapCoordinates(i, hostels.length);
                    const isActive = activeMapHostel?._id === h._id;
                    return (
                      <button
                        key={h._id}
                        type="button"
                        className={`map-marker-pin ${isActive ? 'active' : ''}`}
                        style={{ top: pos.top, left: pos.left }}
                        onClick={() => setActiveMapHostel(h)}
                      >
                        ₹{(h.startingPrice || 1200).toLocaleString('en-IN')}
                      </button>
                    );
                  })}

                  {/* Floating Active Hostel Card Popup */}
                  {activeMapHostel && (
                    <div
                      className="position-absolute bottom-0 start-50 translate-middle-x mb-3 bg-white p-3 rounded-4 shadow-lg border z-3"
                      style={{ width: '92%', maxWidth: '380px' }}
                    >
                      <div className="d-flex gap-3 align-items-center">
                        <img
                          src={
                            activeMapHostel.images?.[0] ||
                            '/images/hostels/hostel-1/building.jpg'
                          }
                          alt={activeMapHostel.name}
                          className="rounded-3 object-fit-cover shadow-sm"
                          style={{ width: '75px', height: '75px' }}
                        />
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="d-flex align-items-center gap-1 text-warning small fw-bold mb-0.5">
                            <Star size={13} className="fill-warning" />
                            <span>{activeMapHostel.rating ? Number(activeMapHostel.rating).toFixed(1) : '4.7'}</span>
                          </div>
                          <h6 className="fw-bold text-dark text-truncate mb-1">{activeMapHostel.name}</h6>
                          <div className="d-flex align-items-center justify-content-between">
                            <span className="fw-extrabold text-primary">
                              ₹{(activeMapHostel.startingPrice || 1200).toLocaleString('en-IN')}
                              <small className="text-muted fw-normal">/nt</small>
                            </span>
                            <Link
                              to={`/hostels/${activeMapHostel._id}`}
                              className="btn btn-stayguard btn-sm rounded-pill px-3"
                              style={{ fontSize: '0.78rem' }}
                            >
                              Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Full-Height Drawer Modal */}
      {mobileFilterOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-scrollable modal-fullscreen-sm-down">
            <div className="modal-content rounded-4 border-0 p-3">
              <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
                <h5 className="modal-title fw-bold text-dark">Filter Hostels</h5>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setMobileFilterOpen(false)}
                />
              </div>

              <div className="modal-body p-0">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={updateFilter}
                  onResetFilters={resetFilters}
                />
              </div>

              <div className="modal-footer border-top pt-3 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-3"
                  onClick={resetFilters}
                >
                  Reset All
                </button>
                <button
                  type="button"
                  className="btn btn-stayguard rounded-pill px-4 fw-bold"
                  onClick={() => setMobileFilterOpen(false)}
                >
                  Apply & View {hostels.length} Stays
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreHostels;
