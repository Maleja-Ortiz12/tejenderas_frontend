import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import ProductList from './pages/admin/ProductList';
import ProductForm from './pages/admin/ProductForm';
import POS from './pages/admin/POS';
import ContractList from './pages/admin/ContractList';
import SalesRegistry from './pages/admin/SalesRegistry';
import AdminOrders from './pages/admin/AdminOrders';
import HomeCarousel from './pages/admin/HomeCarousel';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster position="top-center" reverseOrder={false} />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute requireAdmin>
                  <ProductList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/new"
              element={
                <ProtectedRoute requireAdmin>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/:id/edit"
              element={
                <ProtectedRoute requireAdmin>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pos"
              element={
                <ProtectedRoute requireAdmin>
                  <POS />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/contracts"
              element={
                <ProtectedRoute requireAdmin>
                  <ContractList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sales-registry"
              element={
                <ProtectedRoute requireAdmin>
                  <SalesRegistry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/home-carousel"
              element={
                <ProtectedRoute requireAdmin>
                  <HomeCarousel />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
