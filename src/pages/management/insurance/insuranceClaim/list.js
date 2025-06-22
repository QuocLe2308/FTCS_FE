import PropTypes from 'prop-types';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  TextField
} from '@mui/material';

// third-party
import { flexRender, getCoreRowModel, getSortedRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

// Import icons
import { SearchOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';

// project-import
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import EmptyReactTable from 'pages/tables/react-table/empty';

import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  SelectColumnSorting
} from 'components/third-party/react-table';

// Import the hooks from api
import { useGetAllInsuranceClaims, updateInsuranceClaimStatus, useGetInsuranceClaimsByDateRange, useGetInsuranceClaimsByStatus } from 'api/insuranceClaim';
import { openSnackbar } from 'api/snackbar';
import InsuranceClaimDetailModal from 'sections/apps/insurance/insuranceClaim/InsuranceClaimDetailModal';

export const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta(itemRank);
  return itemRank.passed;
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Tab Panel component for the tabbed interface
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`insurance-claim-tabpanel-${index}`}
      aria-labelledby={`insurance-claim-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
};

function a11yProps(index) {
  return {
    id: `insurance-claim-tab-${index}`,
    'aria-controls': `insurance-claim-tabpanel-${index}`
  };
}

// Status chip component
const StatusChip = ({ status }) => {
  let color;
  let label = status;

  switch (status) {
    case 'PENDING':
      color = 'warning';
      label = 'Pending';
      break;
    case 'APPROVED':
      color = 'success';
      label = 'Approved';
      break;
    case 'REJECTED':
      color = 'error';
      label = 'Rejected';
      break;
    default:
      color = 'default';
  }

  return <Chip color={color} label={label} size="small" />;
};

StatusChip.propTypes = {
  status: PropTypes.string
};

function ReactTable({ data, columns, totalPages, currentPage, onPageChange, pageSize, onPageSizeChange }) {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const [sorting, setSorting] = useState([
    {
      id: 'id',
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
      columns.accessorKey &&
      headers.push({
        label: typeof columns.header === 'string' ? columns.header : '#',
        key: columns.accessorKey
      })
  );

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
    <MainCard content={false}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ padding: 2, ...(matchDownSM && { '& .MuiOutlinedInput-root, & .MuiFormControl-root': { width: '100%' } }) }}
      >
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search ${data?.length || 0} records...`}
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
                filename: 'insurance-claims.csv'
              }}
            />
          </Stack>
        </Stack>
      </Stack>
      <ScrollX>
        <Stack>
          <RowSelection selected={Object.keys(rowSelection).length} />
          <TableContainer>
            <Table>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
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
                    <TableRow>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {row.getIsExpanded() && (
                      <TableRow sx={{ bgcolor: backColor, '&:hover': { bgcolor: `${backColor} !important` } }}>
                        <TableCell colSpan={row.getVisibleCells().length}>{/* Expandable content if needed */}</TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <>
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

const InsuranceClaimManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get pagination parameters from URL or use defaults
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('size') || '10', 10));
  const [tabValue, setTabValue] = useState(0);
  const [shouldRefetch, setShouldRefetch] = useState(false);

  // Date range search
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [usingDateRange, setUsingDateRange] = useState(false);

  // Use the insurance claims hook based on the active tab
  const tabStatus = useMemo(() => {
    switch (tabValue) {
      case 1:
        return 'PENDING';
      case 2:
        return 'APPROVED';
      case 3:
        return 'REJECTED';
      default:
        return null;
    }
  }, [tabValue]);

  // Get claims data based on filters
  const dateRangeResult = useGetInsuranceClaimsByDateRange(
    usingDateRange && startDate ? startDate.toISOString().split('T')[0] : null,
    usingDateRange && endDate ? endDate.toISOString().split('T')[0] : null,
    page,
    pageSize
  );

  const allClaimsResult = useGetAllInsuranceClaims(
    !usingDateRange ? page : 0,
    !usingDateRange ? pageSize : 10
  );

  const statusResult = useGetInsuranceClaimsByStatus(tabStatus, page, pageSize);

  // Use appropriate data source
  const { insuranceClaims, totalPages, currentPage, insuranceClaimsLoading } = 
    usingDateRange 
      ? dateRangeResult 
      : tabValue === 0 
        ? allClaimsResult 
        : statusResult;

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0); // Reset page when changing tabs
    
    // Clear date range when changing tabs
    if (usingDateRange) {
      setUsingDateRange(false);
      setStartDate(null);
      setEndDate(null);
    }
    
    updateUrlParams({ tab: newValue, page: 0 });
  };

  // Handle date range search
  const handleDateRangeSearch = () => {
    if (startDate && endDate) {
      setUsingDateRange(true);
      setPage(0);
      setShouldRefetch(true);
      updateUrlParams({
        page: 0,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
    } else {
      openSnackbar({
        open: true,
        message: 'Please select both start and end dates',
        variant: 'alert',
        alert: { color: 'warning' }
      });
    }
  };

  // Clear date range filters
  const handleClearDateRange = () => {
    setUsingDateRange(false);
    setStartDate(null);
    setEndDate(null);
    setPage(0);
    setShouldRefetch(true);
    updateUrlParams({ page: 0 });
  };

  useEffect(() => {
    if (shouldRefetch) {
      if (usingDateRange) {
        dateRangeResult.refetch();
      } else if (tabValue === 0) {
        allClaimsResult.refetch();
      } else {
        statusResult.refetch();
      }
      setShouldRefetch(false);
    }
  }, [shouldRefetch, usingDateRange, dateRangeResult, statusResult, allClaimsResult, tabValue]);

  // Handle approve action
  const handleApprove = async (claimId) => {
    try {
      await updateInsuranceClaimStatus(claimId, { claimStatus: 'APPROVED' });
      openSnackbar({
        open: true,
        message: 'Claim approved successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'success'
        }
      });
      setShouldRefetch(true);
    } catch (error) {
      console.error('Error approving claim:', error);
      openSnackbar({
        open: true,
        message: 'Failed to approve claim',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'error'
        }
      });
    }
  };

  // Handle reject action
  const handleReject = async (claimId) => {
    try {
      await updateInsuranceClaimStatus(claimId, { claimStatus: 'REJECTED' });
      openSnackbar({
        open: true,
        message: 'Claim rejected successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'success'
        }
      });
      setShouldRefetch(true);
    } catch (error) {
      console.error('Error rejecting claim:', error);
      openSnackbar({
        open: true,
        message: 'Failed to reject claim',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'error'
        }
      });
    }
  };

  const [detailModal, setDetailModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);

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
        header: 'ID',
        accessorKey: 'id',
        meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'Mã bảo hiểm đặt xe',
        accessorKey: 'bookingInsuranceId',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue()}</Typography>
      },
      {
        header: 'Mô tả',
        accessorKey: 'claimDescription',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue()}</Typography>
      },
      {
        header: 'Trạng thái',
        accessorKey: 'claimStatus',
        cell: ({ getValue }) => <StatusChip status={getValue()} />
      },
      {
        header: 'Ngày khiếu nại',
        accessorKey: 'claimDate',
        cell: ({ getValue }) => <Typography variant="subtitle1">{formatDate(getValue())}</Typography>
      },
      {
        header: 'Ngày giải quyết',
        accessorKey: 'resolutionDate',
        cell: ({ getValue }) => <Typography variant="subtitle1">{formatDate(getValue())}</Typography>
      },
      {
        header: 'Ngày tạo',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => <Typography variant="subtitle1">{formatDate(getValue())}</Typography>
      },
      {
        header: 'Ngày cập nhật',
        accessorKey: 'updatedAt',
        cell: ({ getValue }) => <Typography variant="subtitle1">{formatDate(getValue())}</Typography>
      },
      {
        header: 'Hành động',
        meta: {
          className: 'cell-center'
        },
        disableSortBy: true,
        cell: ({ row }) => {
          const claim = row.original;
          return (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                color="info"
                startIcon={<EyeOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedClaim(claim);
                  setDetailModal(true);
                }}
              >
                View
              </Button>
              {claim.claimStatus === 'PENDING' && (
                <>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(claim.id);
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(claim.id);
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
            </Stack>
          );
        }
      }
    ],
    [theme]
  );

  // Get loading status
  const isLoading = insuranceClaimsLoading;

  if (isLoading) return <EmptyReactTable />;

  return (
    <MainCard>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="insurance claim tabs" variant="scrollable" scrollButtons="auto">
          <Tab label="Tất cả yêu cầu" {...a11yProps(0)} />
          <Tab label="Đang chờ xử lý" {...a11yProps(1)} />
          <Tab label="Đã phê duyệt" {...a11yProps(2)} />
          <Tab label="Đã từ chối" {...a11yProps(3)} />
        </Tabs>
      </Box>

      {/* Date Range Search */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Ngày bắt đầu"
              value={startDate}
              onChange={(newValue) => {
                setStartDate(newValue);
              }}
              renderInput={(params) => <TextField {...params} size="small" />}
              inputFormat="dd/MM/yyyy"
            />
          </LocalizationProvider>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Ngày kết thúc"
              value={endDate}
              onChange={(newValue) => {
                setEndDate(newValue);
              }}
              renderInput={(params) => <TextField {...params} size="small" />}
              inputFormat="dd/MM/yyyy"
            />
          </LocalizationProvider>

          <Button
            variant="contained"
            color="primary"
            onClick={handleDateRangeSearch}
            startIcon={<SearchOutlined />}
            disabled={!startDate || !endDate}
          >
            Tìm kiếm
          </Button>

          {usingDateRange && (
            <Button variant="outlined" color="error" onClick={handleClearDateRange} startIcon={<CloseOutlined />}>
              Xóa bộ lọc
            </Button>
          )}
        </Stack>
        {usingDateRange && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Showing results from {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
            {tabStatus && ` - Status: ${tabStatus}`}
          </Typography>
        )}
      </Box>

      <TabPanel value={tabValue} index={0}>
        <ReactTable
          data={insuranceClaims || []}
          columns={columns}
          totalPages={totalPages || 0}
          currentPage={currentPage || 0}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ReactTable
          data={insuranceClaims || []}
          columns={columns}
          totalPages={totalPages || 0}
          currentPage={currentPage || 0}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <ReactTable
          data={insuranceClaims || []}
          columns={columns}
          totalPages={totalPages || 0}
          currentPage={currentPage || 0}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <ReactTable
          data={insuranceClaims || []}
          columns={columns}
          totalPages={totalPages || 0}
          currentPage={currentPage || 0}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      </TabPanel>

      <InsuranceClaimDetailModal
        open={detailModal}
        modalToggler={setDetailModal}
        claimData={selectedClaim}
        refetch={() => setShouldRefetch(true)}
      />
    </MainCard>
  );
};

export default InsuranceClaimManagement;
