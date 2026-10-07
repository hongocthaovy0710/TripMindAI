import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const { unreadCount, notifications, markAllRead } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleLogout() {
    logout();
    setDropOpen(false);
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🧠✈️</span>
          <span className="logo-text">TripMind AI</span>
        </Link>

        {/* Desktop Nav Links */}
        {isLoggedIn && (
          <div className="navbar-links">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Trang chủ</NavLink>
            <NavLink to="/explore" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Khám phá</NavLink>
            <NavLink to="/trips" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Chuyến đi</NavLink>
            <NavLink to="/hotels" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Khách sạn</NavLink>
            <NavLink to="/favorites" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Yêu thích</NavLink>
          </div>
        )}

        {/* Right side */}
        <div className="navbar-right">
          {isLoggedIn ? (
            <>
              {/* Notifications */}
              <div className="notif-wrap" ref={notifRef}>
                <button
                  className="icon-btn"
                  onClick={() => { setNotifOpen((o) => !o); if (!notifOpen) markAllRead(); }}
                  aria-label="Thông báo"
                >
                  🔔
                  {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                </button>
                {notifOpen && (
                  <div className="dropdown notif-dropdown">
                    <div className="dropdown-header">Thông báo</div>
                    {notifications.length === 0 ? (
                      <div className="dropdown-empty">Chưa có thông báo</div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div key={n.id} className={`notif-item ${n.type}`}>
                          <span className="notif-icon">
                            {n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : 'ℹ️'}
                          </span>
                          <span>{n.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* User avatar dropdown */}
              <div className="avatar-wrap" ref={dropRef}>
                <button className="avatar-btn" onClick={() => setDropOpen((o) => !o)}>
                  <div className="avatar">{(user?.name?.[0] || 'U').toUpperCase()}</div>
                  <span className="avatar-name">{user?.name}</span>
                  <span className="chevron">▾</span>
                </button>
                {dropOpen && (
                  <div className="dropdown user-dropdown">
                    <Link to="/profile" className="dropdown-item" onClick={() => setDropOpen(false)}>
                      👤 Hồ sơ
                    </Link>
                    <Link to="/trips" className="dropdown-item" onClick={() => setDropOpen(false)}>
                      🗺️ Chuyến đi của tôi
                    </Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      🚪 Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn-ghost">Đăng nhập</Link>
              <Link to="/register" className="btn-primary-sm">Đăng ký</Link>
            </div>
          )}

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {isLoggedIn ? (
            <>
              <NavLink to="/" end className="mobile-link" onClick={() => setMenuOpen(false)}>🏠 Trang chủ</NavLink>
              <NavLink to="/explore" className="mobile-link" onClick={() => setMenuOpen(false)}>🔍 Khám phá</NavLink>
              <NavLink to="/trips" className="mobile-link" onClick={() => setMenuOpen(false)}>🗺️ Chuyến đi</NavLink>
              <NavLink to="/hotels" className="mobile-link" onClick={() => setMenuOpen(false)}>🏨 Khách sạn</NavLink>
              <NavLink to="/favorites" className="mobile-link" onClick={() => setMenuOpen(false)}>❤️ Yêu thích</NavLink>
              <NavLink to="/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>👤 Hồ sơ</NavLink>
              <button className="mobile-link danger" onClick={handleLogout}>🚪 Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
              <Link to="/register" className="mobile-link" onClick={() => setMenuOpen(false)}>Đăng ký</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
