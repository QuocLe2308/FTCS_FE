import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { Box, Modal, Stack } from '@mui/material';
import FormTripBookingAdd from './FormTripBookingAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import { useGetTripBookings } from 'api/tripBookings';

const TripBookingModal = ({ open, modalToggler, tripBooking }) => {
  const { tripBookingsLoading: loading } = useGetTripBookings();

  const closeModal = () => modalToggler(false);

  const tripBookingForm = useMemo(
    () => !loading && <FormTripBookingAdd tripBooking={tripBooking || null} closeModal={closeModal} />,
    [tripBooking, loading]
  );

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-tripBooking-add-label"
          aria-describedby="modal-tripBooking-add-description"
          sx={{ '& .MuiPaper-root:focus': { outline: 'none' } }}
        >
          <MainCard
            sx={{ width: `calc(100% - 48px)`, minWidth: 340, maxWidth: 880, height: 'auto', maxHeight: 'calc(100vh - 48px)' }}
            modal
            content={false}
          >
            <SimpleBar
              sx={{
                maxHeight: `calc(100vh - 48px)`,
                '& .simplebar-content': { display: 'flex', flexDirection: 'column' }
              }}
            >
              {loading ? (
                <Box sx={{ p: 5 }}>
                  <Stack direction="row" justifyContent="center">
                    <CircularWithPath />
                  </Stack>
                </Box>
              ) : (
                tripBookingForm
              )}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
};

TripBookingModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  tripBooking: PropTypes.object
};

export default TripBookingModal;
