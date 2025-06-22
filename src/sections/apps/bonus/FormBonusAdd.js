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
  Stack,
  TextField
} from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project-imports
import { openSnackbar } from 'api/snackbar';
import { createBonusConfiguration, updateBonusConfiguration } from 'api/bonus';

// assets
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

// Constants for mapping enum values
const REWARD_TYPES = {
  VOUCHER: 'VOUCHER',
  AMOUNT: 'AMOUNT',
  LOYALTY_POINTS: 'LOYALTY_POINTS'
};

const DRIVER_GROUPS = {
  NEWBIE: 'NEWBIE',
  REGULAR: 'REGULAR'
};

const BONUS_TIERS = {
  TIER1: 'TIER1',
  TIER2: 'TIER2',
  TIER3: 'TIER3',
  TIER4: 'TIER4'
};

// constant
const getInitialValues = (bonusConfig) => {
  const newBonusConfig = {
    bonusName: '',
    description: '',
    targetTrips: 0,
    revenueTarget: 0,
    rewardType: 'AMOUNT',
    driverGroup: 'NEWBIE',
    bonusTier: 'TIER1',
    bonusAmount: 0,
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    isActive: true
  };

  if (bonusConfig) {
    return { ...newBonusConfig, ...bonusConfig };
  }

  return newBonusConfig;
};

