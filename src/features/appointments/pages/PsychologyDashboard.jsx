import { useEffect, useState } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { useAuth } from "../../../providers/AuthProvider";
import {
  Calendar, Clock, CheckCircle, AlertCircle,
  TrendingUp, XCircle, User, History, ShieldAlert, AlertTriangle, List,
} from "lucide-react";
import UserAvatar from "../../../shared/components/UserAvatar";
import UserSidebar from "../../../shared/components/UserSidebar";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const RISK_LEVELS = [
  { value: "low", label: "Bajo", color: "#22c55e" },
  { value: "medium", label: "Medio", color: "#f59e0b" },
  { value: "high", label: "Alto", color: "#f97316" },
  { value: "critical", label: "Crítico", color: "#ef4444" },
];

const URGENCY_LEVELS = [
  { value: "low", label: "Baja" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
];

const STATUS_LABELS = { "": "Todas", pending: "Pendientes", confirmed: "Confirmadas", completed: "Historial" };
const STATUS_ICONS = { "": List, pending: AlertCircle, confirmed: Clock, completed: CheckCircle };
const STATUS_COLORS = { "": "#6b7280", pending: "#f59e0b", confirmed: "#3b82f6", completed: "#22c55e" };

export default function PsychologyDashboard() {
  const {
    appointments, fetchMyAppointments, fetchApprenticeHistory,
    updateAppointment, updateStatus, isLoading,
  } = useAppointments();
  const { profile } = useAuth();
  const [filter, setFilter] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [riskLevel, setRiskLevel] = useState("medium");
  const [urgency, setUrgency] = useState("normal");
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
    await updateAppointment(id, { status: "completed", notes, risk_level: riskLevel, urgency });
    setNotes("");
    setRiskLevel("medium");
    setUrgency("normal");
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
          <h1>{profile?.dependencies?.name || "Psicología"}</h1>
          <p>{profile?.full_name || "Profesional"} — Panel de atención psicológica</p>
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
              <Icon size={14} />
              {STATUS_LABELS[status]}
              <span className="badge-count" style={{
                background: filter === status ? "#fff" : STATUS_COLORS[status],
                color: filter === status ? STATUS_COLORS[status] : "#fff",
              }}>{status === "" ? appointments.length : stats[status]}</span>
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
              {/* Header: badges + estado */}
              <div className="card-header">
                <div className="dependency-badge" style={{ background: apt.dependencies?.color }}>{apt.dependencies?.name}</div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  {apt.risk_level && (
                    <span className={`risk-badge risk-${apt.risk_level}`}>
                      <ShieldAlert size={12} /> Riesgo: {RISK_LEVELS.find(r => r.value === apt.risk_level)?.label}
                    </span>
                  )}
                  {apt.urgency && (
                    <span className={`urgency-badge urgency-${apt.urgency}`}>
                      <AlertTriangle size={12} /> {URGENCY_LEVELS.find(u => u.value === apt.urgency)?.label}
                    </span>
                  )}
                  <span className="status-badge" style={{ color: STATUS_COLORS[apt.status] }}>
                    {apt.status === "pending" && <AlertCircle size={16} />}
                    {apt.status === "confirmed" && <Clock size={16} />}
                    {apt.status === "completed" && <CheckCircle size={16} />}
                    <span>{apt.status}</span>
                  </span>
                </div>
              </div>

              {/* Info del aprendiz */}
              {apt.profiles?.full_name && (
                <div className="aprendiz-info" style={{ marginBottom: "0.5rem" }}>
                  <User size={14} />
                  <span style={{ fontWeight: 600 }}>{apt.profiles.full_name}</span>
                  {apt.profiles.document_number && (
                    <span style={{ color: "#9ca3af" }}>— Doc: {apt.profiles.document_number}</span>
                  )}
                </div>
              )}

              {/* Fecha y hora */}
              <div className="card-datetime" style={{ marginBottom: "0.5rem" }}>
                <div className="datetime-item">
                  <Calendar size={16} />
                  <span>{format(parseISO(apt.scheduled_date), "PPP", { locale: es })}</span>
                </div>
                <div className="datetime-item">
                  <Clock size={16} />
                  <span>{apt.scheduled_time}</span>
                </div>
              </div>

              {/* Motivo */}
              <div className="card-body">
                <p className="reason" style={{ margin: 0 }}>{apt.reason || "Sin motivo registrado"}</p>
              </div>

              {/* Notas (si existen) */}
              {apt.notes && (
                <div style={{ marginTop: "0.5rem", padding: "0.5rem 0.75rem", background: "#f9fafb", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", color: "#6b7280" }}>
                  <strong>Notas:</strong> {apt.notes}
                </div>
              )}

              {/* Botón historial */}
              {apt.profiles?.full_name && (
                <div style={{ marginTop: "0.5rem" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); openHistory(apt.user_id); }}
                    style={{
                      background: "none", border: "1px solid #e5e7eb", borderRadius: "999px",
                      padding: "0.25rem 0.75rem", fontSize: "0.75rem", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "0.35rem", color: "#6b7280",
                    }}
                  >
                    <History size={12} /> Ver historial de {apt.profiles.full_name}
                  </button>
                </div>
              )}

              {/* Acciones por estado */}
              {filter === "pending" && (
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #f3f4f6" }}>
                  <button onClick={() => handleConfirm(apt.id)} className="btn-success" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}>
                    <CheckCircle size={16} /> Confirmar
                  </button>
                  <button onClick={() => handleShow(apt.id)} className="btn-secondary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}>
                    <XCircle size={16} /> No Asistió
                  </button>
                </div>
              )}

              {filter === "confirmed" && (
                <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #f3f4f6" }}>
                  <textarea
                    placeholder="Notas de la sesión (obligatorio para completar)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", fontFamily: "inherit", resize: "vertical", marginBottom: "0.5rem" }}
                  />
                  <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <div className="field" style={{ flex: 1 }}>
                      <label>Nivel de Riesgo</label>
                      <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
                        {RISK_LEVELS.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
                      </select>
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label>Urgencia</label>
                      <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                        {URGENCY_LEVELS.map((u) => (<option key={u.value} value={u.value}>{u.label}</option>))}
                      </select>
                    </div>
                  </div>
                  <button onClick={() => handleComplete(apt.id)} className="btn-primary" disabled={!notes.trim()} style={{ width: "100%", opacity: notes.trim() ? 1 : 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}>
                    <CheckCircle size={16} /> Completar Sesión
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal historial */}
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
                        {apt.risk_level && <span className={`risk-badge risk-${apt.risk_level}`} style={{ marginTop: "0.25rem" }}>Riesgo: {RISK_LEVELS.find(r => r.value === apt.risk_level)?.label}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state"><p>Este aprendiz no tiene citas registradas.</p></div>
            )}
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
