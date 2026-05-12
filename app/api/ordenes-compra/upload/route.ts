import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { cotizacionId, nombreArchivo, fileData } = data;

    if (!cotizacionId || !nombreArchivo || !fileData) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const archivo = await prisma.ordenCompraArchivo.create({
      data: {
        cotizacionId,
        nombreArchivo,
        fileData
      }
    });

    await prisma.cotizacion.update({
      where: { id: cotizacionId },
      data: { estatusOC: 'RECIBIDA' }
    });

    return NextResponse.json({ success: true, data: archivo });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
