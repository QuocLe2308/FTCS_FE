import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// utils
import { fetcher } from 'utils/axios';
import { API_BASE_URL } from 'constants';

export const endpoints = {
  key: '/api/payment',
  getAll: '',
  getById: '/'
};

export function useGetPayments(page = 0, size = 10) {
  const { data, isLoading, error, isValidating } = useSWR(`${API_BASE_URL}${endpoints.key}?page=${page}&size=${size}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetchPayments = () => mutate(`${API_BASE_URL}${endpoints.key}?page=${page}&size=${size}`);

  return useMemo(
    () => ({
      payments: data?.data?.content || [],
      totalPages: data?.data?.totalPages || 0,
      currentPage: data?.data?.number || 0,
      totalElements: data?.data?.totalElements || 0,
      paymentsLoading: isLoading,
      paymentsError: error,
      paymentsValidating: isValidating,
      paymentsEmpty: !isLoading && (!data?.data?.content || data?.data?.content.length === 0),
      refetch: refetchPayments
    }),
    [data, error, isLoading, isValidating]
  );
}

export function useGetPaymentById(paymentId) {
  const { data, isLoading, error } = useSWR(paymentId ? `${API_BASE_URL}${endpoints.key}${endpoints.getById}${paymentId}` : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  return useMemo(
    () => ({
      payment: data?.data,
      paymentLoading: isLoading,
      paymentError: error
    }),
    [data, error, isLoading]
  );
}
