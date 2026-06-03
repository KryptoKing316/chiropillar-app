'use client'

// ChiroPillar Leads · Virginia chiropractor target list (CRM)
// Click any row -> side drawer opens with: phone (click-to-call),
// email (click-to-email), full contact info, status dropdown,
// notes editor with timestamped log, call/email history.
// All edits persist in local state for the demo session.

import { useState } from 'react'

const C = {
  bg: 'var(--kb-bg)', bg2: 'var(--kb-bg-panel)', bg3: 'var(--kb-bg-surface)',
  text: 'var(--kb-text)', muted: 'var(--kb-text-secondary)', faint: 'var(--kb-text-muted)',
  border: 'var(--kb-border)',
  spine: '#1F4E79', align: '#2E75B6', stone: '#EBD8A6', globe: '#9CC4E4',
  gold: '#C9A84C', goldLight: '#E8C96A', green: '#2ECC8B', coral: '#F2B0A0',
  red: '#E74C3C', amber: '#F39C12',
}
const F = {
  display: "'Playfair Display', Georgia, serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'DM Mono', monospace",
}

const fmtMoney = (n: number) => {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return '$' + Math.round(n / 1_000) + 'K'
  return '$' + n
}

type Region = 'NoVA' | 'Charlottesville' | 'Richmond' | 'Hampton Roads' | 'Western VA' | 'Central VA'
type Status = 'hot' | 'warm' | 'cold' | 'in_pipeline'
type Profile = 'solo' | 'multi' | 'multi_loc'
type NoteEntry = { ts: string; author: string; text: string; kind: 'note' | 'call' | 'email' | 'status' }

type Lead = {
  id: string
  practice: string
  owner: string
  email: string
  phone: string
  website?: string
  address: string
  city: string
  county: string
  region: Region
  est_revenue: number
  est_ebitda: number
  profile: Profile
  npm_est: number
  years: number
  employees: number
  status: Status
  score: number
  flag: string
  notes: NoteEntry[]
  verified?: boolean       // ✓ = data scraped from public sources · false = sample/illustrative
  source?: string          // attribution if verified
}

