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
    const [filters, setFilters] = useState({ search: "", role: "" })
    const [editingUser, setEditingUser] = useState(null)

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
                <select 
                    value={filters.role}
                    onChange={(e) => setFilters(f => ({ ...f, role: e.target.value }))}
                >
                    <option value="">Todos los roles</option>
                    {ROLES.map((r) => (
                        <option key={r.id} value={r.name}>
                            {r.label}
                        </option>
                    ))}
                </select>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Rol</th>
                        <th>Dependencia</th>
                        <th>Estado</th>
                        <th>Última actualización</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="6">Cargando...</td></tr> 
                    ) : users.map(u => (
                        <tr key={u.id} className={!u.is_active ? 'inactive' : ''}>
                            <td>
                                <div className="user-cell">
                                    <div className="avatar">{u.full_name[0]}</div>
                                    <div>
                                        <div className="name">{u.full_name}</div>
                                        <div className="document">{u.email || u.document_number}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span className={'role-badge ${u.roles?.name.toLowerCase{}}'}>
                                    {u.roles?.name}
                                </span>
                            </td>
                            <td>{u.dependencies?.name || "_"}</td>
                            <td>
                                <button onClick={() => toggleUserStatus(u)} className={`status-toggle ${u.is_active ? 'active' : 'inactive'}`}
                                    >
                                    {u.is_active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                    {u.is_active ? "Activo" : "Inactivo"}
                                </button>
                            </td>
                            <td>{new Date(u.updated_at).toLocaleString()}</td>
                            <td>
                                <button className="btn-icon" onClick={() => setEditingUser(u)}>
                                    <Morevertical size={18} />
                                </button>
                            </td>
                        </tr> 
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                <span>Total: {pagination.total} usuarios</span>
                <div className="page-controls">
                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                        <button 
                            key={i + 1}
                            className={pagination.page === i + 1 ? 'active' : ''}
                            onClick={() => setFilters(f => ({ ...f, page: i + 1 }))}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div> 
    )
}