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
      },
    });

    let total_cotizaciones_semana = 0;
    let total_monto_semana = 0;
    const porDia: Record<string, { cantidad: number; total: number }> = {};

    // Initialize last 7 days to 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      porDia[dateString] = { cantidad: 0, total: 0 };
    }

    cotizaciones.forEach((c) => {
      total_cotizaciones_semana++;
      total_monto_semana += c.total || 0;
      
      const dateString = c.createdAt.toISOString().split('T')[0];
      if (porDia[dateString]) {
        porDia[dateString].cantidad++;
        porDia[dateString].total += c.total || 0;
      }
    });

    const cotizaciones_por_dia = Object.keys(porDia).map((fecha) => ({
      fecha,
      cantidad: porDia[fecha].cantidad,
    }));

    const monto_por_dia = Object.keys(porDia).map((fecha) => ({
      fecha,
      total: porDia[fecha].total,
    }));

    return NextResponse.json({
      total_cotizaciones_semana,
      total_monto_semana,
      cotizaciones_por_dia,
      monto_por_dia,
    });
  } catch (error) {
    console.error('Error fetching dashboard cotizaciones:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
