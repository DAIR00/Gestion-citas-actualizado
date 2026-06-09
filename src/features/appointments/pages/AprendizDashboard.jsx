import { useEffect, useState } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentForm } from "../components/AppointmentForm";
import { AppointmentCard } from "../components/AppointmentCard";
import { useAuth } from "../../../providers/AuthProvider";
import { Plus, LogOut } from "lucide-react";

export default function AprendizDashboard() {
  const { appointments, fetchAppointments, fetchAppointmentsSilent, cancelAppointment, isLoading } =
    useAppointments();
  const { signOut } = useAuth();
  const [showForm, setShowForm] = useState(false);

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
          <button onClick={signOut} className="btn-secondary">
            <LogOut size={18} />
            Salir
          </button>
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
    </div>
  );
}
