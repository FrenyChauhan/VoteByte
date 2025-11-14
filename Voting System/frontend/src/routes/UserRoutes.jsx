import { Routes, Route, useLocation } from "react-router-dom";
import FloatingShape from "../components/FloatingShape";

import SignUpPage from "../pages/SignUpPage";
import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import DashBoardPage from "../pages/DashBoardPage";
import EmailVerification from "../pages/EmailVerification";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import LandingPage from "../pages/LandingPage";
import ElectionPage from "../pages/ElectionPage";
import ActiveElection from "../pages/ActiveElection";
import ElectionResultPage from "../pages/ElectionResultPage";
import ElectionCandidates from "../pages/ElectionCandidates";
import Profile from "../pages/Profile";
import HostVerify from "../pages/HostVerify";
import HostElections from "../pages/HostElections";
import CreateElection from "../pages/CreateElection";
import EditElection from "../pages/EditElection";
import HostElectionCandidates from "../pages/HostElectionCandidates";


import ProtectRoute from "./ProtectRoute";
import HostProtectRoute from "./HostProtectRoute";
import RedirectAuthenticatedUser from "./RedirectAuthenticatedUser";

import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function UserRoutes({onToggleTheme, theme}) {
  const location = useLocation();
  
  // Define routes where footer should be hidden
  const authRoutes = ['/login', '/signup', '/verify-email', '/forgot-password', '/host/verify'];
  const isResetPasswordRoute = location.pathname.startsWith('/reset-password/');
  const shouldHideFooterNavbar = authRoutes.includes(location.pathname) || isResetPasswordRoute;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      {!shouldHideFooterNavbar && (
        <NavBar onToggleTheme={onToggleTheme} theme={theme} />
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex items-center justify-center relative overflow-hidden transition-all duration-700 ${
          theme === "dark"
            ? "bg-linear-to-br from-gray-900 via-green-900 to-emerald-900"
            : "bg-linear-to-br from-[#E8EDFF] via-[#D6E0FF] to-[#C2CEFF]"
        }`}
      >
        {theme === "dark" ? (
          <>
            <FloatingShape color="bg-green-500" size="w-64 h-64" top="-5%" left="10%" delay={0} />
            <FloatingShape color="bg-emerald-500" size="w-48 h-48" top="70%" left="80%" delay={5} />
            <FloatingShape color="bg-lime-500" size="w-32 h-32" top="40%" left="-10%" delay={2} />
          </>
        ) : (
          <>
            <FloatingShape color="bg-[#3B5BFF]" size="w-64 h-64" top="-5%" left="10%" delay={0} />
            <FloatingShape color="bg-[#5D75FF]" size="w-48 h-48" top="70%" left="80%" delay={5} />
            <FloatingShape color="bg-[#9BB3FF]" size="w-32 h-32" top="40%" left="-10%" delay={2} />
          </>
        )}
      

        <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectRoute>
              <DashBoardPage theme={theme}/>
            </ProtectRoute>
          }
        />

        <Route path="/" element={<LandingPage theme={theme} />} />
        <Route path="/elections" element={<ElectionPage theme={theme} />} />

        <Route path='/election/COMPLETED/:id' element={<ElectionResultPage theme={theme} />} />
        <Route path='/election/completed/:id' element={<ElectionResultPage theme={theme} />} />
        <Route path='/election/active/:id' element={<ProtectRoute><ActiveElection /></ProtectRoute>} />
        <Route path='/election/:status(UPCOMING|ONGOING|ACTIVE)/:id' element={<ProtectRoute><ActiveElection /></ProtectRoute>} />
        <Route path='/election/:status/:id/candidates' element={<ElectionCandidates theme={theme} />} />
        <Route path="/profile" element={<ProtectRoute><Profile /></ProtectRoute>} />

        <Route
          path="/signup"
          element={
            <RedirectAuthenticatedUser>
              <SignUpPage theme={theme} />
            </RedirectAuthenticatedUser>
          }
        />

        <Route
          path="/login"
          element={
            <RedirectAuthenticatedUser>
              <LoginPage theme={theme} />
            </RedirectAuthenticatedUser>
          }
        />

        <Route path="/verify-email" element={<EmailVerification theme={theme} />} />

        <Route
          path="/forgot-password"
          element={
            <RedirectAuthenticatedUser>
              <ForgotPasswordPage theme={theme} />
            </RedirectAuthenticatedUser>
          }
        />

        <Route
          path="/reset-password/:token"
          element={
            <RedirectAuthenticatedUser>
              <ResetPasswordPage theme={theme} />
            </RedirectAuthenticatedUser>
          }
        />


        <Route path="/host/verify" element={<HostVerify />} />
        <Route 
          path="/host/elections" 
          element={
            <ProtectRoute>
              <HostElections />
            </ProtectRoute>
          } 
        />
        <Route 
          path="/host/election/new" 
          element={
            <ProtectRoute>
              <CreateElection />
            </ProtectRoute>
          } 
        />
        <Route 
          path="/host/election/:id/edit" 
          element={
            <ProtectRoute>
              <EditElection />
            </ProtectRoute>
          } 
        />
        <Route 
          path="/host/election/:id/candidates" 
          element={
            <ProtectRoute>
              <HostElectionCandidates />
            </ProtectRoute>
          } 
        />

        </Routes>
      </div>

      {!shouldHideFooterNavbar && <Footer theme={theme} />}
    </div>
  );
}
