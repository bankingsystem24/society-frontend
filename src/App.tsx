import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Layout from "./components/layout/Layout";
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
import GlOpeningBalance from "./pages/accounting/GlOpeningBalance";
import Vendors from "./pages/vendors/Vendors";
import PendingBills from "./pages/billing/PendingBills";
import ProfitAndLoss from "./pages/accounting/ProfitAndLoss";
import GenerateSinkingFund from "./pages/billing/GenerateSinkingFund";
import ViewSinkingFund from "./pages/billing/ViewSinkingFund";
import PendingSinkingFunds from "./pages/billing/PendingSinkingFunds";
import MemberSinkingFunds from "./pages/members/MemberSinkingFunds";
import GlMaster from "./pages/accounting/GlMaster";
import DiscountPolicy from "./pages/billing/DiscountPolicy";
import ContributionPage from "./pages/billing/ContributionPage";
import ViewContribution from "./pages/billing/ViewContribution";
import PendingContributions from "./pages/billing/PendingContributions";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import SetSociety from "./pages/auditor/societies/SetSociety";

export default function App() {
  return (
    <Routes>

      {/* Login Page */}
      <Route path="/" element={<Login />} />
      <Route path="/member-login" element={<MemberLogin />} />
      <Route path="/member-dashboard" element={<MemberDashboard />} />
      <Route path="/member-receipts" element={<MemberBills />} />
      <Route path="/member-pending-bills" element={<MemberPendingBills />} />
      <Route path="/member-sinking-funds" element={<MemberSinkingFunds />} />
      <Route path="/contributions" element={<PendingContributions />} />
      <Route path="/sinking-funds" element={<PendingSinkingFunds />} />
      <Route path="/view-receipts" element={<ViewReceipts />} />
      <Route path="/financial-year" element={<FinancialYear/>} />
      <Route path="/set-society" element={<SetSociety/>} />



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
        <Route path="/admindashboard" element={<AdminDashboard />} />

        <Route path="/billing-policy" element={<BillingPolicy />} />
        <Route path="/discount-policy" element={<DiscountPolicy />} />

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

        <Route path="/gl-balances" element={<GlOpeningBalance />} />
        <Route path="/gl-master" element={<GlMaster />} />

        <Route path="/bill-generate" element={<BillGenerate />}/>
        <Route path="/view-bills" element={<ViewBills />} />
        <Route path="/pending-bills" element={<PendingBills />} />
        <Route path="/generate-sinking-fund" element={<GenerateSinkingFund />}/>
        <Route path="/view-sinking-fund" element={<ViewSinkingFund />}/>
        <Route path="/view-contribution" element={<ViewContribution />}/>

        <Route path="/generate-contribution" element={<ContributionPage />} />

        <Route path="/view-journal" element={<JournalView />} />
        <Route path="/view-ledger" element={<LedgerView />} />
        <Route path="/trial-balance" element={<TrialBalance />} />
        <Route path="/profit-and-loss" element={<ProfitAndLoss />} />
        

        <Route path="/add-expenses" element={<Expenses />} />
        <Route path="/vendors" element={<Vendors />} />


      </Route>

    </Routes>
  );
}