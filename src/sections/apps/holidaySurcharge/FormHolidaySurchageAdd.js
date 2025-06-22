import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import { Box, Button, DialogActions, DialogContent, DialogTitle, Divider, Grid, InputLabel, TextField } from '@mui/material';

// third-party
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project imports
import { openSnackbar } from 'api/snackbar';
import { insertHolidaySurchage, updateHolidaySurchage } from 'api/holidaySurcharge';

// assets
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

// constant
const getInitialValues = (holidaySurchage) => {
  const newHolidaySurchage = {
    holidayName: '',
    startDate: '',
    endDate: '',
    surchargePercentage: ''
  };

  if (holidaySurchage) {
    return { ...newHolidaySurchage, ...holidaySurchage };
  }

  return newHolidaySurchage;
};

// ==============================|| HOLIDAY SURCHARGE ADD / EDIT - FORM ||============================== //

const FormHolidaySurchageAdd = ({ holidaySurchage, closeModal, onSuccess, refetch }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const HolidaySurchageSchema = Yup.object().shape({
    holidayName: Yup.string().max(255).required('Holiday Name is required'),
    startDate: Yup.date().required('Start Date is required'),
    endDate: Yup.date().required('End Date is required'),
    surchargePercentage: Yup.number().required('Surcharge Percentage is required').min(0).max(1000, 'Percentage must be between 0 and 100')
  });

  const formik = useFormik({
    initialValues: getInitialValues(holidaySurchage),
    validationSchema: HolidaySurchageSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // So sánh giữa dữ liệu ban đầu (holidaySurchage) và dữ liệu hiện tại (values)
        const isChanged =
          values.holidayName !== holidaySurchage?.holidayName ||
          values.startDate !== holidaySurchage?.startDate ||
          values.endDate !== holidaySurchage?.endDate ||
          values.surchargePercentage !== holidaySurchage?.surchargePercentage;

        if (!isChanged) {
          // Nếu không có sự thay đổi, không gửi gì lên API
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

        let newHolidaySurchage = {
          holidayName: values.holidayName,
          startDate: values.startDate,
          endDate: values.endDate,
          surchargePercentage: values.surchargePercentage
        };

        if (holidaySurchage && holidaySurchage.holidaySurchargeId) {
          // Gửi request cập nhật nếu có thay đổi
          await updateHolidaySurchage(holidaySurchage.holidaySurchargeId, newHolidaySurchage);
        } else {
          // Thực hiện thêm mới nếu không có `holidaySurchargeId`
          await insertHolidaySurchage(newHolidaySurchage);
        }

        openSnackbar({
          open: true,
          message: holidaySurchage ? 'Holiday Surcharge updated successfully.' : 'Holiday Surcharge added successfully.',
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

  // // Kiểm tra holidaySurchage có hợp lệ không
  // if (!holidaySurchage || !holidaySurchage.holidaySurchargeId) {
  //   openSnackbar({
  //     open: true,
  //     message: 'Invalid Holiday surcharge data',
  //     variant: 'alert',
  //     alert: { color: 'error' }
  //   });
  // }

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  if (loading)
    return (
      <Box sx={{ p: 5 }}>
        <CircularWithPath />
      </Box>
    );

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <DialogTitle>{holidaySurchage ? 'Cập nhật thưởng lễ' : 'Tạo bản thưởng lễ mới'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 2.5 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <InputLabel htmlFor="holidaySurchage-holidayName">Ngày lễ</InputLabel>
              <TextField
                fullWidth
                id="holidaySurchage-holidayName"
                placeholder="Enter Holiday Name"
                {...getFieldProps('holidayName')}
                error={Boolean(touched.holidayName && errors.holidayName)}
                helperText={touched.holidayName && errors.holidayName}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <InputLabel htmlFor="holidaySurchage-startDate">Ngày bắt đầu</InputLabel>
              <TextField
                fullWidth
                id="holidaySurchage-startDate"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                {...getFieldProps('startDate')}
                error={Boolean(touched.startDate && errors.startDate)}
                helperText={touched.startDate && errors.startDate}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <InputLabel htmlFor="holidaySurchage-endDate">Ngày kết thúc</InputLabel>
              <TextField
                fullWidth
                id="holidaySurchage-endDate"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                {...getFieldProps('endDate')}
                error={Boolean(touched.endDate && errors.endDate)}
                helperText={touched.endDate && errors.endDate}
              />
            </Grid>

            <Grid item xs={12}>
              <InputLabel htmlFor="holidaySurchage-surchargePercentage">Phần trăm phụ phí</InputLabel>
              <TextField
                fullWidth
                id="holidaySurchage-surchargePercentage"
                type="number"
                placeholder="Enter Surcharge Percentage"
                {...getFieldProps('surchargePercentage')}
                error={Boolean(touched.surchargePercentage && errors.surchargePercentage)}
                helperText={touched.surchargePercentage && errors.surchargePercentage}
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
                {holidaySurchage ? 'Cập nhật' : 'Thêm'}
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Form>
    </FormikProvider>
  );
};

FormHolidaySurchageAdd.propTypes = {
  holidaySurchage: PropTypes.object,
  closeModal: PropTypes.func
};

export default FormHolidaySurchageAdd;
