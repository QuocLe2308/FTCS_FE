// material-ui
import { Container, Grid, Typography } from '@mui/material';

// third party
import { motion } from 'framer-motion';

// ==============================|| LANDING - NUMBER BLOCK PAGE ||============================== //

const NumberBlock = () => (
  <Container>
    <Grid container alignItems="center" spacing={2} sx={{ mt: { md: 15, xs: 2.5 }, mb: { md: 10, xs: 2.5 } }}>
      <Grid item xs={12} sm={6} md={4}>
        <motion.div
          initial={{ opacity: 0, translateY: 550 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'spring',
            stiffness: 150,
            damping: 30,
            delay: 0.2
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography
                variant="h2"
                sx={{
                  minWidth: 80,
                  textAlign: 'right',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700
                }}
              >
                50+
              </Typography>
            </Grid>
            <Grid item xs zeroMinWidth>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Màn Hình Tùy Chỉnh
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Ứng dụng của chúng tôi cung cấp hơn 50 màn hình chuyên biệt, bao gồm bảng điều khiển cho tài xế và khách hàng, trang đặt
                    hàng và theo dõi vận chuyển thời gian thực, tất cả được thiết kế để đơn giản hóa hoạt động logistics.
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </motion.div>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <motion.div
          initial={{ opacity: 0, translateY: 550 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'spring',
            stiffness: 150,
            damping: 30,
            delay: 0.4
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography
                variant="h2"
                sx={{
                  minWidth: 80,
                  textAlign: 'right',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700
                }}
              >
                100+
              </Typography>
            </Grid>
            <Grid item xs zeroMinWidth>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Tính Năng Tương Tác
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Với hơn 100 tính năng tương tác, ứng dụng của chúng tôi hỗ trợ đặt hàng hiệu quả, lên lịch linh hoạt và giao tiếp trực
                    tiếp để đảm bảo tương tác mượt mà giữa tài xế và khách hàng.
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </motion.div>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <motion.div
          initial={{ opacity: 0, translateY: 550 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'spring',
            stiffness: 150,
            damping: 30,
            delay: 0.6
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography
                variant="h2"
                sx={{
                  minWidth: 80,
                  textAlign: 'right',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700
                }}
              >
                1000+
              </Typography>
            </Grid>
            <Grid item xs zeroMinWidth>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Tác Động và Tăng Trưởng
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Với hơn 1000 người dùng tích cực, Hệ thống Kết nối Vận chuyển Hàng hóa đã chứng minh được khả năng tối ưu hóa đáng kể
                    hoạt động vận chuyển, giảm chi phí và tăng hiệu suất sử dụng tài nguyên cho cả tài xế và khách hàng.
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </motion.div>
      </Grid>
    </Grid>
  </Container>
);

export default NumberBlock;
