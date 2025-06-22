import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  RadioGroup,
  Radio,
  Autocomplete,
  Chip
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project imports
import AlertDriverDelete from './AlertDriverDelete';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { openSnackbar } from 'api/snackbar';
import { insertCustomer, updateCustomer } from 'api/driver';
import { ThemeMode } from 'config';
import { Gender } from 'data/react-table';

// assets
import { CameraOutlined, CloseOutlined, DeleteFilled } from '@ant-design/icons';

const avatarImage = require.context('assets/images/users', true);

const skills = [
  'Adobe XD',
  'After Effect',
  'Angular',
  'Animation',
  'ASP.Net',
  'Bootstrap',
  'C#',
  'CC',
  'Corel Draw',
  'CSS',
  'DIV',
  'Dreamweaver',
  'Figma',
  'Graphics',
  'HTML',
  'Illustrator',
  'J2Ee',
  'Java',
  'Javascript',
  'JQuery',
  'Logo Design',
  'Material UI',
  'Motion',
  'MVC',
  'MySQL',
  'NodeJS',
  'npm',
  'Photoshop',
  'PHP',
  'React',
  'Redux',
  'Reduxjs & tooltit',
  'SASS',
  'SCSS',
  'SQL Server',
  'SVG',
  'UI/UX',
  'User Interface Designing',
  'Wordpress'
];

// constant
const getInitialValues = (driver) => {
  const newDriver = {
    fullName: '',
    name: '',
    phone: '',
    email: '',
    age: 18,
    avatar: 1,
    gender: Gender.FEMALE,
    role: '',
    fatherName: '',
    orders: 0,
    progress: 50,
    status: 2,
    orderStatus: '',
    contact: '',
    country: '',
    location: '',
    about: '',
    skills: [],
    time: ['just now'],
    date: ''
  };

  if (driver) {
    return _.merge({}, newDriver, driver);
  }

  return newDriver;
};

const allStatus = [
  { value: 3, label: 'Rejected' },
  { value: 1, label: 'Verified' },
  { value: 2, label: 'Pending' }
];

// ==============================|| DRIVER ADD / EDIT - FORM ||============================== //

