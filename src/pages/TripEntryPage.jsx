import { useMemo, useState } from "react";
import { Route } from "lucide-react";
import { api } from "../services/api";

const initialTripForm = {
  truckId: "",
  source: "",
  destination: "",
  driver1: "",
  driver2: ""
};

export function TripEntryPage({ trucks, fleetLoading, notify }) {
  const [tripForm, setTripForm] = useState(initialTripForm);

  const selectedTruck = useMemo(
    () => trucks.find((truck) => String(truck.id) === String(tripForm.truckId)),
    [tripForm.truckId, trucks]
  );

  const updateTripForm = (key, value) => {
    setTripForm((current) => ({ ...current, [key]: value }));
  };

  const handleTripSubmit = async (event) => {
    event.preventDefault();

    if (!selectedTruck) {
      notify("Truck select karo pehle.", "error");
      return;
    }

    try {
      await api.addLog({
        truck_id: selectedTruck.id,
        truck_num: selectedTruck.truck_number,
        source: tripForm.source.trim(),
        destination: tripForm.destination.trim(),
        driver1: tripForm.driver1.trim(),
        driver2: tripForm.driver2.trim()
      });
      notify(`${selectedTruck.truck_number} trip saved.`);
      setTripForm(initialTripForm);
    } catch (error) {
      notify(error.message || "Trip save nahi hua.", "error");
    }
  };

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-title">
          <Route size={19} />
          <div>
            <h2>New Trip Entry</h2>
            <p>Route entry and owner alert</p>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleTripSubmit}>
          <label className="field">
            <span>Fleet Vehicle</span>
            <select
              value={tripForm.truckId}
              onChange={(event) => updateTripForm("truckId", event.target.value)}
              required
              disabled={fleetLoading}
            >
              <option value="">{fleetLoading ? "Loading trucks..." : "Select truck"}</option>
              {trucks.map((truck) => (
                <option key={truck.id} value={truck.id}>
                  {truck.truck_number}
                </option>
              ))}
            </select>
          </label>

          <div className="two-column">
            <label className="field">
              <span>Source</span>
              <input
                value={tripForm.source}
                onChange={(event) => updateTripForm("source", event.target.value)}
                placeholder="Plant"
                required
              />
            </label>
            <label className="field">
              <span>Destination</span>
              <input
                value={tripForm.destination}
                onChange={(event) => updateTripForm("destination", event.target.value)}
                placeholder="Site"
                required
              />
            </label>
          </div>

          <div className="two-column">
            <label className="field">
              <span>Main Driver</span>
              <input
                value={tripForm.driver1}
                onChange={(event) => updateTripForm("driver1", event.target.value)}
                placeholder="Driver name"
                required
              />
            </label>
            <label className="field">
              <span>Co-driver</span>
              <input
                value={tripForm.driver2}
                onChange={(event) => updateTripForm("driver2", event.target.value)}
                placeholder="Optional"
              />
            </label>
          </div>

          <button className="primary-button" type="submit">
            Save Trip
          </button>
        </form>
      </section>
    </div>
  );
}
