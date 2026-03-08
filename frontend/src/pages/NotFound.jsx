import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <h1 className="not-found-code">404</h1>
                <h2 className="not-found-title">Página No Encontrada</h2>
                <p className="not-found-description">
                    Lo sentimos, la página que buscas no existe o ha sido movida.
                </p>
                <button
                    className="not-found-button"
                    onClick={() => navigate('/')}
                >
                    Volver al Inicio
                </button>
            </div>
        </div>
    );
}
