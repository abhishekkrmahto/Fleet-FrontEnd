import { useState } from "react";
import { Plus, Truck } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { api } from "../services/api";
import { formatDate } from "../utils/format";

export function FleetPage({ trucks, fleetLoading, notify, refreshTrucks }) {
  const [truckNumber, setTruckNumber] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanNumber = truckNumber.trim().toUpperCase();
    if (!cleanNumber) return;

    setSaving(true);
    try {
      await api.addTruck(cleanNumber);
      notify(`${cleanNumber} added to fleet.`);
      setTruckNumber("");
      await refreshTrucks();
    } catch (error) {
      notify(error.message || "Truck add nahi hua.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-title">
          <Plus size={19} />
          <div>
            <h2>Add New Truck</h2>
            <p>Syncs across trip and document forms</p>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Vehicle Number</span>
            <input
              value={truckNumber}
              onChange={(event) => setTruckNumber(event.target.value.toUpperCase())}
              placeholder="JH-01-AM-9999"
              autoCapitalize="characters"
              required
            />
          </label>

          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "Adding..." : "Add Vehicle"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-title">
          <Truck size={19} />
          <div>
            <h2>Active Fleet</h2>
            <p>{trucks.length} registered vehicles</p>
          </div>
        </div>

        <div className="list-stack">
          {fleetLoading ? <EmptyState title="Loading fleet..." /> : null}

          {!fleetLoading && trucks.length === 0 ? (
            <EmptyState title="No trucks registered" detail="Add the first vehicle above." />
          ) : null}

          {!fleetLoading &&
            trucks.map((truck) => (
              <article className="compact-card" key={truck.id}>
                <div>
                  <h3>{truck.truck_number}</h3>
                  <p>Added {formatDate(truck.added_at)}</p>
                </div>
              </article>
            ))}
        </div>
      </section>
    </div>
  );
}
