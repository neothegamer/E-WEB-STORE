import { Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { AdminRoute, ProtectedRoute } from '@/components/Guards';
import { Placeholder } from '@/components/Placeholder';
import Home from '@/pages/Home';
import Browse from '@/pages/Browse';
import ProductPage from '@/pages/Product';
import Cart from '@/pages/Cart';
import CheckoutResult from '@/pages/CheckoutResult';
import Library from '@/pages/Library';
import Orders from '@/pages/Orders';
import Account from '@/pages/Account';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import NotFound from '@/pages/NotFound';
import AdminLayout from '@/pages/admin/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import AdminProducts from '@/pages/admin/Products';
import ProductForm from '@/pages/admin/ProductForm';
import Categories from '@/pages/admin/Categories';
import AdminOrders from '@/pages/admin/Orders';
import Users from '@/pages/admin/Users';
import Settings from '@/pages/admin/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="browse" element={<Browse />} />
        <Route path="product/:slug" element={<ProductPage />} />
        <Route path="cart" element={<Cart />} />
        <Route path="account" element={<Account />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="terms" element={<Placeholder title="Terms" note="Terms of use go here once the client supplies them." />} />
        <Route path="privacy" element={<Placeholder title="Privacy" note="Privacy policy goes here once the client supplies it." />} />
        <Route path="refunds" element={<Placeholder title="Refunds" note="Refund policy goes here once the client supplies it." />} />

        <Route element={<ProtectedRoute />}>
          <Route path="library" element={<Library />} />
          <Route path="orders" element={<Orders />} />
          <Route path="checkout/result" element={<CheckoutResult />} />
        </Route>

        <Route path="admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductForm />} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
