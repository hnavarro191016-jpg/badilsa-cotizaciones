import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Badilsa - Cotizaciones',
  description: 'Sistema de cotizaciones para Badilsa Maquinados',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Badilsa',
  },
}

import InactivityTimer from '@/components/InactivityTimer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <InactivityTimer />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
