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
  useMediaQuery
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

import { DeleteOutlined, EditOutlined, PlusOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useGetAcocuntByRole } from 'api/manager';
import { useGetProvincesByAccountId, useGetAllProvinces, updateAreas } from 'api/areaManagement';
import ManagerModal from 'sections/apps/manager/ManagerModal';
import AlertManagerDelete from 'sections/apps/manager/AlertManagerDelete';
import AreaManagementModal from 'sections/apps/manager/AreaManagementModal';
import { openSnackbar } from 'api/snackbar';

const avatarImage = require.context('assets/images/users', true);

export const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta(itemRank);
  return itemRank.passed;
};

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data = [], columns, modalToggler, totalPages, currentPage, onPageChange, pageSize, onPageSizeChange }) {
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
                filename: 'manager-list.csv'
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
  modalToggler: PropTypes.func,
  totalPages: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
  pageSize: PropTypes.number,
  onPageSizeChange: PropTypes.func
};

// ==============================|| MANAGER LIST ||============================== //
const roles = [
  { value: 'HR', label: 'HR' },
  { value: 'AREA_MANAGEMENT', label: 'AREA_MANAGEMENT' },
  { value: 'FINANCE', label: 'FINANCE' }
];

const ManagerManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get pagination parameters from URL or use defaults
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('size') || '10', 10));
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || 'AREA_MANAGEMENT');

  const [shouldRefetch, setShouldRefetch] = useState(true);

  const { accounts: lists, accountsLoading, refetch, totalPages, currentPage } = useGetAcocuntByRole(selectedRole, page, pageSize);

  const [open, setOpen] = useState(false);
  const [managerModal, setManagerModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [managerDeleteId, setManagerDeleteId] = useState('');

  const [areaModal, setAreaModal] = useState(false);
  const [selectedAreaManager, setSelectedAreaManager] = useState(null);

  // Get all provinces for area management
  const { allProvinces } = useGetAllProvinces();

  // Get provinces for selected area manager
  const { provinces } = useGetProvincesByAccountId(selectedAreaManager?.accountId);

  // Function to handle area management
  const handleAreaManagement = (manager) => {
    setSelectedAreaManager(manager);
    setAreaModal(true);
  };

  // Function to handle area deletion
  const handleAreaDelete = (manager) => {
    setSelectedAreaManager(manager);
    handleClose();
    setManagerDeleteId(manager.accountId);
  };

  // Function to handle area save
  const handleAreaSave = async (provinceIds) => {
    try {
      if (selectedAreaManager) {
        await updateAreas(selectedAreaManager.accountId, { provinceIds });
        openSnackbar({
          open: true,
          message: 'Cập nhật vùng quản lý thành công',
          variant: 'alert',
          alert: { color: 'success' }
        });
      }
      setAreaModal(false);
      setShouldRefetch(true);
    } catch (error) {
      console.error('Error saving area:', error);
      openSnackbar({
        open: true,
        message: 'Cập nhật vùng quản lý thất bại',
        variant: 'alert',
        alert: { color: 'error' }
      });
    }
  };

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

  const handleRoleChange = (event) => {
    const newRole = event.target.value;
    setSelectedRole(newRole);
    setPage(0); // Reset page when changing role
    updateUrlParams({ role: newRole, page: 0 });
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
  }, [shouldRefetch, refetch, page, pageSize, selectedRole]);

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
        header: 'Tên người dùng',
        accessorKey: 'username',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue()}</Typography>
      },
      {
        header: 'Số điện thoại',
        accessorKey: 'phone',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue()}</Typography>
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
        header: 'Xếp hạng',
        accessorKey: 'ranking',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue()}</Typography>
      },
      {
        header: 'Đăng nhập lần cuối',
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
          const isAreaManager = row.original.role === 'AREA_MANAGEMENT';
          return (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
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
              {isAreaManager && (
                <>
                  <Tooltip title="Manage Areas">
                    <IconButton
                      color="info"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAreaManagement(row.original);
                      }}
                    >
                      <EnvironmentOutlined />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAreaManager) {
                      handleAreaDelete(row.original);
                    } else {
                      handleClose();
                      setManagerDeleteId(row.original.accountId);
                    }
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
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Bạn là:</Typography>
        <Select value={selectedRole} onChange={handleRoleChange} displayEmpty>
          {roles.map((role) => (
            <MenuItem key={role.value} value={role.value}>
              {role.label}
            </MenuItem>
          ))}
        </Select>
      </Stack>
      <ReactTable
        {...{
          data: tableData,
          columns,
          totalPages: totalPages || 1,
          currentPage: currentPage || 0,
          pageSize: pageSize,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
          modalToggler: () => {
            setManagerModal(true);
            setSelectedManager(null);
          }
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
        selectedRole={selectedRole}
        refetch={() => setShouldRefetch(true)}
        onSuccess={() => {
          setShouldRefetch(true);
          setManagerModal(false);
        }}
      />
      <AreaManagementModal
        open={areaModal}
        modalToggler={setAreaModal}
        manager={selectedAreaManager}
        provinces={provinces}
        allProvinces={allProvinces}
        onSave={handleAreaSave}
      />
    </>
  );
};

export default ManagerManagement;
