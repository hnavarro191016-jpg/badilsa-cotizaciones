"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, ArrowLeft, User, Lock, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Username, 2: Questions, 3: Success
  const [username, setUsername] = useState('');
  const [questions, setQuestions] = useState({ pregunta1: '', pregunta2: '' });
  const [answers, setAnswers] = useState({ respuesta1: '', respuesta2: '' });
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFetchQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      setError('Por favor ingresa tu nombre de usuario');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/security-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const data = await res.json();

      if (res.ok) {
        setQuestions({ pregunta1: data.pregunta1, pregunta2: data.pregunta2 });
        setStep(2);
      } else {
        setError(data.error || 'Usuario no encontrado o no tiene preguntas secretas.');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!answers.respuesta1 || !answers.respuesta2 || !passwords.newPassword || !passwords.confirmPassword) {
      setError('Por favor llena todos los campos');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwords.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          respuesta1: answers.respuesta1,
          respuesta2: answers.respuesta2,
          newPassword: passwords.newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        setStep(3);
      } else {
        setError(data.error || 'Las respuestas son incorrectas o hubo un error.');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '500px' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: '500' }}>
          <ArrowLeft size={16} /> Volver
        </button>

        {step === 3 ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#dcfce7', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle2 size={40} color="#16a34a" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem' }}>¡Contraseña Restablecida!</h2>
            <p style={{ color: '#475569', marginBottom: '2rem', lineHeight: '1.5' }}>
              Tu contraseña ha sido actualizada correctamente mediante tus respuestas secretas. Ya puedes iniciar sesión.
            </p>
            <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} onClick={() => router.push('/')}>
              Ir al Inicio de Sesión
            </button>
          </div>
        ) : (
          <>
            <div className="login-header">
              <div className="login-logo" style={{ background: '#eff6ff' }}>
                <KeyRound size={40} color="#2563eb" />
              </div>
              <h1>Recuperar Contraseña</h1>
              <p>{step === 1 ? 'Ingresa tu usuario para buscar tu cuenta' : 'Responde tus preguntas de seguridad'}</p>
            </div>

            {error && <div className="login-error">{error}</div>}

            {step === 1 && (
              <form onSubmit={handleFetchQuestions}>
                <div className="form-group">
                  <label>Nombre de Usuario</label>
                  <div className="input-with-icon">
                    <User size={18} />
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Ej: mgarcia" required />
                  </div>
                </div>
                <button type="submit" className="login-button" disabled={loading} style={{ marginTop: '1.5rem' }}>
                  {loading ? 'Buscando...' : 'Siguiente'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label style={{ color: '#0f172a', fontWeight: '600' }}>Pregunta 1: {questions.pregunta1}</label>
                  <input type="text" className="inline-input" value={answers.respuesta1} onChange={e => setAnswers({...answers, respuesta1: e.target.value})} placeholder="Tu respuesta secreta..." style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginTop: '0.5rem' }} required />
                </div>
                
                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label style={{ color: '#0f172a', fontWeight: '600' }}>Pregunta 2: {questions.pregunta2}</label>
                  <input type="text" className="inline-input" value={answers.respuesta2} onChange={e => setAnswers({...answers, respuesta2: e.target.value})} placeholder="Tu respuesta secreta..." style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginTop: '0.5rem' }} required />
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', margin: '1.5rem 0' }}></div>

                <div className="form-group">
                  <label>Nueva Contraseña</label>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <input type="password" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} placeholder="Mínimo 6 caracteres" minLength={6} required />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Confirmar Nueva Contraseña</label>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <input type="password" value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} placeholder="Repite la contraseña" required />
                  </div>
                </div>

                <button type="submit" className="login-button" disabled={loading} style={{ marginTop: '2rem' }}>
                  {loading ? 'Validando...' : 'Restablecer Contraseña'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