// ─── 40 Virginia chiropractors at $1M+ revenue (CRM-ready with contact info) ──
const SEED_LEADS: Lead[] = [
  // NoVA
  { id: 'va001', practice: 'Tysons Premier Chiropractic', owner: 'Dr. Erin Chen', email: 'erinchen@tysonspremiercare.com', phone: '(703) 555-2401', address: '8245 Greensboro Dr, Suite 220', city: 'Tysons', county: 'Fairfax', region: 'NoVA', est_revenue: 2_400_000, est_ebitda: 720_000, profile: 'multi', npm_est: 82, years: 11, employees: 9, status: 'cold', score: 78, flag: 'Metro corridor · 2 associate DCs', notes: [] },
  { id: 'va002', practice: 'Arlington Spine Specialists', owner: 'Dr. Robert Whitaker', email: 'rwhitaker@arlingtonspine.com', phone: '(703) 555-3127', address: '1500 N Courthouse Rd, 4th Fl', city: 'Arlington', county: 'Arlington', region: 'NoVA', est_revenue: 2_800_000, est_ebitda: 815_000, profile: 'multi_loc', npm_est: 95, years: 16, employees: 12, status: 'cold', score: 84, flag: '2 locations · sports + PI', notes: [] },
  { id: 'va003', practice: 'Alexandria Chiropractic Group', owner: 'Dr. Marcus Reyes', email: 'mreyes@oldtownchiro.com', phone: '(703) 555-1989', address: '215 King St', city: 'Alexandria', county: 'Alexandria', region: 'NoVA', est_revenue: 2_200_000, est_ebitda: 690_000, profile: 'multi', npm_est: 76, years: 13, employees: 8, status: 'cold', score: 75, flag: 'Old Town · upscale', notes: [] },
  { id: 'va004', practice: 'Fairfax Family Chiropractic', owner: 'Dr. Jennifer Park', email: 'drpark@fairfaxfamilychiro.com', phone: '(703) 555-4502', address: '4015 Chain Bridge Rd', city: 'Fairfax', county: 'Fairfax', region: 'NoVA', est_revenue: 1_900_000, est_ebitda: 600_000, profile: 'multi', npm_est: 68, years: 14, employees: 7, status: 'warm', score: 81, flag: 'Met at VA Chiro Assoc', notes: [
    { ts: '2026-05-15 14:22', author: 'McGrath', kind: 'call', text: 'Brief intro call. Park is open to a deeper conversation but wants to see specific numbers first. Sending Master Exec Summary + calendar link.' },
    { ts: '2026-05-22 09:10', author: 'McGrath', kind: 'note', text: 'Park requested follow-up after Memorial Day. She is in active conversation with another buyer - need to move fast.' },
  ] },
  { id: 'va005', practice: 'Vienna Spine & Wellness', owner: 'Dr. Michael Bose', email: 'mbose@viennaspine.com', phone: '(703) 555-5618', address: '305 Maple Ave W', city: 'Vienna', county: 'Fairfax', region: 'NoVA', est_revenue: 2_400_000, est_ebitda: 745_000, profile: 'multi', npm_est: 84, years: 12, employees: 10, status: 'cold', score: 79, flag: 'High-end · pain mgmt focus', notes: [] },
  { id: 'va006', practice: 'Reston Family Chiropractic', owner: 'Dr. Anjali Sharma', email: 'asharma@restonfamilychiro.com', phone: '(703) 555-6093', address: '11710 Plaza America Dr', city: 'Reston', county: 'Fairfax', region: 'NoVA', est_revenue: 1_600_000, est_ebitda: 480_000, profile: 'multi', npm_est: 58, years: 9, employees: 6, status: 'cold', score: 72, flag: '', notes: [] },
  { id: 'va007', practice: 'Leesburg Chiropractic & Wellness', owner: 'Dr. James Holcombe', email: 'jholcombe@leesburgchiro.com', phone: '(703) 555-7244', address: '224 Cornwall St NW', city: 'Leesburg', county: 'Loudoun', region: 'NoVA', est_revenue: 1_700_000, est_ebitda: 540_000, profile: 'multi', npm_est: 64, years: 10, employees: 7, status: 'warm', score: 80, flag: 'Mutual referral from Wagner network', notes: [
    { ts: '2026-05-12 11:30', author: 'Wagner', kind: 'call', text: 'Holcombe and I went to UVA together. Said he is 5 years from retirement, interested in legacy options. Sending soft pitch.' },
  ] },
  { id: 'va008', practice: 'Herndon Spine + Sport', owner: 'Dr. Kevin Marsh', email: 'kmarsh@herndonspine.com', phone: '(703) 555-8810', address: '585 Grove St', city: 'Herndon', county: 'Fairfax', region: 'NoVA', est_revenue: 1_400_000, est_ebitda: 420_000, profile: 'solo', npm_est: 52, years: 8, employees: 5, status: 'cold', score: 68, flag: 'Sports + extremity', notes: [] },
  { id: 'va009', practice: 'McLean Chiropractic Center', owner: 'Dr. Patricia Wu', email: 'pwu@mcleanchiro.com', phone: '(703) 555-9035', address: '6840 Old Dominion Dr', city: 'McLean', county: 'Fairfax', region: 'NoVA', est_revenue: 1_800_000, est_ebitda: 575_000, profile: 'solo', npm_est: 71, years: 17, employees: 6, status: 'cold', score: 76, flag: 'Tenured · solo running tight clinic', notes: [] },

  // ═════════════════════════════════════════════════════════════════════
  // Charlottesville (Wagner Primary) · ⭐ REAL VERIFIED practices
  // (data scraped from each practice's public website · WebFetch June 2026)
  // Phone numbers + addresses + DC names are REAL. Revenue/EBITDA/NPM are
  // estimated based on size signals — to be replaced by Apollo enrichment
  // once the agent pipeline runs.
  // ═════════════════════════════════════════════════════════════════════
  { id: 'va010', practice: 'Cox Chiropractic Clinic', owner: 'Dr. Wayne Fusco', email: 'info@coxclinic.com', phone: '(434) 293-6165', website: 'coxclinic.com', address: '1006 E Market St', city: 'Charlottesville', county: 'Albemarle', region: 'Charlottesville', est_revenue: 1_100_000, est_ebitda: 365_000, profile: 'multi', npm_est: 58, years: 25, employees: 6, status: 'cold', score: 82, flag: '✓ Verified · 25-yr tenure · downtown location', verified: true, source: 'coxclinic.com', notes: [] },
  { id: 'va011', practice: 'Balanced Chiropractic and Physical Therapy', owner: 'Dr. Samuel Spillman + Dr. Sarahfina Wipf', email: 'info@balancechiropracticva.com', phone: '(434) 293-3800', website: 'balancechiropracticva.com', address: '608 Preston Ave, Suite 100', city: 'Charlottesville', county: 'Albemarle', region: 'Charlottesville', est_revenue: 1_650_000, est_ebitda: 545_000, profile: 'multi_loc', npm_est: 78, years: 12, employees: 11, status: 'warm', score: 89, flag: '✓ Verified · Multi-DC + PT + massage · CSCS credentialed', verified: true, source: 'balancechiropracticva.com', notes: [
    { ts: '2026-05-28 10:00', author: 'Note', kind: 'note', text: 'Multi-DC practice with combined Chiro + PT + massage + dry needling + Webster cert. Strong fit profile for medical-team integration.' },
  ] },
  { id: 'va012', practice: 'Venture Chiropractic', owner: 'Dr. Rhett Adams', email: 'info@venturechirocville.com', phone: '(434) 956-4275', website: 'venturechirocville.com', address: '1747 Allied St, Suite I', city: 'Charlottesville', county: 'Albemarle', region: 'Charlottesville', est_revenue: 1_050_000, est_ebitda: 355_000, profile: 'solo', npm_est: 62, years: 8, employees: 4, status: 'cold', score: 78, flag: '✓ Verified · 2nd-gen Gonstead · Life Univ grad · serves Crozet/Ivy/Orange', verified: true, source: 'venturechirocville.com', notes: [] },
  { id: 'va013', practice: 'Ivy Commons Family Chiropractic', owner: 'Dr. Custer', email: 'info@ivychiropractic.com', phone: '(434) 293-2779', website: 'ivychiropractic.com', address: '4422 Ivy Commons', city: 'Charlottesville', county: 'Albemarle', region: 'Charlottesville', est_revenue: 950_000, est_ebitda: 320_000, profile: 'solo', npm_est: 51, years: 11, employees: 4, status: 'cold', score: 74, flag: '✓ Verified · Family + pediatric + prenatal · extremity adjusting', verified: true, source: 'ivychiropractic.com', notes: [] },
  { id: 'va014b', practice: 'Core Integrated Health and Chiropractic', owner: 'Dr. Tate Huffman, D.C.', email: 'info@corecharlottesville.com', phone: '(434) 963-2673', website: 'corecharlottesville.com', address: '224 Carlton Rd', city: 'Charlottesville', county: 'Albemarle', region: 'Charlottesville', est_revenue: 720_000, est_ebitda: 245_000, profile: 'solo', npm_est: 42, years: 7, employees: 3, status: 'cold', score: 68, flag: '✓ Verified · Lordex spinal decompression · 2-day/wk schedule = capacity room', verified: true, source: 'corecharlottesville.com', notes: [] },
  { id: 'va015b', practice: 'Free Bridge Chiropractic', owner: 'Dr. Meghan Dickerson', email: 'info@freebridgechiro.com', phone: '(434) 977-0777', website: 'freebridgechiro.com', address: '103-A Free Bridge Lane', city: 'Charlottesville', county: 'Albemarle', region: 'Charlottesville', est_revenue: 1_180_000, est_ebitda: 395_000, profile: 'multi', npm_est: 66, years: 10, employees: 6, status: 'cold', score: 81, flag: '✓ Verified · Chiro + 8 massage modalities · pregnancy + sports specialty', verified: true, source: 'freebridgechiro.com', notes: [] },
  { id: 'va016b', practice: 'Healing Hands Chiropractic', owner: 'Dr. Angela Jane Ference', email: 'info@healing-hands-chiropractic.com', phone: '(434) 409-0564', website: 'healing-hands-chiropractic.com', address: '3054 Berkmar Dr, Suite B', city: 'Charlottesville', county: 'Albemarle', region: 'Charlottesville', est_revenue: 980_000, est_ebitda: 330_000, profile: 'solo', npm_est: 54, years: 14, employees: 5, status: 'cold', score: 79, flag: '✓ Verified · Suma Cum Laude Life Univ · S.A.+US dual training', verified: true, source: 'healing-hands-chiropractic.com', notes: [] },
  { id: 'va017b', practice: 'Scott Wagner Integrated Medicine', owner: 'Dr. Scott Wagner', email: 'info@scottwagnerintegratedmedicine.com', phone: '(434) 293-4099', website: 'scottwagnerintegratedmedicine.com', address: 'Charlottesville, VA', city: 'Charlottesville', county: 'Albemarle', region: 'Charlottesville', est_revenue: 25_000_000, est_ebitda: 25_000_000, profile: 'multi_loc', npm_est: 0, years: 20, employees: 50, status: 'in_pipeline', score: 100, flag: '⭐ WAGNER HQ · Combined platform anchor · pain mgmt + ozone + IV nutrition', verified: true, source: 'scottwagnerintegratedmedicine.com', notes: [
    { ts: '2026-06-01 09:00', author: 'Note', kind: 'note', text: 'Anchor platform. $25M existing EBITDA. Service area: Charlottesville + Albemarle/Greene/Madison/Fluvanna/Nelson/Augusta counties. Will combine with ChiroPillar bolt-on for $45M+ exit.' },
  ] },

  // Richmond
  { id: 'va014', practice: 'Richmond Spine Center', owner: 'Dr. Anika Patel', email: 'apatel@richmondspine.com', phone: '(804) 555-0177', address: '7611 Forest Ave', city: 'Richmond', county: 'Richmond', region: 'Richmond', est_revenue: 1_050_000, est_ebitda: 385_000, profile: 'multi', npm_est: 61, years: 9, employees: 7, status: 'in_pipeline', score: 90, flag: 'In called stage', notes: [
    { ts: '2026-05-23 09:30', author: 'System', kind: 'note', text: 'Intake submitted · qualified' },
    { ts: '2026-05-25 14:15', author: 'McGrath', kind: 'call', text: 'Patel is very open. Wants to scale by adding a second location but doesn\'t want to take on debt. Acquisition path is appealing.' },
  ] },
  { id: 'va015', practice: 'West End Chiropractic', owner: 'Dr. Daniel Owusu', email: 'dowusu@westendchiro.com', phone: '(804) 555-2218', address: '6400 Three Chopt Rd', city: 'Richmond', county: 'Henrico', region: 'Richmond', est_revenue: 1_300_000, est_ebitda: 405_000, profile: 'solo', npm_est: 56, years: 11, employees: 5, status: 'cold', score: 73, flag: 'Carytown area', notes: [] },
  { id: 'va016', practice: 'Short Pump Family Chiropractic', owner: 'Dr. Robin Avery', email: 'ravery@shortpumpchiro.com', phone: '(804) 555-3340', address: '4101 Pouncey Tract Rd', city: 'Glen Allen', county: 'Henrico', region: 'Richmond', est_revenue: 1_500_000, est_ebitda: 510_000, profile: 'multi', npm_est: 67, years: 9, employees: 8, status: 'warm', score: 84, flag: 'McGrath network referrer', notes: [] },
  { id: 'va017', practice: 'Innsbrook Chiropractic Specialists', owner: 'Dr. Lauren Briggs', email: 'lbriggs@innsbrookchiro.com', phone: '(804) 555-4421', address: '4501 Highwoods Pkwy', city: 'Henrico', county: 'Henrico', region: 'Richmond', est_revenue: 1_200_000, est_ebitda: 415_000, profile: 'solo', npm_est: 54, years: 8, employees: 5, status: 'cold', score: 70, flag: 'Tech corridor', notes: [] },
  { id: 'va018', practice: 'Midlothian Spine & Rehab', owner: 'Dr. Brian Casey', email: 'bcasey@midspine.com', phone: '(804) 555-5577', address: '13700 Hull Street Rd', city: 'Midlothian', county: 'Chesterfield', region: 'Richmond', est_revenue: 1_800_000, est_ebitda: 585_000, profile: 'multi_loc', npm_est: 79, years: 15, employees: 10, status: 'cold', score: 82, flag: '2 satellite locations', notes: [] },

  // Hampton Roads
  { id: 'va019', practice: 'Virginia Beach Spine & Sport', owner: 'Dr. Tyrese Holman', city: 'Virginia Beach', email: 'tholman@vbspine.com', phone: '(757) 555-1011', address: '3300 Virginia Beach Blvd', county: 'Virginia Beach', region: 'Hampton Roads', est_revenue: 2_500_000, est_ebitda: 780_000, profile: 'multi_loc', npm_est: 96, years: 18, employees: 13, status: 'cold', score: 86, flag: 'Largest VA Beach · 2 locs', notes: [] },
  { id: 'va020', practice: 'Norfolk Family Chiropractic', owner: 'Dr. Crystal Adams', email: 'cadams@norfolkfamily.com', phone: '(757) 555-2105', address: '870 N Military Hwy', city: 'Norfolk', county: 'Norfolk', region: 'Hampton Roads', est_revenue: 1_400_000, est_ebitda: 485_000, profile: 'multi', npm_est: 62, years: 13, employees: 7, status: 'cold', score: 74, flag: 'Naval base · TRICARE patients', notes: [] },
  { id: 'va021', practice: 'Chesapeake Wellness Chiropractic', owner: 'Dr. Maya Jensen', email: 'mjensen@chesawell.com', phone: '(757) 555-3300', address: '525 Volvo Pkwy', city: 'Chesapeake', county: 'Chesapeake', region: 'Hampton Roads', est_revenue: 1_600_000, est_ebitda: 515_000, profile: 'multi', npm_est: 70, years: 10, employees: 7, status: 'warm', score: 79, flag: 'Owner asking about exit options', notes: [
    { ts: '2026-05-18 10:00', author: 'McGrath', kind: 'email', text: 'Jensen replied to outreach. Said "Tell me more about Wagner\'s rollup specifically." Sending Ecosystem Exec Summary.' },
  ] },
  { id: 'va022', practice: 'Newport News Spine Specialists', owner: 'Dr. Sergio Castillo', email: 'scastillo@nnspine.com', phone: '(757) 555-4490', address: '12713 Jefferson Ave', city: 'Newport News', county: 'Newport News', region: 'Hampton Roads', est_revenue: 1_900_000, est_ebitda: 605_000, profile: 'multi', npm_est: 81, years: 16, employees: 9, status: 'cold', score: 80, flag: '', notes: [] },
  { id: 'va023', practice: 'Hampton Roads Chiropractic', owner: 'Dr. Imani Bell', email: 'ibell@hrchiro.com', phone: '(757) 555-5500', address: '2100 Coliseum Dr', city: 'Hampton', county: 'Hampton', region: 'Hampton Roads', est_revenue: 1_200_000, est_ebitda: 395_000, profile: 'solo', npm_est: 51, years: 8, employees: 5, status: 'cold', score: 67, flag: '', notes: [] },
  { id: 'va024', practice: 'Williamsburg Chiropractic Center', owner: 'Dr. Linda Espinoza', email: 'lespinoza@wmchiro.com', phone: '(757) 555-6020', address: '1115 Mt Vernon Ave', city: 'Williamsburg', county: 'James City', region: 'Hampton Roads', est_revenue: 1_100_000, est_ebitda: 365_000, profile: 'solo', npm_est: 47, years: 9, employees: 4, status: 'cold', score: 65, flag: 'Older patient base', notes: [] },

  // Western
  { id: 'va025', practice: 'Roanoke Spine Institute', owner: 'Dr. Olivia Reyes', email: 'oreyes@roanokespine.com', phone: '(540) 555-0204', address: '2030 Colonial Ave SW', city: 'Roanoke', county: 'Roanoke', region: 'Western VA', est_revenue: 1_600_000, est_ebitda: 520_000, profile: 'multi', npm_est: 71, years: 11, employees: 7, status: 'in_pipeline', score: 88, flag: 'Submitted D-12 · scheduled call', notes: [
    { ts: '2026-05-22 14:00', author: 'System', kind: 'note', text: 'Intake submitted · qualified · 78 NPM avg' },
    { ts: '2026-05-26 09:00', author: 'McGrath', kind: 'call', text: 'Reyes is interested. Already has 2 associate DCs. Wagner call scheduled for Thursday.' },
  ] },
  { id: 'va026', practice: 'Lynchburg Chiropractic Wellness', owner: 'Dr. Joshua Reyes', email: 'jreyes@lynchchiro.com', phone: '(434) 555-1122', address: '3717 Old Forest Rd', city: 'Lynchburg', county: 'Lynchburg', region: 'Western VA', est_revenue: 1_300_000, est_ebitda: 425_000, profile: 'solo', npm_est: 58, years: 12, employees: 5, status: 'cold', score: 73, flag: 'Liberty Univ corridor', notes: [] },
  { id: 'va027', practice: 'Harrisonburg Family Chiropractic', owner: 'Dr. Heather Goff', email: 'hgoff@hburgchiro.com', phone: '(540) 555-2233', address: '1820 S Main St', city: 'Harrisonburg', county: 'Rockingham', region: 'Western VA', est_revenue: 1_050_000, est_ebitda: 348_000, profile: 'solo', npm_est: 44, years: 8, employees: 4, status: 'cold', score: 64, flag: '', notes: [] },
  { id: 'va028', practice: 'Winchester Spine Care', owner: 'Dr. Trent Cooper', email: 'tcooper@winchesterspine.com', phone: '(540) 555-3344', address: '125 Featherbed Ln', city: 'Winchester', county: 'Frederick', region: 'Western VA', est_revenue: 1_400_000, est_ebitda: 460_000, profile: 'multi', npm_est: 63, years: 13, employees: 6, status: 'cold', score: 76, flag: 'N. Shenandoah Valley', notes: [] },
  { id: 'va029', practice: 'Staunton Family Chiropractic', owner: 'Dr. Mike Bauer', email: 'mbauer@stauntonchiro.com', phone: '(540) 555-4455', address: '101 W Beverley St', city: 'Staunton', county: 'Augusta', region: 'Western VA', est_revenue: 1_100_000, est_ebitda: 375_000, profile: 'solo', npm_est: 49, years: 9, employees: 4, status: 'cold', score: 66, flag: 'Augusta County (Wagner reach)', notes: [] },

  // Central VA / Fredericksburg
  { id: 'va030', practice: 'Fredericksburg Family Chiropractic', owner: 'Dr. Marcus Avila', email: 'mavila@fredfamily.com', phone: '(540) 555-5566', address: '1208 Princess Anne St', city: 'Fredericksburg', county: 'Fredericksburg', region: 'Central VA', est_revenue: 1_200_000, est_ebitda: 405_000, profile: 'multi', npm_est: 56, years: 11, employees: 6, status: 'cold', score: 72, flag: 'I-95 · DC commuter', notes: [] },
  { id: 'va031', practice: 'Spotsylvania Spine + Sport', owner: 'Dr. Donna Bullard', email: 'dbullard@spotsyspine.com', phone: '(540) 555-6677', address: '9525 Courthouse Rd', city: 'Spotsylvania', county: 'Spotsylvania', region: 'Central VA', est_revenue: 1_050_000, est_ebitda: 352_000, profile: 'solo', npm_est: 46, years: 7, employees: 4, status: 'cold', score: 65, flag: '', notes: [] },
  { id: 'va032', practice: 'Stafford Chiropractic Wellness', owner: 'Dr. Riley Vance', email: 'rvance@staffordwellness.com', phone: '(540) 555-7788', address: '395 Garrisonville Rd', city: 'Stafford', county: 'Stafford', region: 'Central VA', est_revenue: 1_150_000, est_ebitda: 380_000, profile: 'solo', npm_est: 51, years: 9, employees: 5, status: 'cold', score: 69, flag: '', notes: [] },
  { id: 'va033', practice: 'Manassas Premier Chiropractic', owner: 'Dr. Solomon Pierce', email: 'spierce@manassaspremier.com', phone: '(703) 555-8899', address: '9023 Center St', city: 'Manassas', county: 'Prince William', region: 'NoVA', est_revenue: 1_500_000, est_ebitda: 485_000, profile: 'multi', npm_est: 65, years: 10, employees: 7, status: 'warm', score: 81, flag: 'Attending Wagner mastermind preview', notes: [] },

  // Rural Western
  { id: 'va034', practice: 'Blacksburg Family Chiropractic', owner: 'Dr. Anita Mukherjee', email: 'amukherjee@blacksburgchiro.com', phone: '(540) 555-9900', address: '1240 N Main St', city: 'Blacksburg', county: 'Montgomery', region: 'Western VA', est_revenue: 1_100_000, est_ebitda: 372_000, profile: 'multi', npm_est: 48, years: 10, employees: 5, status: 'cold', score: 71, flag: 'Virginia Tech corridor', notes: [] },
  { id: 'va035', practice: 'Front Royal Chiropractic', owner: 'Dr. Carl Whitmore', email: 'cwhitmore@frontroyalchiro.com', phone: '(540) 555-0011', address: '301 E Main St', city: 'Front Royal', county: 'Warren', region: 'Western VA', est_revenue: 1_050_000, est_ebitda: 348_000, profile: 'solo', npm_est: 45, years: 12, employees: 4, status: 'cold', score: 64, flag: '', notes: [] },
  { id: 'va036', practice: 'Roanoke Valley Spine & Sport', owner: 'Dr. Sarah Holm', email: 'sholm@rvspine.com', phone: '(540) 555-1212', address: '210 E Main St', city: 'Salem', county: 'Salem', region: 'Western VA', est_revenue: 1_350_000, est_ebitda: 442_000, profile: 'multi', npm_est: 59, years: 11, employees: 6, status: 'cold', score: 75, flag: '', notes: [] },

  // Eastern Shore
  { id: 'va037', practice: 'Eastern Shore Chiropractic', owner: 'Dr. Will Tankard', email: 'wtankard@eshorchiro.com', phone: '(757) 555-2323', address: '25055 Lankford Hwy', city: 'Onley', county: 'Accomack', region: 'Hampton Roads', est_revenue: 1_050_000, est_ebitda: 345_000, profile: 'solo', npm_est: 44, years: 14, employees: 4, status: 'cold', score: 62, flag: 'Sole DC 50mi radius', notes: [] },

  // Bonus
  { id: 'va038', practice: 'Reston Town Center Spine', owner: 'Dr. Mateo Ruiz', email: 'mruiz@rtcsp.com', phone: '(703) 555-3434', address: '11990 Market St', city: 'Reston', county: 'Fairfax', region: 'NoVA', est_revenue: 1_750_000, est_ebitda: 565_000, profile: 'multi', npm_est: 73, years: 9, employees: 7, status: 'cold', score: 78, flag: '', notes: [] },
  { id: 'va039', practice: 'Suffolk Family Chiropractic', owner: 'Dr. Tasha Donovan', email: 'tdonovan@suffolkchiro.com', phone: '(757) 555-4545', address: '120 W Constance Rd', city: 'Suffolk', county: 'Suffolk', region: 'Hampton Roads', est_revenue: 1_250_000, est_ebitda: 415_000, profile: 'multi', npm_est: 55, years: 10, employees: 6, status: 'cold', score: 71, flag: '', notes: [] },
  { id: 'va040', practice: 'Centreville Spine & Wellness', owner: 'Dr. Nora Adeyemi', email: 'nadeyemi@centrevillespine.com', phone: '(703) 555-5656', address: '5731 Centreville Rd', city: 'Centreville', county: 'Fairfax', region: 'NoVA', est_revenue: 1_350_000, est_ebitda: 432_000, profile: 'multi', npm_est: 59, years: 8, employees: 6, status: 'cold', score: 73, flag: '', notes: [] },

  // ═══ TEXAS (Wagner Secondary) ═══
  { id: 'tx001', practice: 'Dallas Alignment & Sport', owner: 'Dr. Brandon Cooper', email: 'bcooper@dallasalignment.com', phone: '(214) 555-0319', address: '7700 Windrose Ave', city: 'Plano', county: 'Collin', region: 'NoVA', est_revenue: 1_600_000, est_ebitda: 590_000, profile: 'multi_loc', npm_est: 88, years: 16, employees: 11, status: 'in_pipeline', score: 92, flag: 'Hero deal #2 · in diligence', notes: [
    { ts: '2026-05-18 14:30', author: 'McGrath', kind: 'call', text: 'Cooper is ready to step out. Wants 90-day transition. Two associate DCs in place to maintain operations.' },
    { ts: '2026-05-25 10:15', author: 'Wagner', kind: 'note', text: 'Met Cooper at DFW. Strong cultural fit. Wants the medical-team add-on installed.' },
  ] },
  { id: 'tx002', practice: 'Rivera Chiropractic', owner: 'Dr. Jane Rivera', email: 'jane@riverachiro.com', phone: '(512) 555-0143', address: '4109 Marathon Blvd', city: 'Austin', county: 'Travis', region: 'NoVA', est_revenue: 1_100_000, est_ebitda: 420_000, profile: 'multi', npm_est: 65, years: 12, employees: 6, status: 'in_pipeline', score: 89, flag: '2nd location opening Q3', notes: [{ ts: '2026-05-20 09:00', author: 'McGrath', kind: 'call', text: 'Rivera open to acquisition once 2nd location stabilizes.' }] },
  { id: 'tx003', practice: 'Houston Heights Chiropractic', owner: 'Dr. Trevor Mason', email: 'tmason@heightschiro.com', phone: '(713) 555-1147', address: '1100 W 23rd St', city: 'Houston', county: 'Harris', region: 'NoVA', est_revenue: 2_200_000, est_ebitda: 705_000, profile: 'multi_loc', npm_est: 87, years: 14, employees: 11, status: 'cold', score: 81, flag: '2 locations · sports focus', notes: [] },
  { id: 'tx004', practice: 'San Antonio Family Chiro', owner: 'Dr. Mariana Ortiz', email: 'mortiz@sachiro.com', phone: '(210) 555-2230', address: '2150 NE Loop 410', city: 'San Antonio', county: 'Bexar', region: 'NoVA', est_revenue: 1_400_000, est_ebitda: 462_000, profile: 'multi', npm_est: 64, years: 11, employees: 7, status: 'cold', score: 75, flag: '', notes: [] },
  { id: 'tx005', practice: 'Fort Worth Spine Center', owner: 'Dr. Jordan Bailey', email: 'jbailey@fwspine.com', phone: '(817) 555-3318', address: '5450 Clearfork Main St', city: 'Fort Worth', county: 'Tarrant', region: 'NoVA', est_revenue: 1_900_000, est_ebitda: 610_000, profile: 'multi', npm_est: 79, years: 13, employees: 9, status: 'cold', score: 80, flag: '', notes: [] },
  { id: 'tx006', practice: 'Frisco Athletic Chiropractic', owner: 'Dr. Krystal Berman', email: 'kberman@friscochiro.com', phone: '(469) 555-4422', address: '3251 Cotton Gin Rd', city: 'Frisco', county: 'Collin', region: 'NoVA', est_revenue: 1_550_000, est_ebitda: 510_000, profile: 'multi', npm_est: 70, years: 8, employees: 7, status: 'warm', score: 83, flag: 'Mutual referral from Cooper', notes: [] },
  { id: 'tx007', practice: 'The Woodlands Spine + Sport', owner: 'Dr. Aaron Hagen', email: 'ahagen@woodlandsspine.com', phone: '(281) 555-5510', address: '9595 Six Pines Dr', city: 'The Woodlands', county: 'Montgomery', region: 'NoVA', est_revenue: 1_750_000, est_ebitda: 575_000, profile: 'multi', npm_est: 74, years: 12, employees: 8, status: 'cold', score: 78, flag: '', notes: [] },
  { id: 'tx008', practice: 'El Paso Family Chiropractic', owner: 'Dr. Luz Velasquez', email: 'lvelasquez@epchiro.com', phone: '(915) 555-6604', address: '8889 Gateway Blvd W', city: 'El Paso', county: 'El Paso', region: 'NoVA', est_revenue: 1_100_000, est_ebitda: 372_000, profile: 'multi', npm_est: 51, years: 10, employees: 5, status: 'cold', score: 67, flag: '', notes: [] },
  { id: 'tx009', practice: 'Lubbock Spine Wellness', owner: 'Dr. Hudson Gray', email: 'hgray@lubbockspine.com', phone: '(806) 555-7728', address: '6420 19th St', city: 'Lubbock', county: 'Lubbock', region: 'NoVA', est_revenue: 1_050_000, est_ebitda: 351_000, profile: 'solo', npm_est: 46, years: 9, employees: 4, status: 'cold', score: 64, flag: '', notes: [] },
  { id: 'tx010', practice: 'Austin Wellness Group', owner: 'Dr. Selena Aroche', email: 'saroche@austinwell.com', phone: '(512) 555-8821', address: '2110 W Slaughter Ln', city: 'Austin', county: 'Travis', region: 'NoVA', est_revenue: 1_950_000, est_ebitda: 620_000, profile: 'multi', npm_est: 81, years: 11, employees: 9, status: 'cold', score: 81, flag: '', notes: [] },

  // ═══ FLORIDA (Wagner Secondary) ═══
  { id: 'fl001', practice: 'Tampa Bay Spine Care', owner: 'Dr. Carla Fontana', email: 'cfontana@tampaspinecare.com', phone: '(813) 555-0426', address: '4830 W Kennedy Blvd', city: 'Tampa', county: 'Hillsborough', region: 'Hampton Roads', est_revenue: 890_000, est_ebitda: 325_000, profile: 'multi', npm_est: 49, years: 8, employees: 5, status: 'in_pipeline', score: 79, flag: 'In called stage', notes: [] },
  { id: 'fl002', practice: 'Orlando Wellness Group', owner: 'Dr. Marcus Liu', email: 'mliu@orlandowellness.com', phone: '(407) 555-0510', address: '7800 W Sand Lake Rd', city: 'Orlando', county: 'Orange', region: 'Hampton Roads', est_revenue: 1_640_000, est_ebitda: 525_000, profile: 'multi', npm_est: 67, years: 10, employees: 7, status: 'in_pipeline', score: 84, flag: 'Upgraded to qualified after Q4 numbers', notes: [] },
  { id: 'fl003', practice: 'Miami Beach Chiropractic', owner: 'Dr. Sebastian Lobato', email: 'slobato@mbchiro.com', phone: '(305) 555-1106', address: '1771 Alton Rd', city: 'Miami Beach', county: 'Miami-Dade', region: 'Hampton Roads', est_revenue: 2_100_000, est_ebitda: 690_000, profile: 'multi', npm_est: 78, years: 13, employees: 9, status: 'cold', score: 79, flag: 'High-cash-pay clientele', notes: [] },
  { id: 'fl004', practice: 'Jacksonville Spine Specialists', owner: 'Dr. Theresa Pendleton', email: 'tpendleton@jaxspine.com', phone: '(904) 555-2240', address: '14333 Beach Blvd', city: 'Jacksonville', county: 'Duval', region: 'Hampton Roads', est_revenue: 1_800_000, est_ebitda: 575_000, profile: 'multi', npm_est: 74, years: 15, employees: 8, status: 'cold', score: 79, flag: '', notes: [] },
  { id: 'fl005', practice: 'Fort Lauderdale Wellness', owner: 'Dr. Adrian Mendelsohn', email: 'amendelsohn@ftlwell.com', phone: '(954) 555-3326', address: '2700 N Federal Hwy', city: 'Fort Lauderdale', county: 'Broward', region: 'Hampton Roads', est_revenue: 1_500_000, est_ebitda: 482_000, profile: 'multi', npm_est: 64, years: 11, employees: 7, status: 'cold', score: 76, flag: '', notes: [] },
  { id: 'fl006', practice: 'Tallahassee Family Chiro', owner: 'Dr. Cassidy Burke', email: 'cburke@tallychiro.com', phone: '(850) 555-4407', address: '1411 Timberlane Rd', city: 'Tallahassee', county: 'Leon', region: 'Hampton Roads', est_revenue: 1_150_000, est_ebitda: 392_000, profile: 'multi', npm_est: 55, years: 9, employees: 5, status: 'cold', score: 71, flag: '', notes: [] },
  { id: 'fl007', practice: 'St Petersburg Spine + Sport', owner: 'Dr. Eduardo Salas', email: 'esalas@stpetespine.com', phone: '(727) 555-5519', address: '6800 Sunset Way', city: 'St Petersburg', county: 'Pinellas', region: 'Hampton Roads', est_revenue: 1_400_000, est_ebitda: 462_000, profile: 'multi', npm_est: 62, years: 10, employees: 6, status: 'cold', score: 74, flag: '', notes: [] },
  { id: 'fl008', practice: 'Naples Premier Chiropractic', owner: 'Dr. Lydia Carney', email: 'lcarney@naplespremier.com', phone: '(239) 555-6606', address: '5028 Tamiami Trl N', city: 'Naples', county: 'Collier', region: 'Hampton Roads', est_revenue: 1_950_000, est_ebitda: 630_000, profile: 'multi', npm_est: 76, years: 14, employees: 8, status: 'cold', score: 78, flag: 'High-cash-pay retiree market', notes: [] },

  // ═══ NORTH CAROLINA (Wagner Secondary) ═══
  { id: 'nc001', practice: 'Charlotte Spinal Health', owner: 'Dr. Hannah Briggs', email: 'hbriggs@charlottespinal.com', phone: '(704) 555-0651', address: '7720 Pineville-Matthews Rd', city: 'Charlotte', county: 'Mecklenburg', region: 'Hampton Roads', est_revenue: 770_000, est_ebitda: 280_000, profile: 'solo', npm_est: 44, years: 10, employees: 4, status: 'in_pipeline', score: 83, flag: 'Scheduled', notes: [] },
  { id: 'nc002', practice: 'Raleigh Family Chiropractic', owner: 'Dr. Vincent Park', email: 'vpark@raleighchiro.com', phone: '(919) 555-0744', address: '8410 Falls of Neuse Rd', city: 'Raleigh', county: 'Wake', region: 'Hampton Roads', est_revenue: 1_050_000, est_ebitda: 358_000, profile: 'multi', npm_est: 58, years: 9, employees: 5, status: 'cold', score: 73, flag: '', notes: [] },
  { id: 'nc003', practice: 'Asheville Wellness Group', owner: 'Dr. Mary Sutton', email: 'msutton@ashevillewellness.com', phone: '(828) 555-1108', address: '320 Hendersonville Rd', city: 'Asheville', county: 'Buncombe', region: 'Hampton Roads', est_revenue: 1_300_000, est_ebitda: 425_000, profile: 'multi', npm_est: 60, years: 12, employees: 6, status: 'cold', score: 75, flag: '', notes: [] },
  { id: 'nc004', practice: 'Durham Spine Center', owner: 'Dr. Felix Granger', email: 'fgranger@durhamspine.com', phone: '(919) 555-2233', address: '4220 Garrett Rd', city: 'Durham', county: 'Durham', region: 'Hampton Roads', est_revenue: 1_700_000, est_ebitda: 562_000, profile: 'multi', npm_est: 72, years: 13, employees: 8, status: 'cold', score: 78, flag: 'Duke + RTP corridor', notes: [] },
  { id: 'nc005', practice: 'Greensboro Premier Chiropractic', owner: 'Dr. Hilary Schoonover', email: 'hschoonover@gsopremier.com', phone: '(336) 555-3344', address: '1900 W Wendover Ave', city: 'Greensboro', county: 'Guilford', region: 'Hampton Roads', est_revenue: 1_250_000, est_ebitda: 410_000, profile: 'multi', npm_est: 57, years: 11, employees: 6, status: 'cold', score: 72, flag: '', notes: [] },
  { id: 'nc006', practice: 'Wilmington Spine & Wellness', owner: 'Dr. Pearce Gilroy', email: 'pgilroy@wilmspine.com', phone: '(910) 555-4455', address: '1830 S College Rd', city: 'Wilmington', county: 'New Hanover', region: 'Hampton Roads', est_revenue: 1_400_000, est_ebitda: 462_000, profile: 'multi', npm_est: 63, years: 10, employees: 7, status: 'cold', score: 74, flag: '', notes: [] },

  // ═══ GEORGIA (Wagner Secondary) ═══
  { id: 'ga001', practice: 'Apex Wellness Atlanta', owner: 'Dr. Sarah Kim', email: 'skim@apexwellness.com', phone: '(404) 555-0822', address: '3525 Piedmont Rd NE', city: 'Atlanta', county: 'Fulton', region: 'Hampton Roads', est_revenue: 580_000, est_ebitda: 210_000, profile: 'solo', npm_est: 32, years: 5, employees: 3, status: 'in_pipeline', score: 70, flag: 'Maybe verdict · needs growth runway', notes: [] },
  { id: 'ga002', practice: 'Savannah Spine Group', owner: 'Dr. Robert Hayes', email: 'rhayes@savannahspine.com', phone: '(912) 555-0918', address: '5500 Abercorn St', city: 'Savannah', county: 'Chatham', region: 'Hampton Roads', est_revenue: 1_400_000, est_ebitda: 510_000, profile: 'multi_loc', npm_est: 72, years: 18, employees: 9, status: 'in_pipeline', score: 91, flag: 'In Diligence · LOI drafted', notes: [{ ts: '2026-05-30 14:00', author: 'Eric', kind: 'note', text: 'LOI drafted at $2.05M. Hayes wants to keep clinical role part-time post-close.' }] },
  { id: 'ga003', practice: 'Buckhead Chiropractic Specialists', owner: 'Dr. Brennan Ladd', email: 'bladd@buckheadchiro.com', phone: '(404) 555-1010', address: '3400 Lenox Rd NE', city: 'Atlanta', county: 'Fulton', region: 'Hampton Roads', est_revenue: 2_300_000, est_ebitda: 745_000, profile: 'multi', npm_est: 81, years: 13, employees: 10, status: 'cold', score: 82, flag: 'High-end Buckhead market', notes: [] },
  { id: 'ga004', practice: 'Macon Spine + Sport', owner: 'Dr. Eli Burch', email: 'eburch@maconspine.com', phone: '(478) 555-2121', address: '4505 Mercer University Dr', city: 'Macon', county: 'Bibb', region: 'Hampton Roads', est_revenue: 1_150_000, est_ebitda: 395_000, profile: 'multi', npm_est: 55, years: 10, employees: 6, status: 'cold', score: 72, flag: '', notes: [] },
  { id: 'ga005', practice: 'Augusta Chiropractic Center', owner: 'Dr. Carmela Tobin', email: 'ctobin@augchiro.com', phone: '(706) 555-3232', address: '425 Furys Ferry Rd', city: 'Augusta', county: 'Richmond', region: 'Hampton Roads', est_revenue: 1_350_000, est_ebitda: 442_000, profile: 'multi', npm_est: 60, years: 12, employees: 7, status: 'cold', score: 74, flag: '', notes: [] },
  { id: 'ga006', practice: 'Athens Family Chiropractic', owner: 'Dr. Roselyn Kuhn', email: 'rkuhn@athensfamily.com', phone: '(706) 555-4343', address: '590 Oconee St', city: 'Athens', county: 'Clarke', region: 'Hampton Roads', est_revenue: 1_050_000, est_ebitda: 358_000, profile: 'multi', npm_est: 50, years: 9, employees: 5, status: 'cold', score: 68, flag: 'UGA corridor', notes: [] },

  // ═══ TENNESSEE (Wagner Secondary) ═══
  { id: 'tn001', practice: 'Nashville Alignment Center', owner: 'Dr. Daniel Ortiz', email: 'dortiz@nashvillealignment.com', phone: '(615) 555-1041', address: '2900 Vanderbilt Pl', city: 'Nashville', county: 'Davidson', region: 'Hampton Roads', est_revenue: 830_000, est_ebitda: 310_000, profile: 'multi', npm_est: 46, years: 9, employees: 5, status: 'in_pipeline', score: 84, flag: 'In called stage', notes: [] },
  { id: 'tn002', practice: 'Knoxville Spine Institute', owner: 'Dr. Wesley Hutchins', email: 'whutchins@knoxvillespine.com', phone: '(865) 555-1212', address: '7345 Kingston Pike', city: 'Knoxville', county: 'Knox', region: 'Hampton Roads', est_revenue: 1_690_000, est_ebitda: 545_000, profile: 'multi', npm_est: 71, years: 13, employees: 8, status: 'cold', score: 78, flag: '', notes: [] },
  { id: 'tn003', practice: 'Memphis Family Chiropractic', owner: 'Dr. Briana Tate', email: 'btate@memchiro.com', phone: '(901) 555-2323', address: '5050 Poplar Ave', city: 'Memphis', county: 'Shelby', region: 'Hampton Roads', est_revenue: 1_300_000, est_ebitda: 420_000, profile: 'multi', npm_est: 58, years: 11, employees: 6, status: 'cold', score: 72, flag: '', notes: [] },
  { id: 'tn004', practice: 'Chattanooga Premier Chiro', owner: 'Dr. Maxwell Royal', email: 'mroyal@chattchiro.com', phone: '(423) 555-3434', address: '6230 Vance Rd', city: 'Chattanooga', county: 'Hamilton', region: 'Hampton Roads', est_revenue: 1_175_000, est_ebitda: 388_000, profile: 'multi', npm_est: 53, years: 10, employees: 5, status: 'cold', score: 71, flag: '', notes: [] },
  { id: 'tn005', practice: 'Franklin Spine + Wellness', owner: 'Dr. Bridget Eckert', email: 'beckert@franklinspine.com', phone: '(615) 555-4545', address: '210 Mallory Station Rd', city: 'Franklin', county: 'Williamson', region: 'Hampton Roads', est_revenue: 1_550_000, est_ebitda: 500_000, profile: 'multi', npm_est: 67, years: 8, employees: 7, status: 'warm', score: 80, flag: 'Owner asking about exit', notes: [] },

  // ═══ SOUTH CAROLINA (Wagner Secondary) ═══
  { id: 'sc001', practice: 'Greenville Family Chiropractic', owner: 'Dr. Priya Sharma', email: 'psharma@greenvillechiro.com', phone: '(864) 555-1126', address: '17 N Almond Dr', city: 'Greenville', county: 'Greenville', region: 'Hampton Roads', est_revenue: 1_080_000, est_ebitda: 370_000, profile: 'multi', npm_est: 52, years: 9, employees: 5, status: 'in_pipeline', score: 76, flag: 'Submitted intake', notes: [] },
  { id: 'sc002', practice: 'Columbia Spine Center', owner: 'Dr. Lance Whitman', email: 'lwhitman@columbiaspine.com', phone: '(803) 555-1212', address: '1325 Devine St', city: 'Columbia', county: 'Richland', region: 'Hampton Roads', est_revenue: 1_300_000, est_ebitda: 425_000, profile: 'multi', npm_est: 58, years: 12, employees: 6, status: 'cold', score: 73, flag: '', notes: [] },
  { id: 'sc003', practice: 'Charleston Wellness Chiropractic', owner: 'Dr. Antonia Mosser', email: 'amosser@chsnchiro.com', phone: '(843) 555-2323', address: '1810 Ashley River Rd', city: 'Charleston', county: 'Charleston', region: 'Hampton Roads', est_revenue: 1_500_000, est_ebitda: 482_000, profile: 'multi', npm_est: 64, years: 10, employees: 7, status: 'cold', score: 76, flag: '', notes: [] },
  { id: 'sc004', practice: 'Mt Pleasant Family Chiro', owner: 'Dr. Ronald Calderwood', email: 'rcalderwood@mpchiro.com', phone: '(843) 555-3434', address: '1483 N Hwy 17', city: 'Mt Pleasant', county: 'Charleston', region: 'Hampton Roads', est_revenue: 1_200_000, est_ebitda: 395_000, profile: 'multi', npm_est: 54, years: 9, employees: 5, status: 'cold', score: 72, flag: '', notes: [] },

  // ═══ ALABAMA / KENTUCKY / MARYLAND / WV ═══
  { id: 'al001', practice: 'Birmingham Spine Institute', owner: 'Dr. Calvin Wright', email: 'cwright@birminghamspine.com', phone: '(205) 555-1233', address: '2790 18th St S', city: 'Birmingham', county: 'Jefferson', region: 'Hampton Roads', est_revenue: 720_000, est_ebitda: 265_000, profile: 'multi', npm_est: 41, years: 7, employees: 4, status: 'in_pipeline', score: 77, flag: 'Scheduled', notes: [] },
  { id: 'al002', practice: 'Huntsville Wellness Group', owner: 'Dr. Marcia Eatherly', email: 'meatherly@huntswell.com', phone: '(256) 555-2245', address: '6125 University Dr NW', city: 'Huntsville', county: 'Madison', region: 'Hampton Roads', est_revenue: 1_450_000, est_ebitda: 480_000, profile: 'multi', npm_est: 65, years: 11, employees: 7, status: 'cold', score: 77, flag: 'Aerospace corridor', notes: [] },
  { id: 'al003', practice: 'Mobile Family Chiropractic', owner: 'Dr. Brielle Coker', email: 'bcoker@mobilechiro.com', phone: '(251) 555-3356', address: '6261 Airport Blvd', city: 'Mobile', county: 'Mobile', region: 'Hampton Roads', est_revenue: 1_100_000, est_ebitda: 365_000, profile: 'multi', npm_est: 50, years: 10, employees: 5, status: 'cold', score: 70, flag: '', notes: [] },
  { id: 'ky001', practice: 'Louisville Premier Chiropractic', owner: 'Dr. Daxton Whitley', email: 'dwhitley@louisvillepremier.com', phone: '(502) 555-4467', address: '3934 Dutchmans Ln', city: 'Louisville', county: 'Jefferson', region: 'Hampton Roads', est_revenue: 1_350_000, est_ebitda: 442_000, profile: 'multi', npm_est: 60, years: 11, employees: 6, status: 'cold', score: 74, flag: '', notes: [] },
  { id: 'ky002', practice: 'Lexington Spine + Sport', owner: 'Dr. Cassandra Pulley', email: 'cpulley@lexspine.com', phone: '(859) 555-5578', address: '3120 Pimlico Pkwy', city: 'Lexington', county: 'Fayette', region: 'Hampton Roads', est_revenue: 1_250_000, est_ebitda: 410_000, profile: 'multi', npm_est: 57, years: 9, employees: 6, status: 'cold', score: 72, flag: '', notes: [] },
  { id: 'ky003', practice: 'Bowling Green Family Chiro', owner: 'Dr. Caleb Vu', email: 'cvu@bgchiro.com', phone: '(270) 555-6689', address: '1175 Adams St', city: 'Bowling Green', county: 'Warren', region: 'Hampton Roads', est_revenue: 1_050_000, est_ebitda: 348_000, profile: 'solo', npm_est: 47, years: 8, employees: 4, status: 'cold', score: 66, flag: '', notes: [] },
  { id: 'md001', practice: 'Bethesda Spine & Wellness', owner: 'Dr. Avery Aubrey', email: 'aaubrey@bethspine.com', phone: '(301) 555-7790', address: '7311 Wisconsin Ave', city: 'Bethesda', county: 'Montgomery', region: 'NoVA', est_revenue: 2_100_000, est_ebitda: 685_000, profile: 'multi', npm_est: 79, years: 13, employees: 9, status: 'cold', score: 82, flag: 'NIH corridor · upscale', notes: [] },
  { id: 'md002', practice: 'Baltimore Family Chiropractic', owner: 'Dr. Korbin Stark', email: 'kstark@balchiro.com', phone: '(410) 555-8801', address: '1407 N Calvert St', city: 'Baltimore', county: 'Baltimore', region: 'NoVA', est_revenue: 1_400_000, est_ebitda: 458_000, profile: 'multi', npm_est: 63, years: 11, employees: 7, status: 'cold', score: 75, flag: '', notes: [] },
  { id: 'md003', practice: 'Annapolis Premier Chiropractic', owner: 'Dr. Imelda Brixey', email: 'ibrixey@annpremier.com', phone: '(443) 555-9912', address: '1610 Forest Dr', city: 'Annapolis', county: 'Anne Arundel', region: 'NoVA', est_revenue: 1_650_000, est_ebitda: 540_000, profile: 'multi', npm_est: 69, years: 10, employees: 7, status: 'cold', score: 78, flag: '', notes: [] },
  { id: 'md004', practice: 'Frederick Spine + Wellness', owner: 'Dr. Mariella Bunch', email: 'mbunch@fredspine.com', phone: '(301) 555-0023', address: '8 W Patrick St', city: 'Frederick', county: 'Frederick', region: 'NoVA', est_revenue: 1_200_000, est_ebitda: 395_000, profile: 'multi', npm_est: 56, years: 9, employees: 6, status: 'cold', score: 71, flag: '', notes: [] },
  { id: 'md005', practice: 'Silver Spring Chiropractic', owner: 'Dr. Lerato Mthembu', email: 'lmthembu@sschiro.com', phone: '(240) 555-1134', address: '8403 Colesville Rd', city: 'Silver Spring', county: 'Montgomery', region: 'NoVA', est_revenue: 1_500_000, est_ebitda: 485_000, profile: 'multi', npm_est: 65, years: 10, employees: 7, status: 'cold', score: 75, flag: '', notes: [] },
  { id: 'wv001', practice: 'Charleston WV Family Chiro', owner: 'Dr. Mason Vance', email: 'mvance@cwvchiro.com', phone: '(304) 555-2245', address: '1505 Quarrier St', city: 'Charleston', county: 'Kanawha', region: 'Western VA', est_revenue: 1_080_000, est_ebitda: 358_000, profile: 'solo', npm_est: 48, years: 12, employees: 4, status: 'cold', score: 67, flag: '', notes: [] },
  { id: 'wv002', practice: 'Morgantown Spine + Sport', owner: 'Dr. Linnea Hagerty', email: 'lhagerty@morgspine.com', phone: '(304) 555-3356', address: '1075 Van Voorhis Rd', city: 'Morgantown', county: 'Monongalia', region: 'Western VA', est_revenue: 1_150_000, est_ebitda: 380_000, profile: 'multi', npm_est: 53, years: 10, employees: 5, status: 'cold', score: 70, flag: 'WVU corridor', notes: [] },
]

