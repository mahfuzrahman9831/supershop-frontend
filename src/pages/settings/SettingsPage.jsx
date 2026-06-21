import { useState, useEffect } from 'react'
import { Save, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'

const TABS = [{id:'general',label:'🏪 General'},{id:'receipt',label:'🧾 Receipt'},{id:'stock',label:'📦 Stock'}]

const SettingsPage = () => {
  const [tab,     setTab]     = useState('general')
  const [form,    setForm]    = useState({})
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  useEffect(()=>{
    api.get('/settings').then(({data})=>{
      const d = data?.data??data
      // Flatten settings array/object
      if(Array.isArray(d)){
        const flat={}; d.forEach(s=>{ flat[s.key]=s.value }); setForm(flat)
      } else { setForm(d) }
    }).finally(()=>setLoading(false))
  },[])

  const onChange = ({target:{name,value}}) => setForm(p=>({...p,[name]:value}))

  const save = async () => {
  setSaving(true)
  try {
    await api.put('/settings', { settings: form })
    toast.success('Settings save হয়েছে ✓')
  } catch(err){ toast.error(err.response?.data?.message??'Save হয়নি') }
  finally { setSaving(false) }
}

  const F = ({label, name, type='text', placeholder='', options=null, help=''}) => (
    <div>
      <label className="label">{label}</label>
      {options ? (
        <select name={name} value={form[name]??''} onChange={onChange} className="input">
          {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type==='textarea' ? (
        <textarea name={name} value={form[name]??''} onChange={onChange} rows={3} className="input resize-none" placeholder={placeholder}/>
      ) : (
        <input name={name} type={type} value={form[name]??''} onChange={onChange} className="input" placeholder={placeholder}/>
      )}
      {help&&<p className="text-xs text-gray-400 mt-1">{help}</p>}
    </div>
  )

  if(loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full"/></div>

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Settings</h1><p className="page-subtitle">Shop configuration</p></div>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving?<><span className="spinner"/> Saving...</>:<><Save size={15}/> Save Settings</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white p-1.5 rounded-xl border border-gray-200">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab===t.id?'bg-brand-600 text-white':'text-gray-600 hover:bg-gray-100'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card card-body max-w-2xl">
        {tab==='general'&&(
          <div className="space-y-5">
            <F label="Shop Name" name="shop_name" placeholder="আপনার দোকানের নাম"/>
            <F label="Shop Address" name="shop_address" type="textarea" placeholder="দোকানের ঠিকানা"/>
            <F label="Phone" name="shop_phone" placeholder="01XXXXXXXXX"/>
            <F label="Email" name="shop_email" type="email" placeholder="shop@email.com"/>
            <F label="Currency Symbol" name="shop_currency" placeholder="৳" help="Invoice এ দেখাবে"/>
            <F label="Tax Registration (VAT/TIN)" name="shop_tax_number" placeholder="(optional)"/>
          </div>
        )}

        {tab==='receipt'&&(
          <div className="space-y-5">
            <F label="Receipt Header" name="receipt_header" type="textarea" placeholder="Receipt এর উপরে যা দেখাবে"/>
            <F label="Receipt Footer" name="receipt_footer" type="textarea" placeholder="Receipt এর নিচে যা দেখাবে (ধন্যবাদ বার্তা)"/>
            <F label="Show Logo on Receipt" name="receipt_show_logo"
              options={[{value:'1',label:'Yes'},{value:'0',label:'No'}]}/>
            <F label="Thermal Printer Width" name="receipt_width"
              options={[{value:'80',label:'80mm'},{value:'58',label:'58mm'}]}/>
          </div>
        )}

        {tab==='stock'&&(
          <div className="space-y-5">
            <F label="Costing Method" name="default_costing_method"
              options={[{value:'fifo',label:'FIFO (First In First Out)'},{value:'average',label:'Average Cost'}]}
              help="Stock valuation পদ্ধতি — পরিবর্তন করলে পুরনো data প্রভাবিত হতে পারে"/>
            <F label="Low Stock Alert Threshold" name="low_stock_threshold" type="number"
              help="এই পরিমাণ এর নিচে গেলে Dashboard এ alert দেখাবে"/>
            <F label="Enable Barcode Auto-generate" name="barcode_auto_generate"
              options={[{value:'1',label:'Yes (automatic)'},{value:'0',label:'No (manual)'}]}/>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving?<><span className="spinner"/> Saving...</>:<><Save size={15}/> Save</>}
          </button>
        </div>
      </div>
    </div>
  )
}
export default SettingsPage