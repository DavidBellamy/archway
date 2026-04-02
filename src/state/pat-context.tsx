import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { LS_PAT } from '../lib/constants'

interface PatContextValue {
  pat: string | null
  setPat: (pat: string | null) => void
}

const PatContext = createContext<PatContextValue>({
  pat: null,
  setPat: () => {},
})

export function usePat() {
  return useContext(PatContext)
}

export function PatProvider({ children }: { children: React.ReactNode }) {
  const [pat, setPatState] = useState<string | null>(() =>
    localStorage.getItem(LS_PAT),
  )

  const setPat = useCallback((newPat: string | null) => {
    setPatState(newPat)
    if (newPat) {
      localStorage.setItem(LS_PAT, newPat)
    } else {
      localStorage.removeItem(LS_PAT)
    }
  }, [])

  const value = useMemo(() => ({ pat, setPat }), [pat, setPat])

  return <PatContext.Provider value={value}>{children}</PatContext.Provider>
}
