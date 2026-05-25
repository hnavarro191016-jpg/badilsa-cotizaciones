import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET: Obtener todas las facturas
export async function GET() {
  try {
    const facturas = await prisma.factura.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        cotizacion: true, // Incluir la información de la cotización ligada si existe
      },
    });

    return NextResponse.json(facturas);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    return NextResponse.json(
      { error: 'Error al obtener las facturas' },
      { status: 500 }
    );
  }
}

// PATCH: Actualizar el estatus de pago o ligar a una cotización
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, estatusPago, cotizacionId } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de factura requerido' }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (estatusPago !== undefined) dataToUpdate.estatusPago = estatusPago;
    if (cotizacionId !== undefined) dataToUpdate.cotizacionId = cotizacionId === '' ? null : cotizacionId;

    const factura = await prisma.factura.update({
      where: { id },
      data: dataToUpdate,
      include: {
        cotizacion: true
      }
    });

    return NextResponse.json(factura);
  } catch (error) {
    console.error('Error al actualizar factura:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la factura' },
      { status: 500 }
    );
  }
}
