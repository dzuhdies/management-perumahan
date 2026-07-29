import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import MainLayout from "./components/layout/MainLayout.jsx";

import DashboardPage from "./pages/DashboardPage.jsx";
import RumahPage from "./pages/RumahPage.jsx";
import PenghuniPage from "./pages/PenghuniPage.jsx";
import TagihanPage from "./pages/TagihanPage.jsx";
import JenisIuranPage from "./pages/JenisIuranPage.jsx";
import PengeluaranPage from "./pages/PengeluaranPage.jsx";
import LaporanPage from "./pages/LaporanPage.jsx";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/rumah"
          element={<RumahPage />}
        />

        <Route
          path="/penghuni"
          element={<PenghuniPage />}
        />

        <Route
          path="/tagihan"
          element={<TagihanPage />}
        />

        <Route
          path="/jenis-iuran"
          element={<JenisIuranPage />}
        />

        <Route
          path="/pengeluaran"
          element={<PengeluaranPage />}
        />

        <Route
          path="/laporan"
          element={<LaporanPage />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
