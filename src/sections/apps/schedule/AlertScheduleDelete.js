import PropTypes from 'prop-types';
import { Button, Dialog, DialogContent, Stack, Typography } from '@mui/material';
import { PopupTransition } from 'components/@extended/Transitions';
import Avatar from 'components/@extended/Avatar';
import { deleteSchedule } from 'api/schedules';
import { openSnackbar } from 'api/snackbar';
import { DeleteFilled } from '@ant-design/icons';

const AlertScheduleDelete = ({ id, open, handleClose }) => {
  const deleteHandler = async () => {
    await deleteSchedule(id).then(() => {
      openSnackbar({
        open: true,
        message: 'Xóa lịch trình thành công!',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'success' }
      });
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
      aria-labelledby="schedule-delete-title"
      aria-describedby="schedule-delete-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack alignItems="center" spacing={3.5}>
          <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <DeleteFilled />
          </Avatar>
          <Stack spacing={2}>
            <Typography variant="h4" align="center">
              Bạn có chắc chắn muốn xóa lịch trình này không?
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
};

AlertScheduleDelete.propTypes = {
  id: PropTypes.any,
  open: PropTypes.bool,
  handleClose: PropTypes.func
};

export default AlertScheduleDelete;
