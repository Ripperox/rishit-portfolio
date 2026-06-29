import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries, ColorType, type IChartApi, type ISeriesApi } from 'lightweight-charts'

/* Real streaming candlestick chart (TradingView Lightweight Charts v5).
   Non-interactive backdrop for the Alpharooms stage — overlays sit on top. */
export default function AlpharoomsChart({ accentHex = '#00ff9d' }: { accentHex?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#6b6b73',
        fontFamily: "'Roboto Mono', monospace",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.035)' },
        horzLines: { color: 'rgba(255,255,255,0.035)' },
      },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.07)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.07)', timeVisible: true, secondsVisible: true, rightOffset: 3 },
      crosshair: { mode: 0 },
      handleScroll: false,
      handleScale: false,
    })
    chartRef.current = chart

    const series = chart.addSeries(CandlestickSeries, {
      upColor: accentHex,
      downColor: '#ef4444',
      wickUpColor: accentHex,
      wickDownColor: '#ef4444',
      borderVisible: false,
      priceFormat: { type: 'price', precision: 4, minMove: 0.0001 },
    })
    seriesRef.current = series

    // seed history (random walk)
    const STEP = 3
    let t = Math.floor(Date.now() / 1000) - 90 * STEP
    let price = 0.042
    const bars: any[] = []
    for (let i = 0; i < 90; i++) {
      const open = price
      price = Math.max(0.02, price + (Math.random() - 0.5) * 0.0026)
      const close = price
      const high = Math.max(open, close) + Math.random() * 0.0009
      const low = Math.min(open, close) - Math.random() * 0.0009
      bars.push({ time: t, open, high, low, close })
      t += STEP
    }
    series.setData(bars)
    chart.timeScale().fitContent()

    let cur = { ...bars[bars.length - 1] }
    let ticks = 0

    const stream = setInterval(() => {
      if (document.hidden) return
      const close = Math.max(0.02, cur.close + (Math.random() - 0.5) * 0.0014)
      cur = {
        ...cur,
        close,
        high: Math.max(cur.high, close),
        low: Math.min(cur.low, close),
      }
      series.update(cur)
      ticks++
      if (ticks >= 6) {
        // roll a new candle
        ticks = 0
        t += STEP
        cur = { time: t, open: close, high: close, low: close, close }
        series.update(cur)
        bars.push(cur)
        if (bars.length > 240) {
          bars.splice(0, bars.length - 160)
          series.setData(bars)
        }
        chart.timeScale().scrollToRealTime()
      }
    }, 600)

    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: el.clientWidth, height: el.clientHeight })
    })
    ro.observe(el)

    return () => {
      clearInterval(stream)
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  // re-theme on mode change without rebuilding the chart
  useEffect(() => {
    seriesRef.current?.applyOptions({ upColor: accentHex, wickUpColor: accentHex })
  }, [accentHex])

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />
}
