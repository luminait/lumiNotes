import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const handleChange = () => {
      setIsMobile(mediaQuery.matches)
    }
    mediaQuery.addEventListener("change", handleChange)
    handleChange() // Set initial state on mount
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return !!isMobile
}
