import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
  const { user, logout, updateName } = useAuth();
  const { savedTrips, favorites, addNotification } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || 'Nhà Thám Hiểm');
  const [editing, setEditing] = useState(false);
  const [stylePrefs, setStylePrefs] = useState<string[]>(['chill', 'food']);

  function handleSaveName(e: FormEvent) {
    e.preventDefault();
    updateName(name);
    setEditing(false);
    addNotification('Đã cập nhật thông tin thành công!', 'success');
  }

  function handleLogout() {
    logout();
    addNotification('Đã đăng xuất khỏi tài khoản.', 'info');
    navigate('/');
  }

  return (
    <div className="profile-page">
      <section className="page-header-banner profile-header">
        <div className="banner-content">
          <span className="badge-pill">Hồ sơ cá nhân 👤</span>
          <h1>Chào mừng trở lại, {user?.name || 'Bạn'}!</h1>
          <p>Quản lý tài khoản, lịch sử chuyến đi và cá nhân hóa trải nghiệm cùng TripMind AI</p>
        </div>
      </section>

      <div className="page-container profile-layout">
        {/* Left card: User summary */}
        <div className="profile-card user-summary-card">
          <div className="avatar-large">
            {user?.name ? user.name[0].toUpperCase() : '👤'}
          </div>
          {editing ? (
            <form onSubmit={handleSaveName} className="edit-name-form">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="edit-actions">
                <button type="submit" className="btn-sm primary">Lưu</button>
                <button type="button" className="btn-sm" onClick={() => setEditing(false)}>Hủy</button>
              </div>
            </form>
          ) : (
            <>
              <h2>{user?.name || 'Người dùng TripMind'}</h2>
              <p className="user-email">{user?.email || 'user@tripmind.ai'}</p>
              <button className="btn-text-sm" onClick={() => setEditing(true)}>
                ✏️ Chỉnh sửa tên
              </button>
            </>
          )}

          <div className="profile-stats-grid">
            <div className="p-stat">
              <span className="p-num">{savedTrips.length}</span>
              <span className="p-lbl">Chuyến đi</span>
            </div>
            <div className="p-stat">
              <span className="p-num">{favorites.length}</span>
              <span className="p-lbl">Đã lưu</span>
            </div>
            <div className="p-stat">
              <span className="p-num">{Math.min(10, Math.max(1, savedTrips.length * 2))}</span>
              <span className="p-lbl">Tỉnh thành</span>
            </div>
          </div>

          <div className="profile-actions-bottom">
            <button className="btn-secondary full-width" onClick={() => navigate('/trips')}>
              Xem tất cả chuyến đi
            </button>
            <button className="btn-danger-outline full-width" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Right card: Travel Persona & Preferences */}
        <div className="profile-card travel-preferences-card">
          <h3>Gu du lịch của bạn 🎒</h3>
          <p className="sub-desc">TripMind AI sẽ ưu tiên gợi ý các địa điểm theo đúng sở thích của bạn:</p>

          <div className="prefs-options-list">
            {[
              { id: 'chill', label: '🏖️ Thư giãn & Nghỉ dưỡng chill' },
              { id: 'food', label: '🍜 Trải nghiệm ẩm thực địa phương' },
              { id: 'nature', label: '🌲 Khám phá thiên nhiên & Núi rừng' },
              { id: 'culture', label: '🏛️ Di tích lịch sử & Văn hóa' },
              { id: 'photography', label: '📸 Sống ảo & Check-in view đẹp' },
              { id: 'adventure', label: '🧗 Phiêu lưu mạo hiểm & Trekking' },
            ].map((item) => (
              <label key={item.id} className="pref-checkbox-item">
                <input
                  type="checkbox"
                  checked={stylePrefs.includes(item.id)}
                  onChange={() => {
                    setStylePrefs((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((i) => i !== item.id)
                        : [...prev, item.id]
                    );
                    addNotification('Đã lưu tùy chọn gu du lịch!', 'info');
                  }}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>

          <hr className="divider" />

          <h3>Thông tin phiên bản</h3>
          <div className="version-info">
            <div className="v-row">
              <span>Hệ thống:</span>
              <strong>TripMind AI v2.0 (Modern Edition)</strong>
            </div>
            <div className="v-row">
              <span>Backend API:</span>
              <span className="badge-online">● Kết nối FastAPI v1</span>
            </div>
            <div className="v-row">
              <span>Mô hình AI:</span>
              <strong>AI Itinerary Engine 🧠</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
