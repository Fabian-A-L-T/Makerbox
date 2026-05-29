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
      <div className="app__body">
        <main className="app__main">
          {children}
        </main>
      </div>
    </div>
  )
}

export default CMSLayout
