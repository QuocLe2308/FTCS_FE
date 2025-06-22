import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { Box, Modal, Stack } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { useGetAllInsurancePolicies } from 'api/insurance';
import FormInsurancePolicyAdd from './FormInsurancePolicyAdd';

// ==============================|| INSURANCE POLICY ADD / EDIT ||============================== //

const InsurancePolicyModal = ({ open, modalToggler, policyData, refetch, onSuccess }) => {
  const { insurancePoliciesLoading: loading } = useGetAllInsurancePolicies();

  const closeModal = () => modalToggler(false);

  const policyForm = useMemo(
    () =>
      !loading && (
        <FormInsurancePolicyAdd policyData={policyData || null} closeModal={closeModal} refetch={refetch} onSuccess={onSuccess} />
      ),
    // eslint-disable-next-line
    [policyData, loading, onSuccess]
  );

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-insurance-policy-add-label"
          aria-describedby="modal-insurance-policy-add-description"
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
                policyForm
              )}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
};

InsurancePolicyModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  policyData: PropTypes.object,
  refetch: PropTypes.func,
  onSuccess: PropTypes.func
};

export default InsurancePolicyModal;
