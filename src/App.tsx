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
import CreateWings from "./pages/society/CreateWings";
import CreateFlat from "./pages/society/CreateFlats";
import EditWing from "./pages/society/EditWing";
import EditFlat from "./pages/society/EditFlat";
import EditUser from "./pages/users/EditUser";
import EditMember from "./pages/members/EditMember";
import BillGenerate from "./pages/billing/BillGenerate";
import ViewBills from "./pages/billing/ViewBills";
import ViewReceipts from "./pages/billing/ViewReceipts";
import MemberLogin from "./pages/auth/MemberLogin";
import MemberDashboard from "./pages/dashboard/MemberDashboard";
import MemberBills from "./pages/members/MemberBills";
import MemberPendingBills from "./pages/members/MemberPendingBills";
import JournalView from "./pages/accounting/JournalView";
import LedgerView from "./pages/accounting/LedgerView";
import TrialBalance from "./pages/accounting/TrialBalance";
import FinancialYear from "./pages/admin/accounting/financial-year/FinancialYear";
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";
import SuperAdminLayout from "./components/layout/SuperAdminLayout";
import SuperAdminUsers from "./pages/superadmin/users/SuperAdminUsers";
import SuperAdminCreateUser from "./pages/superadmin/users/SuperAdminCreateUser";
import SuperAdminEditUser from "./pages/superadmin/users/SuperAdminEditUser";
import AuditorLayout from "./components/layout/AuditorLayout";
import AuditorDashboard from "./pages/dashboard/AuditorDashboard";
import AuditorUsers from "./pages/auditor/users/AuditorUsers";
import SuperAdminCreateSociety from "./pages/superadmin/societies/SuperAdminCreateSociety";
import SuperAdminSocieties from "./pages/superadmin/societies/SuperAdminSocieties";
import SuperAdminEditSociety from "./pages/superadmin/societies/SuperAdminEditSociety";
import AuditorSocieties from "./pages/auditor/societies/AuditorSocieties";
import Expenses from "./pages/expenses/Expenses";
import BillingPolicy from "./pages/billing/BillingPolicy";

export default function App() {
  return (
    <Routes>

      {/* Login Page */}
      <Route path="/" element={<Login />} />
      <Route path="/member-login" element={<MemberLogin />} />
      <Route path="/member-dashboard" element={<MemberDashboard />} />
      <Route path="/member-bills" element={<MemberBills />} />
      <Route path="/member-pending-bills" element={<MemberPendingBills />} />

      <Route element={<SuperAdminLayout />}>
        <Route path="/superadmindashboard" element={<SuperAdminDashboard />} />
        <Route path="/superadminusers" element={<SuperAdminUsers />} />
        <Route path="/superadmin-create-user" element={<SuperAdminCreateUser />} />
        <Route path="/superadmin-edit-user/:id" element={<SuperAdminEditUser />} />
        <Route path="/superadmin-create-society" element={<SuperAdminCreateSociety />} />
        <Route path="/superadmin-view-societies" element={<SuperAdminSocieties />} />
        <Route path="/superadmin-edit-society/:id" element={<SuperAdminEditSociety />} />
      </Route>``
      <Route element={<AuditorLayout />}>
        <Route path="/auditordashboard" element={<AuditorDashboard />} />
        <Route path="/auditorusers" element={<AuditorUsers />} />
        <Route path="/auditorsocieties" element={<AuditorSocieties />} />

      </Route>

      {/* Layout Pages */}
      <Route element={<Layout />}>
        <Route path="/clientdashboard" element={<ClientDashboard />} />

        <Route path="/financial-year" element={<FinancialYear/>} />
        <Route path="/billing-policy" element={<BillingPolicy />} />
        
        <Route path="/wings" element={<Wings />} />
        <Route path="/create-wing" element={<CreateWings />} />
        <Route path="/edit-wing/:id" element={<EditWing />} />

        <Route path="/flats" element={<Flats />} />
        <Route path="/create-flat" element={<CreateFlat />}/>
        <Route path="/edit-flat/:id" element={<EditFlat />} />

        <Route path="/members" element={<Members />} />
        <Route path="/create-member" element={<CreateMember />} />
        <Route path="/edit-member/:id" element={<EditMember />} />

        <Route path="/users" element={<Users />} />
        <Route path="/create-user" element={<CreateUser />} />
        <Route path="/edit-user/:id" element={<EditUser />} />

        <Route path="/bill-generate" element={<BillGenerate />}/>
        <Route path="/view-bills" element={<ViewBills />} />
        <Route path="/view-receipts" element={<ViewReceipts />} />

        <Route path="/view-journal" element={<JournalView />} />
        <Route path="/view-ledger" element={<LedgerView />} />
        <Route path="/trial-balance" element={<TrialBalance />} />

        <Route path="/add-expenses" element={<Expenses />} />


      </Route>

    </Routes>
  );
}