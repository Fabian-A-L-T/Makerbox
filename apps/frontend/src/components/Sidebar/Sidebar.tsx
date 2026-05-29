import './Sidebar.css'
import logo from '../../assets/logo.png'
import { RiWrenchLine, RiHome2Line, RiCpuLine, RiPencilRulerLine, RiLogoutBoxRLine } from '@remixicon/react';
import { Link } from '@tanstack/react-router';

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  badge?: number
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      {
        id: '',
        label: 'Inicio',
        icon: (
          <RiHome2Line />
        ),
      },
      {
        id: 'components',
        label: 'Componentes',
        icon: (
          <RiCpuLine />
        ),
      },
      {
        id: 'tools',
        label: 'Herramientas',
        icon: (
          <RiWrenchLine />
        ),
      },
      {
        id: 'projects',
        label: 'Proyectos',
        icon: (
          <RiPencilRulerLine />
        ),
      },
    ],
  },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  userData: any
  activeId: string;
  logout: () => void;
}

export default function Sidebar({ isOpen = true, onClose, userData, activeId, logout }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar__overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <nav className="sidebar__nav" aria-label="Main navigation">
          
          <div className='sidebar__logo'>
            <img src={logo} alt="logo" />
          </div>

          <div className='sidebar__header'>
            <div className="sidebar__header-avatar">{userData.name.substring(0, 2).toUpperCase()}</div>
            <div className='sidebar__header-info'>
              <span className="sidebar__header-name">{userData.name}</span>
              <span className="sidebar__header-role">{userData.role}</span>
            </div>
          </div>

          {navGroups.map((group) => {
            if(group.title === 'Manage' && userData.role !== 'admin') return null;
            return (
            <div key={group.title} className="sidebar__group">
              <span className="sidebar__group-title">{group.title}</span>
              <ul className="sidebar__list" role="list">
                {group.items.map(item => (
                  <li key={item.id}>
                    <Link
                      className={`sidebar__item ${activeId === item.id ? 'sidebar__item--active' : ''}`}
                      aria-current={activeId === item.id ? 'page' : undefined}
                      to={`/manager/${item.id}`}
                    >
                      <span className="sidebar__item-icon">{item.icon}</span>
                      <span className="sidebar__item-label">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            )}
          )}
          <div key="logout" className="sidebar__group">
              <button
                className={`sidebar__item`}
                onClick={logout}
                type='button' 
              >
                <span className="sidebar__item-icon"><RiLogoutBoxRLine /></span>
                <span className="sidebar__item-label">Cerrar sesión</span>
              </button>
            </div>
        </nav>
      </aside>
    </>
  )
}
