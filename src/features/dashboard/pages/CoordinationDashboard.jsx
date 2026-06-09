import { useEffect, useState } from "react";
import { useDashboard } from "../api/hooks/useDashboard";
import { useAuth } from "../../../providers/AuthProvider";
import { KPICard } from "../components/KPICard"; 
import { DependencyChart } from "../components/DependencyChart";
import { MonthlyTrendChart } from "../components/MonthlyTrendChart";
import { ProfessionalTable } from "../components/ProfessionalTable";
import { ReportGenerator } from "../../appointments/components/ReportGenerator";
import { Download, RefreshCw, Calendar, FileBarChart, LogOut } from "lucide-react";
import { format, subMonths } from "date-fns";

export default function CoordinationDashboard() {
    const { 
        kpis,
        byDependency, 
        monthlyTrend, 
        professionals,
        loading, 
        fetchAllMetrics,
        exportToCSV, 
    } = useDashboard();
    const { signOut } = useAuth();
    const [dataRange, setDataRange] = useState({
        from: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
        to: format(new Date(), "yyyy-MM-dd"),
    });
    const [activeTab, setActiveTab] = useState("dashboard");

    useEffect(() => {
        fetchAllMetrics(dataRange);
    }, [dataRange, fetchAllMetrics]);

    const handleDateChange = (field, value) => {
        setDataRange((prev) => ({ ...prev, [field]: value }));
    };

    if (loading && !kpis) {
        return <div className="loading-screen">Cargando dashboard...</div>
    }

    return (
      <div className="coordination-dashboard">
        <header className="dashboard-header">
          <div>
            <h1>Panel de Coordinación</h1>
            <p>Vista general del bienestar institucional</p>
          </div>
          <div className="header-actions">
            {activeTab === "dashboard" && (
              <>
                <button onClick={() => fetchAllMetrics(dataRange)} className="btn-secondary">
                  <RefreshCw size={18} />
                  Actualizar 
                </button>
                <button onClick={() => exportToCSV(dataRange)} className="btn-primary">
                  <Download size={18} />
                  Exportar CSV
                </button>
              </>
            )}
            <button onClick={signOut} className="btn-secondary">
              <LogOut size={18} />
              Salir
            </button>
          </div>
        </header>

        <nav className="coordination-tabs">
          <button
            className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <Calendar size={18} />
            Dashboard
          </button>
          <button
            className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            <FileBarChart size={18} />
            Reportes
          </button>
        </nav>

        {activeTab === "dashboard" && (
          <>
            <div className="data-filter">
              <Calendar size={18} />
              <input
                type="date"
                value={dataRange.from}
                onChange={(e) => handleDateChange("from", e.target.value)}
              />
              <span>hasta</span>
              <input
                type="date"
                value={dataRange.to}
                onChange={(e) => handleDateChange("to", e.target.value)}
              />
            </div>

            {kpis && (
              <section className="kpi-grid">
                <KPICard 
                  title="Total Citas" 
                  value={kpis.total_appointments}
                  color="#3b82f6"
                  subtitle= "En periodo seleccionado"
                />
                <KPICard
                  title="Tasa de Cumplimiento"
                  value={kpis.total_appointments > 0 ? `${Math.round((kpis.completed_appointments / kpis.total_appointments) * 100)}%` : "0%"}
                  color="#22c55e"
                  subtitle={`${kpis.completed_appointments} completadas`}
                />
                <KPICard
                  title="Tiempo Promedio de Espera"
                  value={`${Math.round(kpis.avg_wait_days || 0)} dias`}
                  color="#f59e0b"
                  subtitle="Desde solicitud a atención"
                />
                <KPICard
                  title="No Asistencias"
                  value={kpis.no_show_count}
                  color="#ef4444"
                  subtitle={kpis.total_appointments > 0 ? `${Math.round((kpis.no_show_count / kpis.total_appointments) * 100)}% del total` : "0% del total"}
                />
              </section>
            )}

            <section className="charts-grid">
              <DependencyChart data={byDependency} />
              <MonthlyTrendChart data={monthlyTrend} />
            </section>

            <section className="professionals-section">
              <ProfessionalTable data={professionals} />
            </section>
          </>
        )}

        {activeTab === "reports" && (
          <ReportGenerator title="Reporte de Citas - Coordinación" variant="full" />
        )}
      </div>
    )
  }