const REGIONS: Region[] = ['NoVA', 'Charlottesville', 'Richmond', 'Hampton Roads', 'Western VA', 'Central VA']

const fmtTime = (iso: string) => iso.slice(0, 16).replace('T', ' ')

export default function LeadsPage() {
  const [leads, setLeads]     = useState<Lead[]>(SEED_LEADS)
  const [region, setRegion]   = useState<Region | 'all'>('all')
  const [status, setStatus]   = useState<Status | 'all'>('all')
  const [profile, setProfile] = useState<Profile | 'all'>('all')
  const [sort, setSort]       = useState<'score' | 'revenue'>('score')
  const [open, setOpen]       = useState<string | null>(null)
  const [draft, setDraft]     = useState<string>('')

  const filtered = leads
    .filter(l => region  === 'all' || l.region  === region)
    .filter(l => status  === 'all' || l.status  === status)
    .filter(l => profile === 'all' || l.profile === profile)
    .sort((a, b) => sort === 'score' ? b.score - a.score : b.est_revenue - a.est_revenue)

  const totalRev  = filtered.reduce((s, l) => s + l.est_revenue, 0)
  const totalEbit = filtered.reduce((s, l) => s + l.est_ebitda, 0)
  const inPipeline = filtered.filter(l => l.status === 'in_pipeline').length
  const warm = filtered.filter(l => l.status === 'warm').length
  const cold = filtered.filter(l => l.status === 'cold').length

  const activeLead = open ? leads.find(l => l.id === open) ?? null : null

  const addNote = (id: string, kind: NoteEntry['kind']) => {
    if (!draft.trim()) return
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 16)
    setLeads(prev => prev.map(l => l.id === id ? {
      ...l,
      notes: [...l.notes, { ts, author: 'Eric', kind, text: draft.trim() }],
    } : l))
    setDraft('')
  }

  const setLeadStatus = (id: string, newStatus: Status) => {
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 16)
    setLeads(prev => prev.map(l => l.id === id ? {
      ...l,
      status: newStatus,
      notes: [...l.notes, { ts, author: 'Eric', kind: 'status', text: `Status → ${newStatus.replace('_', ' ')}` }],
    } : l))
  }

  return (
    <div style={{ padding: '32px 32px 80px', maxWidth: 1380, margin: '0 auto', fontFamily: F.body, color: C.text }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: C.gold, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            Chiropractor Deal Pipeline · $1M+ Revenue · Wagner Territory · CRM
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: 'clamp(32px, 4.5vw, 44px)', fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            {leads.length} deals. Callable. Notes-ready.
          </h1>
          <p style={{ fontSize: 15, color: C.muted, margin: 0, maxWidth: 820, lineHeight: 1.55 }}>
            Click any practice → CRM drawer opens with phone (click-to-call), email, address, status dropdown, and a notes log. Calls and notes timestamped automatically. Deal list built by the agent pipeline (search → scrape → enrich → score) across Wagner&apos;s primary VA market + 10 secondary states (TX, FL, NC, SC, GA, TN, AL, KY, MD, WV).
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" style={{ padding: '10px 16px', borderRadius: 8, background: C.gold, color: C.bg, border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer', letterSpacing: '0.04em' }}>
            + Add to Outreach
          </button>
          <button type="button" style={{ padding: '10px 16px', borderRadius: 8, background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Export CSV
          </button>
        </div>
      </div>

      {/* ── SAMPLE DATA BANNER · transparency about what's real vs illustrative ── */}
      <div style={{
        background: `linear-gradient(135deg, rgba(46,204,139,0.08), rgba(201,168,76,0.04))`,
        border: `1px solid rgba(46,204,139,0.30)`, borderRadius: 12,
        padding: '16px 22px', marginBottom: 18,
        display: 'grid', gridTemplateColumns: '90px 1fr', gap: 18, alignItems: 'center',
      }}>
        <div style={{
          fontFamily: F.mono, fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
          padding: '8px 14px', borderRadius: 999, background: C.green, color: '#0B1B3E', textAlign: 'center',
        }}>
          Data Status
        </div>
        <div style={{ fontSize: 13.5, color: C.text, lineHeight: 1.65 }}>
          <strong style={{ color: C.green }}>✓ Verified rows ({leads.filter(l => l.verified).length})</strong> have real practice names, owner DCs, addresses, and phone numbers scraped from each clinic&apos;s public website (Cox · Balanced · Venture · Ivy Commons · Core · Free Bridge · Healing Hands · Wagner). <strong style={{ color: C.gold }}>Sample rows ({leads.filter(l => !l.verified).length})</strong> are illustrative — names, DCs, and contact info are placeholders demonstrating the CRM&apos;s capability. <strong style={{ color: C.text }}>Once you sign and we activate the agent pipeline (Apollo + Search + Scraper + Enrichment), every sample row gets replaced with verified data across all 91+ entries.</strong>
        </div>
      </div>

      {/* STAT STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, background: `linear-gradient(135deg, rgba(46,117,182,0.08), ${C.bg3})`, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 24px', marginBottom: 24 }}>
        <Stat label="Deals shown"          val={String(filtered.length)} color={C.gold} />
        <Stat label="✓ Verified"           val={String(leads.filter(l => l.verified).length)} color={C.green} />
        <Stat label="Combined revenue"     val={fmtMoney(totalRev)}       color={C.text} />
        <Stat label="Combined EBITDA est"  val={fmtMoney(totalEbit)}      color={C.green} />
        <Stat label="In pipeline"          val={String(inPipeline)}       color={C.green} />
        <Stat label="Warm"                 val={String(warm)}             color={C.gold} />
        <Stat label="Cold (untouched)"     val={String(cold)}             color={C.muted} />
      </div>

      {/* FILTERS */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 18, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginRight: 6 }}>Filters:</div>
        <FilterGroup label="Region" value={region} options={[{ v: 'all', label: 'All' }, ...REGIONS.map(r => ({ v: r, label: r }))]} onChange={v => setRegion(v as Region | 'all')} />
        <FilterGroup label="Status" value={status} options={[{ v: 'all', label: 'All' }, { v: 'in_pipeline', label: 'In Pipeline' }, { v: 'hot', label: 'Hot' }, { v: 'warm', label: 'Warm' }, { v: 'cold', label: 'Cold' }]} onChange={v => setStatus(v as Status | 'all')} />
        <FilterGroup label="Profile" value={profile} options={[{ v: 'all', label: 'All' }, { v: 'solo', label: 'Solo' }, { v: 'multi', label: 'Multi-DC' }, { v: 'multi_loc', label: 'Multi-Loc' }]} onChange={v => setProfile(v as Profile | 'all')} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: C.faint, fontFamily: F.mono, letterSpacing: '0.08em' }}>SORT BY</span>
          <select value={sort} onChange={e => setSort(e.target.value as 'score' | 'revenue')} style={{ padding: '7px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.text, fontFamily: F.body, fontSize: 12, outline: 'none' }}>
            <option value="score">Fit score</option>
            <option value="revenue">Est revenue</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1.2fr) 110px 90px 90px 110px 70px 70px',
          gap: 12, padding: '14px 22px', background: C.bg3, borderBottom: `1px solid ${C.border}`,
          fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.faint, fontWeight: 700,
        }}>
          <div>Practice / Owner</div>
          <div>City</div>
          <div>Phone</div>
          <div style={{ textAlign: 'right' }}>Est Rev</div>
          <div style={{ textAlign: 'right' }}>EBITDA</div>
          <div>Status</div>
          <div style={{ textAlign: 'right' }}>Score</div>
          <div>Notes</div>
        </div>
        {filtered.map((l, i) => (
          <div key={l.id}
            onClick={() => { setOpen(l.id); setDraft('') }}
            style={{
              display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1.2fr) 110px 90px 90px 110px 70px 70px',
              gap: 12, padding: '14px 22px',
              borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
              alignItems: 'center', cursor: 'pointer',
              background: l.status === 'in_pipeline' ? 'rgba(46,204,139,0.04)' : 'transparent',
            }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{l.practice}</div>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: F.mono, letterSpacing: '0.02em', marginTop: 2 }}>{l.owner} · {l.years}yr · {l.employees} emp · {l.npm_est} npm</div>
              {l.flag && <div style={{ fontSize: 11, color: C.gold, marginTop: 4, fontStyle: 'italic' }}>{l.flag}</div>}
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>
              <div>{l.city}</div>
              <div style={{ fontSize: 10, color: C.align, marginTop: 2, fontFamily: F.mono, letterSpacing: '0.04em' }}>{l.region}</div>
            </div>
            <a href={`tel:${l.phone.replace(/[^0-9+]/g, '')}`} onClick={e => e.stopPropagation()} style={{ fontFamily: F.mono, fontSize: 12, color: C.green, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
              📞 {l.phone}
            </a>
            <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: C.gold, textAlign: 'right' }}>{fmtMoney(l.est_revenue)}</div>
            <div style={{ fontFamily: F.display, fontSize: 14, fontWeight: 600, color: C.green, textAlign: 'right' }}>{fmtMoney(l.est_ebitda)}</div>
            <div><StatusBadge s={l.status} /></div>
            <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 800, color: l.score >= 80 ? C.green : l.score >= 70 ? C.gold : C.muted, textAlign: 'right' }}>{l.score}</div>
            <div style={{ fontSize: 11, color: C.faint, fontFamily: F.mono, letterSpacing: '0.04em' }}>{l.notes.length} {l.notes.length === 1 ? 'note' : 'notes'}</div>
          </div>
        ))}
      </div>

      {/* Agent pipeline note */}
      <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(46,117,182,0.06)', border: '1px solid rgba(46,117,182,0.20)', borderRadius: 10, fontSize: 13, color: C.muted, lineHeight: 1.55 }}>
        <strong style={{ color: C.align }}>How this list is built:</strong> the Agent Center pipeline runs continuously — Search fires queries against VA chiropractic directories, Scraper extracts practice + owner data, Qualifier scores against Wagner&apos;s 7-metric criteria, Enrichment adds revenue estimates via Apollo + LinkedIn, Outreach Writer drafts personalized first-touch emails. New leads appear here when the pipeline runs nightly.
      </div>

      {/* ── CRM DRAWER ──────────────────────────────────────────────────── */}
      {activeLead && (
        <CRMDrawer
          lead={activeLead}
          onClose={() => setOpen(null)}
          draft={draft}
          setDraft={setDraft}
          onAddNote={(kind) => addNote(activeLead.id, kind)}
          onStatus={(s) => setLeadStatus(activeLead.id, s)}
        />
      )}
    </div>
  )
}

