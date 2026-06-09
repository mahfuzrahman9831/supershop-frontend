import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const usePosStore = create(
  persist(
    (set, get) => ({
      // ── Cart ─────────────────────────────────────────────
      items:    [],
      customer: null,
      discount: 0,   // overall %
      note:     '',

      // ── Held Sales (localStorage persist) ────────────────
      heldSales: [],

      // ── Last completed sale (receipt এর জন্য) ────────────
      lastSale: null,

      // ── Item actions ─────────────────────────────────────
      addItem: (product) => {
        const { items } = get()
        const exists = items.find(i => i.product_id === product.id)
        if (exists) {
          set({ items: items.map(i =>
            i.product_id === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )})
        } else {
          set({ items: [...items, {
            _id:          Date.now() + Math.random(),
            product_id:   product.id,
            product,
            quantity:     1,
            unit_price:   Number(product.sale_price ?? 0),
            discount_pct: 0,
          }]})
        }
      },

      updateItem: (_id, field, value) =>
        set({ items: get().items.map(i => i._id === _id ? { ...i, [field]: value } : i) }),

      removeItem: (_id) =>
        set({ items: get().items.filter(i => i._id !== _id) }),

      clearCart: () => set({ items: [], customer: null, discount: 0, note: '' }),

      // ── Other setters ─────────────────────────────────────
      setCustomer: (c)    => set({ customer: c }),
      setDiscount: (d)    => set({ discount: d }),
      setLastSale: (sale) => set({ lastSale: sale }),

      // ── Hold / Resume ─────────────────────────────────────
      holdSale: () => {
        const { items, customer, discount, note, heldSales } = get()
        if (!items.length) return false
        set({
          heldSales: [...heldSales, {
            id:         Date.now(),
            items:      JSON.parse(JSON.stringify(items)),
            customer,
            discount,
            note,
            created_at: new Date().toISOString(),
          }],
          items: [], customer: null, discount: 0, note: '',
        })
        return true
      },

      resumeSale: (id) => {
        const { heldSales } = get()
        const held = heldSales.find(s => s.id === id)
        if (!held) return
        set({
          items:     held.items,
          customer:  held.customer,
          discount:  held.discount ?? 0,
          note:      held.note ?? '',
          heldSales: heldSales.filter(s => s.id !== id),
        })
      },

      deleteHeld: (id) =>
        set({ heldSales: get().heldSales.filter(s => s.id !== id) }),
    }),
    {
      name: 'supershop-pos-v2',
      // শুধু heldSales persist হবে — cart reset হবে page reload এ
      partialize: (state) => ({ heldSales: state.heldSales }),
    }
  )
)

export default usePosStore