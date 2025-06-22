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
import TripBookingModal from './TripBookingModal';
import AlertTripBookingDelete from './AlertTripBookingDelete';
import { EnvironmentOutlined, MoreOutlined } from '@ant-design/icons';

const TripBookingCard = ({ tripBooking }) => {
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

  const editTripBooking = () => {
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
                  primary={<Typography variant="subtitle1">Booking #{tripBooking.bookingId}</Typography>}
                  secondary={
                    <Typography variant="caption" color="secondary">
                      {tripBooking.status}
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
              <MenuItem onClick={editTripBooking}>Edit</MenuItem>
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
                    <ListItemText primary={<Typography color="secondary">{tripBooking.startLocationAddress}</Typography>} />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={<Typography color="secondary">Start: {new Date(tripBooking.bookingDate).toLocaleString()}</Typography>}
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
                    <ListItemText primary={<Typography color="secondary">{tripBooking.endLocationAddress}</Typography>} />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={<Typography color="secondary">End: {new Date(tripBooking.expirationDate).toLocaleString()}</Typography>}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Box>
              <Chip
                color={tripBooking.status === 'ORDER_COMPLETED' ? 'success' : tripBooking.status === 'PENDING' ? 'warning' : 'info'}
                variant="outlined"
                size="small"
                label={tripBooking.status}
              />
            </Box>
          </Grid>
        </Grid>
        <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end" sx={{ mt: 'auto', pt: 2.25 }}>
          <Typography variant="caption" color="secondary">
            Updated: {new Date(tripBooking.updateAt).toLocaleString()}
          </Typography>
        </Stack>
      </MainCard>

      <TripBookingModal open={openModal} modalToggler={setOpenModal} tripBooking={tripBooking} />
      <AlertTripBookingDelete id={tripBooking.bookingId} title={tripBooking.bookingId} open={openAlert} handleClose={handleAlertClose} />
    </>
  );
};

TripBookingCard.propTypes = {
  tripBooking: PropTypes.object
};

export default TripBookingCard;
