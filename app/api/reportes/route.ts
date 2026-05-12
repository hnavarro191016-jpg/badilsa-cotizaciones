import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

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
      include: { archivosOC: true }
    });

    // A) Cotizaciones
    const totalCotizaciones = cotizaciones.length;
    const montoTotalCotizado = cotizaciones.reduce((acc, curr) => acc + curr.total, 0);

    // B) Órdenes de Compra
    const ocRecibidas = cotizaciones.filter(c => c.estatusOC === 'RECIBIDA' || c.estatusOC === 'VALIDADA' || c.archivosOC.length > 0);
    const totalOrdenes = ocRecibidas.length;
    const montoTotalOrdenes = ocRecibidas.reduce((acc, curr) => acc + curr.total, 0);

    // C) Conversión
    const conversionPorcentaje = totalCotizaciones > 0 ? ((totalOrdenes / totalCotizaciones) * 100).toFixed(1) : 0;
    const cotizacionesSinOC = totalCotizaciones - totalOrdenes;

    // D) Clientes (Top 5 por monto)
    const clientesMap: Record<string, { total: number; count: number }> = {};
    cotizaciones.forEach(c => {
      if (!clientesMap[c.empresa]) clientesMap[c.empresa] = { total: 0, count: 0 };
      clientesMap[c.empresa].total += c.total;
      clientesMap[c.empresa].count += 1;
    });

    const topClientesMonto = Object.entries(clientesMap)
      .map(([nombre, data]) => ({ nombre, monto: data.total }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 5);

    const topClientesCotizaciones = Object.entries(clientesMap)
      .map(([nombre, data]) => ({ nombre, cantidad: data.count }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    // Agrupar por día para gráficas
    const cotizacionesPorDia: Record<string, { cantidad: number; monto: number }> = {};
    const ordenesPorDia: Record<string, { cantidad: number; monto: number }> = {};

    cotizaciones.forEach(c => {
      const fecha = c.createdAt.toISOString().split('T')[0];
      if (!cotizacionesPorDia[fecha]) cotizacionesPorDia[fecha] = { cantidad: 0, monto: 0 };
      cotizacionesPorDia[fecha].cantidad += 1;
      cotizacionesPorDia[fecha].monto += c.total;

      if (c.estatusOC === 'RECIBIDA' || c.estatusOC === 'VALIDADA' || c.archivosOC.length > 0) {
        if (!ordenesPorDia[fecha]) ordenesPorDia[fecha] = { cantidad: 0, monto: 0 };
        ordenesPorDia[fecha].cantidad += 1;
        ordenesPorDia[fecha].monto += c.total;
      }
    });

    const graficas = {
      cotizacionesPorDia: Object.entries(cotizacionesPorDia).map(([fecha, data]) => ({ fecha, ...data })).sort((a, b) => a.fecha.localeCompare(b.fecha)),
      ordenesPorDia: Object.entries(ordenesPorDia).map(([fecha, data]) => ({ fecha, ...data })).sort((a, b) => a.fecha.localeCompare(b.fecha))
    };

    return NextResponse.json({
      resumen: {
        totalCotizaciones,
        montoTotalCotizado,
        totalOrdenes,
        montoTotalOrdenes,
        conversionPorcentaje,
        cotizacionesSinOC
      },
      clientes: {
        topMonto: topClientesMonto,
        topCotizaciones: topClientesCotizaciones
      },
      graficas
    });
  } catch (error) {
    console.error('Error reportes:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
