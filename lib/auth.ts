import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'mi_secreto_super_seguro_badilsa_2026'
);

type SessionPayload = {
  id: string;
  username: string;
  role?: string;
};

export async function getCurrentUser() {
  const token = cookies().get('badilsa_token')?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const session = payload as SessionPayload;

    if (!session.id) return null;

    return prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        username: true,
        role: true,
        nombre: true,
        apellido: true,
        telefono: true,
        createdAt: true,
      },
    });
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  return user?.role === 'ADMIN' ? user : null;
}
