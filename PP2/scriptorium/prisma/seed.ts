const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: "test@gmail.com",
    },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: "test@gmail.com",
        firstName: "Test",
        lastName: "Account",
        passwordHash: await bcrypt.hash("StrongPassword123!", 10),
        phoneNumber: "1234567890",
        avatarUrl: "https://example.com/avatar.jpg",
        permission: "ADMIN",
      },
    });
  }
}

main().catch((e) => console.error(e)).finally(async () => {
  await prisma.$disconnect();
});