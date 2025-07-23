import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Barcode from 'react-barcode';
import { toast } from 'react-toastify';
import axios from '../utils/axiosInstance';
import 'react-toastify/dist/ReactToastify.css';

function ProductManage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [productType, setProductType] = useState({
    name: '',
    price: '',
    category: '',
    brand: '',
    unit: '',
    discount: '',
    imageFile: null,
  });

  const [barcode, setBarcode] = useState('');

  // ✅ Load product if in edit mode
  useEffect(() => {
 const fetchProduct = async () => {
  try {
    const { data } = await axios.get(`/products/${id}`);
    setProductType({
      name: data.name || '',
      price: data.price || '',
      category: data.category || '',
      brand: data.brand || '',
      unit: data.unit || '',
      discount: data.discount || '',
      imageFile: null
    });
    if (data.barcodes?.length) {
      setBarcode(data.barcodes[0]);
    }
  } catch (err) {
    console.error('❌ Error fetching product:', err);
    toast.error("Failed to load product");
  }
};


    if (isEdit) {
      fetchProduct();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setProductType(prev => ({
      ...prev,
      [name]: name === 'imageFile' ? files[0] : value
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  Object.entries(productType).forEach(([key, value]) => {
    if (value !== null) {
      formData.append(key, value);
    }
  });

  try {
    const { data: result } = await axios({
      method: isEdit ? 'PUT' : 'POST',
      url: isEdit ? `/products/${id}` : `/products`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    toast.success(isEdit ? "Product updated" : "Product added");

    if (!isEdit && result.barcode) {
      setBarcode(result.barcode);
      setTimeout(() => navigate('/products'), 5000);
    }

    if (isEdit) navigate('/products');
  } catch (err) {
    console.error("❌ Submission error:", err);
    toast.error("Error submitting product");
  }
};



  return (
    <div id="wrapper">
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <div className="container-fluid">
            <h1 className="h3 text-gray-800 mb-4">
              {isEdit ? 'Edit Product Type' : 'Add Product Type'}
            </h1>

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="row">
                <div className="col-md-6">
                  <input type="text" name="name" placeholder="Product Name" className="form-control mb-3" value={productType.name} onChange={handleChange} required />
                  <input type="number" name="price" placeholder="Price (₹)" className="form-control mb-3" value={productType.price} onChange={handleChange} required />
                  <input type="text" name="category" placeholder="Category" className="form-control mb-3" value={productType.category} onChange={handleChange} />
                  <input type="text" name="brand" placeholder="Brand" className="form-control mb-3" value={productType.brand} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <input type="text" name="unit" placeholder="Unit (e.g. pcs, bottle)" className="form-control mb-3" value={productType.unit} onChange={handleChange} />
                  <input type="text" name="discount" placeholder="Discount (e.g. 5%)" className="form-control mb-3" value={productType.discount} onChange={handleChange} />
                  <input type="file" name="imageFile" className="form-control mb-3" accept="image/*" onChange={handleChange} />

                  {barcode && (
                    <div className="text-center mt-3">
                      <Barcode value={barcode} height={50} width={1.5} fontSize={14} />
                      <p className="text-muted small mt-1">Barcode: {barcode}</p>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                {isEdit ? 'Update' : 'Add'} Product
              </button>
              <button type="button" className="btn btn-secondary ml-2" onClick={() => navigate('/products')}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductManage;
