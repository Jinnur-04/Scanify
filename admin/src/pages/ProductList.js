import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Barcode from 'react-barcode';
import { fetchProducts,fetchForecast } from "../redux/slices/dashboardSlice";

function ProductList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const uname = localStorage.getItem("uname");
  const role = localStorage.getItem("role");

  const reduxProducts = useSelector(state => state.dashboard.stats.products);
  const reduxForecast = useSelector(state => state.dashboard.stats.forecast);

  const [products, setLocalProducts] = useState([]);
  const [groupedView, setGroupedView] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 🔁 Fetch on refresh if Redux is empty
  useEffect(() => {
    if (!reduxProducts?.length) dispatch(fetchProducts());
    if (!reduxForecast?.labels?.length) dispatch(fetchForecast());
  }, [dispatch, reduxProducts.length, reduxForecast.length]);

  // 🔄 Update local state based on view type
  useEffect(() => {
    if (!groupedView) {
      setLocalProducts(reduxProducts);
    } else {
      if (reduxForecast.length === 0) {
        const groupedMap = new Map();
        reduxProducts.forEach(p => {
          const key = p.name?.trim().toLowerCase();
          if (groupedMap.has(key)) {
            groupedMap.get(key).quantity += p.quantity;
          } else {
            groupedMap.set(key, { ...p });
          }
        });

        const groupedArray = Array.from(groupedMap.values());

        // Step 2: If forecast is empty, just set grouped with "-" for AI fields
        if (reduxForecast.length === 0) {
          const fallback = groupedArray.map(product => ({
            ...product,
            aiStock: "-",
            aiNeed: "-",
            aiStatus: "-"
          }));

          setLocalProducts(fallback);
          return;
        }
      }
      else{
      const merged = reduxForecast.map((forecastItem) => {
        const fullItem = reduxProducts.find(p => p.name === forecastItem.name) || {};
        const combined = { ...fullItem, ...forecastItem };

        // ✅ Log available fields
        console.log(`Merged product: ${combined.name || 'Unknown'}`, {
          price: combined.price,
          stock: combined.stock,
          forecastDaysLeft: combined.forecastDaysLeft,
          category: combined.category,
          barcodes: combined.barcodes
        });

        return combined;
      });
      setLocalProducts(merged);
    }
    }
  }, [groupedView, reduxProducts, reduxForecast]);

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="wrapper">
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
              <h1 className="h3 text-gray-800">Product List</h1>
              <div className="d-flex flex-wrap gap-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setGroupedView(!groupedView)}
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  {groupedView ? "See Full Item List" : "Back to Forecast View"}
                </button>
                {role === "Admin" && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => navigate('/products/manage')}
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                  >
                    + Add Product
                  </button>
                )}
              </div>
            </div>

            <input
              type="text"
              className="form-control mb-3"
              placeholder="Search product by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="thead-dark">
                  <tr>
                    <th>#</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price (₹)</th>
                    <th>Discount</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Unit</th>
                    {groupedView ? (
                      <>
                        <th>Stock</th>
                        <th>Avg Daily Sales</th>
                        <th>Forecast Days Left</th>
                      </>
                    ) : (
                      <th>Barcodes</th>
                    )}
                    {role === "Admin" && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((product, index) => (
                      <tr key={product._id || index}>
                        <td>{index + 1}</td>
                        <td>
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td>{product.name || '—'}</td>
                        <td>{product.price ?? '—'}</td>
                        <td>{product.discount ?? '—'}</td>
                        <td>{product.category ?? '—'}</td>
                        <td>{product.brand ?? '—'}</td>
                        <td>{product.unit ?? '—'}</td>

                        {groupedView ? (
                          <>
                            <td>{product.stock ?? '—'}</td>
                            <td>{product.avgDailySales ?? '—'}</td>
                            <td className={product.forecastDaysLeft < 3 ? "text-danger font-weight-bold" : ""}>
                              {product.forecastDaysLeft ?? 'N/A'}
                            </td>
                          </>
                        ) : (
                          <td>
                            {Array.isArray(product.barcodes) && product.barcodes.length > 0 ? (
                              product.barcodes.map((code, i) => (
                                <div key={i} className="mb-2">
                                  <Barcode value={code} height={40} width={1.2} fontSize={12} />
                                </div>
                              ))
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                        )}

                        {role === "Admin" && (
                          <td>
                            <button
                              className="btn btn-sm btn-info mr-1"
                              onClick={() => navigate(`/products/manage/${product._id}`)}
                              disabled={!product._id}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => alert("Product delete handled externally")}
                              disabled={!product._id}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="100%" className="text-center text-muted">
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductList;
