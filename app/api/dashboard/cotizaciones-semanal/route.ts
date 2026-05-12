import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const cotizaciones = await prisma.cotizacion.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
        total: true,
        moneda: true,
      },
    });

    let total_cotizaciones_semana = 0;
    let total_monto_semana_mxn = 0;
    let total_monto_semana_usd = 0;
    const porDia: Record<string, { cantidad: number; totalMXN: number; totalUSD: number }> = {};

    // Initialize last 7 days to 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      porDia[dateString] = { cantidad: 0, totalMXN: 0, totalUSD: 0 };
    }

    cotizaciones.forEach((c) => {
      total_cotizaciones_semana++;
      if (c.moneda === 'DOLARES' || c.moneda === 'USD') {
        total_monto_semana_usd += c.total || 0;
      } else {
        total_monto_semana_mxn += c.total || 0;
      }
      
      const dateString = c.createdAt.toISOString().split('T')[0];
      if (porDia[dateString]) {
        porDia[dateString].cantidad++;
        if (c.moneda === 'DOLARES' || c.moneda === 'USD') {
          porDia[dateString].totalUSD += c.total || 0;
        } else {
          porDia[dateString].totalMXN += c.total || 0;
        }
      }
    });

    const cotizaciones_por_dia = Object.keys(porDia).map((fecha) => ({
      fecha,
      cantidad: porDia[fecha].cantidad,
    }));

    const monto_por_dia = Object.keys(porDia).map((fecha) => ({
      fecha,
      totalMXN: porDia[fecha].totalMXN,
      totalUSD: porDia[fecha].totalUSD,
    }));

    return NextResponse.json({
      total_cotizaciones_semana,
      total_monto_semana_mxn,
      total_monto_semana_usd,
      cotizaciones_por_dia,
      monto_por_dia,
    });
  } catch (error) {
    console.error('Error fetching dashboard cotizaciones:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
