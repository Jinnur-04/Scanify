// src/pages/Dashboard.js
import React, { useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Chart } from 'chart.js/auto';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRevenue,
  fetchTopProducts,
  fetchForecast,
  fetchStaffPerformance,
  fetchProducts,
  fetchBills,
  fetchStaff
} from '../redux/slices/dashboardSlice';

function Dashboard() {
  const dispatch = useDispatch();

  const {
    revenue,
    topProducts,
    forecast,
    staffPerformance,
    products,
    staff,
    bills,
    loading,
    error
  } = useSelector((state) => state.dashboard.stats);
 

  const areaChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const forecastChartRef = useRef(null);
  const staffChartRef = useRef(null);

  const areaInstance = useRef(null);
  const pieInstance = useRef(null);
  const forecastInstance = useRef(null);
  const staffInstance = useRef(null);

useEffect(() => {
  if (!revenue?.length) dispatch(fetchRevenue());
  if (!topProducts?.labels?.length) dispatch(fetchTopProducts());
  if (!forecast?.length) dispatch(fetchForecast());
  if (!staffPerformance?.length) dispatch(fetchStaffPerformance());
  if (!products?.length) dispatch(fetchProducts());
  if (!bills?.length) dispatch(fetchBills());
  if (!staff?.length) dispatch(fetchStaff());
}, [dispatch, revenue, topProducts, forecast, staffPerformance, products, bills, staff]);


  const chartData = useMemo(() => {
    return {
      area: {
        labels: revenue?.map(item => item.date) || [],
        revenue: revenue?.map(item => item.revenue) || [],
        profit: revenue?.map(item => item.profit) || [],
      },
      pie: {
        labels: topProducts?.labels || [],
        data: topProducts?.data || [],
      },
      forecast: {
        labels: forecast?.map(item => item.name) || [],
        data: forecast?.map(item => item.forecastDaysLeft) || [],
      },
      barStaff: {
        labels: staffPerformance?.map(item => item.staffName) || [],
        scores: staffPerformance?.map(item => item.score) || [],
        bills: staffPerformance?.map(item => item.billsHandled) || [],
        totals: staffPerformance?.map(item => item.total || 0) || [],
        discounts: staffPerformance?.map(item => item.avgDiscount) || [],
      }
    };
  }, [revenue, topProducts, forecast, staffPerformance]);

  useEffect(() => {
    if (!chartData?.area?.labels?.length) return;

    const destroyChart = (ref) => {
      if (ref.current) {
        ref.current.destroy();
        ref.current = null;
      }
    };

    destroyChart(areaInstance);
    destroyChart(pieInstance);
    destroyChart(forecastInstance);
    destroyChart(staffInstance);

    areaInstance.current = new Chart(areaChartRef.current, {
      type: 'line',
      data: {
        labels: chartData.area.labels,
        datasets: [
          {
            label: "Revenue",
            data: chartData.area.revenue,
            backgroundColor: "rgba(78, 115, 223, 0.05)",
            borderColor: "rgba(78, 115, 223, 1)"
          },
          {
            label: "Profit",
            data: chartData.area.profit,
            backgroundColor: "rgba(28, 200, 138, 0.05)",
            borderColor: "rgba(28, 200, 138, 1)"
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    });

    pieInstance.current = new Chart(pieChartRef.current, {
      type: 'doughnut',
      data: {
        labels: chartData.pie.labels,
        datasets: [{
          data: chartData.pie.data,
          backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b']
        }]
      },
      options: { maintainAspectRatio: false }
    });

    forecastInstance.current = new Chart(forecastChartRef.current, {
      type: 'bar',
      data: {
        labels: chartData.forecast.labels,
        datasets: [{
          label: "Forecast Days Left",
          data: chartData.forecast.data,
          backgroundColor: chartData.forecast.data.map(val =>
            val > 5 ? '#1cc88a' : val > 2 ? '#f6c23e' : '#e74a3b')
        }]
      },
      options: {
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } } },
        onClick: () => window.location.href = "/products"
      }
    });

    staffInstance.current = new Chart(staffChartRef.current, {
      type: 'bar',
      data: {
        labels: chartData.barStaff.labels,
        datasets: [
          { label: "Performance Score", data: chartData.barStaff.scores, backgroundColor: '#4e73df' },
          { label: "Bills Handled", data: chartData.barStaff.bills, backgroundColor: '#1cc88a' },
          { label: "Total Processed (₹)", data: chartData.barStaff.totals, backgroundColor: '#36b9cc' },
          { label: "Avg Discount (%)", data: chartData.barStaff.discounts, backgroundColor: '#f6c23e' }
        ]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          tooltip: { mode: 'index', intersect: false },
          legend: { position: 'top' }
        },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    });
  }, [chartData]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const billsTodayCount = bills?.filter(bill => {
    const billDate = new Date(bill.date);
    const today = new Date();
    return (
      billDate.getDate() === today.getDate() &&
      billDate.getMonth() === today.getMonth() &&
      billDate.getFullYear() === today.getFullYear()
    );
  }).length || 0;

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Admin Dashboard</h1>

      <div className="row">
        <StatCard title="Total Products" value={products?.length || 0} link="/products" color="primary" />
        <StatCard title="Bills Generated Today" value={billsTodayCount} link="/billmanagement" color="success" />
        <StatCard title="Total Staff" value={staff?.length || 0} link="/staff" color="warning" />
      </div>

      <div className="row">
        <ChartCard title="Daily Revenue & Profit Chart">
          <div className="chart-area"><canvas ref={areaChartRef}></canvas></div>
        </ChartCard>
        <ChartCard title="Top Selling Products">
          <div className="chart-pie pt-4 pb-2"><canvas ref={pieChartRef}></canvas></div>
        </ChartCard>
      </div>

      <div className="row">
        <ChartCard title="Forecast Days Left" right={<Link to="/products" className="btn btn-sm btn-outline-primary">View Table</Link>}>
          <div className="chart-bar"><canvas ref={forecastChartRef}></canvas></div>
        </ChartCard>
        <ChartCard title="Staff Performance">
          <div className="chart-bar"><canvas ref={staffChartRef}></canvas></div>
        </ChartCard>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, link, color }) => (
  <div className="col-xl-3 col-md-6 mb-4">
    <div className={`card border-left-${color} shadow h-100 py-2`}>
      <div className="card-body">
        <div className={`text-xs font-weight-bold text-${color} text-uppercase mb-1`}>{title}</div>
        <div className="h5 mb-0 font-weight-bold text-gray-800">{value}</div>
        <Link to={link} className="stretched-link"></Link>
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, children, right }) => (
  <div className="col-xl-6 col-lg-6 mb-4">
    <div className="card shadow mb-4">
      <div className="card-header py-3 d-flex justify-content-between align-items-center">
        <h6 className="m-0 font-weight-bold text-primary">{title}</h6>
        {right}
      </div>
      <div className="card-body">{children}</div>
    </div>
  </div>
);

export default Dashboard;
