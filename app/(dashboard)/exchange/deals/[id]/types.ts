export type PendingNdaRequest = {
  id: string
  requester_firm_name: string
  requester_name: string
  requester_email: string
  requester_title: string
  buyer_profile: string
  requested_at: string
}

export type SigStats = {
  nda: number
  loi: number
  purchase_agreement: number
  custom: number
}

export type BuyerMatch = {
  id: string
  firm_name: string
  contact_name?: string
  contact_email?: string
  buyer_type?: string
  hq_city?: string
  hq_state?: string
  check_size_min?: number
  check_size_max?: number
  industries?: string[]
  fit_score: number
  reasoning: string
}
