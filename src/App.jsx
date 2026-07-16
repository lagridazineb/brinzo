import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BookingProvider } from "./context/BookingContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import Landing from "./pages/Landing";
import Locations from "./pages/Locations";
import ItemDetails from "./pages/ItemDetails";
import ServiceSelect from "./pages/ServiceSelect";
import Login from "./pages/Login";
import Otp from "./pages/Otp";
import Matching from "./pages/Matching";
import Tracking from "./pages/Tracking";
import Legal from "./pages/Legal";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <BookingProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/book/locations" element={<Locations />} />
            <Route path="/book/item" element={<ItemDetails />} />
            <Route path="/book/service" element={<ServiceSelect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/otp" element={<Otp />} />
            <Route path="/matching" element={<Matching />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/legal/:slug" element={<Legal />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </BookingProvider>
  );
}
