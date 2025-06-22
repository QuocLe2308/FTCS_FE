import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  useMediaQuery,
  Grid,
  Chip,
  Divider,
  //Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';

// third-party
//import { PatternFormat } from 'react-number-format';

// project import
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';

// assets
import { EnvironmentOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';

const avatarImage = require.context('assets/images/users', true);

const allStatus = [
  { value: 3, label: 'Rejected' },
  { value: 1, label: 'Verified' },
  { value: 2, label: 'Pending' }
];

// ==============================|| EXPANDING TABLE - USER DETAILS ||============================== //

const ExpandingUserDetail = ({ data }) => {
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down('md'));

  const selectedStatus = allStatus.filter((item) => item.value === Number(data.status));

  return (
    <Grid container spacing={2.5} sx={{ pl: { xs: 0, sm: 5, md: 6, lg: 10, xl: 12 } }}>
      <Grid item xs={12} sm={5} md={4} xl={3.5}>
        <MainCard>
          <Chip
            label={selectedStatus.length > 0 ? selectedStatus[0].label : 'Pending'}
            size="small"
            sx={{
              position: 'absolute',
              right: -1,
              top: -1,
              borderRadius: '0 4px 0 4px'
            }}
          />
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack spacing={2.5} alignItems="center">
                <Avatar alt="Avatar 1" size="xl" src={avatarImage(`./avatar-1.png`)} />
                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="h5">{data.driverIdentity.driverFullName}</Typography>
                  <Typography color="secondary">{data.role}</Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-around" alignItems="center">
                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="h5">{data.age}</Typography>
                  <Typography color="secondary">Age</Typography>
                </Stack>
                <Divider orientation="vertical" flexItem />
                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="h5">{data.progress}%</Typography>
                  <Typography color="secondary">Progress</Typography>
                </Stack>
                <Divider orientation="vertical" flexItem />
                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="h5">{data.visits}</Typography>
                  <Typography color="secondary">Visits</Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <List component="nav" aria-label="main mailbox folders" sx={{ py: 0, '& .MuiListItem-root': { p: 0 } }}>
                <ListItem>
                  <ListItemIcon>
                    <MailOutlined />
                  </ListItemIcon>
                  <ListItemText primary={<Typography color="secondary">Email</Typography>} />
                  <ListItemSecondaryAction>
                    <Typography align="right">{data.email}</Typography>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneOutlined />
                  </ListItemIcon>
                  <ListItemText primary={<Typography color="secondary">Số điện thoại</Typography>} />
                  <ListItemSecondaryAction>
                    <Typography align="right">{data.phone}</Typography>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EnvironmentOutlined />
                  </ListItemIcon>
                  <ListItemText primary={<Typography color="secondary">Địa chỉ</Typography>} />
                  <ListItemSecondaryAction>
                    <Typography align="right">{data.driverIdentity.driverCountry}</Typography>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      <Grid item xs={12} sm={7} md={8} xl={8.5}>
        <Stack spacing={2.5}>
          <MainCard title="Thông tin cá nhân">
            <List sx={{ py: 0 }}>
              <ListItem divider={!matchDownMD}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Họ và tên</Typography>
                      <Typography>{data.driverIdentity.driverFullName}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">ID </Typography>
                      <Typography>{data.driverIdentity.driverIDNumber}</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem divider={!matchDownMD}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Quốc gia</Typography>
                      <Typography>{data.driverIdentity.driverCountry}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Ngày sinh</Typography>
                      <Typography>{new Date(data.driverIdentity.driverBirthday).toLocaleDateString('vi-VN')}</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem divider={!matchDownMD}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Địa chỉ thường trú</Typography>
                      <Typography>100 đường Trần Hoàng Na, phường An Khánh, quận Ninh Kiều, TP.Cần Thơ</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Địa chỉ tạm thời</Typography>
                      <Typography>13/2 đường Hoàng Diệu, phường 12, quận 4, TP.Hồ Chí Minh</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </ListItem>
            </List>
          </MainCard>
          <MainCard title="Giới thiệu">
            <Typography color="secondary">
              Chào, tôi là {data.firstName} {data.lastName} {data.role} Của FTCS {data.about}
            </Typography>
          </MainCard>
        </Stack>
      </Grid>
    </Grid>
  );
};

ExpandingUserDetail.propTypes = {
  data: PropTypes.object
};

export default ExpandingUserDetail;