const FormBonusAdd = ({ bonusConfig, closeModal, onSuccess, refetch }) => {
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    // Initialize dates if bonusConfig exists
    if (bonusConfig) {
      if (bonusConfig.startDate) {
        setStartDate(new Date(bonusConfig.startDate));
      }
      if (bonusConfig.endDate) {
        setEndDate(new Date(bonusConfig.endDate));
      }
    }
    setLoading(false);
  }, [bonusConfig]);

  const BonusSchema = Yup.object().shape({
    bonusName: Yup.string().required('Bonus name is required'),
    description: Yup.string().required('Description is required'),
    targetTrips: Yup.number().required('Target trips is required').min(0, 'Must be non-negative').integer('Must be an integer'),
    revenueTarget: Yup.number().required('Revenue target is required').min(0, 'Must be non-negative'),
    rewardType: Yup.string().required('Reward type is required'),
    driverGroup: Yup.string().required('Driver group is required'),
    bonusTier: Yup.string().required('Bonus tier is required'),
    bonusAmount: Yup.number().required('Bonus amount is required').min(0, 'Must be non-negative')
  });

  const formik = useFormik({
    initialValues: getInitialValues(bonusConfig),
    validationSchema: BonusSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Check for changes if updating
        if (bonusConfig && bonusConfig.bonusConfigurationId) {
          // Compare with the original values
          const isChanged =
            values.bonusName !== bonusConfig.bonusName ||
            values.description !== bonusConfig.description ||
            values.targetTrips !== bonusConfig.targetTrips ||
            values.revenueTarget !== bonusConfig.revenueTarget ||
            values.rewardType !== bonusConfig.rewardType ||
            values.driverGroup !== bonusConfig.driverGroup ||
            values.bonusTier !== bonusConfig.bonusTier ||
            values.bonusAmount !== bonusConfig.bonusAmount ||
            startDate.toISOString() !== new Date(bonusConfig.startDate).toISOString() ||
            endDate.toISOString() !== new Date(bonusConfig.endDate).toISOString();

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
        const bonusData = {
          bonusName: values.bonusName,
          description: values.description,
          targetTrips: values.targetTrips,
          revenueTarget: values.revenueTarget,
          rewardType: values.rewardType,
          driverGroup: values.driverGroup,
          bonusTier: values.bonusTier,
          bonusAmount: values.bonusAmount,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        };

        if (bonusConfig && bonusConfig.bonusConfigurationId) {
          // For update operation
          await updateBonusConfiguration(bonusConfig.bonusConfigurationId, bonusData);
          openSnackbar({
            open: true,
            message: 'Bonus configuration updated successfully.',
            variant: 'alert',
            alert: { color: 'success' }
          });
        } else {
          // For create operation
          await createBonusConfiguration(bonusData);
          openSnackbar({
            open: true,
            message: 'Bonus configuration added successfully.',
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
        console.error('Error submitting bonus configuration:', error);
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
        <DialogTitle>{bonusConfig ? 'Cập nhật phần thưởng' : 'Thêm phần thưởng'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 2.5 }}>
          <Grid container spacing={3}>
            {/* Bonus Name */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="bonusName">Tên phần thưởng</InputLabel>
                <OutlinedInput
                  id="bonusName"
                  placeholder="Enter bonus name"
                  fullWidth
                  {...getFieldProps('bonusName')}
                  error={Boolean(touched.bonusName && errors.bonusName)}
                />
                {touched.bonusName && errors.bonusName && <div style={{ color: 'red' }}>{errors.bonusName}</div>}
              </Stack>
            </Grid>

            {/* Description */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="description">Mô tả</InputLabel>
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

            {/* Target Trips */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="targetTrips">Số lần nhận chuyến</InputLabel>
                <OutlinedInput
                  id="targetTrips"
                  type="number"
                  placeholder="Enter target trips"
                  fullWidth
                  {...getFieldProps('targetTrips')}
                  error={Boolean(touched.targetTrips && errors.targetTrips)}
                />
                {touched.targetTrips && errors.targetTrips && <div style={{ color: 'red' }}>{errors.targetTrips}</div>}
              </Stack>
            </Grid>

            {/* Revenue Target */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="revenueTarget">Doanh thu</InputLabel>
                <OutlinedInput
                  id="revenueTarget"
                  type="number"
                  placeholder="Enter revenue target"
                  fullWidth
                  endAdornment={<InputAdornment position="end">VND</InputAdornment>}
                  {...getFieldProps('revenueTarget')}
                  error={Boolean(touched.revenueTarget && errors.revenueTarget)}
                />
                {touched.revenueTarget && errors.revenueTarget && <div style={{ color: 'red' }}>{errors.revenueTarget}</div>}
              </Stack>
            </Grid>

            {/* Reward Type */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="rewardType">Loại phần thưởng</InputLabel>
                <Select id="rewardType" fullWidth {...getFieldProps('rewardType')} error={Boolean(touched.rewardType && errors.rewardType)}>
                  <MenuItem value={REWARD_TYPES.VOUCHER}>Voucher</MenuItem>
                  <MenuItem value={REWARD_TYPES.AMOUNT}>Tiền</MenuItem>
                  <MenuItem value={REWARD_TYPES.LOYALTY_POINTS}>Điểm uy tín</MenuItem>
                </Select>
                {touched.rewardType && errors.rewardType && <div style={{ color: 'red' }}>{errors.rewardType}</div>}
              </Stack>
            </Grid>

            {/* Driver Group */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="driverGroup">Loại tài xế</InputLabel>
                <Select
                  id="driverGroup"
                  fullWidth
                  {...getFieldProps('driverGroup')}
                  error={Boolean(touched.driverGroup && errors.driverGroup)}
                >
                  <MenuItem value={DRIVER_GROUPS.NEWBIE}>Lái mới</MenuItem>
                  <MenuItem value={DRIVER_GROUPS.REGULAR}>Lái lâu năm</MenuItem>
                </Select>
                {touched.driverGroup && errors.driverGroup && <div style={{ color: 'red' }}>{errors.driverGroup}</div>}
              </Stack>
            </Grid>

            {/* Bonus Tier */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="bonusTier">Cấp thưởng</InputLabel>
                <Select id="bonusTier" fullWidth {...getFieldProps('bonusTier')} error={Boolean(touched.bonusTier && errors.bonusTier)}>
                  <MenuItem value={BONUS_TIERS.TIER1}>Cấp 1</MenuItem>
                  <MenuItem value={BONUS_TIERS.TIER2}>Cấp 2</MenuItem>
                  <MenuItem value={BONUS_TIERS.TIER3}>Cấp 3</MenuItem>
                  <MenuItem value={BONUS_TIERS.TIER4}>Cấp 4</MenuItem>
                </Select>
                {touched.bonusTier && errors.bonusTier && <div style={{ color: 'red' }}>{errors.bonusTier}</div>}
              </Stack>
            </Grid>

            {/* Bonus Amount */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel htmlFor="bonusAmount">Thưởng thêm</InputLabel>
                <OutlinedInput
                  id="bonusAmount"
                  type="number"
                  placeholder="Enter bonus amount"
                  fullWidth
                  endAdornment={<InputAdornment position="end">VND</InputAdornment>}
                  {...getFieldProps('bonusAmount')}
                  error={Boolean(touched.bonusAmount && errors.bonusAmount)}
                />
                {touched.bonusAmount && errors.bonusAmount && <div style={{ color: 'red' }}>{errors.bonusAmount}</div>}
              </Stack>
            </Grid>

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
                {bonusConfig ? 'Cập nhật' : 'Thêm'}
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Form>
    </FormikProvider>
  );
};

FormBonusAdd.propTypes = {
  bonusConfig: PropTypes.object,
  closeModal: PropTypes.func,
  onSuccess: PropTypes.func,
  refetch: PropTypes.func
};

export default FormBonusAdd;
