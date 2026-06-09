import { useEffect, useState } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { useAuth } from "../../../providers/AuthProvider";
import {
  Calendar, Clock, CheckCircle, AlertCircle,
  TrendingUp, XCircle, User, History, Stethoscope,
  Thermometer, Heart, Activity, List,
} from "lucide-react";
import UserAvatar from "../../../shared/components/UserAvatar";
import UserSidebar from "../../../shared/components/UserSidebar";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const ATTENTION_TYPES = [
  { value: "control", label: "Control" },
  { value: "urgency", label: "Urgencia" },
  { value: "routine", label: "Control Rutinario" },
  { value: "vaccination", label: "Vacunación" },
];

const STATUS_LABELS = { "": "Todas", pending: "Pendientes", confirmed: "Confirmadas", completed: "Historial" };
const STATUS_ICONS = { "": List, pending: AlertCircle, confirmed: Clock, completed: CheckCircle };
const STATUS_COLORS = { "": "#6b7280", pending: "#f59e0b", confirmed: "#3b82f6", completed: "#22c55e" };

export default function NursingDashboard() {
  const {
    appointments, fetchMyAppointments, fetchApprenticeHistory,
    updateAppointment, updateStatus, isLoading,
  } = useAppointments();
  const { profile } = useAuth();
  const [filter, setFilter] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [attentionType, setAttentionType] = useState("control");
  const [vitals, setVitals] = useState({ temperature: "", blood_pressure: "", heart_rate: "", weight: "" });
  const [historyModal, setHistoryModal] = useState(null);
  const [apprenticeHistory, setApprenticeHistory] = useState([]);

  useEffect(() => {
    fetchMyAppointments({ status: filter });
  }, [filter, profile]);

  const handleConfirm = async (id) => {
    await updateStatus(id, "confirmed");
    fetchMyAppointments({ status: filter });
  };

  const handleComplete = async (id) => {
    if (!notes.trim()) return;
    await updateAppointment(id, {
      status: "completed",
      notes,
      attention_type: attentionType,
      temperature: vitals.temperature || null,
      blood_pressure: vitals.blood_pressure || null,
      heart_rate: vitals.heart_rate || null,
      weight: vitals.weight || null,
    });
    setNotes("");
    setVitals({ temperature: "", blood_pressure: "", heart_rate: "", weight: "" });
    setAttentionType("control");
    fetchMyAppointments({ status: filter });
  };

  const handleShow = async (id) => {
    await updateStatus(id, "no_show");
    fetchMyAppointments({ status: filter });
  };

  const openHistory = async (userId) => {
    const history = await fetchApprenticeHistory(userId, profile.dependency_id);
    setApprenticeHistory(history);
    setHistoryModal(userId);
  };

  const stats = {
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };
  const total = appointments.length;
  const completionRate = total > 0 ? Math.round((stats.completed / total) * 100) : 0;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>{profile?.dependencies?.name || "Enfermería"}</h1>
          <p>{profile?.full_name || "Profesional"} — Panel de atención de enfermería</p>
        </div>
        <div className="header-actions">
          <UserAvatar name={profile?.full_name} onClick={() => setSidebarOpen(true)} />
        </div>
      </header>

      <section className="prof-stats-grid">
        <div className="prof-stat-card" style={{ borderLeftColor: "#f59e0b" }}>
          <div className="stat-label"><AlertCircle size={16} /> Pendientes</div>
          <div className="stat-value" style={{ color: "#f59e0b" }}>{stats.pending}</div>
        </div>
        <div className="prof-stat-card" style={{ borderLeftColor: "#3b82f6" }}>
          <div className="stat-label"><Clock size={16} /> Confirmadas</div>
          <div className="stat-value" style={{ color: "#3b82f6" }}>{stats.confirmed}</div>
        </div>
        <div className="prof-stat-card" style={{ borderLeftColor: "#22c55e" }}>
          <div className="stat-label"><CheckCircle size={16} /> Completadas</div>
          <div className="stat-value" style={{ color: "#22c55e" }}>{stats.completed}</div>
        </div>
        <div className="prof-stat-card" style={{ borderLeftColor: "#8b5cf6" }}>
          <div className="stat-label"><TrendingUp size={16} /> Cumplimiento</div>
          <div className="stat-value" style={{ color: "#8b5cf6" }}>{completionRate}%</div>
        </div>
      </section>

      <nav className="prof-filter-tabs">
        {["", "pending", "confirmed", "completed"].map((status) => {
          const Icon = STATUS_ICONS[status];
          return (
            <button key={status} className={filter === status ? "active" : ""} onClick={() => setFilter(status)}>
              <Icon size={14} />{STATUS_LABELS[status]}
              <span className="badge-count" style={{ background: filter === status ? "#fff" : STATUS_COLORS[status], color: filter === status ? STATUS_COLORS[status] : "#fff" }}>{status === "" ? appointments.length : stats[status]}</span>
            </button>
          );
        })}
      </nav>

      <div className="appointments-grid">
        {isLoading && appointments.length === 0 ? (
          <div className="loading-screen"><Calendar size={24} /><p>Cargando citas...</p></div>
        ) : appointments.length === 0 ? (
          <div className="empty-state"><Calendar size={48} /><p>No hay citas registradas</p></div>
        ) : (
          appointments.map((apt) => (
            <div key={apt.id} className="appointment-card" style={{ borderLeft: `4px solid ${apt.dependencies?.color || "#ccc"}`, marginBottom: "1rem" }}>
              <div className="card-header">
                <div className="dependency-badge" style={{ background: apt.dependencies?.color }}>{apt.dependencies?.name}</div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  {apt.attention_type && (
                    <span className="attention-badge"><Stethoscope size={12} /> {ATTENTION_TYPES.find(t => t.value === apt.attention_type)?.label}</span>
                  )}
                  <span className="status-badge" style={{ color: STATUS_COLORS[apt.status] }}>
                    {apt.status === "pending" && <AlertCircle size={16} />}
                    {apt.status === "confirmed" && <Clock size={16} />}
                    {apt.status === "completed" && <CheckCircle size={16} />}
                    <span>{apt.status}</span>
                  </span>
                </div>
              </div>

              {apt.profiles?.full_name && (
                <div className="aprendiz-info" style={{ marginBottom: "0.5rem" }}>
                  <User size={14} />
                  <span style={{ fontWeight: 600 }}>{apt.profiles.full_name}</span>
                  {apt.profiles.document_number && <span style={{ color: "#9ca3af" }}>— Doc: {apt.profiles.document_number}</span>}
                </div>
              )}

              <div className="card-datetime" style={{ marginBottom: "0.5rem" }}>
                <div className="datetime-item"><Calendar size={16} /><span>{format(parseISO(apt.scheduled_date), "PPP", { locale: es })}</span></div>
                <div className="datetime-item"><Clock size={16} /><span>{apt.scheduled_time}</span></div>
              </div>

              <div className="card-body"><p className="reason" style={{ margin: 0 }}>{apt.reason || "Sin motivo registrado"}</p></div>

              {apt.notes && (
                <div style={{ marginTop: "0.5rem", padding: "0.5rem 0.75rem", background: "#f9fafb", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", color: "#6b7280" }}>
                  <strong>Notas:</strong> {apt.notes}
                </div>
              )}

              {apt.profiles?.full_name && (
                <div style={{ marginTop: "0.5rem" }}>
                  <button onClick={(e) => { e.stopPropagation(); openHistory(apt.user_id); }} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: "999px", padding: "0.25rem 0.75rem", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem", color: "#6b7280" }}>
                    <History size={12} /> Ver historial de {apt.profiles.full_name}
                  </button>
                </div>
              )}

              {filter === "pending" && (
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #f3f4f6" }}>
                  <button onClick={() => handleConfirm(apt.id)} className="btn-success" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}><CheckCircle size={16} /> Confirmar</button>
                  <button onClick={() => handleShow(apt.id)} className="btn-secondary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}><XCircle size={16} /> No Asistió</button>
                </div>
              )}

              {filter === "confirmed" && (
                <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #f3f4f6" }}>
                  <div className="field" style={{ marginBottom: "0.5rem" }}>
                    <label><Stethoscope size={12} /> Tipo de Atención</label>
                    <select value={attentionType} onChange={(e) => setAttentionType(e.target.value)}>
                      {ATTENTION_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <div className="field"><label><Thermometer size={12} /> Temp (°C)</label><input type="text" placeholder="36.5" value={vitals.temperature} onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })} /></div>
                    <div className="field"><label><Activity size={12} /> Presión Arterial</label><input type="text" placeholder="120/80" value={vitals.blood_pressure} onChange={(e) => setVitals({ ...vitals, blood_pressure: e.target.value })} /></div>
                    <div className="field"><label><Heart size={12} /> Frec. Cardíaca</label><input type="text" placeholder="72 lpm" value={vitals.heart_rate} onChange={(e) => setVitals({ ...vitals, heart_rate: e.target.value })} /></div>
                    <div className="field"><label>Peso (kg)</label><input type="text" placeholder="70" value={vitals.weight} onChange={(e) => setVitals({ ...vitals, weight: e.target.value })} /></div>
                  </div>
                  <textarea placeholder="Observaciones de enfermería (obligatorio)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", fontFamily: "inherit", resize: "vertical", marginBottom: "0.5rem" }} />
                  <button onClick={() => handleComplete(apt.id)} className="btn-primary" disabled={!notes.trim()} style={{ width: "100%", opacity: notes.trim() ? 1 : 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}><CheckCircle size={16} /> Completar Atención</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {historyModal && (
        <div className="history-modal-overlay" onClick={() => setHistoryModal(null)}>
          <div className="history-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2><History size={20} /> Historial de Atención</h2>
            {apprenticeHistory.length > 0 ? (
              <>
                <div className="apprentice-info-card">
                  <div className="avatar">{apprenticeHistory[0].profiles?.full_name?.charAt(0) || "?"}</div>
                  <div className="info">
                    <div className="name">{apprenticeHistory[0].profiles?.full_name || "Sin nombre"}</div>
                    <div className="doc">Doc: {apprenticeHistory[0].profiles?.document_number || "-"}</div>
                  </div>
                </div>
                <div className="history-timeline">
                  {apprenticeHistory.map((apt) => (
                    <div key={apt.id} className={`history-item ${apt.status}`}>
                      <div className="history-item-content">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span className="date">{format(parseISO(apt.scheduled_date), "PPP", { locale: es })} - {apt.scheduled_time}</span>
                          <span className="dep-badge-inline" style={{ background: apt.dependencies?.color || "#ccc", fontSize: "0.65rem" }}>{apt.dependencies?.name || "-"}</span>
                        </div>
                        <div className="reason">{apt.reason || "Sin motivo registrado"}</div>
                        {apt.notes && <div style={{ marginTop: "0.25rem", fontStyle: "italic", color: "#6b7280" }}>Notas: {apt.notes}</div>}
                        {(apt.temperature || apt.blood_pressure || apt.heart_rate || apt.weight) && (
                          <div style={{ marginTop: "0.25rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            {apt.temperature && <span className="vitals-badge"><Thermometer size={10} /> {apt.temperature}°C</span>}
                            {apt.blood_pressure && <span className="vitals-badge"><Activity size={10} /> {apt.blood_pressure}</span>}
                            {apt.heart_rate && <span className="vitals-badge"><Heart size={10} /> {apt.heart_rate} lpm</span>}
                            {apt.weight && <span className="vitals-badge">Peso: {apt.weight} kg</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : <div className="empty-state"><p>Este aprendiz no tiene citas registradas.</p></div>}
            <button className="btn-secondary" onClick={() => setHistoryModal(null)} style={{ marginTop: "1rem", width: "100%" }}>Cerrar</button>
          </div>
        </div>
      )}

      <UserSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        appointments={appointments}
      />
    </div>
  );
}
