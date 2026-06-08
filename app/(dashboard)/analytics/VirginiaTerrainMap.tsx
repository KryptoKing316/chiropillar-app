'use client'

// Interactive terrain map of Virginia — 11 target cities + all 145 clinics + top-5 leaderboard.
// Leaflet is loaded from CDN at runtime (client-only) to avoid adding a build dependency.
import { useEffect, useRef } from 'react'
import { VA_CHIROS, type VAChiro } from './vaChiros'

type Geo = { lat: number; lng: number; tier: 'primary' | 'test2' | 'scale' | 'tail' }

const TIER: Record<Geo['tier'], { label: string; color: string }> = {
  primary: { label: 'Primary Test', color: '#C9A84C' },
  test2: { label: 'Test City #2', color: '#2E75B6' },
  scale: { label: 'Scale', color: '#7FB0E8' },
  tail: { label: 'Long Tail', color: '#8893ad' },
}

function resolveGeo(city: string): Geo | null {
  const c = city.toLowerCase()
  if (c.includes('charlottesville')) return { lat: 38.0293, lng: -78.4767, tier: 'primary' }
  if (c.includes('richmond')) return { lat: 37.5407, lng: -77.4360, tier: 'test2' }
  if (c.includes('virginia beach')) return { lat: 36.8529, lng: -75.9780, tier: 'test2' }
  if (c.includes('fairfax') || c.includes('nova')) return { lat: 38.8462, lng: -77.3064, tier: 'scale' }
  if (c.includes('fredericksburg')) return { lat: 38.3032, lng: -77.4605, tier: 'scale' }
  if (c.includes('harrisonburg')) return { lat: 38.4496, lng: -78.8689, tier: 'scale' }
  if (c.includes('lynchburg')) return { lat: 37.4138, lng: -79.1422, tier: 'scale' }
  if (c.includes('roanoke')) return { lat: 37.2710, lng: -79.9414, tier: 'scale' }
  if (c.includes('williamsburg')) return { lat: 37.2707, lng: -76.7075, tier: 'tail' }
  if (c.includes('waynesboro') || c.includes('staunton')) return { lat: 38.1080, lng: -78.9800, tier: 'tail' }
  if (c.includes('orange')) return { lat: 38.2454, lng: -78.1108, tier: 'tail' }
  return null
}

const TOP5 = [
  { rank: 1, name: 'Active Family Wellness', city: 'Fairfax', rating: 4.9, reviews: 972, why: 'Highest review volume statewide' },
  { rank: 2, name: 'Balanced Chiropractic & PT', city: 'Charlottesville', rating: 4.9, reviews: 297, why: "Primary test city's dominant clinic" },
  { rank: 3, name: 'Chiro-Med Health Center', city: 'Lynchburg', rating: 4.9, reviews: 643, why: '~3× competitors’ review volume' },
  { rank: 4, name: 'Spinal Correction Center', city: 'Richmond', rating: 4.8, reviews: 356, why: 'Test-metro award leader' },
  { rank: 5, name: 'Williamsburg Neck & Back', city: 'Williamsburg', rating: 4.9, reviews: 592, why: 'Award-winning market leader' },
]

const isChain = (x: VAChiro) => /chain|franchise/i.test(x.dominantSignal) || /the joint/i.test(x.name)
const cityShort = (s: string) => s.replace(/, Virginia$/i, '')
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))

