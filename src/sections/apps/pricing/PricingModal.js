import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { Box, Modal, Stack } from '@mui/material';

// project-imports
import FormPricingAdd from './FormPricingAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { useGetPricing } from 'api/pricing';

// ==============================|| PRICING ADD / EDIT ||============================== //

const PricingModal = ({ open, modalToggler, pricing, refetch }) => {
  const { pricingsLoading: loading } = useGetPricing();

  const closeModal = () => modalToggler(false);

  const pricingForm = useMemo(
    () => !loading && <FormPricingAdd pricing={pricing || null} closeModal={closeModal} refetch={refetch} />,
    // eslint-disable-next-line
    [pricing, loading]
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
                pricingForm
              )}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
};

PricingModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  pricing: PropTypes.object
};

export default PricingModal;
