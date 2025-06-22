import PropTypes from 'prop-types';
import { Fragment, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';

// third-party
import { flexRender, getCoreRowModel, getSortedRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// project-import
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import EmptyReactTable from 'pages/tables/react-table/empty';

import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  SelectColumnSorting
} from 'components/third-party/react-table';

import { CheckOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import {
  useGetWithdraw,
  useGetWithdrawByStatus,
  useGetWithdrawByRequestDate,
  updateWithdrawById,
  batchUpdateWithdraws
} from 'api/withdraw';
// import WithdrawModal from 'sections/apps/withdraw/WithdrawModal';
import { format } from 'date-fns';

export const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta(itemRank);
  return itemRank.passed;
};

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data = [], columns, totalPages, currentPage, onPageChange, pageSize, onPageSizeChange }) {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const [sorting, setSorting] = useState([
    {
      id: 'withdrawId',
      desc: true
    }
  ]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      globalFilter
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: fuzzyFilter,
    manualPagination: true, // Tell the table we're doing server-side pagination
    pageCount: totalPages,
    debugTable: true
  });

  const backColor = alpha(theme.palette.primary.lighter, 0.1);
  let headers = [];
  columns.map(
    (columns) =>
      // @ts-ignore
      columns.accessorKey &&
      headers.push({
        label: typeof columns.header === 'string' ? columns.header : '#',
        // @ts-ignore
        key: columns.accessorKey
      })
  );

  const handleApproveSelected = async () => {
    const selectedIds = Object.keys(rowSelection).map((index) => data[parseInt(index)].withdrawId);
    if (selectedIds.length > 0) {
      await batchUpdateWithdraws(selectedIds, 'APPROVED');
      setRowSelection({});
    }
  };

  const handleRejectSelected = async () => {
    const selectedIds = Object.keys(rowSelection).map((index) => data[parseInt(index)].withdrawId);
    if (selectedIds.length > 0) {
      await batchUpdateWithdraws(selectedIds, 'REJECTED');
      setRowSelection({});
    }
  };

  // Custom pagination controls
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
    <MainCard
      content={false}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        boxShadow: theme.customShadows ? theme.customShadows.z1 : '0 4px 8px rgba(0,0,0,0.05)',
        '& .MuiCardContent-root': {
          p: 0
        }
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{
          p: 2.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          ...(matchDownSM && { '& .MuiOutlinedInput-root, & .MuiFormControl-root': { width: '100%' } })
        }}
      >
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search ${data?.length || 0} records...`}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5
            }
          }}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <SelectColumnSorting {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} />
          <Stack direction="row" spacing={2} alignItems="center">
            <CSVExport
              {...{
                data:
                  table.getSelectedRowModel().flatRows.map((row) => row.original).length === 0
                    ? data
                    : table.getSelectedRowModel().flatRows.map((row) => row.original),
                headers,
                filename: 'withdraw-list.csv'
              }}
            />
          </Stack>
        </Stack>
      </Stack>
      <ScrollX>
        <Stack>
          <RowSelection selected={Object.keys(rowSelection).length} />
          {Object.keys(rowSelection).length > 0 && (
            <Box sx={{ p: 2.5, bgcolor: alpha(theme.palette.primary.lighter, 0.15) }}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckOutlined />}
                  onClick={handleApproveSelected}
                  sx={{
                    borderRadius: 1.5,
                    boxShadow: theme.customShadows ? theme.customShadows.primary : '0 4px 6px rgba(0,0,0,0.1)',
                    '&:hover': {
                      boxShadow: theme.customShadows ? theme.customShadows.dark : '0 6px 10px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  Approve Selected
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CloseOutlined />}
                  onClick={handleRejectSelected}
                  sx={{
                    borderRadius: 1.5,
                    boxShadow: theme.customShadows ? theme.customShadows.error : '0 4px 6px rgba(0,0,0,0.1)',
                    '&:hover': {
                      boxShadow: theme.customShadows ? theme.customShadows.dark : '0 6px 10px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  Reject Selected
                </Button>
              </Stack>
            </Box>
          )}
          <TableContainer>
            <Table sx={{ minWidth: 750 }}>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    sx={{ backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50] }}
                  >
                    {headerGroup.headers.map((header) => {
                      if (header.column.columnDef.meta !== undefined && header.column.getCanSort()) {
                        Object.assign(header.column.columnDef.meta, {
                          className: header.column.columnDef.meta.className + ' cursor-pointer prevent-select'
                        });
                      }

                      return (
                        <TableCell
                          key={header.id}
                          {...header.column.columnDef.meta}
                          onClick={header.column.getToggleSortingHandler()}
                          {...(header.column.getCanSort() &&
                            header.column.columnDef.meta === undefined && {
                              className: 'cursor-pointer prevent-select'
                            })}
                          sx={{
                            py: 2,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            color: theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey[900]
                          }}
                        >
                          {header.isPlaceholder ? null : (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                              {header.column.getCanSort() && <HeaderSort column={header.column} />}
                            </Stack>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <TableRow
                      hover
                      sx={{
                        '&:last-of-type td, &:last-of-type th': { border: 0 },
                        '&:hover': { backgroundColor: alpha(theme.palette.primary.lighter, 0.05) }
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          {...cell.column.columnDef.meta}
                          sx={{
                            py: 2,
                            fontSize: '0.875rem'
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {row.getIsExpanded() && (
                      <TableRow sx={{ bgcolor: backColor, '&:hover': { bgcolor: `${backColor} !important` } }}>
                        <TableCell colSpan={row.getVisibleCells().length} sx={{ p: 0 }}>
                          <WithdrawDetail data={row.original} />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <>
            <Divider />
            <Box
              sx={{
                p: 2.5,
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50],
                borderBottomLeftRadius: 2,
                borderBottomRightRadius: 2
              }}
            >
              {/* Custom server-side pagination controls */}
              <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                <Box>
                  <FormControl variant="standard" sx={{ minWidth: 120 }}>
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
                  <Button
                    variant="outlined"
                    disabled={currentPage === 0}
                    onClick={handlePreviousPage}
                    sx={{ borderRadius: 1.5, minWidth: 100 }}
                  >
                    Previous
                  </Button>
                  <Box sx={{ mx: 2, fontWeight: 500 }}>
                    Page{' '}
                    <strong>
                      {currentPage + 1} of {Math.max(1, totalPages)}
                    </strong>
                  </Box>
                  <Button
                    variant="outlined"
                    disabled={currentPage >= totalPages - 1}
                    onClick={handleNextPage}
                    sx={{ borderRadius: 1.5, minWidth: 100 }}
                  >
                    Next
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </>
        </Stack>
      </ScrollX>
    </MainCard>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  totalPages: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
  pageSize: PropTypes.number,
  onPageSizeChange: PropTypes.func
};

// Withdraw Detail component for expanded row
const WithdrawDetail = ({ data }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: alpha(theme.palette.primary.lighter, 0.1),
        borderTop: `1px dashed ${theme.palette.divider}`,
        borderBottom: `1px dashed ${theme.palette.divider}`
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Ngân hàng:
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {data.bankName}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Số tài khoản:
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {data.bankAccountNumber}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Ngày yêu cầu:
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {data.requestDate ? format(new Date(data.requestDate), 'dd MMM yyyy HH:mm') : '-'}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Trạng duyệt:
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {data.processedDate ? format(new Date(data.processedDate), 'dd MMM yyyy HH:mm') : '-'}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

WithdrawDetail.propTypes = {
  data: PropTypes.object
};

// ==============================|| WITHDRAW LIST ||============================== //
const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' }
];

const WithdrawManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') ? new Date(searchParams.get('date')) : null);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('size') || '10', 10));

  // Use the updated hooks with pagination
  const { withdraws, withdrawsLoading, totalPages, currentPage, refetch: refetchAll } = useGetWithdraw(page, pageSize);

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

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setSelectedStatus(newStatus);
    setSelectedDate(null);
    setPage(0);
    updateUrlParams({ status: newStatus, date: null, page: 0 });
  };

  const handleDateChange = (date) => {
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;
    setSelectedDate(date);
    setSelectedStatus('');
    setPage(0);
    updateUrlParams({ date: formattedDate, status: '', page: 0 });
  };

  const clearFilters = () => {
    setSelectedStatus('');
    setSelectedDate(null);
    setPage(0);
    updateUrlParams({ status: null, date: null, page: 0 });
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

  const {
    withdrawsByStatus,
    totalPages: statusTotalPages,
    currentPage: statusCurrentPage,
    refetch: refetchByStatus
  } = useGetWithdrawByStatus(selectedStatus, page, pageSize);

  const {
    withdrawsByDate,
    totalPages: dateTotalPages,
    currentPage: dateCurrentPage,
    refetch: refetchByDate
  } = useGetWithdrawByRequestDate(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null, page, pageSize);

  // Determine which data and pagination to display based on filters
  let tableData = [];
  let displayTotalPages = 0;
  let displayCurrentPage = 0;

  if (selectedStatus) {
    tableData = withdrawsByStatus || [];
    displayTotalPages = statusTotalPages || 0;
    displayCurrentPage = statusCurrentPage || 0;
  } else if (selectedDate) {
    tableData = withdrawsByDate || [];
    displayTotalPages = dateTotalPages || 0;
    displayCurrentPage = dateCurrentPage || 0;
  } else {
    tableData = withdraws || [];
    displayTotalPages = totalPages || 0;
    displayCurrentPage = currentPage || 0;
  }

  const handleUpdateStatus = async (withdrawId, newStatus) => {
    try {
      await updateWithdrawById(withdrawId, { status: newStatus });
      // Refresh the appropriate data based on current filters
      if (selectedStatus) {
        refetchByStatus();
      } else if (selectedDate) {
        refetchByDate();
      } else {
        refetchAll();
      }
    } catch (error) {
      console.error('Error updating withdraw status:', error);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      {
        header: '#',
        accessorKey: 'withdrawId',
        meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'ID Tài khoản',
        accessorKey: 'accountId'
      },
      {
        header: 'Số tiền',
        accessorKey: 'amount',
        cell: ({ getValue }) => (
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.success.dark }}>
            {getValue().toLocaleString()} VND
          </Typography>
        ),
        meta: {
          className: 'cell-right'
        }
      },
      {
        header: 'Ngày yêu cầu',
        accessorKey: 'requestDate',
        cell: ({ getValue }) => (
          <Typography variant="subtitle2">{getValue() ? format(new Date(getValue()), 'dd MMM yyyy') : '-'}</Typography>
        )
      },
      {
        header: 'Trạng thái',
        accessorKey: 'status',
        cell: (cell) => {
          switch (cell.getValue()) {
            case 'PENDING':
              return (
                <Chip
                  color="warning"
                  label="Đang chờ"
                  size="small"
                  variant="light"
                  sx={{
                    fontWeight: 500,
                    borderRadius: '4px',
                    backgroundColor: alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.dark,
                    '.MuiChip-label': { px: 1.5, py: 0.5 }
                  }}
                />
              );
            case 'APPROVED':
              return (
                <Chip
                  color="success"
                  label="Đã duyệt"
                  size="small"
                  variant="light"
                  sx={{
                    fontWeight: 500,
                    borderRadius: '4px',
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.dark,
                    '.MuiChip-label': { px: 1.5, py: 0.5 }
                  }}
                />
              );
            case 'REJECTED':
              return (
                <Chip
                  color="error"
                  label="Đã từ chối"
                  size="small"
                  variant="light"
                  sx={{
                    fontWeight: 500,
                    borderRadius: '4px',
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.dark,
                    '.MuiChip-label': { px: 1.5, py: 0.5 }
                  }}
                />
              );
            default:
              return (
                <Chip
                  color="info"
                  label={cell.getValue()}
                  size="small"
                  variant="light"
                  sx={{
                    fontWeight: 500,
                    borderRadius: '4px',
                    '.MuiChip-label': { px: 1.5, py: 0.5 }
                  }}
                />
              );
          }
        }
      },
      {
        header: 'Hành động',
        meta: {
          className: 'cell-center'
        },
        disableSortBy: true,
        cell: ({ row }) => {
          const { status, withdrawId } = row.original;

          const collapseIcon =
            row.getCanExpand() && row.getIsExpanded() ? (
              <PlusOutlined style={{ color: theme.palette.primary.main, transform: 'rotate(45deg)', fontSize: '1.1rem' }} />
            ) : (
              <PlusOutlined style={{ fontSize: '1.1rem' }} />
            );

          return (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
              <Tooltip title="Xem chi tiết">
                <IconButton
                  color="secondary"
                  onClick={row.getToggleExpandedHandler()}
                  size="small"
                  sx={{
                    boxShadow: 1,
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.grey[100],
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.dark : theme.palette.grey[200]
                    }
                  }}
                >
                  {collapseIcon}
                </IconButton>
              </Tooltip>
              {status === 'PENDING' && (
                <>
                  <Tooltip title="Duyệt">
                    <IconButton
                      color="success"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(withdrawId, 'APPROVED');
                      }}
                      size="small"
                      sx={{
                        boxShadow: 1,
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        border: `1px solid ${theme.palette.success.light}`,
                        color: theme.palette.success.dark,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.success.main, 0.2)
                        }
                      }}
                    >
                      <CheckOutlined style={{ fontSize: '1.1rem' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Từ chối">
                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(withdrawId, 'REJECTED');
                      }}
                      size="small"
                      sx={{
                        boxShadow: 1,
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        border: `1px solid ${theme.palette.error.light}`,
                        color: theme.palette.error.dark,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.2)
                        }
                      }}
                    >
                      <CloseOutlined style={{ fontSize: '1.1rem' }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Stack>
          );
        }
      }
    ],
    // eslint-disable-next-line
    [theme, handleUpdateStatus]
  );

  if (withdrawsLoading) return <EmptyReactTable />;

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Quản lý rút tiền
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2.5}
        alignItems="center"
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 2,
          backgroundColor:
            theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.lighter, 0.3),
          border: `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.2) : theme.palette.primary.lighter}`
        }}
      >
        <FormControl sx={{ width: 220 }}>
          <InputLabel id="status-select-label">Filter by Status</InputLabel>
          <Select
            labelId="status-select-label"
            id="status-select"
            value={selectedStatus}
            label="Filter by Status"
            onChange={handleStatusChange}
            disabled={!!selectedDate}
            sx={{
              borderRadius: 1.5,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.divider
              }
            }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Filter by Request Date"
            value={selectedDate}
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} />}
            disabled={!!selectedStatus}
            slotProps={{
              textField: {
                fullWidth: true,
                margin: 'normal',
                sx: {
                  width: 220,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.divider
                    }
                  }
                }
              }
            }}
          />
        </LocalizationProvider>

        {(selectedStatus || selectedDate) && (
          <Button
            variant="outlined"
            onClick={clearFilters}
            sx={{
              borderRadius: 1.5,
              borderColor: theme.palette.divider,
              backgroundColor: theme.palette.background.paper,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              fontWeight: 500
            }}
          >
            Clear Filters
          </Button>
        )}
      </Stack>

      <ReactTable
        data={tableData}
        columns={columns}
        totalPages={displayTotalPages}
        currentPage={displayCurrentPage}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />
    </>
  );
};

export default WithdrawManagement;
