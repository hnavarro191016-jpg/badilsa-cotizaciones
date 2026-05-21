"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Shield, Lock, ArrowLeft, Mail, Phone, User, KeyRound } from 'lucide-react';

const PREGUNTAS_SECRETAS = [
  "¿Cual es el nombre de tu primera mascota?",
  "¿En que ciudad naciste?",
  "¿Cual es el segundo nombre de tu madre?",
  "¿Cual fue el nombre de tu primera escuela?",
  "¿Cual es tu comida favorita?",
  "¿Cual es tu pelicula favorita?"
];

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    preguntaSecreta1: PREGUNTAS_SECRETAS[0],
    respuestaSecreta1: '',
    preguntaSecreta2: PREGUNTAS_SECRETAS[1],
    respuestaSecreta2: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.preguntaSecreta1 === formData.preguntaSecreta2) {
      setError('Debes elegir dos preguntas secretas diferentes');
      return;
    }

    if (!formData.nombre || !formData.username || !formData.password || !formData.respuestaSecreta1 || !formData.respuestaSecreta2) {
      setError('Por favor llena todos los campos obligatorios');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Error al registrar la cuenta');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-container">
        <div className="login-card" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ background: '#dcfce7', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Shield size={40} color="#16a34a" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem' }}>¡Solicitud Enviada!</h2>
          <p style={{ color: '#475569', marginBottom: '2rem', lineHeight: '1.5' }}>
            Tu cuenta ha sido creada exitosamente. Sin embargo, por motivos de seguridad, <strong>un administrador debe aprobar tu acceso</strong> antes de que puedas iniciar sesión en el sistema.
          </p>
          <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} onClick={() => router.push('/')}>
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container" style={{ padding: '2rem 1rem' }}>
      <div className="login-card" style={{ maxWidth: '600px' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: '500' }}>
          <ArrowLeft size={16} /> Volver
        </button>

        <div className="login-header">
          <div className="login-logo">
            <UserPlus size={40} color="white" />
          </div>
          <h1>Crear Cuenta</h1>
          <p>Ingresa tus datos para registrarte en el sistema</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Nombre *</label>
              <div className="input-with-icon">
                <User size={18} />
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Tu nombre" required />
              </div>
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <div className="input-with-icon">
                <User size={18} />
                <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Tus apellidos" />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Teléfono</label>
              <div className="input-with-icon">
                <Phone size={18} />
                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Número de celular" />
              </div>
            </div>
            <div className="form-group">
              <label>Correo Electrónico</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="tu@correo.com" />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', margin: '1.5rem 0' }}></div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Nombre de Usuario *</label>
              <div className="input-with-icon">
                <User size={18} />
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Ej: mgarcia" required />
              </div>
            </div>
            <div className="form-group">
              <label>Contraseña *</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" minLength={6} required />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>Confirmar Contraseña *</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repite tu contraseña" required />
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', margin: '1.5rem 0' }}></div>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <KeyRound size={18} color="#2563eb" /> Recuperación de Cuenta
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Elige dos preguntas secretas. Si olvidas tu contraseña, las necesitarás para recuperarla.</p>

          <div className="form-group">
            <label>Pregunta Secreta 1 *</label>
            <select name="preguntaSecreta1" className="inline-input" value={formData.preguntaSecreta1} onChange={handleChange} style={{ width: '100%', marginBottom: '0.5rem', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              {PREGUNTAS_SECRETAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="text" name="respuestaSecreta1" className="inline-input" value={formData.respuestaSecreta1} onChange={handleChange} placeholder="Tu respuesta a la pregunta 1" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} required />
          </div>

          <div className="form-group">
            <label>Pregunta Secreta 2 *</label>
            <select name="preguntaSecreta2" className="inline-input" value={formData.preguntaSecreta2} onChange={handleChange} style={{ width: '100%', marginBottom: '0.5rem', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              {PREGUNTAS_SECRETAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="text" name="respuestaSecreta2" className="inline-input" value={formData.respuestaSecreta2} onChange={handleChange} placeholder="Tu respuesta a la pregunta 2" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} required />
          </div>

          <button type="submit" className="login-button" disabled={loading} style={{ marginTop: '2rem' }}>
            {loading ? 'Procesando...' : 'Registrarme'}
          </button>
        </form>
      </div>
    </div>
  );
}
