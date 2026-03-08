import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Heart, Loader } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [credenciales, setCredenciales] = useState({ usuario: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(credenciales);
        if (result.success) {
            navigate('/dashboard'); // Redirigiremos al dashboard principal, y ahí se mostrará según rol
        } else {
            setError(result.mensaje);
        }
        setIsLoading(false);
    };

    return (
        <div className="login-wrapper">
            <div className="login-sidebar">
                <div className="login-branding">
                    <Heart size={48} className="logo-icon-large" />
                    <h2>Contemos Juntos</h2>
                    <p>Plataforma para la gestión y trazabilidad de ayudas humanitarias.</p>
                </div>
            </div>
            <div className="login-main">
                <div className="login-container">
                    <div className="login-header">
                        <h2>Iniciar Sesión</h2>
                        <p>Ingrese sus credenciales para acceder al sistema.</p>
                    </div>

                    {error && <div className="alert-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label className="form-label">Usuario / Correo</label>
                            <input
                                type="text"
                                className="form-control"
                                name="usuario"
                                value={credenciales.usuario}
                                onChange={handleChange}
                                placeholder="ej. admin@contemosjuntos.org"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                value={credenciales.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
                            {isLoading ? <Loader className="spin" size={20} /> : 'Acceder'}
                        </button>
                    </form>

                    <div className="login-footer">
                        <Link to="/" className="back-link">Volver al Inicio</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
