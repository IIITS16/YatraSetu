import { Navigate, Route, Routes } from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./auth";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { MyReports } from "./pages/MyReports";
import { Report } from "./pages/Report";
import { ScanBill } from "./pages/ScanBill";
import { Verify } from "./pages/Verify";
import { VerifyOtp } from "./pages/VerifyOtp";

function ProtectedApp() {
  return (
    <Layout>
      <AuthGuard>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/scan-bill" element={<ScanBill />} />
          <Route path="/report" element={<Report />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthGuard>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/*" element={<ProtectedApp />} />
      </Routes>
    </AuthProvider>
  );
}
