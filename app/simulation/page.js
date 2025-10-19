'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Scene from "../components/racetrack";

export default function SimulationPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to loading page after 30 seconds
    const timer = setTimeout(() => {
      router.push('/loading');
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main>
      <Scene />
    </main>
  );
}

