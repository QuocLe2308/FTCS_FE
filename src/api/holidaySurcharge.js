import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// utils
import { fetcher, fetcherDelete, fetcherPost, fetcherPut } from 'utils/axios';
import { API_BASE_URL } from 'constants';

const initialState = {
  modal: false
};

export const endpoints = {
  key: '/api/holidaySurcharge',
  status: '/status',
  list: '/list', // server URL
  modal: '/modal', // server URL
  insert: '/insert', // server URL
  update: '/update', // server URL
  delete: '/delete' // server URL
};

export function useGetHolidaySurcharge(page = 0, size = 10) {
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
      holidaySurcharges: data?.data?.content, // Access the content array from Page object
      totalPages: data?.data?.totalPages,
      totalElements: data?.data?.totalElements,
      currentPage: data?.data?.number,
      holidaySurchargesLoading: isLoading,
      holidaySurchargesError: error,
      holidaySurchargesValidating: isValidating,
      holidaySurchargesEmpty: !isLoading && (!data?.data?.content || data.data.content.length === 0),
      refetch
    }),
    [data, error, isLoading, isValidating]
  );
  return memoizedValue;
}

// export async function insertHolidaySurchage(newHolidaySurchage) {
//   // to update local state based on key
//   mutate(
//     endpoints.key + endpoints.list,
//     (currentHolidaySurchage) => {
//       newHolidaySurchage.id = currentHolidaySurchage.holidaySurchages.length + 1;
//       const addedHolidaySurchage = [...currentHolidaySurchage.holidaySurchages, newHolidaySurchage];

//       return {
//         ...currentHolidaySurchage,
//         holidaySurchages: addedHolidaySurchage
//       };
//     },
//     false
//   );

//   // to hit server
//   // you may need to refetch latest data after server hit and based on your logic
//   //   const data = { newCustomer };
//   //   await axios.post(endpoints.key + endpoints.insert, data);
// }

// export async function updateHolidaySurchage(holidaySurchageId, updatedHolidaySurchage) {
//   // to update local state based on key
//   mutate(
//     endpoints.key + endpoints.list,
//     (currentHolidaySurchage) => {
//       const newHolidaySurchage = currentHolidaySurchage.holidaySurchages.map((holidaySurchage) =>
//         holidaySurchage.id === holidaySurchageId ? { ...holidaySurchage, ...updatedHolidaySurchage } : holidaySurchage
//       );

//       return {
//         ...currentHolidaySurchage,
//         holidaySurchages: newHolidaySurchage
//       };
//     },
//     false
//   );

//   // to hit server
//   // you may need to refetch latest data after server hit and based on your logic
//   //   const data = { list: updatedCustomer };
//   //   await axios.post(endpoints.key + endpoints.update, data);
// }

// export async function deleteHolidaySurchage(holidaySurchageId) {
//   // to update local state based on key
//   mutate(
//     endpoints.key + endpoints.list,
//     (currentHolidaySurchage) => {
//       const nonDeletedHolidaySurchage = currentHolidaySurchage.holidaySurchages.filter(
//         (holidaySurchage) => holidaySurchage.id !== holidaySurchageId
//       );
//       return {
//         ...currentHolidaySurchage,
//         holidaySurchages: nonDeletedHolidaySurchage
//       };
//     },
//     false
//   );

// to hit server
// you may need to refetch latest data after server hit and based on your logic
//   const data = { customerId };
//   await axios.post(endpoints.key + endpoints.delete, data);
// }

export async function deleteHolidaySurchage(holidaySurchageId) {
  try {
    const response = await fetcherDelete([API_BASE_URL + endpoints.key + '/' + holidaySurchageId, { id: holidaySurchageId }]);
    mutate(endpoints.key); // Cập nhật lại danh sách sau khi xóa
    console.log(response);
    return response;
  } catch (error) {
    console.error('Error deleting holiday surcharge:', error);
  }
}

export async function insertHolidaySurchage(newHolidaySurchage) {
  try {
    const response = await fetcherPost([API_BASE_URL + endpoints.key, newHolidaySurchage]);
    mutate(endpoints.key);
    console.log(response);
    return response;
  } catch (error) {
    console.error('Error inserting holiday surcharge:', error);
  }
}

export async function updateHolidaySurchage(holidaySurchageId, updatedHolidaySurchage) {
  if (!holidaySurchageId) {
    console.error('Holiday surcharge ID is undefined');
    return;
  }
  try {
    const response = await fetcherPut([API_BASE_URL + endpoints.key + '/' + holidaySurchageId, updatedHolidaySurchage]);
    mutate(endpoints.key);
    console.log(response);
    return response;
  } catch (error) {
    console.error('Error updating holiday surcharge:', error);
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
