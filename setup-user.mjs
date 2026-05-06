import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';

if (fs.existsSync('.env')) {
  const envFile = fs.readFileSync('.env', 'utf8');
  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    const value = rawValue.trim().replace(/^["']|["']$/g, '');
    process.env[key] ??= value;
  }
}

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const plainPassword = process.env.ADMIN_PASSWORD || 'password123';

  // Check if admin already exists
  const existingUser = await prisma.user.findUnique({
    where: { username }
  });

  if (existingUser) {
    console.log(`El usuario '${username}' ya existe.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.create({
    data: {
      username: username,
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log(`\n================================`);
  console.log(`✅ Usuario creado exitosamente!`);
  console.log(`👤 Usuario: ${user.username}`);
  console.log(`🔑 Contraseña: ${plainPassword}`);
  console.log(`================================\n`);
  console.log(`NOTA: Puedes iniciar sesión y luego si quieres cambiar esta contraseña, me avisas para agregar esa función.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
