import { useMemo, useState } from "react";
import { ReceiptText } from "lucide-react";

const initialForm = {
  slipNumber: "",
  truckId: "",
  account: "",
  product: "",
  tareWeight: "",
  netWeight: "",
  grossDateTime: "",
  tareDateTime: ""
};

const suggestedTareWeights = {
  JH02AB2557: 11100,
  JH02AZ9718: 13700
};

export function ChallanPage({ trucks, fleetLoading, notify }) {
  const [form, setForm] = useState(initialForm);

  const selectedTruck = useMemo(
    () => trucks.find((truck) => String(truck.id) === String(form.truckId)),
    [form.truckId, trucks]
  );

  const grossWeight = useMemo(() => {
    const tare = Number(form.tareWeight);
    const net = Number(form.netWeight);
    return tare > 0 && net > 0 ? tare + net : 0;
  }, [form.netWeight, form.tareWeight]);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleTruckChange = (truckId) => {
    const truck = trucks.find((item) => String(item.id) === String(truckId));
    setForm((current) => ({
      ...current,
      truckId,
      tareWeight: truck ? String(suggestedTareWeights[truck.truck_number] || current.tareWeight || "") : ""
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedTruck) {
      notify("Truck select karo pehle.", "error");
      return;
    }

    if (!grossWeight) {
      notify("Tare aur net weight sahi bharo.", "error");
      return;
    }

    const { exportChallanPdf } = await import("../utils/pdf");

    await exportChallanPdf({
      slipNumber: form.slipNumber.trim(),
      truckNumber: selectedTruck.truck_number,
      account: form.account.trim(),
      product: form.product.trim(),
      tareWeight: Number(form.tareWeight),
      netWeight: Number(form.netWeight),
      grossWeight,
      grossDateTime: form.grossDateTime,
      tareDateTime: form.tareDateTime
    });

    notify("Challan PDF downloaded.");
    setForm((current) => ({ ...initialForm, truckId: current.truckId, tareWeight: current.tareWeight }));
  };

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-title">
          <ReceiptText size={19} />
          <div>
            <h2>Challan Generator</h2>
            <p>Select vehicle and generate PDF</p>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Slip Number</span>
            <input
              value={form.slipNumber}
              onChange={(event) => updateForm("slipNumber", event.target.value)}
              placeholder="Slip number"
              required
            />
          </label>

          <label className="field">
            <span>Fleet Vehicle</span>
            <select value={form.truckId} onChange={(event) => handleTruckChange(event.target.value)} required>
              <option value="">{fleetLoading ? "Loading trucks..." : "Select vehicle"}</option>
              {trucks.map((truck) => (
                <option key={truck.id} value={truck.id}>
                  {truck.truck_number}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Account</span>
            <input
              value={form.account}
              onChange={(event) => updateForm("account", event.target.value)}
              placeholder="Account"
              required
            />
          </label>

          <label className="field">
            <span>Product</span>
            <input
              value={form.product}
              onChange={(event) => updateForm("product", event.target.value)}
              placeholder="Product"
              required
            />
          </label>

          <div className="two-column">
            <label className="field">
              <span>Tare Weight</span>
              <input
                type="number"
                min="0"
                step="10"
                value={form.tareWeight}
                onChange={(event) => updateForm("tareWeight", event.target.value)}
                placeholder="Tare"
                required
              />
            </label>
            <label className="field">
              <span>Net Weight</span>
              <input
                type="number"
                min="0"
                step="10"
                value={form.netWeight}
                onChange={(event) => updateForm("netWeight", event.target.value)}
                placeholder="Net"
                required
              />
            </label>
          </div>

          <label className="field">
            <span>Gross Weight</span>
            <input readOnly value={grossWeight ? String(grossWeight) : ""} placeholder="Auto calculated" />
          </label>

          <div className="two-column">
            <label className="field">
              <span>Gross Date Time</span>
              <input
                type="datetime-local"
                value={form.grossDateTime}
                onChange={(event) => updateForm("grossDateTime", event.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Tare Date Time</span>
              <input
                type="datetime-local"
                value={form.tareDateTime}
                onChange={(event) => updateForm("tareDateTime", event.target.value)}
                required
              />
            </label>
          </div>

          <button className="primary-button" type="submit">
            Generate Challan PDF
          </button>
        </form>
      </section>
    </div>
  );
}
