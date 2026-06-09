import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../providers/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

const ROLES = [
  { id: 2, name: "COORDINACION", label: "Coordinador de Bienestar" },
  { id: 3, name: "PSICOLOGIA", label: "Profesional Psicología" },
  { id: 4, name: "ENFERMERIA", label: "Profesional Enfermería" },
  { id: 5, name: "TRABAJO_SOCIAL", label: "Profesional Trabajo Social" },
  { id: 6, name: "APRENDIZ", label: "Aprendiz" },
];

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    document_number: "",
    roleId: "",
    dependencyId: "",
  });
  const [dependencies, setDependencies] = useState([]);
  const [validationError, setValidationError] = useState("");

  const { signUp, signOut, error: authError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from("dependencies").select("*").then(({ data, error }) => {
      if (error) {
        console.error("Error cargando dependencias:", error);
      }
      setDependencies(data || []);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectedRole = ROLES.find((r) => r.id === Number(formData.roleId));
  const isProfessional = selectedRole && ["PSICOLOGIA", "ENFERMERIA", "TRABAJO_SOCIAL"].includes(selectedRole.name);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setValidationError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!formData.roleId) {
      setValidationError("Selecciona un rol");
      return;
    }

    if (isProfessional && !formData.dependencyId) {
      setValidationError("Selecciona una dependencia");
      return;
    }

    const result = await signUp(formData.email, formData.password, {
      full_name: formData.full_name,
      document_number: formData.document_number,
      role_id: Number(formData.roleId),
      dependency_id: formData.dependencyId ? Number(formData.dependencyId) : null,
    });

    if (result.success) {
      const userId = result.data?.user?.id;
      if (userId) {
        await supabase.from("profiles").upsert({
          id: userId,
          full_name: formData.full_name,
          document_number: formData.document_number,
          role_id: Number(formData.roleId),
          dependency_id: formData.dependencyId ? Number(formData.dependencyId) : null,
        }, { onConflict: "id" });
      }

      await signOut();
      toast.success(
        "¡Registro exitoso! Ahora puedes iniciar sesión.",
      );
      navigate("/login");
    }
  };

  const errorMessage = validationError || authError;

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <h1>Crear cuenta</h1>
        <p className="auth-subtitle">
          SENA Bienestar — Regístrate para acceder al sistema
        </p>

        {errorMessage && <div className="auth-error">{errorMessage}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="reg-fullname">Nombre completo</label>
            <input
              id="reg-fullname"
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="field">
            <label htmlFor="reg-document">Número de documento</label>
            <input
              id="reg-document"
              type="text"
              name="document_number"
              value={formData.document_number}
              onChange={handleChange}
              required
              placeholder="Ej: 1234567890"
            />
          </div>

          <div className="field">
            <label htmlFor="reg-role">Rol</label>
            <select
              id="reg-role"
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona tu rol</option>
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {isProfessional && (
            <div className="field">
              <label htmlFor="reg-dependency">Dependencia</label>
              <select
                id="reg-dependency"
                name="dependencyId"
                value={formData.dependencyId}
                onChange={handleChange}
                required
              >
                <option value="">
                {dependencies.length === 0
                  ? "No hay dependencias disponibles"
                  : "Selecciona una dependencia"}
              </option>
                {dependencies.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="field">
            <label htmlFor="reg-email">Email institucional</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tu.email@soy.sena.edu.co"
            />
          </div>

          <div className="field">
            <label htmlFor="reg-password">Contraseña</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="field">
            <label htmlFor="reg-confirm">Confirmar contraseña</label>
            <input
              id="reg-confirm"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Repite tu contraseña"
            />
          </div>

          <button type="submit" className="btn-primary">
            Crear cuenta
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="auth-link">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
