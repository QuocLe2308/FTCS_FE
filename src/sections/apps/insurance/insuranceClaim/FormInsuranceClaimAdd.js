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
  FormHelperText,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography
} from '@mui/material';

// third-party
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project-imports
import { openSnackbar } from 'api/snackbar';
import { updateInsuranceClaimStatus } from 'api/insuranceClaim';

// assets
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

// constant
const getInitialValues = (claimData) => {
  return {
    claimStatus: claimData?.claimStatus || 'PENDING'
  };
};

const FormInsuranceClaimStatus = ({ claimData, closeModal, onSuccess, refetch }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [claimData]);

  const ClaimSchema = Yup.object().shape({
    claimStatus: Yup.string().required('Claim status is required')
  });

  const formik = useFormik({
    initialValues: getInitialValues(claimData),
    validationSchema: ClaimSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (!claimData || !claimData.id) {
          throw new Error('Claim data is missing');
        }

        // Only update the status
        await updateInsuranceClaimStatus(claimData.id, { claimStatus: values.claimStatus });

        openSnackbar({
          open: true,
          message: 'Claim status updated successfully.',
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
        console.error('Error updating claim status:', error);
        openSnackbar({
          open: true,
          message: 'Failed to update claim status. Please try again.',
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

  if (!claimData) {
    return (
      <Box sx={{ p: 5 }}>
        <Typography variant="h6" color="error" align="center">
          No claim data provided
        </Typography>
      </Box>
    );
  }

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <DialogTitle>Update Claim Status</DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 2.5 }}>
          <Grid container spacing={3}>
            {/* Display claim details */}
            <Grid item xs={12}>
              <Stack spacing={1}>
                <Typography variant="subtitle1">
                  <strong>Claim ID:</strong> {claimData.id}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Booking Insurance ID:</strong> {claimData.bookingInsuranceId}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Description:</strong> {claimData.claimDescription}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Claim Date:</strong> {new Date(claimData.claimDate).toLocaleDateString()}
                </Typography>
              </Stack>
            </Grid>

            {/* Claim Status */}
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="claimStatus">Claim Status</InputLabel>
                <FormControl fullWidth error={Boolean(touched.claimStatus && errors.claimStatus)}>
                  <Select id="claimStatus" displayEmpty {...getFieldProps('claimStatus')}>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="REJECTED">Rejected</MenuItem>
                  </Select>
                  {touched.claimStatus && errors.claimStatus && <FormHelperText error>{errors.claimStatus}</FormHelperText>}
                </FormControl>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5 }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Button color="error" onClick={closeModal}>
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                Update Status
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Form>
    </FormikProvider>
  );
};

FormInsuranceClaimStatus.propTypes = {
  claimData: PropTypes.object,
  closeModal: PropTypes.func,
  onSuccess: PropTypes.func,
  refetch: PropTypes.func
};

export default FormInsuranceClaimStatus;
