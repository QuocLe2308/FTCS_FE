import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// utils
import { fetcher, fetcherPost, fetcherPut, fetcherDelete } from 'utils/axios';
import { API_BASE_URL } from 'constants';

const initialState = {
  modal: false
};

export const endpoints = {
  key: '/api/areaManagement',
  addAreas: '/areas',
  updateAreas: '/areas',
  deleteAreas: '/areas',
  getDrivers: '/drivers',
  getProvinces: '/areas',
  allProvinces: '/api/location/provinces'
};

export function useGetProvincesByAccountId(accountId) {
  const url = `${API_BASE_URL}${endpoints.key}${endpoints.getProvinces}/${accountId}`;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      provinces: data?.data || [],
      provincesLoading: isLoading,
      provincesError: error,
      provincesValidating: isValidating,
      provincesEmpty: !isLoading && (!data?.data || data.data.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );
  return memoizedValue;
}

export function useGetAllProvinces() {
  const url = `${API_BASE_URL}${endpoints.allProvinces}`;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      allProvinces: data?.data || [],
      allProvincesLoading: isLoading,
      allProvincesError: error,
      allProvincesValidating: isValidating,
      allProvincesEmpty: !isLoading && (!data?.data || data.data.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );
  return memoizedValue;
}

export async function addNewArea(accountId, requestData) {
  try {
    const response = await fetcherPost([
      `${API_BASE_URL}${endpoints.key}${endpoints.addAreas}/${accountId}`,
      requestData
    ]);

    // Refetch provinces for this account
    mutate(`${API_BASE_URL}${endpoints.key}${endpoints.getProvinces}/${accountId}`);

    return response;
  } catch (error) {
    console.error('Error adding new area:', error);
    throw error;
  }
}

export async function updateAreas(accountId, requestData) {
  try {
    const response = await fetcherPut([
      `${API_BASE_URL}${endpoints.key}${endpoints.updateAreas}/${accountId}`,
      requestData
    ]);

    // Refetch provinces for this account
    mutate(`${API_BASE_URL}${endpoints.key}${endpoints.getProvinces}/${accountId}`);

    return response;
  } catch (error) {
    console.error('Error updating areas:', error);
    throw error;
  }
}

export async function deleteAreas(accountId, provinceIds) {
  try {
    const response = await fetcherDelete(
      `${API_BASE_URL}${endpoints.key}${endpoints.deleteAreas}/${accountId}`,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        data: { provinceIds }
      }
    );

    // Refetch provinces for this account
    mutate(`${API_BASE_URL}${endpoints.key}${endpoints.getProvinces}/${accountId}`);

    return response;
  } catch (error) {
    console.error('Error deleting areas:', error);
    throw error;
  }
}

export function useGetAreaModal() {
  const { data, isLoading } = useSWR(endpoints.key + '/modal', () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      areaModal: data,
      areaModalLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handleAreaModalDialog(modal) {
  // to update local state based on key
  mutate(
    endpoints.key + '/modal',
    (currentAreaModal) => {
      return { ...currentAreaModal, modal };
    },
    false
  );
}

export function useGetDriversByAccountId() {
  const url = `${API_BASE_URL}${endpoints.key}${endpoints.getDrivers}`;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      drivers: data?.data || [],
      driversLoading: isLoading,
      driversError: error,
      driversValidating: isValidating,
      driversEmpty: !isLoading && (!data?.data || data.data.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );
  return memoizedValue;
}