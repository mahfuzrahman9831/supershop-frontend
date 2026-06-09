import { useState, useEffect } from 'react'
import api from '../lib/axios'

// Cache সরিয়ে দেওয়া হয়েছে — প্রতিবার fresh data আসবে
const useSelectData = (endpoints) => {
  const [data,    setData]    = useState({})
  const [loading, setLoading] = useState(true)

  // endpoints URL গুলো key হিসেবে ব্যবহার
  const cacheKey = endpoints.map(e => e.url).join('|')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      const results = {}

      await Promise.all(
        endpoints.map(async ({ key, url }) => {
          try {
            const { data: res } = await api.get(url)
            const d = res?.data
            results[key] = Array.isArray(d) ? d : (d?.data ?? [])
          } catch {
            results[key] = []
          }
        })
      )

      setData(results)
      setLoading(false)
    }

    fetchAll()
  }, [cacheKey])

  return { data, loading }
}

export default useSelectData