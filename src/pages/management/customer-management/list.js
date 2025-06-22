import PropTypes from 'prop-types';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
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
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

// third-party
import { flexRender, getCoreRowModel, getSortedRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';

// project-import
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
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

import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useGetAcocuntByRole } from 'api/manager';
import { useGetTripBookingsByAccountId } from 'api/tripBookings';
import ManagerModal from 'sections/apps/manager/ManagerModal';
import AlertManagerDelete from 'sections/apps/manager/AlertManagerDelete';

const avatarImage = require.context('assets/images/users', true);

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
      id: 'accountId',
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
                filename: 'customer-list.csv'
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
                        <TableCell colSpan={row.getVisibleCells().length}>{/* <ExpandingUserDetail data={row.original} /> */}</TableCell>
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

// ==============================|| MANAGER LIST ||============================== //

const CustomerManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get pagination parameters from URL or use defaults
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('size') || '10', 10));
  const [shouldRefetch, setShouldRefetch] = useState(true);

  const { accounts: lists, accountsLoading, refetch, totalPages, currentPage } = useGetAcocuntByRole('CUSTOMER', page, pageSize);

  const [open, setOpen] = useState(false);
  const [managerModal, setManagerModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [managerDeleteId, setManagerDeleteId] = useState('');
  const [tripBookingsModalOpen, setTripBookingsModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  // Update URL params when filters change
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

  const handleClose = () => {
    setOpen(!open);
  };

  // Gọi lại API khi có thay đổi trong `shouldRefetch`
  useEffect(() => {
    if (shouldRefetch) {
      refetch();
      setShouldRefetch(false);
    }
  }, [shouldRefetch, refetch, page, pageSize]);

  const tableData = lists || [];

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
        accessorKey: 'accountId',
        meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'Thông tin',
        accessorKey: 'fullName',
        cell: ({ row, getValue }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              alt="Avatar 1"
              size="sm"
              src={avatarImage(`./avatar-${!row.original.profilePicture ? 1 : row.original.profilePicture}.png`)}
            />
            <Stack spacing={0}>
              <Typography variant="subtitle1">{getValue()}</Typography>
              <Typography color="text.secondary">{row.original.email}</Typography>
            </Stack>
          </Stack>
        )
      },
      {
        header: 'Số điện thoại',
        accessorKey: 'phone',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue()}</Typography>
      },
      {
        header: 'Số dư',
        accessorKey: 'balance',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue()}</Typography>
      },
      {
        header: 'Điểm uy tín',
        accessorKey: 'loyaltyPoints',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue()}</Typography>
      },
      {
        header: 'Điểm quy đổi',
        accessorKey: 'redeemablePoints',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue()}</Typography>
      },
      {
        header: 'Xếp hạng',
        accessorKey: 'ranking',
        cell: ({ getValue }) => (
          <Typography
            variant="subtitle1"
            sx={{
              color:
                getValue() === 'BRONZE'
                  ? 'warning.dark'
                  : getValue() === 'SILVER'
                    ? 'grey.600'
                    : getValue() === 'GOLD'
                      ? 'warning.main'
                      : 'text.primary'
            }}
          >
            {getValue()}
          </Typography>
        )
      },
      {
        header: 'Trạng thái',
        accessorKey: 'status',
        cell: ({ getValue }) => (
          <Typography
            variant="subtitle1"
            sx={{
              color: getValue() === 'Active' ? 'success.main' : 'error.main'
            }}
          >
            {getValue()}
          </Typography>
        )
      },
      {
        header: 'Ngày tạo',
        accessorKey: 'lastLogin',
        cell: ({ getValue }) => {
          const date = new Date(getValue());
          return <Typography variant="subtitle1">{date.toLocaleString()}</Typography>;
        }
      },
      {
        header: 'Hành động',
        meta: {
          className: 'cell-center'
        },
        disableSortBy: true,
        cell: ({ row }) => {
          return (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
              <Tooltip title="View Trip Bookings">
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAccountId(row.original.accountId);
                    setTripBookingsModalOpen(true);
                  }}
                >
                  <EyeOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedManager(row.original);
                    setManagerModal(true);
                  }}
                >
                  <EditOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                    setManagerDeleteId(row.original.accountId);
                  }}
                >
                  <DeleteOutlined />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ],
    // eslint-disable-next-line
    [theme]
  );

  if (accountsLoading) return <EmptyReactTable />;

  return (
    <>
      <ReactTable
        {...{
          data: tableData,
          columns,
          totalPages: totalPages || 1,
          currentPage: currentPage || 0,
          pageSize: pageSize,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange
        }}
      />
      {/* Modals for documents */}
      <AlertManagerDelete
        id={managerDeleteId}
        title={managerDeleteId}
        open={open}
        managerDeleteId={managerDeleteId}
        handleClose={handleClose}
        refetch={() => setShouldRefetch(true)}
        onSuccess={() => {
          setShouldRefetch(true);
          setManagerModal(false);
        }}
      />
      <ManagerModal
        open={managerModal}
        modalToggler={setManagerModal}
        manager={selectedManager}
        selectedRole="CUSTOMER"
        refetch={() => setShouldRefetch(true)}
        onSuccess={() => {
          setShouldRefetch(true);
          setManagerModal(false);
        }}
      />
      <TripBookingsModal
        open={tripBookingsModalOpen}
        onClose={() => setTripBookingsModalOpen(false)}
        accountId={selectedAccountId}
      />
    </>
  );
};

export default CustomerManagement;

// ==============================|| TRIP BOOKINGS MODAL ||============================== //

const TripBookingsModal = ({ open, onClose, accountId }) => {
  const { tripBookings, tripBookingsLoading } = useGetTripBookingsByAccountId(accountId, 0, 10);

  const columns = useMemo(
    () => [
      {
        header: 'Booking ID',
        accessorKey: 'bookingId'
      },
      {
        header: 'Status',
        accessorKey: 'status'
      },
      {
        header: 'Pickup Location',
        accessorKey: 'startLocationAddress'
      },
      {
        header: 'Dropoff Location',
        accessorKey: 'endLocationAddress'
      },
      {
        header: 'Booking Date',
        accessorKey: 'bookingDate',
        cell: ({ getValue }) => {
          const date = new Date(getValue());
          return <Typography variant="subtitle1">{date.toLocaleString()}</Typography>;
        }
      },
      {
        header: 'Price',
        accessorKey: 'price',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue().toLocaleString('vi-VN')} VND</Typography>
      }
    ],
    []
  );

  if (tripBookingsLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Trip Bookings</Typography>
          <IconButton onClick={onClose} color="error">
            <DeleteOutlined />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.header}>{column.header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tripBookings?.map((booking) => (
                <TableRow key={booking.bookingId}>
                  {columns.map((column) => (
                    <TableCell key={column.header}>
                      {column.cell ? column.cell({ getValue: () => booking[column.accessorKey] }) : booking[column.accessorKey]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

TripBookingsModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  accountId: PropTypes.number
};
