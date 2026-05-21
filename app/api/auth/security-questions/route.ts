import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.username) {
      return NextResponse.json({ error: 'Falta el nombre de usuario' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username: data.username },
      select: {
        preguntaSecreta1: true,
        preguntaSecreta2: true,
        estatus: true
      }
    });

    if (!user) {
      // Devolver error genérico por seguridad (no confirmar si existe o no, aunque aquí es mejor avisar)
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (!user.preguntaSecreta1 || !user.preguntaSecreta2) {
      return NextResponse.json({ error: 'Este usuario no tiene preguntas secretas configuradas. Contacte al administrador.' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      pregunta1: user.preguntaSecreta1,
      pregunta2: user.preguntaSecreta2
    });

  } catch (error) {
    console.error('Error al obtener preguntas secretas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
