import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 p-4 shadow-md text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">DineSwift</Link>
        <div className="flex gap-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/menu" className="hover:underline">Menu</Link>
          <Link to="/cart" className="hover:underline">Cart</Link>
          <Link to="/orders" className="hover:underline">Orders</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
