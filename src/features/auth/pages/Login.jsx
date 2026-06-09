import { useState, useEffect } from "react";
import { useAuth } from "../../../providers/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import AuthLayout from "../../../shared/components/AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, user, profileLoaded, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profileLoaded) {
      navigate("/");
    }
  }, [user, profileLoaded, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await signIn(email, password);
    if (!result.success) {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <h1>Iniciar Sesión</h1>
        <p className="auth-subtitle">Accede a tu cuenta del sistema</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <div className="password-field">
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu.email@soy.sena.edu.co"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="login-password">Contraseña</label>
            <div className="password-field">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Tu contraseña"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            <LogIn size={18} />
            {isSubmitting ? (user && !profileLoaded ? "Redirigiendo..." : "Entrando...") : "Entrar"}
          </button>
        </form>

        <p className="auth-footer">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="auth-link">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
