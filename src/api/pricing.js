import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// utils
import { fetcher, fetcherDelete, fetcherPost, fetcherPut } from 'utils/axios';
import { API_BASE_URL } from 'constants';

const initialState = {
  modal: false
};

export const endpoints = {
  key: '/api/pricing',
  status: '/status',
  list: '/list', // server URL
  modal: '/modal', // server URL
  insert: '/insert', // server URL
  update: '/update', // server URL
  delete: '/delete' // server URL
};

export const endpoinRanges = {
  distanceRange: '/api/distanceRange',
  weightRange: '/api/weightRange',
  list: '/list', // server URL
  modal: '/modal', // server URL
  insert: '/insert', // server URL
  update: '/update', // server URL
  delete: '/delete' // server URL
};

export function useGetPricing(page = 0, size = 10) {
  // Include pagination parameters in the URL
  const url = `${API_BASE_URL}${endpoints.key}?page=${page}&size=${size}`;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      pricings: data?.data?.content, // Access the content array from Page object
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      pricingsLoading: isLoading,
      pricingsError: error,
      pricingsValidating: isValidating,
      pricingsEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );
  console.log(memoizedValue);
  return memoizedValue;
}

// Updated useGetDistanceRange with pagination
export function useGetDistanceRange(page = 0, size = 10) {
  // Include pagination parameters in the URL
  const url = `${API_BASE_URL}${endpoinRanges.distanceRange}?page=${page}&size=${size}`;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      distanceRanges: data?.data?.content, // Access the content array from Page object
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      isLoading,
      isError: error,
      isValidating,
      isEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );
  return memoizedValue;
}

// Updated useGetWeeightRange with pagination
export function useGetWeeightRange(page = 0, size = 10) {
  // Include pagination parameters in the URL
  const url = `${API_BASE_URL}${endpoinRanges.weightRange}?page=${page}&size=${size}`;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      weightRanges: data?.data?.content, // Access the content array from Page object
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      isLoading,
      isError: error,
      isValidating,
      isEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );
  return memoizedValue;
}

export async function deletePricing(pricingId) {
  try {
    const response = await fetcherDelete([API_BASE_URL + endpoints.key + '/' + pricingId, { id: pricingId }]);
    mutate(endpoints.key); // Cập nhật lại danh sách sau khi xóa
    console.log(response);
    return response;
  } catch (error) {
    console.error('Error deleting pricing:', error);
  }
}

export async function insertPricing(newPricing) {
  try {
    const response = await fetcherPost([API_BASE_URL + endpoints.key, newPricing]);
    mutate(endpoints.key);
    console.log(response);
    return response;
  } catch (error) {
    console.error('Error inserting pricing:', error);
  }
}

export async function updatePricing(pricingId, updatedPricing) {
  if (!pricingId) {
    console.error('Pricing ID is undefined');
    return;
  }
  try {
    const response = await fetcherPut([API_BASE_URL + endpoints.key + '/' + pricingId, updatedPricing]);
    mutate(endpoints.key);
    console.log(response);
    return response;
  } catch (error) {
    console.error('Error updating pricing:', error);
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
