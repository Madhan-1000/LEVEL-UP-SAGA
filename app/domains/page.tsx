import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export default async function DomainsPage() {
  const { userId } = auth();
  if (!userId) {
    return <div>Please log in to view your domains.</div>;
  }

  const lockedDomains = await prisma.userDomain.findMany({
    where: { userId, locked: true },
    include: { domain: true },
  });

  return (
    <div>
      <h1>Your Locked Domains</h1>
      {lockedDomains.length === 0 ? (
        <p>You have not selected any domains.</p>
      ) : (
        <ul>
          {lockedDomains.map((domain) => (
            <li key={domain.id}>{domain.domain.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}