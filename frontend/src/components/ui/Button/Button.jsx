
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({ to, href, children, className, style, onClick }) => {
const clases = `boton ${className}`;

  if (to) {
    return (
      <Link to={to} className={clases} style={style} onClick={onClick}>
        {children}
      </Link>
    );
  } else if (href) {
    return (
      <a href={href} className={clases} style={style} onClick={onClick}>
        {children}
      </a>
    );
  } else {
    return (
      <button className={clases} style={style} onClick={onClick}>
        {children}
      </button>
    );
  }
};

Button.propTypes = {
  to: PropTypes.string,
  href: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
};

Button.defaultProps = {
  className: '',
  style: {},
  onClick: null,
};

export default Button;
