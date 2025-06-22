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
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';

// third-party
import { flexRender, getCoreRowModel, getSortedRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';

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

import VoucherModal from 'sections/apps/voucher/VoucherModal';
import AlertVoucherDelete from 'sections/apps/voucher/AlertVoucherDelete';

// assets
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';

// Import the hooks from api/voucher
import { useGetVoucher, useGetRedeemedVoucher } from 'api/voucher';

export const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta(itemRank);
  return itemRank.passed;
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Tab Panel component for the tabbed interface
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`voucher-tabpanel-${index}`} aria-labelledby={`voucher-tab-${index}`} {...other}>
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
    id: `voucher-tab-${index}`,
    'aria-controls': `voucher-tabpanel-${index}`
  };
}

function ReactTable({ data, columns, modalToggler, totalPages, currentPage, onPageChange, pageSize, onPageSizeChange }) {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const [sorting, setSorting] = useState([
    {
      id: 'voucherId',
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
            <Button variant="contained" startIcon={<PlusOutlined />} onClick={modalToggler}>
              Thêm
            </Button>
            <CSVExport
              {...{
                data:
                  table.getSelectedRowModel().flatRows.map((row) => row.original).length === 0
                    ? data
                    : table.getSelectedRowModel().flatRows.map((row) => row.original),
                headers,
                filename: 'voucher-list.csv'
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
                        <TableCell colSpan={row.getVisibleCells().length}>{/* <ExpandingVoucherDetail data={row.original} /> */}</TableCell>
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
  modalToggler: PropTypes.func,
  totalPages: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
  pageSize: PropTypes.number,
  onPageSizeChange: PropTypes.func
};

const VoucherManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get pagination parameters from URL or use defaults
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('size') || '10', 10));
  const [tabValue, setTabValue] = useState(parseInt(searchParams.get('tab') || '0', 10));

  const [open, setOpen] = useState(false);
  const [voucherModal, setVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherDeleteId, setVoucherDeleteId] = useState('');
  const [shouldRefetch, setShouldRefetch] = useState(false);

  // Use the regular voucher hook for the All tab
  const {
    vouchers: allVouchers,
    vouchersLoading: allVouchersLoading,
    totalPages: allTotalPages,
    currentPage: allCurrentPage,
    refetch: refetchAll
  } = useGetVoucher(page, pageSize);

  // Use the redeemable voucher hook for the Redeemable tab
  const {
    redeemedVouchers: redeemableVouchers,
    redeemedVouchersLoading: redeemableLoading,
    totalPages: redeemableTotalPages,
    currentPage: redeemableCurrentPage,
    refetch: refetchRedeemable
  } = useGetRedeemedVoucher(true, page, pageSize);

  // Use the non-redeemable voucher hook for the Non-Redeemable tab
  const {
    redeemedVouchers: nonRedeemableVouchers,
    redeemedVouchersLoading: nonRedeemableLoading,
    totalPages: nonRedeemableTotalPages,
    currentPage: nonRedeemableCurrentPage,
    refetch: refetchNonRedeemable
  } = useGetRedeemedVoucher(false, page, pageSize);

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
    updateUrlParams({ tab: newValue, page: 0 });
  };

  const handleClose = () => {
    setOpen(!open);
  };

  useEffect(() => {
    if (shouldRefetch) {
      refetchAll();
      refetchRedeemable();
      refetchNonRedeemable();
      setShouldRefetch(false);
    }
  }, [shouldRefetch, refetchAll, refetchRedeemable, refetchNonRedeemable]);

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
        header: 'Mã',
        accessorKey: 'voucherId',
        meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'Mã giảm giá',
        accessorKey: 'code',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue()}</Typography>
      },
      {
        header: 'Tiêu đề',
        accessorKey: 'title',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue()}</Typography>
      },
      {
        header: 'Giảm giá',
        accessorKey: 'discountValue',
        cell: ({ row }) => {
          const discountType = row.original.discountType;
          const discountValue = row.original.discountValue;

          if (discountType === 'PERCENT') {
            return <Typography variant="subtitle1">{discountValue}%</Typography>;
          } else {
            return <Typography variant="subtitle1">{formatCurrency(discountValue)}</Typography>;
          }
        }
      },
      {
        header: 'Đơn hàng tối thiểu',
        accessorKey: 'minOrderValue',
        cell: ({ getValue }) => <Typography variant="subtitle1">{formatCurrency(getValue())}</Typography>
      },
      {
        header: 'Thời gian hiệu lực',
        accessorKey: 'startDate',
        cell: ({ row }) => (
          <Typography variant="subtitle1">
            {formatDate(row.original.startDate)} - {formatDate(row.original.endDate)}
          </Typography>
        )
      },
      {
        header: 'Trạng thái',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const status = getValue();
          let color;
          switch (status) {
            case 'ACTIVE':
              color = 'success';
              break;
            case 'EXPIRED':
              color = 'error';
              break;
            default:
              color = 'default';
          }
          return <Chip color={color} label={status} size="small" />;
        }
      },
      {
        header: 'Phương thức thanh toán',
        accessorKey: 'paymentMethod',
        cell: ({ getValue }) => {
          const paymentMethod = getValue();
          let label = paymentMethod;
          let color = 'primary';

          switch (paymentMethod) {
            case 'ALL':
              label = 'Tất cả phương thức';
              color = 'primary';
              break;
            case 'ONLINE_ONLY':
              label = 'Chỉ trực tuyến';
              color = 'info';
              break;
            case 'CASH_ONLY':
              label = 'Chỉ tiền mặt';
              color = 'warning';
              break;
            default:
              color = 'default';
          }

          return <Chip color={color} label={label} size="small" />;
        }
      },
      {
        header: 'Loại người dùng',
        accessorKey: 'userType',
        cell: ({ getValue }) => {
          const userType = getValue();
          let color;

          switch (userType) {
            case 'CUSTOMER':
              color = 'info';
              break;
            case 'DRIVER':
              color = 'warning';
              break;
            default:
              color = 'default';
          }

          return <Chip color={color} label={userType} size="small" />;
        }
      },
      {
        header: 'Số lượng',
        accessorKey: 'quantity',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue()}</Typography>,
        meta: {
          className: 'cell-right'
        }
      },
      {
        header: 'Hành động',
        meta: {
          className: 'cell-center'
        },
        disableSortBy: true,
        cell: ({ row }) => (
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
            <Tooltip title="Chỉnh sửa">
              <IconButton
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  const selectedVoucher = row.original;
                  setSelectedVoucher(selectedVoucher);
                  setVoucherModal(true);
                }}
              >
                <EditOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="Xóa">
              <IconButton
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                  setVoucherDeleteId(row.original.voucherId);
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

  // Get current data based on tab
  // const getTabData = (tabIndex) => {
  //   switch (tabIndex) {
  //     case 0:
  //       return {
  //         vouchers: allVouchers || [],
  //         loading: allVouchersLoading,
  //         totalPages: allTotalPages || 0,
  //         currentPage: allCurrentPage || 0
  //       };
  //     case 1:
  //       return {
  //         vouchers: redeemableVouchers || [],
  //         loading: redeemableLoading,
  //         totalPages: redeemableTotalPages || 0,
  //         currentPage: redeemableCurrentPage || 0
  //       };
  //     case 2:
  //       return {
  //         vouchers: nonRedeemableVouchers || [],
  //         loading: nonRedeemableLoading,
  //         totalPages: nonRedeemableTotalPages || 0,
  //         currentPage: nonRedeemableCurrentPage || 0
  //       };
  //     default:
  //       return {
  //         vouchers: allVouchers || [],
  //         loading: allVouchersLoading,
  //         totalPages: allTotalPages || 0,
  //         currentPage: allCurrentPage || 0
  //       };
  //   }
  // };

  // Get loading status for all tabs
  const isLoading = allVouchersLoading || redeemableLoading || nonRedeemableLoading;

  if (isLoading) return <EmptyReactTable />;

  return (
    <MainCard>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="voucher tabs" variant="scrollable" scrollButtons="auto">
          <Tab label="Tất cả voucher" {...a11yProps(0)} />
          <Tab label="Có thể đổi được
" {...a11yProps(1)} />
          <Tab label="Không thể thay đổi" {...a11yProps(2)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <ReactTable
          data={allVouchers || []}
          columns={columns}
          totalPages={allTotalPages || 0}
          currentPage={allCurrentPage || 0}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          modalToggler={() => {
            setVoucherModal(true);
            setSelectedVoucher(null);
          }}
        />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <ReactTable
          data={redeemableVouchers || []}
          columns={columns}
          totalPages={redeemableTotalPages || 0}
          currentPage={redeemableCurrentPage || 0}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          modalToggler={() => {
            setVoucherModal(true);
            setSelectedVoucher(null);
          }}
        />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <ReactTable
          data={nonRedeemableVouchers || []}
          columns={columns}
          totalPages={nonRedeemableTotalPages || 0}
          currentPage={nonRedeemableCurrentPage || 0}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          modalToggler={() => {
            setVoucherModal(true);
            setSelectedVoucher(null);
          }}
        />
      </TabPanel>

      <VoucherModal
        open={voucherModal}
        modalToggler={setVoucherModal}
        voucher={selectedVoucher}
        refetch={() => setShouldRefetch(true)}
        onSuccess={() => {
          setShouldRefetch(true);
          setVoucherModal(false);
        }}
      />
      <AlertVoucherDelete
        open={open}
        handleClose={handleClose}
        refetch={() => setShouldRefetch(true)}
        voucherDeleteId={voucherDeleteId}
        onDeleteSuccess={() => setShouldRefetch(true)}
      />
    </MainCard>
  );
};

export default VoucherManagement;
