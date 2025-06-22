import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { Modal } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

import FormInsuranceClaimStatus from './FormInsuranceClaimStatus';

// ==============================|| INSURANCE CLAIM STATUS UPDATE ||============================== //

const InsuranceClaimModal = ({ open, modalToggler, claimData, refetch, onSuccess }) => {
  const closeModal = () => modalToggler(false);

  const claimForm = useMemo(
    () => <FormInsuranceClaimStatus claimData={claimData || null} closeModal={closeModal} refetch={refetch} onSuccess={onSuccess} />,
    // eslint-disable-next-line
    [claimData, onSuccess]
  );

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-insurance-claim-status-label"
          aria-describedby="modal-insurance-claim-status-description"
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
              {claimForm}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
};

InsuranceClaimModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  claimData: PropTypes.object,
  refetch: PropTypes.func,
  onSuccess: PropTypes.func
};

export default InsuranceClaimModal;