export default function VirginiaTerrainMap() {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    let cancelled = false

    async function ensureLeaflet() {
      const w = window as any
      if (w.L) return
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'; link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        s.async = true; s.onload = () => resolve(); s.onerror = () => reject(new Error('leaflet load failed'))
        document.body.appendChild(s)
      })
    }

    ensureLeaflet().then(() => {
      if (cancelled || !ref.current || mapRef.current) return
      const L = (window as any).L

      const terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17, subdomains: ['a', 'b', 'c'], attribution: '© OpenTopoMap (CC-BY-SA) · © OpenStreetMap' })
      const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18, attribution: 'Imagery © Esri' })
      const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd', attribution: '© CARTO · © OpenStreetMap' })

      const map = L.map(ref.current, { layers: [terrain], scrollWheelZoom: true })
      L.control.layers({ 'Terrain (see the land)': terrain, 'Satellite': sat, 'Dark': dark }, null, { position: 'topright' }).addTo(map)
      mapRef.current = map

      const cityMarkers: Record<string, any> = {}
      const bounds: [number, number][] = []

      VA_CHIROS.forEach(c => {
        const geo = resolveGeo(c.city); if (!geo) return
        const col = TIER[geo.tier].color
        const short = cityShort(c.city)
        const no1 = c.chiropractors.find(x => !isChain(x))

        c.chiropractors.forEach((x, i) => {
          const r = 0.010 + (i % 6) * 0.0055
          const a = i * 2.39996323
          const lat = geo.lat + r * Math.cos(a)
          const lng = geo.lng + r * Math.sin(a) / Math.cos(geo.lat * Math.PI / 180)
          bounds.push([lat, lng])
          const chain = isChain(x)
          const top5rank = TOP5.find(t => x.name.toLowerCase().includes(t.name.toLowerCase().split(' & ')[0].toLowerCase().slice(0, 14)))
          const isTop5 = !!top5rank && x.name.toLowerCase().includes(top5rank.name.toLowerCase().slice(0, 10))
          const isNo1 = no1 && x.name === no1.name
          let radius = 3 + Math.min(9, Math.sqrt(x.reviews || 1) / 3)
          const strokeC = isTop5 ? '#E8C96A' : (isNo1 ? '#ffffff' : 'rgba(255,255,255,.35)')
          const weight = isTop5 ? 2.4 : (isNo1 ? 1.8 : 0.8)
          if (isTop5) radius += 2.5
          const m = L.circleMarker([lat, lng], { radius, color: strokeC, weight, fillColor: chain ? '#7a8699' : col, fillOpacity: chain ? 0.45 : 0.82 })
          let badge = ''
          if (isTop5 && top5rank) badge += ` <span class="vtag t5">★ TOP 5 · #${top5rank.rank}</span>`
          else if (isNo1) badge += ' <span class="vtag no1">CITY #1</span>'
          if (chain) badge += ' <span class="vtag ch">CHAIN</span>'
          m.bindPopup(`<div class="vpop"><b>${esc(x.name)}</b>${badge}<div class="vr">${x.rating || '—'}★ · ${x.reviews || 0} reviews</div><div class="vf">${esc(x.focus)}</div><div class="va">${esc(short)} · ${esc(x.area)}</div>${x.website ? `<a href="${esc(x.website)}" target="_blank" rel="noopener">Visit website →</a>` : ''}</div>`, { maxWidth: 280 })
          m.addTo(map)
        })

        const pulse = (geo.tier === 'primary' || geo.tier === 'test2') ? ' pulse' : ''
        const icon = L.divIcon({ className: '', iconSize: [0, 0], iconAnchor: [0, 0], html: `<div class="vcnode${pulse}" style="--c:${col}"><span class="vcdot"></span><span class="vclabel">${esc(short)} · ${c.chiropractors.length}</span></div>` })
        const cm = L.marker([geo.lat, geo.lng], { icon, zIndexOffset: 1000 }).addTo(map)
        cm.bindPopup(`<div class="vpop"><b>${esc(short)}</b> <span class="vtag" style="background:${col}22;color:${col};border:1px solid ${col}">${TIER[geo.tier].label.toUpperCase()}</span><div class="vr">${c.chiropractors.length} clinics ranked</div>${no1 ? `<div class="vf">★ #1 independent: <b style="color:#E8C96A">${esc(no1.name)}</b> (${no1.rating}★ · ${no1.reviews})</div>` : ''}</div>`, { maxWidth: 270 })
        cityMarkers[short] = cm
      })

      if (bounds.length) map.fitBounds(L.latLngBounds(bounds).pad(0.12))
      setTimeout(() => { try { map.invalidateSize() } catch {} }, 200)

      const legend = L.control({ position: 'bottomleft' })
      legend.onAdd = function () {
        const d = L.DomUtil.create('div', 'vlegend')
        d.innerHTML = '<div class="vlh">Legend</div>'
          + '<div><i style="background:#C9A84C"></i>Primary test (Charlottesville)</div>'
          + '<div><i style="background:#2E75B6"></i>Test city #2 (Richmond · VA Beach)</div>'
          + '<div><i style="background:#7FB0E8"></i>Scale market</div>'
          + '<div><i style="background:#8893ad"></i>Long tail</div>'
          + '<div style="margin-top:5px;border-top:1px solid rgba(255,255,255,.12);padding-top:5px">● dot size = review volume</div>'
          + '<div><span style="color:#E8C96A;font-weight:800">★ gold ring</span> = top-5 · <span style="color:#fff">white ring</span> = city #1</div>'
          + '<div><i style="background:#7a8699"></i>national chain (excluded)</div>'
        L.DomEvent.disableClickPropagation(d)
        return d
      }
      legend.addTo(map)
    }).catch(() => {
      if (ref.current) ref.current.innerHTML = '<div style="padding:40px;text-align:center;color:#9BA8C0">Map tiles need an internet connection — reconnect and reload.</div>'
    })

    return () => { cancelled = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null } }
  }, [])

  return (
    <div style={{ marginBottom: 26 }}>
      <style>{`
        .vcnode{transform:translate(-7px,-7px);white-space:nowrap;display:flex;align-items:center;gap:6px}
        .vcdot{width:14px;height:14px;border-radius:50%;background:var(--c);box-shadow:0 0 0 3px rgba(5,16,31,.6),0 0 16px var(--c);position:relative;flex:none}
        .vcnode.pulse .vcdot::after{content:"";position:absolute;inset:-5px;border-radius:50%;border:2px solid var(--c);animation:vpulse 2.2s ease-out infinite}
        @keyframes vpulse{0%{transform:scale(.6);opacity:.9}100%{transform:scale(2.4);opacity:0}}
        .vclabel{font-family:'JetBrains Mono',monospace;font-weight:800;font-size:10.5px;color:#fff;text-shadow:0 1px 4px #000;background:rgba(5,16,31,.72);padding:3px 7px;border-radius:6px;border:1px solid var(--c)}
        .vlegend{background:rgba(8,20,40,.92);border:1px solid rgba(201,168,76,.25);border-radius:10px;padding:10px 12px;font-size:10.5px;color:#9BA8C0;line-height:1.7}
        .vlegend .vlh{font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.18em;color:#C9A84C;font-weight:800;text-transform:uppercase;margin-bottom:6px}
        .vlegend i{width:11px;height:11px;border-radius:50%;display:inline-block;margin-right:7px;vertical-align:-1px}
        .leaflet-popup-content-wrapper{background:#0a1830;color:#F2EEE7;border:1px solid rgba(201,168,76,.25);border-radius:11px}
        .leaflet-popup-tip{background:#0a1830}
        .vpop b{font-size:13px}.vpop .vr{color:#E8C96A;font-weight:700;font-family:'JetBrains Mono',monospace;font-size:11px;margin:5px 0 4px}
        .vpop .vf{color:#9BA8C0;font-size:11px;margin-bottom:5px}.vpop .va{color:#5b6b8c;font-size:10px;margin-bottom:6px}
        .vtag{display:inline-block;font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:800;letter-spacing:.06em;padding:2px 6px;border-radius:4px;margin-left:5px}
        .vtag.t5{background:rgba(201,168,76,.18);color:#E8C96A;border:1px solid #C9A84C}
        .vtag.no1{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.25)}
        .vtag.ch{background:rgba(122,134,153,.18);color:#aab4c6;border:1px solid #7a8699}
        .leaflet-control-layers,.leaflet-bar a{background:#0a1830;color:#F2EEE7;border-color:rgba(201,168,76,.25)}
        .leaflet-control-attribution{background:rgba(5,16,31,.7)!important;color:#6b7a99!important}
        .leaflet-control-attribution a{color:#8aa0c4!important}
      `}</style>

      {/* top-5 leaderboard */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, marginBottom: 12 }}>
        <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: 14, borderRight: '1px solid rgba(201,168,76,0.25)' }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '0.2em', color: '#C9A84C', fontWeight: 800, textTransform: 'uppercase' }}>★ Priority</span>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: '#F2EEE7', fontWeight: 700, marginTop: 3 }}>Top 5 Statewide</span>
        </div>
        {TOP5.map(t => (
          <div key={t.rank} style={{ flex: 'none', width: 184, background: 'var(--kb-bg-panel)', border: `1px solid ${t.rank === 1 ? '#C9A84C' : 'var(--kb-border)'}`, borderRadius: 10, padding: '9px 12px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 6, right: 9, fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 800, color: 'rgba(201,168,76,0.22)' }}>{t.rank}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#F2EEE7', paddingRight: 20, lineHeight: 1.25 }}>{t.name}</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '0.08em', color: '#C9A84C', textTransform: 'uppercase', margin: '4px 0 5px', fontWeight: 700 }}>{t.city}</div>
            <div style={{ fontSize: 11, color: '#E8C96A', fontWeight: 800 }}>{t.rating}★ <span style={{ color: '#9BA8C0', fontWeight: 500, fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}>{t.reviews} rev</span></div>
            <div style={{ fontSize: 10, color: '#9BA8C0', marginTop: 4, lineHeight: 1.35 }}>{t.why}</div>
          </div>
        ))}
      </div>

      <div ref={ref} style={{ height: 540, width: '100%', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--kb-border)', background: '#06122a' }} />
      <div style={{ fontSize: 11, color: '#5b6b8c', marginTop: 8, lineHeight: 1.5 }}>
        Toggle <strong style={{ color: '#9BA8C0' }}>Terrain / Satellite / Dark</strong> (top-right). Clinic pins are clustered within each city (not exact street addresses); click any pin for rating, reviews, focus &amp; website. National chains are flagged and excluded as partners. Map needs an internet connection.
      </div>
    </div>
  )
}
