import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Grid, Stack, useMediaQuery, Button, FormControl, Select, MenuItem, Box, Slide, Typography } from '@mui/material';
import EmptyUserCard from 'components/cards/skeleton/EmptyUserCard';
import { DebouncedInput } from 'components/third-party/react-table';
import { useGetSchedules } from 'api/schedules';
import { PlusOutlined } from '@ant-design/icons';
import ScheduleCard from 'sections/apps/schedule/ScheduleCard';
import ScheduleModal from 'sections/apps/schedule/ScheduleModal';
import MainCard from 'components/MainCard';

const allColumns = [
  { id: 1, header: 'Default' },
  { id: 2, header: 'Start Location' },
  { id: 3, header: 'End Location' },
  { id: 4, header: 'Start Date' },
  { id: 5, header: 'End Date' },
  { id: 6, header: 'Status' }
];

function dataSort(data, sortBy) {
  return data.sort((a, b) => {
    if (sortBy === 'Start Location') return a.startLocationAddress.localeCompare(b.startLocationAddress);
    if (sortBy === 'End Location') return a.endLocationAddress.localeCompare(b.endLocationAddress);
    if (sortBy === 'Start Date') return new Date(a.startDate) - new Date(b.startDate);
    if (sortBy === 'End Date') return new Date(a.endDate) - new Date(b.endDate);
    if (sortBy === 'Status') return a.status.localeCompare(b.status);
    return a.scheduleId - b.scheduleId; // Default sort by scheduleId
  });
}

const ScheduleCardPage = () => {
  const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get pagination parameters from URL or use defaults
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('size') || '6', 10));

  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'Default');
  const [globalFilter, setGlobalFilter] = useState(searchParams.get('search') || '');
  const [scheduleModal, setScheduleModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [shouldRefetch, setShouldRefetch] = useState(false);

  // Use the updated schedules hook with pagination
  const { schedules: lists, schedulesLoading, schedulesError, totalPages, currentPage, refetch } = useGetSchedules(page, pageSize);

  // Filter and sort data client-side after server pagination
  const scheduleCards = lists
    ? dataSort(
        lists.filter((value) => {
          if (globalFilter) {
            return (
              value.startLocationAddress.toLowerCase().includes(globalFilter.toLowerCase()) ||
              value.endLocationAddress.toLowerCase().includes(globalFilter.toLowerCase())
            );
          }
          return true;
        }),
        sortBy
      )
    : [];

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

  const handleSortChange = (event) => {
    const newSortBy = event.target.value;
    setSortBy(newSortBy);
    updateUrlParams({ sort: newSortBy });
  };

  const handleFilterChange = (value) => {
    setGlobalFilter(String(value));
    setPage(0); // Reset to first page on new search
    updateUrlParams({ search: String(value), page: 0 });
  };

  useEffect(() => {
    if (shouldRefetch) {
      refetch();
      setShouldRefetch(false);
    }
  }, [shouldRefetch, refetch]);

  // Handle previous page button
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      handlePageChange(currentPage - 1);
    }
  };

  // Handle next page button
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      handlePageChange(currentPage + 1);
    }
  };

  return (
    <MainCard>
      <Box sx={{ position: 'relative', marginBottom: 3 }}>
        <Stack direction="row" alignItems="center">
          <Stack
            direction={matchDownSM ? 'column' : 'row'}
            sx={{ width: '100%' }}
            spacing={1}
            justifyContent="space-between"
            alignItems="center"
          >
            <DebouncedInput value={globalFilter ?? ''} onFilterChange={handleFilterChange} placeholder="Search schedules..." />
            <Stack direction={matchDownSM ? 'column' : 'row'} alignItems="center" spacing={1}>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  renderValue={(selected) => <Typography variant="subtitle2">{selected ? `Sort by (${sortBy})` : 'Sort By'}</Typography>}
                >
                  {allColumns.map((column) => (
                    <MenuItem key={column.id} value={column.header}>
                      {column.header}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={() => {
                  setSelectedSchedule(null);
                  setScheduleModal(true);
                }}
              >
                Add Schedule
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Box>

      {schedulesLoading ? (
        <EmptyUserCard title="Loading..." />
      ) : schedulesError ? (
        <EmptyUserCard title={`Error: ${schedulesError.message}`} />
      ) : scheduleCards.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {scheduleCards.map((schedule, index) => (
              <Slide key={schedule.scheduleId} direction="up" in={true} timeout={index * 50}>
                <Grid item xs={12} sm={6} lg={4}>
                  <ScheduleCard
                    schedule={schedule}
                    onEdit={() => {
                      setSelectedSchedule(schedule);
                      setScheduleModal(true);
                    }}
                  />
                </Grid>
              </Slide>
            ))}
          </Grid>

          {/* Server-side pagination controls */}
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ p: 2.5, mt: 2 }}>
            <FormControl variant="standard" sx={{ minWidth: 100 }}>
              <Select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                displayEmpty
                inputProps={{ 'aria-label': 'Cards per page' }}
              >
                {[6, 12, 24, 36].map((size) => (
                  <MenuItem key={size} value={size}>
                    {size} cards
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
        </>
      ) : (
        <EmptyUserCard title="No schedules found." />
      )}

      <ScheduleModal
        open={scheduleModal}
        modalToggler={setScheduleModal}
        schedule={selectedSchedule}
        onSuccess={() => {
          setShouldRefetch(true);
          setScheduleModal(false);
        }}
      />
    </MainCard>
  );
};

export default ScheduleCardPage;
