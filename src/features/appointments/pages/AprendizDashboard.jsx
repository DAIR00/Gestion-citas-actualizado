import { useEffect, useState } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentForm } from "../components/AppointmentForm";
import { AppointmentCard } from "../components/AppointmentCard";
import { useAuth } from "../../../providers/AuthProvider";
import { Plus } from "lucide-react";
import UserAvatar from "../../../shared/components/UserAvatar";
import UserSidebar from "../../../shared/components/UserSidebar";

export default function AprendizDashboard() {
  const { appointments, fetchAppointmentsSilent, cancelAppointment, isLoading } =
    useAppointments();
  const { profile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAppointmentsSilent();
  }, [fetchAppointmentsSilent]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Mis Citas de Bienestar</h1>
        <div className="header-actions">
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus size={20} />
            Nueva Cita
          </button>
          <UserAvatar
            name={profile?.full_name}
            onClick={() => setSidebarOpen(true)}
          />
        </div>
      </header>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Solicitar Nueva Cita</h2>
            <AppointmentForm
              onSuccess={() => {
                setShowForm(false);
                fetchAppointmentsSilent();
              }}
            />
          </div>
        </div>
      )}

      <section className="appointments-list">
        {isLoading && appointments.length === 0 ? (
          <div className="loading-screen">
            <p>Cargando tus citas...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <p>No tienes citas agendadas</p>
            <button onClick={() => setShowForm(true)} className="btn-link">
              Agenda tu primera cita aquí
            </button>
          </div>
        ) : (
          appointments.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              isAprendiz={true}
              onCancel={() => cancelAppointment(apt.id)}
            />
          ))
        )}
      </section>

      <UserSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        appointments={appointments}
      />
    </div>
  );
}
