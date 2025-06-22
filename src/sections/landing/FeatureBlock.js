// material-ui
import { Container, Grid, Typography } from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import Animation from './Animation';

// assets
import imgfeature1 from 'assets/images/landing/img-feature1.svg';
import imgfeature2 from 'assets/images/landing/img-feature2.svg';
import imgfeature3 from 'assets/images/landing/img-feature3.svg';

// ==============================|| LANDING - FEATURE PAGE ||============================== //

const FeatureBlock = () => (
  <Container>
    <Grid container alignItems="center" justifyContent="center" spacing={2} sx={{ mt: { md: 15, xs: 2.5 }, mb: { md: 10, xs: 2.5 } }}>
      <Grid item xs={12}>
        <Grid container spacing={1} justifyContent="center" sx={{ mb: 4, textAlign: 'center' }}>
          <Grid item sm={10} md={6}>
            <Grid container spacing={1} justifyContent="center">
              <Grid item xs={12}></Grid>
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
                  Tại Sao Chọn Hệ Thống Kết Nối Vận Chuyển?
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', color: 'text.secondary' }}>
                  Cách mạng hóa ngành vận chuyển hàng hóa với nền tảng thân thiện, được thiết kế để tối ưu hóa logistics và thúc đẩy sự hợp
                  tác giữa tài xế và khách hàng.
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Animation
          variants={{
            hidden: { opacity: 0, translateY: 550 },
            visible: { opacity: 1, translateY: 0 }
          }}
        >
          <MainCard
            contentSX={{ p: 3 }}
            sx={{
              height: '100%',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <img src={imgfeature1} alt="feature" style={{ width: '100%', maxWidth: '200px', margin: '0 auto' }} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ fontWeight: 600, mt: 2, color: 'primary.main' }}>
                  Thiết Kế Hiệu Quả
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" color="secondary">
                  Hệ thống cung cấp giao diện chuyên nghiệp được thiết kế để tương tác mượt mà, lý tưởng cho việc quản lý logistics hiệu
                  quả.
                </Typography>
              </Grid>
            </Grid>
          </MainCard>
        </Animation>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Animation
          variants={{
            hidden: { opacity: 0, translateY: 550 },
            visible: { opacity: 1, translateY: 0 }
          }}
        >
          <MainCard
            contentSX={{ p: 3 }}
            sx={{
              height: '100%',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <img src={imgfeature2} alt="feature" style={{ width: '100%', maxWidth: '200px', margin: '0 auto' }} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ fontWeight: 600, mt: 2, color: 'primary.main' }}>
                  Giải Pháp Tùy Chỉnh
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" color="secondary">
                  Linh hoạt thích ứng với nhu cầu riêng của cả tài xế và khách hàng, nền tảng của chúng tôi đảm bảo kết nối và giải pháp vận
                  chuyển phù hợp.
                </Typography>
              </Grid>
            </Grid>
          </MainCard>
        </Animation>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Animation
          variants={{
            hidden: { opacity: 0, translateY: 550 },
            visible: { opacity: 1, translateY: 0 }
          }}
        >
          <MainCard
            contentSX={{ p: 3 }}
            sx={{
              height: '100%',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <img src={imgfeature3} alt="feature" style={{ width: '100%', maxWidth: '200px', margin: '0 auto' }} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ fontWeight: 600, mt: 2, color: 'primary.main' }}>
                  Tài Liệu Hướng Dẫn
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" color="secondary">
                  Cần hướng dẫn? Khám phá tài liệu hướng dẫn người dùng và kỹ thuật chi tiết của chúng tôi với các bước thực hiện và phương
                  pháp tốt nhất.
                </Typography>
              </Grid>
            </Grid>
          </MainCard>
        </Animation>
      </Grid>
    </Grid>
  </Container>
);

export default FeatureBlock;
