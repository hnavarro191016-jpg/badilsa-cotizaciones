"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Check, Edit, History, Home, LogOut, Plus, Printer, Save, Trash2, UserPlus, Mail, MessageCircle, BarChart3, TrendingUp, DollarSign, Upload, FileText, Filter, PieChart, Users, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ActiveTab = 'inicio' | 'historial' | 'cotizacion' | 'usuarios' | 'reportes';
type Mode = 'new' | 'edit';

interface Item {
  id: string;
  cantidad: number;
  unidad: string;
  descripcion: string;
  precioUnitario: number;
  valorDolar: number;
  isEditing?: boolean;
}

interface CotizacionData {
  id?: string;
  folio: string;
  fecha: string;
  atencion: string;
  empresa: string;
  moneda: 'DOLARES' | 'PESOS';
  observaciones: string;
  tiempoEntrega: string;
  subTotal?: number;
  iva?: number;
  total?: number;
  items: Item[];
  createdAt?: string;
  updatedAt?: string;
  estatus?: string;
  estatusOC?: string;
  archivosOC?: any[];
}

interface UserData {
  id: string;
  username: string;
  role: 'ADMIN' | 'USER';
  createdAt?: string;
}

const todayInputValue = () => new Date().toISOString().slice(0, 10);

const formatNumber = (value: number) => new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(value || 0);

const HistorialDashboard = ({ historial }: { historial: any[] }) => {
  if (!historial || historial.length === 0) return null;

  const total = historial.length;
  const totalMXN = historial.filter(c => c.moneda === 'PESOS' || c.moneda === 'MXN').reduce((sum, c) => sum + (Number(c.total) || 0), 0);
  const totalUSD = historial.filter(c => c.moneda === 'DOLARES' || c.moneda === 'USD').reduce((sum, c) => sum + (Number(c.total) || 0), 0);

  const countMXN = historial.filter(c => c.moneda === 'PESOS' || c.moneda === 'MXN').length;
  const countUSD = historial.filter(c => c.moneda === 'DOLARES' || c.moneda === 'USD').length;

  const promedioMXN = countMXN > 0 ? totalMXN / countMXN : 0;
  const promedioUSD = countUSD > 0 ? totalUSD / countUSD : 0;

  const conOC = historial.filter(c => c.estatusOC === 'RECIBIDA' || c.estatusOC === 'VALIDADA').length;
  const conversion = total > 0 ? ((conOC / total) * 100).toFixed(1) : '0.0';

  return (
    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <BarChart3 size={24} color="#0284c7" />
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Resumen General del Historial</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Cotizaciones Generadas</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginTop: '0.25rem' }}>{total}</div>
        </div>

        <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '0.75rem', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 'bold', textTransform: 'uppercase' }}>Ingreso Total Estimado (MXN)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#15803d', marginTop: '0.25rem' }}>${formatNumber(totalMXN)}</div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>Ticket Promedio: ${formatNumber(promedioMXN)}</div>
        </div>

        <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: '0.75rem', border: '1px solid #bae6fd' }}>
          <div style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 'bold', textTransform: 'uppercase' }}>Ingreso Total Estimado (USD)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0369a1', marginTop: '0.25rem' }}>${formatNumber(totalUSD)}</div>
          <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '0.25rem' }}>Ticket Promedio: ${formatNumber(promedioUSD)}</div>
        </div>

        <div style={{ padding: '1rem', background: '#eef2ff', borderRadius: '0.75rem', border: '1px solid #c7d2fe' }}>
          <div style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: 'bold', textTransform: 'uppercase' }}>Tasa de Conversión a OC</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#4338ca', marginTop: '0.25rem' }}>{conversion}%</div>
          <div style={{ fontSize: '0.75rem', color: '#4f46e5', marginTop: '0.25rem' }}>{conOC} cotizaciones con Orden de Compra</div>
        </div>
      </div>
    </div>
  );
};

