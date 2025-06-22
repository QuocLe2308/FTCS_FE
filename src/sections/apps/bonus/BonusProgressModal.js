import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// material-ui
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Button
} from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useGetBonusProgress } from 'api/bonus';
import EmptyReactTable from 'pages/tables/react-table/empty';

// assets
import { CloseOutlined } from '@ant-design/icons';

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const BonusProgressModal = ({ open, onClose, bonusConfig }) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const {
    bonusProgress,
    bonusProgressLoading,
    totalPages,
    currentPage
  } = useGetBonusProgress(open ? bonusConfig?.bonusConfigurationId : null, page, pageSize);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(0);
  };

  // Reset pagination when modal opens
  useEffect(() => {
    if (open) {
      setPage(0);
      setPageSize(10);
    }
  }, [open]);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{ '& .MuiDialog-paper': { p: 0 } }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography variant="h4">Tiến trình thưởng - {bonusConfig?.bonusName}</Typography>
          <IconButton onClick={onClose} size="medium">
            <CloseOutlined />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {bonusProgressLoading ? (
          <EmptyReactTable />
        ) : (
          <MainCard content={false}>
            <ScrollX>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tài xế</TableCell>
                      <TableCell align="center">Số chuyến hoàn thành</TableCell>
                      <TableCell align="right">Doanh thu hiện tại</TableCell>
                      <TableCell align="center">Tiến độ (%)</TableCell>
                      <TableCell align="center">Trạng thái</TableCell>
                      <TableCell align="center">Ngày đạt</TableCell>
                      <TableCell align="center">Ngày thưởng</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bonusProgress?.map((progress) => (
                      <TableRow key={progress.driverBonusProgressId}>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="subtitle1">{progress.driverAccount.fullName}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {progress.driverAccount.phone}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="subtitle1">
                            {progress.completedTrips}/{bonusConfig.targetTrips}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle1">
                            {formatCurrency(progress.currentRevenue)}/{formatCurrency(bonusConfig.revenueTarget)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="subtitle1">{progress.progressPercentage}%</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={progress.bonusStatus}
                            color={
                              progress.bonusStatus === 'Rewarded'
                                ? 'success'
                                : progress.isAchieved
                                ? 'primary'
                                : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">{formatDate(progress.achievedDate)}</TableCell>
                        <TableCell align="center">{formatDate(progress.rewardedDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControl variant="standard" sx={{ minWidth: 100 }}>
                  <Select value={pageSize} onChange={handlePageSizeChange}>
                    {[5, 10, 25, 50].map((size) => (
                      <MenuItem key={size} value={size}>
                        {size} rows
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    variant="text"
                    disabled={currentPage === 0}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Box>
                    Page{' '}
                    <strong>
                      {currentPage + 1} of {Math.max(1, totalPages)}
                    </strong>
                  </Box>
                  <Button
                    variant="text"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </Button>
                </Stack>
              </Box>
            </ScrollX>
          </MainCard>
        )}
      </DialogContent>
    </Dialog>
  );
};

BonusProgressModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  bonusConfig: PropTypes.object
};

export default BonusProgressModal; 