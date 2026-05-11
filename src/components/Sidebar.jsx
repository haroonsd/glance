import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  CheckSquare, Inbox, LayoutDashboard, Users, Settings,
  ChevronLeft, ChevronRight, Plus, FolderKanban, Sparkles
} from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { WatcherEye } from './WatcherEye'
import { getInitials, stringToColor } from '../lib/utils'
import { toast } from 'sonner'

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: CheckSquare, label: 'My Tasks', path: '/tasks' },
  { icon: Inbox, label: 'Inbox', path: '/inbox', badge: 0 },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: Users, label: 'Team', path: '/team' },
]

export function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, signOut } = useAuthStore()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    navigate('/login')
  }

  return (
    <motion.div
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col h-full bg-[var(--color-surface)] border-r border-[var(--color-border)] overflow-hidden shrink-0"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--color-border)]">
        <div className="shrink-0">
          <WatcherEye size={32} blink track animate={false} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="text-base font-bold tracking-tight whitespace-nowrap"
            >
              Glance
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        {NAV.map(({ icon: Icon, label, path, badge }) => {
          const active = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group relative
                ${active
                  ? 'bg-[var(--color-accent-glow)] text-[var(--color-accent-2)]'
                  : 'text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
                }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[var(--color-accent-2)]' : ''}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap flex-1 text-left"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && badge > 0 && (
                <span className="text-xs bg-[var(--color-accent)] text-white rounded-full px-1.5 py-0.5 leading-none">
                  {badge}
                </span>
              )}
              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--color-surface-3)] text-[var(--color-text)] text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {label}
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[var(--color-border)] p-2 space-y-0.5">
        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all group relative"
        >
          <Settings className="w-4 h-4 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                Settings
              </motion.span>
            )}
          </AnimatePresence>
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--color-surface-3)] text-[var(--color-text)] text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              Settings
            </div>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-surface-2)] transition-all cursor-pointer" onClick={handleSignOut}>
          <div
            className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white"
            style={{ background: stringToColor(profile?.name) }}
          >
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

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute top-4 -right-3 w-6 h-6 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-full flex items-center justify-center text-[var(--color-text-3)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3)] transition-all z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.div>
  )
}