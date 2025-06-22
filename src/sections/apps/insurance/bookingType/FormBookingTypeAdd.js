import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import { Box, Button, DialogActions, DialogContent, DialogTitle, Divider, Grid, InputLabel, OutlinedInput, Stack } from '@mui/material';

// third-party
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project-imports
import { openSnackbar } from 'api/snackbar';
import { createBookingType, updateBookingType } from 'api/bookingType';

// assets
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

// constant
const getInitialValues = (bookingTypeData) => {
  const newBookingType = {
    bookingTypeName: ''
  };

  if (bookingTypeData) {
    return { ...newBookingType, ...bookingTypeData };
  }

  return newBookingType;
};

const FormBookingTypeAdd = ({ bookingTypeData, closeModal, onSuccess, refetch }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [bookingTypeData]);

  const BookingTypeSchema = Yup.object().shape({
    bookingTypeName: Yup.string().required('Booking type name is required')
  });

  const formik = useFormik({
    initialValues: getInitialValues(bookingTypeData),
    validationSchema: BookingTypeSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Check for changes if updating
        if (bookingTypeData && bookingTypeData.bookingTypeId) {
          // Compare with the original values
          const isChanged = values.bookingTypeName !== bookingTypeData.bookingTypeName;

          if (!isChanged) {
            openSnackbar({
              open: true,
              message: 'No changes detected. No update needed.',
              variant: 'alert',
              alert: { color: 'info' }
            });
            setSubmitting(false);
            closeModal();
            return;
          }
        }

        // Create a payload for the API
        const payload = {
          bookingTypeName: values.bookingTypeName
        };

        if (bookingTypeData && bookingTypeData.bookingTypeId) {
          // For update operation
          await updateBookingType(bookingTypeData.bookingTypeId, payload);
          openSnackbar({
            open: true,
            message: 'Booking type updated successfully.',
            variant: 'alert',
            alert: { color: 'success' }
          });
        } else {
          // For create operation
          await createBookingType(payload);
          openSnackbar({
            open: true,
            message: 'Booking type added successfully.',
            variant: 'alert',
            alert: { color: 'success' }
          });
        }

        refetch();
        setSubmitting(false);
        closeModal();

        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error('Error submitting booking type:', error);
        openSnackbar({
          open: true,
          message: 'Failed to process the request. Please try again.',
          variant: 'alert',
          alert: { color: 'error' }
        });
        setSubmitting(false);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  if (loading) {
    return (
      <Box sx={{ p: 5 }}>
        <CircularWithPath />
      </Box>
    );
  }

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <DialogTitle>{bookingTypeData ? 'Cập nhật loại chuyến' : 'Tạo loại chuyến'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 2.5 }}>
          <Grid container spacing={3}>
            {/* Booking Type Name */}
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="bookingTypeName">Tên loại chuyến</InputLabel>
                <OutlinedInput
                  id="bookingTypeName"
                  placeholder="Enter booking type name"
                  fullWidth
                  {...getFieldProps('bookingTypeName')}
                  error={Boolean(touched.bookingTypeName && errors.bookingTypeName)}
                />
                {touched.bookingTypeName && errors.bookingTypeName && <div style={{ color: 'red' }}>{errors.bookingTypeName}</div>}
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5 }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Button color="error" onClick={closeModal}>
                Hủy
              </Button>
            </Grid>
            <Grid item>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {bookingTypeData ? 'Cập nhật' : 'Thêm'}
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Form>
    </FormikProvider>
  );
};

FormBookingTypeAdd.propTypes = {
  bookingTypeData: PropTypes.object,
  closeModal: PropTypes.func,
  onSuccess: PropTypes.func,
  refetch: PropTypes.func
};

export default FormBookingTypeAdd;
