import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// utils
import { fetcher, fetcherPost, fetcherPut, fetcherDelete } from 'utils/axios';
import { API_BASE_URL } from 'constants';

const initialState = {
  modal: false
};

export const endpoints = {
  key: '/api/bookingType',
  list: '', // Get all booking types
  type: '/' // Get specific booking type by ID
};

export function useGetAllBookingTypes(page = 0, size = 10) {
  const url = `${API_BASE_URL}${endpoints.key}?page=${page}&size=${size}`;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      bookingTypes: data?.data?.content,
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      bookingTypesLoading: isLoading,
      bookingTypesError: error,
      bookingTypesValidating: isValidating,
      bookingTypesEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );
  return memoizedValue;
}

export function useGetBookingType(bookingTypeId) {
  const url = bookingTypeId ? `${API_BASE_URL}${endpoints.key}/${bookingTypeId}` : null;

  const { data, isLoading, error } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetch = () => mutate(url);

  const memoizedValue = useMemo(
    () => ({
      bookingType: data?.data,
      bookingTypeLoading: isLoading,
      bookingTypeError: error,
      refetch
    }),
    [data, error, isLoading]
  );
  return memoizedValue;
}

export async function createBookingType(newBookingType) {
  try {
    const response = await fetcherPost([API_BASE_URL + endpoints.key, newBookingType]);

    // Refetch all booking type lists after creation
    mutate((key) => key.startsWith(`${API_BASE_URL}${endpoints.key}`));

    return response;
  } catch (error) {
    console.error('Error creating booking type:', error);
  }
}

export async function updateBookingType(bookingTypeId, updatedBookingType) {
  if (!bookingTypeId) {
    console.error('Booking Type ID is undefined');
    return;
  }

  try {
    const response = await fetcherPut([API_BASE_URL + endpoints.key + '/' + bookingTypeId, updatedBookingType]);

    // Refetch all booking type lists after update
    mutate((key) => key.startsWith(`${API_BASE_URL}${endpoints.key}`));

    return response;
  } catch (error) {
    console.error('Error updating booking type:', error);
  }
}

export async function deleteBookingType(bookingTypeId) {
  try {
    const response = await fetcherDelete(API_BASE_URL + endpoints.key + '/' + bookingTypeId);

    // Refetch all booking type lists after deletion
    mutate((key) => key.startsWith(`${API_BASE_URL}${endpoints.key}`));

    return response;
  } catch (error) {
    console.error('Error deleting booking type:', error);
  }
}

export function useGetBookingTypeModal() {
  const { data, isLoading } = useSWR(endpoints.key + '/modal', () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      bookingTypeModal: data,
      bookingTypeModalLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handleBookingTypeModalDialog(modal) {
  // to update local state based on key
  mutate(
    endpoints.key + '/modal',
    (currentBookingTypeModal) => {
      return { ...currentBookingTypeModal, modal };
    },
    false
  );
}
