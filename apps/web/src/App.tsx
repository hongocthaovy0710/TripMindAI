import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ExplorePage from './pages/ExplorePage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import HotelsPage from './pages/HotelsPage';
import HotelDetailPage from './pages/HotelDetailPage';
import RestaurantsPage from './pages/RestaurantsPage';
import TransportPage from './pages/TransportPage';
import CreateTripPage from './pages/CreateTripPage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';

function ToastContainer() {
  const { notifications } = useApp();
  const latest = notifications.slice(0, 3);

  if (latest.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {latest.map((n) => (
        <div key={n.id} className={`toast-item toast-${n.type}`}>
          <span className="toast-icon">
            {n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <span className="toast-msg">{n.message}</span>
        </div>
      ))}
    </div>
  );
}

function MainLayout() {
  return (
    <div className="site-wrapper">
      <Navbar />
      <ToastContainer />
      <main className="site-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/places/:id" element={<PlaceDetailPage />} />
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/hotels/:id" element={<HotelDetailPage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/transport" element={<TransportPage />} />
          <Route path="/create-trip" element={<CreateTripPage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/:id" element={<TripDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
