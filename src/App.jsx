import { Navigate, Route, Routes } from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import { Layout } from "./components/Layout";
import { InspectorLayout } from "./components/InspectorLayout";
import { AuthProvider, useAuth } from "./auth";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { MyReports } from "./pages/MyReports";
import { Report } from "./pages/Report";
import { ScanBill } from "./pages/ScanBill";
import { Verify } from "./pages/Verify";
import { VerifyOtp } from "./pages/VerifyOtp";
import { Profile } from "./pages/Profile";
import { InspectorDashboard } from "./pages/inspector/InspectorDashboard";
import { InspectorReports } from "./pages/inspector/InspectorReports";
import { CaseInvestigation } from "./pages/inspector/CaseInvestigation";
import { HeatMap } from "./pages/inspector/HeatMap";
import { BusinessDirectory } from "./pages/inspector/BusinessDirectory";
import { GovernmentAnalytics } from "./pages/inspector/GovernmentAnalytics";

function ProtectedApp() {
  const { user } = useAuth();

  if (user?.role === "inspector" || user?.role === "government") {
    return (
      <InspectorLayout>
        <AuthGuard>
          <Routes>
            <Route path="/" element={<Navigate to="/inspector" replace />} />
            <Route path="/inspector" element={<InspectorDashboard />} />
            <Route path="/inspector/reports" element={<InspectorReports />} />
            <Route path="/inspector/case/:id" element={<CaseInvestigation />} />
            <Route path="/inspector/heatmap" element={<HeatMap />} />
            <Route path="/inspector/businesses" element={<BusinessDirectory />} />
            <Route path="/inspector/analytics" element={<GovernmentAnalytics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/inspector" replace />} />
          </Routes>
        </AuthGuard>
      </InspectorLayout>
    );
  }

  return (
    <Layout>
      <AuthGuard>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/scan-bill" element={<ScanBill />} />
          <Route path="/report" element={<Report />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/profile" element={<Profile />} />
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
