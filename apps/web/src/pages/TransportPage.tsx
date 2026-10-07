import { useState, type FormEvent } from 'react';
import { transportOptions } from '../data/transport';
import { useApp } from '../context/AppContext';

interface RouteEstimate {
  from: string;
  to: string;
  flightTime: string;
  flightPrice: string;
  trainTime: string;
  trainPrice: string;
  busTime: string;
  busPrice: string;
}

const POPULAR_ROUTES: RouteEstimate[] = [
  {
    from: 'Hà Nội',
    to: 'Đà Nẵng',
    flightTime: '1h20m',
    flightPrice: '850.000đ - 1.800.000đ',
    trainTime: '16h',
    trainPrice: '450.000đ - 950.000đ',
    busTime: '14h',
    busPrice: '350.000đ - 550.000đ',
  },
  {
    from: 'TP. Hồ Chí Minh',
    to: 'Đà Lạt',
    flightTime: '55m',
    flightPrice: '700.000đ - 1.400.000đ',
    trainTime: 'N/A',
    trainPrice: 'N/A',
    busTime: '7h (Xe giường nằm)',
    busPrice: '280.000đ - 450.000đ',
  },
  {
    from: 'Hà Nội',
    to: 'Sa Pa (Lào Cai)',
    flightTime: 'N/A',
    flightPrice: 'N/A',
    trainTime: '8h (Tàu đêm)',
    trainPrice: '380.000đ - 750.000đ',
    busTime: '5h30m (Limousine)',
    busPrice: '250.000đ - 400.000đ',
  },
  {
    from: 'TP. Hồ Chí Minh',
    to: 'Phú Quốc',
    flightTime: '1h',
    flightPrice: '890.000đ - 1.900.000đ',
    trainTime: 'N/A',
    trainPrice: 'N/A',
    busTime: '8h (kèm phà)',
    busPrice: '420.000đ',
  },
];

export default function TransportPage() {
  const [selectedRoute, setSelectedRoute] = useState<RouteEstimate>(POPULAR_ROUTES[0]);
  const [ticketModal, setTicketModal] = useState<string | null>(null);
  const { addNotification } = useApp();

  function handleBookTicket(type: string) {
    setTicketModal(type);
  }

  function confirmBooking(e: FormEvent) {
    e.preventDefault();
    addNotification(`Đặt vé ${ticketModal} thành công tuyến ${selectedRoute.from} → ${selectedRoute.to}!`, 'success');
    setTicketModal(null);
  }

  return (
    <div className="transport-page">
      <section className="page-header-banner transport-header">
        <div className="banner-content">
          <span className="badge-pill">Di chuyển thông minh 🚗✈️</span>
          <h1>Phương tiện di chuyển & Đặt vé</h1>
          <p>So sánh giá vé máy bay, tàu hỏa, xe khách giường nằm và thuê xe tự lái trên khắp Việt Nam</p>
        </div>
      </section>

      <div className="page-container transport-content">
        {/* Route selector & comparison */}
        <div className="route-comparison-card">
          <h2>So sánh tuyến đường phổ biến</h2>
          <div className="route-tabs">
            {POPULAR_ROUTES.map((r, idx) => (
              <button
                key={idx}
                className={`route-tab ${selectedRoute.from === r.from && selectedRoute.to === r.to ? 'active' : ''}`}
                onClick={() => setSelectedRoute(r)}
              >
                {r.from} ➔ {r.to}
              </button>
            ))}
          </div>

          <div className="comparison-cards-grid">
            <div className="comp-card">
              <div className="comp-badge">✈️ Máy bay</div>
              <div className="comp-time">Thời gian: <strong>{selectedRoute.flightTime}</strong></div>
              <div className="comp-price">{selectedRoute.flightPrice}</div>
              <p>Nhanh chóng, tiết kiệm thời gian, nhiều hãng bay</p>
              <button
                className="btn-primary-sm"
                onClick={() => handleBookTicket('Vé Máy Bay')}
                disabled={selectedRoute.flightPrice === 'N/A'}
              >
                {selectedRoute.flightPrice === 'N/A' ? 'Không có chuyến' : 'Tìm vé máy bay'}
              </button>
            </div>

            <div className="comp-card">
              <div className="comp-badge">🚆 Tàu hỏa</div>
              <div className="comp-time">Thời gian: <strong>{selectedRoute.trainTime}</strong></div>
              <div className="comp-price">{selectedRoute.trainPrice}</div>
              <p>Ngắm phong cảnh, an toàn, có toa giường nằm tiện nghi</p>
              <button
                className="btn-primary-sm"
                onClick={() => handleBookTicket('Vé Tàu Hỏa')}
                disabled={selectedRoute.trainPrice === 'N/A'}
              >
                {selectedRoute.trainPrice === 'N/A' ? 'Không có tuyến' : 'Đặt vé tàu hỏa'}
              </button>
            </div>

            <div className="comp-card">
              <div className="comp-badge">🚌 Xe khách / Limousine</div>
              <div className="comp-time">Thời gian: <strong>{selectedRoute.busTime}</strong></div>
              <div className="comp-price">{selectedRoute.busPrice}</div>
              <p>Tiết kiệm nhất, đón trả tận nơi, nhiều khung giờ khởi hành</p>
              <button
                className="btn-primary-sm"
                onClick={() => handleBookTicket('Vé Xe Limousine')}
              >
                Đặt xe khách
              </button>
            </div>
          </div>
        </div>

        {/* All transport types grid */}
        <h2 className="section-title">Các phương tiện di chuyển nội thành & khám phá</h2>
        <div className="transport-grid">
          {transportOptions.map((opt) => (
            <div key={opt.id} className="transport-card">
              <div className="opt-icon">{opt.icon}</div>
              <div className="opt-body">
                <h3>{opt.label}</h3>
                <p className="opt-desc">{opt.description}</p>
                <div className="opt-meta">
                  <span className="price-tag">💰 {opt.estimatedPrice}</span>
                  {opt.duration && <span className="time-tag">⏱ {opt.duration}</span>}
                </div>
                {opt.providers && (
                  <div className="providers-list">
                    <span className="lbl">Đối tác:</span>
                    {opt.providers.map((p) => (
                      <span key={p} className="p-tag">{p}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Modal */}
      {ticketModal && (
        <div className="modal-overlay" onClick={() => setTicketModal(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Đặt {ticketModal}</h3>
              <button className="close-btn" onClick={() => setTicketModal(null)}>✕</button>
            </div>
            <form className="modal-form" onSubmit={confirmBooking}>
              <div className="form-group">
                <label>Hành trình</label>
                <input
                  type="text"
                  value={`${selectedRoute.from} ➔ ${selectedRoute.to}`}
                  readOnly
                  className="input-readonly"
                />
              </div>
              <div className="form-row">
                <div className="form-col">
                  <label>Ngày đi</label>
                  <input type="date" defaultValue="2026-10-20" required />
                </div>
                <div className="form-col">
                  <label>Số hành khách</label>
                  <select defaultValue="1">
                    <option value="1">1 người</option>
                    <option value="2">2 người</option>
                    <option value="4">4 người</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Số điện thoại nhận vé</label>
                <input type="tel" placeholder="0912 345 678" required />
              </div>
              <button type="submit" className="btn-primary-large">
                Xác nhận đặt vé 🎟️
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