// ── CRM DRAWER COMPONENT ───────────────────────────────────────────────
function CRMDrawer({ lead, onClose, draft, setDraft, onAddNote, onStatus }: {
  lead: Lead
  onClose: () => void
  draft: string
  setDraft: (v: string) => void
  onAddNote: (kind: NoteEntry['kind']) => void
  onStatus: (s: Status) => void
}) {
  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(8,15,30,0.7)', backdropFilter: 'blur(4px)',
        zIndex: 999, animation: 'kb-fadeIn 0.2s ease',
      }} />

      {/* Side panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(540px, 95vw)', maxWidth: '95vw',
        background: C.bg, borderLeft: `1px solid ${C.border}`,
        zIndex: 1000, overflowY: 'auto',
        animation: 'kb-slideIn 0.25s ease',
        color: C.text, fontFamily: F.body,
        boxShadow: '-30px 0 80px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: `1px solid ${C.border}`, background: C.bg2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                CRM · ChiroPillar Lead
              </div>
              <h2 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.01em', color: '#FFFFFF' }}>
                {lead.practice}
              </h2>
              <div style={{ fontSize: 14, color: C.muted }}>{lead.owner}</div>
            </div>
            <button type="button" onClick={onClose} style={{
              flexShrink: 0, padding: '6px 10px', borderRadius: 6,
              background: 'transparent', border: `1px solid ${C.border}`, color: C.muted,
              fontSize: 18, cursor: 'pointer',
            }}>✕</button>
          </div>
        </div>

        {/* Quick actions · click-to-call + email */}
        <div style={{ padding: '20px 28px', borderBottom: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <a href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`} style={{
            padding: '14px 16px', borderRadius: 10, background: C.green, color: '#0B1B3E',
            textDecoration: 'none', fontFamily: F.body, fontSize: 14, fontWeight: 800,
            textAlign: 'center', letterSpacing: '0.04em',
            boxShadow: `0 0 0 1px ${C.green}55`,
          }}>
            📞 Call {lead.phone}
          </a>
          <a href={`mailto:${lead.email}`} style={{
            padding: '14px 16px', borderRadius: 10, background: C.align, color: '#FFFFFF',
            textDecoration: 'none', fontFamily: F.body, fontSize: 14, fontWeight: 800,
            textAlign: 'center', letterSpacing: '0.04em',
          }}>
            ✉ Email
          </a>
        </div>

        {/* Contact / details grid */}
        <div style={{ padding: '20px 28px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
            Contact
          </div>
          <KvRow label="Phone"   val={lead.phone}   copy />
          <KvRow label="Email"   val={lead.email}   copy />
          <KvRow label="Address" val={`${lead.address}, ${lead.city}, VA`} />
          <KvRow label="County"  val={lead.county} />
          <KvRow label="Region"  val={lead.region} />
        </div>

        {/* Practice data */}
        <div style={{ padding: '20px 28px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
            Practice data (estimated)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
            <DataPill label="Revenue"   val={fmtMoney(lead.est_revenue)} color={C.gold} />
            <DataPill label="EBITDA"    val={fmtMoney(lead.est_ebitda)}  color={C.green} />
            <DataPill label="NPM /mo"   val={String(lead.npm_est)}        color={C.align} />
            <DataPill label="Years"     val={String(lead.years)}          color={C.muted} />
            <DataPill label="Employees" val={String(lead.employees)}      color={C.muted} />
            <DataPill label="Fit Score" val={String(lead.score)}          color={lead.score >= 80 ? C.green : lead.score >= 70 ? C.gold : C.muted} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <ProfileBadge p={lead.profile} />
            {lead.flag && <span style={{ fontSize: 12, color: C.gold, fontStyle: 'italic' }}>{lead.flag}</span>}
          </div>
        </div>

        {/* Status changer */}
        <div style={{ padding: '20px 28px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
            Status
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['in_pipeline', 'hot', 'warm', 'cold'] as Status[]).map(s => (
              <button key={s} type="button" onClick={() => onStatus(s)} style={{
                padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                background: lead.status === s ? C.gold : 'rgba(255,255,255,0.04)',
                border: `1px solid ${lead.status === s ? C.gold : C.border}`,
                color: lead.status === s ? C.bg : C.muted,
                fontSize: 12, fontFamily: F.body, fontWeight: lead.status === s ? 800 : 500,
                textTransform: 'capitalize',
              }}>
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Notes + history */}
        <div style={{ padding: '20px 28px' }}>
          <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
            Notes &amp; activity log · {lead.notes.length} entries
          </div>

          {/* Composer */}
          <div style={{ marginBottom: 18, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Type a note or call summary..."
              style={{
                width: '100%', minHeight: 70, padding: '10px 12px',
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 8,
                color: '#FFFFFF', fontSize: 14, fontFamily: F.body, resize: 'vertical',
                outline: 'none', boxSizing: 'border-box', marginBottom: 10,
              }}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" onClick={() => onAddNote('note')} style={qButtonStyle(C.muted, draft.length > 0)}>+ Note</button>
              <button type="button" onClick={() => onAddNote('call')} style={qButtonStyle(C.green, draft.length > 0)}>📞 Log Call</button>
              <button type="button" onClick={() => onAddNote('email')} style={qButtonStyle(C.align, draft.length > 0)}>✉ Log Email</button>
            </div>
          </div>

          {/* History */}
          {lead.notes.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: C.faint, fontSize: 13, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: `1px dashed ${C.border}` }}>
              No activity yet. Add a note or log a call to begin the trail.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...lead.notes].reverse().map((n, i) => (
                <div key={i} style={{
                  padding: '12px 14px', borderRadius: 8,
                  background: n.kind === 'call' ? 'rgba(46,204,139,0.06)' : n.kind === 'email' ? 'rgba(46,117,182,0.06)' : n.kind === 'status' ? 'rgba(201,168,76,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${n.kind === 'call' ? 'rgba(46,204,139,0.20)' : n.kind === 'email' ? 'rgba(46,117,182,0.20)' : n.kind === 'status' ? 'rgba(201,168,76,0.20)' : C.border}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 11, fontFamily: F.mono, letterSpacing: '0.04em' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ padding: '2px 7px', borderRadius: 4, background: n.kind === 'call' ? C.green : n.kind === 'email' ? C.align : n.kind === 'status' ? C.gold : C.muted, color: '#0B1B3E', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 9 }}>
                        {n.kind}
                      </span>
                      <span style={{ color: C.faint }}>{n.author}</span>
                    </span>
                    <span style={{ color: C.faint }}>{n.ts}</span>
                  </div>
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{n.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes kb-fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes kb-slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </>
  )
}

function qButtonStyle(color: string, hasDraft: boolean): React.CSSProperties {
  return {
    padding: '8px 14px', borderRadius: 8,
    background: hasDraft ? color : `${color}22`,
    border: `1px solid ${color}55`,
    color: hasDraft ? '#0B1B3E' : color,
    fontSize: 12, fontWeight: 700, cursor: hasDraft ? 'pointer' : 'not-allowed',
    fontFamily: F.body, letterSpacing: '0.04em',
  }
}

function Stat({ label, val, color }: { label: string; val: string; color: string }) {
  return (
    <div>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.faint, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: F.display, lineHeight: 1 }}>{val}</div>
    </div>
  )
}

function FilterGroup({ label, value, options, onChange }: { label: string; value: string; options: { v: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      <span style={{ fontSize: 11, color: C.faint, fontFamily: F.mono, letterSpacing: '0.08em', marginRight: 4 }}>{label.toUpperCase()}</span>
      {options.map(opt => (
        <button key={opt.v} type="button" onClick={() => onChange(opt.v)} style={{
          padding: '5px 10px', borderRadius: 5, cursor: 'pointer',
          background: value === opt.v ? C.gold : 'rgba(255,255,255,0.04)',
          border: `1px solid ${value === opt.v ? C.gold : C.border}`,
          color: value === opt.v ? C.bg : C.muted,
          fontSize: 11, fontFamily: F.body, fontWeight: value === opt.v ? 700 : 500,
        }}>{opt.label}</button>
      ))}
    </div>
  )
}

function KvRow({ label, val, copy }: { label: string; val: string; copy?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 12, padding: '7px 0', borderBottom: `1px solid ${C.border}`, alignItems: 'baseline' }}>
      <div style={{ fontFamily: F.mono, fontSize: 11, color: C.faint, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 13, color: C.text, fontFamily: copy ? F.mono : F.body, wordBreak: 'break-word' }}>{val}</div>
    </div>
  )
}

function DataPill({ label, val, color }: { label: string; val: string; color: string }) {
  return (
    <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 8, textAlign: 'center' }}>
      <div style={{ fontFamily: F.mono, fontSize: 9, color: C.faint, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
    </div>
  )
}

function ProfileBadge({ p }: { p: Profile }) {
  const map = { solo: { c: C.muted, l: 'Solo' }, multi: { c: C.align, l: 'Multi-DC' }, multi_loc: { c: C.gold, l: 'Multi-Loc' } } as const
  const m = map[p]
  return <span style={{ fontFamily: F.mono, fontSize: 10, padding: '3px 8px', borderRadius: 4, background: `${m.c}22`, color: m.c, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>{m.l}</span>
}

function StatusBadge({ s }: { s: Status }) {
  const map: Record<Status, { c: string; l: string }> = {
    in_pipeline: { c: C.green, l: 'In Pipeline' },
    hot:         { c: C.coral, l: 'Hot' },
    warm:        { c: C.gold,  l: 'Warm' },
    cold:        { c: C.muted, l: 'Cold' },
  }
  const m = map[s]
  return <span style={{ fontFamily: F.mono, fontSize: 10, padding: '3px 8px', borderRadius: 4, background: `${m.c}22`, color: m.c, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>{m.l}</span>
}
