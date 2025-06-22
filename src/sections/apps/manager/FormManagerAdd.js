import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import { Box, Button, DialogActions, DialogContent, DialogTitle, Divider, Grid, InputLabel, TextField } from '@mui/material';

// third-party
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project imports
import { openSnackbar } from 'api/snackbar';
import { insertManager, updateManager } from 'api/manager';

// assets
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

// constant
const getInitialValues = (manager) => {
  const newManager = {
    username: '',
    fullName: '',
    password: '',
    email: '',
    phone: ''
  };

  if (manager) {
    return { ...newManager, ...manager };
  }

  return newManager;
};

const FormManagerAdd = ({ manager, closeModal, onSuccess, refetch, role }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const ManagerSchema = Yup.object().shape({
    username: Yup.string().max(255).required('Username is required'),
    fullName: Yup.string().max(255).required('Full Name is required'),
    password: Yup.string().when('isUpdate', {
      is: false,
      then: (schema) => schema.min(6, 'Password must be at least 6 characters').required('Password is required'),
      otherwise: (schema) => schema.notRequired()
    }),
    email: Yup.string().email('Must be a valid email').required('Email is required'),
    phone: Yup.string()
      .matches(/^\d{10,12}$/, 'Phone must be between 10 and 12 digits')
      .required('Phone is required')
  });

  const formik = useFormik({
    initialValues: { ...getInitialValues(manager), isUpdate: Boolean(manager) },
    validationSchema: ManagerSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // So sánh dữ liệu ban đầu và hiện tại (cho update)
        const isChanged =
          values.username !== manager?.username ||
          values.fullName !== manager?.fullName ||
          values.email !== manager?.email ||
          values.phone !== manager?.phone ||
          (values.password && values.password !== manager?.password);

        if (manager && !isChanged) {
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

        let newManager = {
          username: values.username,
          fullName: values.fullName,
          password: values.password || undefined,
          email: values.email,
          phone: values.phone
        };

        if (manager && manager.accountId) {
          await updateManager(manager.accountId, newManager);
        } else {
          newManager.role = role; // Chỉ thêm role khi tạo mới
          await insertManager(newManager);
        }

        openSnackbar({
          open: true,
          message: manager ? 'Manager updated successfully.' : 'Manager added successfully.',
          variant: 'alert',
          alert: { color: 'success' }
        });

        // Kiểm tra refetch có phải là hàm hay không trước khi gọi
        if (typeof refetch === 'function') {
          refetch();
        }

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

  if (loading)
    return (
      <Box sx={{ p: 5 }}>
        <CircularWithPath />
      </Box>
    );

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <DialogTitle>{manager ? 'Chỉnh sửa' : 'Tạo mới'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 2.5 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <InputLabel htmlFor="manager-username">Tên người dùng</InputLabel>
              <TextField
                fullWidth
                id="manager-username"
                placeholder="Enter Username"
                {...getFieldProps('username')}
                error={Boolean(touched.username && errors.username)}
                helperText={touched.username && errors.username}
              />
            </Grid>

            <Grid item xs={12}>
              <InputLabel htmlFor="manager-fullName">Họ và tên</InputLabel>
              <TextField
                fullWidth
                id="manager-fullName"
                placeholder="Enter Full Name"
                {...getFieldProps('fullName')}
                error={Boolean(touched.fullName && errors.fullName)}
                helperText={touched.fullName && errors.fullName}
              />
            </Grid>

            {!manager && (
              <Grid item xs={12}>
                <InputLabel htmlFor="manager-password">Mật khẩu</InputLabel>
                <TextField
                  fullWidth
                  id="manager-password"
                  type="password"
                  placeholder="Enter Password"
                  {...getFieldProps('password')}
                  error={Boolean(touched.password && errors.password)}
                  helperText={touched.password && errors.password}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <InputLabel htmlFor="manager-email">Email</InputLabel>
              <TextField
                fullWidth
                id="manager-email"
                placeholder="Enter Email"
                {...getFieldProps('email')}
                error={Boolean(touched.email && errors.email)}
                helperText={touched.email && errors.email}
              />
            </Grid>

            <Grid item xs={12}>
              <InputLabel htmlFor="manager-phone">Số điện thoại</InputLabel>
              <TextField
                fullWidth
                id="manager-phone"
                placeholder="Enter Phone Number"
                {...getFieldProps('phone')}
                error={Boolean(touched.phone && errors.phone)}
                helperText={touched.phone && errors.phone}
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
                {manager ? 'Chỉnh sửa' : 'Thêm'}
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Form>
    </FormikProvider>
  );
};

FormManagerAdd.propTypes = {
  manager: PropTypes.object,
  closeModal: PropTypes.func,
  onSuccess: PropTypes.func,
  refetch: PropTypes.func,
  role: PropTypes.string
};

export default FormManagerAdd;
