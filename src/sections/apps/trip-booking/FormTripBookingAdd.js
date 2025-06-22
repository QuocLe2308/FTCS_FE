import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
  MenuItem,
  ListItemText,
  FormHelperText
} from '@mui/material';
import { useFormik, Form, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import IconButton from 'components/@extended/IconButton';
import { openSnackbar } from 'api/snackbar';
import { insertTripBooking, updateTripBooking } from 'api/tripBookings';
import AlertTripBookingDelete from './AlertTripBookingDelete';
import { DeleteFilled } from '@ant-design/icons';

const getInitialValues = (tripBooking) => {
  const newTripBooking = {
    accountId: 0,
    tripAgreementId: null,
    bookingType: 'Round-trip',
    bookingDate: new Date(),
    pickupLocation: '',
    dropoffLocation: '',
    startLocationAddress: '',
    endLocationAddress: '',
    capacity: 0,
    status: 'ARRANGING_DRIVER',
    paymentMethod: 'ONLINE_PAYMENT',
    expirationDate: new Date(),
    totalDistance: 0,
    price: 0,
    notes: ''
  };

  return tripBooking ? { ...newTripBooking, ...tripBooking } : newTripBooking;
};

const statusOptions = ['ARRANGING_DRIVER', 'DRIVER_ON_THE_WAY', 'DELIVERED', 'ORDER_COMPLETED', 'CANCELLED'];
const paymentMethodOptions = ['ONLINE_PAYMENT', 'CASH'];
const bookingTypeOptions = ['One-way', 'Round-trip'];

const FormTripBookingAdd = ({ tripBooking, closeModal }) => {
  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    closeModal();
  };

  const TripBookingSchema = Yup.object().shape({
    accountId: Yup.number().required('Account ID is required'),
    startLocationAddress: Yup.string().required('Start Location Address is required'),
    endLocationAddress: Yup.string().required('End Location Address is required'),
    bookingDate: Yup.date().required('Booking Date is required'),
    expirationDate: Yup.date()
      .required('Expiration Date is required')
      .min(Yup.ref('bookingDate'), 'Expiration Date must be after Booking Date'),
    capacity: Yup.number().min(0, 'Capacity must be non-negative'),
    status: Yup.string().required('Status is required'),
    paymentMethod: Yup.string().required('Payment Method is required'),
    bookingType: Yup.string().required('Booking Type is required')
  });

  const formik = useFormik({
    initialValues: getInitialValues(tripBooking),
    validationSchema: TripBookingSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const action = tripBooking ? updateTripBooking(tripBooking.bookingId, values) : insertTripBooking(values);
        await action.then(() => {
          openSnackbar({
            open: true,
            message: tripBooking ? 'Trip Booking updated successfully.' : 'Trip Booking added successfully.',
            variant: 'alert',
            alert: { color: 'success' }
          });
          setSubmitting(false);
          closeModal();
        });
      } catch (error) {
        console.error('Error submitting trip booking:', error);
        openSnackbar({
          open: true,
          message: 'Failed to save trip booking. Please try again.',
          variant: 'alert',
          alert: { color: 'error' }
        });
        setSubmitting(false);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

  return (
    <FormikProvider value={formik}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <DialogTitle>{tripBooking ? 'Edit Trip Booking' : 'New Trip Booking'}</DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 2.5 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="tripBooking-accountId">Account ID</InputLabel>
                  <TextField
                    fullWidth
                    id="tripBooking-accountId"
                    type="number"
                    {...getFieldProps('accountId')}
                    error={Boolean(touched.accountId && errors.accountId)}
                    helperText={touched.accountId && errors.accountId}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="tripBooking-tripAgreementId">Trip Agreement ID</InputLabel>
                  <TextField
                    fullWidth
                    id="tripBooking-tripAgreementId"
                    type="number"
                    {...getFieldProps('tripAgreementId')}
                    error={Boolean(touched.tripAgreementId && errors.tripAgreementId)}
                    helperText={touched.tripAgreementId && errors.tripAgreementId}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="tripBooking-bookingType">Booking Type</InputLabel>
                  <FormControl fullWidth>
                    <Select
                      id="tripBooking-bookingType"
                      {...getFieldProps('bookingType')}
                      onChange={(event) => setFieldValue('bookingType', event.target.value)}
                      input={<OutlinedInput />}
                      renderValue={(selected) => <Typography>{selected}</Typography>}
                    >
                      {bookingTypeOptions.map((type) => (
                        <MenuItem key={type} value={type}>
                          <ListItemText primary={type} />
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.bookingType && errors.bookingType && <FormHelperText error>{errors.bookingType}</FormHelperText>}
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="tripBooking-status">Status</InputLabel>
                  <FormControl fullWidth>
                    <Select
                      id="tripBooking-status"
                      {...getFieldProps('status')}
                      onChange={(event) => setFieldValue('status', event.target.value)}
                      input={<OutlinedInput />}
                      renderValue={(selected) => <Typography>{selected}</Typography>}
                    >
                      {statusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                          <ListItemText primary={status} />
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.status && errors.status && <FormHelperText error>{errors.status}</FormHelperText>}
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="tripBooking-startLocationAddress">Start Location Address</InputLabel>
                  <TextField
                    fullWidth
                    id="tripBooking-startLocationAddress"
                    multiline
                    rows={2}
                    {...getFieldProps('startLocationAddress')}
                    error={Boolean(touched.startLocationAddress && errors.startLocationAddress)}
                    helperText={touched.startLocationAddress && errors.startLocationAddress}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="tripBooking-endLocationAddress">End Location Address</InputLabel>
                  <TextField
                    fullWidth
                    id="tripBooking-endLocationAddress"
                    multiline
                    rows={2}
                    {...getFieldProps('endLocationAddress')}
                    error={Boolean(touched.endLocationAddress && errors.endLocationAddress)}
                    helperText={touched.endLocationAddress && errors.endLocationAddress}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="tripBooking-bookingDate">Booking Date</InputLabel>
                  <DateTimePicker
                    value={formik.values.bookingDate}
                    onChange={(value) => setFieldValue('bookingDate', value)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: Boolean(touched.bookingDate && errors.bookingDate),
                        helperText: touched.bookingDate && errors.bookingDate
                      }
                    }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="tripBooking-expirationDate">Expiration Date</InputLabel>
                  <DateTimePicker
                    value={formik.values.expirationDate}
                    onChange={(value) => setFieldValue('expirationDate', value)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: Boolean(touched.expirationDate && errors.expirationDate),
                        helperText: touched.expirationDate && errors.expirationDate
                      }
                    }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="tripBooking-capacity">Capacity</InputLabel>
                  <TextField
                    fullWidth
                    id="tripBooking-capacity"
                    type="number"
                    {...getFieldProps('capacity')}
                    error={Boolean(touched.capacity && errors.capacity)}
                    helperText={touched.capacity && errors.capacity}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="tripBooking-paymentMethod">Payment Method</InputLabel>
                  <FormControl fullWidth>
                    <Select
                      id="tripBooking-paymentMethod"
                      {...getFieldProps('paymentMethod')}
                      onChange={(event) => setFieldValue('paymentMethod', event.target.value)}
                      input={<OutlinedInput />}
                      renderValue={(selected) => <Typography>{selected}</Typography>}
                    >
                      {paymentMethodOptions.map((method) => (
                        <MenuItem key={method} value={method}>
                          <ListItemText primary={method} />
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.paymentMethod && errors.paymentMethod && <FormHelperText error>{errors.paymentMethod}</FormHelperText>}
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="tripBooking-notes">Notes</InputLabel>
                  <TextField
                    fullWidth
                    id="tripBooking-notes"
                    multiline
                    rows={2}
                    {...getFieldProps('notes')}
                    error={Boolean(touched.notes && errors.notes)}
                    helperText={touched.notes && errors.notes}
                  />
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                {tripBooking && (
                  <IconButton onClick={() => setOpenAlert(true)} size="large" color="error">
                    <DeleteFilled />
                  </IconButton>
                )}
              </Grid>
              <Grid item>
                <Stack direction="row" spacing={2}>
                  <Button color="error" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {tripBooking ? 'Edit' : 'Add'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </DialogActions>
        </Form>
      </LocalizationProvider>
      {tripBooking && (
        <AlertTripBookingDelete id={tripBooking.bookingId} title={tripBooking.bookingId} open={openAlert} handleClose={handleAlertClose} />
      )}
    </FormikProvider>
  );
};

FormTripBookingAdd.propTypes = {
  tripBooking: PropTypes.object,
  closeModal: PropTypes.func
};

export default FormTripBookingAdd;