const EstatusOCDashboard = ({ historial }: { historial: any[] }) => {
  const pendientes = historial.filter((c) => !c.estatusOC || c.estatusOC === 'PENDIENTE');
  const recibidas = historial.filter((c) => c.estatusOC === 'RECIBIDA' || c.estatusOC === 'VALIDADA'); // Incluimos VALIDADA por compatibilidad con historico

  return (
    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(to right bottom, #ffffff, #f8fafc)', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Check size={24} color="#16a34a" />
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Dashboard Estatus Órdenes de Compra</h3>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {/* PENDIENTE */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', borderLeft: '5px solid #eab308', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#eab308', textTransform: 'uppercase', marginBottom: '0.5rem' }}>🟡 Falta OC (Pendiente)</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#334155', lineHeight: 1 }}>{pendientes.length}</div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', lineHeight: 1.4 }}>Cotizaciones esperando que el cliente mande su OC.</p>
        </div>

        {/* RECIBIDA */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', borderLeft: '5px solid #16a34a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#16a34a', textTransform: 'uppercase', marginBottom: '0.5rem' }}>🟢 OC Recibida (Completada)</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#334155', lineHeight: 1 }}>{recibidas.length}</div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', lineHeight: 1.4 }}>Cotizaciones cerradas y con orden de compra.</p>
        </div>
      </div>
    </div>
  );
};

const emptyItem = (): Item => ({
  id: Date.now().toString(),
  cantidad: 1,
  unidad: 'pzas',
  descripcion: '',
  precioUnitario: 0,
  valorDolar: 1,
  isEditing: true,
});

export default function CotizacionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');
  const [mode, setMode] = useState<Mode>('new');
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  const [currentCotizacionId, setCurrentCotizacionId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingOCFor, setUploadingOCFor] = useState<string | null>(null);

  const [folio, setFolio] = useState('');
  const [fecha, setFecha] = useState(todayInputValue());
  const [atencion, setAtencion] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [moneda, setMoneda] = useState<'DOLARES' | 'PESOS'>('DOLARES');
  const [observaciones, setObservaciones] = useState('');
  const [tiempoEntrega, setTiempoEntrega] = useState('30 dias');
  const [items, setItems] = useState<Item[]>([emptyItem()]);

  const [historial, setHistorial] = useState<CotizacionData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [reportFilters, setReportFilters] = useState({ fechaInicio: '', fechaFin: '', empresa: '' });
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'USER'>('USER');

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const subTotal = useMemo(
    () => items.reduce((acc, item) => acc + item.cantidad * item.precioUnitario * (item.valorDolar || 1), 0),
    [items]
  );
  const iva = subTotal * 0.16;
  const total = subTotal + iva;

  useEffect(() => {
    fetchCurrentUser();
    fetchHistorial();
  }, []);

  useEffect(() => {
    if (activeTab === 'reportes') {
      fetchReportes();
    }
  }, [activeTab]);

  const fetchReportes = async () => {
    try {
      const params = new URLSearchParams();
      if (reportFilters.fechaInicio) params.append('fechaInicio', reportFilters.fechaInicio);
      if (reportFilters.fechaFin) params.append('fechaFin', reportFilters.fechaFin);
      if (reportFilters.empresa) params.append('empresa', reportFilters.empresa);

      const res = await fetch(`/api/reportes?${params.toString()}`);
      if (res.ok) {
        setReportData(await res.json());
      }
    } catch (e) {
      showError('Error al cargar reportes');
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') fetchUsers();
  }, [currentUser]);

  const showMessage = (text: string) => {
    setError('');
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3000);
  };

  const showError = (text: string) => {
    setMessage('');
    setError(text);
  };

  const fetchCurrentUser = async () => {
    const res = await fetch('/api/auth/me');
    if (res.ok) setCurrentUser(await res.json());
  };

  const fetchHistorial = async () => {
    const res = await fetch('/api/cotizaciones');
    if (res.ok) setHistorial(await res.json());
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    if (res.ok) setUsers(await res.json());
  };

  const fetchNextFolio = async () => {
    const res = await fetch('/api/cotizaciones/next-folio');
    if (!res.ok) {
      showError('No se pudo generar el folio.');
      return '';
    }

    const data = await res.json();
    return data.folio || '';
  };

  const startNewCotizacion = async () => {
    const nextFolio = await fetchNextFolio();
    setMode('new');
    setFolio(nextFolio);
    setFecha(todayInputValue());
    setAtencion('');
    setEmpresa('');
    setMoneda('DOLARES');
    setObservaciones('');
    setTiempoEntrega('30 dias');
    setItems([emptyItem()]);
    setCurrentCotizacionId(null);
    setActiveTab('cotizacion');
  };

  const loadCotizacion = (cotizacion: CotizacionData) => {
    setMode('edit');
    setFolio(cotizacion.folio);
    setFecha(cotizacion.fecha);
    setAtencion(cotizacion.atencion);
    setEmpresa(cotizacion.empresa);
    setMoneda(cotizacion.moneda);
    setObservaciones(cotizacion.observaciones);
    setTiempoEntrega(cotizacion.tiempoEntrega);
    setItems(cotizacion.items.map((item) => ({ ...item, valorDolar: item.valorDolar || 1, isEditing: false })));
    setCurrentCotizacionId(cotizacion.id || null);
    setActiveTab('cotizacion');
  };

  const handleUploadClick = (cotizacionId: string) => {
    setUploadingOCFor(cotizacionId);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingOCFor) return;

    if (file.type !== 'application/pdf') {
      showError('Solo se permiten archivos PDF.');
      return;
    }

    setIsSaving(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result;
      try {
        const res = await fetch('/api/ordenes-compra/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cotizacionId: uploadingOCFor,
            nombreArchivo: file.name,
            fileData: base64
          })
        });
        if (res.ok) {
          showMessage('Orden de Compra subida con éxito.');
          await fetchHistorial();
        } else {
          showError('Error al subir archivo.');
        }
      } catch {
        showError('Error de red al subir archivo.');
      } finally {
        setIsSaving(false);
        setUploadingOCFor(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const openOC = (base64Data: string) => {
    const pdfWindow = window.open("");
    if (pdfWindow) {
      pdfWindow.document.write(`<iframe width='100%' height='100%' style='border:none;' src='${base64Data}'></iframe>`);
    }
  };

  const updateEstatusOC = async (cotizacionId: string, estatusOC: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/ordenes-compra/${cotizacionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estatusOC })
      });
      if (res.ok) {
        showMessage('Estatus OC actualizado.');
        await fetchHistorial();
      } else {
        showError('Error al actualizar estatus OC.');
      }
    } catch {
      showError('Error de red.');
    } finally {
      setIsSaving(false);
    }
  };



  const saveCotizacion = async () => {
    setIsSaving(true);
    setError('');

    const payload: CotizacionData = {
      folio,
      fecha,
      atencion,
      empresa,
      moneda,
      observaciones,
      tiempoEntrega,
      items: items.map(({ isEditing, ...rest }) => rest as Item),
    };

    try {
      const res = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        showError(data.error || 'No se pudo guardar la cotizacion.');
        return;
      }

      await fetchHistorial();
      showMessage(mode === 'new' ? 'Cotizacion guardada.' : 'Cotizacion actualizada.');
      setMode('edit');
    } catch {
      showError('Error de conexion al guardar.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCotizacion = async (cotizacion: CotizacionData) => {
    if (!window.confirm(`Eliminar la cotizacion ${cotizacion.folio}?`)) return;

    const res = await fetch(`/api/cotizaciones?folio=${encodeURIComponent(cotizacion.folio)}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const data = await res.json();
      showError(data.error || 'No se pudo eliminar la cotizacion.');
      return;
    }

    await fetchHistorial();
    showMessage('Cotizacion eliminada.');
    if (folio === cotizacion.folio) startNewCotizacion();
  };

  const addItem = () => setItems((current) => [
    ...current.map(item => ({ ...item, isEditing: false })), 
    emptyItem()
  ]);
  const removeItem = (id: string) => setItems((current) => current.filter((item) => item.id !== id));

  const toggleEditItem = (id: string) => setItems((current) => current.map((item) => (
    item.id === id ? { ...item, isEditing: !item.isEditing } : item
  )));

  const updateItem = (id: string, field: keyof Item, value: string | number) => {
    setItems((current) => current.map((item) => (
      item.id === id ? { ...item, [field]: value } : item
    )));
  };

  const createUser = async (event: React.FormEvent) => {
    event.preventDefault();
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole }),
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'No se pudo crear el usuario.');
      return;
    }

    setNewUsername('');
    setNewPassword('');
    setNewRole('USER');
    await fetchUsers();
    showMessage('Usuario creado.');
  };

  const deleteUser = async (user: UserData) => {
    if (!window.confirm(`Eliminar el usuario ${user.username}?`)) return;

    const res = await fetch(`/api/users?id=${encodeURIComponent(user.id)}`, { method: 'DELETE' });
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'No se pudo eliminar el usuario.');
      return;
    }

    await fetchUsers();
    showMessage('Usuario eliminado.');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  };

  const handleSendWhatsApp = () => {
    if (!currentCotizacionId) {
      showError('Por favor guarda la cotización primero para generar un enlace.');
      return;
    }
    const publicUrl = `${window.location.origin}/cotizacion/ver/${currentCotizacionId}`;
    const text = `Hola, te comparto la cotización ${folio} por un total de ${moneda === 'DOLARES' ? 'USD' : 'MXN'} $${formatNumber(total)}.\n\nPuedes verla y descargar el PDF aquí:\n${publicUrl}\n\nQuedo a tus órdenes.`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSendEmail = () => {
    if (!currentCotizacionId) {
      showError('Por favor guarda la cotización primero para generar un enlace.');
      return;
    }
    const publicUrl = `${window.location.origin}/cotizacion/ver/${currentCotizacionId}`;
    const subject = `Cotización ${folio} - Badilsa`;
    const body = `Hola,\n\nTe comparto la cotización ${folio} por un total de ${moneda === 'DOLARES' ? 'USD' : 'MXN'} $${formatNumber(total)}.\n\nPuedes verla y descargar el PDF directamente en el siguiente enlace:\n${publicUrl}\n\nQuedo a tus órdenes.\n\nSaludos.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = folio || 'Cotizacion';
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 100);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T12:00:00');
    if (isNaN(date.getTime())) return dateString;
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`;
  };

  return (
    <div className="app-container">
      <div className="toolbar no-print">
        <div className="toolbar-content">
          <h1 className="text-xl font-bold">Badilsa Cotizaciones</h1>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={handleLogout} style={{ color: '#ef4444', borderColor: '#ef4444' }}>
              <LogOut size={18} /> Salir
            </button>
            {activeTab === 'cotizacion' && (
              <button className="btn btn-outline" onClick={handlePrint}>
                <Printer size={18} /> Imprimir PDF
              </button>
            )}
            {activeTab === 'cotizacion' && currentCotizacionId && (
              <>
                <button className="btn btn-outline" onClick={handleSendWhatsApp} style={{ color: '#16a34a', borderColor: '#16a34a' }} title="Compartir texto por WhatsApp">
                  <MessageCircle size={18} /> WhatsApp
                </button>
                <button className="btn btn-outline" onClick={handleSendEmail} style={{ color: '#2563eb', borderColor: '#2563eb' }} title="Compartir texto por Correo">
                  <Mail size={18} /> Correo
                </button>
              </>
            )}
            {activeTab === 'cotizacion' && (
              <button className="btn btn-primary" onClick={saveCotizacion} disabled={isSaving}>
                {message ? <Check size={18} /> : <Save size={18} />}
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="main-shell no-print">
        <div className="tabs">
          <button className={`tab-button ${activeTab === 'inicio' ? 'active' : ''}`} onClick={() => setActiveTab('inicio')}>
            <Home size={18} /> Inicio
          </button>
          <button className={`tab-button ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => setActiveTab('historial')}>
            <History size={18} /> Historial
          </button>
          <button className={`tab-button ${activeTab === 'cotizacion' ? 'active' : ''}`} onClick={startNewCotizacion}>
            <Plus size={18} /> Generar Nueva Cotizacion
          </button>
          <button className={`tab-button ${activeTab === 'reportes' ? 'active' : ''}`} onClick={() => setActiveTab('reportes')}>
            <PieChart size={18} /> Reportes
          </button>
          {currentUser?.role === 'ADMIN' && (
            <button className={`tab-button ${activeTab === 'usuarios' ? 'active' : ''}`} onClick={() => setActiveTab('usuarios')}>
              <UserPlus size={18} /> Usuarios
            </button>
          )}
        </div>

        {(message || error) && (
          <div className={`status-message ${error ? 'error' : 'success'}`}>
            {error || message}
          </div>
        )}
      </div>

      {activeTab === 'inicio' && (
        <section className="panel-page no-print" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
          <img src="/logo.png" alt="Badilsa Logo" style={{ maxWidth: '350px', marginBottom: '2rem' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>Sistema de Cotizaciones Badilsa</h1>
          <p style={{ fontSize: '1.1rem', color: '#475569', maxWidth: '800px', lineHeight: '1.6' }}>
            Bienvenido a la plataforma integral de cotizaciones de Badilsa. Esta herramienta está diseñada para optimizar y agilizar el proceso de creación, gestión y seguimiento de propuestas comerciales. Podrá generar documentos profesionales, mantener un historial organizado de las ofertas enviadas a sus clientes y gestionar los accesos de manera segura.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={startNewCotizacion}>
              <Plus size={18} /> Generar Cotizacion
            </button>
            <button className="btn btn-outline" onClick={() => setActiveTab('historial')}>
              <History size={18} /> Ver Historial
            </button>
          </div>
        </section>
      )}

      {activeTab === 'historial' && (
        <section className="panel-page no-print">
          <HistorialDashboard historial={historial} />

          <EstatusOCDashboard historial={historial} />

          <div className="panel-header">
            <div>
              <h2>Cotizaciones Pendientes</h2>
              <p>{historial.filter((c) => !c.estatusOC || c.estatusOC === 'PENDIENTE').length} cotizaciones en espera de OC</p>
            </div>
            <button className="btn btn-primary" onClick={startNewCotizacion}>
              <Plus size={18} /> Nueva Cotizacion
            </button>
          </div>

          <div className="history-table">
            {historial.filter((c) => !c.estatusOC || c.estatusOC === 'PENDIENTE').length === 0 ? (
              <div className="empty-state">No hay cotizaciones pendientes.</div>
            ) : (
              historial.filter((c) => !c.estatusOC || c.estatusOC === 'PENDIENTE').map((cotizacion) => (
                <div className="history-row" key={cotizacion.folio}>
                  <div>
                    <div className="font-bold" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {cotizacion.folio}
                      <select
                        value={cotizacion.estatusOC || 'PENDIENTE'}
                        onChange={(e) => updateEstatusOC(cotizacion.id!, e.target.value)}
                        style={{ fontSize: '0.75rem', padding: '2px 4px', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer', outline: 'none' }}
                        title="Estatus de Orden de Compra"
                      >
                        <option value="PENDIENTE">🟡 Pendiente OC</option>
                        <option value="RECIBIDA">🟢 OC Recibida</option>
                      </select>
                    </div>
                    <div className="text-sm text-gray">{cotizacion.empresa} - {formatDisplayDate(cotizacion.fecha)}</div>
                  </div>
                  <div className="history-total">{cotizacion.moneda === 'DOLARES' ? 'USD' : 'MXN'} ${formatNumber(cotizacion.total || 0)}</div>
                  <div className="history-actions" style={{ flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => loadCotizacion(cotizacion)}>
                        <Edit size={16} /> Modificar
                      </button>
                      <button className="btn btn-outline danger-outline" style={{ padding: '4px 8px' }} onClick={() => deleteCotizacion(cotizacion)}>
                        <Trash2 size={16} /> Eliminar
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-outline" style={{ padding: '4px 8px', color: '#2563eb', borderColor: '#2563eb' }} onClick={() => window.open(`/cotizacion/ver/${cotizacion.id}`, '_blank')}>
                        <FileText size={16} /> Ver PDF
                      </button>
                      {cotizacion.archivosOC && cotizacion.archivosOC.length > 0 ? (
                        <button className="btn btn-outline" style={{ padding: '4px 8px', color: '#16a34a', borderColor: '#16a34a' }} onClick={() => openOC(cotizacion.archivosOC![0].fileData)}>
                          <FileText size={16} /> Ver OC
                        </button>
                      ) : (
                        <button className="btn btn-outline" style={{ padding: '4px 8px', color: '#0ea5e9', borderColor: '#0ea5e9' }} onClick={() => handleUploadClick(cotizacion.id!)}>
                          <Upload size={16} /> Subir OC
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="panel-header" style={{ marginTop: '2rem' }}>
            <div>
              <h2>Cotizaciones Completadas</h2>
              <p>{historial.filter((c) => c.estatusOC === 'RECIBIDA' || c.estatusOC === 'VALIDADA').length} cotizaciones con OC recibida</p>
            </div>
          </div>

          <div className="history-table">
            {historial.filter((c) => c.estatusOC === 'RECIBIDA' || c.estatusOC === 'VALIDADA').length === 0 ? (
              <div className="empty-state">No hay cotizaciones completadas.</div>
            ) : (
              historial.filter((c) => c.estatusOC === 'RECIBIDA' || c.estatusOC === 'VALIDADA').map((cotizacion) => (
                <div className="history-row" key={cotizacion.folio}>
                  <div>
                    <div className="font-bold" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {cotizacion.folio}
                      <select
                        value={cotizacion.estatusOC === 'VALIDADA' ? 'RECIBIDA' : cotizacion.estatusOC}
                        onChange={(e) => updateEstatusOC(cotizacion.id!, e.target.value)}
                        style={{ fontSize: '0.75rem', padding: '2px 4px', borderRadius: '4px', border: '1px solid #16a34a', cursor: 'pointer', outline: 'none', color: '#16a34a', fontWeight: 'bold' }}
                        title="Estatus de Orden de Compra"
                      >
                        <option value="PENDIENTE">🟡 Pendiente OC</option>
                        <option value="RECIBIDA">🟢 OC Recibida</option>
                      </select>
                    </div>
                    <div className="text-sm text-gray">{cotizacion.empresa} - {formatDisplayDate(cotizacion.fecha)}</div>
                  </div>
                  <div className="history-total">{cotizacion.moneda === 'DOLARES' ? 'USD' : 'MXN'} ${formatNumber(cotizacion.total || 0)}</div>
                  <div className="history-actions" style={{ flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => loadCotizacion(cotizacion)}>
                        <Edit size={16} /> Modificar
                      </button>
                      <button className="btn btn-outline danger-outline" style={{ padding: '4px 8px' }} onClick={() => deleteCotizacion(cotizacion)}>
                        <Trash2 size={16} /> Eliminar
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-outline" style={{ padding: '4px 8px', color: '#2563eb', borderColor: '#2563eb' }} onClick={() => window.open(`/cotizacion/ver/${cotizacion.id}`, '_blank')}>
                        <FileText size={16} /> Ver PDF
                      </button>
                      {cotizacion.archivosOC && cotizacion.archivosOC.length > 0 ? (
                        <button className="btn btn-outline" style={{ padding: '4px 8px', color: '#16a34a', borderColor: '#16a34a' }} onClick={() => openOC(cotizacion.archivosOC![0].fileData)}>
                          <FileText size={16} /> Ver OC
                        </button>
                      ) : (
                        <button className="btn btn-outline" style={{ padding: '4px 8px', color: '#0ea5e9', borderColor: '#0ea5e9' }} onClick={() => handleUploadClick(cotizacion.id!)}>
                          <Upload size={16} /> Subir OC
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </section>
      )}

      {activeTab === 'reportes' && (
        <section className="panel-page no-print">
          <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2>Módulo de Reportes</h2>
              <p>Análisis de cotizaciones, órdenes de compra y conversión.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <Filter size={16} color="#64748b" />
                <input type="date" className="inline-input" style={{ padding: '2px', fontSize: '0.875rem' }} value={reportFilters.fechaInicio} onChange={(e) => setReportFilters({...reportFilters, fechaInicio: e.target.value})} title="Fecha Inicio" />
                <span style={{ color: '#64748b' }}>-</span>
                <input type="date" className="inline-input" style={{ padding: '2px', fontSize: '0.875rem' }} value={reportFilters.fechaFin} onChange={(e) => setReportFilters({...reportFilters, fechaFin: e.target.value})} title="Fecha Fin" />
              </div>
              <input type="text" className="inline-input" placeholder="Filtrar por Cliente..." style={{ padding: '0.5rem', fontSize: '0.875rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} value={reportFilters.empresa} onChange={(e) => setReportFilters({...reportFilters, empresa: e.target.value})} />
              <button className="btn btn-primary" onClick={fetchReportes}>Aplicar Filtros</button>
            </div>
          </div>

          {!reportData ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Cargando reportes...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* KPIs Principales */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Cotizaciones</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>{reportData.resumen.totalCotizaciones}</div>
                  <div style={{ fontSize: '0.875rem', color: '#16a34a', marginTop: '0.5rem', fontWeight: '500' }}>
                    MXN: ${formatNumber(reportData.resumen.montoTotalCotizadoMXN)} <br/>
                    USD: ${formatNumber(reportData.resumen.montoTotalCotizadoUSD)}
                  </div>
                </div>
                
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Órdenes de Compra</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0369a1' }}>{reportData.resumen.totalOrdenes}</div>
                  <div style={{ fontSize: '0.875rem', color: '#0369a1', marginTop: '0.5rem', fontWeight: '500' }}>
                    MXN: ${formatNumber(reportData.resumen.montoTotalOrdenesMXN)} <br/>
                    USD: ${formatNumber(reportData.resumen.montoTotalOrdenesUSD)}
                  </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', padding: '1.5rem', borderRadius: '1rem', color: 'white', boxShadow: '0 10px 15px -3px rgba(79,70,229,0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.9 }}>Tasa de Conversión</div>
                    <Target size={20} style={{ opacity: 0.8 }} />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '800' }}>{reportData.resumen.conversionPorcentaje}%</div>
                  <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.9 }}>{reportData.resumen.cotizacionesSinOC} cotizaciones sin OC</div>
                </div>
              </div>

              {/* Clientes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DollarSign size={18} color="#16a34a" /> Top 5 Clientes por Monto</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {reportData.clientes.topMonto.length === 0 && <p className="text-gray text-sm">No hay datos</p>}
                    {reportData.clientes.topMonto.map((c: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                        <span style={{ fontWeight: '500', color: '#334155' }}>{c.nombre || 'Desconocido'}</span>
                        <div style={{ textAlign: 'right' }}>
                          {c.montoMXN > 0 && <div style={{ fontWeight: 'bold', color: '#16a34a', fontSize: '0.85rem' }}>MXN ${formatNumber(c.montoMXN)}</div>}
                          {c.montoUSD > 0 && <div style={{ fontWeight: 'bold', color: '#0284c7', fontSize: '0.85rem' }}>USD ${formatNumber(c.montoUSD)}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} color="#0284c7" /> Top 5 Clientes por Volumen</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {reportData.clientes.topCotizaciones.length === 0 && <p className="text-gray text-sm">No hay datos</p>}
                    {reportData.clientes.topCotizaciones.map((c: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                        <span style={{ fontWeight: '500', color: '#334155' }}>{c.nombre || 'Desconocido'}</span>
                        <span style={{ fontWeight: 'bold', color: '#0284c7' }}>{c.cantidad} cotizaciones</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === 'usuarios' && currentUser?.role === 'ADMIN' && (
        <section className="panel-page no-print">
          <div className="panel-header">
            <div>
              <h2>Usuarios</h2>
              <p>Solo administradores pueden crear o eliminar usuarios.</p>
            </div>
          </div>

          <form className="user-form" onSubmit={createUser}>
            <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Usuario" required />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Contrasena" required />
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as 'ADMIN' | 'USER')}>
              <option value="USER">Cotizador</option>
              <option value="ADMIN">Administrador</option>
            </select>
            <button className="btn btn-primary" type="submit">
              <UserPlus size={18} /> Crear Usuario
            </button>
          </form>

          <div className="history-table">
            {users.map((user) => (
              <div className="history-row" key={user.id}>
                <div>
                  <div className="font-bold">{user.username}</div>
                  <div className="text-sm text-gray">{user.role === 'ADMIN' ? 'Administrador' : 'Cotizador'}</div>
                </div>
                <div className="history-actions">
                  <button className="btn btn-outline danger-outline" onClick={() => deleteUser(user)} disabled={user.id === currentUser.id}>
                    <Trash2 size={16} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'cotizacion' && (
        <div className="document-page">
          <div className="doc-header">
            <div className="doc-folio-box">
              Cotizacion
              <input
                className="inline-input folio-input"
                value={folio}
                readOnly
                style={{ width: '280px', marginLeft: '10px' }}
              />
              <span className="no-print mode-label">{mode === 'new' ? 'Nueva' : 'Editando'}</span>
            </div>
            <div className="doc-logo">
              <img src="/logo.png" alt="Badilsa Logo" style={{ maxWidth: '250px', height: 'auto' }} />
            </div>
          </div>

          <div className="doc-company-info">
            <div className="text-sm" style={{ color: '#333' }}>
              <strong>BAAR361013-TU3</strong><br />
              Carretera AguaFria Km 1.5 Apodaca,NL.<br />
              CP 66620<br />
              <span style={{ color: '#2563eb' }}>
                ventas@mymdelnorte.com<br />
                ventas@badilsa.com
              </span>
            </div>
          </div>

          <div className="doc-meta-blocks">
            <div className="meta-block attention-block">
              <div className="flex items-center gap-2">
                <span style={{ width: '65px' }}>Atencion:</span>
                <input className="inline-input" value={atencion} onChange={(e) => setAtencion(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span style={{ width: '65px' }}>Empresa:</span>
                <input className="inline-input" value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
              </div>
            </div>
            <div className="meta-block date-block">
              <span>fecha</span>
              <input
                type="date"
                className="inline-input no-print"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                style={{ marginLeft: '10px', width: '120px' }}
              />
              <span className="print-only" style={{ marginLeft: '10px' }}>{formatDisplayDate(fecha)}</span>
            </div>
          </div>

          <p className="text-sm mb-4" style={{ marginTop: '1rem' }}>
            Atencion a su solicitud, me permito enviarle la cotizacion correspondiente al servicio de su interes.
          </p>

          <div className="table-container">
            <table className="doc-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Cant.</th>
                  <th style={{ width: '80px' }}>Unidad</th>
                  <th>Descripcion</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>Precio Unit.</th>
                  <th className="no-print" style={{ width: '95px', textAlign: 'right' }}>Valor Dolar</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>Total</th>
                  <th className="no-print" style={{ width: '65px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                    <td className="text-center" style={{ verticalAlign: 'top', paddingTop: '0.5rem' }}>
                      {item.isEditing ? (
                        <>
                          <input type="number" className="inline-input text-center no-print" value={item.cantidad} onChange={(e) => updateItem(item.id, 'cantidad', parseFloat(e.target.value) || 0)} />
                          <span className="print-only">{item.cantidad}</span>
                        </>
                      ) : (
                        <span>{item.cantidad}</span>
                      )}
                    </td>
                    <td className="text-center" style={{ verticalAlign: 'top', paddingTop: '0.5rem' }}>
                      {item.isEditing ? (
                        <>
                          <input className="inline-input text-center no-print" value={item.unidad} onChange={(e) => updateItem(item.id, 'unidad', e.target.value)} />
                          <span className="print-only">{item.unidad}</span>
                        </>
                      ) : (
                        <span>{item.unidad}</span>
                      )}
                    </td>
                    <td style={{ verticalAlign: 'top', paddingTop: '0.5rem' }}>
                      {item.isEditing ? (
                        <>
                          <textarea
                            className="inline-input no-print"
                            value={item.descripcion}
                            onChange={(e) => updateItem(item.id, 'descripcion', e.target.value)}
                            placeholder="Escriba aqui..."
                            rows={2}
                            style={{ width: '100%', resize: 'vertical' }}
                          />
                          <div className="print-only" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.descripcion}</div>
                        </>
                      ) : (
                        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.descripcion}</div>
                      )}
                    </td>
                    <td className="text-right" style={{ verticalAlign: 'top', paddingTop: '0.5rem' }}>
                      {item.isEditing ? (
                        <>
                          <span className="currency-prefix no-print">$</span>
                          <input type="number" className="inline-input text-right no-print" value={item.precioUnitario} onChange={(e) => updateItem(item.id, 'precioUnitario', parseFloat(e.target.value) || 0)} style={{ width: '70px' }} />
                          <span className="print-only">$ {formatNumber(item.precioUnitario)}</span>
                        </>
                      ) : (
                        <span>$ {formatNumber(item.precioUnitario)}</span>
                      )}
                    </td>
                    <td className="no-print text-right" style={{ verticalAlign: 'top', paddingTop: '0.5rem' }}>
                      {item.isEditing ? (
                        <input type="number" className="inline-input text-right" value={item.valorDolar} onChange={(e) => updateItem(item.id, 'valorDolar', parseFloat(e.target.value) || 1)} style={{ width: '70px' }} />
                      ) : (
                        <span>{item.valorDolar}</span>
                      )}
                    </td>
                    <td className="text-right" style={{ paddingRight: '0.5rem', verticalAlign: 'top', paddingTop: '0.5rem' }}>
                      $ {formatNumber(item.cantidad * item.precioUnitario * (item.valorDolar || 1))}
                    </td>
                    <td className="no-print text-center" style={{ verticalAlign: 'top', paddingTop: '0.25rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.3rem', marginRight: '0.25rem', borderColor: 'transparent', minWidth: 'auto' }} onClick={() => toggleEditItem(item.id)} title={item.isEditing ? "Guardar Concepto" : "Modificar Concepto"}>
                        {item.isEditing ? <Check size={16} style={{ color: '#16a34a' }} /> : <Edit size={16} style={{ color: '#2563eb' }} />}
                      </button>
                      <button className="text-danger btn btn-outline" style={{ padding: '0.3rem', borderColor: 'transparent', minWidth: 'auto' }} onClick={() => removeItem(item.id)} title="Eliminar Concepto">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="no-print" style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #cbd5e1' }}>
              <button className="btn btn-outline text-sm" onClick={addItem}><Plus size={16} /> Agregar Concepto</button>
            </div>
          </div>

          <div className="doc-footer">
            <div className="obs-block">
              <div className="text-sm font-bold mb-1">OBSERVACIONES :</div>
              <textarea
                className="inline-input"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
                style={{ width: '100%', resize: 'none', background: 'transparent' }}
              />
            </div>
            <div className="totals-block">
              <div className="total-row">
                <span className="total-label blue-bg">Sub-Total</span>
                <span className="total-value">$ {formatNumber(subTotal)}</span>
              </div>
              <div className="total-row">
                <span className="total-label"></span>
                <span className="total-value">$ {formatNumber(iva)}</span>
              </div>
              <div className="total-row">
                <span className="total-label blue-bg">Total</span>
                <span className="total-value font-bold">$ {formatNumber(total)}</span>
              </div>
            </div>
          </div>

          <div className="doc-terms">
            <p className="font-bold">Precios en <select className="inline-input font-bold no-print" value={moneda} onChange={(e) => setMoneda(e.target.value as 'DOLARES' | 'PESOS')} style={{ width: '100px' }}>
              <option value="DOLARES">DOLARES</option>
              <option value="PESOS">PESOS</option>
            </select>
              <span className="print-only">{moneda}</span>
            </p>
            <p>Esperamos su orden de compra para programacion de fabricacion acorde al tiempo de entrega</p>
            <p>Dias de entrega<br />
              <input className="inline-input font-medium no-print delivery-input" value={tiempoEntrega} onChange={(e) => setTiempoEntrega(e.target.value)} placeholder="Ej. 15 dias" />
              <span className="print-only">{tiempoEntrega}</span>
            </p>
            <p className="text-center" style={{ color: '#2563eb', marginTop: '1.5rem', textDecoration: 'underline' }}>www.badilsa.com</p>
          </div>
        </div>
      )}
    </div>
  );
}
