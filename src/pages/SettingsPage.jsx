import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Briefcase, LogOut, Save } from 'lucide-react'
import { toast } from 'sonner'
import { AppLayout } from '../components/AppLayout'
import { useAuthStore } from '../store/auth'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { getInitials, stringToColor } from '../lib/utils'

export function SettingsPage() {
  const { profile, updateProfile, signOut } = useAuthStore()
  const [form, setForm] = useState({
    name: profile?.name || '',
    designation: profile?.designation || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile(form)
      toast.success('Profile updated')
    } catch (err) {
      toast.error('Failed to save: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Settings</h1>
            <p className="text-sm text-[var(--color-text-3)]">Manage your profile and preferences</p>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-5 p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
              style={{ background: stringToColor(profile?.name) }}>
              {getInitials(profile?.name)}
            </div>
            <div>
              <p className="font-semibold text-lg">{profile?.name || 'User'}</p>
              <p className="text-sm text-[var(--color-text-3)]">{profile?.email}</p>
              <p className="text-xs text-[var(--color-text-4)] mt-0.5 capitalize">{profile?.role || 'member'}</p>
            </div>
          </div>

          {/* Profile form */}
          <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-4">
            <h2 className="font-medium text-sm text-[var(--color-text-2)] uppercase tracking-wider">Profile</h2>
            <Input label="Full name" icon={User} value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            <Input label="Designation" icon={Briefcase} value={form.designation}
              onChange={e => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Digital Marketing Executive" />
            <Input label="Email" icon={Mail} value={profile?.email || ''} disabled
              className="opacity-60 cursor-not-allowed" />
            <Button onClick={handleSave} loading={saving} icon={Save}>Save changes</Button>
          </div>

          {/* Danger zone */}
          <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-danger)]/20 rounded-2xl space-y-3">
            <h2 className="font-medium text-sm text-[var(--color-danger)] uppercase tracking-wider">Account</h2>
            <p className="text-sm text-[var(--color-text-3)]">Sign out of your Glance workspace.</p>
            <Button variant="danger" icon={LogOut} onClick={handleSignOut}>Sign out</Button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}