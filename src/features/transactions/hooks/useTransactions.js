import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getTransactions,
  getReconciliationStats,
  approveRefund,
  rejectRefund,
  getSepayTransactions,
  manualMatchTransaction,
  getStaticQr,
} from '../transactionsApi'

export function useTransactions(params = {}) {
  return useQuery({
    queryKey: ['admin', 'transactions', params],
    queryFn: () => getTransactions(params),
    keepPreviousData: true,
  })
}

export function useReconciliationStats() {
  return useQuery({
    queryKey: ['admin', 'revenue', 'reconciliation-stats'],
    queryFn: () => getReconciliationStats(),
  })
}

export function useApproveRefund() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }) => approveRefund(id, reason),
    onSuccess: () => {
      toast.success('Đã phê duyệt hoàn tiền đơn hàng!')
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'revenue'] })
    },
    onError: (err) => {
      toast.error('Phê duyệt hoàn tiền thất bại: ' + (err.message || 'Lỗi hệ thống'))
    },
  })
}

export function useRejectRefund() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }) => rejectRefund(id, reason),
    onSuccess: () => {
      toast.success('Đã từ chối yêu cầu hoàn tiền!')
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'revenue'] })
    },
    onError: (err) => {
      toast.error('Từ chối hoàn tiền thất bại: ' + (err.message || 'Lỗi hệ thống'))
    },
  })
}

export function useSepayTransactions(matchStatus) {
  return useQuery({
    queryKey: ['admin', 'sepay-transactions', matchStatus],
    queryFn: () => getSepayTransactions(matchStatus),
  })
}

export function useManualMatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, orderCode }) => manualMatchTransaction(id, orderCode),
    onSuccess: () => {
      toast.success('Đã khớp lệnh thành công và kích hoạt đơn hàng!')
      queryClient.invalidateQueries({ queryKey: ['admin', 'sepay-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'revenue'] })
    },
    onError: (err) => {
      toast.error('Khớp lệnh thất bại: ' + (err?.response?.data?.message || err.message || 'Lỗi kiểm tra'))
    },
  })
}

export function useStaticQr() {
  return useQuery({
    queryKey: ['admin', 'sepay', 'static-qr'],
    queryFn: () => getStaticQr(),
    staleTime: 5 * 60 * 1000,
  })
}

