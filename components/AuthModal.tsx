'use client'

import { useState } from 'react'
import { X, Lock, User, Sparkles } from 'lucide-react'
import { useParfumData } from '../hooks/useParfumData'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // useParfumData hook'undan signIn fonksiyonunu al
  const { signIn } = useParfumData()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('🔐 AuthModal: Giriş denemesi başladı')
    console.log('📝 Girilen username:', username)
    console.log('📝 Girilen password:', password ? '***' + password.slice(-2) : 'BOŞ')

    try {
      console.log('🚀 signIn fonksiyonu çağrılıyor...')
      const result = await signIn(username, password)
      console.log('📨 signIn sonucu:', result)
      
      if (result.success) {
        console.log('✅ Giriş başarılı!')
        onSuccess()
        onClose()
        setUsername('')
        setPassword('')
      } else {
        console.log('❌ Giriş başarısız:', result.error)
        setError(result.error || 'Giriş yapılamadı')
      }
    } catch (err: unknown) {
      console.error('💥 AuthModal handleSubmit error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Giriş yapılamadı'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Parfüm AI Giriş
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-2">🔒 Güvenli Erişim</h3>
          <p className="text-sm text-purple-700">
            Bu uygulama sadece yetkili kullanıcılar içindir. Lütfen giriş bilgilerinizi girin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kullanıcı Adı
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                placeholder="Kullanıcı adınızı girin"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                placeholder="Şifrenizi girin"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Giriş yapılıyor...
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                Giriş Yap
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Sadece yetkili kullanıcılar erişebilir
          </p>
        </div>
      </div>
    </div>
  )
} 