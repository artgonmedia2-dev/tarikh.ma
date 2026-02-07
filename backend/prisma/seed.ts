import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const permissions = [
    { code: 'document:create', label: 'Créer des documents' },
    { code: 'document:read', label: 'Lire les documents' },
    { code: 'document:update', label: 'Modifier les documents' },
    { code: 'document:delete', label: 'Supprimer les documents' },
    { code: 'document:publish', label: 'Publier les documents' },
    { code: 'user:read', label: 'Voir les utilisateurs' },
    { code: 'user:create', label: 'Créer des utilisateurs' },
    { code: 'user:update', label: 'Modifier les utilisateurs' },
    { code: 'user:delete', label: 'Supprimer des utilisateurs' },
    { code: 'role:manage', label: 'Gérer les rôles et permissions' },
    { code: 'analytics:read', label: 'Voir les statistiques' },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { code: p.code },
      create: p,
      update: { label: p.label },
    });
  }

  const adminRole = await prisma.role.upsert({
    where: { name: 'Administrateur' },
    create: { name: 'Administrateur', description: 'Accès complet' },
    update: {},
  });

  const editorRole = await prisma.role.upsert({
    where: { name: 'Éditeur' },
    create: { name: 'Éditeur', description: 'Création et édition de contenu' },
    update: {},
  });

  const readerRole = await prisma.role.upsert({
    where: { name: 'Lecteur' },
    create: { name: 'Lecteur', description: 'Lecture seule' },
    update: {},
  });

  const allPerms = await prisma.permission.findMany();
  for (const p of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
      create: { roleId: adminRole.id, permissionId: p.id },
      update: {},
    });
  }

  const editorPerms = ['document:create', 'document:read', 'document:update', 'document:publish', 'analytics:read'];
  for (const code of editorPerms) {
    const perm = await prisma.permission.findUnique({ where: { code } });
    if (perm)
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: editorRole.id, permissionId: perm.id } },
        create: { roleId: editorRole.id, permissionId: perm.id },
        update: {},
      });
  }

  const readerPerms = ['document:read'];
  for (const code of readerPerms) {
    const perm = await prisma.permission.findUnique({ where: { code } });
    if (perm)
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: readerRole.id, permissionId: perm.id } },
        create: { roleId: readerRole.id, permissionId: perm.id },
        update: {},
      });
  }

  console.log('Seed OK: rôles et permissions créés.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
