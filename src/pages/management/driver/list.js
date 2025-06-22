import PropTypes from 'prop-types';
import { Fragment, useMemo, useState } from 'react';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  //Button,
  Chip,
  Divider,
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
  DialogActions,
  Button
} from '@mui/material';

// third-party
//import { PatternFormat } from 'react-number-format';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  useReactTable
} from '@tanstack/react-table';
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
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';

import DriverModal from 'sections/apps/driver/DriverModal';
import AlertDriverDelete from 'sections/apps/driver/AlertDriverDelete';
import DriverLicenseModal from '../../../sections/apps/driver/DriverLicenseModal';
import ExpandingUserDetail from 'sections/apps/driver/ExpandingUserDetail';

// assets
import {
  CarOutlined,
  CreditCardOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  IdcardOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useGetDriver } from 'api/driver';
import { useGetDriversByAccountId } from 'api/areaManagement';
import DriverIdentificationModal from 'sections/apps/driver/DriverIdentificationModal';
import DriverVehicleModal from 'sections/apps/driver/DriverVehicleModal';
import { useGetSchedulesByAccountId } from 'api/schedules';

const avatarImage = require.context('assets/images/users', true);

export const fuzzyFilter = (row, columnId, value, addMeta) => {
  // rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // store the ranking info
  addMeta(itemRank);

  // return if the item should be filtered in/out
  return itemRank.passed;
};

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns }) {
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
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: fuzzyFilter,
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
          placeholder={`Search ${data.length} records...`}
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
                filename: 'driver-list.csv'
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
                        <TableCell colSpan={row.getVisibleCells().length}>
                          <ExpandingUserDetail data={row.original} />
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
            <Box sx={{ p: 2 }}>
              <TablePagination
                {...{
                  setPageSize: table.setPageSize,
                  setPageIndex: table.setPageIndex,
                  getState: table.getState,
                  getPageCount: table.getPageCount
                }}
              />
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
  getHeaderProps: PropTypes.func,
  handleAdd: PropTypes.func,
  modalToggler: PropTypes.func,
  renderRowSubComponent: PropTypes.any
};

// ==============================|| DRIVER LIST ||============================== //

