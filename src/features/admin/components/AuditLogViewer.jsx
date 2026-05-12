import { useEffect, useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { Clock, User, Database, ArrowRight } from "lucide-react";

const ACTIONS_COLORS = {
    CREATE_USER: "#22c5e",
    UPDATE_USER: "#3b82f6",
    DELETE_USER: "#f59e0b",
};

export function AuditLogViewer() {
    const { auditLogs, fetchAuditLogs } = useAdmin();
    const [filters, setFilters] = useState('');

    useEffect(() => {
        fetchAuditLogs();
    }, [fetchAuditLogs]);

    const filteredLogs = filters
        ? auditLogs.filter(l => l.action.includes(filter) || l.entity_type.includes(filters))
        : auditLogs;

    return (
        <div className="admin-section">
            <h2>Registro de Auditoría</h2>

            <div className="audit-filters">
                <input
                    type="text"
                    placeholder="Filtrar por acción o entidad..."
                    value={filters}
                    onChange={(e) => setFilters(e.target.value)}
                />
            </div>

            <div className="audit-timeline">
                {filteredLogs.map(log => (
                    <div key={log.id} className="audit-item">
                        <div className="audit-dot" style={{background: ACTIONS_COLORS[log.action] || '#666'}}/>

                        <div className="audit-content">
                            <div className="audit-header">
                                <span className="audit-action" style={{ color: ACTIONS_COLORS[log.action] }}>
                                    {log.action}
                                </span>
                                <span className="audit-time">
                                    <Clock size={14} />
                                    {new Date(log.created_at).toLocaleString()}
                                </span>
                            </div>

                            <div className="audit-details">
                                <p>
                                    <User size={14}/>
                                    <strong>{log.admin?.full_name || 'Sistema'}</strong>
                                    {''}modificó{''}
                                    <Database size={14}/>
                                    <strong>{log.entity_type}</strong>
                                    {''}(ID: {log.entity_id})
                                </p>

                                {log.old_data && log.new_data && (
                                    <div className="audit-changes">
                                        <div className="change-box old">
                                            <span className="label">Antes</span>
                                            <pre>{JSON.stringify(log.old_data, null, 2)}</pre>
                                        </div>
                                        <ArrowRight size={20}/>
                                        <div className="change-box new">
                                            <span className="label">Después</span>
                                            <pre>{JSON.stringify(log.new_data, null, 2)}</pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}