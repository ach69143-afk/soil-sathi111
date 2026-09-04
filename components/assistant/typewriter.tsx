'use client'

import React, { useState, useEffect } from 'react'

export function Typewriter({ 
  content, 
  speed = 15, 
  onComplete 
}: { 
  content: string; 
  speed?: number; 
  onComplete?: () => void 
}) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    let i = 0
    let timer: NodeJS.Timeout
    let isCancelled = false
    
    setDisplayed('')
    
    const tick = () => {
      if (isCancelled) return
      setDisplayed(content.slice(0, i))
      i++
      if (i > content.length) {
        onComplete?.()
      } else {
        // slightly randomize speed for natural typing effect
        const jitter = Math.random() * 10 - 5
        timer = setTimeout(tick, Math.max(5, speed + jitter))
      }
    }
    
    tick()
    
    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [content, speed, onComplete])

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-2 [&>p]:last:mb-0">
      {displayed.split('\n').map((line, j) => (
        <p key={j} dangerouslySetInnerHTML={{
          __html: line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
        }} />
      ))}
    </div>
  )
}
