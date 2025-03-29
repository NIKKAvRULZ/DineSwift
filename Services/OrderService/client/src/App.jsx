import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Orders from './components/Orders/Orders';
import OrderForm from './components/Orders/OrderForm';
import styles from './App.module.css';

const App = () => {
  return (
    <Router>
      <div className={styles.app}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>
            Order Service
          </Link>
          <Link to="/orders" className={styles.navLink}>
            Orders
          </Link>
        </nav>

        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<Orders />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/new" element={<OrderForm />} />
            <Route path="/orders/:id/edit" element={<OrderForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App; 