import { useGetOverview } from 'api/driver';
import { Grid, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const OverviewCharts = () => {
  const { overview, overviewLoading } = useGetOverview();

  if (overviewLoading) {
    return <Typography>Loading...</Typography>;
  }

  // Transform data for vehicles chart (only Active Vehicles, Total Vehicles)
  const vehiclesData = overview?.filter(item =>
    item.category === 'Vehicles' &&
    (item.metric === 'Active Vehicles' || item.metric === 'Total Vehicles')
  ).map(item => ({
    name: item.metric,
    value: item.value || 0
  }));

  // Payments data for BarChart
  const paymentsData = [
    {
      name: 'Payments',
      Expired: overview?.find(item => item.category === 'Payments' && item.metric === 'Expired Payments')?.value || 0,
      Paid: overview?.find(item => item.category === 'Payments' && item.metric === 'Paid Payments')?.value || 0,
      Pending: overview?.find(item => item.category === 'Payments' && item.metric === 'Pending Payments')?.value || 0
    }
  ];

  // Check if all vehicle values are 0
  const allVehiclesZero = vehiclesData?.every(item => !item.value);

  // Custom label: only show if value > 0
  const renderVehicleLabel = ({ name, percent, value }) => {
    if (!value) return null;
    // Nếu chỉ có 1 phần có value > 0 thì hiển thị số lượng
    if (vehiclesData.filter(v => v.value > 0).length === 1) {
      return `${name}: ${value}`;
    }
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  // Members metrics to show (ordered)
  const membersMetrics = [
    'Active Members',
    'Total Drivers',
    'Total Members',
    'Total Customers',
    'New Members Today',
    'New Members This Month'
  ];
  const membersData = membersMetrics
    .map(metric => overview?.find(item => item.category === 'Members' && item.metric === metric))
    .filter(item => item && item.value > 0)
    .map(item => ({ name: item.metric, value: item.value }));

  // Trips metrics to show (ordered)
  const tripsMetrics = [
    'Total Trips',
    'Completed Trips',
    'Total Revenue',
    'Average Revenue per Trip',
    'Today Revenue',
    'Monthly Revenue'
  ];
  const tripsData = tripsMetrics
    .map(metric => overview?.find(item => item.category === 'Trips' && item.metric === metric))
    .filter(item => item && item.value > 0)
    .map(item => ({ name: item.metric, value: item.value }));

  return (
    <Grid container spacing={3}>
      {/* Members Overview */}
      {membersData.length > 0 && (
        <Grid item xs={12} md={6}>
          <MainCard title="Members Overview">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={membersData}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                barCategoryGap={30}
                barSize={40}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                {membersData.length > 1 && <Legend />}
                <Bar dataKey="value" fill="#8884d8">
                  <LabelList dataKey="value" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </MainCard>
        </Grid>
      )}

      {/* Trips Overview */}
      {tripsData.length > 0 && (
        <Grid item xs={12} md={6}>
          <MainCard title="Trips Overview">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={tripsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                barCategoryGap={30}
                barSize={40}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                {tripsData.length > 1 && <Legend />}
                <Bar dataKey="value" fill="#82ca9d">
                  <LabelList dataKey="value" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </MainCard>
        </Grid>
      )}

      {/* Vehicles Overview */}
      {!allVehiclesZero && vehiclesData.length > 0 && (
        <Grid item xs={12} md={6}>
          <MainCard title="Vehicles Overview">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vehiclesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderVehicleLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {vehiclesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </MainCard>
        </Grid>
      )}

      {/* Payments Overview */}
      {(paymentsData[0].Expired > 0 || paymentsData[0].Paid > 0 || paymentsData[0].Pending > 0) && (
        <Grid item xs={12} md={6}>
          <MainCard title="Payments Overview">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Expired" fill="#ff7300" name="Expired Payments" />
                <Bar dataKey="Paid" fill="#00c49f" name="Paid Payments" />
                <Bar dataKey="Pending" fill="#0088fe" name="Pending Payments" />
              </BarChart>
            </ResponsiveContainer>
          </MainCard>
        </Grid>
      )}

      {/* Ratings Overview */}
      {overview?.filter(item => item.category === 'Ratings' && item.value > 0).length > 0 && (
        <Grid item xs={12} md={6}>
          <MainCard title="Ratings Overview">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overview?.filter(item => item.category === 'Ratings' && item.value > 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </MainCard>
        </Grid>
      )}
    </Grid>
  );
};

export default OverviewCharts; 