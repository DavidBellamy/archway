import { ThemeProvider } from './state/theme-context'
import { PatProvider } from './state/pat-context'
import { PopupProvider } from './state/popup-context'
import { CanvasApp } from './canvas/CanvasApp'

export function App() {
  return (
    <ThemeProvider>
      <PatProvider>
        <PopupProvider>
          <div className="archway-root">
            <CanvasApp />
          </div>
        </PopupProvider>
      </PatProvider>
    </ThemeProvider>
  )
}
