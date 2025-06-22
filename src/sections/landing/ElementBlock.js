// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, CardMedia, Container, Grid, Typography } from '@mui/material';

// third party
import { motion } from 'framer-motion';

// project import
import { ThemeMode } from 'config';
//import useConfig from 'hooks/useConfig';

// assets
//import { CheckCircleOutlined } from '@ant-design/icons';
import imgelementmsg from 'assets/images/landing/img-element-msg.png';
import imgelementwidget from 'assets/images/landing/img-element-widget.png';
import PriceList from './PriceList';

//const dashImage = require.context('assets/images/landing', true);

// ==============================|| LANDING - ELEMENT PAGE ||============================== //

const ElementBlock = () => {
  const theme = useTheme();
  //const { presetColor } = useConfig();

  //const checkIcon = <CheckCircleOutlined style={{ color: theme.palette.primary.main, fontSize: '1.15rem' }} />;

  return (
    <Box
      sx={{
        overflowX: 'hidden',
        position: 'relative',
        '&:after': {
          content: '""',
          position: 'absolute',
          width: '100%',
          height: '45%',
          bottom: 0,
          left: 0,
          background: theme.palette.mode === ThemeMode.DARK ? theme.palette.grey[100] : theme.palette.secondary[800],
          [theme.breakpoints.down('sm')]: { height: '60%' }
        },
        '@keyframes slideY': {
          '0%': {
            transform: 'translateY(0px)'
          },
          '50%': {
            transform: 'translateY(0px)'
          },
          '100%': {
            transform: 'translateY(0px)'
          },
          '25%': {
            transform: 'translateY(-20px)'
          },
          '75%': {
            transform: 'translateY(20px)'
          }
        }
      }}
    >
      <Container sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container alignItems="center" justifyContent="center" spacing={2} sx={{ mt: { md: 15, xs: 2.5 }, mb: { md: 10, xs: 2.5 } }}>
          <Grid item xs={12}>
            <Grid container spacing={1} justifyContent="center" sx={{ mb: 4, textAlign: 'center' }}>
              <Grid item sm={10} md={6}>
                <Grid container spacing={1} justifyContent="center">
                  <Grid item xs={12}>
                    <Typography
                      variant="h2"
                      sx={{
                        mb: 2,
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 700
                      }}
                    >
                      Bảng Giá Linh Hoạt
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', color: 'text.secondary' }}>
                      Hệ thống Kết nối Vận chuyển Hàng hóa cung cấp các gói dịch vụ linh hoạt phù hợp với mọi nhu cầu vận chuyển của bạn
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={9}>
            <Box sx={{ position: 'relative', mb: 3 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 150, damping: 30, delay: 0.4 }}
              ></motion.div>
              <Box
                sx={{
                  width: 'auto',
                  position: 'absolute',
                  top: '3%',
                  right: '-17%',
                  animation: '10s slideY linear infinite',
                  animationDelay: '2s',
                  [theme.breakpoints.down('sm')]: { display: 'none' }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 150,
                    damping: 30,
                    delay: 0.4
                  }}
                >
                  <CardMedia
                    component="img"
                    image={imgelementmsg}
                    sx={{
                      width: 'auto',
                      position: 'absolute',
                      top: '3%',
                      right: '-17%',
                      [theme.breakpoints.down('sm')]: { display: 'none' }
                    }}
                  />
                </motion.div>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '20%',
                  left: '-17%',
                  width: 'auto',
                  animation: '10s slideY linear infinite',
                  animationDelay: '2s',
                  [theme.breakpoints.down('sm')]: { display: 'none' }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 30, delay: 0.4 }}
                >
                  <CardMedia
                    component="img"
                    image={imgelementwidget}
                    sx={{
                      width: 'auto',
                      position: 'absolute',
                      bottom: '20%',
                      left: '-17%',
                      [theme.breakpoints.down('sm')]: { display: 'none' }
                    }}
                  />
                </motion.div>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={8}>
            <PriceList />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ElementBlock;
