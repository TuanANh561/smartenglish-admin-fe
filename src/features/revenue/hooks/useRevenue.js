import { useQuery } from '@tanstack/react-query'
import { getTransactions, getRevenueStats } from '../api'

export function useRevenueTransactions(params = {}) {
  return useQuery({
    queryKey: ['revenue', 'transactions', params],
    queryFn: () => getTransactions(params),
    keepPreviousData: true,
  })
}

export function useRevenueStats() {
  return useQuery({
    queryKey: ['revenue', 'stats'],
    queryFn: () => getRevenueStats(),
  })
}
