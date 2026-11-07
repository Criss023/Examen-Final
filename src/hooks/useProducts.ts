import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { productService } from '../services/productService'
import type { Product, ListFilters, ProductsResponse } from '../types'
import { getErrorMessage } from '../utils/errorHandler'

export function useProducts(filters: ListFilters) {
  return useQuery<ProductsResponse, unknown>({
    queryKey: ['products', filters],
    queryFn: () => productService.list(filters),
    placeholderData: keepPreviousData,
  })
}

export function useProduct(id: number) {
  return useQuery<Product, unknown>({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id),
    retry: false,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: FormData) => productService.create(body),
    onSuccess: () => {
      toast.success('Producto creado correctamente')
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => productService.remove(id),
    onSuccess: () => {
      toast.success('Producto eliminado')
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}