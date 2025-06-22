//import { Link as RouterLink } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import { ThemeMode } from 'config';

// table data
function createData(distance, weight, pricePerKm, pricePerTon, total) {
  return { distance, weight, pricePerKm, pricePerTon, total };
}

const rows = [
  createData('Up to 10 km', 'Up to 100 kg', '₫12,000', '₫6,000', '₫18,000'),
  createData('Up to 10 km', 'Up to 1000 kg', '₫10,000', '₫5,500', '₫15,500'),
  createData('Up to 10 km', 'Up to 5000 kg', '₫8,000', '₫5,000', '₫13,000'),

  createData('10 - 100 km', 'Up to 100 kg', '₫11,500', '₫5,500', '₫17,000'),
  createData('10 - 100 km', 'Up to 1000 kg', '₫9,500', '₫5,000', '₫14,500'),
  createData('10 - 100 km', 'Up to 5000 kg', '₫7,500', '₫4,500', '₫12,000'),

  createData('100 - 200 km', 'Up to 100 kg', '₫11,000', '₫5,000', '₫16,000'),
  createData('100 - 200 km', 'Up to 1000 kg', '₫9,000', '₫4,500', '₫13,500'),
  createData('100 - 200 km', 'Up to 5000 kg', '₫7,000', '₫4,000', '₫11,000'),

  createData('200 - 500 km', 'Up to 100 kg', '₫10,500', '₫4,500', '₫15,000'),
  createData('200 - 500 km', 'Up to 1000 kg', '₫8,500', '₫4,000', '₫12,500'),
  createData('200 - 500 km', 'Up to 5000 kg', '₫6,500', '₫3,500', '₫10,000'),

  createData('Above 500 km', 'Up to 100 kg', '₫10,000', '₫4,000', '₫14,000'),
  createData('Above 500 km', 'Up to 1000 kg', '₫8,000', '₫3,500', '₫11,500'),
  createData('Above 500 km', 'Up to 5000 kg', '₫6,000', '₫3,000', '₫9,000')
];

// =========================|| PRICE LIST - TRANSPORTATION COSTS ||========================= //

const PriceList = () => {
  const theme = useTheme();

  return (
    <MainCard
      title="Bảng Giá Vận Chuyển"
      content={false}
      sx={{
        '& .MuiCardHeader-root': {
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          padding: '16px 24px',
          '& .MuiTypography-root': {
            fontSize: '1.5rem',
            fontWeight: 600
          }
        }
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: theme.palette.mode === ThemeMode.DARK ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                '& th': {
                  fontWeight: 600,
                  color: 'primary.main',
                  borderBottom: '2px solid',
                  borderColor: 'primary.main'
                }
              }}
            >
              <TableCell sx={{ pl: 3 }}>Khoảng Cách</TableCell>
              <TableCell align="right">Trọng Lượng</TableCell>
              <TableCell align="right">Giá/Km</TableCell>
              <TableCell align="right">Giá/Kg</TableCell>
              <TableCell align="right" sx={{ pr: 3 }}>
                Tổng Cộng
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                hover
                key={index}
                sx={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: theme.palette.mode === ThemeMode.DARK ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <TableCell sx={{ pl: 3 }}>
                  <Typography align="left" variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {row.distance}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {row.weight}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                    {row.pricePerKm}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                    {row.pricePerTon}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ pr: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: 'success.main',
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    {row.total}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
};

export default PriceList;
