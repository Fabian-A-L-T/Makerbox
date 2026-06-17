import { useState } from 'react';
import Sidebar from '@components/Sidebar/Sidebar';
import '@styles/cms.css';
import { useLocation } from '@tanstack/react-router';

function CMSLayout({ children, userData, logout }: { children: React.ReactNode, userData: any, logout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = useLocation({
    select: (location) => location.pathname,
  });
  const cleanPath = pathname.replace('/manager', '').replace('/', '');

  return (
    <div className="flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userData={userData}
        activeId={cleanPath}
        logout={logout}
      />
      <main className="w-full p-5 overflow-y-auto bg-[var(--color-background)]">
        {children}
      </main>
    </div>
  )
}

export default CMSLayout
