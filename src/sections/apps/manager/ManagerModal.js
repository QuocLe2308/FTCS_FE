import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { Box, Modal, Stack } from '@mui/material';

// project-imports
import FormManagerAdd from './FormManagerAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { useGetAcocuntByRole } from 'api/manager';

// ==============================|| MANAGER ADD / EDIT ||============================== //

const ManagerModal = ({ open, modalToggler, manager, refetch, selectedRole }) => {
  console.log('Selected Role:', selectedRole);
  const { managersLoading: loading } = useGetAcocuntByRole();
  const closeModal = () => modalToggler(false);

  const managerForm = useMemo(
    () => !loading && <FormManagerAdd manager={manager || null} closeModal={closeModal} refetch={refetch} role={selectedRole} />,
    // eslint-disable-next-line
    [manager, loading]
  );

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-manager-add-label"
          aria-describedby="modal-manager-add-description"
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
                managerForm
              )}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
};

ManagerModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  manager: PropTypes.object,
  selectedRole: PropTypes.string.isRequired
};

export default ManagerModal;
