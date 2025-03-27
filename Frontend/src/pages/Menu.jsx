import { useEffect, useState } from "react";
import axios from "../api/orderService";

const Menu = () => {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    axios.get("/menu").then((res) => setMenu(res.data));
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold">Menu</h2>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {menu.map((item) => (
          <div key={item.id} className="bg-white p-4 shadow-md rounded-md border">
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.description}</p>
            <p className="text-md font-bold mt-2">${item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
