import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

// material-ui
import {
  Box,
  Modal,
  Typography,
  Grid,
  Divider,
  ImageList,
  ImageListItem,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  useTheme,
  alpha,
  Button,
  Stack
} from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import { openSnackbar } from 'api/snackbar';
import { updateInsuranceClaimStatus } from 'api/insuranceClaim';

// assets
import { CloseOutlined, ExpandOutlined, CheckOutlined, CloseCircleOutlined } from '@ant-design/icons';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Status chip component
const StatusChip = ({ status }) => {
  let color;
  let label = status;

  switch (status) {
    case 'PENDING':
      color = 'warning';
      label = 'Đang chờ xử lý';
      break;
    case 'APPROVED':
      color = 'success';
      label = 'Đã phê duyệt';
      break;
    case 'REJECTED':
      color = 'error';
      label = 'Đã từ chối';
      break;
    default:
      color = 'default';
  }

  return <Chip color={color} label={label} size="small" />;
};

StatusChip.propTypes = {
  status: PropTypes.string
};

const InsuranceClaimDetailModal = ({ open, modalToggler, claimData, refetch }) => {
  const theme = useTheme();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const closeModal = () => modalToggler(false);

  // Handle approve action
  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await updateInsuranceClaimStatus(claimData.id, { claimStatus: 'APPROVED' });
      openSnackbar({
        open: true,
        message: 'Claim approved successfully',
        variant: 'alert',
        alert: { color: 'success' }
      });
      refetch();
      closeModal();
    } catch (error) {
      console.error('Error approving claim:', error);
      openSnackbar({
        open: true,
        message: 'Failed to approve claim',
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reject action
  const handleReject = async () => {
    try {
      setIsSubmitting(true);
      await updateInsuranceClaimStatus(claimData.id, { claimStatus: 'REJECTED' });
      openSnackbar({
        open: true,
        message: 'Claim rejected successfully',
        variant: 'alert',
        alert: { color: 'success' }
      });
      refetch();
      closeModal();
    } catch (error) {
      console.error('Error rejecting claim:', error);
      openSnackbar({
        open: true,
        message: 'Failed to reject claim',
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = useMemo(
    () => (
      <>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4">Chi tiết yêu cầu bảo hiểm</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              {claimData?.claimStatus === 'PENDING' ? (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckOutlined />}
                    onClick={handleApprove}
                    disabled={isSubmitting}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<CloseCircleOutlined />}
                    onClick={handleReject}
                    disabled={isSubmitting}
                  >
                    Reject
                  </Button>
                </>
              ) : (
                <StatusChip status={claimData?.claimStatus} />
              )}
            </Stack>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            {/* Basic Information Card */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: alpha(theme.palette.primary.lighter, 0.1) }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main }}>
                    Thông tin cơ bản
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        ID Yêu cầu
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {claimData?.id || '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        ID Bảo hiểm đặt xe
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {claimData?.bookingInsuranceId || '-'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Description Card */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ color: theme.palette.grey[800] }}>
                    Mô tả yêu cầu
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {claimData?.claimDescription || '-'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Dates Card */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: alpha(theme.palette.success.lighter, 0.1) }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ color: theme.palette.success.dark }}>
                    Thông tin thời gian
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Ngày yêu cầu
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(claimData?.claimDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Ngày giải quyết
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(claimData?.resolutionDate)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Evidence Images Card */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ color: theme.palette.grey[800] }}>
                    Hình ảnh bằng chứng
                  </Typography>
                  {claimData?.evidenceImageList && claimData.evidenceImageList.length > 0 ? (
                    <ImageList sx={{ width: '100%', mt: 2 }} cols={2} gap={16}>
                      {claimData.evidenceImageList.map((imageUrl, index) => (
                        <ImageListItem 
                          key={index}
                          sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 1,
                            overflow: 'hidden',
                            '&:hover': {
                              '& .MuiIconButton-root': {
                                opacity: 1
                              }
                            }
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt={`Evidence ${index + 1}`}
                            loading="lazy"
                            style={{ height: '200px', width: '100%', objectFit: 'cover' }}
                          />
                          <IconButton
                            sx={{
                              position: 'absolute',
                              right: 8,
                              top: 8,
                              bgcolor: 'rgba(255, 255, 255, 0.8)',
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.95)'
                              }
                            }}
                            onClick={() => setSelectedImage(imageUrl)}
                          >
                            <ExpandOutlined />
                          </IconButton>
                        </ImageListItem>
                      ))}
                    </ImageList>
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                      Không có hình ảnh
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Image Preview Dialog */}
        <Dialog
          open={Boolean(selectedImage)}
          onClose={() => setSelectedImage(null)}
          maxWidth="lg"
          fullWidth
        >
          <DialogContent sx={{ p: 1 }}>
            <IconButton
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.95)'
                }
              }}
              onClick={() => setSelectedImage(null)}
            >
              <CloseOutlined />
            </IconButton>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Preview"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 'calc(100vh - 64px)',
                  objectFit: 'contain'
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </>
    ),
    [claimData, selectedImage, theme, isSubmitting]
  );

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-insurance-claim-detail-label"
          aria-describedby="modal-insurance-claim-detail-description"
          sx={{
            '& .MuiPaper-root:focus': {
              outline: 'none'
            }
          }}
        >
          <MainCard
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'calc(100% - 48px)',
              minWidth: 340,
              maxWidth: 880,
              height: 'auto',
              maxHeight: 'calc(100vh - 48px)',
              bgcolor: theme.palette.background.paper
            }}
            modal
            content={false}
          >
            <SimpleBar
              sx={{
                maxHeight: 'calc(100vh - 48px)',
                '& .simplebar-content': {
                  display: 'flex',
                  flexDirection: 'column'
                }
              }}
            >
              {content}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
};

InsuranceClaimDetailModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  claimData: PropTypes.object,
  refetch: PropTypes.func
};

export default InsuranceClaimDetailModal; 