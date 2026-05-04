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

        // Garantizar un tiempo mínimo de carga para que el spinner sea visible
        const minDelay = new Promise(resolve => setTimeout(resolve, 1200));
        const [result] = await Promise.all([login(credenciales), minDelay]);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.mensaje);
        }
        setIsLoading(false);
    };

    return (
        <div className="login-wrapper">
            <div className="login-main">
                <div className="login-branding">
                    <div style={{ backgroundColor: 'white', display: 'inline-block', padding: '12px', borderRadius: '24px', marginBottom: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <img src="/src/assets/logo.png" alt="Logo" style={{ width: '64px', height: '64px', display: 'block', borderRadius: '12px' }} />
                    </div>
                    <h2>Contemos Juntos</h2>
                    <p>Sistema Avanzado de Gestión Humanitaria</p>
                </div>

                <div className="login-container">
                    <div className="login-header">
                        <h2>Acceso al Sistema</h2>
                        <p>Ingrese sus credenciales corporativas</p>
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
                            {isLoading ? <Loader className="spin" size={20} /> : 'Iniciar Sesión'}
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
