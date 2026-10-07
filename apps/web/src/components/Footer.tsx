import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">🧠✈️ TripMind AI</div>
          <p className="footer-tagline">
            AI Travel Planning Copilot — Lên kế hoạch chuyến đi thông minh hơn.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Khám phá</h4>
            <Link to="/explore">Điểm đến</Link>
            <Link to="/hotels">Khách sạn</Link>
            <Link to="/explore?cat=restaurant">Ẩm thực</Link>
            <Link to="/transport">Di chuyển</Link>
          </div>
          <div className="footer-col">
            <h4>TripMind AI</h4>
            <Link to="/">Về chúng tôi</Link>
            <Link to="/">Cách hoạt động</Link>
            <Link to="/">FAQ</Link>
            <Link to="/trips/create">Tạo lịch trình</Link>
          </div>
          <div className="footer-col">
            <h4>Hỗ trợ</h4>
            <Link to="/">Liên hệ</Link>
            <Link to="/">Điều khoản</Link>
            <Link to="/">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 TripMind AI · Hồ Ngọc Thảo Vy · AI Product Development</span>
        <div className="social-links">
          <a href="#" aria-label="Facebook">📘</a>
          <a href="#" aria-label="Instagram">📸</a>
          <a href="#" aria-label="TikTok">🎵</a>
        </div>
      </div>
    </footer>
  );
}
