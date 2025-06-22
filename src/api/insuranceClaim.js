import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
import axios from 'axios';

// utils
import { fetcher, fetcherPut } from 'utils/axios';
import { API_BASE_URL } from 'constants';

const initialState = {
  modal: false
};

export const endpoints = {
  key: '/api/insuranceClaim',
  claims: '/claims',
  status: '/claims/status',
  dateRange: '/claims/date-range'
};

export function useGetAllInsuranceClaims(page = 0, size = 10) {
  const url = `${API_BASE_URL}${endpoints.key}${endpoints.claims}?page=${page}&size=${size}`;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      insuranceClaims: data?.data?.content,
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      insuranceClaimsLoading: isLoading,
      insuranceClaimsError: error,
      insuranceClaimsValidating: isValidating,
      insuranceClaimsEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );
  return memoizedValue;
}

export function useGetInsuranceClaim(claimId) {
  const url = claimId ? `${API_BASE_URL}${endpoints.key}${endpoints.claims}/${claimId}` : null;

  const { data, isLoading, error } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      insuranceClaim: data?.data,
      insuranceClaimLoading: isLoading,
      insuranceClaimError: error,
      refetch
    }),
    [data, error, isLoading]
  );
  return memoizedValue;
}

export function useGetInsuranceClaimsByStatus(status, page = 0, size = 10) {
  const url = status ? `${API_BASE_URL}${endpoints.key}${endpoints.status}?status=${status}&page=${page}&size=${size}` : null;

  const { data, isLoading, error } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      insuranceClaims: data?.data?.content,
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      insuranceClaimsLoading: isLoading,
      insuranceClaimsError: error,
      insuranceClaimsEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading]
  );
  return memoizedValue;
}

export function useGetInsuranceClaimsByDateRange(startDate, endDate, page = 0, size = 10) {
  const url =
    startDate && endDate
      ? `${API_BASE_URL}${endpoints.key}${endpoints.dateRange}?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`
      : null;

  const { data, isLoading, error } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      insuranceClaims: data?.data?.content,
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      insuranceClaimsLoading: isLoading,
      insuranceClaimsError: error,
      insuranceClaimsEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading]
  );
  return memoizedValue;
}

export async function createInsuranceClaim(bookingId, formData) {
  try {
    const response = await axios.post(`${API_BASE_URL}${endpoints.key}${endpoints.claims}/${bookingId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // Refetch all insurance claim lists after creation
    mutate((key) => key.startsWith(`${API_BASE_URL}${endpoints.key}`));

    return response;
  } catch (error) {
    console.error('Error creating insurance claim:', error);
    throw error;
  }
}

export async function updateInsuranceClaim(claimId, formData) {
  try {
    const response = await axios.put(`${API_BASE_URL}${endpoints.key}/${claimId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // Refetch all insurance claim lists after update
    mutate((key) => key.startsWith(`${API_BASE_URL}${endpoints.key}`));

    return response;
  } catch (error) {
    console.error('Error updating insurance claim:', error);
    throw error;
  }
}

export async function updateInsuranceClaimStatus(claimId, statusData) {
  if (!claimId) {
    console.error('Insurance Claim ID is undefined');
    return;
  }

  try {
    const response = await fetcherPut([`${API_BASE_URL}${endpoints.key}${endpoints.claims}/${claimId}`, statusData]);

    // Refetch all insurance claim lists after update
    mutate((key) => key.startsWith(`${API_BASE_URL}${endpoints.key}`));

    return response;
  } catch (error) {
    console.error('Error updating insurance claim status:', error);
    throw error;
  }
}

// Function to delete an insurance claim
export async function deleteInsuranceClaim(claimId) {
  if (!claimId) {
    console.error('Insurance Claim ID is undefined');
    return;
  }

  try {
    const response = await axios.delete(`${API_BASE_URL}${endpoints.key}${endpoints.claims}/${claimId}`);

    // Refetch all insurance claim lists after deletion
    mutate((key) => key.startsWith(`${API_BASE_URL}${endpoints.key}`));

    return response;
  } catch (error) {
    console.error('Error deleting insurance claim:', error);
    throw error;
  }
}

export function useGetInsuranceClaimModal() {
  const { data, isLoading } = useSWR(endpoints.key + '/modal', () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      insuranceClaimModal: data,
      insuranceClaimModalLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handleInsuranceClaimModalDialog(modal) {
  // to update local state based on key
  mutate(
    endpoints.key + '/modal',
    (currentInsuranceClaimModal) => {
      return { ...currentInsuranceClaimModal, modal };
    },
    false
  );
}
