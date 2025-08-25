'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Send to Google Analytics
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: entry.name,
            value: Math.round(entry.startTime),
            non_interaction: true,
          })
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Web Vital:', entry.name, entry.startTime)
        }
      }
    })

    // Observe different types of performance entries
    observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] })

    // Monitor LCP (Largest Contentful Paint)
    let lcpValue = 0
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformanceEntry
      lcpValue = lastEntry.startTime

      if (window.gtag) {
        window.gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: 'LCP',
          value: Math.round(lcpValue),
          non_interaction: true,
        })
      }
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // Monitor FID (First Input Delay)
    let fidValue = 0
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const fidEntry = entry as any
        fidValue = fidEntry.processingStart - fidEntry.startTime

        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: 'FID',
            value: Math.round(fidValue),
            non_interaction: true,
          })
        }
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    // Monitor CLS (Cumulative Layout Shift)
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      let cls = 0
      for (const entry of list.getEntries()) {
        const clsEntry = entry as any
        if (!clsEntry.hadRecentInput) {
          cls += clsEntry.value
        }
      }
      clsValue = cls

      if (window.gtag) {
        window.gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: 'CLS',
          value: Math.round(clsValue * 1000) / 1000,
          non_interaction: true,
        })
      }
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })

    // Monitor page load time
    const pageLoadTime = performance.now()
    if (window.gtag) {
      window.gtag('event', 'page_load_time', {
        event_category: 'Performance',
        event_label: 'Page Load',
        value: Math.round(pageLoadTime),
        non_interaction: true,
      })
    }

    // Cleanup
    return () => {
      observer.disconnect()
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
    }
  }, [])

  return null // This component doesn't render anything
}
