import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/home'
import Feature from './feature/feature'
import { TooltipProvider } from './components/ui/tooltip'
import Products from './pages/products'
import Customers from './pages/customers'
import CreditCustomers from './pages/credit-customers'
import Purchases from './pages/purchases'
import Suppliers from './pages/suppliers'
import StockManagement from './pages/stockmanagement'
import Sales from './pages/sales'
import Reports from './pages/reports'
import Expenses from './pages/expenses'
import Settings from './pages/settings'
import Account from './pages/account'
import LoginPage from './pages/loginpage'
import ProtectedRoutes from './components/login/protectedroute'
import UnprotectedRoutes from './components/login/unprotectedroutes'

function App() {

  return (
    <>
    <TooltipProvider>
    <Routes>      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<UnprotectedRoutes />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<ProtectedRoutes />}>
        <Route element={<Feature />}>
          <Route path="dashboard" element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="stock-management" element={<StockManagement />} />
          <Route path="customers" element={<Customers />} />
          <Route path="credit-customers" element={<CreditCustomers />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="purchase" element={<Purchases />} />
          <Route path="sales" element={<Sales />} />
          <Route path="reports" element={<Reports />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="settings" element={<Settings />} />
          <Route path="account" element={<Account />} />
        </Route>
      </Route>
    </Routes>
    </TooltipProvider>
    </>
  )
}

export default App
