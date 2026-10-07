import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { places } from '../data/places';
import { hotels } from '../data/hotels';
import { PlaceCard, HotelCard } from '../components/Cards';

export default function FavoritesPage() {
  const { favorites } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'places' | 'hotels'>('all');

  const favPlaces = places.filter((p) => favorites.includes(p.id));
  const favHotels = hotels.filter((h) => favorites.includes(h.id));

  return (
    <div className="favorites-page">
      <section className="page-header-banner favorites-header">
        <div className="banner-content">
          <span className="badge-pill">Danh sách yêu thích ❤️</span>
          <h1>Địa điểm & Khách sạn bạn đã lưu</h1>
          <p>Tập hợp những điểm đến ấn tượng để dễ dàng thêm vào lịch trình bất cứ khi nào</p>
        </div>
      </section>

      <div className="page-container favorites-content">
        <div className="favorites-filter-tabs">
          {[
            { key: 'all', label: `Tất cả (${favPlaces.length + favHotels.length})` },
            { key: 'places', label: `Địa điểm & Quán ăn (${favPlaces.length})` },
            { key: 'hotels', label: `Khách sạn (${favHotels.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`fav-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key as 'all' | 'places' | 'hotels')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {favPlaces.length === 0 && favHotels.length === 0 ? (
          <div className="empty-fav-card">
            <div className="empty-icon">🤍</div>
            <h3>Bạn chưa lưu địa điểm nào</h3>
            <p>Nhấn vào biểu tượng trái tim ở bất kỳ địa điểm hoặc khách sạn nào để lưu lại tại đây.</p>
            <div className="empty-actions">
              <Link to="/explore" className="btn-primary">
                Khám phá địa điểm 📍
              </Link>
              <Link to="/hotels" className="btn-secondary">
                Xem khách sạn 🏨
              </Link>
            </div>
          </div>
        ) : (
          <div className="favorites-grid">
            {(activeTab === 'all' || activeTab === 'places') &&
              favPlaces.map((place) => <PlaceCard key={place.id} place={place} />)}
            {(activeTab === 'all' || activeTab === 'hotels') &&
              favHotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)}
          </div>
        )}
      </div>
    </div>
  );
}
