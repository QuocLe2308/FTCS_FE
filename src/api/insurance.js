import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// utils
import { fetcher, fetcherPost, fetcherPut, fetcherDelete } from 'utils/axios';
import { API_BASE_URL } from 'constants';

const initialState = {
  modal: false
};

export const endpoints = {
  key: '/api/insurancePolicy',
  list: '', // Get all insurance policies
  policy: '/' // Get specific insurance policy by ID
};

export function useGetAllInsurancePolicies(page = 0, size = 10) {
  const url = `${API_BASE_URL}${endpoints.key}?page=${page}&size=${size}`;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      insurancePolicies: data?.data?.content,
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      insurancePoliciesLoading: isLoading,
      insurancePoliciesError: error,
      insurancePoliciesValidating: isValidating,
      insurancePoliciesEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );
  return memoizedValue;
}

export function useGetInsurancePolicy(policyId) {
  const url = policyId ? `${API_BASE_URL}${endpoints.key}/${policyId}` : null;

  const { data, isLoading, error } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      insurancePolicy: data?.data,
      insurancePolicyLoading: isLoading,
      insurancePolicyError: error,
      refetch
    }),
    [data, error, isLoading]
  );
  return memoizedValue;
}

export async function createInsurancePolicy(newInsurancePolicy) {
  try {
    const response = await fetcherPost([API_BASE_URL + endpoints.key, newInsurancePolicy]);

    // Refetch all insurance policy lists after creation
    mutate((key) => key.startsWith(`${API_BASE_URL}${endpoints.key}`));

    return response;
  } catch (error) {
    console.error('Error creating insurance policy:', error);
  }
}

export async function updateInsurancePolicy(policyId, updatedInsurancePolicy) {
  if (!policyId) {
    console.error('Insurance Policy ID is undefined');
    return;
  }

  try {
    const response = await fetcherPut([API_BASE_URL + endpoints.key + '/' + policyId, updatedInsurancePolicy]);

    // Refetch all insurance policy lists after update
    mutate((key) => key.startsWith(`${API_BASE_URL}${endpoints.key}`));

    return response;
  } catch (error) {
    console.error('Error updating insurance policy:', error);
  }
}

export async function deleteInsurancePolicy(policyId) {
  try {
    const response = await fetcherDelete(API_BASE_URL + endpoints.key + '/' + policyId);

    // Refetch all insurance policy lists after deletion
    mutate((key) => key.startsWith(`${API_BASE_URL}${endpoints.key}`));

    return response;
  } catch (error) {
    console.error('Error deleting insurance policy:', error);
  }
}

export function useGetInsuranceModal() {
  const { data, isLoading } = useSWR(endpoints.key + '/modal', () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      insuranceModal: data,
      insuranceModalLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handleInsuranceModalDialog(modal) {
  // to update local state based on key
  mutate(
    endpoints.key + '/modal',
    (currentInsuranceModal) => {
      return { ...currentInsuranceModal, modal };
    },
    false
  );
}
