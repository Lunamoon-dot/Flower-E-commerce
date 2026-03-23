import { createBrowserRouter } from "react-router-dom"
import { MainLayout } from "@/layouts/MainLayout"
import { AuthLayout } from "@/layouts/AuthLayout"
import { AdminLayout } from "@/layouts/AdminLayout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { HomePage } from "@/pages/HomePage"
import { ProductsPage } from "@/pages/ProductsPage"
import { ProductDetailPage } from "@/pages/ProductDetailPage"
import { CartPage } from "@/pages/CartPage"
import { CheckoutPage } from "@/pages/CheckoutPage"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { OrderHistoryPage } from "@/pages/OrderHistoryPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage"
import { AdminProductsPage } from "@/pages/admin/AdminProductsPage"
import { AdminOrdersPage } from "@/pages/admin/AdminOrdersPage"
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage"

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "products/:id", element: <ProductDetailPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "orders", element: <OrderHistoryPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
  // Admin – requires login + admin role
  {
    path: "admin",
    element: <ProtectedRoute requireAdmin />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "products", element: <AdminProductsPage /> },
          { path: "orders", element: <AdminOrdersPage /> },
          { path: "users", element: <AdminUsersPage /> },
        ],
      },
    ],
  },
])
