import PropTypes from 'prop-types';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Paper,
  InputAdornment,
  OutlinedInput,
  useMediaQuery
} from '@mui/material';
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';
import { CSVExport, DebouncedInput, HeaderSort } from 'components/third-party/react-table';
import { useGetSchedules, useGetTripAgreementByScheduleId } from 'api/schedules';
import { DeleteOutlined, EditOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import ScheduleModal from 'sections/apps/schedule/ScheduleModal';
import AlertScheduleDelete from 'sections/apps/schedule/AlertScheduleDelete';
import EmptyReactTable from 'pages/tables/react-table/empty';

function ReactTable({ data, columns, modalToggler, totalPages, currentPage, onPageChange, pageSize, onPageSizeChange }) {
  const [sorting, setSorting] = useState([{ id: 'scheduleId', desc: true }]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true, // Enable server-side pagination
    pageCount: totalPages,
    debugTable: true
  });

  const headers = columns
    .filter((col) => col.accessorKey)
    .map((col) => ({
      label: typeof col.header === 'string' ? col.header : '#',
      key: col.accessorKey
    }));

  // Custom pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    onPageSizeChange(newSize);
  };

  return (
    <MainCard content={false}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between" sx={{ padding: 2 }}>
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search ${data.length} schedules...`}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={modalToggler}>
            Thêm
          </Button>
          <CSVExport data={data} headers={headers} filename="schedule-list.csv" />
        </Stack>
      </Stack>
      <ScrollX>
        <TableContainer>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      sx={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                        {header.column.getCanSort() && <HeaderSort column={header.column} />}
                      </Stack>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <Box sx={{ p: 2 }}>
          {/* Custom server-side pagination controls */}
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
            <Box>
              <FormControl variant="standard" sx={{ minWidth: 100 }}>
                <Select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  label="Rows per page"
                  displayEmpty
                  inputProps={{ 'aria-label': 'Rows per page' }}
                >
                  {[5, 10, 25, 50].map((size) => (
                    <MenuItem key={size} value={size}>
                      {size} rows
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="text" disabled={currentPage === 0} onClick={handlePreviousPage}>
                Previous
              </Button>
              <Box>
                Page{' '}
                <strong>
                  {currentPage + 1} of {Math.max(1, totalPages)}
                </strong>
              </Box>
              <Button variant="text" disabled={currentPage >= totalPages - 1} onClick={handleNextPage}>
                Next
              </Button>
            </Stack>
          </Stack>
        </Box>
      </ScrollX>
    </MainCard>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  modalToggler: PropTypes.func,
  totalPages: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
  pageSize: PropTypes.number,
  onPageSizeChange: PropTypes.func
};

const TripAgreementModal = ({ open, onClose, scheduleId }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [searchTerm, setSearchTerm] = useState('');
  const { tripAgreements, tripAgreementsLoading } = useGetTripAgreementByScheduleId(scheduleId, 0, 10);

  const filteredAgreements = useMemo(() => {
    if (!tripAgreements) return [];
    return tripAgreements.filter(
      (agreement) =>
        agreement.id.toString().includes(searchTerm) ||
        agreement.bookingId.toString().includes(searchTerm) ||
        agreement.driverId.toString().includes(searchTerm) ||
        agreement.customerId.toString().includes(searchTerm) ||
        agreement.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agreement.agreementStatus.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tripAgreements, searchTerm]);

  const getStatusColor = (status, type = 'payment') => {
    if (type === 'payment') {
      return {
        PAID: {
          color: theme.palette.success.main,
          backgroundColor: theme.palette.success.lighter,
          icon: '💰'
        },
        PAIR: {
          color: theme.palette.warning.main,
          backgroundColor: theme.palette.warning.lighter,
          icon: '⌛'
        },
        UNPAID: {
          color: theme.palette.error.main,
          backgroundColor: theme.palette.error.lighter,
          icon: '❌'
        }
      }[status] || { color: theme.palette.grey[500], backgroundColor: theme.palette.grey[100], icon: '❓' };
    }
    
    return {
      COMPLETED: {
        color: theme.palette.success.main,
        backgroundColor: theme.palette.success.lighter,
        icon: '✅'
      },
      IN_TRANSIT: {
        color: theme.palette.info.main,
        backgroundColor: theme.palette.info.lighter,
        icon: '🚚'
      },
      CANCELLED: {
        color: theme.palette.error.main,
        backgroundColor: theme.palette.error.lighter,
        icon: '🚫'
      }
    }[status] || { color: theme.palette.grey[500], backgroundColor: theme.palette.grey[100], icon: '❓' };
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth 
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.customShadows.z24
        }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>
              Trip Agreements
            </Typography>
            <Chip 
              label={tripAgreements?.length || 0} 
              color="primary" 
              size="small"
              sx={{ borderRadius: '16px' }}
            />
          </Stack>
          <IconButton onClick={onClose} color="error" size="small">
            <DeleteOutlined />
          </IconButton>
        </Stack>
        <OutlinedInput
          fullWidth
          placeholder="Search agreements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mt: 2 }}
          startAdornment={
            <InputAdornment position="start">
              <EyeOutlined style={{ color: theme.palette.grey[500] }} />
            </InputAdornment>
          }
        />
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 2 }}>
        {tripAgreementsLoading ? (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ py: 3, px: 2, backgroundColor: theme.palette.grey[50] }}>Agreement Details</TableCell>
                  <TableCell sx={{ py: 3, px: 2, backgroundColor: theme.palette.grey[50] }}>Customer & Driver</TableCell>
                  <TableCell sx={{ py: 3, px: 2, backgroundColor: theme.palette.grey[50] }}>Status</TableCell>
                  <TableCell sx={{ py: 3, px: 2, backgroundColor: theme.palette.grey[50] }}>Trip Info</TableCell>
                  <TableCell sx={{ py: 3, px: 2, backgroundColor: theme.palette.grey[50] }}>Payment</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAgreements.map((agreement) => {
                  const paymentStatus = getStatusColor(agreement.paymentStatus, 'payment');
                  const agreementStatus = getStatusColor(agreement.agreementStatus, 'agreement');
                  
                  return (
                    <TableRow key={agreement.id} hover>
                      <TableCell sx={{ py: 2, px: 2 }}>
                        <Stack spacing={1}>
                          <Typography variant="subtitle1" color="primary">
                            #{agreement.id}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Created: {new Date(agreement.createAt).toLocaleString()}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ py: 2, px: 2 }}>
                        <Stack spacing={1}>
                          <Typography variant="body2">
                            Customer ID: <strong>{agreement.customerId}</strong>
                          </Typography>
                          <Typography variant="body2">
                            Driver ID: <strong>{agreement.driverId}</strong>
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ py: 2, px: 2 }}>
                        <Stack spacing={1}>
                          <Chip
                            icon={<span>{agreementStatus.icon}</span>}
                            label={agreement.agreementStatus}
                            sx={{
                              color: agreementStatus.color,
                              backgroundColor: agreementStatus.backgroundColor,
                              '& .MuiChip-icon': { color: 'inherit' }
                            }}
                          />
                          <Chip
                            icon={<span>{paymentStatus.icon}</span>}
                            label={agreement.paymentStatus}
                            sx={{
                              color: paymentStatus.color,
                              backgroundColor: paymentStatus.backgroundColor,
                              '& .MuiChip-icon': { color: 'inherit' }
                            }}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ py: 2, px: 2 }}>
                        <Stack spacing={1}>
                          <Typography variant="body2">
                            Distance: <strong>{agreement.distance} km</strong>
                          </Typography>
                          <Typography variant="body2">
                            Duration: <strong>{agreement.estimatedDuration} min</strong>
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ py: 2, px: 2 }}>
                        <Typography 
                          variant="h6" 
                          color={agreement.totalPrice > 0 ? 'success.main' : 'warning.main'}
                          sx={{ fontWeight: 600 }}
                        >
                          {agreement.totalPrice.toLocaleString('vi-VN')} VND
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2.5 }}>
        <Button
          variant="contained"
          onClick={onClose}
          color="primary"
          startIcon={<DeleteOutlined />}
          sx={{
            bgcolor: theme.palette.grey[200],
            color: theme.palette.grey[800],
            '&:hover': {
              bgcolor: theme.palette.grey[300]
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

TripAgreementModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  scheduleId: PropTypes.number
};

const ScheduleListPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get pagination parameters from URL or use defaults
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('size') || '10', 10));
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const [open, setOpen] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleDeleteId, setScheduleDeleteId] = useState('');
  const [tripAgreementModalOpen, setTripAgreementModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);

  // Use the updated schedules hook with pagination
  const { schedules: lists, schedulesLoading, schedulesError, totalPages, currentPage, refetch } = useGetSchedules(page, pageSize);

  const updateUrlParams = (params) => {
    const newSearchParams = new URLSearchParams(searchParams);

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === '') {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    });

    navigate(`?${newSearchParams.toString()}`, { replace: true });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateUrlParams({ page: newPage });
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(0);
    updateUrlParams({ size: newSize, page: 0 });
  };

  const handleClose = () => setOpen(!open);

  useEffect(() => {
    if (shouldRefetch) {
      refetch();
      setShouldRefetch(false);
    }
  }, [shouldRefetch, refetch]);

  const columns = useMemo(
    () => [
      {
        header: 'ID',
        accessorKey: 'scheduleId'
      },
      {
        header: 'ID tải khoản',
        accessorKey: 'accountId'
      },
      {
        header: 'Điểm đón',
        accessorKey: 'startLocationAddress',
        cell: ({ getValue }) => <Typography>{getValue()}</Typography>
      },
      {
        header: 'Điểm đến',
        accessorKey: 'endLocationAddress',
        cell: ({ getValue }) => <Typography>{getValue()}</Typography>
      },
      {
        header: 'Ngày bắt đầu',
        accessorKey: 'startDate',
        cell: ({ getValue }) => new Date(getValue()).toLocaleString()
      },
      {
        header: 'Ngày kết thúc',
        accessorKey: 'endDate',
        cell: ({ getValue }) => new Date(getValue()).toLocaleString()
      },
      {
        header: 'Trạng thái',
        accessorKey: 'status',
        cell: ({ getValue }) => (
          <Chip
            color={getValue() === 'GETTING_TO_THE_POINT' ? 'info' : getValue() === 'COMPLETED' ? 'success' : 'warning'}
            label={getValue()}
            size="small"
            variant="light"
          />
        )
      },
      {
        header: 'Actions',
        accessorKey: 'actions',
        cell: ({ row }) => (
          <Stack direction="row" alignItems="center" spacing={0}>
            <Tooltip title="View Trip Agreements">
              <IconButton
                color="primary"
                onClick={() => {
                  setSelectedScheduleId(row.original.scheduleId);
                  setTripAgreementModalOpen(true);
                }}
              >
                <EyeOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                color="primary"
                onClick={() => {
                  setSelectedSchedule(row.original);
                  setScheduleModal(true);
                }}
              >
                <EditOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                color="error"
                onClick={() => {
                  handleClose();
                  setScheduleDeleteId(row.original.scheduleId);
                }}
              >
                <DeleteOutlined />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    [theme]
  );

  if (schedulesLoading) return <EmptyReactTable />;
  if (schedulesError) return <Typography>Error loading schedules: {schedulesError.message}</Typography>;

  return (
    <MainCard>
      <ReactTable
        data={lists || []}
        columns={columns}
        totalPages={totalPages || 0}
        currentPage={currentPage || 0}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        modalToggler={() => {
          setScheduleModal(true);
          setSelectedSchedule(null);
        }}
      />
      <AlertScheduleDelete
        id={scheduleDeleteId}
        title={scheduleDeleteId}
        open={open}
        handleClose={handleClose}
        onDeleteSuccess={() => setShouldRefetch(true)}
      />
      <ScheduleModal
        open={scheduleModal}
        modalToggler={setScheduleModal}
        schedule={selectedSchedule}
        onSuccess={() => {
          setShouldRefetch(true);
          setScheduleModal(false);
        }}
      />
      <TripAgreementModal
        open={tripAgreementModalOpen}
        onClose={() => setTripAgreementModalOpen(false)}
        scheduleId={selectedScheduleId}
      />
    </MainCard>
  );
};

export default ScheduleListPage;
