import PropTypes from 'prop-types';

// material-ui
import { Button, Dialog, DialogContent, Stack, Typography } from '@mui/material';

// project import
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

import { deleteBookingType } from 'api/bookingType';
import { openSnackbar } from 'api/snackbar';

// assets
import { DeleteFilled } from '@ant-design/icons';

// ==============================|| BOOKING TYPE - DELETE ||============================== //

export default function AlertInsuranceClaimDelete({ bookingTypeId, open, handleClose, refetch, onDeleteSuccess }) {
  const deleteHandler = async () => {
    await deleteBookingType(bookingTypeId).then(() => {
      openSnackbar({
        open: true,
        message: 'Xoá thành công',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'success'
        }
      });
      refetch();
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
      handleClose();
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      aria-labelledby="booking-type-delete-title"
      aria-describedby="booking-type-delete-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack alignItems="center" spacing={3.5}>
          <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <DeleteFilled />
          </Avatar>
          <Stack spacing={2}>
            <Typography variant="h4" align="center">
              Bạn có chắc chắn muốn xóa không?
            </Typography>
            <Typography align="center">
            Bạn sẽ không thể khôi phục lại sau khi xóa. Bạn có muốn tiếp tục không?
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ width: 1 }}>
            <Button fullWidth onClick={handleClose} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button fullWidth color="error" variant="contained" onClick={deleteHandler} autoFocus>
              Delete
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

AlertInsuranceClaimDelete.propTypes = {
  bookingTypeId: PropTypes.any,
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  refetch: PropTypes.func,
  onDeleteSuccess: PropTypes.func
};
