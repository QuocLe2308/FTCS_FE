import PropTypes from 'prop-types';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import { Box, Button, Container, CardMedia, Divider, Grid, Link, Stack, Typography } from '@mui/material';

// third party
import { motion } from 'framer-motion';

// project import
//import useConfig from 'hooks/useConfig';
import { ThemeDirection, ThemeMode } from 'config';

// assets
import { SendOutlined } from '@ant-design/icons';

import imgfootersoc1 from 'assets/images/landing/img-soc1.svg';
import imgfootersoc2 from 'assets/images/landing/img-soc2.svg';
import imgfootersoc3 from 'assets/images/landing/img-soc3.svg';
import AnimateButton from 'components/@extended/AnimateButton';

//const dashImage = require.context('assets/images/landing', true);

// link - custom style
const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.primary.main
  },
  '&:active': {
    color: theme.palette.primary.main
  }
}));

// ==============================|| LANDING - FOOTER PAGE ||============================== //

const FooterBlock = ({ isFull }) => {
  const theme = useTheme();
  //const { presetColor } = useConfig();
  const textColor = theme.palette.mode === ThemeMode.DARK ? 'text.primary' : 'background.paper';

  return (
    <>
      {isFull && (
        <Box
          sx={{
            position: 'relative',
            bgcolor: theme.palette.grey.A700,
            zIndex: 1,
            mt: { xs: 0, md: 13.75 },
            pt: { xs: 8, sm: 7.5, md: 18.75 },
            pb: { xs: 2.5, md: 10 },
            '&:after': {
              content: '""',
              position: 'absolute',
              width: '100%',
              height: '80%',
              bottom: 0,
              left: 0,
              background:
                theme.direction === ThemeDirection.RTL
                  ? `linear-gradient(transparent 100%, rgb(31, 31, 31) 70%)`
                  : `linear-gradient(180deg, transparent 0%, ${theme.palette.grey.A700} 70%)`
            }
          }}
        >
          <Container>
            <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
              <Grid item xs={12} md={6} sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container spacing={2} sx={{ [theme.breakpoints.down('md')]: { pr: 0, textAlign: 'center' } }}>
                  <Grid item xs={12}></Grid>
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
                          fontWeight: 700
                        }}
                      >
                        Hệ Thống FTCS
                      </Typography>
                    </motion.div>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1" sx={{ color: theme.palette.common.white }}>
                      Hệ Thống Kết Nối Vận Chuyển Hàng Hóa (FTCS) - Giải pháp toàn diện cho ngành vận tải, kết nối tài xế và khách hàng một
                      cách hiệu quả.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sx={{ my: 2 }}>
                    <Box sx={{ display: 'inline-block' }}>
                      <AnimateButton>
                        <Button
                          size="large"
                          variant="contained"
                          endIcon={<SendOutlined />}
                          component={Link}
                          href="/dashboard"
                          target="_blank"
                        >
                          Truy Cập Hệ Thống
                        </Button>
                      </AnimateButton>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Box>
      )}

      <Box sx={{ pt: isFull ? 0 : 10, pb: 10, bgcolor: theme.palette.grey.A700 }}>
        <Container>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, translateY: 550 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 150,
                  damping: 30
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h4" sx={{ color: theme.palette.common.white, fontWeight: 700 }}>
                      FTCS
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 400, color: theme.palette.common.white }}>
                      Hệ Thống Kết Nối Vận Chuyển Hàng Hóa (FTCS) là nền tảng công nghệ tiên tiến giúp kết nối tài xế và khách hàng, tối ưu
                      hóa quy trình vận chuyển.
                    </Typography>
                  </Grid>
                </Grid>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={{ xs: 5, md: 2 }}>
                <Grid item xs={6} sm={4}>
                  <Stack spacing={{ xs: 3, md: 5 }}>
                    <Typography variant="h5" color={textColor} sx={{ fontWeight: 500 }}>
                      Hỗ Trợ
                    </Typography>
                    <Stack spacing={{ xs: 1.5, md: 2.5 }}>
                      <FooterLink href="#" underline="none">
                        Trung Tâm Trợ Giúp
                      </FooterLink>
                      <FooterLink href="#" underline="none">
                        Tài Liệu Hướng Dẫn
                      </FooterLink>
                      <FooterLink href="#" underline="none">
                        Liên Hệ Hỗ Trợ
                      </FooterLink>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Stack spacing={{ xs: 3, md: 5 }}>
                    <Typography variant="h5" color={textColor} sx={{ fontWeight: 500 }}>
                      Công Ty
                    </Typography>
                    <Stack spacing={{ xs: 1.5, md: 2.5 }}>
                      <FooterLink href="#" underline="none">
                        Giới Thiệu
                      </FooterLink>
                      <FooterLink href="#" underline="none">
                        Tin Tức
                      </FooterLink>
                      <FooterLink href="#" underline="none">
                        Tuyển Dụng
                      </FooterLink>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Stack spacing={{ xs: 3, md: 5 }}>
                    <Typography variant="h5" color={textColor} sx={{ fontWeight: 500 }}>
                      Pháp Lý
                    </Typography>
                    <Stack spacing={{ xs: 1.5, md: 2.5 }}>
                      <FooterLink href="#" underline="none">
                        Điều Khoản Sử Dụng
                      </FooterLink>
                      <FooterLink href="#" underline="none">
                        Chính Sách Bảo Mật
                      </FooterLink>
                      <FooterLink href="#" underline="none">
                        Chính Sách Hoàn Tiền
                      </FooterLink>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, borderColor: 'divider' }} />
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <Typography variant="body2" color={textColor}>
                © {new Date().getFullYear()} FTCS. Tất cả quyền được bảo lưu.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
              <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-end' }}>
                <Link href="#" target="_blank" sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
                  <CardMedia component="img" image={imgfootersoc1} sx={{ width: 'auto' }} />
                </Link>
                <Link href="#" target="_blank" sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
                  <CardMedia component="img" image={imgfootersoc2} sx={{ width: 'auto' }} />
                </Link>
                <Link href="#" target="_blank" sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
                  <CardMedia component="img" image={imgfootersoc3} sx={{ width: 'auto' }} />
                </Link>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

FooterBlock.propTypes = {
  isFull: PropTypes.bool
};

export default FooterBlock;
