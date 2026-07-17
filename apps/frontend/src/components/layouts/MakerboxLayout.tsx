import { useState } from 'react';
import Sidebar from '@components/Sidebar/Sidebar';
import { useLocation } from '@tanstack/react-router';

export default function MakerboxLayout({ children, userData, logout }: { children: React.ReactNode, userData: any, logout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = useLocation({
    select: (location) => location.pathname,
  });
  const cleanPath = pathname.replace('/manager', '').replace('/', '');

  return (
    <>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userData={userData}
        activeId={cleanPath}
        logout={logout}
      />
      <main className="w-full p-5 overflow-y-auto">
        {children}
      </main>
    </>
  )
}
