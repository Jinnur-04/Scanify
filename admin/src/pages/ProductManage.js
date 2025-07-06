// ProductManage.jsx - Add/Edit product with barcode input + preview
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../inc/Sidebar';
import Top from '../inc/Top';
import Footer from '../inc/Footer';
import Barcode from 'react-barcode';

function ProductManage() {
  const uname = localStorage.getItem("uname");
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [product, setProduct] = useState({
    name: '',
    price: '',
    category: '',
    brand: '',
    quantityInStock: '',
    unit: '',
    barcode: '',
    discount: '',
    imageFile: null
  });

  useEffect(() => {
    if (isEdit) {
      // Fetch product from backend or state using id
      const dummy = {
        name: 'Example Product',
        price: 100,
        category: 'Snacks',
        brand: 'DemoBrand',
        quantityInStock: 20,
        unit: 'pcs',
        barcode: '1234567890123',
        discount: '5%',
        imageFile: null
      };
      setProduct(dummy);
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imageFile') {
      setProduct({ ...product, imageFile: files[0] });
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      alert('Product updated successfully');
    } else {
      alert('Product added successfully');
    }
    navigate('/products');
  };

  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
             <Top user={{name: uname}}/>
          <div className="container-fluid">
            <h1 className="h3 text-gray-800 mb-4">{isEdit ? 'Edit Product' : 'Add Product'}</h1>

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <input type="text" name="name" placeholder="Product Name" className="form-control mb-3" value={product.name} onChange={handleChange} required />
                  <input type="number" name="price" placeholder="Price (₹)" className="form-control mb-3" value={product.price} onChange={handleChange} required />
                  <input type="text" name="category" placeholder="Category" className="form-control mb-3" value={product.category} onChange={handleChange} />
                  <input type="text" name="brand" placeholder="Brand" className="form-control mb-3" value={product.brand} onChange={handleChange} />
                  <input type="number" name="quantityInStock" placeholder="Stock Quantity" className="form-control mb-3" value={product.quantityInStock} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <input type="text" name="unit" placeholder="Unit (e.g. pcs, bottle)" className="form-control mb-3" value={product.unit} onChange={handleChange} />
                  <input type="text" name="barcode" placeholder="Barcode" className="form-control mb-3" value={product.barcode} onChange={handleChange} required />
                  <input type="text" name="discount" placeholder="Discount (e.g. 5%)" className="form-control mb-3" value={product.discount} onChange={handleChange} />
                  <input type="file" name="imageFile" className="form-control mb-3" accept="image/*" onChange={handleChange} />

                  {product.barcode && (
                    <div className="text-center">
                      <Barcode value={product.barcode} height={50} width={1.5} fontSize={14} />
                      <p className="text-muted small">Barcode Preview</p>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-primary">{isEdit ? 'Update' : 'Add'} Product</button>
              <button type="button" className="btn btn-secondary ml-2" onClick={() => navigate('/products')}>Cancel</button>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default ProductManage;
