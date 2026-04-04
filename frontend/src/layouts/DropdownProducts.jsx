import React, { useState, useEffect } from 'react';
import { Menu, MenuItem, Button, Divider, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import fetchCategoryWiseProduct from '../helpers/fetchCategoryWiseProduct';
import { SlArrowDown } from "react-icons/sl";
import "./DropdownProducts.css";

const DropdownProducts = ({ category, heading }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoryProduct = await fetchCategoryWiseProduct(category);
        if (categoryProduct && categoryProduct.data) {
          setData(categoryProduct.data);
        } else {
          setData([]);
          console.log(`No se encontraron productos en la categoría "${category}".`);
        }
      } catch (error) {
        console.error(`Error al obtener productos de "${category}":`, error);
        setData([]);
      }
      setLoading(false);
    };

    fetchData();
  }, [category]);

  return (
    <>
      <Button 
        onClick={handleMenuOpen} 
        endIcon={<SlArrowDown />} 
        className="dropdown-moto-button"
      >
        {heading}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          style: { 
            maxHeight: 400, 
            width: '220px',
            borderRadius: '8px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.15)',
            padding: '10px'
          }
        }}
      >
        <MenuItem
          component={RouterLink}
          to="/servicios"
          onClick={handleMenuClose}
          sx={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Tooltip title="Spa Bronze Todos" placement="top">
            <span
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block'
              }}
            >
              Spa Bronze Todos
            </span>
          </Tooltip>
        </MenuItem>
        <Divider />
        {loading ? (
          <MenuItem>Cargando...</MenuItem>
        ) : data.length > 0 ? (
          data.map((product) => (
            <MenuItem
              key={product._id}
              component={RouterLink}
              to={`/product/${product._id}`}
              onClick={handleMenuClose}
              sx={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Tooltip title={product.productName} placement="top">
                <span
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block'
                  }}
                >
                  {product.productName}
                </span>
              </Tooltip>
            </MenuItem>
          ))
        ) : (
          <MenuItem>No hay servicios</MenuItem>
        )}
      </Menu>
    </>
  );
};

export default DropdownProducts;
