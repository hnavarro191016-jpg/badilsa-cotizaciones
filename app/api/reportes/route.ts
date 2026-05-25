import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const empresa = searchParams.get('empresa');

    let whereClause: any = {};
    if (fechaInicio || fechaFin) {
      whereClause.createdAt = {};
      if (fechaInicio) whereClause.createdAt.gte = new Date(`${fechaInicio}T00:00:00.000Z`);
      if (fechaFin) whereClause.createdAt.lte = new Date(`${fechaFin}T23:59:59.999Z`);
    }
    if (empresa) {
      whereClause.empresa = { contains: empresa, mode: 'insensitive' };
    }

    const cotizaciones = await prisma.cotizacion.findMany({
      where: whereClause,
      include: { archivosOC: true, items: true }
    });

    // A) Resumen General
    const totalCotizaciones = cotizaciones.length;
    const montoTotalCotizadoMXN = cotizaciones.filter(c => c.moneda === 'PESOS' || c.moneda === 'MXN').reduce((acc, curr) => acc + curr.total, 0);
    const montoTotalCotizadoUSD = cotizaciones.filter(c => c.moneda === 'DOLARES' || c.moneda === 'USD').reduce((acc, curr) => acc + curr.total, 0);

    const ocRecibidas = cotizaciones.filter(c => c.estatusOC === 'RECIBIDA' || c.estatusOC === 'VALIDADA' || c.archivosOC.length > 0);
    const totalOrdenes = ocRecibidas.length;
    const montoTotalOrdenesMXN = ocRecibidas.filter(c => c.moneda === 'PESOS' || c.moneda === 'MXN').reduce((acc, curr) => acc + curr.total, 0);
    const montoTotalOrdenesUSD = ocRecibidas.filter(c => c.moneda === 'DOLARES' || c.moneda === 'USD').reduce((acc, curr) => acc + curr.total, 0);

    const conversionPorcentaje = totalCotizaciones > 0 ? ((totalOrdenes / totalCotizaciones) * 100).toFixed(1) : 0;
    const cotizacionesSinOC = totalCotizaciones - totalOrdenes;

    // Tiempo de cierre (promedio)
    let sumDiasCierre = 0;
    let ocConFecha = 0;
    ocRecibidas.forEach(c => {
      if (c.archivosOC.length > 0) {
        // Tomamos el primer archivo como fecha de cierre
        const fechaCierre = new Date(c.archivosOC[0].fechaSubida);
        const fechaCotizacion = new Date(c.createdAt);
        const diffTime = Math.abs(fechaCierre.getTime() - fechaCotizacion.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        sumDiasCierre += diffDays;
        ocConFecha += 1;
      }
    });
    const promedioCierreDias = ocConFecha > 0 ? Math.round(sumDiasCierre / ocConFecha) : 0;

    // B) Clientes (Top 5 por monto y volumen)
    const clientesMap: Record<string, { totalMXN: number; totalUSD: number; count: number }> = {};
    cotizaciones.forEach(c => {
      if (!clientesMap[c.empresa]) clientesMap[c.empresa] = { totalMXN: 0, totalUSD: 0, count: 0 };
      if (c.moneda === 'DOLARES' || c.moneda === 'USD') clientesMap[c.empresa].totalUSD += c.total;
      else clientesMap[c.empresa].totalMXN += c.total;
      clientesMap[c.empresa].count += 1;
    });

    const topClientesMonto = Object.entries(clientesMap)
      .map(([nombre, data]) => ({ nombre, montoMXN: data.totalMXN, montoUSD: data.totalUSD, sortValue: data.totalMXN + (data.totalUSD * 17) }))
      .sort((a, b) => b.sortValue - a.sortValue)
      .slice(0, 5);
    const topClientesCotizaciones = Object.entries(clientesMap)
      .map(([nombre, data]) => ({ nombre, cantidad: data.count }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    // C) Tendencia Mensual
    const mesesMap: Record<string, { mes: string, cotizado: number, cerrado: number }> = {};
    const nombresMes = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    cotizaciones.forEach(c => {
      const fecha = new Date(c.createdAt);
      const mesStr = `${nombresMes[fecha.getMonth()]} ${fecha.getFullYear().toString().substring(2)}`;
      
      if (!mesesMap[mesStr]) mesesMap[mesStr] = { mes: mesStr, cotizado: 0, cerrado: 0 };
      
      // Convertir todo a MXN para gráfica simplificada (asumimos TC=17)
      const montoEstandarizado = c.moneda === 'DOLARES' || c.moneda === 'USD' ? c.total * 17 : c.total;
      mesesMap[mesStr].cotizado += montoEstandarizado;

      if (c.estatusOC === 'RECIBIDA' || c.estatusOC === 'VALIDADA' || c.archivosOC.length > 0) {
        mesesMap[mesStr].cerrado += montoEstandarizado;
      }
    });
    // Conservar orden cronológico
    const tendenciaMensual = Object.values(mesesMap);

    // D) Estatus (Distribución)
    let estatusMap: Record<string, { value: number }> = { 'Sin Orden': { value: 0 }, 'Con Orden': { value: 0 } };
    cotizaciones.forEach(c => {
      const tieneOC = c.estatusOC === 'RECIBIDA' || c.estatusOC === 'VALIDADA' || c.archivosOC.length > 0;
      if (tieneOC) estatusMap['Con Orden'].value += 1;
      else estatusMap['Sin Orden'].value += 1;
    });
    const distribucionEstatus = Object.entries(estatusMap).map(([name, data]) => ({ name, value: data.value }));

    // E) Vendedores (Atención)
    const vendedoresMap: Record<string, { totalCotizado: number; totalOC: number; montoMXN: number; montoUSD: number }> = {};
    cotizaciones.forEach(c => {
      const v = c.atencion.trim() || 'Desconocido';
      if (!vendedoresMap[v]) vendedoresMap[v] = { totalCotizado: 0, totalOC: 0, montoMXN: 0, montoUSD: 0 };
      vendedoresMap[v].totalCotizado += 1;
      
      if (c.estatusOC === 'RECIBIDA' || c.estatusOC === 'VALIDADA' || c.archivosOC.length > 0) {
        vendedoresMap[v].totalOC += 1;
        if (c.moneda === 'DOLARES' || c.moneda === 'USD') {
          vendedoresMap[v].montoUSD += c.total;
        } else {
          vendedoresMap[v].montoMXN += c.total;
        }
      }
    });
    const topVendedores = Object.entries(vendedoresMap)
      .map(([nombre, data]) => ({
        nombre,
        tasa: data.totalCotizado > 0 ? Math.round((data.totalOC / data.totalCotizado) * 100) : 0,
        montoMXN: data.montoMXN,
        montoUSD: data.montoUSD,
        sortTotal: data.montoMXN + (data.montoUSD * 17)
      }))
      .sort((a, b) => b.sortTotal - a.sortTotal)
      .slice(0, 5);

    // F) Top Servicios
    const serviciosMap: Record<string, { conteo: number }> = {};
    cotizaciones.forEach(c => {
      c.items.forEach(item => {
        const desc = item.descripcion.trim().toLowerCase();
        if (!desc) return;
        if (!serviciosMap[desc]) serviciosMap[desc] = { conteo: 0 };
        serviciosMap[desc].conteo += 1;
      });
    });
    const topServicios = Object.entries(serviciosMap)
      .map(([nombre, data]) => ({ nombre, cantidad: data.conteo }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    return NextResponse.json({
      resumen: {
        totalCotizaciones,
        montoTotalCotizadoMXN,
        montoTotalCotizadoUSD,
        totalOrdenes,
        montoTotalOrdenesMXN,
        montoTotalOrdenesUSD,
        conversionPorcentaje,
        cotizacionesSinOC,
        promedioCierreDias
      },
      clientes: {
        topMonto: topClientesMonto,
        topCotizaciones: topClientesCotizaciones
      },
      graficas: {
        tendenciaMensual,
        distribucionEstatus
      },
      analitica: {
        vendedores: topVendedores,
        servicios: topServicios
      }
    });
  } catch (error) {
    console.error('Error reportes:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
