import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
// import MainLayout from "./components/layout/MainLayout";
import Layout from "./components/layout/Layout";
import ClientDashboard from "./pages/dashboard/ClientDashboard";
import Wings from "./pages/society/Wings";
import Flats from "./pages/society/Flats";
import Members from "./pages/members/Members";
import Users from "./pages/users/Users";
import CreateUser from "./pages/users/CreateUser";
import CreateMember from "./pages/members/CreateMember";

export default function App() {
  return (
    <Routes>

      {/* Login Page */}
      <Route path="/" element={<Login />} />

      {/* Layout Pages */}
      <Route element={<Layout />}>
        <Route path="/clientdashboard" element={<ClientDashboard />} />
        <Route path="/wings" element={<Wings />} />
        <Route path="/flats" element={<Flats />} />
        <Route path="/members" element={<Members />} />
        <Route path="/create-member" element={<CreateMember />} />
        <Route path="/users" element={<Users />} />
        <Route path="/create-user" element={<CreateUser />} />
      </Route>

    </Routes>
  );
}