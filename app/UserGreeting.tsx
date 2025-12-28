"use client";

import { useUser } from '@clerk/nextjs';

export default function UserGreeting() {
  const { user } = useUser();

  return <div className="top-right">{user ? user.firstName : 'Enter the system'}</div>;
}