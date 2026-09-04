import React from 'react';
import { Filter, RotateCcw, Star, MapPin, Sliders, Check } from 'lucide-react';
import { POPULAR_CITIES, AMENITIES_LIST, ROOM_TYPES } from '../data/hostels';

const FilterSidebar = ({ filters, onFilterChange, onResetFilters }) => {
  const handleCitySelect = (cityName) => {
    onFilterChange('city', cityName === filters.city ? '' : cityName);
  };

  const handlePriceChange = (e) => {
    onFilterChange('maxPrice', e.target.value);
  };

  const handleRatingSelect = (ratingVal) => {
    onFilterChange('rating', ratingVal === filters.rating ? '' : ratingVal);
  };

  const handleAmenityToggle = (amenity) => {
    const currentAmenities = filters.amenities ? filters.amenities.split(',') : [];
    let updated;
    if (currentAmenities.includes(amenity)) {
      updated = currentAmenities.filter((a) => a !== amenity);
    } else {
      updated = [...currentAmenities, amenity];
    }
    onFilterChange('amenities', updated.join(','));
  };

  const currentAmenitiesList = filters.amenities ? filters.amenities.split(',') : [];

  return (
    <div
      className="bg-white p-4 rounded-4 border shadow-sm custom-scrollbar"
      style={{
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-4">
        <div className="d-flex align-items-center gap-2">
          <Sliders size={18} className="text-primary" />
          <h5 className="fw-bold text-dark mb-0">Filters</h5>
        </div>
        <button
          onClick={onResetFilters}
          className="btn btn-sm text-muted d-flex align-items-center gap-1 p-0 hover-text-primary"
          style={{ fontSize: '0.85rem' }}
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. Location / Cities */}
      <div className="mb-4">
        <label className="form-label fw-bold text-dark small text-uppercase tracking-wider mb-2">
          Destination City
        </label>
        <div className="d-flex flex-wrap gap-1.5">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 fw-medium ${
              !filters.city || filters.city === 'All'
                ? 'btn-primary'
                : 'btn-light border text-secondary'
            }`}
            onClick={() => handleCitySelect('')}
          >
            All Cities
          </button>
          {POPULAR_CITIES.map((c) => (
            <button
              key={c.name}
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-medium ${
                filters.city?.toLowerCase() === c.name.toLowerCase()
                  ? 'btn-primary'
                  : 'btn-light border text-secondary'
              }`}
              onClick={() => handleCitySelect(c.name)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Price Range */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="form-label fw-bold text-dark small text-uppercase tracking-wider mb-0">
            Max Price / Night
          </label>
          <span className="fw-bold text-primary fs-6">
            ₹{Number(filters.maxPrice || 8000).toLocaleString('en-IN')}
          </span>
        </div>
        <input
          type="range"
          className="form-range"
          min="800"
          max="8000"
          step="100"
          value={filters.maxPrice || 8000}
          onChange={handlePriceChange}
        />
        <div className="d-flex justify-content-between text-muted small">
          <span>₹800</span>
          <span>₹4,000</span>
          <span>₹8,000+</span>
        </div>
      </div>

      {/* 3. Rating Filter */}
      <div className="mb-4">
        <label className="form-label fw-bold text-dark small text-uppercase tracking-wider mb-2">
          Minimum Rating
        </label>
        <div className="d-flex flex-column gap-2">
          {[
            { label: '4.5 & Above (Superb)', val: '4.5' },
            { label: '4.0 & Above (Very Good)', val: '4.0' },
            { label: '3.5 & Above (Good)', val: '3.5' },
          ].map((item) => (
            <label
              key={item.val}
              className={`d-flex align-items-center justify-content-between p-2 rounded-3 border cursor-pointer ${
                filters.rating === item.val
                  ? 'bg-primary-subtle border-primary text-primary fw-semibold'
                  : 'bg-light text-secondary'
              }`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleRatingSelect(item.val)}
            >
              <div className="d-flex align-items-center gap-2">
                <Star size={15} className="fill-warning text-warning" />
                <span style={{ fontSize: '0.88rem' }}>{item.label}</span>
              </div>
              <input
                type="radio"
                name="ratingFilter"
                checked={filters.rating === item.val}
                onChange={() => {}}
                className="form-check-input ms-2"
              />
            </label>
          ))}
        </div>
      </div>

      {/* 4. Amenities Checklist */}
      <div className="mb-2">
        <label className="form-label fw-bold text-dark small text-uppercase tracking-wider mb-2">
          Amenities
        </label>
        <div className="row g-2">
          {AMENITIES_LIST.map((amenity) => {
            const isChecked = currentAmenitiesList.includes(amenity);
            return (
              <div className="col-6" key={amenity}>
                <button
                  type="button"
                  className={`btn btn-sm w-100 text-start d-flex align-items-center gap-1.5 p-2 rounded-3 border text-truncate ${
                    isChecked
                      ? 'bg-primary-subtle border-primary text-primary fw-semibold'
                      : 'bg-light text-secondary'
                  }`}
                  style={{ fontSize: '0.82rem' }}
                  onClick={() => handleAmenityToggle(amenity)}
                >
                  <div
                    className={`rounded-1 d-flex align-items-center justify-content-center border ${
                      isChecked ? 'bg-primary text-white border-primary' : 'bg-white'
                    }`}
                    style={{ width: '16px', height: '16px', flexShrink: 0 }}
                  >
                    {isChecked && <Check size={12} strokeWidth={3} />}
                  </div>
                  <span className="text-truncate">{amenity}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
