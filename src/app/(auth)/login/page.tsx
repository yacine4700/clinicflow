// src/app/(auth)/login/page.tsx
import { LoginForm } from '@/components/auth/login-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sign In' }

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-600 via-cyan-600 to-teal-600 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-2 border-white" />
          <div className="absolute top-40 left-40 w-40 h-40 rounded-full border border-white" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full border-2 border-white" />
          <div className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full bg-white/5" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">ClinicFlow</span>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Modern clinic<br />management,<br />
              <span className="text-cyan-200">simplified.</span>
            </h1>
            <p className="mt-4 text-sky-100 text-lg leading-relaxed">
              Manage patients, prescriptions, waiting rooms, and finances — all in one place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '👤', label: 'Patient Records' },
              { icon: '💊', label: 'Prescriptions' },
              { icon: '🏥', label: 'Waiting Room' },
              { icon: '📊', label: 'Analytics' },
            ].map(item => (
              <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2">
                <span className="text-xl">{item.icon}</span>
                <span className="text-white text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-sky-200 text-sm">
          © 2024 ClinicFlow. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-foreground">ClinicFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Sign in to access your clinic dashboard</p>
          </div>

          <LoginForm />

          <div className="mt-6 p-4 bg-muted/50 rounded-xl">
            <p className="text-xs font-medium text-muted-foreground mb-2">Demo credentials:</p>
            <div className="space-y-1">
              <p className="text-xs text-foreground">🩺 <strong>Doctor:</strong> doctor@clinic.com</p>
              <p className="text-xs text-foreground">📋 <strong>Secretary:</strong> secretary@clinic.com</p>
              <p className="text-xs text-muted-foreground">Password: password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
