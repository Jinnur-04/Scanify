// Redesigned ProductList.jsx with extended fields and search + barcode preview
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../inc/Sidebar';
import Top from '../inc/Top';
import Footer from '../inc/Footer';
import Barcode from 'react-barcode';

function ProductList() {
  const navigate = useNavigate();
  const uname = localStorage.getItem("uname");

  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Dairy Milk 100g',
      price: 50,
      category: 'Snacks',
      brand: 'Cadbury',
      quantityInStock: 25,
      unit: 'pcs',
      barcode: '8901234567890',
      discount: '5%',
      imageUrl: 'https://example.com/dairymilk.jpg'
    },
    {
      id: 2,
      name: 'Pepsi 500ml',
      price: 40,
      category: 'Beverages',
      brand: 'PepsiCo',
      quantityInStock: 40,
      unit: 'bottle',
      barcode: '8901234567811',
      discount: '10%',
      imageUrl: 'https://example.com/pepsi.jpg'
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
             <Top user={{name: uname}}/>
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
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price (₹)</th>
                    <th>Discount</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Stock</th>
                    <th>Unit</th>
                    <th>Barcode</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>
                        <img src={product.imageUrl} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                      </td>
                      <td>{product.name}</td>
                      <td>{product.price}</td>
                      <td>{product.discount}</td>
                      <td>{product.category}</td>
                      <td>{product.brand}</td>
                      <td>{product.quantityInStock}</td>
                      <td>{product.unit}</td>
                      <td>
                        <Barcode value={product.barcode} height={40} width={1.2} fontSize={12} />
                      </td>
                      <td colSpan="6">
                        <button
                          className="btn btn-sm btn-info"
                          style={{ display: 'inline-block', marginRight: '-8px' }}
                          onClick={() => navigate(`/products/manage/${product.id}`)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          style={{ display: 'inline-block' }}
                          onClick={() => handleDelete(product.id)}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Link to="/dashboard" className="btn btn-secondary mt-3">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default ProductList;
