import { useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => supabaseConfigured)

  useEffect(() => {
    if (!supabaseConfigured) {
      return
    }

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch(() => {
        setUser(null)
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    if (!supabaseConfigured) return
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  const signInWithYandex = async () => {
    if (!supabaseConfigured) return
    type OAuthProvider = Parameters<typeof supabase.auth.signInWithOAuth>[0]['provider']
    const yandexProvider = 'yandex' as unknown as OAuthProvider
    await supabase.auth.signInWithOAuth({
      provider: yandexProvider,
    })
  }

  const signOut = async () => {
    if (!supabaseConfigured) return
    await supabase.auth.signOut()
  }

  return { user, loading, signInWithGoogle, signInWithYandex, signOut }
}
