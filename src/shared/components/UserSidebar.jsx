import { useState, useEffect } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import {
  X,
  User,
  Settings,
  Lock,
  LogOut,
  ChevronRight,
  Save,
  Loader2,
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  Briefcase,
  Eye,
  EyeOff,
  ArrowLeft,
  Bell,
  BellOff,
  Mail,
  Monitor,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import UserAvatar from "./UserAvatar";
import "../styles/user-sidebar.css";

const VIEWS = { MENU: "menu", PROFILE: "profile", PASSWORD: "password", CONFIG: "config" };

const STORAGE_KEY = "sena_user_prefs";

const DEFAULT_PREFS = {
  email_reminders: true,
  status_alerts: true,
  advance_days: "3",
};

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

function savePrefs(prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function getPasswordStrength(pw) {
  if (!pw) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { level: 1, label: "Débil", color: "#ef4444" };
  if (score <= 3) return { level: 2, label: "Media", color: "#f59e0b" };
  return { level: 3, label: "Fuerte", color: "#22c55e" };
}

export default function UserSidebar({ isOpen, onClose, appointments = [] }) {
  const { user, profile, signOut } = useAuth();
  const [view, setView] = useState(VIEWS.MENU);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    document_number: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  // Config preferences
  const [prefs, setPrefs] = useState(loadPrefs);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  // Sync profile data when opened
  useEffect(() => {
    if (isOpen && profile) {
      setProfileForm({
        full_name: profile.full_name || "",
        document_number: profile.document_number || "",
      });
      setView(VIEWS.MENU);
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setPrefs(loadPrefs());
      setShowDeleteConfirm(false);
      setDeleteText("");
    }
  }, [isOpen, profile]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleSaveProfile = async () => {
    if (!profileForm.full_name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileForm.full_name.trim(),
          document_number: profileForm.document_number.trim(),
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Perfil actualizado correctamente");
      setView(VIEWS.MENU);
    } catch (err) {
      toast.error("Error al guardar: " + (err.message || err));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    const { newPassword, confirmPassword } = passwordForm;

    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Contraseña actualizada correctamente");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setView(VIEWS.MENU);
    } catch (err) {
      toast.error("Error al cambiar contraseña: " + (err.message || err));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSavePrefs = async () => {
    setIsSavingPrefs(true);
    await new Promise((r) => setTimeout(r, 400));
    savePrefs(prefs);
    setIsSavingPrefs(false);
    toast.success("Preferencias guardadas");
    setView(VIEWS.MENU);
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== "ELIMINAR") {
      toast.error('Escribe "ELIMINAR" para confirmar');
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase.rpc("delete_user_account");
      if (error) {
        const { error: delErr } = await supabase
          .from("profiles")
          .delete()
          .eq("id", user.id);
        if (delErr) throw delErr;
        await signOut();
        toast.success("Cuenta eliminada");
        return;
      }
      await signOut();
      toast.success("Cuenta eliminada correctamente");
    } catch (err) {
      toast.error("Error al eliminar cuenta: " + (err.message || err));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  const togglePref = (key) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  // Appointment stats
  const totalAppointments = appointments.length;
  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;

  const menuItems = [
    { icon: User, label: "Mi Perfil", action: () => setView(VIEWS.PROFILE) },
    { icon: Settings, label: "Configuración", action: () => setView(VIEWS.CONFIG) },
    { icon: Lock, label: "Cambiar Contraseña", action: () => setView(VIEWS.PASSWORD) },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`sidebar-backdrop ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`user-sidebar ${isOpen ? "open" : ""}`}>
        {/* Close button */}
        <button className="sidebar-close" onClick={onClose} type="button">
          <X size={20} />
        </button>

        {/* User header */}
        <div className="sidebar-user-header">
          <UserAvatar name={profile?.full_name} size="lg" />
          <div className="sidebar-user-info">
            <h3 className="sidebar-user-name">{profile?.full_name || "Usuario"}</h3>
            <span className="sidebar-user-role">
              <Shield size={13} />
              {profile?.roles?.name || "Sin rol"}
            </span>
            <span className="sidebar-user-email">{user?.email}</span>
          </div>
        </div>

        {/* Content area */}
        <div className="sidebar-content">
          {/* ── MENU VIEW ── */}
          {view === VIEWS.MENU && (
            <>
              <div className="sidebar-section">
                <span className="sidebar-section-label">Mi Cuenta</span>
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    className="sidebar-menu-item"
                    onClick={item.action}
                    type="button"
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                    <ChevronRight size={16} className="menu-arrow" />
                  </button>
                ))}
              </div>

              <div className="sidebar-section">
                <span className="sidebar-section-label">Sesión</span>
                <button
                  className="sidebar-menu-item sidebar-logout"
                  onClick={handleLogout}
                  type="button"
                >
                  <LogOut size={18} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>

              {/* Stats */}
              <div className="sidebar-stats">
                <span className="sidebar-section-label">Resumen</span>
                <div className="sidebar-stat-grid">
                  <div className="sidebar-stat-item">
                    <Calendar size={16} />
                    <span className="sidebar-stat-value">{totalAppointments}</span>
                    <span className="sidebar-stat-label">Agendadas</span>
                  </div>
                  <div className="sidebar-stat-item">
                    <Clock size={16} />
                    <span className="sidebar-stat-value">{pendingCount}</span>
                    <span className="sidebar-stat-label">Pendientes</span>
                  </div>
                  <div className="sidebar-stat-item">
                    <CheckCircle2 size={16} />
                    <span className="sidebar-stat-value">{completedCount}</span>
                    <span className="sidebar-stat-label">Completadas</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── PROFILE VIEW ── */}
          {view === VIEWS.PROFILE && (
            <div className="sidebar-view">
              <button
                className="sidebar-back-btn"
                onClick={() => setView(VIEWS.MENU)}
                type="button"
              >
                <ArrowLeft size={18} />
                <span>Mi Cuenta</span>
              </button>

              <div className="sidebar-section">
                <span className="sidebar-section-label">Información Personal</span>

                <div className="sidebar-field">
                  <label>Nombre completo</label>
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, full_name: e.target.value }))
                    }
                    placeholder="Tu nombre"
                  />
                </div>

                <div className="sidebar-field">
                  <label>Número de documento</label>
                  <input
                    type="text"
                    value={profileForm.document_number}
                    onChange={(e) =>
                      setProfileForm((p) => ({
                        ...p,
                        document_number: e.target.value,
                      }))
                    }
                    placeholder="Tu documento"
                  />
                </div>

                <div className="sidebar-field">
                  <label>Email</label>
                  <input type="email" value={user?.email || ""} disabled />
                </div>

                <div className="sidebar-badges">
                  <span className="sidebar-badge">
                    <Briefcase size={13} />
                    {profile?.dependencies?.name || "Sin dependencia"}
                  </span>
                  <span className="sidebar-badge sidebar-badge-role">
                    <Shield size={13} />
                    {profile?.roles?.name}
                  </span>
                </div>
              </div>

              <button
                className="btn-primary sidebar-save-btn"
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                type="button"
              >
                {isSavingProfile ? (
                  <Loader2 size={18} className="spin" />
                ) : (
                  <Save size={18} />
                )}
                {isSavingProfile ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          )}

          {/* ── PASSWORD VIEW ── */}
          {view === VIEWS.PASSWORD && (
            <div className="sidebar-view">
              <button
                className="sidebar-back-btn"
                onClick={() => setView(VIEWS.MENU)}
                type="button"
              >
                <ArrowLeft size={18} />
                <span>Mi Cuenta</span>
              </button>

              <div className="sidebar-section">
                <span className="sidebar-section-label">Cambiar Contraseña</span>

                <div className="sidebar-field">
                  <label>Nueva contraseña</label>
                  <div className="password-field">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({
                          ...p,
                          newPassword: e.target.value,
                        }))
                      }
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {passwordForm.newPassword && (
                    <div className="password-strength">
                      <div className="strength-bars">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`strength-bar ${passwordStrength.level >= i ? "active" : ""}`}
                            style={{
                              backgroundColor:
                                passwordStrength.level >= i
                                  ? passwordStrength.color
                                  : "#e5e7eb",
                            }}
                          />
                        ))}
                      </div>
                      <span
                        className="strength-label"
                        style={{ color: passwordStrength.color }}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div className="sidebar-field">
                  <label>Confirmar contraseña</label>
                  <div className="password-field">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({
                          ...p,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="Repite la contraseña"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {passwordForm.confirmPassword &&
                    passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <span className="sidebar-field-error">
                        Las contraseñas no coinciden
                      </span>
                    )}
                </div>
              </div>

              <button
                className="btn-primary sidebar-save-btn"
                onClick={handleChangePassword}
                disabled={
                  isChangingPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmPassword
                }
                type="button"
              >
                {isChangingPassword ? (
                  <Loader2 size={18} className="spin" />
                ) : (
                  <Lock size={18} />
                )}
                {isChangingPassword ? "Actualizando..." : "Actualizar Contraseña"}
              </button>
            </div>
          )}

          {/* ── CONFIG VIEW ── */}
          {view === VIEWS.CONFIG && (
            <div className="sidebar-view">
              <button
                className="sidebar-back-btn"
                onClick={() => setView(VIEWS.MENU)}
                type="button"
              >
                <ArrowLeft size={18} />
                <span>Mi Cuenta</span>
              </button>

              {/* Notifications */}
              <div className="sidebar-section">
                <span className="sidebar-section-label">Notificaciones</span>

                <div className="sidebar-toggle-row">
                  <div className="sidebar-toggle-info">
                    <Mail size={16} />
                    <div>
                      <span className="sidebar-toggle-label">Recordatorio de citas</span>
                      <span className="sidebar-toggle-desc">Recibe un email antes de tu cita</span>
                    </div>
                  </div>
                  <button
                    className={`sidebar-toggle ${prefs.email_reminders ? "active" : ""}`}
                    onClick={() => togglePref("email_reminders")}
                    type="button"
                    role="switch"
                    aria-checked={prefs.email_reminders}
                  >
                    <span className="sidebar-toggle-thumb" />
                  </button>
                </div>

                <div className="sidebar-toggle-row">
                  <div className="sidebar-toggle-info">
                    <Bell size={16} />
                    <div>
                      <span className="sidebar-toggle-label">Alertas de estado</span>
                      <span className="sidebar-toggle-desc">Notificar cuando cambia el estado de tu cita</span>
                    </div>
                  </div>
                  <button
                    className={`sidebar-toggle ${prefs.status_alerts ? "active" : ""}`}
                    onClick={() => togglePref("status_alerts")}
                    type="button"
                    role="switch"
                    aria-checked={prefs.status_alerts}
                  >
                    <span className="sidebar-toggle-thumb" />
                  </button>
                </div>
              </div>

              {/* Display */}
              <div className="sidebar-section">
                <span className="sidebar-section-label">Visualización</span>

                <div className="sidebar-toggle-row">
                  <div className="sidebar-toggle-info">
                    <Calendar size={16} />
                    <div>
                      <span className="sidebar-toggle-label">Días de anticipación</span>
                      <span className="sidebar-toggle-desc">Mostrar citas próximas con antelación</span>
                    </div>
                  </div>
                  <select
                    className="sidebar-select"
                    value={prefs.advance_days}
                    onChange={(e) => setPrefs((p) => ({ ...p, advance_days: e.target.value }))}
                  >
                    <option value="1">1 día</option>
                    <option value="3">3 días</option>
                    <option value="5">5 días</option>
                    <option value="7">7 días</option>
                  </select>
                </div>
              </div>

              {/* Danger zone */}
              <div className="sidebar-section">
                <span className="sidebar-section-label">Cuenta</span>

                {!showDeleteConfirm ? (
                  <button
                    className="sidebar-danger-btn"
                    onClick={() => setShowDeleteConfirm(true)}
                    type="button"
                  >
                    <Trash2 size={18} />
                    <span>Eliminar mi cuenta</span>
                  </button>
                ) : (
                  <div className="sidebar-delete-confirm">
                    <div className="sidebar-delete-warning">
                      <AlertTriangle size={18} />
                      <span>Esta acción es irreversible. Se eliminarán tus datos permanentemente.</span>
                    </div>
                    <div className="sidebar-field">
                      <label>
                        Escribe <strong>ELIMINAR</strong> para confirmar
                      </label>
                      <input
                        type="text"
                        value={deleteText}
                        onChange={(e) => setDeleteText(e.target.value)}
                        placeholder="ELIMINAR"
                      />
                    </div>
                    <div className="sidebar-delete-actions">
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteText("");
                        }}
                        type="button"
                        disabled={isDeleting}
                      >
                        Cancelar
                      </button>
                      <button
                        className="sidebar-delete-confirm-btn"
                        onClick={handleDeleteAccount}
                        type="button"
                        disabled={isDeleting || deleteText !== "ELIMINAR"}
                      >
                        {isDeleting ? (
                          <Loader2 size={16} className="spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        {isDeleting ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                className="btn-primary sidebar-save-btn"
                onClick={handleSavePrefs}
                disabled={isSavingPrefs}
                type="button"
              >
                {isSavingPrefs ? (
                  <Loader2 size={18} className="spin" />
                ) : (
                  <Save size={18} />
                )}
                {isSavingPrefs ? "Guardando..." : "Guardar Preferencias"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
