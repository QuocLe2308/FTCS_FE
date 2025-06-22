import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// utils
import { fetcher, fetcherPost, fetcherPut, fetcherDelete } from 'utils/axios';
import { API_BASE_URL } from 'constants';

const initialState = {
  modal: false
};

export const endpoints = {
  key: '/api/bonusConfiguration',
  list: '', // Get all bonus configurations
  active: '/active', // Get active bonus configurations
  driverGroup: '/driverGroup', // Get bonus configurations by driver group
  rewardType: '/rewardType', // Get bonus configurations by reward type
  deActive: '/deActive', // Deactivate a bonus configuration
  progress: '/api/driverBonusProgress/bonusConfig' // Get progress by bonus configuration ID
};

export function useGetAllBonusConfigurations(page = 0, size = 10) {
  const url = `${API_BASE_URL}${endpoints.key}?page=${page}&size=${size}`;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      bonusConfigurations: data?.data?.content,
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      bonusConfigurationsLoading: isLoading,
      bonusConfigurationsError: error,
      bonusConfigurationsValidating: isValidating,
      bonusConfigurationsEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );
  return memoizedValue;
}

export function useGetActiveBonusConfigurations(page = 0, size = 10) {
  const url = `${API_BASE_URL}${endpoints.key}${endpoints.active}?page=${page}&size=${size}`;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      activeBonusConfigurations: data?.data?.content,
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      activeBonusConfigurationsLoading: isLoading,
      activeBonusConfigurationsError: error,
      activeBonusConfigurationsValidating: isValidating,
      activeBonusConfigurationsEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );
  return memoizedValue;
}

export async function getBonusConfigurationsByDriverGroup(request, page = 0, size = 10) {
  const url = `${API_BASE_URL}${endpoints.key}${endpoints.driverGroup}?page=${page}&size=${size}`;

  try {
    const response = await fetcherPost([url, request]);
    return response;
  } catch (error) {
    console.error('Error getting bonus configurations by driver group:', error);
  }
}

export async function getBonusConfigurationsByRewardType(request, page = 0, size = 10) {
  const url = `${API_BASE_URL}${endpoints.key}${endpoints.rewardType}?page=${page}&size=${size}`;

  try {
    const response = await fetcherPost([url, request]);
    return response;
  } catch (error) {
    console.error('Error getting bonus configurations by reward type:', error);
  }
}

export async function createBonusConfiguration(newBonusConfig) {
  try {
    const response = await fetcherPost([API_BASE_URL + endpoints.key, newBonusConfig]);

    // Refetch all bonus configuration lists after creation
    mutate((key) => key.startsWith(`${API_BASE_URL}${endpoints.key}`));

    return response;
  } catch (error) {
    console.error('Error creating bonus configuration:', error);
  }
}

export async function updateBonusConfiguration(bonusConfigId, updatedBonusConfig) {
  if (!bonusConfigId) {
    console.error('Bonus Configuration ID is undefined');
    return;
  }
  try {
    const response = await fetcherPut([API_BASE_URL + endpoints.key + '/' + bonusConfigId, updatedBonusConfig]);

    // Refetch all bonus configuration lists after update
    mutate((key) => key.startsWith(`${API_BASE_URL}${endpoints.key}`));

    return response;
  } catch (error) {
    console.error('Error updating bonus configuration:', error);
  }
}

export async function deleteBonusConfiguration(bonusConfigId) {
  try {
    const response = await fetcherDelete(API_BASE_URL + endpoints.key + '/' + bonusConfigId);

    // Refetch all bonus configuration lists after deletion
    mutate((key) => key.startsWith(`${API_BASE_URL}${endpoints.key}`));

    return response;
  } catch (error) {
    console.error('Error deleting bonus configuration:', error);
  }
}

export async function deActivateBonusConfiguration(bonusConfigId) {
  try {
    const response = await fetcherPut([API_BASE_URL + endpoints.key + endpoints.deActive + '/' + bonusConfigId]);

    // Refetch all bonus configuration lists after deactivation
    mutate((key) => key.startsWith(`${API_BASE_URL}${endpoints.key}`));

    return response;
  } catch (error) {
    console.error('Error deactivating bonus configuration:', error);
  }
}

export function useGetBonusModal() {
  const { data, isLoading } = useSWR(endpoints.key + '/modal', () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      bonusModal: data,
      bonusModalLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handleBonusModalDialog(modal) {
  // to update local state based on key
  mutate(
    endpoints.key + '/modal',
    (currentBonusModal) => {
      return { ...currentBonusModal, modal };
    },
    false
  );
}

export function useGetBonusProgress(bonusConfigId, page = 0, size = 10) {
  const url = `${API_BASE_URL}${endpoints.progress}/${bonusConfigId}?page=${page}&size=${size}`;

  const { data, isLoading, error, isValidating } = useSWR(bonusConfigId ? url : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      bonusProgress: data?.data?.content,
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      bonusProgressLoading: isLoading,
      bonusProgressError: error,
      bonusProgressValidating: isValidating,
      bonusProgressEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );
  return memoizedValue;
}
