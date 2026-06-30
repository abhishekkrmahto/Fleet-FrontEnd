import { useMemo, useState } from "react";
import { Download, History } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { api } from "../services/api";
import { formatDate } from "../utils/format";

export function TripHistoryPage({ trucks, notify }) {
  const [selectedTruckId, setSelectedTruckId] = useState("");
  const [tripHistory, setTripHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [filters, setFilters] = useState({ from: "", to: "" });

  const selectedTruck = useMemo(
    () => trucks.find((truck) => String(truck.id) === String(selectedTruckId)),
    [selectedTruckId, trucks]
  );

  const filteredTrips = useMemo(() => {
    return tripHistory.filter((trip) => {
      const tripTime = new Date(trip.log_date).getTime();
      const fromPass = filters.from ? tripTime >= new Date(`${filters.from}T00:00:00`).getTime() : true;
      const toPass = filters.to ? tripTime <= new Date(`${filters.to}T23:59:59`).getTime() : true;
      return fromPass && toPass;
    });
  }, [filters.from, filters.to, tripHistory]);

  const loadHistory = async (truckId) => {
    const truck = trucks.find((item) => String(item.id) === String(truckId));

    setSelectedTruckId(truckId);
    setTripHistory([]);

    if (!truck) return;

    setHistoryLoading(true);
    try {
      const data = await api.getTruckHistory(truck.id, truck.truck_number);
      setTripHistory(data.trips || []);
    } catch (error) {
      notify(error.message || "Trip history load nahi hui.", "error");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!selectedTruck || filteredTrips.length === 0) {
      notify("PDF ke liye trip data nahi mila.", "error");
      return;
    }

    const { exportTripsPdf } = await import("../utils/pdf");

    await exportTripsPdf({
      truckNumber: selectedTruck.truck_number,
      trips: filteredTrips,
      fromDate: filters.from,
      toDate: filters.to
    });
    notify("PDF report downloaded.");
  };

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-title">
          <History size={19} />
          <div>
            <h2>Trip History</h2>
            <p>Filter routes and download PDF</p>
          </div>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Truck Number</span>
            <select value={selectedTruckId} onChange={(event) => loadHistory(event.target.value)}>
              <option value="">Select truck</option>
              {trucks.map((truck) => (
                <option key={truck.id} value={truck.id}>
                  {truck.truck_number}
                </option>
              ))}
            </select>
          </label>

          <div className="two-column">
            <label className="field">
              <span>From</span>
              <input
                type="date"
                value={filters.from}
                onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>To</span>
              <input
                type="date"
                value={filters.to}
                onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}
              />
            </label>
          </div>

          <button className="secondary-button" type="button" onClick={handleExportPdf}>
            <Download size={17} />
            Download PDF
          </button>
        </div>

        <div className="list-stack history-list">
          {historyLoading ? <EmptyState title="Loading trip history..." /> : null}

          {!historyLoading && selectedTruck && filteredTrips.length === 0 ? (
            <EmptyState title="No trip logs found" detail="Try another date range." />
          ) : null}

          {!historyLoading && !selectedTruck ? (
            <EmptyState title="Select a truck" detail="Trip records will appear here." />
          ) : null}

          {!historyLoading &&
            filteredTrips.map((trip, index) => (
              <article className="compact-card" key={`${trip.log_date}-${trip.source}-${trip.destination}-${index}`}>
                <div>
                  <h3>
                    {trip.source} <span>to</span> {trip.destination}
                  </h3>
                  <p>
                    {trip.driver1}
                    {trip.driver2 ? ` / ${trip.driver2}` : ""}
                  </p>
                </div>
                <time>{formatDate(trip.log_date)}</time>
              </article>
            ))}
        </div>
      </section>
    </div>
  );
}
