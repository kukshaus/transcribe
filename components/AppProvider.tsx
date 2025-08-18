'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import SetupGuide from './SetupGuide'

interface AppContextType {
  showSetupGuide: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

interface AppProviderProps {
  children: ReactNode
}

export default function AppProvider({ children }: AppProviderProps) {
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false)

  const showSetupGuide = () => {
    setIsSetupGuideOpen(true)
  }

  return (
    <SessionProvider>
      <AppContext.Provider value={{ showSetupGuide }}>
        {children}
        
        {/* Global Setup Guide Modal */}
        {isSetupGuideOpen && (
          <SetupGuide onClose={() => setIsSetupGuideOpen(false)} />
        )}
      </AppContext.Provider>
    </SessionProvider>
  )
}
