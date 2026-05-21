import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validar datos mínimos
    if (!data.username || !data.password || !data.nombre || !data.preguntaSecreta1 || !data.respuestaSecreta1 || !data.preguntaSecreta2 || !data.respuestaSecreta2) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'El nombre de usuario ya existe' }, { status: 400 });
    }

    // Encriptar la contraseña y las respuestas secretas
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    
    // Las respuestas se pasan a minúsculas y se les quitan los espacios al inicio y final para evitar errores comunes
    const cleanResp1 = data.respuestaSecreta1.trim().toLowerCase();
    const cleanResp2 = data.respuestaSecreta2.trim().toLowerCase();
    
    const hashedResp1 = await bcrypt.hash(cleanResp1, salt);
    const hashedResp2 = await bcrypt.hash(cleanResp2, salt);

    // Si es el primer usuario en toda la base de datos, lo hacemos ADMIN automáticamente
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'ADMIN' : 'USER';
    const estatus = userCount === 0 ? 'ACTIVO' : 'PENDIENTE';

    const newUser = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        nombre: data.nombre,
        apellido: data.apellido || null,
        telefono: data.telefono || null,
        email: data.email || null,
        role: role,
        estatus: estatus,
        preguntaSecreta1: data.preguntaSecreta1,
        respuestaSecreta1: hashedResp1,
        preguntaSecreta2: data.preguntaSecreta2,
        respuestaSecreta2: hashedResp2,
        requiresPasswordChange: false // Como ellos mismos la definen, no ocupan cambiarla al entrar
      },
    });

    return NextResponse.json({ 
      success: true, 
      user: { id: newUser.id, username: newUser.username, role: newUser.role, estatus: newUser.estatus }
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
