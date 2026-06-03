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

  // Charlottesville (Wagner Primary)
  { id: 'va010', practice: 'Piedmont Spine & Wellness', owner: 'Dr. Marcus Bell', email: 'mbell@piedmontspine.com', phone: '(434) 555-0118', address: '595 Westfield Rd', city: 'Charlottesville', county: 'Albemarle', region: 'Charlottesville', est_revenue: 1_300_000, est_ebitda: 485_000, profile: 'multi', npm_est: 78, years: 14, employees: 8, status: 'in_pipeline', score: 94, flag: '⭐ HERO DEAL · in diligence', notes: [
    { ts: '2026-05-20 09:14', author: 'System', kind: 'note', text: 'Intake submitted · qualified · 4/4 Wagner criteria met' },
    { ts: '2026-05-21 14:50', author: 'McGrath', kind: 'call', text: 'First call 42 min. Bell is mostly-management already, very open to stepping out. Wants to keep practicing 2 days/wk after close.' },
    { ts: '2026-05-24 11:00', author: 'Wagner', kind: 'call', text: '47 min meeting. Bell said "feels like a partner not a buyer." Financials look clean - moving to diligence.' },
    { ts: '2026-05-30 13:15', author: 'Eric', kind: 'status', text: 'Stage moved to In Diligence. Legal review started.' },
    { ts: '2026-06-01 10:00', author: 'System', kind: 'note', text: 'Mutual NDA sent via DocuSeal · awaiting signature' },
    { ts: '2026-06-01 14:22', author: 'System', kind: 'note', text: 'NDA executed by Bell · IP-logged · timestamped' },
    { ts: '2026-06-02 11:30', author: 'Eric', kind: 'note', text: 'LOI drafted at $1.9M · 50% cash + 50% seller note · 4% profit share · 10% rollover. Wagner reviewing.' },
  ] },
  { id: 'va011', practice: 'Charlottesville Spine Center', owner: 'Dr. Helen Park', email: 'hpark@cvillespine.com', phone: '(434) 555-0244', address: '418 W Main St', city: 'Charlottesville', county: 'Albemarle', region: 'Charlottesville', est_revenue: 1_500_000, est_ebitda: 525_000, profile: 'multi', npm_est: 68, years: 12, employees: 8, status: 'warm', score: 88, flag: 'Wagner met at VA Chiro Assoc', notes: [
    { ts: '2026-05-25 16:00', author: 'Wagner', kind: 'call', text: 'Park is curious but not actively selling. Wants to know "what does the medical-team thing actually do." Booked follow-up for Friday.' },
  ] },
  { id: 'va012', practice: 'Charlottesville Athletic Chiro', owner: 'Dr. Anthony Vega', email: 'avega@cvilleathletic.com', phone: '(434) 555-0387', address: '1700 Rio Rd E', city: 'Charlottesville', county: 'Albemarle', region: 'Charlottesville', est_revenue: 1_400_000, est_ebitda: 470_000, profile: 'multi', npm_est: 71, years: 10, employees: 7, status: 'warm', score: 86, flag: 'Sports/PI · Wagner-friendly', notes: [] },
  { id: 'va013', practice: 'Augusta Spine Center', owner: 'Dr. Calvin Wright', email: 'cwright@augustaspine.com', phone: '(540) 555-1233', address: '425 W Main St', city: 'Waynesboro', county: 'Augusta', region: 'Charlottesville', est_revenue: 1_100_000, est_ebitda: 385_000, profile: 'multi', npm_est: 53, years: 11, employees: 6, status: 'in_pipeline', score: 82, flag: 'Submitted intake D-8 · qualified', notes: [
    { ts: '2026-05-26 10:14', author: 'System', kind: 'note', text: 'Intake submitted · qualified' },
    { ts: '2026-05-28 11:42', author: 'McGrath', kind: 'call', text: 'First call. Wright was hesitant but warmed up when I explained the medical-team economics.' },
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
            VA Chiropractor Target List · $1M+ Revenue · CRM
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: 'clamp(32px, 4.5vw, 44px)', fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            40 leads. Callable. Notes-ready.
          </h1>
          <p style={{ fontSize: 15, color: C.muted, margin: 0, maxWidth: 820, lineHeight: 1.55 }}>
            Click any practice → CRM drawer opens with phone (click-to-call), email, address, status dropdown, and a notes log. Calls and notes timestamped automatically. List built by the agent pipeline (search → scrape → enrich → score).
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

      {/* STAT STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, background: `linear-gradient(135deg, rgba(46,117,182,0.08), ${C.bg3})`, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 24px', marginBottom: 24 }}>
        <Stat label="Leads shown"          val={String(filtered.length)} color={C.gold} />
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
