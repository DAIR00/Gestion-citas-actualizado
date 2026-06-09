import { useState } from "react";
import { UserManagement } from "../components/UserManagement";
import { AuditLogViewer } from "../components/AuditLogViewer";
import { SystemConfig } from "../components/SystemConfig";
import { ReportGenerator } from "../../appointments/components/ReportGenerator";
import { useAuth } from "../../../providers/AuthProvider";
import { Users, ClipboardList, Settings, FileBarChart, LogOut } from "lucide-react";

const TABS = [
    { id: "users", label: "Usuarios", icon: Users },
    { id: "reports", label: "Reportes", icon: FileBarChart },
    { id: "audit", label: "Auditoría", icon: ClipboardList },
    { id: "config", label: "Configuración", icon: Settings },
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("users");
    const { signOut } = useAuth();

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>Panel de Administración</h1>
                    <p>Gestión de usuarios, auditoría y configuración del sistema</p>
                </div>
                <div className="header-actions">
                    <button onClick={signOut} className="btn-secondary">
                        <LogOut size={18} />
                        Salir
                    </button>
                </div>
            </header>

            <nav className="admin-tabs">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </nav>

            <section className="admin-content">
                {activeTab === "users" && <UserManagement />}
                {activeTab === "reports" && (
                    <ReportGenerator title="Reporte General de Citas" variant="full" />
                )}
                {activeTab === "audit" && <AuditLogViewer />}
                {activeTab === "config" && <SystemConfig />}
            </section>
        </div>
    );
}
