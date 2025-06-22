import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack
} from '@mui/material';

// third-party
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project-imports
import { openSnackbar } from 'api/snackbar';
import { createInsurancePolicy, updateInsurancePolicy } from 'api/insurance';
import { useGetAllBookingTypes } from 'api/bookingType';

// assets
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

// constant
const getInitialValues = (policyData) => {
  const newPolicy = {
    name: '',
    description: '',
    coverageDetails: '',
    bookingType: '',
    premiumPercentage: 0,
    compensationPercentage: 0
  };

  if (policyData) {
    return { ...newPolicy, ...policyData };
  }

  return newPolicy;
};

const FormInsurancePolicyAdd = ({ policyData, closeModal, onSuccess, refetch }) => {
  const [loading, setLoading] = useState(true);

  // Fetch booking types
  const { bookingTypes, bookingTypesLoading } = useGetAllBookingTypes(0, 100); // Get a large number to ensure we get all types

  useEffect(() => {
    setLoading(false);
  }, [policyData]);

  const PolicySchema = Yup.object().shape({
    name: Yup.string().required('Policy name is required'),
    description: Yup.string().required('Description is required'),
    coverageDetails: Yup.string().required('Coverage details are required'),
    bookingType: Yup.number().required('Booking type is required'),
    premiumPercentage: Yup.number()
      .required('Premium percentage is required')
      .min(0, 'Must be non-negative')
      .max(100, 'Cannot exceed 100%'),
    compensationPercentage: Yup.number()
      .required('Compensation percentage is required')
      .min(0, 'Must be non-negative')
      .max(100, 'Cannot exceed 100%')
  });

  const formik = useFormik({
    initialValues: getInitialValues(policyData),
    validationSchema: PolicySchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Check for changes if updating
        if (policyData && policyData.policyId) {
          // Compare with the original values
          const isChanged =
            values.name !== policyData.name ||
            values.description !== policyData.description ||
            values.coverageDetails !== policyData.coverageDetails ||
            values.bookingType !== policyData.bookingType ||
            values.premiumPercentage !== policyData.premiumPercentage ||
            values.compensationPercentage !== policyData.compensationPercentage;

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
          name: values.name,
          description: values.description,
          coverageDetails: values.coverageDetails,
          bookingType: values.bookingType,
          premiumPercentage: values.premiumPercentage,
          compensationPercentage: values.compensationPercentage
        };

        if (policyData && policyData.policyId) {
          // For update operation
          await updateInsurancePolicy(policyData.policyId, payload);
          openSnackbar({
            open: true,
            message: 'Insurance policy updated successfully.',
            variant: 'alert',
            alert: { color: 'success' }
          });
        } else {
          // For create operation
          await createInsurancePolicy(payload);
          openSnackbar({
            open: true,
            message: 'Insurance policy added successfully.',
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
        console.error('Error submitting insurance policy:', error);
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

  if (loading || bookingTypesLoading) {
    return (
      <Box sx={{ p: 5 }}>
        <CircularWithPath />
      </Box>
    );
  }

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <DialogTitle>{policyData ? 'Cập nhật hợp đồng bảo hiểm' : 'Thêm hợp đồng bảo hiểm'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 2.5 }}>
          <Grid container spacing={3}>
            {/* Policy Name */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="name">Tên hàng hóa</InputLabel>
                <OutlinedInput
                  id="name"
                  placeholder="Enter policy name"
                  fullWidth
                  {...getFieldProps('name')}
                  error={Boolean(touched.name && errors.name)}
                />
                {touched.name && errors.name && <div style={{ color: 'red' }}>{errors.name}</div>}
              </Stack>
            </Grid>

            {/* Description */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="description">Tên bảo hiểm</InputLabel>
                <OutlinedInput
                  id="description"
                  placeholder="Enter description"
                  fullWidth
                  {...getFieldProps('description')}
                  error={Boolean(touched.description && errors.description)}
                />
                {touched.description && errors.description && <div style={{ color: 'red' }}>{errors.description}</div>}
              </Stack>
            </Grid>

            {/* Coverage Details */}
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="coverageDetails">Mô tả chi tiết</InputLabel>
                <OutlinedInput
                  id="coverageDetails"
                  placeholder="Enter coverage details"
                  fullWidth
                  multiline
                  rows={3}
                  {...getFieldProps('coverageDetails')}
                  error={Boolean(touched.coverageDetails && errors.coverageDetails)}
                />
                {touched.coverageDetails && errors.coverageDetails && <div style={{ color: 'red' }}>{errors.coverageDetails}</div>}
              </Stack>
            </Grid>

            {/* Booking Type */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel htmlFor="bookingType">Loại chuyến</InputLabel>
                <Select
                  id="bookingType"
                  fullWidth
                  {...getFieldProps('bookingType')}
                  error={Boolean(touched.bookingType && errors.bookingType)}
                >
                  {bookingTypes &&
                    bookingTypes.map((type) => (
                      <MenuItem key={type.bookingTypeId} value={type.bookingTypeId}>
                        {type.bookingTypeName}
                      </MenuItem>
                    ))}
                </Select>
                {touched.bookingType && errors.bookingType && <div style={{ color: 'red' }}>{errors.bookingType}</div>}
              </Stack>
            </Grid>

            {/* Premium Percentage */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel htmlFor="premiumPercentage">Phần trăm phí bảo hiểm</InputLabel>
                <OutlinedInput
                  id="premiumPercentage"
                  type="number"
                  placeholder="Enter premium percentage"
                  fullWidth
                  endAdornment={<InputAdornment position="end">%</InputAdornment>}
                  {...getFieldProps('premiumPercentage')}
                  error={Boolean(touched.premiumPercentage && errors.premiumPercentage)}
                />
                {touched.premiumPercentage && errors.premiumPercentage && <div style={{ color: 'red' }}>{errors.premiumPercentage}</div>}
              </Stack>
            </Grid>

            {/* Compensation Percentage */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel htmlFor="compensationPercentage">Tỷ lệ bồi thường</InputLabel>
                <OutlinedInput
                  id="compensationPercentage"
                  type="number"
                  placeholder="Enter compensation percentage"
                  fullWidth
                  endAdornment={<InputAdornment position="end">%</InputAdornment>}
                  {...getFieldProps('compensationPercentage')}
                  error={Boolean(touched.compensationPercentage && errors.compensationPercentage)}
                />
                {touched.compensationPercentage && errors.compensationPercentage && (
                  <div style={{ color: 'red' }}>{errors.compensationPercentage}</div>
                )}
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
                {policyData ? 'Cập nhật' : 'Thêm'}
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Form>
    </FormikProvider>
  );
};

FormInsurancePolicyAdd.propTypes = {
  policyData: PropTypes.object,
  closeModal: PropTypes.func,
  onSuccess: PropTypes.func,
  refetch: PropTypes.func
};

export default FormInsurancePolicyAdd;
