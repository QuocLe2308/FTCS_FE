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
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  TextField
} from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project-imports
import { openSnackbar } from 'api/snackbar';
import { insertVoucher, updateVoucher } from 'api/voucher';

// assets
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

// Constants for mapping frontend display values to backend enum values
const DISCOUNT_TYPE_MAPPING = {
  PERCENTAGE: 'PERCENT', // Frontend to backend mapping
  FIXED_AMOUNT: 'FIXED_AMOUNT'
};

// Reverse mapping for when receiving data from backend
const REVERSE_DISCOUNT_TYPE_MAPPING = {
  PERCENT: 'PERCENTAGE', // Backend to frontend mapping
  FIXED_AMOUNT: 'FIXED_AMOUNT'
};

// Function to convert backend values to frontend display values when loading a voucher
const convertBackendToFrontend = (voucher) => {
  if (!voucher) return null;

  // Create a copy to avoid modifying the original
  const convertedVoucher = { ...voucher };

  // Convert discountType if needed
  if (voucher.discountType && REVERSE_DISCOUNT_TYPE_MAPPING[voucher.discountType]) {
    convertedVoucher.discountType = REVERSE_DISCOUNT_TYPE_MAPPING[voucher.discountType];
  }

  // Ensure userType is set to a default if it's not provided
  if (!convertedVoucher.userType) {
    convertedVoucher.userType = 'CUSTOMER';
  }

  return convertedVoucher;
};

// constant
const getInitialValues = (voucher) => {
  const newVoucher = {
    code: '',
    title: '',
    description: '',
    discountType: 'FIXED_AMOUNT',
    discountValue: 0,
    minOrderValue: 0,
    minKm: 0,
    maxDiscountAmount: null,
    quantity: 1,
    isFirstOrder: false,
    usageLimit: 1,
    status: 'ACTIVE',
    paymentMethod: 'ALL',
    userType: 'CUSTOMER'
  };

  if (voucher) {
    return { ...newVoucher, ...voucher };
  }

  return newVoucher;
};

