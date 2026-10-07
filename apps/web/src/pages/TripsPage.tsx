import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TripCard } from '../components/Cards';
import type { TripStatus } from '../types';

export default function TripsPage() {
  const navigate = useNavigate();
  const { savedTrips, deleteTrip, addNotification } = useApp();
  const [filterStatus, setFilterStatus] = useState<TripStatus | 'all'>('all');

  const filteredTrips = savedTrips.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  function handleDelete(id: string) {
    if (window.confirm('Bạn có chắc muốn xóa chuyến đi này không?')) {
      deleteTrip(id);
      addNotification('Đã xóa chuyến đi.', 'info');
    }
  }

  return (
    <div className="trips-page">
      <section className="page-header-banner trips-header">
        <div className="banner-content">
          <span className="badge-pill">Hành trình của tôi 🗺️</span>
          <h1>Quản lý chuyến đi của bạn</h1>
          <p>Xem lại lịch trình đã tạo, cập nhật hoạt động và chuẩn bị hành lý cho chuyến đi sắp tới</p>
        </div>
      </section>

      <div className="page-container trips-content">
        <div className="trips-bar">
          <div className="status-tabs">
            {[
              { key: 'all', label: `Tất cả (${savedTrips.length})` },
              { key: 'planning', label: `Đang lên kế hoạch (${savedTrips.filter((t) => t.status === 'planning').length})` },
              { key: 'upcoming', label: `Sắp tới (${savedTrips.filter((t) => t.status === 'upcoming').length})` },
              { key: 'completed', label: `Đã đi (${savedTrips.filter((t) => t.status === 'completed').length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`tab-btn ${filterStatus === tab.key ? 'active' : ''}`}
                onClick={() => setFilterStatus(tab.key as TripStatus | 'all')}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link to="/create-trip" className="btn-primary">
            ➕ Tạo chuyến đi mới
          </Link>
        </div>

        {filteredTrips.length > 0 ? (
          <div className="trips-grid">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onView={(id) => navigate(`/trips/${id}`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="empty-trips-card">
            <div className="empty-icon">🏖️</div>
            <h3>Chưa có chuyến đi nào ở mục này</h3>
            <p>Hãy để AI của TripMind giúp bạn lên một lịch trình hoàn hảo chỉ trong vài giây!</p>
            <Link to="/create-trip" className="btn-primary-large">
              ✨ Tạo chuyến đi đầu tiên ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
