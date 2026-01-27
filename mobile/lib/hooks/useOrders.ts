import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createOrder, getOrderByNumber } from '../api/client'

export function useOrderByNumber(orderNumber: string) {
  return useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => getOrderByNumber(orderNumber),
    enabled: !!orderNumber,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      queryClient.setQueryData(['order', order.orderNumber], order)
    },
  })
}
