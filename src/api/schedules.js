import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'utils/axios';
import { API_BASE_URL } from 'constants';

export const endpoints = {
  key: '/api/schedule',
  list: '/all',
  insert: '/create', // Assuming this endpoint
  update: '/update', // Assuming this endpoint
  delete: '/delete', // Assuming this endpoint
  getByAccountId: '/listSchedule', // Added new endpoint
  tripAgreement: '/api/trip-agreement'
};

export function useGetSchedules(page = 0, size = 10) {
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
      schedules: data?.data?.content || [], // Access the content array from Page object
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      schedulesLoading: isLoading,
      schedulesError: error,
      schedulesValidating: isValidating,
      schedulesEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetSchedulesByAccountId(accountId, page = 0, size = 10) {
  const url = accountId ? `${API_BASE_URL}${endpoints.key}${endpoints.getByAccountId}/${accountId}?page=${page}&size=${size}` : null;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      schedules: data?.data?.content || [],
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      schedulesLoading: isLoading,
      schedulesError: error,
      schedulesValidating: isValidating,
      schedulesEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );
  return memoizedValue;
}

export function useGetTripAgreementByScheduleId(scheduleId, page = 0, size = 10) {
  const url = scheduleId ? `${API_BASE_URL}${endpoints.tripAgreement}/${scheduleId}?page=${page}&size=${size}` : null;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      tripAgreements: data?.data?.content || [],
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      tripAgreementsLoading: isLoading,
      tripAgreementsError: error,
      tripAgreementsValidating: isValidating,
      tripAgreementsEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );
  return memoizedValue;
}

export async function insertSchedule(newSchedule) {
  mutate(
    endpoints.key + endpoints.list,
    (currentSchedules) => {
      const newId = Math.max(...currentSchedules.data.map((s) => s.scheduleId)) + 1 || 1;
      const addedSchedule = { scheduleId: newId, ...newSchedule };
      return {
        ...currentSchedules,
        data: [...currentSchedules.data, addedSchedule]
      };
    },
    false
  );
}

export async function updateSchedule(scheduleId, updatedSchedule) {
  mutate(
    endpoints.key + endpoints.list,
    (currentSchedules) => {
      const updatedSchedules = currentSchedules.data.map((schedule) =>
        schedule.scheduleId === scheduleId ? { ...schedule, ...updatedSchedule } : schedule
      );
      return {
        ...currentSchedules,
        data: updatedSchedules
      };
    },
    false
  );
}

export async function deleteSchedule(scheduleId) {
  mutate(
    endpoints.key + endpoints.list,
    (currentSchedules) => {
      const remainingSchedules = currentSchedules.data.filter((schedule) => schedule.scheduleId !== scheduleId);
      return {
        ...currentSchedules,
        data: remainingSchedules
      };
    },
    false
  );
}
