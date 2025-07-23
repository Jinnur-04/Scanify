import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axiosInstance'; 
import { Chart } from 'chart.js/auto';

function Dashboard() {
  // const uname = localStorage.getItem("uname");

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalBillsToday: 0,
    totalStaff: 0
  });

  const [chartData, setChartData] = useState({
    area: { labels: [], revenue: [], profit: [] },
    pie: { labels: [], data: [] },
    forecast: { labels: [], data: [] },
    barStaff: { labels: [], scores: [], bills: [], totals: [], discounts: [] }
  });

  const areaChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const forecastChartRef = useRef(null);
  const staffChartRef = useRef(null);

  const areaInstance = useRef(null);
  const pieInstance = useRef(null);
  const forecastInstance = useRef(null);
  const staffInstance = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revenueRes, topProductsRes, forecastRes, staffPerfRes, productsRes, billsRes, staffRes] = await Promise.all([
          axios.get(`/bills/revenue`),
          axios.get(`/bills/top-selling`),
          axios.get(`/products/inventory/forecast`),
          axios.get(`/bills/staff-performance`),
          axios.get(`/products`),
          axios.get(`/bills`),
          axios.get(`/staff`)
        ]);

        const today = new Date().toISOString().split("T")[0];
        const billsToday = billsRes.data.filter(b => b.date?.startsWith(today)).length;

        setStats({
          totalProducts: productsRes.data.length,
          totalBillsToday: billsToday,
          totalStaff: staffRes.data.length
        });

        setChartData({
          area: {
            labels: revenueRes.data.map(r => r.date),
            revenue: revenueRes.data.map(r => r.revenue),
            profit: revenueRes.data.map(r => parseFloat(r.profit))
          },
          pie: {
            labels: topProductsRes.data.labels,
            data: topProductsRes.data.data
          },
          forecast: {
            labels: forecastRes.data.map(p => p.name),
            data: forecastRes.data.map(p => p.forecastDaysLeft ?? 0)
          },
          barStaff: {
            labels: staffPerfRes.data.map(s => s.staffName),
            scores: staffPerfRes.data.map(s => s.score),
            bills: staffPerfRes.data.map(s => s.billsHandled),
            totals: staffPerfRes.data.map(s => s.totalProcessed),
            discounts: staffPerfRes.data.map(s => s.avgDiscount)
          }
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!chartData.area.labels.length) return;

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

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Admin Dashboard</h1>

      <div className="row">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Total Products</div>
              <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.totalProducts}</div>
              <Link to="/products" className="stretched-link"></Link>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="text-xs font-weight-bold text-success text-uppercase mb-1">Bills Generated Today</div>
              <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.totalBillsToday}</div>
              <Link to="/billmanagement" className="stretched-link"></Link>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">Total Staff</div>
              <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.totalStaff}</div>
              <Link to="/staff" className="stretched-link"></Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-8 col-lg-7">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Daily Revenue & Profit Chart</h6>
            </div>
            <div className="card-body">
              <div className="chart-area">
                <canvas ref={areaChartRef}></canvas>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-4 col-lg-5">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Top Selling Products</h6>
            </div>
            <div className="card-body">
              <div className="chart-pie pt-4 pb-2">
                <canvas ref={pieChartRef}></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-6">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 className="m-0 font-weight-bold text-primary">Forecast Days Left</h6>
              <Link to="/products" className="btn btn-sm btn-outline-primary">View Table</Link>
            </div>
            <div className="card-body">
              <div className="chart-bar">
                <canvas ref={forecastChartRef}></canvas>
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
                <canvas ref={staffChartRef}></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
