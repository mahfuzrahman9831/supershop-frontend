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

// /reports/sales এর "sales" array কে date অনুযায়ী group করে
const groupSalesByDate = (sales = []) => {
  const map = {}
  sales.forEach(s => {
    const date = (s.created_at ?? s.sale_date ?? '').slice(0, 10)
    if (!date) return
    if (!map[date]) map[date] = { date, total: 0 }
    map[date].total += Number(s.total_amount ?? 0)
  })
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
}

const useDashboard = () => {
  const [dashboard,    setDashboard]    = useState(null)
  const [recentSales,  setRecentSales]  = useState([])
  const [chartData,    setChartData]    = useState([])
  const [shift,        setShift]        = useState(null)
  const [lowStockList, setLowStockList] = useState([])
  const [loading,      setLoading]      = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { from, to } = getMonthRange()

    const [dashRes, chartRes, lowStockRes] = await Promise.allSettled([
      api.get('/reports/dashboard'),
      api.get(`/reports/sales?from=${from}&to=${to}`),
      api.get('/products/low-stock'),
    ])

    // Dashboard summary — recent_sales ও current_shift এখানেই embedded থাকে
    if (dashRes.status === 'fulfilled') {
      const d = dashRes.value.data?.data ?? null
      setDashboard(d)
      setRecentSales(d?.recent_sales ?? [])
      setShift(d?.current_shift ?? null)
    }

    // Monthly chart — /reports/sales এর flat list থেকে date-wise group
    if (chartRes.status === 'fulfilled') {
      const d = chartRes.value.data?.data
      setChartData(groupSalesByDate(d?.sales ?? []))
    }

    // Low stock products
    if (lowStockRes.status === 'fulfilled') {
      const d = lowStockRes.value.data?.data
      setLowStockList(Array.isArray(d) ? d : d?.data ?? [])
    }

    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { dashboard, recentSales, chartData, shift, lowStockList, loading, refetch: fetchAll }
}

export default useDashboard