// Executado a cada start: garante as 2 empresas e o usuário administrador inicial.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.empresa.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, nome: "Empresa 1 · Obras", descricao: "Participação em obras por administração" },
  });
  await prisma.empresa.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, nome: "Empresa 2 · Leilão", descricao: "Leilão de imóveis" },
  });

  const total = await prisma.user.count();
  if (total === 0) {
    const email = (process.env.ADMIN_EMAIL || "admin@sass.local").toLowerCase().trim();
    const senha = process.env.ADMIN_PASSWORD || "admin123";
    await prisma.user.create({
      data: {
        nome: "Administrador",
        email,
        senhaHash: await bcrypt.hash(senha, 10),
        role: "ADMIN",
      },
    });
    console.log(`[seed] Usuário administrador criado: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error("[seed] Falha:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
