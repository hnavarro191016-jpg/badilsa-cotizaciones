import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folio = searchParams.get('folio');

    if (folio) {
      const remision = await prisma.notaRemision.findUnique({
        where: { folio },
        include: { items: true, cotizacion: true }
      });
      if (!remision) return NextResponse.json({ error: 'Nota de remisión no encontrada' }, { status: 404 });
      return NextResponse.json(remision);
    }

    const remisiones = await prisma.notaRemision.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true, cotizacion: { select: { folio: true } } }
    });

    return NextResponse.json(remisiones);
  } catch (error) {
    console.error("Error fetching notas de remision:", error);
    return NextResponse.json({ error: 'Failed to fetch notas de remision' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const {
      folio, fecha, condiciones, cliente, direccion, ciudad, rfc, tel, lugarExp, cotizacionId, items
    } = data;

    if (!folio || !fecha || !cliente) {
      return NextResponse.json({ error: 'Faltan campos requeridos (folio, fecha, cliente)' }, { status: 400 });
    }

    const existingRemision = await prisma.notaRemision.findUnique({ where: { folio } });

    if (existingRemision) {
      // Update
      await prisma.itemNotaRemision.deleteMany({ where: { notaRemisionId: existingRemision.id } });

      const updated = await prisma.notaRemision.update({
        where: { id: existingRemision.id },
        data: {
          fecha,
          condiciones,
          cliente,
          direccion,
          ciudad,
          rfc,
          tel,
          lugarExp,
          cotizacionId: cotizacionId || null,
          items: {
            create: items.map((i: any) => ({
              cantidad: Number(i.cantidad),
              descripcion: i.descripcion
            }))
          }
        },
        include: { items: true }
      });
      return NextResponse.json(updated);
    } else {
      // Create
      const created = await prisma.notaRemision.create({
        data: {
          folio,
          fecha,
          condiciones,
          cliente,
          direccion,
          ciudad,
          rfc,
          tel,
          lugarExp,
          cotizacionId: cotizacionId || null,
          items: {
            create: items.map((i: any) => ({
              cantidad: Number(i.cantidad),
              descripcion: i.descripcion
            }))
          }
        },
        include: { items: true }
      });
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error("Error saving nota de remision:", error);
    return NextResponse.json({ error: 'Failed to save nota de remision' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folio = searchParams.get('folio');
    if (!folio) return NextResponse.json({ error: 'Folio required' }, { status: 400 });

    await prisma.notaRemision.delete({ where: { folio } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting nota de remision:", error);
    return NextResponse.json({ error: 'Failed to delete nota de remision' }, { status: 500 });
  }
}
