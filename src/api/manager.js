import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// utils
import { fetcherPost, fetcherPut } from 'utils/axios';
import { API_BASE_URL } from 'constants';

// const initialState = {
//   modal: false
// };

export const endpoints = {
  //key: 'api/customer',refetch
  key: 'api/account',
  role: '/findByRole',
  delete: '/isDisable',
  craete: '/createAccount',
  edit: '/editAccount'
};

export function useGetAcocuntByRole(role, page = 0, size = 10) {
  // Only create the URL if role exists
  const url = role ? `${API_BASE_URL}/api/account/findByRole?page=${page}&size=${size}` : null;

  // We need to pass the role in the request body when using fetcherPost
  const { data, isLoading, error, isValidating } = useSWR(url ? [url, { role: role }] : null, fetcherPost, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url ? [url, { role: role }] : null);

  // Rest of your code remains the same
  return useMemo(
    () => ({
      accounts: data?.data?.content || [],
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      accountsLoading: isLoading,
      accountsError: error,
      accountsValidating: isValidating,
      accountsEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );
}

export async function deleteManager(accountId) {
  try {
    const response = await fetcherPut([API_BASE_URL + '/' + endpoints.key + endpoints.delete + '/' + accountId, { id: accountId }]);
    mutate(endpoints.key);
    console.log(response);
    return response;
  } catch (error) {
    console.error('Error deleting account:', error);
  }
}

export async function insertManager(newAccount) {
  try {
    const response = await fetcherPost([API_BASE_URL + '/' + endpoints.key + endpoints.craete, newAccount]);
    mutate(endpoints.key);
    console.log(response);
    return response;
  } catch (error) {
    console.error('Error inserting account:', error);
  }
}

export async function updateManager(accountId, updateAccount) {
  if (!accountId) {
    console.error('Account ID is undefined');
    return;
  }
  try {
    const response = await fetcherPut([API_BASE_URL + '/' + endpoints.key + endpoints.edit + '/' + accountId, updateAccount]);
    mutate(endpoints.key);
    console.log(response);
    return response;
  } catch (error) {
    console.error('Error updating account:', error);
  }
}
