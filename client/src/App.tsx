import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Public pages
import Landing from "./pages/Landing";
import About from "./pages/About";
import SafetyPage from "./pages/SafetyPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import SupportPage from "./pages/SupportPage";
import NotFound from "./pages/NotFound";

// Member pages
import HomeDashboard from "./pages/HomeDashboard";
import Onboarding from "./pages/Onboarding";
import ProfileBuilder from "./pages/ProfileBuilder";
import DailyPicks from "./pages/DailyPicks";
import Explore from "./pages/Explore";
import MatchDetail from "./pages/MatchDetail";
import Inbox from "./pages/Inbox";
import ChatThread from "./pages/ChatThread";
import SkillsHub from "./pages/SkillsHub";
import SkillDetail from "./pages/SkillDetail";
import TrustHub from "./pages/TrustHub";
import SafetyCenter from "./pages/SafetyCenter";
import Settings from "./pages/Settings";
import PrivacyControls from "./pages/PrivacyControls";
import ConsentControls from "./pages/ConsentControls";
import DataControls from "./pages/DataControls";

// Moderator pages
import ModQueue from "./pages/ModQueue";
import ModCaseDetail from "./pages/ModCaseDetail";
import ModLog from "./pages/ModLog";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminAudit from "./pages/AdminAudit";
import AdminAI from "./pages/AdminAI";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Landing} />
      <Route path="/about" component={About} />
      <Route path="/safety" component={SafetyPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/support" component={SupportPage} />

      {/* Member */}
      <Route path="/home" component={HomeDashboard} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/profile/build" component={ProfileBuilder} />
      <Route path="/profile/edit" component={ProfileBuilder} />
      <Route path="/picks" component={DailyPicks} />
      <Route path="/explore" component={Explore} />
      <Route path="/match/:id" component={MatchDetail} />
      <Route path="/inbox" component={Inbox} />
      <Route path="/chat/:id" component={ChatThread} />
      <Route path="/skills" component={SkillsHub} />
      <Route path="/skills/:slug" component={SkillDetail} />
      <Route path="/trust" component={TrustHub} />
      <Route path="/safety-center" component={SafetyCenter} />
      <Route path="/settings" component={Settings} />
      <Route path="/settings/privacy" component={PrivacyControls} />
      <Route path="/settings/consent" component={ConsentControls} />
      <Route path="/settings/data" component={DataControls} />

      {/* Moderator */}
      <Route path="/mod/queue" component={ModQueue} />
      <Route path="/mod/case/:id" component={ModCaseDetail} />
      <Route path="/mod/log" component={ModLog} />

      {/* Admin */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/audit" component={AdminAudit} />
      <Route path="/admin/ai" component={AdminAI} />

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
