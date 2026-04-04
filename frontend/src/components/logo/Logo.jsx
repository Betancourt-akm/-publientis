// import imgLogo from '../../assest/banner/MM.png';
import "./Logo.css";    
const Logo = ({ w, h }) => {
  return (

<div className="divlogo flex items-center gap-2">
  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
    <span className="text-white font-bold text-xl">P</span>
  </div>
  <h2 className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Publientis</h2> 
</div>
  
    // <img
    //   src={imgLogo}
    //   alt="Logo"
    //   className="text-2xl font-semibold py-4"
    // />
  );
};

export default Logo;