const ScheduleModal = ({ open, onClose, accountId }) => {
  const { schedules, schedulesLoading } = useGetSchedulesByAccountId(accountId, 0, 10);

  const columns = useMemo(
    () => [
      {
        header: 'Schedule ID',
        accessorKey: 'scheduleId'
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => (
          <Typography
            variant="subtitle1"
            sx={{
              color: getValue() === 'WAITING_FOR_DELIVERY' ? 'warning.main' : 
                     getValue() === 'IN_PROGRESS' ? 'info.main' :
                     getValue() === 'COMPLETED' ? 'success.main' : 'error.main'
            }}
          >
            {getValue()}
          </Typography>
        )
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
        header: 'Start Date',
        accessorKey: 'startDate',
        cell: ({ getValue }) => {
          const date = new Date(getValue());
          return <Typography variant="subtitle1">{date.toLocaleString()}</Typography>;
        }
      },
      {
        header: 'End Date',
        accessorKey: 'endDate',
        cell: ({ getValue }) => {
          const date = new Date(getValue());
          return <Typography variant="subtitle1">{date.toLocaleString()}</Typography>;
        }
      },
      {
        header: 'Available Capacity',
        accessorKey: 'availableCapacity',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue().toLocaleString()} kg</Typography>
      }
    ],
    []
  );

  if (schedulesLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Schedules</Typography>
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
              {schedules?.map((schedule) => (
                <TableRow key={schedule.scheduleId}>
                  {columns.map((column) => (
                    <TableCell key={column.header}>
                      {column.cell ? column.cell({ getValue: () => schedule[column.accessorKey] }) : schedule[column.accessorKey]}
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

ScheduleModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  accountId: PropTypes.number
};

const DriverListPage = () => {
  const theme = useTheme();
  const role = localStorage.getItem('role');
  
  const { driversLoading: areaDriversLoading, drivers: areaDrivers, refetch: areaRefetch } = useGetDriversByAccountId();
  const { driversLoading: allDriversLoading, drivers: allDrivers, refetch: allRefetch } = useGetDriver();

  const driversLoading = role === 'AREA_MANAGEMENT' ? areaDriversLoading : allDriversLoading;
  const lists = role === 'AREA_MANAGEMENT' ? areaDrivers : allDrivers;
  const refetch = role === 'AREA_MANAGEMENT' ? areaRefetch : allRefetch;

  const [open, setOpen] = useState(false);
  const [driverIdentificationId, setDriverIdentificationId] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const [vehicleId, setVehicleId] = useState('');

  const [driverModal, setDriverModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverDeleteId, setDriverDeleteId] = useState('');

  // Modal states for documents
  const [driverIDModal, setDriverIDModal] = useState(false);
  const [licenseModal, setLicenseModal] = useState(false);
  const [vehicleModal, setVehicleModal] = useState(false);

  const [schedulesModalOpen, setSchedulesModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');

  const handleClose = () => {
    setOpen(!open);
  };

  const handleDriverIDModal = (drivers) => {
    setSelectedDriver(drivers);
    setDriverIDModal(true);
    setDriverIdentificationId(drivers.driverIdentity.driverIdentificationId);
  };

  const handleLicenseModal = (driver) => {
    setSelectedDriver(driver);
    setLicenseModal(true);
    setLicenseId(driver.license.licenseId);
  };

  const handleVehicleModal = (driver) => {
    setSelectedDriver(driver);
    setVehicleModal(true);
    const vehicleIds = driver.vehicles?.map((vehicle) => vehicle.vehicleId) || [];
    setVehicleId(vehicleIds);

    console.log('vehicleIds:', vehicleIds);
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
        accessorKey: 'accountId',
        meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'Thông tin',
        accessorKey: 'driverIdentity.driverFullName',
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
        header: 'Giới tính',
        accessorKey: 'driverIdentity.driverGender',
        meta: {
          className: 'cell-right'
        }
      },
      {
        header: 'Thành phố',
        accessorKey: 'country'
      },
      {
        header: 'Trạng thái',
        accessorKey: 'accountStatus',
        cell: (cell) => {
          switch (cell.getValue()) {
            case false:
              return <Chip color="warning" label="Chưa xác thực" size="small" variant="light" />;
            case true:
              return <Chip color="success" label="Xác thực" size="small" variant="light" />;
            default:
              return <Chip color="info" label="Đang xử lý" size="small" variant="light" />;
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
          const collapseIcon =
            row.getCanExpand() && row.getIsExpanded() ? (
              <PlusOutlined style={{ color: theme.palette.error.main, transform: 'rotate(45deg)' }} />
            ) : (
              <EyeOutlined />
            );
          return (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
              <Tooltip title="View">
                <IconButton color="secondary" onClick={row.getToggleExpandedHandler()}>
                  {collapseIcon}
                </IconButton>
              </Tooltip>
              <Tooltip title="View Schedules">
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAccountId(row.original.accountId);
                    setSchedulesModalOpen(true);
                  }}
                >
                  <CarOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDriver(row.original);
                    setDriverModal(true);
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
                    setDriverDeleteId(row.original.id);
                  }}
                >
                  <DeleteOutlined />
                </IconButton>
              </Tooltip>
              {/* Buttons to show document modals */}
              <Tooltip title="Driver ID">
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDriverIDModal(row.original);
                  }}
                >
                  <IdcardOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title="License">
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLicenseModal(row.original);
                  }}
                >
                  <CreditCardOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title="Vehicle">
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVehicleModal(row.original);
                  }}
                >
                  <CarOutlined />
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

  if (driversLoading) return <EmptyReactTable />;

  return (
    <>
      <ReactTable
        {...{
          data: lists,
          columns,
          modalToggler: () => {
            setDriverModal(true);
            setSelectedDriver(null);
          }
        }}
      />
      {/* Modals for documents */}
      <AlertDriverDelete id={driverDeleteId} title={driverDeleteId} open={open} handleClose={handleClose} />
      <DriverModal open={driverModal} modalToggler={setDriverModal} driver={selectedDriver} />
      {/* Add modals for Driver ID, License, and Vehicle */}
      {/* <DriverIdentificationModal open={driverIDModal} modalToggler={setDriverIDModal} driver={selectedDriver} /> */}
      <DriverIdentificationModal
        open={driverIDModal}
        modalToggler={setDriverIDModal}
        driver={selectedDriver}
        refetchDrivers={refetch}
        driverIdentificationId={driverIdentificationId}
      />
      <DriverLicenseModal
        open={licenseModal}
        modalToggler={setLicenseModal}
        driver={selectedDriver}
        refetchDrivers={refetch}
        licenseId={licenseId}
      />
      {/* <DriverVehicleModal open={vehicleModal} modalToggler={setVehicleModal} driver={selectedDriver} vehicleId={vehicleId} /> */}
      <DriverVehicleModal
        open={vehicleModal}
        modalToggler={setVehicleModal}
        driver={selectedDriver}
        refetchDrivers={refetch}
        vehicleIds={vehicleId}
      />
      <ScheduleModal
        open={schedulesModalOpen}
        onClose={() => setSchedulesModalOpen(false)}
        accountId={selectedAccountId}
      />
    </>
  );
};

export default DriverListPage;
