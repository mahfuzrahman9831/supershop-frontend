import { useState, useEffect, useCallback } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { RefreshCw, ShoppingCart, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react'
import api from '../../lib/axios'

const TABS = [
  {id:'sales',    label:'📈 Sales'},
  {id:'profit',   label:'💰 Profit'},
  {id:'stock',    label:'📦 Stock Valuation'},
  {id:'cust_due', label:'👥 Customer Due'},
  {id:'dead',     label:'⚠ Dead Stock'},
]

const pad = n => String(n).padStart(2,'0')
const fmtD = d => { const dt=new Date(d); return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}` }
const now  = new Date()
const DEF  = { from: fmtD(new Date(now.getFullYear(),now.getMonth(),1)), to: fmtD(now) }

const ChartTip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null
  return (<div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
    <p className="text-gray-500 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} style={{color:p.color}} className="font-semibold">{p.name}: ৳ {Number(p.value).toLocaleString()}</p>)}
  </div>)
}

const ReportsPage = () => {
  const [tab,setTab] = useState('sales')
  const [from,setFrom] = useState(DEF.from)
  const [to,setTo]     = useState(DEF.to)
  const [data,setData] = useState(null)
  const [loading,setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setData(null)
    try {
      const EP = {
        sales:    `/reports/sales?from=${from}&to=${to}`,
        profit:   `/reports/profit?from=${from}&to=${to}`,
        stock:    '/reports/stock/valuation',
        cust_due: '/reports/customers/due',
        dead:     '/reports/stock/dead',
      }
      const {data:res} = await api.get(EP[tab])
      setData(res?.data??null)
    } catch { setData(null) } finally { setLoading(false) }
  },[tab,from,to])

  useEffect(()=>{load()},[load])

  const setRange = (days) => {
    const n = new Date()
    if(days===null){ setFrom(fmtD(new Date(n.getFullYear(),n.getMonth(),1))); setTo(fmtD(n)) }
    else if(days===0){ setFrom(fmtD(n)); setTo(fmtD(n)) }
    else { const d=new Date(n); d.setDate(d.getDate()-days); setFrom(fmtD(d)); setTo(fmtD(n)) }
  }

  const needsDate = ['sales','profit'].includes(tab)

  const renderContent = () => {
    if(loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full"/></div>
    if(!data)   return <div className="text-center py-20 text-gray-400"><p className="text-sm">Data পাওয়া যায়নি</p></div>

    // ── SALES ──────────────────────────────────────────────────────
    if(tab==='sales'){
      const sum   = data.summary??data
      const daily = data.daily??data.data??[]
      return (<div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {label:"Total Sales",    value:sum.total_sales??sum.total_amount??0,   icon:ShoppingCart, color:'bg-blue-500'},
            {label:"Total Orders",   value:sum.total_orders??sum.count??0,         icon:TrendingUp,   color:'bg-purple-500', noTk:true},
            {label:"Total Paid",     value:sum.total_paid??0,                      icon:DollarSign,   color:'bg-emerald-500'},
            {label:"Total Due",      value:sum.total_due??0,                       icon:AlertTriangle,color:'bg-amber-500'},
          ].map(s=>(
            <div key={s.label} className="card card-body flex items-center gap-3">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}><s.icon size={18} className="text-white"/></div>
              <div><p className="text-gray-500 text-xs">{s.label}</p>
                <p className="text-xl font-bold text-gray-900">{!s.noTk&&'৳ '}{Number(s.value).toLocaleString()}</p></div>
            </div>
          ))}
        </div>
        {daily.length>0&&(
          <div className="card card-body">
            <h3 className="font-semibold text-gray-800 mb-4">Daily Sales Overview</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={daily} margin={{top:5,right:5,left:-10,bottom:0}}>
                <defs><linearGradient id="sGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                <XAxis dataKey="date" tick={{fontSize:10,fill:'#94a3b8'}} tickFormatter={v=>v?.split('-')[2]??v} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'#94a3b8'}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTip/>}/>
                <Area type="monotone" dataKey="total" name="Sales" stroke="#2563eb" strokeWidth={2} fill="url(#sGrad)" dot={false} activeDot={{r:4,fill:'#2563eb',stroke:'#fff',strokeWidth:2}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>)
    }

    // ── PROFIT ─────────────────────────────────────────────────────
    if(tab==='profit'){
      const sum   = data.summary??data
      const daily = data.daily??data.data??[]
      return (<div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[
            {label:'Total Revenue', value:sum.total_revenue??sum.total_sales??0, color:'text-blue-600'},
            {label:'Total Cost',    value:sum.total_cost??0,                     color:'text-gray-700'},
            {label:'Net Profit',    value:sum.total_profit??sum.profit??0,       color:'text-emerald-600'},
          ].map(s=>(
            <div key={s.label} className="card card-body">
              <p className="text-gray-500 text-sm">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>৳ {Number(s.value).toLocaleString()}</p>
            </div>
          ))}
        </div>
        {daily.length>0&&(
          <div className="card card-body">
            <h3 className="font-semibold text-gray-800 mb-4">Daily Profit vs Revenue</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={daily} margin={{top:5,right:5,left:-10,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                <XAxis dataKey="date" tick={{fontSize:10,fill:'#94a3b8'}} tickFormatter={v=>v?.split('-')[2]??v} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'#94a3b8'}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTip/>}/><Legend/>
                <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[3,3,0,0]}/>
                <Bar dataKey="profit"  name="Profit"  fill="#10b981" radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>)
    }

    // ── STOCK VALUATION ────────────────────────────────────────────
    if(tab==='stock'){
      const items  = Array.isArray(data)?data:(data?.data??data?.items??[])
      const total  = items.reduce((s,i)=>s+Number(i.total_value??i.value??0),0)
      return (<div className="space-y-4">
        <div className="card card-body"><p className="text-gray-500 text-sm">Total Stock Value</p>
          <p className="text-3xl font-bold text-brand-600 mt-1">৳ {total.toLocaleString()}</p></div>
        <div className="card">
          <div className="card-header">Stock Valuation ({items.length} products)</div>
          <div className="table-wrapper rounded-none border-x-0 border-b-0">
            <table className="table"><thead><tr><th>#</th><th>Product</th><th>Category</th><th className="text-right">Qty</th><th className="text-right">Cost</th><th className="text-right">Value</th></tr></thead>
              <tbody>{!items.length?(<tr><td colSpan={6} className="py-10 text-center text-gray-400 text-sm">Data নেই</td></tr>)
                :items.map((item,i)=>(
                  <tr key={i}>
                    <td className="text-gray-400 text-xs">{i+1}</td>
                    <td><p className="font-medium text-gray-800 text-sm">{item.product?.name??item.name}</p>
                      {item.product?.barcode&&<p className="text-xs font-mono text-gray-400">{item.product.barcode}</p>}</td>
                    <td className="text-sm text-gray-500">{item.product?.category?.name??item.category??'—'}</td>
                    <td className="text-right font-medium text-gray-700">{Number(item.quantity??item.stock??0).toLocaleString()}</td>
                    <td className="text-right text-gray-600 text-sm">৳ {Number(item.cost_price??item.unit_cost??0).toLocaleString()}</td>
                    <td className="text-right font-bold text-gray-900">৳ {Number(item.total_value??item.value??0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>)
    }

    // ── CUSTOMER DUE ───────────────────────────────────────────────
    if(tab==='cust_due'){
      const custs = Array.isArray(data)?data:(data?.data??data?.customers??[])
      const total = custs.reduce((s,c)=>s+Number(c.total_due??c.due??0),0)
      return (<div className="space-y-4">
        <div className="card card-body"><p className="text-gray-500 text-sm">Total Customer Due</p>
          <p className="text-3xl font-bold text-red-600 mt-1">৳ {total.toLocaleString()}</p></div>
        <div className="card">
          <div className="card-header">Customer Due List ({custs.length})</div>
          <div className="table-wrapper rounded-none border-x-0 border-b-0">
            <table className="table"><thead><tr><th>#</th><th>Customer</th><th>Phone</th><th className="text-right">Total Purchase</th><th className="text-right">Total Paid</th><th className="text-right">Due</th></tr></thead>
              <tbody>{!custs.length?(<tr><td colSpan={6} className="py-10 text-center text-gray-400 text-sm">🎉 কোন customer due নেই!</td></tr>)
                :custs.map((c,i)=>(
                  <tr key={c.id??i}>
                    <td className="text-gray-400 text-xs">{i+1}</td>
                    <td className="font-medium text-gray-800">{c.name}</td>
                    <td className="text-gray-500 text-sm">{c.phone??'—'}</td>
                    <td className="text-right text-gray-600 text-sm">৳ {Number(c.total_purchase??0).toLocaleString()}</td>
                    <td className="text-right text-emerald-600 text-sm">৳ {Number(c.total_paid??0).toLocaleString()}</td>
                    <td className="text-right font-bold text-red-600">৳ {Number(c.total_due??c.due??0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>)
    }

    // ── DEAD STOCK ─────────────────────────────────────────────────
    if(tab==='dead'){
      const items = Array.isArray(data)?data:(data?.data??data?.products??[])
      return (<div className="card">
        <div className="card-header flex items-center justify-between">
          <span>Dead Stock ({items.length})</span>
          <span className="text-xs text-gray-400 font-normal">90 দিনে sale হয়নি</span>
        </div>
        <div className="table-wrapper rounded-none border-x-0 border-b-0">
          <table className="table"><thead><tr><th>#</th><th>Product</th><th>Category</th><th className="text-right">Stock</th><th className="text-right">Value</th><th>Last Sale</th></tr></thead>
            <tbody>{!items.length?(<tr><td colSpan={6} className="py-10 text-center text-gray-400 text-sm">✅ কোন dead stock নেই!</td></tr>)
              :items.map((item,i)=>(
                <tr key={item.id??i}>
                  <td className="text-gray-400 text-xs">{i+1}</td>
                  <td><p className="font-medium text-gray-800 text-sm">{item.name??item.product?.name}</p>
                    {item.barcode&&<p className="font-mono text-xs text-gray-400">{item.barcode}</p>}</td>
                  <td className="text-sm text-gray-500">{item.category?.name??'—'}</td>
                  <td className="text-right font-medium text-amber-600">{Number(item.stock??0).toLocaleString()}</td>
                  <td className="text-right text-gray-600 text-sm">{item.value?`৳ ${Number(item.value).toLocaleString()}`:'—'}</td>
                  <td className="text-sm text-gray-400">{item.last_sale_date?new Date(item.last_sale_date).toLocaleDateString('en-BD'):'Never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>)
    }
  }

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Reports</h1><p className="page-subtitle">Business analytics ও performance</p></div>
        <button onClick={load} disabled={loading} className="btn-ghost btn-sm">
          <RefreshCw size={14} className={loading?'animate-spin':''}/> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white p-1.5 rounded-xl border border-gray-200 overflow-x-auto">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab===t.id?'bg-brand-600 text-white shadow-sm':'text-gray-600 hover:bg-gray-100'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Date range */}
      {needsDate&&(
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="card flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="text-gray-500 text-sm">From:</span>
              <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="border-0 outline-none text-sm bg-transparent"/>
              <span className="text-gray-400">—</span>
              <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="border-0 outline-none text-sm bg-transparent"/>
            </div>
          </div>
          {[{label:'Today',days:0},{label:'7 Days',days:7},{label:'30 Days',days:30},{label:'This Month',days:null}].map(r=>(
            <button key={r.label} onClick={()=>setRange(r.days)} className="btn-ghost btn-sm border border-gray-200">{r.label}</button>
          ))}
        </div>
      )}

      {renderContent()}
    </div>
  )
}
export default ReportsPage