import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import RestaurantList from './components/RestaurantList';
import RestaurantDetail from './components/RestaurantDetail';
import AddRestaurant from './components/AddRestaurant';
import AddMenuItem from './components/AddMenuItem';
import EditRestaurant from './components/EditRestaurant';
import EditMenuItem from './components/EditMenuItem';
import Navbar from './components/Navbar';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Segoe UI',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<RestaurantList />} />
          <Route path="/add-restaurant" element={<AddRestaurant />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          <Route path="/edit-restaurant/:id" element={<EditRestaurant />} />
          <Route path="/add-menu-item/:restaurantId" element={<AddMenuItem />} />
          <Route path="/edit-menu-item/:id" element={<EditMenuItem />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
