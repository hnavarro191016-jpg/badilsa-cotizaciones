import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import PublicCotizacion from './PublicCotizacion';

export default async function VerCotizacionPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const cotizacion = await prisma.cotizacion.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!cotizacion) {
    return notFound();
  }

  return <PublicCotizacion cotizacion={cotizacion} />;
}
