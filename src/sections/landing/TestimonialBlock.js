import PropTypes from 'prop-types';

// material-ui
import { Box, Container, Grid, Rating, Typography } from '@mui/material';

// third party
import Slider from 'react-slick';

// project import
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// assets
import imgfeature1 from 'assets/images/landing/img-user1.svg';

// ================================|| TESTIMONIAL - ITEMS ||================================ //

const Item = ({ item }) => (
  <MainCard sx={{ mx: 2 }} contentSX={{ p: 3 }}>
    <Grid container spacing={1}>
      <Grid item>
        <Avatar src={item.image} alt="feature" />
      </Grid>
      <Grid item sm zeroMinWidth>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {item.title}
            </Typography>
            <Rating name="read-only" readOnly value={item.rating} size="small" precision={0.5} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" color="secondary">
              {item.review}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{item.client}</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </MainCard>
);

Item.propTypes = {
  item: PropTypes.shape({
    image: PropTypes.string,
    title: PropTypes.string,
    review: PropTypes.string,
    rating: PropTypes.number,
    client: PropTypes.string
  })
};

// ==============================|| LANDING - TESTIMONIAL PAGE ||============================== //

const TestimonialBlock = () => {
  const settings = {
    autoplay: true,
    arrows: false,
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  const items = [
    {
      image: imgfeature1,
      title: 'Tính Năng Tìm Kiếm',
      review:
        'Hệ thống có tính năng tìm kiếm mạnh mẽ và dễ sử dụng giúp người dùng nhanh chóng tìm thấy thông tin cần thiết. Giao diện rất thân thiện và tốc độ tìm kiếm rất nhanh.',
      rating: 5,
      client: 'Nguyễn Văn Minh'
    },
    {
      image: imgfeature1,
      title: 'Quản Lý Vận Chuyển',
      review:
        'Hệ thống cung cấp công cụ quản lý vận chuyển tuyệt vời. Tôi có thể dễ dàng theo dõi hành trình, cập nhật trạng thái và quản lý đơn hàng một cách hiệu quả.',
      rating: 5,
      client: 'Lê Thị Mai'
    },
    {
      image: imgfeature1,
      title: 'Hiệu Suất và Tốc Độ',
      review: 'Hệ thống hoạt động mượt mà, với thời gian phản hồi nhanh ngay cả khi số lượng người dùng tăng lên.',
      rating: 4,
      client: 'Trần Đức Anh'
    },
    {
      image: imgfeature1,
      title: 'Tính Năng Bảo Mật',
      review: 'Hệ thống có tính năng bảo mật mạnh mẽ đảm bảo an toàn dữ liệu người dùng và bảo vệ khỏi truy cập trái phép.',
      rating: 5,
      client: 'Vũ Hoàng Nam'
    },
    {
      image: imgfeature1,
      title: 'Hỗ Trợ Khách Hàng',
      review: 'Đội ngũ hỗ trợ rất nhiệt tình và chuyên nghiệp. Mọi vấn đề hoặc thắc mắc của tôi đều được giải quyết nhanh chóng.',
      rating: 5,
      client: 'Phạm Thị Hương'
    },
    {
      image: imgfeature1,
      title: 'Tính Năng Theo Dõi',
      review:
        'Tính năng theo dõi hành trình thời gian thực giúp tôi luôn biết vị trí của hàng hóa, tạo sự tin tưởng và an tâm cho khách hàng.',
      rating: 5,
      client: 'Ngô Văn Sơn'
    }
  ];

  return (
    <Box sx={{ overflowX: 'hidden' }}>
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
                      Đánh Giá Từ Khách Hàng
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', color: 'text.secondary' }}>
                      Hệ thống Kết nối Vận chuyển Hàng hóa của chúng tôi nhận được những đánh giá xuất sắc, với điểm trung bình 4.9/5. Chúng
                      tôi tự hào chia sẻ những trải nghiệm tích cực từ những khách hàng trung thành đã được hưởng lợi từ nền tảng đổi mới
                      của chúng tôi.
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item lg={6} md={8} xs={12} sx={{ '& .slick-list': { overflow: 'visible' } }}>
            <Slider {...settings}>
              {items.map((item, index) => (
                <Item key={index} item={item} />
              ))}
            </Slider>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default TestimonialBlock;
