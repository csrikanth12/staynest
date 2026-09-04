import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, X, History, Sparkles } from 'lucide-react';
import { POPULAR_CITIES } from '../data/hostels';

const SearchBar = ({ initialValues = {}, className = '' }) => {
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 24 * 3600 * 1000)
    .toISOString()
    .split('T')[0];

  const [destination, setDestination] = useState(initialValues.city || initialValues.search || '');
  const [checkIn, setCheckIn] = useState(initialValues.checkIn || todayStr);
  const [checkOut, setCheckOut] = useState(initialValues.checkOut || tomorrowStr);
  const [guests, setGuests] = useState(initialValues.guests || 1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sg_recent_searches') || '[]');
      setRecentSearches(saved);
    } catch (e) {}
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = destination.trim();
    if (query) {
      // Save to recent searches
      try {
        const updated = [query, ...recentSearches.filter((s) => s.toLowerCase() !== query.toLowerCase())].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('sg_recent_searches', JSON.stringify(updated));
      } catch (err) {}
    }

    const params = new URLSearchParams();
    if (query) {
      params.append('search', query);
    }
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    if (guests) params.append('guests', guests);

    setShowSuggestions(false);
    navigate(`/explore?${params.toString()}`);
  };

  const handleSelectCity = (cityName) => {
    setDestination(cityName);
    setShowSuggestions(false);
  };

  const filteredCities = destination
    ? POPULAR_CITIES.filter((c) =>
        c.name.toLowerCase().includes(destination.toLowerCase()) ||
        c.state.toLowerCase().includes(destination.toLowerCase())
      )
    : POPULAR_CITIES;

  return (
    <form onSubmit={handleSubmit} className={`hero-search-box ${className}`} ref={searchContainerRef}>
      <div className="row g-3 align-items-center">
        {/* Destination */}
        <div className="col-lg-3 col-md-6 position-relative">
          <div className="d-flex align-items-center gap-2 p-2 border rounded-3 bg-light">
            <MapPin size={20} className="text-primary flex-shrink-0 ms-1" />
            <div className="w-100 position-relative">
              <label className="form-label small text-muted mb-0 fw-semibold">Where are you going?</label>
              <input
                type="text"
                className="form-control form-control-sm border-0 bg-transparent p-0 shadow-none fw-bold text-dark"
                placeholder="Search city, area or hostel..."
                value={destination}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setShowSuggestions(true);
                }}
              />
            </div>
            {destination && (
              <button
                type="button"
                className="btn btn-sm text-muted p-0 me-1"
                onClick={() => setDestination('')}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && (
            <div className="search-autocomplete-box">
              {/* Recent Searches */}
              {recentSearches.length > 0 && !destination && (
                <div className="p-2 border-bottom">
                  <span className="text-muted small fw-bold px-2 text-uppercase d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                    <History size={12} />
                    <span>Recent Searches</span>
                  </span>
                  {recentSearches.map((term, i) => (
                    <div
                      key={i}
                      className="search-autocomplete-item"
                      onClick={() => handleSelectCity(term)}
                    >
                      <History size={14} className="text-muted" />
                      <span className="small fw-semibold text-dark">{term}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Popular Destinations */}
              <div className="p-2">
                <span className="text-muted small fw-bold px-2 text-uppercase d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                  <Sparkles size={12} className="text-warning" />
                  <span>Popular Destinations</span>
                </span>
                {filteredCities.slice(0, 6).map((c) => (
                  <div
                    key={c.name}
                    className="search-autocomplete-item"
                    onClick={() => handleSelectCity(c.name)}
                  >
                    <MapPin size={14} className="text-primary" />
                    <div className="d-flex justify-content-between align-items-center w-100">
                      <span className="small fw-bold text-dark">{c.name}</span>
                      <small className="text-muted">{c.count}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Check-In */}
        <div className="col-lg-3 col-md-6 col-6">
          <div className="d-flex align-items-center gap-2 p-2 border rounded-3 bg-light">
            <Calendar size={20} className="text-primary flex-shrink-0 ms-1" />
            <div className="w-100">
              <label className="form-label small text-muted mb-0 fw-semibold">Check-in</label>
              <input
                type="date"
                min={todayStr}
                className="form-control form-control-sm border-0 bg-transparent p-0 shadow-none fw-bold text-dark"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Check-Out */}
        <div className="col-lg-3 col-md-6 col-6">
          <div className="d-flex align-items-center gap-2 p-2 border rounded-3 bg-light">
            <Calendar size={20} className="text-primary flex-shrink-0 ms-1" />
            <div className="w-100">
              <label className="form-label small text-muted mb-0 fw-semibold">Check-out</label>
              <input
                type="date"
                min={checkIn || todayStr}
                className="form-control form-control-sm border-0 bg-transparent p-0 shadow-none fw-bold text-dark"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Guests & Search Button */}
        <div className="col-lg-3 col-md-6">
          <div className="d-flex gap-2">
            <div className="d-flex align-items-center gap-2 p-2 border rounded-3 bg-light flex-grow-1">
              <Users size={20} className="text-primary flex-shrink-0 ms-1" />
              <div className="w-100">
                <label className="form-label small text-muted mb-0 fw-semibold">Guests</label>
                <select
                  className="form-select form-select-sm border-0 bg-transparent p-0 shadow-none fw-bold text-dark"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5+ Guests</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-stayguard px-4 py-2 rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ minHeight: '52px' }}
            >
              <Search size={18} />
              <span className="ms-1.5 fw-bold">Search Hostels</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
