import { useEffect, useState } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentCard } from "../components/AppointmentCard";
import { useAuth } from "../../../providers/AuthProvider";
import {
  Calendar, Clock, CheckCircle, AlertCircle, LogOut,
  TrendingUp, XCircle, FileText,
  ChevronDown, ChevronUp,
} from "lucide-react";

export function ProfessionalDashboard() {
  const {
    appointments, fetchAppointments, fetchAppointmentsSilent,
    updateStatus, isLoading,
  } = useAppointments();
  const { profile, signOut } = useAuth();
  const [filter, setFilter] = useState("pending");
  const [notes, setNotes] = useState("");
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    fetchAppointmentsSilent({ status: filter });
  }, [filter, fetchAppointmentsSilent]);

  const handleConfirm = (id) => updateStatus(id, "confirmed");
  const handleComplete = (id) => {
    updateStatus(id, "completed", notes || "Atención completada");
    setNotes("");
  };
  const handleShow = (id) => updateStatus(id, "no_show");

  const statusLabels = {
    pending: "Pendientes",
    confirmed: "Confirmadas",
    completed: "Historial",
  };

  const statusIcons = {
    pending: AlertCircle,
    confirmed: Clock,
    completed: CheckCircle,
  };

  const statusColors = {
    pending: "#f59e0b",
    confirmed: "#3b82f6",
    completed: "#22c55e",
  };

  const depName = profile?.dependencies?.name || "Mi Dependencia";
  const profName = profile?.full_name || "Profesional";

  const stats = {
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };

  const allAppointments = appointments;
  const totalByDep = allAppointments.length;
  const completionRate = totalByDep > 0
    ? Math.round((allAppointments.filter((a) => a.status === "completed").length / totalByDep) * 100)
    : 0;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>{depName}</h1>
          <p>{profName} — Gestión de citas de bienestar</p>
        </div>
        <div className="header-actions">
          <button onClick={signOut} className="btn-secondary">
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </header>

      {/* Cards de resumen por dependencia */}
      <section className="prof-stats-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}>
        <div style={{
          background: "#fff",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          borderLeft: "4px solid #f59e0b",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280", fontSize: "0.85rem" }}>
            <AlertCircle size={16} />
            Pendientes
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#f59e0b", marginTop: "0.25rem" }}>
            {stats.pending}
          </div>
        </div>
        <div style={{
          background: "#fff",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          borderLeft: "4px solid #3b82f6",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280", fontSize: "0.85rem" }}>
            <Clock size={16} />
            Confirmadas
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#3b82f6", marginTop: "0.25rem" }}>
            {stats.confirmed}
          </div>
        </div>
        <div style={{
          background: "#fff",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          borderLeft: "4px solid #22c55e",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280", fontSize: "0.85rem" }}>
            <CheckCircle size={16} />
            Completadas
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#22c55e", marginTop: "0.25rem" }}>
            {stats.completed}
          </div>
        </div>
        <div style={{
          background: "#fff",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          borderLeft: "4px solid #8b5cf6",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280", fontSize: "0.85rem" }}>
            <TrendingUp size={16} />
            Tasa Cumplimiento
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#8b5cf6", marginTop: "0.25rem" }}>
            {completionRate}%
          </div>
        </div>
      </section>

      <nav className="filter-tabs">
        {["pending", "confirmed", "completed"].map((status) => {
          const Icon = statusIcons[status];
          return (
            <button
              key={status}
              className={filter === status ? "active" : ""}
              onClick={() => setFilter(status)}
              style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
            >
              <Icon size={14} />
              {statusLabels[status]}
              <span style={{
                background: filter === status ? "#fff" : statusColors[status],
                color: filter === status ? statusColors[status] : "#fff",
                borderRadius: "999px",
                padding: "0.1rem 0.5rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                marginLeft: "0.25rem",
              }}>
                {stats[status]}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="appointments-grid">
        {isLoading && appointments.length === 0 ? (
          <div className="loading-screen">
            <Calendar size={24} />
            <p>Cargando citas...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <p>No hay citas {statusLabels[filter]?.toLowerCase()}</p>
          </div>
        ) : (
          appointments.map((apt) => (
            <div key={apt.id} className="appointment-wrapper" style={{ marginBottom: "1rem" }}>
              <AppointmentCard appointment={apt} isAprendiz={false} />

              {/* Detalles expandibles de la cita */}
              <div style={{
                background: "#f9fafb",
                borderRadius: "0 0 var(--radius-md) var(--radius-md)",
                padding: expandedCard === apt.id ? "1rem 1.25rem" : "0.5rem 1.25rem",
                borderTop: "1px solid #e5e7eb",
                transition: "all 0.2s ease",
              }}>
                <button
                  onClick={() => setExpandedCard(expandedCard === apt.id ? null : apt.id)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "0.35rem",
                    color: "#6b7280", fontSize: "0.8rem", padding: 0,
                  }}
                >
                  <FileText size={14} />
                  Detalles de la sesión
                  {expandedCard === apt.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {expandedCard === apt.id && (
                  <div style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#374151" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1.5rem" }}>
                      <div>
                        <span style={{ color: "#9ca3af" }}>Motivo: </span>
                        <span>{apt.reason || "No especificado"}</span>
                      </div>
                      <div>
                        <span style={{ color: "#9ca3af" }}>Dependencia: </span>
                        <span style={{
                          background: apt.dependencies?.color || "#ccc",
                          color: "#fff",
                          padding: "0.1rem 0.5rem",
                          borderRadius: "999px",
                          fontSize: "0.75rem",
                        }}>
                          {apt.dependencies?.name || "-"}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "#9ca3af" }}>Profesional: </span>
                        <span>{apt.professional?.full_name || "Sin asignar"}</span>
                      </div>
                      {apt.notes && (
                        <div style={{ gridColumn: "1 / -1" }}>
                          <span style={{ color: "#9ca3af" }}>Notas: </span>
                          <span>{apt.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {filter === "pending" && (
                <div className="appointment-actions" style={{
                  display: "flex", gap: "0.5rem", padding: "0.75rem 1.25rem",
                  background: "#fff", borderRadius: "0 0 var(--radius-md) var(--radius-md)",
                  borderTop: "1px solid #e5e7eb",
                }}>
                  <button onClick={() => handleConfirm(apt.id)} className="btn-success" style={{ flex: 1 }}>
                    <CheckCircle size={16} />
                    Confirmar
                  </button>
                  <button onClick={() => handleShow(apt.id)} className="btn-secondary" style={{ flex: 1 }}>
                    <XCircle size={16} />
                    No Asistió
                  </button>
                </div>
              )}

              {filter === "confirmed" && (
                <div className="professional-actions" style={{
                  padding: "0.75rem 1.25rem",
                  background: "#fff", borderRadius: "0 0 var(--radius-md) var(--radius-md)",
                  borderTop: "1px solid #e5e7eb",
                }}>
                  <textarea
                    className="completion-notes"
                    placeholder="Notas de la atención (opcional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                  />
                  <button onClick={() => handleComplete(apt.id)} className="btn-primary" style={{ width: "100%" }}>
                    <CheckCircle size={16} />
                    Completar Atención
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
