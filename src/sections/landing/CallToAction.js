// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, Container, CardMedia, Grid, Link, Typography } from '@mui/material';

// third party
import { motion } from 'framer-motion';

// project import
import AnimateButton from 'components/@extended/AnimateButton';
import { ThemeMode } from 'config';

// assets
import { DownloadOutlined } from '@ant-design/icons';
import imgbg from 'assets/images/landing/mobile-app-512.png';

// ==============================|| LANDING - CALL TO ACTION PAGE ||============================== //

const CallToActionPage = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: theme.palette.mode === ThemeMode.DARK ? theme.palette.grey[100] : theme.palette.secondary[800],
        '&:after': {
          content: '""',
          position: 'absolute',
          width: '100%',
          height: '80%',
          bottom: 0,
          left: 0,
          background: `linear-gradient(180deg, transparent, ${
            theme.palette.mode === ThemeMode.DARK ? theme.palette.grey[100] : theme.palette.secondary[800]
          })`
        }
      }}
    >
      <CardMedia
        component="img"
        image={imgbg}
        sx={{
          width: 'auto',
          position: 'absolute',
          top: 0,
          right: 0,
          filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.2))'
        }}
      />
      <Container>
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{
            position: 'relative',
            zIndex: 1,
            pt: { md: 18.75, xs: 7.5 },
            pb: { md: 10, xs: 3.75 }
          }}
        >
          <Grid item xs={12} md={7} sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={2} sx={{ [theme.breakpoints.down('md')]: { pr: 0, textAlign: 'center' } }}>
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, translateY: 550 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 150,
                    damping: 30
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      color: theme.palette.common.white,
                      fontSize: { xs: '1.25rem', sm: '1.56rem', md: '1.875rem' },
                      fontWeight: 700,
                      lineHeight: { xs: 1.4, sm: 1.4, md: 1.4 },
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    <Box component="span" sx={{ mx: 0 }}>
                      Tải xuống
                    </Box>
                    <Box component="span" sx={{ mx: 0, color: theme.palette.primary.main }}>
                      &nbsp;FTCS&nbsp;
                    </Box>
                    phiên bản di động để sử dụng dịch vụ
                  </Typography>
                </motion.div>
              </Grid>
              <Grid item xs={12} sx={{ my: 3.25 }}>
                <motion.div
                  initial={{ display: 'inline-block', opacity: 0, translateY: 550 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 150,
                    damping: 30,
                    delay: 0.2
                  }}
                >
                  <AnimateButton>
                    <Button
                      component={Link}
                      target="_blank"
                      href=""
                      size="large"
                      color="primary"
                      variant="contained"
                      startIcon={<DownloadOutlined />}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        boxShadow: '0 4px 14px 0 rgba(0,0,0,0.2)',
                        '&:hover': {
                          boxShadow: '0 6px 20px 0 rgba(0,0,0,0.3)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Tải Xuống Ngay
                    </Button>
                  </AnimateButton>
                </motion.div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CallToActionPage;
