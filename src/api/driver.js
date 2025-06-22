import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// utils
import { fetcher, fetcherPut } from 'utils/axios';
import { API_BASE_URL } from 'constants';

const initialState = {
  modal: false
};

export const endpoints = {
  //key: 'api/customer',
  key: '/api/driver',
  registerDriver: '/api/registerDriver', // server URL
  identification: 'identification', // server URL
  status: '/status', // server URL
  license: 'license', // server URL
  vehicle: 'vehicle', // server URL
  overview: '/api/overview' // server URL
};

export function useGetDriver() {
  const { data, isLoading, error, isValidating } = useSWR(API_BASE_URL + endpoints.key, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetchDrivers = () => mutate(API_BASE_URL + endpoints.key);

  return useMemo(
    () => ({
      drivers: data?.data,
      driversLoading: isLoading,
      driversError: error,
      driversValidating: isValidating,
      driversEmpty: !isLoading && !data?.length,
      refetch: refetchDrivers
    }),
    [data, error, isLoading, isValidating, refetchDrivers]
  );
}

export async function updateStatus(driverIdentificationId, status) {
  if (!driverIdentificationId) {
    console.error('Driver Identification ID is undefined');
    return;
  }

  const updatedStatus = { status };

  try {
    // Make the PUT request to update the driver's status
    const response = await fetcherPut([
      API_BASE_URL + endpoints.registerDriver + '/' + endpoints.identification + endpoints.status + '/' + driverIdentificationId,
      updatedStatus
    ]);

    // Mutate the cache to update the list of drivers if necessary (or any other relevant cache)
    mutate(endpoints.key); // This can be more specific if you want to target a specific endpoint

    console.log('Driver status updated successfully:', response);
    return response;
  } catch (error) {
    console.error('Error updating driver status:', error);
  }
}

// Function to update status for Vehicle
export async function updateVehicleStatus(vehicleId, status) {
  if (!vehicleId) {
    console.error('Vehicle ID is undefined');
    return;
  }

  const updatedStatus = { status };

  try {
    // Make the PUT request to update the vehicle's status
    const response = await fetcherPut([
      API_BASE_URL + endpoints.registerDriver + '/' + endpoints.vehicle + endpoints.status + '/' + vehicleId,
      updatedStatus
    ]);

    // Mutate the cache to update the list of vehicles if necessary
    mutate(endpoints.key); // This can be more specific if you want to target a specific endpoint

    console.log('Vehicle status updated successfully:', response);
    return response;
  } catch (error) {
    console.error('Error updating vehicle status:', error);
  }
}

// Function to update status for License
export async function updateLicenseStatus(licenseId, status) {
  if (!licenseId) {
    console.error('License ID is undefined');
    return;
  }

  const updatedStatus = { status };

  try {
    // Make the PUT request to update the license's status
    const response = await fetcherPut([
      API_BASE_URL + endpoints.registerDriver + '/' + endpoints.license + endpoints.status + '/' + licenseId,
      updatedStatus
    ]);

    // Mutate the cache to update the list of licenses if necessary
    mutate(endpoints.key); // This can be more specific if you want to target a specific endpoint

    console.log('License status updated successfully:', response);
    return response;
  } catch (error) {
    console.error('Error updating license status:', error);
  }
}

export async function insertCustomer(newCustomer) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentCustomer) => {
      newCustomer.id = currentCustomer.customers.length + 1;
      const addedCustomer = [...currentCustomer.customers, newCustomer];

      return {
        ...currentCustomer,
        customers: addedCustomer
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { newCustomer };
  //   await axios.post(endpoints.key + endpoints.insert, data);
}

export async function updateCustomer(customerId, updatedCustomer) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentCustomer) => {
      const newCustomer = currentCustomer.customers.map((customer) =>
        customer.id === customerId ? { ...customer, ...updatedCustomer } : customer
      );

      return {
        ...currentCustomer,
        customers: newCustomer
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { list: updatedCustomer };
  //   await axios.post(endpoints.key + endpoints.update, data);
}

export async function deleteCustomer(customerId) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentCustomer) => {
      const nonDeletedCustomer = currentCustomer.customers.filter((customer) => customer.id !== customerId);

      return {
        ...currentCustomer,
        customers: nonDeletedCustomer
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { customerId };
  //   await axios.post(endpoints.key + endpoints.delete, data);
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
    (currentCustomermaster) => {
      return { ...currentCustomermaster, modal };
    },
    false
  );
}

export function useGetOverview() {
  const { data, isLoading, error, isValidating } = useSWR(API_BASE_URL + endpoints.overview, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const refetchOverview = () => mutate(API_BASE_URL + endpoints.overview);

  return useMemo(
    () => ({
      overview: data?.data,
      overviewLoading: isLoading,
      overviewError: error,
      overviewValidating: isValidating,
      overviewEmpty: !isLoading && !data?.length,
      refetch: refetchOverview
    }),
    [data, error, isLoading, isValidating, refetchOverview]
  );
}
