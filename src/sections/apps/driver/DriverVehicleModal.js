import React from 'react';
import PropTypes from 'prop-types';
import { Box, Modal, Button, Typography, Chip, Grid, Paper } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CategoryIcon from '@mui/icons-material/Category';
import BuildIcon from '@mui/icons-material/Build';
import TimelineIcon from '@mui/icons-material/Timeline';
import StorageIcon from '@mui/icons-material/Storage'; // Correct import for Vehicle Capacity
import AspectRatioIcon from '@mui/icons-material/AspectRatio'; //
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import MainCard from 'components/MainCard';
import PhotoIcon from '@mui/icons-material/Photo';
import SimpleBar from 'components/third-party/SimpleBar';
import { updateVehicleStatus } from 'api/driver';
import { openSnackbar } from 'api/snackbar';

const DriverVehicleModal = ({ open, modalToggler, driver, vehicleIds, refetchDrivers }) => {
  const closeModal = () => modalToggler(false);

  const isVehicleInfoAvailable = driver?.vehicles?.length > 0;
  const isAllVehicleInfoEmpty = driver?.vehicles?.every(
    (vehicle) =>
      !vehicle.licensePlate &&
      !vehicle.vehicleType &&
      !vehicle.vehicleMake &&
      !vehicle.vehicleModel &&
      !vehicle.vehicleYear &&
      !vehicle.vehicleFrontView &&
      !vehicle.vehicleBackView
  );

  const updateVehicleStatusHandler = (vehicleId, status) => {
    if (vehicleId) {
      updateVehicleStatus(vehicleId, status)
        .then(() => {
          openSnackbar({
            open: true,
            message: `Status updated successfully: ${status}`,
            variant: 'alert',
            alert: {
              color: status === 'APPROVED' ? 'success' : 'error'
            },
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
            transition: 'SlideLeft'
          });
          refetchDrivers();
          closeModal();
        })
        .catch(() => {
          alert('An error occurred. Please try again!');
        });
    } else {
      alert('No valid vehicle ID.');
    }
  };

  const InfoItem = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      {React.cloneElement(icon, { sx: { color: 'primary.main' } })}
      <Box sx={{ ml: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1">{value || 'N/A'}</Typography>
      </Box>
    </Box>
  );

  const ImageDisplay = ({ url, title }) => (
    <Box sx={{ height: '100%' }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        <PhotoIcon sx={{ mr: 1, verticalAlign: 'bottom', fontSize: '1rem' }} />
        {title}
      </Typography>
      <Paper
        elevation={2}
        sx={{
          height: 200,
          overflow: 'hidden',
          position: 'relative',
          '&:hover': {
            '& .overlay': {
              opacity: 1
            }
          }
        }}
      >
        <Box
          component="img"
          src={url}
          alt={title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
        <Box
          className="overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s'
          }}
        >
          <Button variant="contained" color="primary" size="small" onClick={() => window.open(url, '_blank')}>
            View Full Size
          </Button>
        </Box>
      </Paper>
    </Box>
  );

  return (
    <Modal
      open={open}
      onClose={closeModal}
      aria-labelledby="modal-driver-vehicle"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <MainCard
        sx={{
          width: 'calc(100% - 48px)',
          minWidth: 340,
          maxWidth: 880,
          maxHeight: 'calc(100vh - 48px)',
          m: 2
        }}
        modal
        content={false}
      >
        <SimpleBar
          sx={{
            maxHeight: 'calc(100vh - 48px)',
            '& .simplebar-content': {
              height: '100%'
            }
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <DirectionsCarIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h4">Thông tin phương tiện</Typography>
            </Box>

            {isVehicleInfoAvailable && !isAllVehicleInfoEmpty ? (
              <Grid container spacing={2}>
                {driver.vehicles.map((vehicle, index) => (
                  <Grid item xs={12} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        mb: 2,
                        bgcolor: 'grey.50',
                        position: 'relative'
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                        <Chip label={`Vehicle ${index + 1}`} color="primary" variant="outlined" size="small" />
                      </Box>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <InfoItem icon={<VpnKeyIcon />} label="Biển số" value={vehicle.licensePlate} />
                          <InfoItem icon={<CategoryIcon />} label="Loại xe" value={vehicle.vehicleType} />
                          <InfoItem icon={<BuildIcon />} label="Hãng xe" value={vehicle.vehicleMake} />
                          <InfoItem icon={<StorageIcon />} label="Tải trọng" value={vehicle.vehicleCapacity} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <InfoItem icon={<DirectionsCarIcon />} label="Mẫu xe" value={vehicle.vehicleModel} />
                          <InfoItem icon={<TimelineIcon />} label="Năm sản xuất" value={vehicle.vehicleYear} />
                          <InfoItem icon={<AspectRatioIcon />} label="Kích thước xe" value={vehicle.vehicleDimensions} />
                        </Grid>
                      </Grid>
                      <Typography variant="h5" sx={{ mb: 2 }}>
                        Hình ảnh xe
                      </Typography>
                      <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6}>
                          <ImageDisplay url={vehicle?.vehicleFrontView} title="Mặt trước" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <ImageDisplay url={vehicle?.vehicleBackView} title="Mặt sau" />
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => updateVehicleStatusHandler(vehicleIds[index], 'REJECTED')}
                          startIcon={<CloseIcon />}
                        >
                          Từ chối
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => updateVehicleStatusHandler(vehicleIds[index], 'APPROVED')}
                          startIcon={<CheckIcon />}
                        >
                          Chấp nhận
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No vehicle information available
                </Typography>
              </Box>
            )}
          </Box>
        </SimpleBar>
      </MainCard>
    </Modal>
  );
};

DriverVehicleModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  driver: PropTypes.object,
  vehicleIds: PropTypes.array
};

export default DriverVehicleModal;
