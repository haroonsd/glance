import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckSquare, Inbox, LayoutDashboard, Users, Settings, ChevronLeft, ChevronRight, FolderKanban, Kanban, Activity } from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { WatcherEye } from './WatcherEye'
import { getInitials, stringToColor } from '../lib/utils'

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: CheckSquare, label: 'My Tasks', path: '/tasks' },
  { icon: Kanban, label: 'Board', path: '/board' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: Activity, label: 'Live Now', path: '/live', live: true },
]

export function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuthStore()

  return (
    <motion.div
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col h-full bg-[var(--color-surface)] border-r border-[var(--color-border)] overflow-hidden shrink-0"
    >
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--color-border)]">
        <div className="shrink-0">
          <WatcherEye size={32} blink track animate={false} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
              className="text-base font-bold tracking-tight whitespace-nowrap">
              Glance
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        {NAV.map(({ icon: Icon, label, path, live }) => {
          const active = location.pathname === path
          return (
            <button key={path} onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group relative
                ${active ? 'bg-[var(--color-accent-glow)] text-[var(--color-accent-2)]' : 'text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'}`}>
              <div className="relative shrink-0">
                <Icon className={`w-4 h-4 ${active ? 'text-[var(--color-accent-2)]' : ''}`} />
                {live && (
                  <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                )}
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                    className="whitespace-nowrap flex-1 text-left">{label}</motion.span>
                )}
              </AnimatePresence>
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--color-surface-3)] text-[var(--color-text)] text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {label}
                </div>
              )}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-[var(--color-border)] p-2 space-y-0.5">
        <button onClick={() => navigate('/settings')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all group relative">
          <Settings className="w-4 h-4 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">Settings</motion.span>
            )}
          </AnimatePresence>
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--color-surface-3)] text-[var(--color-text)] text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              Settings
            </div>
          )}
        </button>

        <div onClick={() => navigate('/settings')}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-surface-2)] transition-all cursor-pointer">
          <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white"
            style={{ background: stringToColor(profile?.name) }}>
            {getInitials(profile?.name)}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text)] truncate">{profile?.name || 'User'}</p>
                <p className="text-xs text-[var(--color-text-3)] truncate">{profile?.email || ''}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button onClick={onToggle}
        className="absolute top-4 -right-3 w-6 h-6 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-full flex items-center justify-center text-[var(--color-text-3)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3)] transition-all z-10">
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.div>
  )
}