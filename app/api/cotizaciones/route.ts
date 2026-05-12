import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

type ItemInput = {
  cantidad: number;
  unidad: string;
  descripcion: string;
  precioUnitario: number;
  valorDolar: number;
};

export async function GET() {
  try {
    const cotizaciones = await prisma.cotizacion.findMany({
      include: { items: true, archivosOC: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(cotizaciones);
  } catch (error) {
    console.error('Error reading cotizaciones:', error);
    return NextResponse.json({ error: 'No se pudieron leer las cotizaciones' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { folio, fecha, atencion, empresa, moneda, observaciones, tiempoEntrega, items } = data;

    if (!folio || !fecha || !atencion || !empresa || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Datos incompletos de cotizacion' }, { status: 400 });
    }

    const cleanItems: ItemInput[] = items.map((item: any) => ({
      cantidad: Number(item.cantidad) || 0,
      unidad: String(item.unidad || ''),
      descripcion: String(item.descripcion || ''),
      precioUnitario: Number(item.precioUnitario) || 0,
      valorDolar: Number(item.valorDolar) || 1,
    }));

    const subTotal = cleanItems.reduce((acc, item) => acc + item.cantidad * item.precioUnitario * item.valorDolar, 0);
    const iva = subTotal * 0.16;
    const total = subTotal + iva;

    const existing = await prisma.cotizacion.findUnique({ where: { folio } });

    if (existing) {
      await prisma.$transaction([
        prisma.itemCotizacion.deleteMany({ where: { cotizacionId: existing.id } }),
        prisma.cotizacion.update({
          where: { id: existing.id },
          data: {
            fecha,
            atencion,
            empresa,
            moneda,
            observaciones,
            tiempoEntrega,
            subTotal,
            iva,
            total,
            items: { create: cleanItems },
          },
        }),
      ]);
    } else {
      await prisma.cotizacion.create({
        data: {
          folio,
          fecha,
          atencion,
          empresa,
          moneda,
          observaciones,
          tiempoEntrega,
          subTotal,
          iva,
          total,
          items: { create: cleanItems },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving cotizacion:', error);
    return NextResponse.json({ error: 'No se pudo guardar la cotizacion' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folio = searchParams.get('folio');

    if (!folio) {
      return NextResponse.json({ error: 'Folio requerido' }, { status: 400 });
    }

    await prisma.cotizacion.delete({ where: { folio } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cotizacion:', error);
    return NextResponse.json({ error: 'No se pudo eliminar la cotizacion' }, { status: 500 });
  }
}
