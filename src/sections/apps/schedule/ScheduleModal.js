import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { Box, Modal } from '@mui/material';
import FormScheduleAdd from './FormScheduleAdd'; // We'll create this
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import { useGetSchedules } from 'api/schedules';
import { Stack } from 'immutable';

const ScheduleModal = ({ open, modalToggler, schedule }) => {
  const { schedulesLoading: loading } = useGetSchedules();

  const closeModal = () => modalToggler(false);

  const scheduleForm = useMemo(
    () => !loading && <FormScheduleAdd schedule={schedule || null} closeModal={closeModal} />,
    [schedule, loading]
  );

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-schedule-add-label"
          aria-describedby="modal-schedule-add-description"
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
                scheduleForm
              )}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
};

ScheduleModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  schedule: PropTypes.object
};

export default ScheduleModal;