const FormVoucherAdd = ({ voucher, closeModal, onSuccess, refetch }) => {
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    // Initialize dates if voucher exists
    if (voucher) {
      if (voucher.startDate) {
        setStartDate(new Date(voucher.startDate));
      }
      if (voucher.endDate) {
        setEndDate(new Date(voucher.endDate));
      }
    }
    setLoading(false);
  }, [voucher]);

  const VoucherSchema = Yup.object().shape({
    code: Yup.string().required('Voucher code is required'),
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    discountType: Yup.string().required('Discount type is required'),
    discountValue: Yup.number().required('Discount value is required').positive('Must be positive'),
    minOrderValue: Yup.number().required('Minimum order value is required').min(0, 'Must be non-negative'),
    minKm: Yup.number().required('Minimum kilometers is required').min(0, 'Must be non-negative'),
    quantity: Yup.number().required('Quantity is required').positive('Must be positive').integer('Must be an integer'),
    usageLimit: Yup.number().required('Usage limit is required').positive('Must be positive').integer('Must be an integer'),
    status: Yup.string().required('Status is required'),
    paymentMethod: Yup.string().required('Payment method is required'),
    userType: Yup.string().required('User type is required')
  });

  // Convert the voucher data before initializing the form
  const convertedVoucher = convertBackendToFrontend(voucher);

  const formik = useFormik({
    initialValues: getInitialValues(convertedVoucher),
    validationSchema: VoucherSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Check for changes if updating
        if (voucher && voucher.voucherId) {
          // Compare with the converted values from backend
          const convertedValues = convertBackendToFrontend(voucher);

          const isChanged =
            values.title !== convertedValues?.title ||
            values.description !== convertedValues?.description ||
            values.discountType !== convertedValues?.discountType ||
            values.discountValue !== convertedValues?.discountValue ||
            values.minOrderValue !== convertedValues?.minOrderValue ||
            values.minKm !== convertedValues?.minKm ||
            values.maxDiscountAmount !== convertedValues?.maxDiscountAmount ||
            values.quantity !== convertedValues?.quantity ||
            values.isFirstOrder !== convertedValues?.isFirstOrder ||
            values.usageLimit !== convertedValues?.usageLimit ||
            values.status !== convertedValues?.status ||
            values.paymentMethod !== convertedValues?.paymentMethod ||
            values.userType !== convertedValues?.userType ||
            startDate.toISOString() !== new Date(voucher.startDate).toISOString() ||
            endDate.toISOString() !== new Date(voucher.endDate).toISOString();

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

        // Map frontend display values to backend enum values
        const mappedDiscountType = DISCOUNT_TYPE_MAPPING[values.discountType] || values.discountType;

        // Create a payload with only the fields we want to send to the backend
        const voucherData = {
          title: values.title,
          description: values.description,
          discountType: mappedDiscountType,
          discountValue: values.discountValue,
          minOrderValue: values.minOrderValue,
          minKm: values.minKm,
          maxDiscountAmount: values.maxDiscountAmount,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          quantity: values.quantity,
          isFirstOrder: values.isFirstOrder,
          usageLimit: values.usageLimit,
          status: values.status,
          paymentMethod: values.paymentMethod,
          userType: values.userType
        };

        if (voucher && voucher.voucherId) {
          // For update operation
          await updateVoucher(voucher.voucherId, voucherData);
          console.log('Voucher id o day ne', voucher.voucherId);
          openSnackbar({
            open: true,
            message: 'Voucher updated successfully.',
            variant: 'alert',
            alert: { color: 'success' }
          });
        } else {
          // For create operation, include the code field
          await insertVoucher({
            ...voucherData,
            code: values.code
          });
          openSnackbar({
            open: true,
            message: 'Voucher added successfully.',
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
        console.error('Error submitting voucher:', error);
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

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, values } = formik;

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
        <DialogTitle>{voucher ? 'Cập nhật voucher' : 'Thêm Voucher'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 2.5 }}>
          <Grid container spacing={3}>
            {/* Voucher Code */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="code">Voucher Code</InputLabel>
                <OutlinedInput
                  id="code"
                  placeholder="Enter voucher code"
                  fullWidth
                  disabled={Boolean(voucher)}
                  {...getFieldProps('code')}
                  error={Boolean(touched.code && errors.code)}
                />
                {touched.code && errors.code && <div style={{ color: 'red' }}>{errors.code}</div>}
              </Stack>
            </Grid>

            {/* Title */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="title">Tiêu đề</InputLabel>
                <OutlinedInput
                  id="title"
                  placeholder="Enter voucher title"
                  fullWidth
                  {...getFieldProps('title')}
                  error={Boolean(touched.title && errors.title)}
                />
                {touched.title && errors.title && <div style={{ color: 'red' }}>{errors.title}</div>}
              </Stack>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="description">Mô tả</InputLabel>
                <OutlinedInput
                  id="description"
                  placeholder="Enter voucher description"
                  fullWidth
                  multiline
                  rows={2}
                  {...getFieldProps('description')}
                  error={Boolean(touched.description && errors.description)}
                />
                {touched.description && errors.description && <div style={{ color: 'red' }}>{errors.description}</div>}
              </Stack>
            </Grid>

            {/* Discount Type */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="discountType">Loại giảm giá</InputLabel>
                <Select
                  id="discountType"
                  fullWidth
                  {...getFieldProps('discountType')}
                  error={Boolean(touched.discountType && errors.discountType)}
                >
                  <MenuItem value="FIXED_AMOUNT">Số tiền cố định
                  </MenuItem>
                  <MenuItem value="PERCENTAGE">Phầm trăm</MenuItem>
                </Select>
                {touched.discountType && errors.discountType && <div style={{ color: 'red' }}>{errors.discountType}</div>}
              </Stack>
            </Grid>

            {/* Discount Value */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="discountValue">Giá trị chiết khấu</InputLabel>
                <OutlinedInput
                  id="discountValue"
                  type="number"
                  placeholder={values.discountType === 'PERCENTAGE' ? 'Enter percentage' : 'Enter amount'}
                  fullWidth
                  endAdornment={
                    values.discountType === 'PERCENTAGE' ? (
                      <InputAdornment position="end">%</InputAdornment>
                    ) : (
                      <InputAdornment position="end">VND</InputAdornment>
                    )
                  }
                  {...getFieldProps('discountValue')}
                  error={Boolean(touched.discountValue && errors.discountValue)}
                />
                {touched.discountValue && errors.discountValue && <div style={{ color: 'red' }}>{errors.discountValue}</div>}
              </Stack>
            </Grid>

            {/* Min Order Value */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="minOrderValue">Giá trị đặt hàng tối thiểu</InputLabel>
                <OutlinedInput
                  id="minOrderValue"
                  type="number"
                  placeholder="Enter minimum order value"
                  fullWidth
                  endAdornment={<InputAdornment position="end">VND</InputAdornment>}
                  {...getFieldProps('minOrderValue')}
                  error={Boolean(touched.minOrderValue && errors.minOrderValue)}
                />
                {touched.minOrderValue && errors.minOrderValue && <div style={{ color: 'red' }}>{errors.minOrderValue}</div>}
              </Stack>
            </Grid>

            {/* Min Km */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="minKm">Khoảng cách</InputLabel>
                <OutlinedInput
                  id="minKm"
                  type="number"
                  placeholder="Enter minimum distance"
                  fullWidth
                  endAdornment={<InputAdornment position="end">km</InputAdornment>}
                  {...getFieldProps('minKm')}
                  error={Boolean(touched.minKm && errors.minKm)}
                />
                {touched.minKm && errors.minKm && <div style={{ color: 'red' }}>{errors.minKm}</div>}
              </Stack>
            </Grid>

            {/* Max Discount Amount - Only for percentage discounts */}
            {values.discountType === 'PERCENTAGE' && (
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="maxDiscountAmount">Maximum Discount Amount</InputLabel>
                  <OutlinedInput
                    id="maxDiscountAmount"
                    type="number"
                    placeholder="Enter maximum discount amount"
                    fullWidth
                    endAdornment={<InputAdornment position="end">VND</InputAdornment>}
                    {...getFieldProps('maxDiscountAmount')}
                  />
                </Stack>
              </Grid>
            )}

            {/* Start Date */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="startDate">Ngày bắt đầu</InputLabel>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Stack>
            </Grid>

            {/* End Date */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="endDate">Ngày kết thúc</InputLabel>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Stack>
            </Grid>

            {/* Quantity */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="quantity">Số lượng</InputLabel>
                <OutlinedInput
                  id="quantity"
                  type="number"
                  placeholder="Enter voucher quantity"
                  fullWidth
                  {...getFieldProps('quantity')}
                  error={Boolean(touched.quantity && errors.quantity)}
                />
                {touched.quantity && errors.quantity && <div style={{ color: 'red' }}>{errors.quantity}</div>}
              </Stack>
            </Grid>

            {/* Usage Limit */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="usageLimit">Giới hạn sử dụng cho mỗi người dùng</InputLabel>
                <OutlinedInput
                  id="usageLimit"
                  type="number"
                  placeholder="Enter usage limit per user"
                  fullWidth
                  {...getFieldProps('usageLimit')}
                  error={Boolean(touched.usageLimit && errors.usageLimit)}
                />
                {touched.usageLimit && errors.usageLimit && <div style={{ color: 'red' }}>{errors.usageLimit}</div>}
              </Stack>
            </Grid>

            {/* Is First Time User */}
            <Grid item xs={12} md={6}>
              <FormControl>
                <FormControlLabel
                  control={<Switch {...getFieldProps('isFirstOrder')} checked={formik.values.isFirstOrder} />}
                  label="First-time user only"
                />
              </FormControl>
            </Grid>

            {/* Payment Method */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="paymentMethod">Phương thức thanh toán</InputLabel>
                <Select
                  id="paymentMethod"
                  fullWidth
                  {...getFieldProps('paymentMethod')}
                  error={Boolean(touched.paymentMethod && errors.paymentMethod)}
                >
                  <MenuItem value="ONLINE_ONLY">Chuyển khoản</MenuItem>
                  <MenuItem value="CASH_ONLY">Tiền mặt</MenuItem>
                  <MenuItem value="ALL">Cả 2</MenuItem>
                </Select>
                {touched.paymentMethod && errors.paymentMethod && <div style={{ color: 'red' }}>{errors.paymentMethod}</div>}
              </Stack>
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="status">Trạng thái</InputLabel>
                <Select id="status" fullWidth {...getFieldProps('status')} error={Boolean(touched.status && errors.status)}>
                  <MenuItem value="ACTIVE">Có hiệu lực</MenuItem>
                  <MenuItem value="INACTIVE">Hết hiệu lực</MenuItem>
                  <MenuItem value="EXPIRED">Hết hạn</MenuItem>
                </Select>
                {touched.status && errors.status && <div style={{ color: 'red' }}>{errors.status}</div>}
              </Stack>
            </Grid>

            {/* User Type */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="userType">Vai trò</InputLabel>
                <Select id="userType" fullWidth {...getFieldProps('userType')} error={Boolean(touched.userType && errors.userType)}>
                  <MenuItem value="CUSTOMER">Khách hàng</MenuItem>
                  <MenuItem value="DRIVER">Tài xế</MenuItem>
                </Select>
                {touched.userType && errors.userType && <div style={{ color: 'red' }}>{errors.userType}</div>}
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
                {voucher ? 'Chỉnh sửa' : 'Thêm'}
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Form>
    </FormikProvider>
  );
};

FormVoucherAdd.propTypes = {
  voucher: PropTypes.object,
  closeModal: PropTypes.func,
  onSuccess: PropTypes.func,
  refetch: PropTypes.func
};

export default FormVoucherAdd;
