import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../inc/Sidebar';
import Top from '../inc/Top';
import Footer from '../inc/Footer';

function Dashboard() {
  const uname = localStorage.getItem("uname");

  const stats = {
    totalProducts: 142,
    totalBillsToday: 38,
    totalStaff: 5,
  };

  useEffect(() => {
    const chartScript = document.createElement('script');
    chartScript.src = '/vendor/chart.js/Chart.min.js';
    chartScript.onload = () => {
      const data = {
        area: {
          labels: ["July 1", "July 2", "July 3", "July 4", "July 5", "July 6", "July 7"],
          revenue: [3200, 4100, 3800, 4500, 3900, 4700, 5100],
          profit: [1200, 1600, 1500, 1700, 1400, 1800, 1900],
        },
        pie: {
          labels: ["Dairy Milk", "Shampoo", "Rice", "Oil", "Soap"],
          data: [120, 90, 75, 60, 50],
        },
        barLowStock: {
          labels: ["Toothpaste", "Tea Pack", "Facewash", "Salt", "Notebook"],
          data: [10, 20, 15, 5, 3],
        },
        barStaff: {
          labels: ["John", "Ayesha", "Karan", "Sneha", "Rahul"],
          data: [12, 15, 10, 8, 14],
        }
      };

      new window.Chart(document.getElementById("myAreaChart"), {
        type: 'line',
        data: {
          labels: data.area.labels,
          datasets: [
            {
              label: "Revenue",
              data: data.area.revenue,
              backgroundColor: "rgba(78, 115, 223, 0.05)",
              borderColor: "rgba(78, 115, 223, 1)",
            },
            {
              label: "Profit",
              data: data.area.profit,
              backgroundColor: "rgba(28, 200, 138, 0.05)",
              borderColor: "rgba(28, 200, 138, 1)",
            }
          ]
        },
        options: { maintainAspectRatio: false }
      });

      new window.Chart(document.getElementById("myPieChart"), {
        type: 'doughnut',
        data: {
          labels: data.pie.labels,
          datasets: [{
            data: data.pie.data,
            backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
            hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#dda20a', '#be2617'],
            hoverBorderColor: "rgba(234, 236, 244, 1)",
          }]
        },
        options: { maintainAspectRatio: false }
      });

      const stockColors = data.barLowStock.data.map(value => {
        if (value > 10) {
          return '#1cc88a'; // ✅ Green - Good Stock
        } else if (value > 5) {
          return '#f6c23e'; // ⚠️ Yellow/Orange - Moderate/Low Stock
        } else {
          return '#e74a3b'; // 🔴 Red - Critical Stock
        }
      });

      new window.Chart(document.getElementById("myBarChart"), {
        type: 'bar',
        data: {
          labels: data.barLowStock.labels,
          datasets: [{
            label: "Stock Left",
            data: data.barLowStock.data,
            backgroundColor: stockColors,
            borderColor: '#ddd',
            borderWidth: 1
          }]
        },
        options: {
          maintainAspectRatio: false,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          },
          legend: {
            display: false
          },
          tooltips: {
            callbacks: {
              label: function (tooltipItem) {
                const val = tooltipItem.yLabel;
                let status = 'Good';
                if (val <= 5) status = 'Critical';
                else if (val <= 10) status = 'Low';
                return `Stock: ${val} (${status})`;
              }
            }
          }
        }
      });


      new window.Chart(document.getElementById("staffBarChart"), {
        type: 'bar',
        data: {
          labels: data.barStaff.labels,
          datasets: [{
            label: "Bills Handled",
            data: data.barStaff.data,
            backgroundColor: "#36b9cc"
          }]
        },
        options: { maintainAspectRatio: false }
      });
    };

    document.body.appendChild(chartScript);
    return () => {
      document.body.removeChild(chartScript);
    };
  }, []);

  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <Top user={{name: uname}}/>
          <div className="container-fluid">
            <h1 className="h3 mb-4 text-gray-800">Admin Dashboard</h1>

            <div className="row">
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-primary shadow h-100 py-2 position-relative">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                          Total Products
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {stats.totalProducts}
                        </div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-box fa-2x text-gray-300"></i>
                      </div>
                    </div>
                    <Link to="/products" className="stretched-link"></Link>
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-success shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                          Bills Generated Today
                        </div>
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

              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-warning shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                          Total Staff
                        </div>
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

            {/* SB Admin 2 Chart Containers */}
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
                      <div>
                        <span className="badge" style={{ backgroundColor: '#1cc88a', color: 'white' }}>Good Stock</span>
                      </div>
                      <div>
                        <span className="badge" style={{ backgroundColor: '#f6c23e', color: 'white' }}>Moderate Stock</span>
                      </div>
                      <div>
                        <span className="badge" style={{ backgroundColor: '#e74a3b', color: 'white' }}>Critical Stock</span>
                      </div>
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