import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// utils
import { fetcher, fetcherPost, fetcherPut } from 'utils/axios';
import { API_BASE_URL } from 'constants';

const initialState = {
  modal: false
};

export const endpoints = {
  key: '/api/voucher',
  status: '/status',
  list: '/list', // server URL
  modal: '/modal', // server URL
  insert: '/insert', // server URL
  update: '/update', // server URL
  delete: '/delete', // server URL
  redeem: '/redeem' // server URL for redeem endpoint
};

export function useGetVoucher(page = 0, size = 10) {
  // Include pagination parameters in the URL
  const url = `${API_BASE_URL}${endpoints.key}${endpoints.list}?page=${page}&size=${size}`;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      vouchers: data?.data?.content, // Access the content array from Page object
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      vouchersLoading: isLoading,
      vouchersError: error,
      vouchersValidating: isValidating,
      vouchersEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );
  return memoizedValue;
}

export function useGetRedeemedVoucher(isRedeemable, page = 0, size = 10) {
  // Include pagination parameters in the URL with the redeem parameter
  const url = `${API_BASE_URL}${endpoints.key}${endpoints.redeem}?isRedeemable=${isRedeemable}&page=${page}&size=${size}`;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      redeemedVouchers: data?.data?.content, // Access the content array from Page object
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      redeemedVouchersLoading: isLoading,
      redeemedVouchersError: error,
      redeemedVouchersValidating: isValidating,
      redeemedVouchersEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );
  return memoizedValue;
}

export async function deleteVoucher(voucherId) {
  try {
    const response = await fetcherPut([API_BASE_URL + endpoints.key + endpoints.delete + '/' + voucherId, { id: voucherId }]);

    // Refetch all voucher lists after deletion
    mutate((key) => key.startsWith(`${API_BASE_URL}${endpoints.key}`));

    return response;
  } catch (error) {
    console.error('Error deleting voucher:', error);
  }
}

export async function insertVoucher(newVoucher) {
  try {
    const response = await fetcherPost([API_BASE_URL + endpoints.key, newVoucher]);

    // Refetch all voucher lists after insertion
    mutate((key) => key.startsWith(`${API_BASE_URL}${endpoints.key}`));

    return response;
  } catch (error) {
    console.error('Error inserting voucher:', error);
  }
}

export async function updateVoucher(voucherId, updatedVoucher) {
  if (!voucherId) {
    console.error('Voucher ID is undefined');
    return;
  }
  try {
    const response = await fetcherPut([API_BASE_URL + endpoints.key + '/' + voucherId, updatedVoucher]);

    // Refetch all voucher lists after update
    mutate((key) => key.startsWith(`${API_BASE_URL}${endpoints.key}`));

    return response;
  } catch (error) {
    console.error('Error updating voucher:', error);
  }
}

export function useGetCustomerMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.modal, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      customerMaster: data,
      customerMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerCustomerDialog(modal) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.modal,
    (currentCustomerMaster) => {
      return { ...currentCustomerMaster, modal };
    },
    false
  );
}
