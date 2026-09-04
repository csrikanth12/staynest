import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw, Check, ChevronDown, ChevronUp, X } from 'lucide-react';

/**
 * Reusable Owner Portal Filter Panel Component
 * Features:
 * - Proper vertical scrolling with custom max-height
 * - Sticky Apply and Clear action footer
 * - Full responsive layout (desktop, tablet, mobile)
 * - Safe dropdown rendering without parent overflow clipping
 * - Clear active filters badge & count
 */
const OwnerFilterPanel = ({
  title = 'Filters',
  subtitle,
  children,
  onApply,
  onClear,
  activeCount = 0,
  maxHeight = '420px',
  collapsible = false,
  isOpenDefault = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  return (
    <div className={`owner-filter-card ${className}`}>
      {/* Filter Header */}
      <div className="owner-filter-header">
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center text-primary rounded-3"
            style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary-subtle, #e0e7ff)' }}
          >
            <SlidersHorizontal size={16} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.95rem' }}>
                {title}
              </h6>
              {activeCount > 0 && (
                <span className="badge bg-primary rounded-pill px-2 py-0.5" style={{ fontSize: '0.72rem' }}>
                  {activeCount} active
                </span>
              )}
            </div>
            {subtitle && <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>{subtitle}</p>}
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {activeCount > 0 && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="btn btn-sm text-muted d-flex align-items-center gap-1 p-1 hover-text-danger"
              style={{ fontSize: '0.8rem' }}
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              <span className="d-none d-sm-inline">Reset</span>
            </button>
          )}

          {collapsible && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="btn btn-sm btn-light border p-1.5 rounded-circle text-secondary"
              aria-label="Toggle filter panel"
            >
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Filter Body & Scrollable Area */}
      {(!collapsible || isOpen) && (
        <>
          <div
            className="owner-filter-body"
            style={{ maxHeight, overflowY: 'auto', overflowX: 'hidden' }}
          >
            {children}
          </div>

          {/* Sticky Action Footer */}
          {(onApply || onClear) && (
            <div className="owner-filter-sticky-footer">
              <div className="text-muted small d-none d-sm-block">
                {activeCount > 0 ? (
                  <span><strong>{activeCount}</strong> filter{activeCount > 1 ? 's' : ''} applied</span>
                ) : (
                  <span>Showing all records</span>
                )}
              </div>
              <div className="d-flex align-items-center gap-2 ms-auto w-100 w-sm-auto justify-content-end">
                {onClear && (
                  <button
                    type="button"
                    onClick={onClear}
                    className="btn btn-sm btn-light border text-secondary rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1"
                    style={{ fontSize: '0.82rem' }}
                  >
                    <RotateCcw size={13} />
                    <span>Clear Filters</span>
                  </button>
                )}
                {onApply && (
                  <button
                    type="button"
                    onClick={onApply}
                    className="btn btn-sm btn-stayguard rounded-pill px-3.5 py-1.5 fw-semibold d-flex align-items-center gap-1"
                    style={{ fontSize: '0.82rem' }}
                  >
                    <Check size={14} />
                    <span>Apply Filters</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OwnerFilterPanel;
