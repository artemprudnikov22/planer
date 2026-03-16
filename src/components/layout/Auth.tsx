import { useAuth } from '../../hooks/useAuth'
import { motion } from 'framer-motion'

export const Auth = () => {
  const { signInWithGoogle, signInWithYandex } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-6">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="paper-page max-w-md w-full p-12 text-center flex flex-col items-center gap-8"
      >
        <div className="space-y-2">
          <h1 className="text-5xl font-serif italic">The Paper Journal</h1>
          <p className="text-ink/40 font-serif italic text-lg">Your digital companion, refined.</p>
        </div>

        <div className="w-full space-y-4">
          <button
            onClick={signInWithGoogle}
            className="w-full py-4 border border-ink/10 rounded-xl hover:bg-ink/5 transition-all flex items-center justify-center gap-3 font-serif text-lg"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
            Continue with Google
          </button>

          <button
            onClick={signInWithYandex}
            className="w-full py-4 border border-ink/10 rounded-xl hover:bg-ink/5 transition-all flex items-center justify-center gap-3 font-serif text-lg"
          >
            <span className="w-5 h-5 bg-[#ff0000] text-white flex items-center justify-center text-[10px] font-bold rounded-sm">Y</span>
            Continue with Yandex
          </button>
        </div>

        <div className="mt-8 text-[10px] uppercase tracking-widest text-ink/20 font-sans">
          Secured by Supabase Auth
        </div>
      </motion.div>
    </div>
  )
}
