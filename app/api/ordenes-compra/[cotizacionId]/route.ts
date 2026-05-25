import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request, { params }: { params: { cotizacionId: string } }) {
  try {
    const archivos = await prisma.ordenCompraArchivo.findMany({
      where: { cotizacionId: params.cotizacionId },
      orderBy: { fechaSubida: 'desc' }
    });
    return NextResponse.json(archivos);
  } catch (error) {
    console.error('Error al obtener archivos:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { cotizacionId: string } }) {
  try {
    const data = await request.json();
    const { estatusOC } = data;

    if (!estatusOC) {
      return NextResponse.json({ error: 'Falta estatusOC' }, { status: 400 });
    }

    const updated = await prisma.cotizacion.update({
      where: { id: params.cotizacionId },
      data: { estatusOC }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error al actualizar estatus OC:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { cotizacionId: string } }) {
  try {
    await prisma.ordenCompraArchivo.deleteMany({
      where: { cotizacionId: params.cotizacionId }
    });
    
    await prisma.cotizacion.update({
      where: { id: params.cotizacionId },
      data: { estatusOC: 'PENDIENTE' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar OC:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
