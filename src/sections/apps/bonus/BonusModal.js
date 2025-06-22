import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { Box, Modal, Stack } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { useGetAllBonusConfigurations } from 'api/bonus';
import FormBonusAdd from './FormBonusAdd';

// ==============================|| BONUS CONFIGURATION ADD / EDIT ||============================== //

const BonusModal = ({ open, modalToggler, bonusConfig, refetch, onSuccess }) => {
  const { bonusConfigurationsLoading: loading } = useGetAllBonusConfigurations();

  const closeModal = () => modalToggler(false);

  const bonusForm = useMemo(
    () => !loading && <FormBonusAdd bonusConfig={bonusConfig || null} closeModal={closeModal} refetch={refetch} onSuccess={onSuccess} />,
    // eslint-disable-next-line
    [bonusConfig, loading, onSuccess]
  );

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-bonus-add-label"
          aria-describedby="modal-bonus-add-description"
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
                bonusForm
              )}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
};

BonusModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  bonusConfig: PropTypes.object,
  refetch: PropTypes.func,
  onSuccess: PropTypes.func
};

export default BonusModal;
