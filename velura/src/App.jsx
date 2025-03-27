import Home from './Home.jsx';
import Login from './components/Login.jsx';
import Signup from './components/SignUp.jsx'
import Product from './ProductPage.jsx';
import About from './About.jsx';
import Cart from './CartPage.jsx';
import UserProfile from './UserProfile.jsx';
import CategoryPage from './components/category.jsx';
import OrderConfirmation from './components/OrderConfirmation.jsx';
import AdminLayout from './components/admin/AdminDashboard.jsx';
import AdminHome from './components/admin/AdminHome.jsx';
import AdminProduct from './components/admin/AdminProduct.jsx';
import AdminOrders from './components/admin/AdminOrder.jsx';
import ProductForm from './components/admin/ProductForm.jsx';
import OrderDetails from './components/admin/OrderDetails.jsx';
import UserDetails from './components/admin/UserDetails.jsx';
import Reviews from './components/admin/Reviews.jsx';
import UserCreate from './components/admin/UserCreate.jsx';
import AdminChatPage from './components/admin/AdminChat.jsx';
import NotFoundPage from './NothingHereSee.jsx';

import { CartProvider } from './hooks/cartContext.jsx';
import { MessageProvider } from './hooks/MessageContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedAdminRoute from './hooks/ProtectedAdminRoute.jsx';

function App() {
  return (
    <CartProvider>
      <MessageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/product" element={<Product />} />
            <Route path="/about" element={<About />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/category/:categorySlug" element={<CategoryPage />} />
            <Route
              path="/profile/orders/:orderId"
              element={<OrderConfirmation />}
            />

            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route path="" element={<AdminHome />} />
              <Route path="products" element={<AdminProduct />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<UserDetails />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="chats" element={<AdminChatPage />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="customers/new" element={<UserCreate />} />
              <Route path="products/:id" element={<ProductForm />} />
              <Route path="orders/:orderId" element={<OrderDetails />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </MessageProvider>
    </CartProvider>
  );
}

export default App
