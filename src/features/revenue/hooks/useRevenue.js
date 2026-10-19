import { useQuery } from '@tanstack/react-query'
import { getTransactions, getRevenueStats } from '../api'

export function useRevenueTransactions(params = {}, options = {}) {
  return useQuery({
    queryKey: ['revenue', 'transactions', params],
    queryFn: () => getTransactions(params),
    keepPreviousData: true,
    ...options,
  })
}

export function useRevenueStats(options = {}) {
  return useQuery({
    queryKey: ['revenue', 'stats'],
    queryFn: () => getRevenueStats(),
    ...options,
  })
}
