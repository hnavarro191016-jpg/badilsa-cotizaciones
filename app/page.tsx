"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useState } from 'react';
import { Check, Edit, History, Home, LogOut, Plus, Printer, Save, Trash2, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ActiveTab = 'inicio' | 'historial' | 'cotizacion' | 'usuarios' | 'ordenes' | 'ver_orden';
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
  ordenCompra?: {
    folio_oc: string;
    estatus: string;
  };
}

interface OrdenCompraData {
  id: string;
  folio_oc: string;
  fecha: string;
  total: number;
  estatus: string;
  cotizacion: CotizacionData;
}

interface UserData {
  id: string;
  username: string;
  role: 'ADMIN' | 'USER';
  createdAt?: string;
}

const todayInputValue = () => new Date().toISOString().slice(0, 10);

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
  const [currentCotizacionOC, setCurrentCotizacionOC] = useState<{folio_oc: string, estatus: string} | null>(null);
  const [currentOCParaVer, setCurrentOCParaVer] = useState<OrdenCompraData | null>(null);

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
  const [ordenes, setOrdenes] = useState<OrdenCompraData[]>([]);
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
    fetchOrdenes();
  }, []);

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

  const fetchOrdenes = async () => {
    const res = await fetch('/api/ordenes-compra');
    if (res.ok) setOrdenes(await res.json());
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
    setCurrentCotizacionOC(null);
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
    setCurrentCotizacionOC(cotizacion.ordenCompra || null);
    setActiveTab('cotizacion');
  };

  const loadOrdenCompra = (oc: OrdenCompraData) => {
    setCurrentOCParaVer(oc);
    setActiveTab('ver_orden');
  };

  const convertirAOrdenCompra = async () => {
    if (!currentCotizacionId) return;
    if (!window.confirm(`¿Convertir la cotización ${folio} en una Orden de Compra?`)) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/ordenes-compra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cotizacionId: currentCotizacionId })
      });
      const data = await res.json();
      
      if (!res.ok) {
        showError(data.error || 'Error al convertir a OC.');
        return;
      }

      showMessage('Orden de Compra generada.');
      setCurrentCotizacionOC(data.data); // data.data is the new OC
      await fetchHistorial();
      await fetchOrdenes();
    } catch {
      showError('Error de conexion al convertir.');
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

  const handlePrint = () => {
    const originalTitle = document.title;
    if (activeTab === 'ver_orden' && currentOCParaVer) {
      document.title = currentOCParaVer.folio_oc;
    } else {
      document.title = folio || 'Cotizacion';
    }
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 100);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: moneda === 'DOLARES' ? 'USD' : 'MXN',
  }).format(value);

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
            {(activeTab === 'cotizacion' || activeTab === 'ver_orden') && (
              <button className="btn btn-outline" onClick={handlePrint}>
                <Printer size={18} /> Imprimir PDF
              </button>
            )}
            {activeTab === 'cotizacion' && currentCotizacionId && !currentCotizacionOC && (
              <button className="btn btn-outline" onClick={convertirAOrdenCompra} disabled={isSaving} style={{ color: '#16a34a', borderColor: '#16a34a' }}>
                <Check size={18} /> Convertir a OC
              </button>
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
          <button className={`tab-button ${activeTab === 'ordenes' ? 'active' : ''}`} onClick={() => setActiveTab('ordenes')}>
            <History size={18} /> Órdenes de Compra
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
          <div className="panel-header">
            <div>
              <h2>Historial de Cotizaciones</h2>
              <p>{historial.length} cotizaciones guardadas</p>
            </div>
            <button className="btn btn-primary" onClick={startNewCotizacion}>
              <Plus size={18} /> Nueva Cotizacion
            </button>
          </div>

          <div className="history-table">
            {historial.length === 0 ? (
              <div className="empty-state">No hay cotizaciones guardadas.</div>
            ) : (
              historial.map((cotizacion) => (
                <div className="history-row" key={cotizacion.folio}>
                  <div>
                    <div className="font-bold">{cotizacion.folio}</div>
                    <div className="text-sm text-gray">{cotizacion.empresa} - {formatDisplayDate(cotizacion.fecha)}</div>
                  </div>
                  <div className="history-total">{cotizacion.moneda === 'DOLARES' ? 'USD' : 'MXN'} ${Number(cotizacion.total || 0).toFixed(2)}</div>
                  <div className="history-actions">
                    <button className="btn btn-outline" onClick={() => loadCotizacion(cotizacion)}>
                      <Edit size={16} /> Modificar
                    </button>
                    <button className="btn btn-outline danger-outline" onClick={() => deleteCotizacion(cotizacion)}>
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
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

      {activeTab === 'ordenes' && (
        <section className="panel-page no-print">
          <div className="panel-header">
            <div>
              <h2>Órdenes de Compra</h2>
              <p>{ordenes.length} órdenes generadas</p>
            </div>
          </div>

          <div className="history-table">
            {ordenes.length === 0 ? (
              <div className="empty-state">No hay órdenes de compra generadas.</div>
            ) : (
              ordenes.map((oc) => (
                <div className="history-row" key={oc.id}>
                  <div>
                    <div className="font-bold">{oc.folio_oc}</div>
                    <div className="text-sm text-gray">Cotización: {oc.cotizacion?.folio || 'N/A'} - {formatDisplayDate(oc.fecha?.split('T')[0] || '')}</div>
                  </div>
                  <div className="history-total" style={{ marginRight: '10px' }}>
                    <span style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', backgroundColor: '#e0f2fe', color: '#0369a1', marginRight: '1rem' }}>
                      {oc.estatus}
                    </span>
                    {oc.cotizacion?.moneda === 'DOLARES' ? 'USD' : 'MXN'} ${Number(oc.total || 0).toFixed(2)}
                  </div>
                  <div className="history-actions">
                    <button className="btn btn-outline" onClick={() => loadOrdenCompra(oc)}>
                      <Printer size={16} /> Ver OC
                    </button>
                    <button className="btn btn-outline" onClick={() => loadCotizacion(oc.cotizacion)}>
                      <History size={16} /> Ver Cotización
                    </button>
                  </div>
                </div>
              ))
            )}
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
              {currentCotizacionOC && (
                <div style={{ marginTop: '0.5rem', padding: '0.25rem 0.5rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '0.25rem', display: 'inline-block', fontSize: '0.875rem', fontWeight: 'bold' }}>
                  OC Generada: {currentCotizacionOC.folio_oc}
                </div>
              )}
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
                          <span className="print-only">$ {item.precioUnitario.toFixed(2)}</span>
                        </>
                      ) : (
                        <span>$ {item.precioUnitario.toFixed(2)}</span>
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
                      $ {formatCurrency(item.cantidad * item.precioUnitario * (item.valorDolar || 1)).replace('$', '').replace('MXN', '').replace('USD', '').trim()}
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
                <span className="total-value">$ {formatCurrency(subTotal).replace('$', '').replace('MXN', '').replace('USD', '').trim()}</span>
              </div>
              <div className="total-row">
                <span className="total-label"></span>
                <span className="total-value">$ {formatCurrency(iva).replace('$', '').replace('MXN', '').replace('USD', '').trim()}</span>
              </div>
              <div className="total-row">
                <span className="total-label blue-bg">Total</span>
                <span className="total-value font-bold">$ {formatCurrency(total).replace('$', '').replace('MXN', '').replace('USD', '').trim()}</span>
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

      {activeTab === 'ver_orden' && currentOCParaVer && (
        <div className="document-page">
          <div className="doc-header">
            <div className="doc-folio-box" style={{ borderColor: '#0369a1', color: '#0369a1' }}>
              Orden de Compra
              <input
                className="inline-input folio-input"
                value={currentOCParaVer.folio_oc}
                readOnly
                style={{ width: '280px', marginLeft: '10px', color: '#0369a1' }}
              />
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
                <span className="font-bold">{currentOCParaVer.cotizacion?.atencion}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span style={{ width: '65px' }}>Empresa:</span>
                <span className="font-bold">{currentOCParaVer.cotizacion?.empresa}</span>
              </div>
            </div>
            <div className="meta-block date-block">
              <span>fecha</span>
              <span style={{ marginLeft: '10px' }}>{formatDisplayDate(currentOCParaVer.fecha.split('T')[0])}</span>
            </div>
          </div>

          <p className="text-sm mb-4" style={{ marginTop: '1rem' }}>
            Confirmación de Orden de Compra para los siguientes servicios:
          </p>

          <div className="table-container">
            <table className="doc-table">
              <thead>
                <tr style={{ backgroundColor: '#e0f2fe' }}>
                  <th style={{ width: '60px' }}>Cant.</th>
                  <th style={{ width: '80px' }}>Unidad</th>
                  <th>Descripcion</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>Precio Unit.</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {currentOCParaVer.cotizacion?.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                    <td className="text-center" style={{ verticalAlign: 'top', paddingTop: '0.5rem' }}>{item.cantidad}</td>
                    <td className="text-center" style={{ verticalAlign: 'top', paddingTop: '0.5rem' }}>{item.unidad}</td>
                    <td style={{ verticalAlign: 'top', paddingTop: '0.5rem' }}>
                      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.descripcion}</div>
                    </td>
                    <td className="text-right" style={{ verticalAlign: 'top', paddingTop: '0.5rem' }}>
                      $ {item.precioUnitario.toFixed(2)}
                    </td>
                    <td className="text-right" style={{ paddingRight: '0.5rem', verticalAlign: 'top', paddingTop: '0.5rem' }}>
                      $ {formatCurrency(item.cantidad * item.precioUnitario * (item.valorDolar || 1)).replace('$', '').replace('MXN', '').replace('USD', '').trim()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="doc-footer">
            <div className="obs-block">
              <div className="text-sm font-bold mb-1">OBSERVACIONES :</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{currentOCParaVer.cotizacion?.observaciones}</div>
            </div>
            <div className="totals-block">
              <div className="total-row">
                <span className="total-label blue-bg">Sub-Total</span>
                <span className="total-value">$ {formatCurrency(currentOCParaVer.cotizacion?.subTotal || 0).replace('$', '').replace('MXN', '').replace('USD', '').trim()}</span>
              </div>
              <div className="total-row">
                <span className="total-label"></span>
                <span className="total-value">$ {formatCurrency(currentOCParaVer.cotizacion?.iva || 0).replace('$', '').replace('MXN', '').replace('USD', '').trim()}</span>
              </div>
              <div className="total-row">
                <span className="total-label blue-bg">Total</span>
                <span className="total-value font-bold">$ {formatCurrency(currentOCParaVer.total || 0).replace('$', '').replace('MXN', '').replace('USD', '').trim()}</span>
              </div>
            </div>
          </div>

          <div className="doc-terms">
            <p className="font-bold">Moneda: <span className="font-bold">{currentOCParaVer.cotizacion?.moneda}</span></p>
            <p>Tiempo de entrega acordado: <span className="font-medium">{currentOCParaVer.cotizacion?.tiempoEntrega}</span></p>
            <p className="text-center" style={{ color: '#2563eb', marginTop: '1.5rem', textDecoration: 'underline' }}>www.badilsa.com</p>
          </div>
        </div>
      )}
    </div>
  );
}
