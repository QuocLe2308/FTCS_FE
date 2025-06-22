// import { useState } from 'react';
import { Grid, Typography } from '@mui/material';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import OverviewCharts from 'sections/dashboard/default/OverviewCharts';
import { useGetOverview } from 'api/driver';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

const DashboardDefault = () => {
  const { overview } = useGetOverview();

  // Get key metrics for the top cards
  const getMetricValue = (metric) => {
    return overview?.find(item => item.metric === metric)?.value || 0;
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography variant="h5">Dashboard</Typography>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce title="Total Members" count={getMetricValue('Total Members')} percentage={59.3} extra={getMetricValue('New Members This Month')} />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce title="Total Drivers" count={getMetricValue('Total Drivers')} percentage={70.5} extra={getMetricValue('Active Members')} />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce title="Total Trips" count={getMetricValue('Total Trips')} percentage={27.4} isLoss color="warning" extra={getMetricValue('Completed Trips')} />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce title="Total Revenue" count={`$${getMetricValue('Total Revenue')}`} percentage={27.4} isLoss color="warning" extra={`$${getMetricValue('Monthly Revenue')}`} />
      </Grid>

      {/* Overview Charts */}
      <Grid item xs={12}>
        <OverviewCharts />
      </Grid>
    </Grid>
  );
};

export default DashboardDefault;
