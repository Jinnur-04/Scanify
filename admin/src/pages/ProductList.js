import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Barcode from 'react-barcode';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProductList() {
  const navigate = useNavigate();
  const uname = localStorage.getItem("uname");

  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const API = `${process.env.REACT_APP_API_URL}/products`;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
  try {
    const response = await axios.get(API);
    console.log("✅ Products with barcodes:", response.data);
    setProducts(response.data);
  } catch (err) {
    console.error('❌ Error loading products:', err);
    toast.error("Failed to load products");
  }
};


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      setProducts(products.filter((product) => product._id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="wrapper">
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h1 className="h3 text-gray-800">Product List</h1>
              <button
                className="btn btn-success"
                onClick={() => navigate('/products/manage')}
              >
                + Add Product
              </button>
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
                    <th>Barcode</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => (
                      <tr key={product._id}>
                        <td>{index + 1}</td>
                        <td>
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                        </td>
                        <td>{product.name}</td>
                        <td>{product.price}</td>
                        <td>{product.discount}</td>
                        <td>{product.category}</td>
                        <td>{product.brand}</td>
                        <td>{product.unit}</td>
                        <td>
                          {product.barcodes && product.barcodes.length > 0 && product.barcodes.map((code, i) => (
                            <div key={i} className="mb-2">
                              <Barcode value={code} height={40} width={1.2} fontSize={12} />
                            </div>
                          ))}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-info mr-1"
                            onClick={() => navigate(`/products/manage/${product._id}`)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(product._id)}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center text-muted">No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Link to="/dashboard" className="btn btn-secondary mt-3">
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductList;