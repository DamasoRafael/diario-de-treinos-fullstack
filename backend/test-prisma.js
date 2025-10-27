const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Tentando conectar com o Prisma...');
  const userCount = await prisma.user.count();
  console.log(`✅ Conexão bem-sucedida!`);
  console.log(`Existem ${userCount} usuários no banco de dados.`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao conectar com o Prisma:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });