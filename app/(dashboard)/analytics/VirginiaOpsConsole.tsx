'use client'

// Full Palantir-style "Virginia Operations" command center — ported from the
// standalone ProMedVA_Virginia_Operations_Map.html: classification bar, header
// (brand + stats + US locator inset), top-5 leaderboard, city rail + terrain map,
// legend, footer. Leaflet loads from CDN at runtime (client-only).
import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import { VA_CHIROS, type VAChiro } from './vaChiros'

type Tier = 'primary' | 'test2' | 'scale' | 'tail'
const TIER: Record<Tier, { label: string; color: string }> = {
  primary: { label: 'Focus City', color: '#C9A84C' },
  test2: { label: 'Candidate', color: '#2E75B6' },
  scale: { label: 'Scale', color: '#7FB0E8' },
  tail: { label: 'Long Tail', color: '#8893ad' },
}
const TIER_ORDER: Record<Tier, number> = { primary: 0, test2: 1, scale: 2, tail: 3 }

function geoOf(city: string): { lat: number; lng: number; tier: Tier } | null {
  const c = city.toLowerCase()
  if (c.includes('charlottesville')) return null // excluded — principal's home market (anonymity)
  if (c.includes('waynesboro') || c.includes('staunton')) return { lat: 38.1080, lng: -78.9800, tier: 'primary' }
  if (c.includes('harrisonburg')) return { lat: 38.4496, lng: -78.8689, tier: 'primary' }
  if (c.includes('lynchburg')) return { lat: 37.4138, lng: -79.1422, tier: 'primary' }
  if (c.includes('richmond')) return { lat: 37.5407, lng: -77.4360, tier: 'test2' }
  if (c.includes('virginia beach')) return { lat: 36.8529, lng: -75.9780, tier: 'scale' }
  if (c.includes('fairfax') || c.includes('nova')) return { lat: 38.8462, lng: -77.3064, tier: 'scale' }
  if (c.includes('fredericksburg')) return { lat: 38.3032, lng: -77.4605, tier: 'scale' }
  if (c.includes('roanoke')) return { lat: 37.2710, lng: -79.9414, tier: 'scale' }
  if (c.includes('williamsburg')) return { lat: 37.2707, lng: -76.7075, tier: 'tail' }
  if (c.includes('orange')) return { lat: 38.2454, lng: -78.1108, tier: 'tail' }
  return null
}

const TOP5 = [
  { rank: 1, name: 'Chiro-Med Health Center', city: 'Lynchburg', rating: 4.9, reviews: 643, why: 'Runaway leader — ~3× competitors' },
  { rank: 2, name: 'Spinal Correction Center', city: 'Richmond', rating: 4.8, reviews: 356, why: 'Award-winning metro leader (candidate)' },
  { rank: 3, name: 'Chiropractic Solutions', city: 'Harrisonburg', rating: 5.0, reviews: 288, why: 'Top independent in Harrisonburg' },
  { rank: 4, name: 'Hailey Chiropractic', city: 'Waynesboro / Staunton', rating: 5.0, reviews: 51, why: 'Leading independent in the valley' },
]

const isChain = (x: VAChiro) => /chain|franchise/i.test(x.dominantSignal) || /the joint/i.test(x.name)
const cityShort = (s: string) => s.replace(/, Virginia$/i, '')
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))

export default function VirginiaOpsConsole() {
  const mapEl = useRef<HTMLDivElement>(null)
  const locEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Record<string, any>>({})

  const totalClinics = VA_CHIROS.reduce((s, c) => s + c.chiropractors.length, 0)
  const railCities = [...VA_CHIROS].filter(c => geoOf(c.city)).sort((a, b) => {
    const ga = geoOf(a.city)!, gb = geoOf(b.city)!
    if (TIER_ORDER[ga.tier] !== TIER_ORDER[gb.tier]) return TIER_ORDER[ga.tier] - TIER_ORDER[gb.tier]
    return b.chiropractors.length - a.chiropractors.length
  })

  function flyTo(c: { city: string }) {
    const m = mapRef.current; const g = geoOf(c.city); if (!m || !g) return
    m.flyTo([g.lat, g.lng], g.tier === 'primary' ? 12 : 11, { duration: 0.8 })
    const mk = markersRef.current[cityShort(c.city)]
    if (mk) setTimeout(() => mk.openPopup(), 850)
  }

  useEffect(() => {
    let cancelled = false
    import('leaflet').then((mod) => {
      const L: any = (mod as any).default ?? mod
      if (cancelled || !mapEl.current || mapRef.current) return
      const terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17, subdomains: ['a', 'b', 'c'], attribution: '© OpenTopoMap (CC-BY-SA) · © OpenStreetMap' })
      const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18, attribution: 'Imagery © Esri' })
      const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd', attribution: '© CARTO · © OpenStreetMap' })
      const map = L.map(mapEl.current, { layers: [terrain], scrollWheelZoom: true })
      L.control.layers({ 'Terrain (see the land)': terrain, 'Satellite': sat, 'Dark': dark }, null, { position: 'topright' }).addTo(map)
      mapRef.current = map
      const bounds: [number, number][] = []

      VA_CHIROS.forEach(c => {
        const geo = geoOf(c.city); if (!geo) return
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
          const t5 = TOP5.find(t => x.name.toLowerCase().includes(t.name.toLowerCase().slice(0, 12)))
          const no1m = no1 && x.name === no1.name
          let radius = 3 + Math.min(9, Math.sqrt(x.reviews || 1) / 3)
          const stroke = t5 ? '#E8C96A' : (no1m ? '#fff' : 'rgba(255,255,255,.35)')
          const weight = t5 ? 2.4 : (no1m ? 1.8 : 0.8)
          if (t5) radius += 2.5
          let badge = ''
          if (t5) badge += ` <span class="voc-tag t5">★ TOP 5 · #${t5.rank}</span>`
          else if (no1m) badge += ' <span class="voc-tag no1">CITY #1</span>'
          if (chain) badge += ' <span class="voc-tag ch">CHAIN</span>'
          L.circleMarker([lat, lng], { radius, color: stroke, weight, fillColor: chain ? '#7a8699' : col, fillOpacity: chain ? 0.45 : 0.82 })
            .bindPopup(`<div class="voc-pop"><b>${esc(x.name)}</b>${badge}<div class="vr">${x.rating || '—'}★ · ${x.reviews || 0} reviews</div><div class="vf">${esc(x.focus)}</div><div class="va">${esc(short)} · ${esc(x.area)}</div>${x.website ? `<a href="${esc(x.website)}" target="_blank" rel="noopener">Visit website →</a>` : ''}</div>`, { maxWidth: 280 })
            .addTo(map)
        })
        const pulse = (geo.tier === 'primary' || geo.tier === 'test2') ? ' pulse' : ''
        const icon = L.divIcon({ className: '', iconSize: [0, 0], iconAnchor: [0, 0], html: `<div class="voc-node${pulse}" style="--c:${col}"><span class="voc-dot"></span><span class="voc-label">${esc(short)} · ${c.chiropractors.length}</span></div>` })
        const cm = L.marker([geo.lat, geo.lng], { icon, zIndexOffset: 1000 }).addTo(map)
        cm.bindPopup(`<div class="voc-pop"><b>${esc(short)}</b> <span class="voc-tag" style="background:${col}22;color:${col};border:1px solid ${col}">${TIER[geo.tier].label.toUpperCase()}</span><div class="vr">${c.chiropractors.length} clinics ranked</div>${no1 ? `<div class="vf">★ #1 independent: <b style="color:#E8C96A">${esc(no1.name)}</b> (${no1.rating}★ · ${no1.reviews})</div>` : ''}</div>`, { maxWidth: 270 })
        markersRef.current[short] = cm
      })

      if (bounds.length) map.fitBounds(L.latLngBounds(bounds).pad(0.12))
      ;[150, 500].forEach(t => setTimeout(() => { try { map.invalidateSize() } catch {} }, t))

      const legend = L.control({ position: 'bottomleft' })
      legend.onAdd = function () {
        const d = L.DomUtil.create('div', 'voc-legend')
        d.innerHTML = '<div class="lh">Legend</div>'
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

      // locator inset (VA within the US)
      if (locEl.current) {
        const loc = L.map(locEl.current, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false })
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd' }).addTo(loc)
        loc.setView([38.0, -79.2], 5)
        L.rectangle([[36.5, -83.7], [39.5, -75.2]], { color: '#C9A84C', weight: 1.4, fill: false, dashArray: '3 3' }).addTo(loc)
        VA_CHIROS.forEach(c => { const g = geoOf(c.city); if (g) L.circleMarker([g.lat, g.lng], { radius: 2.2, weight: 0, fillOpacity: 0.95, fillColor: TIER[g.tier].color }).addTo(loc) })
        setTimeout(() => { try { loc.invalidateSize() } catch {} }, 300)
      }
    }).catch(() => { if (mapEl.current) mapEl.current.innerHTML = '<div style="padding:40px;text-align:center;color:#9BA8C0">Map tiles need an internet connection — reconnect and reload.</div>' })

    return () => { cancelled = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null } }
  }, [])

  return (
    <div className="voc">
      <style>{vocCSS}</style>

      <div className="voc-class"><span className="d" /> PROMEDVA · Virginia Operations · Internal / Confidential <span className="d" /></div>

      <header className="voc-head">
        <div className="voc-brand">ProMed&nbsp;<b>VA</b><span>Recruiting Intelligence</span></div>
        <div className="voc-title">
          <h1>Virginia Recruiting Map</h1>
          <p>Top-rated chiropractors across the target cities — <b>start in the four focus towns</b> (Waynesboro, Staunton, Harrisonburg, Lynchburg) + Richmond, then scale. Pins clustered by city; click any for details.</p>
        </div>
        <div className="voc-stats">
          {[['4', 'Focus cities'], [String(totalClinics), 'Clinics ranked'], ['10', 'Cities mapped'], ['1', 'Partner / city']].map(s => (
            <div key={s[1]} className="st"><div className="n">{s[0]}</div><div className="l">{s[1]}</div></div>
          ))}
        </div>
        <div className="voc-loc"><div ref={locEl} className="loc" /><div className="cap">Commonwealth of Virginia</div></div>
      </header>

      <div className="voc-lead">
        <div className="tag"><span className="k">★ Priority</span><span className="v">Focus-City Targets</span></div>
        <div className="cards">
          {TOP5.map(t => (
            <div key={t.rank} className={'lc' + (t.rank === 1 ? ' top1' : '')}>
              <div className="rk">{t.rank}</div>
              <div className="nm">{t.name}</div>
              <div className="ci">{t.city}</div>
              <div className="mt"><span className="rt">{t.rating}★</span><span className="rv">{t.reviews} reviews</span></div>
              <div className="wy">{t.why}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="voc-body">
        <div className="voc-rail">
          <h3>11 Cities · click to fly</h3>
          {railCities.map(c => {
            const g = geoOf(c.city)!; const col = TIER[g.tier].color
            const no1 = c.chiropractors.find(x => !isChain(x))
            return (
              <button key={c.city} className="crow" style={{ ['--tc' as any]: col }} onClick={() => flyTo(c)}>
                <div className="top"><span className="cn">{cityShort(c.city)}</span><span className="badge">{TIER[g.tier].label}</span></div>
                <div className="cnt">{c.chiropractors.length} clinics ranked</div>
                {no1 && <div className="t1">★ #1: <b>{no1.name}</b> · {no1.rating}★ {no1.reviews} rev</div>}
              </button>
            )
          })}
        </div>
        <div ref={mapEl} className="voc-map" />
      </div>

      <footer className="voc-foot">
        <div><b>{totalClinics} clinics · 11 cities.</b> Ranked by Google rating × review-volume. National chains (e.g. The Joint) flagged &amp; excluded as partners.</div>
        <div>⚠ Researched/estimated Google data (2026). Pins clustered within each city (not exact street addresses) — verify before outreach. Map needs internet.</div>
      </footer>
    </div>
  )
}

const vocCSS = `
.voc{height:100vh;display:flex;flex-direction:column;background:#05101f;color:#F2EEE7;font-family:'Inter',system-ui,sans-serif;overflow:hidden}
.voc *{box-sizing:border-box}
.voc-class{height:24px;flex:none;display:flex;align-items:center;justify-content:center;gap:14px;background:repeating-linear-gradient(45deg,#0a1830,#0a1830 14px,#0c1d3a 14px,#0c1d3a 28px);border-bottom:1px solid rgba(201,168,76,.25);font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.32em;color:#C9A84C;font-weight:800;text-transform:uppercase}
.voc-class .d{width:5px;height:5px;border-radius:50%;background:#C9A84C;box-shadow:0 0 8px #C9A84C}
.voc-head{flex:none;display:flex;align-items:center;gap:22px;padding:14px 22px 12px;border-bottom:1px solid rgba(255,255,255,.08)}
.voc-brand{font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:800;white-space:nowrap}
.voc-brand b{color:#C9A84C}
.voc-brand span{display:block;font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.28em;color:#5b6b8c;font-weight:700;margin-top:3px}
.voc-title{flex:1;min-width:0}
.voc-title h1{margin:0;font-family:'Playfair Display',Georgia,serif;font-size:clamp(17px,2vw,25px);font-weight:700}
.voc-title p{margin:3px 0 0;color:#9BA8C0;font-size:12.5px}
.voc-title p b{color:#E8C96A}
.voc-stats{display:flex;gap:10px}
.voc-stats .st{background:#0e2042;border:1px solid rgba(255,255,255,.08);border-radius:9px;padding:7px 13px;text-align:center;min-width:62px}
.voc-stats .n{font-family:'Playfair Display',Georgia,serif;font-size:18px;font-weight:800;color:#E8C96A;line-height:1}
.voc-stats .l{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:.14em;color:#5b6b8c;margin-top:4px;text-transform:uppercase}
.voc-loc{flex:none}
.voc-loc .loc{width:148px;height:84px;border-radius:9px;border:1px solid rgba(201,168,76,.25);overflow:hidden;background:#06122a}
.voc-loc .cap{font-family:'JetBrains Mono',monospace;font-size:7.5px;letter-spacing:.18em;color:#5b6b8c;text-align:center;margin-top:3px;text-transform:uppercase}
.voc-lead{flex:none;display:flex;gap:0;align-items:stretch;padding:11px 16px;border-bottom:1px solid rgba(255,255,255,.08);overflow-x:auto}
.voc-lead .tag{display:flex;flex-direction:column;justify-content:center;padding-right:16px;margin-right:6px;border-right:1px solid rgba(201,168,76,.25);flex:none}
.voc-lead .tag .k{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.22em;color:#C9A84C;font-weight:800;text-transform:uppercase}
.voc-lead .tag .v{font-family:'Playfair Display',Georgia,serif;font-size:15px;font-weight:700;margin-top:3px;max-width:120px;line-height:1.1}
.voc-lead .cards{display:flex;gap:10px}
.voc-lead .lc{position:relative;flex:none;width:212px;background:#0e2042;border:1px solid rgba(255,255,255,.08);border-radius:11px;padding:10px 12px;overflow:hidden}
.voc-lead .lc.top1{border-color:#C9A84C;box-shadow:0 0 0 1px #C9A84C inset}
.voc-lead .lc .rk{position:absolute;top:7px;right:10px;font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:800;color:rgba(201,168,76,.22);line-height:1}
.voc-lead .lc .nm{font-size:12.5px;font-weight:700;line-height:1.25;padding-right:24px}
.voc-lead .lc .ci{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.1em;color:#C9A84C;text-transform:uppercase;margin:5px 0 6px;font-weight:700}
.voc-lead .lc .mt{display:flex;gap:8px;align-items:baseline;margin-bottom:5px}
.voc-lead .lc .rt{color:#E8C96A;font-weight:800;font-size:13px}
.voc-lead .lc .rv{font-family:'JetBrains Mono',monospace;font-size:10px;color:#9BA8C0}
.voc-lead .lc .wy{font-size:10.5px;color:#9BA8C0;line-height:1.4}
.voc-body{flex:1;min-height:0;display:flex}
.voc-rail{width:300px;flex:none;border-right:1px solid rgba(255,255,255,.08);overflow-y:auto;background:#0a1830;padding:12px}
.voc-rail h3{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.2em;color:#5b6b8c;text-transform:uppercase;margin:6px 4px 9px;font-weight:800}
.voc-rail .crow{display:block;width:100%;text-align:left;background:#0e2042;border:1px solid rgba(255,255,255,.08);border-left:3px solid var(--tc);border-radius:9px;padding:9px 11px;margin-bottom:8px;cursor:pointer;transition:.13s;color:inherit;font-family:inherit}
.voc-rail .crow:hover{background:#102a52;transform:translateX(2px)}
.voc-rail .crow .top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.voc-rail .crow .cn{font-size:13.5px;font-weight:700}
.voc-rail .crow .badge{font-family:'JetBrains Mono',monospace;font-size:7.5px;letter-spacing:.12em;font-weight:800;color:var(--tc);border:1px solid var(--tc);border-radius:999px;padding:2px 7px;text-transform:uppercase;white-space:nowrap}
.voc-rail .crow .cnt{font-family:'JetBrains Mono',monospace;font-size:10px;color:#9BA8C0;margin-top:4px}
.voc-rail .crow .t1{font-size:11px;color:#9BA8C0;margin-top:6px;line-height:1.35;border-top:1px dashed rgba(255,255,255,.08);padding-top:6px}
.voc-rail .crow .t1 b{color:#E8C96A}
.voc-map{flex:1;min-width:0;height:100%;background:#06122a}
.voc-foot{flex:none;padding:8px 18px;border-top:1px solid rgba(255,255,255,.08);background:#0a1830;font-size:10.5px;color:#5b6b8c;display:flex;justify-content:space-between;gap:14px;align-items:center}
.voc-foot b{color:#9BA8C0}
/* leaflet custom */
.voc-node{transform:translate(-7px,-7px);white-space:nowrap;display:flex;align-items:center;gap:6px}
.voc-dot{width:14px;height:14px;border-radius:50%;background:var(--c);box-shadow:0 0 0 3px rgba(5,16,31,.6),0 0 16px var(--c);position:relative;flex:none}
.voc-node.pulse .voc-dot::after{content:"";position:absolute;inset:-5px;border-radius:50%;border:2px solid var(--c);animation:vocpulse 2.2s ease-out infinite}
@keyframes vocpulse{0%{transform:scale(.6);opacity:.9}100%{transform:scale(2.4);opacity:0}}
.voc-label{font-family:'JetBrains Mono',monospace;font-weight:800;font-size:10.5px;color:#fff;text-shadow:0 1px 4px #000;background:rgba(5,16,31,.72);padding:3px 7px;border-radius:6px;border:1px solid var(--c)}
.voc-legend{background:rgba(8,20,40,.92);border:1px solid rgba(201,168,76,.25);border-radius:10px;padding:10px 12px;font-size:10.5px;color:#9BA8C0;line-height:1.7}
.voc-legend .lh{font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.18em;color:#C9A84C;font-weight:800;text-transform:uppercase;margin-bottom:6px}
.voc-legend i{width:11px;height:11px;border-radius:50%;display:inline-block;margin-right:7px;vertical-align:-1px}
.leaflet-popup-content-wrapper{background:#0a1830;color:#F2EEE7;border:1px solid rgba(201,168,76,.25);border-radius:11px}
.leaflet-popup-tip{background:#0a1830}
.voc-pop b{font-size:13px}.voc-pop .vr{color:#E8C96A;font-weight:700;font-family:'JetBrains Mono',monospace;font-size:11px;margin:5px 0 4px}
.voc-pop .vf{color:#9BA8C0;font-size:11px;margin-bottom:5px}.voc-pop .va{color:#5b6b8c;font-size:10px;margin-bottom:6px}
.voc-tag{display:inline-block;font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:800;letter-spacing:.06em;padding:2px 6px;border-radius:4px;margin-left:5px}
.voc-tag.t5{background:rgba(201,168,76,.18);color:#E8C96A;border:1px solid #C9A84C}
.voc-tag.no1{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.25)}
.voc-tag.ch{background:rgba(122,134,153,.18);color:#aab4c6;border:1px solid #7a8699}
.leaflet-control-layers,.leaflet-bar a{background:#0a1830;color:#F2EEE7;border-color:rgba(201,168,76,.25)}
.leaflet-control-attribution{background:rgba(5,16,31,.7)!important;color:#6b7a99!important}
.leaflet-control-attribution a{color:#8aa0c4!important}
@media(max-width:900px){.voc{height:auto}.voc-head{flex-wrap:wrap}.voc-stats{order:3}.voc-body{flex-direction:column;height:auto}.voc-rail{width:100%;max-height:none}.voc-map{height:60vh}}
`
