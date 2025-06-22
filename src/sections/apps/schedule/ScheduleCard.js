import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Fade,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import ScheduleModal from './ScheduleModal';
import AlertScheduleDelete from './AlertScheduleDelete';
import { EnvironmentOutlined, MoreOutlined } from '@ant-design/icons';

const ScheduleCard = ({ schedule }) => {
  const [openModal, setOpenModal] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    handleMenuClose();
  };

  const editSchedule = () => {
    setOpenModal(true);
  };

  return (
    <>
      <MainCard sx={{ height: 1, '& .MuiCardContent-root': { height: 1, display: 'flex', flexDirection: 'column' } }}>
        <Grid container spacing={2.25}>
          <Grid item xs={12}>
            <List sx={{ width: 1, p: 0 }}>
              <ListItem
                disablePadding
                secondaryAction={
                  <IconButton edge="end" aria-label="options" color="secondary" onClick={handleMenuClick}>
                    <MoreOutlined style={{ fontSize: '1.15rem' }} />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={<Typography variant="subtitle1">Schedule #{schedule.scheduleId}</Typography>}
                  secondary={
                    <Typography variant="caption" color="secondary">
                      {schedule.status}
                    </Typography>
                  }
                />
              </ListItem>
            </List>
            <Menu
              id="fade-menu"
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              TransitionComponent={Fade}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={editSchedule}>Edit</MenuItem>
              <MenuItem onClick={handleAlertClose}>Delete</MenuItem>
            </Menu>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <List sx={{ p: 0, '& .MuiListItem-root': { py: 0.5 } }}>
                  <ListItem>
                    <ListItemIcon>
                      <EnvironmentOutlined />
                    </ListItemIcon>
                    <ListItemText primary={<Typography color="secondary">{schedule.startLocationAddress}</Typography>} />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={<Typography color="secondary">Start: {new Date(schedule.startDate).toLocaleString()}</Typography>}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={6}>
                <List sx={{ p: 0, '& .MuiListItem-root': { py: 0.5 } }}>
                  <ListItem>
                    <ListItemIcon>
                      <EnvironmentOutlined />
                    </ListItemIcon>
                    <ListItemText primary={<Typography color="secondary">{schedule.endLocationAddress}</Typography>} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={<Typography color="secondary">End: {new Date(schedule.endDate).toLocaleString()}</Typography>} />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Box>
              <Chip
                color={schedule.status === 'GETTING_TO_THE_POINT' ? 'info' : schedule.status === 'COMPLETED' ? 'success' : 'warning'}
                variant="outlined"
                size="small"
                label={schedule.status}
              />
            </Box>
          </Grid>
        </Grid>
        <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end" sx={{ mt: 'auto', pt: 2.25 }}>
          <Typography variant="caption" color="secondary">
            Updated: {new Date(schedule.updateAt).toLocaleString()}
          </Typography>
        </Stack>
      </MainCard>

      <ScheduleModal open={openModal} modalToggler={setOpenModal} schedule={schedule} />
      <AlertScheduleDelete id={schedule.scheduleId} title={schedule.scheduleId} open={openAlert} handleClose={handleAlertClose} />
    </>
  );
};

ScheduleCard.propTypes = {
  schedule: PropTypes.object
};

export default ScheduleCard;
