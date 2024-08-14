export enum DataIndex {
  REQUEST = 'request',
  IMPRESSION = 'impression',
  REVENUE = 'revenue',
  ECPM = 'ecpm',
  RPM = 'rpm'
}

export interface NetworkProfile {
  currency: string
  id: string
  name: string
  status: string
}

export interface UnitRecord {
  date: string // YYYY-MM-DD
  impression: number
  request: number
  revenue: number
  ecpm: number
  rpm: number
}

export interface DataFormat {
  name: string
  data: number[]
}