const FormDriverAdd = ({ driver, closeModal }) => {
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(undefined);
  const [avatar, setAvatar] = useState(avatarImage(`./avatar-${driver && driver !== null && driver?.avatar ? driver.avatar : 1}.png`));

  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const DriverSchema = Yup.object().shape({
    fullName: Yup.string().max(255).required('Full Name is required'),
    email: Yup.string().max(255).required('Email is required').email('Must be a valid email'),
    status: Yup.string().required('Status is required'),
    location: Yup.string().max(500),
    about: Yup.string().max(500)
  });

  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    closeModal();
  };

  const formik = useFormik({
    initialValues: getInitialValues(driver),
    validationSchema: DriverSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newDriver = values;
        newDriver.name = newDriver.firstName + ' ' + newDriver.lastName;

        if (driver) {
          updateCustomer(newDriver.id, newDriver).then(() => {
            openSnackbar({
              open: true,
              message: 'Driver update successfully.',
              variant: 'alert',
              alert: {
                color: 'success'
              }
            });
            setSubmitting(false);
            closeModal();
          });
        } else {
          await insertCustomer(newDriver).then(() => {
            openSnackbar({
              open: true,
              message: 'Driver added successfully.',
              variant: 'alert',
              alert: {
                color: 'success'
              }
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

  if (loading)
    return (
      <Box sx={{ p: 5 }}>
        <Stack direction="row" justifyContent="center">
          <CircularWithPath />
        </Stack>
      </Box>
    );

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle>{driver ? 'Chỉnh sửa' : 'Tạo tài xế'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
                    <FormLabel
                      htmlFor="change-avtar"
                      sx={{
                        position: 'relative',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        '&:hover .MuiBox-root': { opacity: 1 },
                        cursor: 'pointer'
                      }}
                    >
                      <Avatar alt="Avatar 1" src={avatar} sx={{ width: 72, height: 72, border: '1px dashed' }} />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          backgroundColor: theme.palette.mode === ThemeMode.DARK ? 'rgba(255, 255, 255, .75)' : 'rgba(0,0,0,.65)',
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Stack spacing={0.5} alignItems="center">
                          <CameraOutlined style={{ color: theme.palette.secondary.lighter, fontSize: '2rem' }} />
                          <Typography sx={{ color: 'secondary.lighter' }}>Upload</Typography>
                        </Stack>
                      </Box>
                    </FormLabel>
                    <TextField
                      type="file"
                      id="change-avtar"
                      placeholder="Outlined"
                      variant="outlined"
                      sx={{ display: 'none' }}
                      onChange={(e) => setSelectedImage(e.target.files?.[0])}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="driver-fullName">Họ và tên</InputLabel>
                        <TextField
                          fullWidth
                          id="driver-fullName"
                          placeholder="Enter Full Name"
                          {...getFieldProps('driverIdentity.driverFullName')}
                          error={Boolean(touched.fullName && errors.fullName)}
                          helperText={touched.fullName && errors.fullName}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="driver-phone">Số điện thoại</InputLabel>
                        <TextField
                          fullWidth
                          id="driver-phone"
                          placeholder="Enter Phone"
                          {...getFieldProps('phone')}
                          error={Boolean(touched.phone && errors.phone)}
                          helperText={touched.phone && errors.phone}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={9}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="driver-email">Email</InputLabel>
                        <TextField
                          fullWidth
                          id="driver-email"
                          placeholder="Enter driver Email"
                          {...getFieldProps('email')}
                          error={Boolean(touched.email && errors.email)}
                          helperText={touched.email && errors.email}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={3}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="driver-age">Tuổi</InputLabel>
                        <TextField
                          type="number"
                          fullWidth
                          id="driver-age"
                          placeholder="Enter Age"
                          {...getFieldProps('age')}
                          error={Boolean(touched.age && errors.age)}
                          helperText={touched.age && errors.age}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="driver-fatherName">Tên cha</InputLabel>
                        <TextField
                          fullWidth
                          id="driver-fatherName"
                          placeholder="Enter Father Name"
                          {...getFieldProps('fatherName')}
                          error={Boolean(touched.fatherName && errors.fatherName)}
                          helperText={touched.fatherName && errors.fatherName}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="driver-role">Vị trí</InputLabel>
                        <TextField
                          fullWidth
                          id="driver-role"
                          placeholder="Enter Role"
                          {...getFieldProps('role')}
                          error={Boolean(touched.role && errors.role)}
                          helperText={touched.role && errors.role}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="driver-gender">Giới tính</InputLabel>
                        <RadioGroup row aria-label="payment-card" {...getFieldProps('gender')}>
                          <FormControlLabel control={<Radio value={Gender.FEMALE} />} label={Gender.FEMALE} />
                          <FormControlLabel control={<Radio value={Gender.MALE} />} label={Gender.MALE} />
                        </RadioGroup>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="driver-status">Trạng thái</InputLabel>
                        <FormControl fullWidth>
                          <Select
                            id="column-hiding"
                            displayEmpty
                            {...getFieldProps('status')}
                            onChange={(event) => setFieldValue('status', event.target.value)}
                            input={<OutlinedInput id="select-column-hiding" placeholder="Sort by" />}
                            renderValue={(selected) => {
                              if (!selected) {
                                return <Typography variant="subtitle1">Select Status</Typography>;
                              }

                              const selectedStatus = allStatus.filter((item) => item.value === Number(selected));
                              return (
                                <Typography variant="subtitle2">
                                  {selectedStatus.length > 0 ? selectedStatus[0].label : 'Pending'}
                                </Typography>
                              );
                            }}
                          >
                            {allStatus.map((column) => (
                              <MenuItem key={column.value} value={column.value}>
                                <ListItemText primary={column.label} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {touched.status && errors.status && (
                          <FormHelperText error id="standard-weight-helper-text-email-login" sx={{ pl: 1.75 }}>
                            {errors.status}
                          </FormHelperText>
                        )}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="driver-contact">Liên hệ</InputLabel>
                        <TextField
                          fullWidth
                          id="driver-contact"
                          placeholder="Enter Contact"
                          {...getFieldProps('contact')}
                          error={Boolean(touched.contact && errors.contact)}
                          helperText={touched.contact && errors.contact}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="driver-country">Quốc gia</InputLabel>
                        <TextField
                          fullWidth
                          id="driver-country"
                          placeholder="Enter Country"
                          {...getFieldProps('country')}
                          error={Boolean(touched.country && errors.country)}
                          helperText={touched.country && errors.country}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="driver-location">Địa chỉ</InputLabel>
                        <TextField
                          fullWidth
                          id="driver-location"
                          multiline
                          rows={2}
                          placeholder="Enter Location"
                          {...getFieldProps('location')}
                          error={Boolean(touched.location && errors.location)}
                          helperText={touched.location && errors.location}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="driver-about">Giới thiệu tài xế</InputLabel>
                        <TextField
                          fullWidth
                          id="driver-about"
                          multiline
                          rows={2}
                          placeholder="Enter driver Information"
                          {...getFieldProps('about')}
                          error={Boolean(touched.about && errors.about)}
                          helperText={touched.about && errors.about}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="driver-skills">Kĩ năng</InputLabel>
                        <Autocomplete
                          multiple
                          fullWidth
                          id="driver-skills"
                          options={skills}
                          {...getFieldProps('skills')}
                          getOptionLabel={(label) => label}
                          onChange={(event, newValue) => {
                            setFieldValue('skills', newValue);
                          }}
                          renderInput={(params) => <TextField {...params} name="skill" placeholder="Add Skills" />}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                key={index}
                                {...getTagProps({ index })}
                                variant="combined"
                                label={option}
                                deleteIcon={<CloseOutlined style={{ fontSize: '0.75rem' }} />}
                                sx={{ color: 'text.primary' }}
                              />
                            ))
                          }
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle1">Make Contact Info Public</Typography>
                          <Typography variant="caption" color="textSecondary">
                            Means that anyone viewing your profile will be able to see your contacts details
                          </Typography>
                        </Stack>
                        <FormControlLabel control={<Switch defaultChecked sx={{ mt: 0 }} />} label="" labelPlacement="start" />
                      </Stack>
                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle1">Available to hire</Typography>
                          <Typography variant="caption" color="textSecondary">
                            Toggling this will let your teammates know that you are available for acquiring new projects
                          </Typography>
                        </Stack>
                        <FormControlLabel control={<Switch sx={{ mt: 0 }} />} label="" labelPlacement="start" />
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2.5 }}>
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                  {driver && (
                    <Tooltip title="Delete driver" placement="top">
                      <IconButton onClick={() => setOpenAlert(true)} size="large" color="error">
                        <DeleteFilled />
                      </IconButton>
                    </Tooltip>
                  )}
                </Grid>
                <Grid item>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button color="error" onClick={closeModal}>
                      Hủy
                    </Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                      {driver ? 'Chỉnh sửa' : 'Thêm'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </DialogActions>
          </Form>
        </LocalizationProvider>
      </FormikProvider>
      {driver && <AlertDriverDelete id={driver.id} title={driver.name} open={openAlert} handleClose={handleAlertClose} />}
    </>
  );
};

FormDriverAdd.propTypes = {
  driver: PropTypes.object,
  closeModal: PropTypes.func
};

export default FormDriverAdd;
