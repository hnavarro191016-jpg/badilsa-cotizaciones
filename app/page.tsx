"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Check, Edit, History, Home, LogOut, Plus, Printer, Save, Trash2, UserPlus, Mail, MessageCircle, BarChart3, TrendingUp, DollarSign, Upload, FileText, Filter, PieChart, Users, Target, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

type ActiveTab = 'inicio' | 'historial' | 'cotizacion' | 'usuarios' | 'reportes' | 'remisiones' | 'facturacion';
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
  propuesta?: string;
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
  nombre?: string | null;
  apellido?: string | null;
  telefono?: string | null;
  email?: string | null;
  estatus?: string;
  createdAt?: string;
}

interface ItemNotaRemision {
  id: string;
  cantidad: number;
  descripcion: string;
  isEditing?: boolean;
}

interface NotaRemisionData {
  id?: string;
  folio: string;
  fecha: string;
  condiciones: string;
  cliente: string;
  direccion: string;
  ciudad: string;
  rfc: string;
  tel: string;
  lugarExp: string;
  cotizacionId?: string | null;
  cotizacion?: { folio: string } | null;
  items: ItemNotaRemision[];
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
  valorDolar: 0,
  isEditing: true,
});

const emptyItemRemision = (): ItemNotaRemision => ({
  id: Date.now().toString(),
  cantidad: 0,
  descripcion: '',
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
  const [propuesta, setPropuesta] = useState('');
  const [tiempoEntrega, setTiempoEntrega] = useState('30 dias');
  const [items, setItems] = useState<Item[]>([emptyItem()]);

  const [historial, setHistorial] = useState<CotizacionData[]>([]);
  const [historyFilterDate, setHistoryFilterDate] = useState('todas');
  const [historyFilterStatus, setHistoryFilterStatus] = useState('todos');

  const [users, setUsers] = useState<UserData[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [reportFilters, setReportFilters] = useState({ fechaInicio: '', fechaFin: '', empresa: '' });
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'USER'>('USER');
  const [newNombre, setNewNombre] = useState('');
  const [newApellido, setNewApellido] = useState('');
  const [newTelefono, setNewTelefono] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPasswordUpdate, setNewPasswordUpdate] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newRequiresPasswordChange, setNewRequiresPasswordChange] = useState(true);

  const [remisiones, setRemisiones] = useState<NotaRemisionData[]>([]);
  const [facturas, setFacturas] = useState<any[]>([]);
  const [isUploadingFactura, setIsUploadingFactura] = useState(false);
  const [remisionFolio, setRemisionFolio] = useState('');
  const [remisionFecha, setRemisionFecha] = useState(todayInputValue());
  const [remisionCondiciones, setRemisionCondiciones] = useState('14 DIAS');
  const [remisionCliente, setRemisionCliente] = useState('');
  const [remisionDireccion, setRemisionDireccion] = useState('');
  const [remisionCiudad, setRemisionCiudad] = useState('');
  const [remisionRfc, setRemisionRfc] = useState('');
  const [remisionTel, setRemisionTel] = useState('');
  const [remisionLugarExp, setRemisionLugarExp] = useState('Apodaca N.L.');
  const [remisionCotizacionId, setRemisionCotizacionId] = useState('');
  const [remisionItems, setRemisionItems] = useState<ItemNotaRemision[]>([emptyItemRemision()]);
  const [currentRemisionId, setCurrentRemisionId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const subTotal = useMemo(
    () => items.reduce((acc, item) => {
      const divisor = moneda === 'DOLARES' ? (item.valorDolar || 1) : 1;
      return acc + (item.cantidad * item.precioUnitario / divisor);
    }, 0),
    [items, moneda]
  );
  const iva = subTotal * 0.16;
  const total = subTotal + iva;

  const filteredHistorial = useMemo(() => {
    let result = historial;

    if (historyFilterStatus !== 'todos') {
      if (historyFilterStatus === 'PENDIENTE') {
        result = result.filter(c => !c.estatusOC || c.estatusOC === 'PENDIENTE');
      } else if (historyFilterStatus === 'RECIBIDA') {
        result = result.filter(c => c.estatusOC === 'RECIBIDA' || c.estatusOC === 'VALIDADA');
      }
    }

    if (historyFilterDate !== 'todas') {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      result = result.filter(c => {
        if (!c.fecha) return false;
        const [year, month, day] = c.fecha.split('-');
        const itemDate = new Date(Number(year), Number(month) - 1, Number(day));
        itemDate.setHours(0, 0, 0, 0);
        
        if (historyFilterDate === 'hoy') {
          return itemDate.getTime() === hoy.getTime();
        } else if (historyFilterDate === 'semana') {
          const diffTime = Math.abs(hoy.getTime() - itemDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        } else if (historyFilterDate === 'mes') {
          return itemDate.getMonth() === hoy.getMonth() && itemDate.getFullYear() === hoy.getFullYear();
        } else if (historyFilterDate === 'anio') {
          return itemDate.getFullYear() === hoy.getFullYear();
        }
        return true;
      });
    }

    return result;
  }, [historial, historyFilterDate, historyFilterStatus]);

  useEffect(() => {
    fetchCurrentUser();
    fetchHistorial();
    fetchRemisiones();
  }, []);

  useEffect(() => {
    if (activeTab === 'reportes') {
      fetchReportes();
    }
    if (activeTab === 'facturacion') {
      fetchFacturas();
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
    if (res.ok) {
      const user = await res.json();
      setCurrentUser(user);
      if (user.requiresPasswordChange) {
        setShowPasswordChangeModal(true);
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasswordUpdate !== confirmNewPassword) {
      setPasswordChangeError('Las contraseñas no coinciden');
      return;
    }
    if (newPasswordUpdate.length < 6) {
      setPasswordChangeError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setIsChangingPassword(true);
    setPasswordChangeError('');
    
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword: newPasswordUpdate })
    });
    
    setIsChangingPassword(false);
    
    if (!res.ok) {
      const data = await res.json();
      setPasswordChangeError(data.error || 'Error al cambiar la contraseña');
      return;
    }
    
    setShowPasswordChangeModal(false);
    setCurrentPassword('');
    setNewPasswordUpdate('');
    setConfirmNewPassword('');
    showMessage('Contraseña actualizada correctamente');
    setCurrentUser(prev => prev ? { ...prev, requiresPasswordChange: false } : prev);
  };

  const fetchFacturas = async () => {
    try {
      const res = await fetch('/api/facturas');
      if (res.ok) {
        setFacturas(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadFactura = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFactura(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('diasCredito', '30'); 

    try {
      const res = await fetch('/api/facturas/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        showMessage('Factura subida y procesada correctamente');
        fetchFacturas();
      } else {
        const errorData = await res.json();
        showError(errorData.error || 'Error al subir la factura');
      }
    } catch (e) {
      showError('Error de red al subir la factura');
    } finally {
      setIsUploadingFactura(false);
      if (e.target) e.target.value = ''; 
    }
  };

  const fetchHistorial = async () => {
    const res = await fetch('/api/cotizaciones');
    if (res.ok) setHistorial(await res.json());
  };

  const fetchRemisiones = async () => {
    const res = await fetch('/api/remisiones', { cache: 'no-store' });
    if (res.ok) setRemisiones(await res.json());
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
    setAtencion([currentUser?.nombre, currentUser?.apellido].filter(Boolean).join(' '));
    setEmpresa('');
    setMoneda('DOLARES');
    setObservaciones('');
    setPropuesta('');
    setTiempoEntrega('30 dias');
    setItems([emptyItem()]);
    setCurrentCotizacionId(null);
    setActiveTab('cotizacion');
  };

  const fetchNextRemisionFolio = async () => {
    const res = await fetch('/api/remisiones/next-folio', { cache: 'no-store' });
    if (!res.ok) return '';
    const data = await res.json();
    return data.folio || '';
  };

  const startNewRemision = async () => {
    const nextFolio = await fetchNextRemisionFolio();
    setMode('new');
    setRemisionFolio(nextFolio);
    setRemisionFecha(todayInputValue());
    setRemisionCondiciones('14 DIAS');
    setRemisionCliente('');
    setRemisionDireccion('');
    setRemisionCiudad('');
    setRemisionRfc('');
    setRemisionTel('');
    setRemisionLugarExp('Apodaca N.L.');
    setRemisionCotizacionId('');
    setRemisionItems([emptyItemRemision()]);
    setCurrentRemisionId(null);
    setActiveTab('remisiones');
  };

  const loadRemision = (rem: NotaRemisionData) => {
    setMode('edit');
    setRemisionFolio(rem.folio);
    setRemisionFecha(rem.fecha);
    setRemisionCondiciones(rem.condiciones);
    setRemisionCliente(rem.cliente);
    setRemisionDireccion(rem.direccion);
    setRemisionCiudad(rem.ciudad);
    setRemisionRfc(rem.rfc);
    setRemisionTel(rem.tel);
    setRemisionLugarExp(rem.lugarExp);
    setRemisionCotizacionId(rem.cotizacionId || '');
    setRemisionItems(rem.items.map(i => ({ ...i, isEditing: false })));
    setCurrentRemisionId(rem.id || null);
    setActiveTab('remisiones');
  };

  const loadCotizacion = (cotizacion: CotizacionData) => {
    setMode('edit');
    setFolio(cotizacion.folio);
    setFecha(cotizacion.fecha);
    setAtencion(cotizacion.atencion);
    setEmpresa(cotizacion.empresa);
    setMoneda(cotizacion.moneda);
    setObservaciones(cotizacion.observaciones);
    setPropuesta(cotizacion.propuesta || '');
    setTiempoEntrega(cotizacion.tiempoEntrega);
    setItems(cotizacion.items.map((item) => ({ ...item, valorDolar: item.valorDolar === 1 ? 0 : (item.valorDolar || 0), isEditing: false })));
    setCurrentCotizacionId(cotizacion.id || null);
    setActiveTab('cotizacion');
  };

  const handleUploadClick = (cotizacionId: string) => {
    setUploadingOCFor(cotizacionId);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const deleteOC = async (cotizacionId: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar la Orden de Compra subida? Esto la regresará a estatus PENDIENTE.')) return;
    
    try {
      const res = await fetch(`/api/ordenes-compra/${cotizacionId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      showMessage('Orden de compra eliminada.');
      fetchHistorial();
    } catch (error) {
      showError('No se pudo eliminar la OC.');
    }
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



  const saveRemision = async () => {
    setIsSaving(true);
    setError('');

    const payload: NotaRemisionData = {
      folio: remisionFolio,
      fecha: remisionFecha,
      condiciones: remisionCondiciones,
      cliente: remisionCliente,
      direccion: remisionDireccion,
      ciudad: remisionCiudad,
      rfc: remisionRfc,
      tel: remisionTel,
      lugarExp: remisionLugarExp,
      cotizacionId: remisionCotizacionId,
      items: remisionItems.map(({ isEditing, ...rest }) => rest as ItemNotaRemision),
    };

    try {
      const res = await fetch('/api/remisiones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        showError(data.error || 'No se pudo guardar la remision.');
        return;
      }

      await fetchRemisiones();
      showMessage(mode === 'new' ? 'Remision guardada.' : 'Remision actualizada.');
      setMode('edit');
    } catch {
      showError('Error de conexion al guardar.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRemision = async (rem: NotaRemisionData) => {
    if (!window.confirm(`Eliminar la remision ${rem.folio}?`)) return;

    const res = await fetch(`/api/remisiones?folio=${encodeURIComponent(rem.folio)}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const data = await res.json();
      showError(data.error || 'No se pudo eliminar la remision.');
      return;
    }

    await fetchRemisiones();
    showMessage('Remision eliminada.');
    if (remisionFolio === rem.folio) startNewRemision();
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
      propuesta,
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

  const exportCotizacionExcel = (cotizacion: CotizacionData) => {
    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; }
          td { border: 1px solid #000; padding: 6px; }
          .header { font-weight: bold; background-color: #e2e8f0; text-align: center; }
          .title { font-size: 16px; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="3" class="title">ORDEN DE PRODUCCIÓN - ${cotizacion.folio}</td>
          </tr>
          <tr>
            <td colspan="3" style="font-weight:bold;">CLIENTE: ${cotizacion.empresa || 'N/A'}</td>
          </tr>
          <tr><td colspan="3"></td></tr>
          <tr>
            <td class="header" style="width: 80px;">CANT.</td>
            <td class="header" style="width: 80px;">UNIDAD</td>
            <td class="header" style="width: 400px;">DESCRIPCIÓN</td>
          </tr>
    `;

    cotizacion.items.forEach(item => {
      tableHtml += `
        <tr>
          <td style="text-align:center; font-size: 14px;">${item.cantidad}</td>
          <td style="text-align:center; font-size: 14px;">pzas</td>
          <td style="font-size: 14px;">${item.descripcion}</td>
        </tr>
      `;
    });

    tableHtml += `
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Produccion_${cotizacion.folio}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addItemRemision = () => setRemisionItems((current) => [
    ...current.map(item => ({ ...item, isEditing: false })), 
    emptyItemRemision()
  ]);
  const removeItemRemision = (id: string) => setRemisionItems((current) => current.filter((item) => item.id !== id));

  const toggleEditItemRemision = (id: string) => setRemisionItems((current) => current.map((item) => (
    item.id === id ? { ...item, isEditing: !item.isEditing } : item
  )));

  const updateItemRemision = (id: string, field: keyof ItemNotaRemision, value: string | number) => {
    setRemisionItems((current) => current.map((item) => (
      item.id === id ? { ...item, [field]: value } : item
    )));
  };

  const createOrUpdateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    const isEditing = !!editingUserId;
    const res = await fetch('/api/users', {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingUserId,
        username: newUsername,
        password: newPassword,
        role: newRole,
        nombre: newNombre,
        apellido: newApellido,
        telefono: newTelefono,
        requiresPasswordChange: newRequiresPasswordChange
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || (isEditing ? 'No se pudo actualizar el usuario.' : 'No se pudo crear el usuario.'));
      return;
    }

    cancelEditUser();
    await fetchUsers();
    showMessage(isEditing ? 'Usuario actualizado.' : 'Usuario creado.');
  };

  const handleEditUser = (user: UserData) => {
    setEditingUserId(user.id);
    setNewUsername(user.username);
    setNewPassword('');
    setNewRole(user.role);
    setNewNombre(user.nombre || '');
    setNewApellido(user.apellido || '');
    setNewTelefono(user.telefono || '');
    setNewRequiresPasswordChange(false);
  };

  const cancelEditUser = () => {
    setEditingUserId(null);
    setNewUsername('');
    setNewPassword('');
    setNewRole('USER');
    setNewNombre('');
    setNewApellido('');
    setNewTelefono('');
    setNewRequiresPasswordChange(true);
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

  const handleUserStatus = async (user: UserData, newEstatus: string, role?: string) => {
    if (newEstatus === 'RECHAZADO' && !window.confirm(`¿Seguro que deseas rechazar al usuario ${user.username}?`)) return;

    const payload: any = { id: user.id, username: user.username, estatus: newEstatus };
    if (role) payload.role = role;

    const res = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Error al actualizar estatus');
      return;
    }

    await fetchUsers();
    showMessage(`Usuario ${newEstatus === 'ACTIVO' ? 'Aprobado' : 'Rechazado'} correctamente.`);
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
    document.title = activeTab === 'remisiones' ? (remisionFolio || 'Remision') : (folio || 'Cotizacion');
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
      <aside className="app-sidebar no-print">
        <div className="sidebar-logo">
          <img src="/logo.png" alt="Badilsa Logo" style={{ width: '100%', maxWidth: '200px', objectFit: 'contain' }} />
        </div>
        <div className="sidebar-menu">
          <div className="sidebar-menu-title">Menú Principal</div>
          <button className={`sidebar-link ${activeTab === 'inicio' ? 'active' : ''}`} onClick={() => setActiveTab('inicio')}>
            <Home size={18} /> Inicio
          </button>
          <button className={`sidebar-link ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => setActiveTab('historial')}>
            <History size={18} /> Historial
          </button>
          <button className={`sidebar-link ${activeTab === 'cotizacion' ? 'active' : ''}`} onClick={startNewCotizacion}>
            <Plus size={18} /> Nueva Cotización
          </button>
          <button className={`sidebar-link ${activeTab === 'remisiones' ? 'active' : ''}`} onClick={() => { setActiveTab('remisiones'); setCurrentRemisionId(null); setMode('edit'); }}>
            <FileText size={18} /> Notas de Remisión
          </button>
          {currentUser?.role === 'ADMIN' && (
            <>
              <button className={`sidebar-link ${activeTab === 'reportes' ? 'active' : ''}`} onClick={() => setActiveTab('reportes')}>
                <PieChart size={18} /> Reportes
              </button>
              <button className={`sidebar-link ${activeTab === 'facturacion' ? 'active' : ''}`} onClick={() => setActiveTab('facturacion')}>
                <DollarSign size={18} /> Facturación
              </button>
              <button className={`sidebar-link ${activeTab === 'usuarios' ? 'active' : ''}`} onClick={() => setActiveTab('usuarios')}>
                <UserPlus size={18} /> Usuarios
              </button>
            </>
          )}
        </div>
        <div className="sidebar-footer">
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', marginBottom: '0.5rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ background: '#3b82f6', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.username}
              </div>
            </div>
          )}
          <button className="sidebar-link" onClick={handleLogout} style={{ color: '#ef4444' }}>
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="app-main-content">
        <div className="toolbar no-print">
          <h1 className="text-xl font-bold" style={{ color: '#1e293b' }}>
            {activeTab === 'inicio' && 'Inicio'}
            {activeTab === 'historial' && 'Historial'}
            {activeTab === 'cotizacion' && 'Cotización'}
            {activeTab === 'remisiones' && 'Notas de Remisión'}
            {activeTab === 'reportes' && 'Reportes'}
            {activeTab === 'facturacion' && 'Facturación'}
            {activeTab === 'usuarios' && 'Usuarios'}
          </h1>
          <div className="flex gap-2">
            {(activeTab === 'cotizacion' || activeTab === 'remisiones') && (
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
                {isSaving ? 'Guardando...' : 'Guardar Cotización'}
              </button>
            )}
            {activeTab === 'remisiones' && (
              <button className="btn btn-primary" onClick={saveRemision} disabled={isSaving}>
                {message ? <Check size={18} /> : <Save size={18} />}
                {isSaving ? 'Guardando...' : 'Guardar Remisión'}
              </button>
            )}
          </div>
        </div>

        <div className="main-shell no-print" style={{ marginTop: '0', paddingTop: '1.5rem' }}>
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

          <div className="panel-header" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div>
                <label className="text-sm font-bold text-gray block" style={{ marginBottom: '4px' }}>Filtro de Fecha:</label>
                <select className="input" value={historyFilterDate} onChange={(e) => setHistoryFilterDate(e.target.value)} style={{ padding: '0.5rem' }}>
                  <option value="todas">Todas las Fechas</option>
                  <option value="hoy">El Día de Hoy</option>
                  <option value="semana">Últimos 7 Días</option>
                  <option value="mes">Este Mes</option>
                  <option value="anio">Este Año</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray block" style={{ marginBottom: '4px' }}>Filtro de Estatus:</label>
                <select className="input" value={historyFilterStatus} onChange={(e) => setHistoryFilterStatus(e.target.value)} style={{ padding: '0.5rem' }}>
                  <option value="todos">Todos los Estatus</option>
                  <option value="PENDIENTE">Pendientes de OC</option>
                  <option value="RECIBIDA">Completadas (OC Recibida)</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" onClick={startNewCotizacion}>
              <Plus size={18} /> Nueva Cotizacion
            </button>
          </div>

          {(historyFilterStatus === 'todos' || historyFilterStatus === 'PENDIENTE') && (
            <>
              <div className="panel-header">
                <div>
                  <h2>Cotizaciones Pendientes</h2>
                  <p>{filteredHistorial.filter((c) => !c.estatusOC || c.estatusOC === 'PENDIENTE').length} cotizaciones en espera de OC</p>
                </div>
              </div>

              <div className="history-table">
                {filteredHistorial.filter((c) => !c.estatusOC || c.estatusOC === 'PENDIENTE').length === 0 ? (
                  <div className="empty-state">No hay cotizaciones pendientes para estos filtros.</div>
                ) : (
                  filteredHistorial.filter((c) => !c.estatusOC || c.estatusOC === 'PENDIENTE').map((cotizacion) => (
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
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn btn-outline" style={{ padding: '4px 8px', color: '#16a34a', borderColor: '#16a34a' }} onClick={() => openOC(cotizacion.archivosOC![0].fileData)}>
                            <FileText size={16} /> Ver OC
                          </button>
                          <button className="btn btn-outline danger-outline" style={{ padding: '4px 8px', borderColor: '#ef4444', color: '#ef4444' }} onClick={() => deleteOC(cotizacion.id!)} title="Eliminar OC">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button className="btn btn-outline" style={{ padding: '4px 8px', color: '#0ea5e9', borderColor: '#0ea5e9' }} onClick={() => handleUploadClick(cotizacion.id!)}>
                          <Upload size={16} /> Subir OC
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-outline" style={{ padding: '4px 8px', color: '#16a34a', borderColor: '#16a34a' }} onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Hola, adjunto liga a su cotización:\n${window.location.origin}/cotizacion/ver/${cotizacion.id}`)}`, '_blank')}>
                        WhatsApp
                      </button>
                      <button className="btn btn-outline" style={{ padding: '4px 8px', color: '#475569', borderColor: '#cbd5e1' }} onClick={() => { window.location.href = `mailto:?subject=Cotización ${cotizacion.folio}&body=${encodeURIComponent(`Hola, puede ver su cotización en el siguiente enlace:\n\n${window.location.origin}/cotizacion/ver/${cotizacion.id}`)}`; }}>
                        Correo
                      </button>
                      <button className="btn btn-outline" style={{ padding: '4px 8px', color: '#059669', borderColor: '#059669' }} onClick={() => exportCotizacionExcel(cotizacion)}>
                        <FileText size={16} /> Exportar Excel
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          </>
          )}

          {(historyFilterStatus === 'todos' || historyFilterStatus === 'RECIBIDA') && (
          <>
          <div className="panel-header" style={{ marginTop: '2rem' }}>
            <div>
              <h2>Cotizaciones Completadas</h2>
              <p>{filteredHistorial.filter((c) => c.estatusOC === 'RECIBIDA' || c.estatusOC === 'VALIDADA').length} cotizaciones con OC recibida</p>
            </div>
          </div>

          <div className="history-table">
            {filteredHistorial.filter((c) => c.estatusOC === 'RECIBIDA' || c.estatusOC === 'VALIDADA').length === 0 ? (
              <div className="empty-state">No hay cotizaciones completadas para estos filtros.</div>
            ) : (
              filteredHistorial.filter((c) => c.estatusOC === 'RECIBIDA' || c.estatusOC === 'VALIDADA').map((cotizacion) => (
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
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn btn-outline" style={{ padding: '4px 8px', color: '#16a34a', borderColor: '#16a34a' }} onClick={() => openOC(cotizacion.archivosOC![0].fileData)}>
                            <FileText size={16} /> Ver OC
                          </button>
                          <button className="btn btn-outline danger-outline" style={{ padding: '4px 8px', borderColor: '#ef4444', color: '#ef4444' }} onClick={() => deleteOC(cotizacion.id!)} title="Eliminar OC">
                            <X size={16} />
                          </button>
                        </div>
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
          </>
          )}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
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

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Tasa de Conversión</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#4f46e5' }}>{reportData.resumen.conversionPorcentaje}%</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem', fontWeight: '500' }}>
                    {reportData.resumen.cotizacionesSinOC} sin OC
                  </div>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Tiempo de Cierre</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b' }}>{reportData.resumen.promedioCierreDias} <span style={{fontSize: '1rem'}}>días</span></div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem', fontWeight: '500' }}>
                    Promedio Cotización a OC
                  </div>
                </div>
              </div>

              {/* Gráficas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#0f172a' }}>Tendencia de Ventas (Cotizado vs Cerrado)</h3>
                  <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.graficas.tendenciaMensual} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `$${(value/1000)}k`} />
                        <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} formatter={(value: number) => [`$${formatNumber(value)}`, '']} />
                        <Legend iconType="circle" />
                        <Bar dataKey="cotizado" name="Monto Cotizado" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={30} />
                        <Bar dataKey="cerrado" name="Monto Cerrado (OC)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#0f172a' }}>Distribución de Estatus</h3>
                  <div style={{ height: '300px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={reportData.graficas.distribucionEstatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {reportData.graficas.distribucionEstatus.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.name === 'Con Orden' ? '#10b981' : '#f59e0b'} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Tablas Inferiores */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} color="#4f46e5" /> Top Vendedores</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {reportData.analitica.vendedores.length === 0 && <p className="text-gray text-sm">No hay datos</p>}
                    {reportData.analitica.vendedores.map((v: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                        <div>
                          <span style={{ fontWeight: '600', color: '#334155', display: 'block' }}>{v.nombre}</span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Tasa: {v.tasa}%</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {v.montoMXN > 0 && <div style={{ fontWeight: 'bold', color: '#16a34a', fontSize: '0.9rem' }}>MXN ${formatNumber(v.montoMXN)}</div>}
                          {v.montoUSD > 0 && <div style={{ fontWeight: 'bold', color: '#0284c7', fontSize: '0.9rem' }}>USD ${formatNumber(v.montoUSD)}</div>}
                          {v.montoMXN === 0 && v.montoUSD === 0 && <div style={{ fontWeight: 'bold', color: '#16a34a', fontSize: '0.9rem' }}>$0.00</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DollarSign size={18} color="#16a34a" /> Top Clientes</h3>
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
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Target size={18} color="#f59e0b" /> Top Servicios</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {reportData.analitica.servicios.length === 0 && <p className="text-gray text-sm">No hay datos</p>}
                    {reportData.analitica.servicios.map((s: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                        <span style={{ fontWeight: '500', color: '#334155', textTransform: 'capitalize' }}>{s.nombre}</span>
                        <span style={{ fontWeight: 'bold', color: '#0f172a', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem' }}>{s.cantidad}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === 'facturacion' && (
        <section className="panel-page no-print">
          <div className="panel-header">
            <div>
              <h2>Cuentas por Cobrar (Facturación)</h2>
              <p>Sube tus XML del SAT y monitorea qué facturas están vencidas o por cobrar.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input type="file" accept=".xml" id="xml-upload" style={{ display: 'none' }} onChange={handleUploadFactura} disabled={isUploadingFactura} />
              <button className="primary-btn" onClick={() => document.getElementById('xml-upload')?.click()} disabled={isUploadingFactura}>
                <Upload size={18} /> {isUploadingFactura ? 'Subiendo...' : 'Subir XML Factura'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', borderLeft: '5px solid #0284c7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#0284c7', textTransform: 'uppercase' }}>Por Cobrar Total</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#334155', marginTop: '0.5rem' }}>
                ${formatNumber(facturas.filter(f => f.estatusPago === 'PENDIENTE').reduce((sum, f) => sum + f.total, 0))}
              </div>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', borderLeft: '5px solid #ef4444', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#ef4444', textTransform: 'uppercase' }}>Vencido</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#334155', marginTop: '0.5rem' }}>
                ${formatNumber(facturas.filter(f => f.estatusPago === 'PENDIENTE' && new Date(f.fechaVencimiento) < new Date()).reduce((sum, f) => sum + f.total, 0))}
              </div>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', borderLeft: '5px solid #10b981', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#10b981', textTransform: 'uppercase' }}>Cobrado</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#334155', marginTop: '0.5rem' }}>
                ${formatNumber(facturas.filter(f => f.estatusPago === 'PAGADA').reduce((sum, f) => sum + f.total, 0))}
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <table className="custom-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Folio SAT / Emisor</th>
                  <th>Cliente (Receptor)</th>
                  <th>Fecha Emisión</th>
                  <th>Vencimiento</th>
                  <th>Días Restantes</th>
                  <th>Monto</th>
                  <th>Estatus</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturas.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No hay facturas registradas. Sube un archivo XML.</td></tr>
                ) : facturas.map((f: any) => {
                  const vence = new Date(f.fechaVencimiento);
                  const hoy = new Date();
                  const diasRestantes = Math.ceil((vence.getTime() - hoy.getTime()) / (1000 * 3600 * 24));
                  const isVencido = diasRestantes < 0 && f.estatusPago === 'PENDIENTE';
                  
                  return (
                    <tr key={f.id} style={{ background: isVencido ? '#fef2f2' : 'transparent' }}>
                      <td>
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{f.uuid.split('-')[0]}...</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{f.emisorNombre}</div>
                      </td>
                      <td style={{ fontWeight: '500', color: '#334155', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={f.receptorNombre}>
                        {f.receptorNombre}
                      </td>
                      <td>{new Date(f.fechaEmision).toLocaleDateString()}</td>
                      <td style={{ fontWeight: '500' }}>{vence.toLocaleDateString()}</td>
                      <td>
                        {f.estatusPago === 'PAGADA' ? (
                          <span style={{ color: '#10b981', fontWeight: 'bold' }}>--</span>
                        ) : isVencido ? (
                          <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{Math.abs(diasRestantes)} días vencido</span>
                        ) : (
                          <span style={{ color: '#0284c7' }}>{diasRestantes} días</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 'bold', color: '#0f172a' }}>${formatNumber(f.total)} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{f.moneda}</span></td>
                      <td>
                        <select 
                          style={{ 
                            padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold', outline: 'none', cursor: 'pointer',
                            background: f.estatusPago === 'PAGADA' ? '#dcfce7' : f.estatusPago === 'PENDIENTE' ? '#fef08a' : '#f1f5f9',
                            color: f.estatusPago === 'PAGADA' ? '#16a34a' : f.estatusPago === 'PENDIENTE' ? '#ca8a04' : '#475569',
                            border: 'none'
                          }}
                          value={f.estatusPago}
                          onChange={async (e) => {
                            try {
                              const res = await fetch('/api/facturas', { method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ id: f.id, estatusPago: e.target.value }) });
                              if (res.ok) { fetchFacturas(); showMessage('Estatus actualizado'); }
                            } catch (err) { showError('Error al actualizar'); }
                          }}
                        >
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="PAGADA">Pagada</option>
                          <option value="CANCELADA">Cancelada</option>
                        </select>
                      </td>
                      <td>
                        <button className="icon-btn" title="Eliminar factura" onClick={async () => {
                          if (window.confirm('¿Seguro que quieres borrar esta factura?')) {
                             try {
                               const res = await fetch(`/api/facturas/${f.id}`, { method: 'DELETE' });
                               if (res.ok) { fetchFacturas(); showMessage('Factura eliminada'); }
                             } catch(err) { showError('Error eliminando factura'); }
                          }
                        }}><Trash2 size={16} color="#ef4444" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'usuarios' && currentUser?.role === 'ADMIN' && (
        <section className="panel-page no-print">
          <div className="panel-header">
            <div>
              <h2>Usuarios</h2>
              <p>Solo administradores pueden gestionar usuarios.</p>
            </div>
          </div>

          <form className="user-form" onSubmit={createOrUpdateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
            <input className="inline-input" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Usuario" required />
            <input className="inline-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={editingUserId ? "Dejar en blanco para no cambiar contraseña" : "Contrasena"} required={!editingUserId} />
            <input className="inline-input" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} placeholder="Nombre" />
            <input className="inline-input" value={newApellido} onChange={(e) => setNewApellido(e.target.value)} placeholder="Apellido" />
            <input className="inline-input" value={newTelefono} onChange={(e) => setNewTelefono(e.target.value)} placeholder="Telefono" />
            <select className="inline-input" value={newRole} onChange={(e) => setNewRole(e.target.value as 'ADMIN' | 'USER')}>
              <option value="USER">Cotizador</option>
              <option value="ADMIN">Administrador</option>
            </select>
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input type="checkbox" id="reqPwdChange" checked={newRequiresPasswordChange} onChange={(e) => setNewRequiresPasswordChange(e.target.checked)} />
              <label htmlFor="reqPwdChange" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Solicitar cambio de contraseña en el próximo inicio de sesión</label>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              {editingUserId && (
                <button type="button" className="btn btn-outline" onClick={cancelEditUser}>
                  Cancelar
                </button>
              )}
              <button className="btn btn-primary" type="submit">
                {editingUserId ? <Edit size={18} /> : <UserPlus size={18} />} {editingUserId ? 'Actualizar Usuario' : 'Crear Usuario'}
              </button>
            </div>
          </form>

          {users.filter(u => u.estatus === 'PENDIENTE').length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#b45309', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span>
                Solicitudes Pendientes de Aprobación
              </h3>
              <div className="history-table" style={{ border: '1px solid #fcd34d' }}>
                {users.filter(u => u.estatus === 'PENDIENTE').map((user) => (
                  <div className="history-row" key={user.id} style={{ background: '#fffbeb' }}>
                    <div>
                      <div className="font-bold">{user.username} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>Pendiente</span></div>
                      <div className="text-sm text-gray">
                        {user.nombre || user.apellido ? `${user.nombre || ''} ${user.apellido || ''} ` : ''} 
                        {user.email ? `| ${user.email} ` : ''} 
                        {user.telefono ? `| ${user.telefono}` : ''}
                      </div>
                    </div>
                    <div className="history-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button className="btn btn-outline" style={{ color: '#16a34a', borderColor: '#16a34a' }} onClick={() => handleUserStatus(user, 'ACTIVO', 'USER')}>
                        <Check size={16} /> Aprobar (Cotizador)
                      </button>
                      <button className="btn btn-outline" style={{ color: '#2563eb', borderColor: '#2563eb' }} onClick={() => handleUserStatus(user, 'ACTIVO', 'ADMIN')}>
                        <Check size={16} /> Aprobar (Admin)
                      </button>
                      <button className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleUserStatus(user, 'RECHAZADO')}>
                        <Trash2 size={16} /> Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '1rem' }}>Usuarios Activos</h3>
          <div className="history-table">
            {users.filter(u => u.estatus !== 'PENDIENTE').map((user) => (
              <div className="history-row" key={user.id}>
                <div>
                  <div className="font-bold">{user.username} {user.estatus === 'RECHAZADO' && <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#ef4444', background: '#fef2f2', padding: '2px 6px', borderRadius: '4px', marginLeft: '0.5rem' }}>Rechazado</span>}</div>
                  <div className="text-sm text-gray">{user.role === 'ADMIN' ? 'Administrador' : 'Cotizador'} {user.nombre || user.apellido ? `| ${user.nombre || ''} ${user.apellido || ''}` : ''} {user.email ? `| ${user.email}` : ''}</div>
                </div>
                <div className="history-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline" onClick={() => handleEditUser(user)}>
                    <Edit size={16} /> Editar
                  </button>
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
                ventas@badilsa.com
              </span>
            </div>
          </div>

          <div className="doc-meta-blocks">
            <datalist id="atenciones-list">
              {Array.from(new Set(historial.map(c => c.atencion).filter(Boolean))).map((atn, i) => <option key={i} value={atn} />)}
            </datalist>
            <datalist id="empresas-list">
              {Array.from(new Set(historial.map(c => c.empresa).filter(Boolean))).map((emp, i) => <option key={i} value={emp} />)}
            </datalist>
            <div className="meta-block attention-block">
              <div className="flex items-center gap-2">
                <span style={{ width: '65px' }}>Atencion:</span>
                <input className="inline-input" value={atencion} onChange={(e) => setAtencion(e.target.value)} list="atenciones-list" />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span style={{ width: '65px' }}>Empresa:</span>
                <input className="inline-input" value={empresa} onChange={(e) => setEmpresa(e.target.value)} list="empresas-list" />
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

          <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }} className={!propuesta ? "no-print" : ""}>
            <span style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>PROPUESTA:</span>
            {activeTab === 'cotizacion' && (
              <textarea
                className="inline-input no-print"
                value={propuesta}
                onChange={(e) => setPropuesta(e.target.value)}
                placeholder="Escriba aqui la propuesta..."
                rows={2}
                style={{ width: '100%', resize: 'vertical' }}
              />
            )}
            <div className="print-only" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{propuesta}</div>
          </div>

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
                          <input type="number" className="inline-input text-center no-print" value={item.cantidad === 0 ? '' : item.cantidad} onChange={(e) => updateItem(item.id, 'cantidad', e.target.value === '' ? 0 : parseFloat(e.target.value))} onFocus={(e) => e.target.select()} />
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
                    <td className="text-right" style={{ verticalAlign: 'top', paddingTop: '0.5rem', whiteSpace: 'nowrap' }}>
                      {item.isEditing ? (
                        <>
                          <span className="currency-prefix no-print">$</span>
                          <input 
                            type="number" 
                            className="inline-input text-right no-print" 
                            value={item.precioUnitario === 0 ? '' : (moneda === 'DOLARES' && (item.valorDolar || 1) > 1 ? Number((item.precioUnitario / item.valorDolar).toFixed(2)) : item.precioUnitario)} 
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                              const finalVal = (moneda === 'DOLARES' && (item.valorDolar || 1) > 1) ? val * item.valorDolar : val;
                              updateItem(item.id, 'precioUnitario', finalVal);
                            }} 
                            style={{ width: '70px' }} 
                            onFocus={(e) => e.target.select()} 
                          />
                          <span className="print-only">$ {formatNumber(item.precioUnitario / (moneda === 'DOLARES' ? (item.valorDolar || 1) : 1))}</span>
                        </>
                      ) : (
                        <span>$ {formatNumber(item.precioUnitario / (moneda === 'DOLARES' ? (item.valorDolar || 1) : 1))}</span>
                      )}
                    </td>
                    <td className="no-print text-right" style={{ verticalAlign: 'top', paddingTop: '0.5rem' }}>
                      {item.isEditing ? (
                        <input type="number" className="inline-input text-right" value={item.valorDolar === 0 ? '' : item.valorDolar} onChange={(e) => updateItem(item.id, 'valorDolar', e.target.value === '' ? 0 : parseFloat(e.target.value))} style={{ width: '70px' }} onFocus={(e) => e.target.select()} />
                      ) : (
                        <span>{item.valorDolar}</span>
                      )}
                    </td>
                    <td className="text-right" style={{ paddingRight: '0.5rem', verticalAlign: 'top', paddingTop: '0.5rem', whiteSpace: 'nowrap' }}>
                      $ {formatNumber(item.cantidad * item.precioUnitario / (moneda === 'DOLARES' ? (item.valorDolar || 1) : 1))}
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
                <span className="total-label" style={{ textAlign: 'right', paddingRight: '0.5rem', fontWeight: 'bold', fontSize: '1rem' }}>IVA:</span>
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
            <p className="text-center" style={{ color: '#2563eb', textDecoration: 'underline' }}>www.badilsa.com</p>
          </div>
        </div>
      )}
      {activeTab === 'remisiones' && !currentRemisionId && mode !== 'new' && (
        <section className="panel-page no-print">
          <div className="panel-header">
            <div>
              <h2>Notas de Remisión</h2>
              <p>Historial de entregas</p>
            </div>
            <button className="btn btn-primary" onClick={startNewRemision}>
              <Plus size={18} /> Nueva Remisión
            </button>
          </div>

          <div className="history-table">
            {remisiones.length === 0 ? (
              <div className="empty-state">No hay notas de remisión registradas.</div>
            ) : (
              remisiones.map((rem) => (
                <div className="history-row" key={rem.folio}>
                  <div>
                    <div className="font-bold">{rem.folio} - {rem.cliente}</div>
                    <div className="text-sm text-gray-500">
                      {rem.fecha} | {rem.items.length} conceptos | {' '}
                      {rem.cotizacionId ? (
                        <>Ligado a Cot. <a href={`/cotizacion/ver/${rem.cotizacionId}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>{rem.cotizacion?.folio}</a></>
                      ) : (
                        'Sin cotización ligada'
                      )}
                    </div>
                  </div>
                  <div className="actions">
                    <button className="btn btn-outline" onClick={() => loadRemision(rem)}>
                      <Edit size={16} /> Abrir
                    </button>
                    {currentUser?.role === 'ADMIN' && (
                      <button className="text-danger btn btn-outline" style={{ borderColor: 'transparent' }} onClick={() => deleteRemision(rem)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === 'remisiones' && (currentRemisionId || mode === 'new') && (
        <div className="document-page" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
          <div className="no-print" style={{ marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ fontWeight: 'bold' }}>Ligar a Cotización:</div>
            <select 
              className="inline-input" 
              value={remisionCotizacionId} 
              onChange={e => setRemisionCotizacionId(e.target.value)}
              style={{ width: '300px' }}
            >
              <option value="">-- Ninguna --</option>
              {historial.map(cot => (
                <option key={cot.id} value={cot.id || ''}>{cot.folio} - {cot.empresa}</option>
              ))}
            </select>
          </div>

          {/* DOCUMENT HEADER */}
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <img src="/logo.png" alt="Badilsa Logo" style={{ width: '220px', marginTop: '-30px' }} />
            <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: '1.2', marginTop: '-45px', position: 'relative', zIndex: 10 }}>
              <p style={{ margin: 0 }}>Carret. Agua Fria Km. 1.5 Col. Cerritos de Agua Fria</p>
              <p style={{ margin: 0 }}>Tel. (81) 8314-2767 C.P. 66620. Apodaca, N.L.</p>
              <p style={{ margin: 0 }}>ventas@badilsa.com</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ border: '2px solid #2563eb', padding: '0.25rem 0.5rem', color: '#1e3a8a', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '0.5rem' }}>REMISION</span>
              <input className="inline-input text-left no-print" value={remisionFolio} onChange={e => setRemisionFolio(e.target.value)} style={{ width: '80px', color: '#1e3a8a', fontWeight: 'bold' }} />
              <span className="print-only" style={{ color: '#1e3a8a' }}>{remisionFolio}</span>
            </div>
            <div style={{ border: '2px solid #2563eb', padding: '0.25rem 0.5rem', color: '#1e3a8a', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '0.5rem' }}>FECHA.</span>
              <input type="date" className="inline-input no-print" value={remisionFecha} onChange={e => setRemisionFecha(e.target.value)} style={{ color: '#1e3a8a', fontWeight: 'bold' }} />
              <span className="print-only" style={{ color: '#1e3a8a' }}>{remisionFecha}</span>
            </div>
          </div>

          {/* CLIENTE Y CONTACTO */}
          <div style={{ border: '2px solid #000', padding: '0.5rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '2rem' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Cliente:</span>
              <input className="inline-input no-print w-full" value={remisionCliente} onChange={e => setRemisionCliente(e.target.value)} placeholder="Nombre del cliente" style={{ fontSize: '1rem', fontWeight: 'bold' }} />
              <span className="print-only" style={{ flex: 1, borderBottom: '1px solid #cbd5e1', fontSize: '1.1rem', fontWeight: 'bold' }}>{remisionCliente}</span>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Contacto:</span>
              <input className="inline-input no-print w-full" value={remisionDireccion} onChange={e => setRemisionDireccion(e.target.value)} placeholder="Nombre del contacto" style={{ fontSize: '1rem' }} />
              <span className="print-only" style={{ flex: 1, borderBottom: '1px solid #cbd5e1', fontSize: '1rem' }}>{remisionDireccion}</span>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-container" style={{ border: '2px solid #3b82f6', borderRadius: '4px' }}>
            <table className="doc-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '15%', background: '#3b82f6', color: 'white', padding: '0.5rem', textAlign: 'center', borderRight: '1px solid white' }}>CANTIDAD</th>
                  <th style={{ width: '85%', background: '#3b82f6', color: 'white', padding: '0.5rem', textAlign: 'center' }}>DESCRIPCION</th>
                  <th className="no-print" style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {remisionItems.map((item, index) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ textAlign: 'center', verticalAlign: 'top', padding: '0.5rem', borderRight: '1px solid #e2e8f0' }}>
                      {item.isEditing ? (
                        <>
                          <input type="number" className="inline-input text-center no-print" value={item.cantidad || ''} onChange={e => updateItemRemision(item.id, 'cantidad', parseFloat(e.target.value) || 0)} style={{ width: '80%' }} />
                          <span className="print-only">{item.cantidad || ''}</span>
                        </>
                      ) : (
                        <span>{item.cantidad || ''}</span>
                      )}
                    </td>
                    <td style={{ verticalAlign: 'top', padding: '0.5rem' }}>
                      {item.isEditing ? (
                        <>
                          <textarea className="inline-input no-print w-full" value={item.descripcion} onChange={e => updateItemRemision(item.id, 'descripcion', e.target.value)} rows={2} style={{ resize: 'vertical' }} />
                          <div className="print-only" style={{ whiteSpace: 'pre-wrap' }}>{item.descripcion}</div>
                        </>
                      ) : (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{item.descripcion}</div>
                      )}
                    </td>
                    <td className="no-print text-center" style={{ verticalAlign: 'top', paddingTop: '0.5rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.3rem', marginRight: '0.25rem', borderColor: 'transparent', minWidth: 'auto' }} onClick={() => toggleEditItemRemision(item.id)}>
                        {item.isEditing ? <Check size={16} style={{ color: '#16a34a' }} /> : <Edit size={16} style={{ color: '#2563eb' }} />}
                      </button>
                      <button className="text-danger btn btn-outline" style={{ padding: '0.3rem', borderColor: 'transparent', minWidth: 'auto' }} onClick={() => removeItemRemision(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, 20 - remisionItems.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} className="print-row" style={{ height: '20px', borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ borderRight: '1px solid #e2e8f0', padding: '0.1rem 0.5rem' }}>&nbsp;</td>
                    <td style={{ padding: '0.1rem 0.5rem' }}>&nbsp;</td>
                    <td className="no-print"></td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="no-print" style={{ padding: '0.5rem', textAlign: 'center', borderTop: '1px solid #cbd5e1' }}>
              <button className="btn btn-outline text-sm" onClick={addItemRemision}><Plus size={16} /> Agregar Fila</button>
            </div>
          </div>

          {/* FOOTER */}
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '300px', borderTop: '1px solid #000', textAlign: 'center', paddingTop: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
              NOMBRE Y FIRMA DE RECIBIDO
            </div>
          </div>
        </div>
      )}
      
      {showPasswordChangeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>Actualización Requerida</h2>
            <p style={{ color: '#475569', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Por seguridad, debes cambiar tu contraseña temporal antes de continuar.
            </p>
            {passwordChangeError && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.5rem', borderRadius: '0.25rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{passwordChangeError}</div>}
            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 'bold' }}>Contraseña Actual (Temporal)</label>
                <input type="password" required className="input" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 'bold' }}>Nueva Contraseña</label>
                <input type="password" required className="input" value={newPasswordUpdate} onChange={e => setNewPasswordUpdate(e.target.value)} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 'bold' }}>Confirmar Nueva Contraseña</label>
                <input type="password" required className="input" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={isChangingPassword} style={{ width: '100%' }}>
                {isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
            </form>
          </div>
        </div>
      )}
      </main>

    </div>
  );
}
