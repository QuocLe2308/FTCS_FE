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
  Typography
} from '@mui/material';
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table'; // Core table functions
import { CSVExport, DebouncedInput, HeaderSort } from 'components/third-party/react-table'; // Custom components
import { useGetTripBookings } from 'api/tripBookings';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import TripBookingModal from 'sections/apps/trip-booking/TripBookingModal';
import AlertTripBookingDelete from 'sections/apps/trip-booking/AlertTripBookingDelete';
import EmptyReactTable from 'pages/tables/react-table/empty';

function ReactTable({ data, columns, modalToggler, totalPages, currentPage, onPageChange, pageSize, onPageSizeChange }) {
  // const theme = useTheme();
  const [sorting, setSorting] = useState([{ id: 'bookingId', desc: true }]);
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
          placeholder={`Search ${data.length} trip bookings...`}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={modalToggler}>
            Thêm
          </Button>
          <CSVExport data={data} headers={headers} filename="trip-booking-list.csv" />
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

const TripBookingListPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get pagination parameters from URL or use defaults
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('size') || '10', 10));
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const [open, setOpen] = useState(false);
  const [tripBookingModal, setTripBookingModal] = useState(false);
  const [selectedTripBooking, setSelectedTripBooking] = useState(null);
  const [tripBookingDeleteId, setTripBookingDeleteId] = useState('');

  // Use the updated trip bookings hook with pagination
  const {
    tripBookings: lists,
    tripBookingsLoading,
    tripBookingsError,
    totalPages,
    currentPage,
    refetch
  } = useGetTripBookings(page, pageSize);

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
      { header: 'Booking ID', accessorKey: 'bookingId' },
      { header: 'Account ID', accessorKey: 'accountId' },
      { header: 'Trip Agreement ID', accessorKey: 'tripAgreementId' },
      { header: 'Booking Type', accessorKey: 'bookingType' },
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
        header: 'Ngày đặt',
        accessorKey: 'bookingDate',
        cell: ({ getValue }) => new Date(getValue()).toLocaleString()
      },
      {
        header: 'Trạng thái',
        accessorKey: 'status',
        cell: ({ getValue }) => (
          <Chip
            color={getValue() === 'ORDER_COMPLETED' ? 'success' : getValue() === 'PENDING' ? 'warning' : 'info'}
            label={getValue()}
            size="small"
            variant="light"
          />
        )
      },
      {
        header: 'Giá',
        accessorKey: 'price',
        cell: ({ getValue }) => <Typography>{getValue().toLocaleString()} VND</Typography>
      },
      {
        header: 'Hành động',
        cell: ({ row }) => (
          <Stack direction="row" spacing={0}>
            <Tooltip title="Edit">
              <IconButton
                color="primary"
                onClick={() => {
                  setSelectedTripBooking(row.original);
                  setTripBookingModal(true);
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
                  setTripBookingDeleteId(row.original.bookingId);
                }}
              >
                <DeleteOutlined />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
        enableSorting: false
      }
    ],
    [theme]
  );

  if (tripBookingsLoading) return <EmptyReactTable />;
  if (tripBookingsError) return <Typography>Error loading trip bookings: {tripBookingsError.message}</Typography>;

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
          setTripBookingModal(true);
          setSelectedTripBooking(null);
        }}
      />
      <AlertTripBookingDelete
        id={tripBookingDeleteId}
        title={tripBookingDeleteId}
        open={open}
        handleClose={handleClose}
        onDeleteSuccess={() => setShouldRefetch(true)}
      />
      <TripBookingModal
        open={tripBookingModal}
        modalToggler={setTripBookingModal}
        tripBooking={selectedTripBooking}
        onSuccess={() => {
          setShouldRefetch(true);
          setTripBookingModal(false);
        }}
      />
    </MainCard>
  );
};

export default TripBookingListPage;
