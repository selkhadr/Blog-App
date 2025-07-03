import { Link } from "react-router-dom"



const HeaderRight = () => {
  return (
    <div className="header-right">
      <Link to="/Login" className="header-right-link">
        <i className="bi bi-box-arrow-in-right"></i>
        <span>Login</span>
      </Link>
      <Link to="/Register" className="header-right-link">
        <i className="bi bi-person-plus"></i>
        <span>Register</span>
      </Link>
    </div>
  );
};

export default HeaderRight;
