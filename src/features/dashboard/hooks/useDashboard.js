import { useQuery } from '@tanstack/react-query'
import * as dashboardApi from '../api'

export function useOverview(range) {
  return useQuery({
    queryKey: ['dashboard', 'overview', range],
    queryFn: () => dashboardApi.getOverview(range),
  })
}

export function useActiveUsers(range) {
  return useQuery({
    queryKey: ['dashboard', 'active-users', range],
    queryFn: () => dashboardApi.getActiveUsers(range),
  })
}

export function useFeatureUsage(range) {
  return useQuery({
    queryKey: ['dashboard', 'feature-usage', range],
    queryFn: () => dashboardApi.getFeatureUsage(range),
  })
}

export function useRevenueByMonth(range) {
  return useQuery({
    queryKey: ['dashboard', 'revenue-by-month', range],
    queryFn: () => dashboardApi.getRevenueByMonth(range),
  })
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: ['dashboard', 'recent-activity', limit],
    queryFn: () => dashboardApi.getRecentActivity(limit),
  })
}

export function useRevenueStats() {
  return useQuery({
    queryKey: ['dashboard', 'revenue-stats'],
    queryFn: () => dashboardApi.getRevenueStats(),
  })
}

export function useRecentTransactions(size = 10) {
  return useQuery({
    queryKey: ['dashboard', 'recent-transactions', size],
    queryFn: () => dashboardApi.getRecentTransactions(size),
  })
}

export function useAiUsage(range) {
  return useQuery({
    queryKey: ['dashboard', 'ai-usage', range],
    queryFn: () => dashboardApi.getAiUsage(range),
  })
}
