'use client'

import * as React from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  decimals?: number
  className?: string
}

export function AnimatedNumber({ value, decimals = 0, className }: AnimatedNumberProps) {
  const [mounted, setMounted] = React.useState(false)
  const spring = useSpring(value, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  })
  
  const display = useTransform(spring, (current) => current.toFixed(decimals))

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    spring.set(value)
  }, [spring, value])

  // Render a plain span during SSR / first paint to avoid hydration mismatch
  // caused by framer-motion injecting inline styles (e.g. filter:none) on the client.
  if (!mounted) {
    return <span className={className}>{value.toFixed(decimals)}</span>
  }

  return <motion.span className={className}>{display}</motion.span>
}
