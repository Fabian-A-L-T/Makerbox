import './Sidebar.css'
import logo from '../../assets/logo.png'
import { RiWrenchLine, RiHome2Line, RiCpuLine, RiPencilRulerLine, RiLogoutBoxRLine, RiMoonLine, RiSunLine, RiNodeTree, RiMapPinLine, RiGroupLine, RiSwap2Line, type RemixiconComponentType, RiBuilding3Line, RiMore2Line, RiUserSettingsLine, RiAddLine } from '@remixicon/react';
import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Switch } from '@components/ui/Switch';
import { Button } from '@components/form/Button';
import { Menu, MenuItem, MenuSeparator, MenuTrigger} from '@components/ui/Menu';
import { getInitialTheme } from '@utils/Utils';

interface NavItem {
  link: string,
  label: string,
  icon: RemixiconComponentType
}

interface NavGroup {
  title: string,
  items: NavItem[],
  show: boolean
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  userData: any
  activeId: string;
  logout: () => void;
}

export default function Sidebar({ isOpen = true, onClose, userData, activeId, logout }: SidebarProps) {
	const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme());
	const appVersion = import.meta.env.VITE_APP_VERSION;
	const buildMode = import.meta.env.MODE;

  	const navGroups: NavGroup[] = [
		{
			title: '',
			show: true,
			items: [
			{
				link: '',
				label: 'Inicio',
				icon: RiHome2Line,
			},
			{
				link: 'projects',
				label: 'Mis proyectos',
				icon: RiPencilRulerLine,
			}
			],
		},
		{
			title: 'Inventario',
			show: true,
			items: [
			{
				link: 'components',
				label: 'Componentes',
				icon: RiCpuLine,
			},
			{
				link: 'tools',
				label: 'Herramientas',
				icon: RiWrenchLine,
			}
			],
		},
		{
			title: 'Gestionar',
			show: userData.role === 'admin',
			items: [
				{
					label: 'Componentes',
					icon: RiCpuLine,
					link: 'admin/components'
				},
				{
					label: 'Herramientas', 
					icon: RiWrenchLine,
					link: 'admin/tools'
				},
				{
					label: 'Proyectos',
					icon: RiPencilRulerLine,
					link: 'admin/projects'
				},
				{
					label: 'Categorías', 
					icon: RiNodeTree,
					link: 'admin/categories/components'
				},
				{
					label: 'Fabricantes',
					icon: RiBuilding3Line,
					link: 'admin/manufacturers'
				},
				{
					label: 'Ubicaciones',
					icon: RiMapPinLine,
					link: 'admin/locations'
				},
				{
					label: 'Usuarios', 
					icon: RiGroupLine,
					link: 'admin/users'
				},
				{
					label: 'Movimientos',
					icon: RiSwap2Line,
					link: 'admin/movements'
				}
			]
		}
	]

	useEffect(() => {
		const root = document.documentElement
		root.dataset.theme = theme
		root.style.colorScheme = theme
		window.localStorage.setItem('theme', theme)
	}, [theme])

  	const isDarkTheme = theme === 'dark'

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
			<nav className="sidebar__nav h-full" aria-label="Main navigation">
				<div className='sidebar__logo'>
					<img className='mx-auto' src={logo} alt="logo" />
				</div>

				<div className='flex gap-2 p-2 items-center justify-between border-y-1 border-[var(--color-border)]'>
					<div className='flex gap-2 items-center'>
						<div className="sidebar__header-avatar">{userData.name.substring(0, 2).toUpperCase()}</div>
						<div className='flex flex-col overflow-hidden'>
							<span className="text-sm">{userData.name}</span>
							<span className="text-xs text-[var(--color-text-muted)]">{userData.role}</span>
						</div>
					</div>
					<MenuTrigger placement='bottom right'>
						<Button className='!border-none !outline-none' aria-label="Actions" variant="quiet">
							<RiMore2Line size={16}/>
						</Button>
						<Menu shouldCloseOnSelect={false}>
							<MenuItem shouldCloseOnSelect>
								<Link className='flex gap-2' to='/manager/newProject'>
									<RiAddLine size={20}/>
									Nuevo proyecto
								</Link>
							</MenuItem>
							<MenuItem shouldCloseOnSelect>
								<Link className='flex gap-2' to='/manager/account'>
									<RiUserSettingsLine size={20}/>
									Configuración de la cuenta
								</Link>
							</MenuItem>
							<MenuSeparator/>
							<MenuItem>
								<Switch
									className="cursor-pointer rounded-[var(--border-radius-ui)] text-[var(--color-text)]"
									ActiveIcon={<RiMoonLine size={14} />}
									InactiveIcon={<RiSunLine size={14} />}
									isSelected={isDarkTheme}
									onChange={(selected) => setTheme(selected ? 'dark' : 'light')}
									>
									<span className="whitespace-nowrap">{isDarkTheme ? 'Modo oscuro' : 'Modo claro'}</span>
								</Switch>
							</MenuItem>
						</Menu>
					</MenuTrigger>
				</div>
				{navGroups.map((group) => {
					if(!group.show) return null;
					return (
					<div key={group.title} className="sidebar__group">
						{group.title && <span className="sidebar__group-title">{group.title}</span>}
						<ul className="sidebar__list" role="list">
							{group.items.map((item) => (
							<li key={group.title + '-' + item.link}>
								<Link
								className={`sidebar__item ${activeId === item.link ? 'sidebar__item--active' : ''}`}
								aria-current={activeId === item.link ? 'page' : undefined}
								to={(item.link ? `/manager/${item.link}` : '/manager') as any}
								>
								<item.icon />
								<span className="sidebar__item-label">{item.label}</span>
								</Link>
							</li>
							))}
						</ul>
					</div>
					)}
				)}

				<div key="logout" className="sidebar__group mt-auto">
					<button
					className={`sidebar__item`}
					onClick={logout}
					type='button' 
					>
						<span className="sidebar__item-icon"><RiLogoutBoxRLine /></span>
						<span className="sidebar__item-label">Cerrar sesión</span>
					</button>
				</div>
				<span className='text-xs text-[var(--color-text-muted)]'>Ver. {appVersion} ({buildMode})</span>
			</nav>
		</aside>
		</>
	)
}
