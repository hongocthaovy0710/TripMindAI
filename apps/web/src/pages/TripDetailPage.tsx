import { useState, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import type { Activity, TripStatus } from '../types';

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { savedTrips, updateTrip, deleteTrip, addNotification } = useApp();

  const trip = savedTrips.find((t) => t.id === id);

  const [activeDay, setActiveDay] = useState<number>(1);
  const [newActModal, setNewActModal] = useState<number | null>(null);
  const [actName, setActName] = useState('');
  const [actTime, setActTime] = useState('10:00');
  const [actLocation, setActLocation] = useState('');
  const [actCost, setActCost] = useState(100000);
  const [actPriority, setActPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const [checklist, setChecklist] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: '1', text: 'CMND / CCCD / Hộ chiếu gốc', done: true },
    { id: '2', text: 'Vé máy bay / Vé tàu / Xác nhận phòng', done: true },
    { id: '3', text: 'Kem chống nắng & Kính râm', done: false },
    { id: '4', text: 'Sạc điện thoại & Sạc dự phòng', done: false },
    { id: '5', text: 'Thuốc say xe & Thuốc cảm cơ bản', done: false },
    { id: '6', text: 'Tiền mặt & Thẻ ATM', done: true },
  ]);

  if (!trip) {
    return (
      <div className="page-container empty-state-container">
        <h2>Không tìm thấy chuyến đi</h2>
        <p>Chuyến đi này có thể đã bị xóa hoặc không hợp lệ.</p>
        <button className="btn-primary" onClick={() => navigate('/trips')}>
          Quay lại danh sách chuyến đi
        </button>
      </div>
    );
  }

  const costPct = Math.min(100, Math.round((trip.estimated_cost / trip.budget) * 100));

  function handleStatusChange(status: TripStatus) {
    updateTrip({ ...trip!, status });
    addNotification(`Đã chuyển trạng thái sang "${status}"!`, 'info');
  }

  async function handlePriorityChange(dayIdx: number, actIdx: number, newPrio: 'high' | 'medium' | 'low') {
    const updated = { ...trip! };
    const it = [...updated.itinerary];
    const dayObj = { ...it[dayIdx] };
    const acts = [...dayObj.activities];
    const targetAct = acts[actIdx];

    acts[actIdx] = { ...targetAct, priority: newPrio };
    dayObj.activities = acts;
    it[dayIdx] = dayObj;
    updated.itinerary = it;

    updateTrip(updated);

    // Call API if activity has an id
    if (targetAct.id) {
      try {
        await api.updatePriority(targetAct.id, newPrio);
      } catch {
        // silent fallback
      }
    }
  }

  function handleDeleteActivity(dayIdx: number, actIdx: number) {
    const updated = { ...trip! };
    const it = [...updated.itinerary];
    const dayObj = { ...it[dayIdx] };
    const act = dayObj.activities[actIdx];
    dayObj.activities = dayObj.activities.filter((_, idx) => idx !== actIdx);
    it[dayIdx] = dayObj;
    updated.itinerary = it;
    updated.estimated_cost = Math.max(0, updated.estimated_cost - act.cost);

    updateTrip(updated);
    addNotification(`Đã xóa hoạt động "${act.name}"`, 'info');
  }

  function handleAddActivity(e: FormEvent) {
    e.preventDefault();
    if (newActModal === null) return;

    const dayIdx = newActModal - 1;
    const newAct: Activity = {
      id: crypto.randomUUID(),
      name: actName,
      time: actTime,
      location: actLocation || trip!.destination,
      cost: actCost,
      priority: actPriority,
    };

    const updated = { ...trip! };
    const it = [...updated.itinerary];
    const dayObj = { ...it[dayIdx] };
    dayObj.activities = [...dayObj.activities, newAct];
    it[dayIdx] = dayObj;
    updated.itinerary = it;
    updated.estimated_cost += actCost;

    updateTrip(updated);
    addNotification(`Đã thêm hoạt động vào Ngày ${newActModal}!`, 'success');

    setActName('');
    setActCost(100000);
    setNewActModal(null);
  }

  function toggleCheckItem(id: string) {
    setChecklist((prev) =>
      prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
    );
  }

  return (
    <div className="trip-detail-page">
      {/* Hero Banner */}
      <div
        className="trip-detail-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${
            trip.coverImage || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80'
          })`,
        }}
      >
        <div className="page-container hero-inner">
          <div className="hero-top-row">
            <Link to="/trips" className="btn-back">
              ← Tất cả chuyến đi
            </Link>
            <div className="hero-actions">
              <button className="btn-quiet" onClick={() => window.print()}>
                🖨️ In lịch trình
              </button>
              <button
                className="btn-quiet danger"
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn xóa chuyến đi này không?')) {
                    deleteTrip(trip.id);
                    navigate('/trips');
                  }
                }}
              >
                🗑️ Xóa chuyến
              </button>
            </div>
          </div>

          <div className="hero-content">
            <div className="hero-status-row">
              <select
                className="status-dropdown"
                value={trip.status}
                onChange={(e) => handleStatusChange(e.target.value as TripStatus)}
              >
                <option value="planning">📝 Đang lên kế hoạch</option>
                <option value="upcoming">🚀 Sắp diễn ra</option>
                <option value="completed">✅ Đã hoàn thành</option>
              </select>
              {trip.startDate && <span className="trip-dates">🗓 Khởi hành: {trip.startDate}</span>}
            </div>

            <h1>Khám phá {trip.destination}</h1>
            <p className="hero-sub">{trip.days} ngày · {trip.travelers || 2} thành viên · Tối ưu bởi TripMind AI</p>

            {/* Quick stats in hero */}
            <div className="hero-stats-row">
              <div className="stat-box">
                <span className="lbl">Tổng ngân sách</span>
                <span className="val">{trip.budget.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="stat-box">
                <span className="lbl">Chi phí dự tính</span>
                <span className="val">{trip.estimated_cost.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="stat-box">
                <span className="lbl">Tình trạng</span>
                <span className={`val ${costPct > 100 ? 'text-warn' : 'text-ok'}`}>
                  {costPct <= 100 ? '✓ Trong ngân sách' : '⚠️ Vượt ngân sách'} ({costPct}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container trip-detail-body">
        {/* Left: Day Timeline */}
        <div className="timeline-section">
          {/* Day selection tabs */}
          <div className="day-tabs-bar">
            {trip.itinerary.map((d) => (
              <button
                key={d.day}
                className={`day-tab ${activeDay === d.day ? 'active' : ''}`}
                onClick={() => setActiveDay(d.day)}
              >
                Ngày {d.day}
                <span className="count-sub">({d.activities.length} điểm)</span>
              </button>
            ))}
          </div>

          {/* Current day activities */}
          {trip.itinerary
            .filter((d) => d.day === activeDay)
            .map((day) => {
              const dayIdx = trip.itinerary.findIndex((d) => d.day === day.day);
              return (
                <div key={day.day} className="day-timeline-card">
                  <div className="day-header-row">
                    <h2>📅 Lịch trình Ngày {day.day}</h2>
                    <button
                      className="btn-primary-sm"
                      onClick={() => setNewActModal(day.day)}
                    >
                      ➕ Thêm hoạt động
                    </button>
                  </div>

                  <div className="activities-timeline">
                    {day.activities.map((act, actIdx) => (
                      <div key={act.id || actIdx} className="timeline-item">
                        <div className="timeline-time">{act.time || '09:00'}</div>
                        <div className="timeline-marker" />
                        <div className="timeline-content">
                          <div className="content-top">
                            <h4>{act.name}</h4>
                            <div className="priority-control">
                              <select
                                className={`priority-badge prio-${act.priority}`}
                                value={act.priority}
                                onChange={(e) =>
                                  handlePriorityChange(
                                    dayIdx,
                                    actIdx,
                                    e.target.value as 'high' | 'medium' | 'low'
                                  )
                                }
                              >
                                <option value="high">▲ Ưu tiên cao</option>
                                <option value="medium">■ Trung bình</option>
                                <option value="low">▽ Linh hoạt</option>
                              </select>
                              <button
                                className="btn-del"
                                title="Xóa hoạt động này"
                                onClick={() => handleDeleteActivity(dayIdx, actIdx)}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          <div className="content-meta">
                            <span>📍 {act.location}</span>
                            <span className="dot">•</span>
                            <span>💰 {act.cost.toLocaleString('vi-VN')} VNĐ</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Right Sidebar */}
        <div className="trip-sidebar">
          {/* Budget Breakdown */}
          <div className="sidebar-card">
            <h3>Phân bổ chi phí dự tính</h3>
            <div className="budget-bar-large">
              <div
                className={`budget-bar-fill ${costPct > 100 ? 'overflow' : ''}`}
                style={{ width: `${Math.min(costPct, 100)}%` }}
              />
            </div>
            <div className="budget-bar-legend">
              <span>Đã lên kế hoạch: {costPct}%</span>
              <span>
                Còn lại: {Math.max(0, trip.budget - trip.estimated_cost).toLocaleString('vi-VN')}đ
              </span>
            </div>

            <div className="breakdown-items-list">
              <div className="b-item">
                <span>🏨 Lưu trú / Khách sạn (35%)</span>
                <strong>{Math.round(trip.budget * 0.35).toLocaleString('vi-VN')}đ</strong>
              </div>
              <div className="b-item">
                <span>🍜 Ẩm thực & Quán xá (25%)</span>
                <strong>{Math.round(trip.budget * 0.25).toLocaleString('vi-VN')}đ</strong>
              </div>
              <div className="b-item">
                <span>🎯 Vé tham quan & Trải nghiệm (20%)</span>
                <strong>{Math.round(trip.budget * 0.20).toLocaleString('vi-VN')}đ</strong>
              </div>
              <div className="b-item">
                <span>🚗 Di chuyển & Đi lại (15%)</span>
                <strong>{Math.round(trip.budget * 0.15).toLocaleString('vi-VN')}đ</strong>
              </div>
              <div className="b-item">
                <span>🛡️ Dự phòng phát sinh (5%)</span>
                <strong>{Math.round(trip.budget * 0.05).toLocaleString('vi-VN')}đ</strong>
              </div>
            </div>
          </div>

          {/* Packing Checklist */}
          <div className="sidebar-card">
            <div className="checklist-header">
              <h3>Checklist hành lý 🧳</h3>
              <span className="check-progress">
                {checklist.filter((i) => i.done).length}/{checklist.length}
              </span>
            </div>
            <div className="checklist-items">
              {checklist.map((item) => (
                <label key={item.id} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleCheckItem(item.id)}
                  />
                  <span className={item.done ? 'done-text' : ''}>{item.text}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Activity Modal */}
      {newActModal !== null && (
        <div className="modal-overlay" onClick={() => setNewActModal(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm hoạt động vào Ngày {newActModal}</h3>
              <button className="close-btn" onClick={() => setNewActModal(null)}>✕</button>
            </div>
            <form className="modal-form" onSubmit={handleAddActivity}>
              <div className="form-group">
                <label>Tên hoạt động / Địa điểm</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Ăn trưa tại Quán Gốc Bàng, Đi cáp treo Bà Nà..."
                  value={actName}
                  onChange={(e) => setActName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-col">
                  <label>Khung giờ</label>
                  <input
                    type="time"
                    value={actTime}
                    onChange={(e) => setActTime(e.target.value)}
                    required
                  />
                </div>
                <div className="form-col">
                  <label>Chi phí dự kiến (VNĐ)</label>
                  <input
                    type="number"
                    step="10000"
                    value={actCost}
                    onChange={(e) => setActCost(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-col">
                  <label>Vị trí / Địa chỉ</label>
                  <input
                    type="text"
                    placeholder="Địa chỉ cụ thể"
                    value={actLocation}
                    onChange={(e) => setActLocation(e.target.value)}
                  />
                </div>
                <div className="form-col">
                  <label>Mức độ ưu tiên</label>
                  <select
                    value={actPriority}
                    onChange={(e) =>
                      setActPriority(e.target.value as 'high' | 'medium' | 'low')
                    }
                  >
                    <option value="high">Cao ▲</option>
                    <option value="medium">Vừa ■</option>
                    <option value="low">Thấp ▽</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary-large">
                ➕ Thêm vào lịch trình
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
