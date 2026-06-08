import { useEffect, useState } from "react"
import { installApp } from "@/main"

export default function InstallPopup() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleEvent = () => {
      setTimeout(() => {
        setShow(true)
      }, 5000) // 5 sec delay
    }

    window.addEventListener("show-install-popup", handleEvent)

    return () => {
      window.removeEventListener("show-install-popup", handleEvent)
    }
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-5 left-5 right-5 md:left-auto md:right-5 md:w-96 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-4 z-[9999] animate-in fade-in slide-in-from-bottom-5">
      
      {/* Content */}
      <div className="flex items-start justify-between gap-3">
        
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            📲 Install Shop App
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Faster experience, offline support & app-like feel.
          </p>
        </div>

        {/* Close */}
        <button
          onClick={() => setShow(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-4">
        
        <button
          onClick={() => setShow(false)}
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Later
        </button>

        <button
          onClick={installApp}
          className="flex-1 px-3 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          Install
        </button>
      </div>
    </div>
  )
}