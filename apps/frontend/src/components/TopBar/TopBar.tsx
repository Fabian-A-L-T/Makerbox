import { useState } from 'react'
import './TopBar.css'

interface TopBarProps {
  onMenuToggle?: () => void
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const [searchValue, setSearchValue] = useState('')

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          className="topbar__menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <span className="topbar__menu-icon" />
          <span className="topbar__menu-icon" />
          <span className="topbar__menu-icon" />
        </button>

        <div className="topbar__logo">
          <span className="topbar__logo-icon">📦</span>
          <span className="topbar__logo-text">MakerBox</span>
        </div>
      </div>

      <div className="topbar__center">
        <div className="topbar__search">
          <svg className="topbar__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            className="topbar__search-input"
            placeholder="Search content…"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            aria-label="Search content"
          />
        </div>
      </div>

      <div className="topbar__right">
        <button className="topbar__avatar" aria-label="User menu">
          <span>JD</span>
        </button>
      </div>
    </header>
  )
}
