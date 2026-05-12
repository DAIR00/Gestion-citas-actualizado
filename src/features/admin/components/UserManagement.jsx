import { useEffect, useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { Search, Filter, UserPlus, Morevertical, CheckCircle, XCircle } from "lucide-react";

const ROLES = [
    { id: 1, name: "SUPERADMIN", label: "Super Admin" },
    { id: 2, name: "COORDINACION", label: "Coordinacion" },
    { id: 3, name: "PSCOLOGIA", label: "Psicologia" },
    { id: 4, name: "ENFERMERIA", label: "Enfermeria" },
    { id: 5, name: "TRABAJO_SOCIAL", label: "Trabajo Social" },
    { id: 6, name: "APRENDIZ", label: "Aprendiz" },
]

export function UserManagement() {
    const { users, pagination, loading, fetchUsers, updateUserRole } = useAdmin()
    const { filters, setFilters } = useState({ search: "", role: "" })
    const { editingUser, setEditingUser } = useState(null)

    useEffect(() => {
        fetchUsers(filters);
    }, [filters, fetchUsers]);

    const toggleUserStatus = (user) => {
        updateUserRole(user.id, {
            roleId: user.role_id,
            dependencyId: user.dependency_id,
            isActive: !user.is_active
        });
    }

    return (
        <div className="admin-section">
            <header className="section-header">
                <h2>Gestión de Usuarios</h2>
                <button className="btn btn-primary">
                    <UserPlus size={18} />
                    <span>Nuevo Usuario</span>
                </button>
            </header>

            <div className="filters-bar">
                <div className="search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o documento..."
                        value={filters.search}
                        onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                    />
                </div>
            </div>
        </div>
    )
}