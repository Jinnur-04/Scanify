import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../inc/Sidebar';
import Top from '../inc/Top';
import Footer from '../inc/Footer';

const BASE_URL = process.env.REACT_APP_API_URL;

function Dashboard() {
  const uname = localStorage.getItem("uname");

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalBillsToday: 0,
    totalStaff: 0
  });

  const [chartData, setChartData] = useState({
    area: { labels: [], revenue: [], profit: [] },
    pie: { labels: [], data: [] },
    barLowStock: { labels: [], data: [] },
    barStaff: { labels: [], data: [] }
  });

  // Fetch stats + chart data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revenueRes, topProductsRes, lowStockRes, staffPerfRes, productsRes, billsRes, staffRes] = await Promise.all([
          axios.get(`${BASE_URL}/bills/revenue`),
          axios.get(`${BASE_URL}/bills/top-selling`),
          axios.get(`${BASE_URL}/products/low-stock/chart`),
          axios.get(`${BASE_URL}/staff/performence/chart`),
          axios.get(`${BASE_URL}/products`),
          axios.get(`${BASE_URL}/bills`),
          axios.get(`${BASE_URL}/staff`)
        ]);
        console.log(revenueRes);
        const today = new Date().toISOString().split("T")[0];
        const billsToday = billsRes.data.filter(b => b.date?.startsWith(today)).length;

        setStats({
          totalProducts: productsRes.data.length,
          totalBillsToday: billsToday,
          totalStaff: staffRes.data.length
        });

        const area = {
          labels: revenueRes.data.map(r => r.date),
          revenue: revenueRes.data.map(r => r.revenue),
          profit: revenueRes.data.map(r => parseFloat(r.profit))
        };

        const pie = {
          labels: topProductsRes.data.labels,
          data: topProductsRes.data.data
        };

        const barLowStock = {
          labels: lowStockRes.data.labels,
          data: lowStockRes.data.data
        };

        const barStaff = {
          labels: staffPerfRes.data.labels,
          data: staffPerfRes.data.data
        };

        setChartData({ area, pie, barLowStock, barStaff });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  // Load Chart.js and render charts
  useEffect(() => {
    if (!chartData.area.labels.length) return;

    const chartScript = document.createElement('script');
    chartScript.src = '/vendor/chart.js/Chart.min.js';
    chartScript.onload = () => {
      // Area Chart
      new window.Chart(document.getElementById("myAreaChart"), {
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
        options: { maintainAspectRatio: false }
      });

      // Pie Chart
      new window.Chart(document.getElementById("myPieChart"), {
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

      // Low Stock Bar Chart
      const stockColors = chartData.barLowStock.data.map(val => {
        if (val > 10) return '#1cc88a';
        else if (val > 5) return '#f6c23e';
        return '#e74a3b';
      });

      new window.Chart(document.getElementById("myBarChart"), {
        type: 'bar',
        data: {
          labels: chartData.barLowStock.labels,
          datasets: [{
            label: "Stock Left",
            data: chartData.barLowStock.data,
            backgroundColor: stockColors
          }]
        },
        options: { maintainAspectRatio: false }
      });

      // Staff Performance Bar Chart
      new window.Chart(document.getElementById("staffBarChart"), {
        type: 'bar',
        data: {
          labels: chartData.barStaff.labels,
          datasets: [{
            label: "Bills Handled",
            data: chartData.barStaff.data,
            backgroundColor: "#36b9cc"
          }]
        },
        options: { maintainAspectRatio: false }
      });
    };

    document.body.appendChild(chartScript);
    return () => document.body.removeChild(chartScript);
  }, [chartData]);

  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <Top user={{ name: uname }} />
          <div className="container-fluid">
            <h1 className="h3 mb-4 text-gray-800">Admin Dashboard</h1>

            {/* Summary Cards */}
            <div className="row">
              {/* Products */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-primary shadow h-100 py-2 position-relative">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Total Products</div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.totalProducts}</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-box fa-2x text-gray-300"></i>
                      </div>
                    </div>
                    <Link to="/products" className="stretched-link"></Link>
                  </div>
                </div>
              </div>

              {/* Bills Today */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-success shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-success text-uppercase mb-1">Bills Generated Today</div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.totalBillsToday}</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-receipt fa-2x text-gray-300"></i>
                      </div>
                    </div>
                    <Link to="/billmanagement" className="stretched-link"></Link>
                  </div>
                </div>
              </div>

              {/* Staff */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-warning shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">Total Staff</div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.totalStaff}</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-users fa-2x text-gray-300"></i>
                      </div>
                    </div>
                    <Link to="/staff" className="stretched-link"></Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="row">
              <div className="col-xl-8 col-lg-7">
                <div className="card shadow mb-4">
                  <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 className="m-0 font-weight-bold text-primary">Daily Revenue & Profit Chart</h6>
                  </div>
                  <div className="card-body">
                    <div className="chart-area">
                      <canvas id="myAreaChart"></canvas>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-4 col-lg-5">
                <div className="card shadow mb-4">
                  <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 className="m-0 font-weight-bold text-primary">Top Selling Products</h6>
                  </div>
                  <div className="card-body">
                    <div className="chart-pie pt-4 pb-2">
                      <canvas id="myPieChart"></canvas>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bar Charts */}
            <div className="row">
              <div className="col-xl-6">
                <div className="card shadow mb-4">
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Low Stock Alerts</h6>
                  </div>
                  <div className="card-body">
                    <div className="chart-bar">
                      <canvas id="myBarChart"></canvas>
                    </div>
                    <div className="mt-3 d-flex justify-content-around text-center">
                      <div><span className="badge" style={{ backgroundColor: '#1cc88a', color: 'white' }}>Good Stock</span></div>
                      <div><span className="badge" style={{ backgroundColor: '#f6c23e', color: 'white' }}>Moderate Stock</span></div>
                      <div><span className="badge" style={{ backgroundColor: '#e74a3b', color: 'white' }}>Critical Stock</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-6">
                <div className="card shadow mb-4">
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Staff Performance</h6>
                  </div>
                  <div className="card-body">
                    <div className="chart-bar">
                      <canvas id="staffBarChart"></canvas>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Dashboard;
