import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res =
        mode === 'register'
          ? await api.register(email, password, name)
          : await api.login(email, password);
      login(res.token, email, name || undefined);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-hero-text">
          <Link to="/" className="auth-logo">🧠✈️ TripMind AI</Link>
          <h1>Lên kế hoạch du lịch<br />thông minh hơn với AI</h1>
          <p>Tạo lịch trình cá nhân hóa, tối ưu chi phí chỉ trong vài phút.</p>
          <div className="auth-features">
            <div className="auth-feature">✨ AI tạo lịch trình tức thì</div>
            <div className="auth-feature">💰 Tối ưu ngân sách tự động</div>
            <div className="auth-feature">📍 Khám phá hàng trăm địa điểm</div>
            <div className="auth-feature">🗺️ Quản lý nhiều chuyến đi</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={mode === 'login' ? 'auth-tab active' : 'auth-tab'}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Đăng nhập
            </button>
            <button
              className={mode === 'register' ? 'auth-tab active' : 'auth-tab'}
              onClick={() => { setMode('register'); setError(''); }}
            >
              Đăng ký
            </button>
          </div>

          <form onSubmit={submit} className="auth-form">
            {mode === 'register' && (
              <div className="form-group">
                <label>Tên của bạn</label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu {mode === 'register' && <span className="hint">(tối thiểu 8 ký tự)</span>}</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                minLength={mode === 'register' ? 8 : undefined}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="form-error">⚠️ {error}</div>}

            <button type="submit" className="btn-auth" disabled={busy}>
              {busy ? 'Đang xử lý...' : mode === 'register' ? '🚀 Tạo tài khoản' : '→ Đăng nhập'}
            </button>
          </form>

          <p className="auth-switch">
            {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
              {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
