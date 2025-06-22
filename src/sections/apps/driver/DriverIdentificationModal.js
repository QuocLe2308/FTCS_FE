import React from 'react';
import PropTypes from 'prop-types';
import { Box, Modal, Button, Typography, Divider, Chip, Grid, Paper } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import PhotoIcon from '@mui/icons-material/Photo';
import { updateStatus } from 'api/driver';
import { openSnackbar } from 'api/snackbar';

const DriverIdentificationModal = ({ open, modalToggler, driver, driverIdentificationId, refetchDrivers }) => {
  const closeModal = () => modalToggler(false);

  const isDriverInfoAvailable =
    driver?.driverIdentity?.driverFullName &&
    driver?.driverIdentity?.driverIDNumber &&
    driver?.driverIdentity?.driverFrontView &&
    driver?.driverIdentity?.driverBackView;

  const isValidAddress = (address) => {
    return (
      address?.addressType ||
      address?.streetAddress ||
      address?.wardName ||
      address?.districtName ||
      address?.provinceId ||
      address?.addressNotes
    );
  };

  const updateDriverStatus = (status) => {
    if (driverIdentificationId) {
      updateStatus(driverIdentificationId, status)
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
      alert('No valid driver ID.');
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

  const IdImageDisplay = ({ url, title }) => (
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
          borderRadius: 2,
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
            transition: 'opacity 0.2s ease-in-out'
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={() => window.open(url, '_blank')}
            sx={{
              bgcolor: 'common.white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'common.white',
                opacity: 0.9
              }
            }}
          >
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
      aria-labelledby="modal-driver-identification"
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
              <Typography variant="h4">Căn cước công dân </Typography>
              {driver?.driverIdentity?.driverIDVerified && (
                <Chip icon={<CheckIcon fontSize="small" />} label="Verified" color="success" variant="outlined" size="small" />
              )}
            </Box>

            {isDriverInfoAvailable ? (
              <>
                <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <InfoItem icon={<PersonIcon />} label="Họ và tên" value={driver?.driverIdentity?.driverFullName} />
                      <InfoItem icon={<BadgeIcon />} label="ID" value={driver?.driverIdentity?.driverIDNumber} />
                      <InfoItem icon={<PersonIcon />} label="Giới tính" value={driver?.driverIdentity?.driverGender} />
                      <InfoItem icon={<CalendarTodayIcon />} label="Ngày sinh" value={driver?.driverIdentity?.driverBirthday} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoItem icon={<LocationOnIcon />} label="Quốc gia" value={driver?.driverIdentity?.driverCountry} />
                      <InfoItem icon={<BadgeIcon />} label="Được cấp bởi" value={driver?.driverIdentity?.driverIDIssuedBy} />
                      <InfoItem icon={<CalendarTodayIcon />} label="Ngày cấp" value={driver?.driverIdentity?.driverIDIssueDate} />
                      <InfoItem icon={<CalendarTodayIcon />} label="Expiry Date" value={driver?.driverIdentity?.driverIDExpiryDate} />
                    </Grid>
                  </Grid>
                </Paper>

                <Typography variant="h5" sx={{ mb: 2 }}>
                  Hỉnh ảnh căn cước
                </Typography>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <IdImageDisplay url={driver?.driverIdentity?.driverFrontView} title="Mặt trước" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <IdImageDisplay url={driver?.driverIdentity?.driverBackView} title="Mặt sau" />
                  </Grid>
                </Grid>

                {driver?.addressList?.length > 0 && (
                  <>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      Địa chi
                    </Typography>
                    <Grid container spacing={2}>
                      {driver.addressList.map(
                        (address, index) =>
                          isValidAddress(address) && (
                            <Grid item xs={12} key={index}>
                              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Box sx={{ mb: 1 }}>
                                  <Chip label={address?.addressType || 'Address'} size="small" sx={{ mb: 1 }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                  {[address?.streetAddress, address?.wardName, address?.districtName, address?.provinceId]
                                    .filter(Boolean)
                                    .join(', ')}
                                </Typography>
                                {address?.addressNotes && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Note: {address.addressNotes}
                                  </Typography>
                                )}
                              </Paper>
                            </Grid>
                          )
                      )}
                    </Grid>
                  </>
                )}

                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" color="error" onClick={() => updateDriverStatus('REJECTED')} startIcon={<CloseIcon />}>
                    Từ chối
                  </Button>
                  <Button variant="contained" color="success" onClick={() => updateDriverStatus('APPROVED')} startIcon={<CheckIcon />}>
                    Chấp nhận
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Không có thông tin tài xế
                </Typography>
              </Box>
            )}
          </Box>
        </SimpleBar>
      </MainCard>
    </Modal>
  );
};

DriverIdentificationModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  driver: PropTypes.object,
  driverIdentificationId: PropTypes.string.isRequired
};

export default DriverIdentificationModal;
