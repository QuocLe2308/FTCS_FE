import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { Box, Modal, Stack } from '@mui/material';

// project-imports
import FormDriverAdd from './FormDriverAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { useGetDriver } from 'api/driver';

// ==============================|| DRIVER ADD / EDIT ||============================== //

const DriverModal = ({ open, modalToggler, driver }) => {
  const { driversLoading: loading } = useGetDriver();

  const closeModal = () => modalToggler(false);

  const driverForm = useMemo(
    () => !loading && <FormDriverAdd driver={driver || null} closeModal={closeModal} />,
    // eslint-disable-next-line
    [driver, loading]
  );

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-driver-add-label"
          aria-describedby="modal-driver-add-description"
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
                driverForm
              )}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
};

DriverModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  driver: PropTypes.object
};

export default DriverModal;
