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
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';

// third-party
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project imports
import { openSnackbar } from 'api/snackbar';
import { insertPricing, updatePricing, useGetDistanceRange, useGetWeeightRange } from 'api/pricing';

// assets
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

// constant
const getInitialValues = (pricing) => {
  const newPricing = {
    distanceRangeId: '',
    weightRangeId: '',
    basePrice: ''
  };

  if (pricing) {
    return { ...newPricing, ...pricing };
  }

  return newPricing;
};

const FormPricingAdd = ({ pricing, closeModal, onSuccess, refetch }) => {
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu từ API cho distanceRange và weightRange
  const { distanceRanges, isLoading: distanceLoading } = useGetDistanceRange();
  const { weightRanges, isLoading: weightLoading } = useGetWeeightRange();

  useEffect(() => {
    setLoading(false);
  }, []);

  const PricingSchema = Yup.object().shape({
    distanceRangeId: Yup.number().required('Distance Range ID is required').min(1, 'Invalid ID'),
    weightRangeId: Yup.number().required('Weight Range ID is required').min(1, 'Invalid ID'),
    basePrice: Yup.number().required('Base Price is required').min(0, 'Base Price must be positive')
  });

  const formik = useFormik({
    initialValues: getInitialValues(pricing),
    validationSchema: PricingSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const isChanged =
          values.distanceRangeId !== pricing?.distanceRangeId ||
          values.weightRangeId !== pricing?.weightRangeId ||
          values.basePrice !== pricing?.basePrice;

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

        let newPricing = {
          distanceRangeId: values.distanceRangeId,
          weightRangeId: values.weightRangeId,
          basePrice: values.basePrice
        };

        if (pricing && pricing.pricingId) {
          await updatePricing(pricing.pricingId, newPricing);
        } else {
          await insertPricing(newPricing);
        }

        openSnackbar({
          open: true,
          message: pricing ? 'Pricing updated successfully.' : 'Pricing added successfully.',
          variant: 'alert',
          alert: { color: 'success' }
        });
        refetch();
        setSubmitting(false);
        closeModal();

        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        setSubmitting(false);
        openSnackbar({
          open: true,
          message: 'Failed to process the request. Please try again.',
          variant: 'alert',
          alert: { color: 'error' }
        });
        console.error(error);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  if (loading || distanceLoading || weightLoading) {
    return (
      <Box sx={{ p: 5 }}>
        <CircularWithPath />
      </Box>
    );
  }

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <DialogTitle>{pricing ? 'Cập nhật bản giá' : 'Tạo mới bảng giá'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 2.5 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <InputLabel htmlFor="pricing-distanceRangeId">Khoảng cách</InputLabel>
              <FormControl fullWidth error={Boolean(touched.distanceRangeId && errors.distanceRangeId)}>
                <Select id="distanceRangeId" {...getFieldProps('distanceRangeId')} displayEmpty>
                  <MenuItem value="">Chọn khoảng cách</MenuItem> {/* Mục chọn mặc định */}
                  {distanceRanges?.map((range) => (
                    <MenuItem key={range.distanceRangeId} value={range.distanceRangeId}>
                      {`${range.minKm} - ${range.maxKm} km`}
                    </MenuItem>
                  ))}
                </Select>
                {touched.distanceRangeId && errors.distanceRangeId && <div>{errors.distanceRangeId}</div>}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel htmlFor="pricing-weightRangeId">Trọng tải</InputLabel>
              <FormControl fullWidth error={Boolean(touched.weightRangeId && errors.weightRangeId)}>
                <Select id="weightRangeId" {...getFieldProps('weightRangeId')} displayEmpty>
                  <MenuItem value="">Chọn trọng tải</MenuItem> {/* Mục chọn mặc định */}
                  {weightRanges?.map((range) => (
                    <MenuItem key={range.weightRangeId} value={range.weightRangeId}>
                      {`${range.minWeight} - ${range.maxWeight} kg`}
                    </MenuItem>
                  ))}
                </Select>

                {touched.weightRangeId && errors.weightRangeId && <div>{errors.weightRangeId}</div>}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <InputLabel htmlFor="pricing-basePrice">Giá</InputLabel>
              <TextField
                fullWidth
                id="pricing-basePrice"
                type="number"
                placeholder="Enter Base Price"
                {...getFieldProps('basePrice')}
                error={Boolean(touched.basePrice && errors.basePrice)}
                helperText={touched.basePrice && errors.basePrice}
              />
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
                {pricing ? 'Cập nhật' : 'Thêm'}
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Form>
    </FormikProvider>
  );
};

FormPricingAdd.propTypes = {
  pricing: PropTypes.object,
  closeModal: PropTypes.func,
  onSuccess: PropTypes.func
};

export default FormPricingAdd;
