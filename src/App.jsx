import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, History, Home, LockKeyhole, ReceiptText, Route, Truck } from "lucide-react";
import { api } from "./services/api";
import { AuthLock } from "./components/AuthLock";
import { BottomNavigation } from "./components/BottomNavigation";
import { LogoMark } from "./components/LogoMark";
import { Toast } from "./components/Toast";
import { ChallanPage } from "./pages/ChallanPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { FleetPage } from "./pages/FleetPage";
import { HomePage } from "./pages/HomePage";
import { TripEntryPage } from "./pages/TripEntryPage";
import { TripHistoryPage } from "./pages/TripHistoryPage";

const SESSION_KEY = "santosh_fleet_session";

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "trip", label: "Trip", icon: Route },
  { id: "history", label: "History", icon: History },
  { id: "challan", label: "Challan", icon: ReceiptText },
  { id: "documents", label: "Docs", icon: FileText },
  { id: "fleet", label: "Fleet", icon: Truck }
];

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === "active");
  const [activeTab, setActiveTab] = useState("home");
  const [trucks, setTrucks] = useState([]);
  const [fleetLoading, setFleetLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, type = "success") => {
    setToast({ id: Date.now(), message, type });
  }, []);

  const loadTrucks = useCallback(async () => {
    setFleetLoading(true);
    try {
      const data = await api.getTrucks();
      setTrucks(data);
    } catch (error) {
      notify(error.message || "Truck list load nahi hua.", "error");
    } finally {
      setFleetLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    if (!isUnlocked) return;
    loadTrucks();
  }, [isUnlocked, loadTrucks]);

  const handleUnlock = () => {
    sessionStorage.setItem(SESSION_KEY, "active");
    setIsUnlocked(true);
  };

  const handleLock = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsUnlocked(false);
    setActiveTab("home");
  };

  const activePage = useMemo(() => {
    const sharedProps = { trucks, fleetLoading, notify, refreshTrucks: loadTrucks };

    if (activeTab === "home") {
      return <HomePage trucks={trucks} onNavigate={setActiveTab} />;
    }

    if (activeTab === "trip") {
      return <TripEntryPage {...sharedProps} />;
    }

    if (activeTab === "history") {
      return <TripHistoryPage {...sharedProps} />;
    }

    if (activeTab === "challan") {
      return <ChallanPage {...sharedProps} />;
    }

    if (activeTab === "documents") {
      return <DocumentsPage {...sharedProps} />;
    }

    if (activeTab === "fleet") {
      return <FleetPage {...sharedProps} />;
    }

    return <HomePage trucks={trucks} onNavigate={setActiveTab} />;
  }, [activeTab, fleetLoading, loadTrucks, notify, trucks]);

  if (!isUnlocked) {
    return <AuthLock onUnlock={handleUnlock} />;
  }

  return (
    <div className="app-shell">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <header className="app-header">
        <div className="app-brand">
          <LogoMark />
          <h1>Santosh</h1>
        </div>
        <button className="icon-button" type="button" onClick={handleLock} aria-label="Lock app">
          <LockKeyhole size={19} />
        </button>
      </header>

      <main className="app-main">{activePage}</main>

      <BottomNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
