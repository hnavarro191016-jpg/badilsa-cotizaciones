"use client";

import React, { useEffect } from 'react';
import { Printer } from 'lucide-react';

export default function PublicCotizacion({ cotizacion }: { cotizacion: any }) {
  useEffect(() => {
    document.title = `Cotizacion ${cotizacion.folio}`;
  }, [cotizacion]);

  const handlePrint = () => {
    window.print();
  };

  const formatNumber = (value: number) => new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T12:00:00');
    if (isNaN(date.getTime())) return dateString;
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`;
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}>
      
      <div className="no-print" style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          <Printer size={18} /> Descargar PDF / Imprimir
        </button>
      </div>

      <div className="document-page" style={{ margin: '0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
        <div className="doc-header">
          <div className="doc-folio-box">
            Cotizacion
            <input className="inline-input folio-input" value={cotizacion.folio} readOnly style={{ width: '280px', marginLeft: '10px' }} />
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
          <div className="meta-block attention-block">
            <div className="flex items-center gap-2">
              <span style={{ width: '65px' }}>Atencion:</span>
              <span className="font-bold">{cotizacion.atencion}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span style={{ width: '65px' }}>Empresa:</span>
              <span className="font-bold">{cotizacion.empresa}</span>
            </div>
          </div>
          <div className="meta-block date-block">
            <span>fecha</span>
            <span style={{ marginLeft: '10px' }}>{formatDisplayDate(cotizacion.fecha)}</span>
          </div>
        </div>

        <p className="text-sm mb-4" style={{ marginTop: '1rem' }}>
          Atencion a su solicitud, me permito enviarle la cotizacion correspondiente al servicio de su interes.
        </p>

        {cotizacion.propuesta && (
          <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>PROPUESTA:</span>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{cotizacion.propuesta}</div>
          </div>
        )}

        <div className="table-container">
          <table className="doc-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Cant.</th>
                <th style={{ width: '80px' }}>Unidad</th>
                <th>Descripcion</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Precio Unit.</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {cotizacion.items.map((item: any, index: number) => (
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
                    $ {formatNumber(item.cantidad * item.precioUnitario / (item.valorDolar || 1))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="doc-footer">
          <div className="obs-block">
            <div className="text-sm font-bold mb-1">OBSERVACIONES :</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{cotizacion.observaciones}</div>
          </div>
          <div className="totals-block">
            <div className="total-row">
              <span className="total-label blue-bg">Sub-Total</span>
              <span className="total-value">$ {formatNumber(cotizacion.subTotal)}</span>
            </div>
            <div className="total-row">
              <span className="total-label" style={{ textAlign: 'right', paddingRight: '0.5rem', fontWeight: 'bold', fontSize: '1rem' }}>IVA:</span>
              <span className="total-value">$ {formatNumber(cotizacion.iva)}</span>
            </div>
            <div className="total-row">
              <span className="total-label blue-bg">Total</span>
              <span className="total-value font-bold">$ {formatNumber(cotizacion.total)}</span>
            </div>
          </div>
        </div>

        <div className="doc-terms">
          <p className="font-bold">Precios en <span className="font-bold">{cotizacion.moneda}</span></p>
          <p>Esperamos su orden de compra para programacion de fabricacion acorde al tiempo de entrega</p>
          <p>Dias de entrega<br />
            <span className="font-medium">{cotizacion.tiempoEntrega}</span>
          </p>
          <p className="text-center" style={{ color: '#2563eb', marginTop: '1.5rem', textDecoration: 'underline' }}>www.badilsa.com</p>
        </div>
      </div>
    </div>
  );
}
