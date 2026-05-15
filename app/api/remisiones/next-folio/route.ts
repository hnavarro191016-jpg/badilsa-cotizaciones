import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    // Buscar la última nota de remisión para generar el siguiente folio numérico
    const ultimaRemision = await prisma.notaRemision.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!ultimaRemision) {
      return NextResponse.json({ folio: '004259' }); // O el número con el que quieran empezar si es la primera
    }

    // El folio de la nota suele ser numérico según la imagen
    const folioStr = ultimaRemision.folio.replace(/\D/g, ''); // Quitar letras por si acaso
    const numeroActual = parseInt(folioStr || '4259', 10);
    const siguienteNumero = numeroActual + 1;
    
    // Rellenar con ceros a la izquierda, ej. 004260
    const siguienteFolio = siguienteNumero.toString().padStart(6, '0');

    return NextResponse.json({ folio: siguienteFolio });
  } catch (error) {
    console.error("Error fetching next remision folio:", error);
    return NextResponse.json({ error: 'Failed to fetch next folio' }, { status: 500 });
  }
}
