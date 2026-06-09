import { useEffect, useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { Save, RefreshCw } from "lucide-react";

const CONFIG_FIELDS = [
    { key: "max_pending_appointments", label: "Máximo de citas pendientes por aprendiz", type: "number" },
    { key: "appointment_advance_days", label: "Días de anticipación para agendar", type: "number" },
    { key: "cancellation_hours", label: "Horas mínimas para cancelar sin penalización", type: "number" },
    { key: "working_hours_start", label: "Hora de inicio de atención", type: "text" },
    { key: "working_hours_end", label: "Hora de fin de atención", type: "text" },
    { key: "institution_name", label: "Nombre de la institución", type: "text" },
    { key: "contact_email", label: "Correo de contacto", type: "email" },
];

export function SystemConfig() {
    const { config, fetchConfig, updateConfig, loading } = useAdmin();
    const [formValues, setFormValues] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    useEffect(() => {
        if (config) {
            setFormValues(config);
        }
    }, [config]);

    const handleChange = (key, value) => {
        setFormValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            for (const field of CONFIG_FIELDS) {
                const newVal = formValues[field.key];
                const oldVal = config?.[field.key];
                if (newVal !== oldVal && newVal !== undefined) {
                    await updateConfig(field.key, newVal);
                }
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading && !config) {
        return <div className="loading-screen">Cargando configuración...</div>;
    }

    return (
        <div className="admin-section">
            <header className="section-header">
                <h2>Configuración del Sistema</h2>
                <div className="header-actions">
                    <button onClick={fetchConfig} className="btn-secondary">
                        <RefreshCw size={18} />
                        Recargar
                    </button>
                    <button onClick={handleSave} className="btn-primary" disabled={saving}>
                        <Save size={18} />
                        {saving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </header>

            <div className="config-grid">
                {CONFIG_FIELDS.map((field) => (
                    <div key={field.key} className="config-field">
                        <label htmlFor={field.key}>{field.label}</label>
                        <input
                            id={field.key}
                            type={field.type}
                            value={formValues[field.key] || ""}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                        />
                        <span className="config-key">{field.key}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
