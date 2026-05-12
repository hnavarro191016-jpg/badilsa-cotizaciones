import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const ordenes = await prisma.ordenCompra.findMany({
      include: {
        cotizacion: true
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(ordenes);
  } catch (error) {
    console.error('Error reading ordenes de compra:', error);
    return NextResponse.json({ error: 'No se pudieron leer las órdenes de compra' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { cotizacionId } = data;

    if (!cotizacionId) {
      return NextResponse.json({ error: 'cotizacionId requerido' }, { status: 400 });
    }

    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: cotizacionId }
    });

    if (!cotizacion) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 });
    }

    // Check if OC already exists
    const existingOc = await prisma.ordenCompra.findUnique({
      where: { cotizacionId }
    });

    if (existingOc) {
      return NextResponse.json({ error: 'Ya existe una Orden de Compra para esta cotización' }, { status: 400 });
    }

    // Generate OC folio: OC-BMA0003-08052026
    const folio_oc = `OC-${cotizacion.folio}`;

    // Use transaction to create OC and update Cotizacion status
    const result = await prisma.$transaction(async (tx) => {
      const oc = await tx.ordenCompra.create({
        data: {
          folio_oc,
          cotizacionId: cotizacion.id,
          total: cotizacion.total,
          estatus: 'PENDIENTE',
        }
      });

      await tx.cotizacion.update({
        where: { id: cotizacion.id },
        data: { estatus: 'ACEPTADA' }
      });

      return oc;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating orden de compra:', error);
    return NextResponse.json({ error: 'No se pudo crear la Orden de Compra' }, { status: 500 });
  }
}
