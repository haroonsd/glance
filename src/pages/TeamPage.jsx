import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Crown, Shield, User, Mail, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { AppLayout } from '../components/AppLayout'
import { useAuthStore } from '../store/auth'
import { supabase } from '../lib/supabase'
import { getInitials, stringToColor } from '../lib/utils'

const ROLE_ICONS = {
  owner: Crown,
  manager: Shield,
  member: User,
}

const ROLE_COLORS = {
  owner: '#f59e0b',
  manager: '#6366f1',
  member: '#71717a',
}

export function TeamPage() {
  const { profile } = useAuthStore()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const inviteLink = `${window.location.origin}/login`

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true })
      if (!error) setMembers(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast.success('Invite link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRoleChange = async (id, role) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
    if (error) { toast.error('Failed to update role'); return }
    setMembers(m => m.map(p => p.id === id ? { ...p, role } : p))
    toast.success('Role updated')
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div>
            <h1 className="text-xl font-semibold">Team</h1>
            <p className="text-sm text-[var(--color-text-3)]">{members.length} member{members.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6 max-w-3xl">
          {/* Invite section */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
            <h2 className="font-semibold mb-1">Invite teammates</h2>
            <p className="text-sm text-[var(--color-text-3)] mb-4">Share this link with anyone you want to add to Glance. They'll sign up and appear here.</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg">
                <Mail className="w-4 h-4 text-[var(--color-text-3)] shrink-0" />
                <span className="text-sm text-[var(--color-text-2)] truncate">{inviteLink}</span>
              </div>
              <button onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-3)] transition-colors shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Members list */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)]">
              <h2 className="font-semibold">Members</h2>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {members.map((member, i) => {
                const RoleIcon = ROLE_ICONS[member.role] || User
                const isMe = member.id === profile?.id
                const isOwner = profile?.role === 'owner'
                return (
                  <motion.div key={member.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: stringToColor(member.name) }}>
                      {getInitials(member.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{member.name || 'Unknown'}</p>
                        {isMe && <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-accent-glow)] text-[var(--color-accent-2)]">You</span>}
                      </div>
                      <p className="text-xs text-[var(--color-text-3)] truncate">{member.email}</p>
                      {member.designation && <p className="text-xs text-[var(--color-text-4)] truncate">{member.designation}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isOwner && !isMe ? (
                        <select value={member.role || 'member'} onChange={e => handleRoleChange(member.id, e.target.value)}
                          className="text-xs px-2 py-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] cursor-pointer">
                          <option value="member">Member</option>
                          <option value="manager">Manager</option>
                          <option value="owner">Owner</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                          <RoleIcon className="w-3 h-3" style={{ color: ROLE_COLORS[member.role] || '#71717a' }} />
                          <span className="text-xs capitalize" style={{ color: ROLE_COLORS[member.role] || '#71717a' }}>{member.role || 'member'}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
              {members.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="w-10 h-10 text-[var(--color-text-4)] mb-3" />
                  <p className="text-sm text-[var(--color-text-2)]">No team members yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}