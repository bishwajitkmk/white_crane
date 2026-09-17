import { useEffect } from 'react'

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | White Crane Training Collective` : 'White Crane Training Collective'
  }, [title])
}
