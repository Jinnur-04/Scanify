import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Barcode from 'react-barcode';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProductList() {
  const navigate = useNavigate();
  const uname = localStorage.getItem("uname");

  const [products, setProducts] = useState([]);
  const [groupedView, setGroupedView] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchProducts();
  }, [groupedView]);

  const fetchProducts = async () => {
    try {
      if (groupedView) {
        // Fetch forecast and product details to merge
        const [forecastRes, productRes] = await Promise.all([
          axios.get(`${API}/products/inventory/forecast`),
          axios.get(`${API}/products`)
        ]);

        // Merge forecast with full product data using name
        const merged = forecastRes.data.map(forecastItem => {
          const fullItem = productRes.data.find(p => p.name === forecastItem.name) || {};
          return { ...fullItem, ...forecastItem };
        });

        setProducts(merged);
      } else {
        const res = await axios.get(`${API}/products`);
        setProducts(res.data);
      }
    } catch (err) {
      console.error("❌ Error loading products:", err);
      toast.error("Failed to load products");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API}/products/${id}`);
      setProducts(products.filter((product) => product._id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="wrapper">
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h1 className="h3 text-gray-800">Product List</h1>
              <div>
                <button
                  className="btn btn-secondary mr-2"
                  onClick={() => setGroupedView(!groupedView)}
                >
                  {groupedView ? "See Full Item List" : "Back to Forecast View"}
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => navigate('/products/manage')}
                >
                  + Add Product
                </button>
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
                    <th>Actions</th>
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
                        <td>{product.name}</td>
                        <td>{product.price || '—'}</td>
                        <td>{product.discount || '—'}</td>
                        <td>{product.category || '—'}</td>
                        <td>{product.brand || '—'}</td>
                        <td>{product.unit || '—'}</td>

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
                            {product.barcodes && product.barcodes.length > 0 ? (
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
                            onClick={() => handleDelete(product._id)}
                            disabled={!product._id}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="100%" className="text-center text-muted">No products found.</td>
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
