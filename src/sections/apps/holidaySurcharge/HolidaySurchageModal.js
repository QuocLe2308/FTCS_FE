import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { Box, Modal, Stack } from '@mui/material';

// project-imports
import FormHolidaySurchageAdd from './FormHolidaySurchageAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { useGetHolidaySurcharge } from 'api/holidaySurcharge';

// ==============================|| DRIVER ADD / EDIT ||============================== //

const HolidaySurchageModal = ({ open, modalToggler, holidaySurchage, refetch }) => {
  const { holidaySurchagesLoading: loading } = useGetHolidaySurcharge();

  const closeModal = () => modalToggler(false);

  const holidaySurchageForm = useMemo(
    () => !loading && <FormHolidaySurchageAdd holidaySurchage={holidaySurchage || null} closeModal={closeModal} refetch={refetch} />,
    // eslint-disable-next-line
    [holidaySurchage, loading]
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
                holidaySurchageForm
              )}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
};

HolidaySurchageModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  holidaySurchage: PropTypes.object
};

export default HolidaySurchageModal;
