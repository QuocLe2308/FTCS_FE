import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'utils/axios';
import { API_BASE_URL } from 'constants';

export const endpoints = {
  key: '/api/tripBookings',
  list: '/all',
  insert: '/create',
  update: '/update',
  delete: '/delete',
  getByAccountId: '/getByAccountId'
};

export function useGetTripBookings(page = 0, size = 10) {
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
      tripBookings: data?.data?.content || [], // Access the content array from Page object
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      tripBookingsLoading: isLoading,
      tripBookingsError: error,
      tripBookingsValidating: isValidating,
      tripBookingsEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetTripBookingsByAccountId(accountId, page = 0, size = 10) {
  const url = accountId ? `${API_BASE_URL}${endpoints.key}${endpoints.getByAccountId}/${accountId}?page=${page}&size=${size}` : null;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      tripBookings: data?.data?.content || [],
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      tripBookingsLoading: isLoading,
      tripBookingsError: error,
      tripBookingsValidating: isValidating,
      tripBookingsEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );
  return memoizedValue;
}

export async function insertTripBooking(newTripBooking) {
  mutate(
    endpoints.key + endpoints.list,
    (currentTripBookings) => {
      const newId = Math.max(...currentTripBookings.data.map((t) => t.bookingId)) + 1 || 1;
      const addedTripBooking = { bookingId: newId, ...newTripBooking };
      return {
        ...currentTripBookings,
        data: [...currentTripBookings.data, addedTripBooking]
      };
    },
    false
  );
}

export async function updateTripBooking(bookingId, updatedTripBooking) {
  mutate(
    endpoints.key + endpoints.list,
    (currentTripBookings) => {
      const updatedTripBookings = currentTripBookings.data.map((tripBooking) =>
        tripBooking.bookingId === bookingId ? { ...tripBooking, ...updatedTripBooking } : tripBooking
      );
      return {
        ...currentTripBookings,
        data: updatedTripBookings
      };
    },
    false
  );
}

export async function deleteTripBooking(bookingId) {
  mutate(
    endpoints.key + endpoints.list,
    (currentTripBookings) => {
      const remainingTripBookings = currentTripBookings.data.filter((tripBooking) => tripBooking.bookingId !== bookingId);
      return {
        ...currentTripBookings,
        data: remainingTripBookings
      };
    },
    false
  );
}
