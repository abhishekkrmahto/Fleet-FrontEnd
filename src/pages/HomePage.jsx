import { FileText, History, ReceiptText, Route, Truck } from "lucide-react";
import { LogoMark } from "../components/LogoMark";

const navItems = [
  {
    id: "trip",
    title: "New Trip",
    detail: "Save route entry",
    icon: Route
  },
  {
    id: "history",
    title: "Trip History",
    detail: "Search and PDF report",
    icon: History
  },
  {
    id: "challan",
    title: "Challan",
    detail: "Generate challan PDF",
    icon: ReceiptText
  },
  {
    id: "documents",
    title: "Documents",
    detail: "Vehicle document vault",
    icon: FileText
  },
  {
    id: "fleet",
    title: "Fleet",
    detail: "Add and view trucks",
    icon: Truck
  }
];

export function HomePage({ trucks, onNavigate }) {
  return (
    <div className="page-stack">
      <section className="home-hero">
        <div className="home-brand">
          <LogoMark className="home-logo" />
          <div>
            <p className="eyebrow">Control Room</p>
            <h2>SANTOSH FLYASH SERVICE</h2>
          </div>
        </div>
        <div className="home-stats">
          {/* <div>
            <strong>{trucks.length}</strong>
            <span>Vehicles</span>
          </div> */}
        </div>
      </section>

      <section className="home-grid" aria-label="App sections">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <button className="home-card" type="button" key={item.id} onClick={() => onNavigate(item.id)}>
              <Icon size={22} />
              <span>{item.title}</span>
              <small>{item.detail}</small>
            </button>
          );
        })}
      </section>
    </div>
  );
}
