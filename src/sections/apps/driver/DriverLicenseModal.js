import React from 'react';
import PropTypes from 'prop-types';
import { Box, Modal, Button, Typography, Divider, Chip, Grid, Paper } from '@mui/material';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PhotoIcon from '@mui/icons-material/Photo';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import { updateLicenseStatus } from 'api/driver';
import { openSnackbar } from 'api/snackbar';

const DriverLicenseModal = ({ open, modalToggler, driver, licenseId, refetchDrivers }) => {
  const closeModal = () => modalToggler(false);

  const isLicenseInfoAvailable =
    driver?.license?.licenseNumber &&
    driver?.license?.licenseType &&
    driver?.license?.licenseIssuedDate &&
    driver?.license?.licenseExpiryDate &&
    driver?.license?.licenseFrontView &&
    driver?.license?.licenseBackView;

  const updateLicenseStatusHandler = (status) => {
    if (licenseId) {
      updateLicenseStatus(licenseId, status)
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
      alert('No valid license ID.');
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
      aria-labelledby="modal-driver-license"
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
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4">
                <DriveEtaIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                Chi tiết bằng láy
              </Typography>
              {driver?.license?.isVerified && (
                <Chip icon={<CheckIcon fontSize="small" />} label="Verified" color="success" variant="outlined" size="small" />
              )}
            </Box>

            {isLicenseInfoAvailable ? (
              <>
                <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <InfoItem icon={<BadgeIcon />} label="Số bằng lái" value={driver?.license?.licenseNumber} />
                      <InfoItem icon={<DriveEtaIcon />} label="Loại bằng lái" value={driver?.license?.licenseType} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoItem icon={<CalendarTodayIcon />} label="Ngày cấp" value={driver?.license?.licenseIssuedDate} />
                      <InfoItem icon={<CalendarTodayIcon />} label="Ngày hết hạn" value={driver?.license?.licenseExpiryDate} />
                      <InfoItem icon={<LocationCityIcon />} label="Cơ quan ban hành" value={driver?.license?.issuingAuthority} />
                    </Grid>
                  </Grid>
                </Paper>

                <Typography variant="h5" sx={{ mb: 2 }}>
                  Hình ảnh
                </Typography>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <ImageDisplay url={driver?.license?.licenseFrontView} title="Mặt trước" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ImageDisplay url={driver?.license?.licenseBackView} title="Mặt sau" />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" color="error" onClick={() => updateLicenseStatusHandler('REJECTED')} startIcon={<CloseIcon />}>
                    Từ chối
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => updateLicenseStatusHandler('APPROVED')}
                    startIcon={<CheckIcon />}
                  >
                    Chấp nhận
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No license information available
                </Typography>
              </Box>
            )}
          </Box>
        </SimpleBar>
      </MainCard>
    </Modal>
  );
};

DriverLicenseModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  driver: PropTypes.object,
  licenseId: PropTypes.string.isRequired
};

export default DriverLicenseModal;
