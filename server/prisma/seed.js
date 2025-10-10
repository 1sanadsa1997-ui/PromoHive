const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function main(){
  const prisma = new PrismaClient();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if(!adminPassword){
    console.error('ADMIN_PASSWORD not set in environment. Aborting seed.');
    process.exit(1);
  }

  // create admin record
  const adminEmail = 'admin@promohive.test';
  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if(!existingAdmin){
    const hashed = await bcrypt.hash(adminPassword, 10);
    // store admin but do not store password in Admin model; admin auth uses ADMIN_PASSWORD env for now
    const admin = await prisma.admin.create({ data: { email: adminEmail, name: 'PromoHive Admin' } });
    console.log('Created admin:', admin.email);
  } else {
    console.log('Admin already exists:', existingAdmin.email);
  }

  // create sample user
  const userEmail = 'user@example.com';
  const existingUser = await prisma.user.findUnique({ where: { email: userEmail } });
  if(!existingUser){
    const hash = await bcrypt.hash('Password123!', 10);
    const user = await prisma.user.create({ data: { email: userEmail, passwordHash: hash, name: 'Demo User', verified: true, balance: 1240.0 } });
    console.log('Created demo user:', user.email);
  } else {
    console.log('Demo user exists:', existingUser.email);
  }

  // create sample task
  const tasks = await prisma.task.findMany();
  if(tasks.length === 0){
    const t = await prisma.task.create({ data: { title: 'Share on Twitter', description: 'Post about product launch and include hashtag', type: 'social', reward: 5.0 } });
    console.log('Created sample task:', t.title);
  } else {
    console.log('Tasks already present:', tasks.length);
  }

  // sample transaction
  const users = await prisma.user.findMany({ where: { email: userEmail } });
  if(users.length){
    const u = users[0];
    const tx = await prisma.transaction.create({ data: { userId: u.id, amount: 8.0, type: 'reward' } });
    console.log('Created sample transaction for', u.email);
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
