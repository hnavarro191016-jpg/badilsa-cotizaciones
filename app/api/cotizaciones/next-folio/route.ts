import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cotizaciones = await prisma.cotizacion.findMany({
      select: { folio: true },
    });

    let maxNum = 0;

    for (const cotizacion of cotizaciones) {
      const match = cotizacion.folio.match(/^BMA(\d+)/i) ?? cotizacion.folio.match(/\d+/);
      if (!match) continue;

      const num = parseInt(match[0].replace(/\D/g, ''), 10);
      if (!Number.isNaN(num) && num > maxNum) maxNum = num;
    }

    const folio = `BMA${String(maxNum + 1).padStart(5, '0')}`;

    return NextResponse.json({ folio });
  } catch (error) {
    console.error('Error getting next folio:', error);
    return NextResponse.json({ error: 'No se pudo generar el folio' }, { status: 500 });
  }
}
