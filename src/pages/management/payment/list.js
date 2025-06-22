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
  Typography,
  useMediaQuery
} from '@mui/material';

// third-party
import { flexRender, getCoreRowModel, getSortedRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';

// project-import
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import EmptyReactTable from 'pages/tables/react-table/empty';

import { CSVExport, DebouncedInput, HeaderSort, SelectColumnSorting } from 'components/third-party/react-table';

import { useGetPayments } from 'api/payment';

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
      id: 'paymentId',
      desc: true
    }
  ]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter
    },
    onSortingChange: setSorting,
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
          <CSVExport
            {...{
              data,
              headers,
              filename: 'payment-list.csv'
            }}
          />
        </Stack>
      </Stack>
      <ScrollX>
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
                      <TableCell colSpan={row.getVisibleCells().length}>{/* <ExpandingPaymentDetail data={row.original} /> */}</TableCell>
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

// ==============================|| PAYMENT LIST ||============================== //

const PaymentList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get pagination parameters from URL or use defaults
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('size') || '10', 10));

  const { payments: lists, paymentsLoading, refetch, totalPages, currentPage } = useGetPayments(page, pageSize);

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

  // Refresh when pagination changes
  useEffect(() => {
    refetch();
  }, [refetch, page, pageSize]);

  const tableData = lists || [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const columns = useMemo(
    () => [
      {
        header: 'ID',
        accessorKey: 'paymentId',
        meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'ID đơn hàng',
        accessorKey: 'bookingId',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue()}</Typography>
      },
      {
        header: 'Tổng tiền',
        accessorKey: 'amount',
        cell: ({ getValue }) => <Typography variant="subtitle1">{formatCurrency(getValue())}</Typography>
      },
      {
        header: 'ID tài khoản',
        accessorKey: 'accountId',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue()}</Typography>
      },
      {
        header: 'Trạng thái',
        accessorKey: 'paymentStatus',
        cell: ({ getValue }) => {
          const status = getValue();
          let color = 'primary.main';

          if (status === 'PAID') {
            color = 'success.main';
          } else if (status === 'PENDING') {
            color = 'warning.main';
          } else if (status === 'FAILED') {
            color = 'error.main';
          }

          return (
            <Typography variant="subtitle1" sx={{ color }}>
              {status}
            </Typography>
          );
        }
      },
      {
        header: 'Ngày thanh toán',
        accessorKey: 'paymentDate',
        cell: ({ getValue }) => {
          const dateValue = getValue();
          return dateValue ? <Typography variant="subtitle1">{formatDate(dateValue)}</Typography> : null;
        }
      },
      {
        header: 'Ngày tạo',
        accessorKey: 'createAt',
        cell: ({ getValue }) => <Typography variant="subtitle1">{formatDate(getValue())}</Typography>
      }
    ],
    // eslint-disable-next-line
    [theme]
  );

  if (paymentsLoading) return <EmptyReactTable />;

  return (
    <>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Payment Management
      </Typography>
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
    </>
  );
};

export default PaymentList;
