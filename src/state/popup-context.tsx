import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { TLShapeId } from 'tldraw'

interface PopupState {
  isOpen: boolean
  shapeId: TLShapeId | null
}

interface PopupContextValue {
  popup: PopupState
  openPopup: (shapeId: TLShapeId) => void
  closePopup: () => void
}

const PopupContext = createContext<PopupContextValue>({
  popup: { isOpen: false, shapeId: null },
  openPopup: () => {},
  closePopup: () => {},
})

export function usePopup() {
  return useContext(PopupContext)
}

export function PopupProvider({ children }: { children: React.ReactNode }) {
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    shapeId: null,
  })

  const openPopup = useCallback((shapeId: TLShapeId) => {
    setPopup({ isOpen: true, shapeId })
  }, [])

  const closePopup = useCallback(() => {
    setPopup({ isOpen: false, shapeId: null })
  }, [])

  const value = useMemo(
    () => ({ popup, openPopup, closePopup }),
    [popup, openPopup, closePopup],
  )

  return <PopupContext.Provider value={value}>{children}</PopupContext.Provider>
}
