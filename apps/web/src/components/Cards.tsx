import { useNavigate } from 'react-router-dom';
import type { Place } from '../types';
import { useApp } from '../context/AppContext';

interface Props {
  place: Place;
  onAddToTrip?: (place: Place) => void;
}

export function PlaceCard({ place, onAddToTrip }: Props) {
  const { isFavorite, toggleFavorite } = useApp();
  const navigate = useNavigate();
  const fav = isFavorite(place.id);

  const CATEGORY_LABELS: Record<string, string> = {
    attraction: '📍 Địa điểm',
    restaurant: '🍜 Nhà hàng',
    cafe: '☕ Cà phê',
    hotel: '🏨 Khách sạn',
    activity: '🎯 Hoạt động',
    shopping: '🛍 Mua sắm',
  };

  return (
    <div className="place-card" onClick={() => navigate(`/places/${place.id}`)}>
      <div className="card-image-wrap">
        <img
          src={place.image}
          alt={place.name}
          className="card-image"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=70';
          }}
        />
        <button
          className={`fav-btn ${fav ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(place.id); }}
          aria-label="Yêu thích"
        >
          {fav ? '❤️' : '🤍'}
        </button>
        <span className="cat-badge">{CATEGORY_LABELS[place.category] ?? place.category}</span>
      </div>
      <div className="card-body">
        <h3 className="card-title">{place.name}</h3>
        <div className="card-location">📍 {place.location}</div>
        <div className="card-meta">
          <span className="rating">⭐ {place.rating}</span>
          <span className="review-count">({place.reviewCount.toLocaleString()})</span>
          <span className="price-tag">{place.priceLabel ?? `${place.price.toLocaleString('vi-VN')}đ`}</span>
        </div>
        <p className="card-desc">{place.description.slice(0, 80)}…</p>
        {onAddToTrip && (
          <button
            className="btn-add"
            onClick={(e) => { e.stopPropagation(); onAddToTrip(place); }}
          >
            ➕ Thêm vào lịch trình
          </button>
        )}
      </div>
    </div>
  );
}

interface HotelProps {
  hotel: import('../types').Hotel;
  onAddToTrip?: (hotel: import('../types').Hotel) => void;
}

export function HotelCard({ hotel, onAddToTrip }: HotelProps) {
  const { isFavorite, toggleFavorite } = useApp();
  const navigate = useNavigate();
  const fav = isFavorite(hotel.id);

  return (
    <div className="place-card" onClick={() => navigate(`/hotels/${hotel.id}`)}>
      <div className="card-image-wrap">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="card-image"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=70';
          }}
        />
        <button
          className={`fav-btn ${fav ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(hotel.id); }}
          aria-label="Yêu thích"
        >
          {fav ? '❤️' : '🤍'}
        </button>
        <span className="cat-badge">🏨 {hotel.type === 'homestay' ? 'Homestay' : hotel.type === 'villa' ? 'Villa' : hotel.type === 'hostel' ? 'Hostel' : 'Khách sạn'}</span>
      </div>
      <div className="card-body">
        <h3 className="card-title">{hotel.name}</h3>
        <div className="card-location">📍 {hotel.location}</div>
        <div className="card-meta">
          <span className="rating">⭐ {hotel.rating}</span>
          <span className="review-count">({hotel.reviewCount.toLocaleString()})</span>
          <span className="price-tag">{hotel.pricePerNight.toLocaleString('vi-VN')}đ/đêm</span>
        </div>
        <div className="amenities-row">
          {hotel.amenities.slice(0, 3).map((a) => (
            <span key={a} className="amenity-chip">{a}</span>
          ))}
          {hotel.amenities.length > 3 && <span className="amenity-chip">+{hotel.amenities.length - 3}</span>}
        </div>
        {onAddToTrip && (
          <button
            className="btn-add"
            onClick={(e) => { e.stopPropagation(); onAddToTrip(hotel); }}
          >
            ➕ Thêm vào chuyến đi
          </button>
        )}
      </div>
    </div>
  );
}

interface TripCardProps {
  trip: import('../types').Trip;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

export function TripCard({ trip, onDelete, onView }: TripCardProps) {
  const STATUS = {
    planning: { label: 'Đang lên kế hoạch', cls: 'status-planning' },
    upcoming: { label: 'Sắp diễn ra', cls: 'status-upcoming' },
    completed: { label: 'Đã hoàn thành', cls: 'status-done' },
  };
  const st = STATUS[trip.status] ?? STATUS.planning;
  const pct = Math.min(100, Math.round((trip.estimated_cost / trip.budget) * 100));

  return (
    <div className="trip-card">
      <div
        className="trip-card-img"
        style={{
          backgroundImage: `url(${trip.coverImage || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=70'})`,
        }}
      >
        <span className={`status-chip ${st.cls}`}>{st.label}</span>
      </div>
      <div className="trip-card-body">
        <h3>{trip.destination}</h3>
        <div className="trip-meta">
          <span>📅 {trip.days} ngày</span>
          {trip.startDate && <span>🗓 {trip.startDate}</span>}
          <span>💰 {trip.budget.toLocaleString('vi-VN')}đ</span>
        </div>
        <div className="budget-bar-wrap">
          <div className="budget-bar">
            <div
              className={`budget-fill ${pct > 90 ? 'over' : ''}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="budget-pct">{pct}%</span>
        </div>
        <div className="trip-card-actions">
          <button className="btn-sm primary" onClick={() => onView?.(trip.id)}>Xem lịch trình</button>
          {onDelete && (
            <button className="btn-sm danger" onClick={() => onDelete(trip.id)}>Xóa</button>
          )}
        </div>
      </div>
    </div>
  );
}
