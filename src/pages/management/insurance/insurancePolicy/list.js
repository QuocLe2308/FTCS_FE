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

import InsurancePolicyModal from 'sections/apps/insurance/insurancePolicy/InsurancePolicyModal';
import AlertInsurancePolicyDelete from 'sections/apps/insurance/insurancePolicy/AlertInsurancePolicyDelete';
// assets
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';

// Import the hooks from api/insurance and api/bookingType
import { useGetAllInsurancePolicies } from 'api/insurance';
import { useGetAllBookingTypes } from 'api/bookingType';

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

// Helper function to format percentage
const formatPercentage = (value) => {
  return `${value}%`;
};

// Tab Panel component for the tabbed interface
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`insurance-tabpanel-${index}`} aria-labelledby={`insurance-tab-${index}`} {...other}>
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
    id: `insurance-tab-${index}`,
    'aria-controls': `insurance-tabpanel-${index}`
  };
}

function ReactTable({ data, columns, modalToggler, totalPages, currentPage, onPageChange, pageSize, onPageSizeChange }) {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const [sorting, setSorting] = useState([
    {
      id: 'policyId',
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
              Add Policy
            </Button>
            <CSVExport
              {...{
                data:
                  table.getSelectedRowModel().flatRows.map((row) => row.original).length === 0
                    ? data
                    : table.getSelectedRowModel().flatRows.map((row) => row.original),
                headers,
                filename: 'insurance-policies.csv'
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
  modalToggler: PropTypes.func,
  totalPages: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
  pageSize: PropTypes.number,
  onPageSizeChange: PropTypes.func
};

const InsurancePolicyManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get pagination parameters from URL or use defaults
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('size') || '10', 10));
  const [tabValue, setTabValue] = useState(0);

  const [open, setOpen] = useState(false);
  const [policyModal, setPolicyModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [policyDeleteId, setPolicyDeleteId] = useState('');
  const [policyDeleteName, setPolicyDeleteName] = useState('');
  const [shouldRefetch, setShouldRefetch] = useState(false);

  // Use the insurance policies hook
  const { insurancePolicies, insurancePoliciesLoading, totalPages, currentPage, refetch } = useGetAllInsurancePolicies(page, pageSize);

  // Fetch booking types to display booking type names
  const { bookingTypes, bookingTypesLoading } = useGetAllBookingTypes(0, 100);

  // Function to get booking type name by ID
  const getBookingTypeName = (bookingTypeId) => {
    if (!bookingTypes) return `Type ${bookingTypeId}`;
    const bookingType = bookingTypes.find((type) => type.bookingTypeId === bookingTypeId);
    return bookingType ? bookingType.bookingTypeName : `Type ${bookingTypeId}`;
  };

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
      refetch();
      setShouldRefetch(false);
    }
  }, [shouldRefetch, refetch]);

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
        accessorKey: 'policyId',
        meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'Tên bảo hiểm',
        accessorKey: 'name',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue()}</Typography>
      },
      {
        header: 'Mô tả',
        accessorKey: 'description',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue()}</Typography>
      },
      {
        header: 'Mô tả bảo hiểm',
        accessorKey: 'coverageDetails',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue()}</Typography>
      },
      {
        header: 'Loại đơn',
        accessorKey: 'bookingType',
        cell: ({ getValue }) => {
          const bookingTypeId = getValue();
          let color;
          switch (bookingTypeId) {
            case 1:
              color = 'warning';
              break;
            case 2:
              color = 'success';
              break;
            case 3:
              color = 'primary';
              break;
            case 4:
              color = 'info';
              break;
            case 5:
              color = 'secondary';
              break;
            default:
              color = 'default';
          }
          return <Chip color={color} label={getBookingTypeName(bookingTypeId)} size="small" />;
        }
      },
      {
        header: 'Giá trị bảo hiểm',
        accessorKey: 'premiumPercentage',
        cell: ({ getValue }) => <Typography variant="subtitle1">{formatPercentage(getValue())}</Typography>
      },
      {
        header: 'Bồi thường',
        accessorKey: 'compensationPercentage',
        cell: ({ getValue }) => <Typography variant="subtitle1">{formatPercentage(getValue())}</Typography>
      },
      {
        header: 'Ngày tạo',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => <Typography variant="subtitle1">{formatDate(getValue())}</Typography>
      },
      {
        header: 'Ngày chỉnh sửa ',
        accessorKey: 'updatedAt',
        cell: ({ getValue }) => <Typography variant="subtitle1">{formatDate(getValue())}</Typography>
      },
      {
        header: 'Hành động',
        meta: {
          className: 'cell-center'
        },
        disableSortBy: true,
        cell: ({ row }) => (
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
            <Tooltip title="Edit">
              <IconButton
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  const selectedPolicy = row.original;
                  setSelectedPolicy(selectedPolicy);
                  setPolicyModal(true);
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
                  setPolicyDeleteId(row.original.policyId);
                  setPolicyDeleteName(row.original.name);
                }}
              >
                <DeleteOutlined />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    [theme, bookingTypes]
  );

  // Get loading status
  const isLoading = insurancePoliciesLoading || bookingTypesLoading;

  if (isLoading) return <EmptyReactTable />;

  return (
    <MainCard>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="insurance policy tabs" variant="scrollable" scrollButtons="auto">
          <Tab label="All Insurance Policies" {...a11yProps(0)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <ReactTable
          data={insurancePolicies || []}
          columns={columns}
          totalPages={totalPages || 0}
          currentPage={currentPage || 0}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          modalToggler={() => {
            setPolicyModal(true);
            setSelectedPolicy(null);
          }}
        />
      </TabPanel>

      <InsurancePolicyModal
        open={policyModal}
        modalToggler={setPolicyModal}
        policyData={selectedPolicy}
        refetch={() => setShouldRefetch(true)}
        onSuccess={() => {
          setShouldRefetch(true);
          setPolicyModal(false);
        }}
      />
      <AlertInsurancePolicyDelete
        open={open}
        handleClose={handleClose}
        refetch={() => setShouldRefetch(true)}
        policyId={policyDeleteId}
        policyName={policyDeleteName}
        onDeleteSuccess={() => setShouldRefetch(true)}
      />
    </MainCard>
  );
};

export default InsurancePolicyManagement;
