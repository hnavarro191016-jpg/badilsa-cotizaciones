"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function InactivityTimer() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // No iniciar timer en páginas públicas
    if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname.startsWith('/cotizacion/ver')) {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 20 minutos de inactividad
      timeoutId = setTimeout(logoutUser, 20 * 60 * 1000);
    };

    const logoutUser = async () => {
      try {
        await fetch('/api/auth/login', { method: 'DELETE' });
        router.push('/login?expired=true');
        router.refresh();
      } catch (err) {
        console.error("Error auto-logging out", err);
      }
    };

    // Listeners para detectar actividad del usuario
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Iniciar temporizador
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [pathname, router]);

  return null;
}
