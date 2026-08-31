import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { MyReports } from "./pages/MyReports";
import { Report } from "./pages/Report";
import { ScanBill } from "./pages/ScanBill";
import { Verify } from "./pages/Verify";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/scan-bill" element={<ScanBill />} />
        <Route path="/report" element={<Report />} />
        <Route path="/my-reports" element={<MyReports />} />
      </Routes>
    </Layout>
  );
}
