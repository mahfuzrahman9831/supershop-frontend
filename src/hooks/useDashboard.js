import { useState, useEffect, useCallback } from 'react'
import api from '../lib/axios'

// Date helpers
const pad = (n) => String(n).padStart(2, '0')
const dateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const getMonthRange = () => {
  const now = new Date()
  return {
    from: dateStr(new Date(now.getFullYear(), now.getMonth(), 1)),
    to:   dateStr(now),
  }
}

const useDashboard = () => {
  const [dashboard,   setDashboard]   = useState(null)
  const [recentSales, setRecentSales] = useState([])
  const [chartData,   setChartData]   = useState([])
  const [shift,       setShift]       = useState(null)
  const [loading,     setLoading]     = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { from, to } = getMonthRange()

    const [dashRes, salesRes, chartRes, shiftRes] = await Promise.allSettled([
      api.get('/reports/dashboard'),
      api.get('/sales?per_page=8'),
      api.get(`/reports/sales?from=${from}&to=${to}`),
      api.get('/shifts/current'),
    ])

    if (dashRes.status === 'fulfilled')
      setDashboard(dashRes.value.data?.data ?? null)

    if (salesRes.status === 'fulfilled') {
      const d = salesRes.value.data?.data
      setRecentSales(Array.isArray(d) ? d : d?.data ?? [])
    }

    if (chartRes.status === 'fulfilled') {
      const d = chartRes.value.data?.data
      // API থেকে daily array নিন — key অনুযায়ী fallback আছে
      setChartData(d?.daily ?? d?.chart ?? d?.data ?? [])
    }

    if (shiftRes.status === 'fulfilled')
      setShift(shiftRes.value.data?.data ?? null)

    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { dashboard, recentSales, chartData, shift, loading, refetch: fetchAll }
}

export default useDashboard