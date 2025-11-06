import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "../pages/admin/AdminLogin";
import Stats from "../pages/admin/Stats";
import VoteRooms from "../pages/admin/VoteRooms";
import HostRoomRequest from "../pages/admin/HostRoomRequest";
import HostVerifyRequest from "../pages/admin/HostVerifyRequest";
import CandidateApprovals from "../pages/admin/CandidateApprovals";
import AdminLayout from "../components/layout/admin/AdminLayout";
import { useAdminStore } from "../store/adminAuthStore";

// Add protected route wrapper
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated } = useAdminStore();
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />

      <Route
        path="/dashboard/*"
        element={
          <ProtectedAdminRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<Stats />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/voterooms" element={<VoteRooms />} />
                <Route path="/hostroomrequests" element={<HostRoomRequest />} />
                <Route path="/hostverifyrequests" element={<HostVerifyRequest />} />
                <Route path="/candidate-approvals" element={<CandidateApprovals />} />
              </Routes>
            </AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
