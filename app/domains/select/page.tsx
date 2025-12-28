"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SelectDomainsPage() {
  const [isLocked, setIsLocked] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Check if domains are already locked
    const checkLockedDomains = async () => {
      const response = await fetch('/api/domains/locked');
      if (response.ok) {
        const data = await response.json();
        if (data.locked) {
          setIsLocked(true);
          router.push('/domains');
        }
      }
    };

    checkLockedDomains();
  }, [router]);

  const handleDomainSelection = (domainId: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domainId)
        ? prev.filter((id) => id !== domainId)
        : [...prev, domainId]
    );
  };

  const handleSubmit = async () => {
    if (selectedDomains.length < 1 || selectedDomains.length > 2) {
      alert('Please select 1 or 2 domains.');
      return;
    }

    const response = await fetch('/api/domains/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domainIds: selectedDomains }),
    });

    if (response.ok) {
      router.push('/domains');
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to lock domains.');
    }
  };

  if (isLocked) {
    return null; // Prevent rendering if redirecting
  }

  return (
    <div>
      <h1>Select Your Domains</h1>
      <div>
        {/* Replace with dynamic domain list */}
        {['domain1', 'domain2', 'domain3'].map((domain) => (
          <div key={domain}>
            <label>
              <input
                type="checkbox"
                value={domain}
                checked={selectedDomains.includes(domain)}
                onChange={() => handleDomainSelection(domain)}
              />
              {domain}
            </label>
          </div>
        ))}
      </div>
      <button onClick={handleSubmit}>Lock Domains</button>
    </div>
  );
}