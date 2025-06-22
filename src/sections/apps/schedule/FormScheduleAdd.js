import PropTypes from 'prop-types';
import { useState } from 'react'; // Removed unused useEffect
import {
  Button,
  DialogActions,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  OutlinedInput,
  Select,
  TextField,
  Typography,
  MenuItem,
  ListItemText,
  FormHelperText,
  DialogContent
} from '@mui/material'; // Removed unused Box
import { useFormik, Form, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import IconButton from 'components/@extended/IconButton';
import { openSnackbar } from 'api/snackbar';
import { insertSchedule, updateSchedule } from 'api/schedules';
import AlertScheduleDelete from './AlertScheduleDelete';
import { DeleteFilled } from '@ant-design/icons';
import { Stack } from 'immutable';

const getInitialValues = (schedule) => {
  const newSchedule = {
    accountId: 0,
    startLocation: '',
    endLocation: '',
    startLocationAddress: '',
    endLocationAddress: '',
    startDate: new Date(),
    endDate: new Date(),
    vehicleId: null,
    availableCapacity: 0,
    status: 'PENDING',
    notes: ''
  };

  return schedule ? { ...newSchedule, ...schedule } : newSchedule;
};

const statusOptions = ['PENDING', 'GETTING_TO_THE_POINT', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'];

const FormScheduleAdd = ({ schedule, closeModal }) => {
  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    closeModal();
  };

  const ScheduleSchema = Yup.object().shape({
    accountId: Yup.number().required('Account ID is required'),
    startLocationAddress: Yup.string().required('Start Location Address is required'),
    endLocationAddress: Yup.string().required('End Location Address is required'),
    startDate: Yup.date().required('Start Date is required'),
    endDate: Yup.date().required('End Date is required').min(Yup.ref('startDate'), 'End Date must be after Start Date'),
    availableCapacity: Yup.number().min(0, 'Capacity must be non-negative'),
    status: Yup.string().required('Status is required')
  });

  const formik = useFormik({
    initialValues: getInitialValues(schedule),
    validationSchema: ScheduleSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (schedule) {
          await updateSchedule(schedule.scheduleId, values).then(() => {
            openSnackbar({
              open: true,
              message: 'Schedule updated successfully.',
              variant: 'alert',
              alert: { color: 'success' }
            });
            setSubmitting(false);
            closeModal();
          });
        } else {
          await insertSchedule(values).then(() => {
            openSnackbar({
              open: true,
              message: 'Schedule added successfully.',
              variant: 'alert',
              alert: { color: 'success' }
            });
            setSubmitting(false);
            closeModal();
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

  return (
    <FormikProvider value={formik}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <DialogTitle>{schedule ? 'Edit Schedule' : 'New Schedule'}</DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 2.5 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="schedule-accountId">Account ID</InputLabel>
                  <TextField
                    fullWidth
                    id="schedule-accountId"
                    type="number"
                    {...getFieldProps('accountId')}
                    error={Boolean(touched.accountId && errors.accountId)}
                    helperText={touched.accountId && errors.accountId}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="schedule-status">Status</InputLabel>
                  <FormControl fullWidth>
                    <Select
                      id="schedule-status"
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
                  <InputLabel htmlFor="schedule-startLocationAddress">Start Location Address</InputLabel>
                  <TextField
                    fullWidth
                    id="schedule-startLocationAddress"
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
                  <InputLabel htmlFor="schedule-endLocationAddress">End Location Address</InputLabel>
                  <TextField
                    fullWidth
                    id="schedule-endLocationAddress"
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
                  <InputLabel htmlFor="schedule-startDate">Start Date</InputLabel>
                  <DateTimePicker
                    value={formik.values.startDate}
                    onChange={(value) => setFieldValue('startDate', value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={Boolean(touched.startDate && errors.startDate)}
                        helperText={touched.startDate && errors.startDate}
                      />
                    )}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="schedule-endDate">End Date</InputLabel>
                  <DateTimePicker
                    value={formik.values.endDate}
                    onChange={(value) => setFieldValue('endDate', value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={Boolean(touched.endDate && errors.endDate)}
                        helperText={touched.endDate && errors.endDate}
                      />
                    )}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="schedule-availableCapacity">Available Capacity</InputLabel>
                  <TextField
                    fullWidth
                    id="schedule-availableCapacity"
                    type="number"
                    {...getFieldProps('availableCapacity')}
                    error={Boolean(touched.availableCapacity && errors.availableCapacity)}
                    helperText={touched.availableCapacity && errors.availableCapacity}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="schedule-vehicleId">Vehicle ID</InputLabel>
                  <TextField
                    fullWidth
                    id="schedule-vehicleId"
                    {...getFieldProps('vehicleId')}
                    error={Boolean(touched.vehicleId && errors.vehicleId)}
                    helperText={touched.vehicleId && errors.vehicleId}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="schedule-notes">Notes</InputLabel>
                  <TextField
                    fullWidth
                    id="schedule-notes"
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
                {schedule && (
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
                    {schedule ? 'Edit' : 'Add'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </DialogActions>
        </Form>
      </LocalizationProvider>
      {schedule && (
        <AlertScheduleDelete id={schedule.scheduleId} title={schedule.scheduleId} open={openAlert} handleClose={handleAlertClose} />
      )}
    </FormikProvider>
  );
};

FormScheduleAdd.propTypes = {
  schedule: PropTypes.object,
  closeModal: PropTypes.func
};

export default FormScheduleAdd;
