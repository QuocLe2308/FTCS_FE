import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { Box, Modal, Stack } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { useGetAllBookingTypes } from 'api/bookingType';
import FormBookingTypeAdd from './FormBookingTypeAdd';

// ==============================|| BOOKING TYPE ADD / EDIT ||============================== //

const BookingTypeModal = ({ open, modalToggler, bookingTypeData, refetch, onSuccess }) => {
  const { bookingTypesLoading: loading } = useGetAllBookingTypes();

  const closeModal = () => modalToggler(false);

  const bookingTypeForm = useMemo(
    () =>
      !loading && (
        <FormBookingTypeAdd bookingTypeData={bookingTypeData || null} closeModal={closeModal} refetch={refetch} onSuccess={onSuccess} />
      ),
    // eslint-disable-next-line
    [bookingTypeData, loading, onSuccess]
  );

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-booking-type-add-label"
          aria-describedby="modal-booking-type-add-description"
          sx={{
            '& .MuiPaper-root:focus': {
              outline: 'none'
            }
          }}
        >
          <MainCard
            sx={{ width: `calc(100% - 48px)`, minWidth: 340, maxWidth: 880, height: 'auto', maxHeight: 'calc(100vh - 48px)' }}
            modal
            content={false}
          >
            <SimpleBar
              sx={{
                maxHeight: `calc(100vh - 48px)`,
                '& .simplebar-content': {
                  display: 'flex',
                  flexDirection: 'column'
                }
              }}
            >
              {loading ? (
                <Box sx={{ p: 5 }}>
                  <Stack direction="row" justifyContent="center">
                    <CircularWithPath />
                  </Stack>
                </Box>
              ) : (
                bookingTypeForm
              )}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
};

BookingTypeModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  bookingTypeData: PropTypes.object,
  refetch: PropTypes.func,
  onSuccess: PropTypes.func
};

export default BookingTypeModal;
