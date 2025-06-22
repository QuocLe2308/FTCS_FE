import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// utils
import { fetcher, fetcherPut } from 'utils/axios';
import { API_BASE_URL } from 'constants';

const initialState = {
  modal: false
};

export const endpoints = {
  key: '/api/withdraw',
  status: '/status',
  requestDate: '/requestDate',
  page: '?page=${page}&size=${size}',
  list: '/list', // server URL
  modal: '/modal', // server URL
  insert: '/insert', // server URL
  update: '/update', // server URL
  delete: '/delete', // server URL
  batchUpdate: '/batch-update' // server URL
};

// export function useGetWithdraw() {
//   const { data, isLoading, error, isValidating } = useSWR(API_BASE_URL + endpoints.key, fetcher, {
//     revalidateIfStale: false,
//     revalidateOnFocus: false,
//     revalidateOnReconnect: false
//   });

//   const refetch = () => mutate(API_BASE_URL + endpoints.key);

//   const memoizedValue = useMemo(
//     () => ({
//       withdraws: data?.data,
//       withdrawsLoading: isLoading,
//       withdrawsError: error,
//       withdrawsValidating: isValidating,
//       withdrawsEmpty: !isLoading && !data?.length,
//       refetch: refetch
//     }),
//     [data, error, isLoading, isValidating, refetch]
//   );
//   console.log(memoizedValue);
//   return memoizedValue;
// }

export function useGetWithdraw(page = 0, size = 10) {
  // Include pagination parameters in the URL
  const url = `${API_BASE_URL}${endpoints.key}${endpoints.page}`.replace('${page}', page).replace('${size}', size);

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      withdraws: data?.data?.content, // Access the content array from Page object
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      withdrawsLoading: isLoading,
      withdrawsError: error,
      withdrawsValidating: isValidating,
      withdrawsEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );

  console.log(memoizedValue);
  return memoizedValue;
}

export function useGetWithdrawByStatus(status, page = 0, size = 10) {
  // Include pagination parameters in the URL
  const url = status ? `${API_BASE_URL}${endpoints.key}${endpoints.status}?status=${status}&page=${page}&size=${size}` : null;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => url && mutate(url);

  const memoizedValue = useMemo(
    () => ({
      withdrawsByStatus: data?.data?.content, // Access the content array from Page object
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      withdrawsByStatusLoading: isLoading,
      withdrawsByStatusError: error,
      withdrawsByStatusValidating: isValidating,
      withdrawsByStatusEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating, status]
  );

  return memoizedValue;
}

export function useGetWithdrawByRequestDate(requestDate, page = 0, size = 10) {
  // Include pagination parameters in the URL
  const url = requestDate
    ? `${API_BASE_URL}${endpoints.key}${endpoints.requestDate}?requestDate=${requestDate}&page=${page}&size=${size}`
    : null;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => url && mutate(url);

  const memoizedValue = useMemo(
    () => ({
      withdrawsByDate: data?.data?.content, // Access the content array from Page object
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      withdrawsByDateLoading: isLoading,
      withdrawsByDateError: error,
      withdrawsByDateValidating: isValidating,
      withdrawsByDateEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating, requestDate]
  );

  return memoizedValue;
}

export async function updateWithdrawById(withdrawId, updatedWithdraw) {
  if (!withdrawId) {
    console.error('Withdraw ID is undefined');
    return;
  }

  try {
    const response = await fetcherPut([API_BASE_URL + endpoints.key + '/' + withdrawId, updatedWithdraw]);

    // Revalidate the affected data
    mutate(API_BASE_URL + endpoints.key);

    // If status is updated, also revalidate status-specific data
    if (updatedWithdraw.status) {
      mutate(API_BASE_URL + endpoints.key + endpoints.status + '?status=' + updatedWithdraw.status);
    }

    return response;
  } catch (error) {
    console.error('Error updating withdraw:', error);
    throw error;
  }
}

export async function batchUpdateWithdraws(withdrawIds, status) {
  if (!withdrawIds || !withdrawIds.length || !status) {
    console.error('Invalid batch update data: withdrawIds and status are required');
    return;
  }

  const batchUpdatePayload = {
    withdrawIds: Array.isArray(withdrawIds) ? withdrawIds : [withdrawIds],
    status
  };

  try {
    const response = await fetcherPut([API_BASE_URL + endpoints.key + endpoints.batchUpdate, batchUpdatePayload]);

    // Revalidate the main withdraw list
    mutate(API_BASE_URL + endpoints.key);

    // Revalidate the status-specific data
    mutate(API_BASE_URL + endpoints.key + endpoints.status + '?status=' + status);

    return response;
  } catch (error) {
    console.error('Error batch updating withdraws:', error);
    throw error;
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
