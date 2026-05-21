import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.username || !data.respuesta1 || !data.respuesta2 || !data.newPassword) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (!user || !user.respuestaSecreta1 || !user.respuestaSecreta2) {
      return NextResponse.json({ error: 'Usuario no encontrado o no tiene preguntas configuradas' }, { status: 400 });
    }

    // Normalizar las respuestas (minúsculas y sin espacios extra)
    const cleanResp1 = data.respuesta1.trim().toLowerCase();
    const cleanResp2 = data.respuesta2.trim().toLowerCase();

    // Verificar las respuestas
    const isValid1 = await bcrypt.compare(cleanResp1, user.respuestaSecreta1);
    const isValid2 = await bcrypt.compare(cleanResp2, user.respuestaSecreta2);

    if (!isValid1 || !isValid2) {
      return NextResponse.json({ error: 'Una o más respuestas son incorrectas' }, { status: 401 });
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        requiresPasswordChange: false
      }
    });

    return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente' });

  } catch (error) {
    console.error('Error al resetear contraseña:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
