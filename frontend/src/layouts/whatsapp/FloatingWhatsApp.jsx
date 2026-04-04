
import { FaWhatsapp } from 'react-icons/fa';
import PropTypes from 'prop-types'; 

import './FloatingWhatsApp.css'; 

const FloatingWhatsApp = ({ phoneNumber }) => {
  const openWhatsApp = () => {
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
  };

  return (
    <div className="floating-whatsapp" onClick={openWhatsApp}>
      <FaWhatsapp className="whatsapp-icon" />
      <span className="whatsapp-text"></span>
    </div>
  );
};

FloatingWhatsApp.propTypes = {
  phoneNumber: PropTypes.string.isRequired,
};

export default FloatingWhatsApp;
