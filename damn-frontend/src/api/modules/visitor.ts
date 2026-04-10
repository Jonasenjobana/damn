import request from '../request'

export interface VisitorStats {
  totalVisitors: number
  countryStats: Array<{ country: string; count: number }>
  cityStats: Array<{ city: string; count: number }>
  locations: Array<{
    lat: number
    lng: number
    city: string
    country: string
    time: string
  }>
}

export const visitorAPI = {
  getStats: () => {
    return request.get<any, any>('/visitor/stats')
  },
}
