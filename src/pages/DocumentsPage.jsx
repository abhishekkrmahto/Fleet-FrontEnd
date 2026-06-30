import { useEffect, useMemo, useState } from "react";
import { Download, FileUp, FolderOpen } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { documentTypes } from "../data/documentTypes";
import { api } from "../services/api";
import { downloadBase64File, toBase64 } from "../utils/file";
import { daysUntil, formatDate } from "../utils/format";

const initialForm = {
  truckId: "",
  documentType: documentTypes[0],
  expiryDate: "",
  file: null
};

export function DocumentsPage({ trucks, fleetLoading, notify }) {
  const [form, setForm] = useState(initialForm);
  const [selectedTruckId, setSelectedTruckId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState("");

  const uploadTruck = useMemo(
    () => trucks.find((truck) => String(truck.id) === String(form.truckId)),
    [form.truckId, trucks]
  );

  const selectedTruck = useMemo(
    () => trucks.find((truck) => String(truck.id) === String(selectedTruckId)),
    [selectedTruckId, trucks]
  );

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const loadDocuments = async (truckId = selectedTruckId) => {
    const truck = trucks.find((item) => String(item.id) === String(truckId));

    setSelectedTruckId(truckId);
    setDocuments([]);

    if (!truck) return;

    setDocumentsLoading(true);
    try {
      const data = await api.getDocuments(truck.truck_number);
      setDocuments(data || []);
    } catch (error) {
      notify(error.message || "Documents load nahi huye.", "error");
    } finally {
      setDocumentsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedTruckId && form.truckId) {
      setSelectedTruckId(form.truckId);
    }
  }, [form.truckId, selectedTruckId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!uploadTruck || !form.file) {
      notify("Truck aur file dono select karo.", "error");
      return;
    }

    setUploading(true);
    try {
      const fileBase64 = await toBase64(form.file);
      await api.uploadDocument({
        truckId: String(uploadTruck.id),
        truckNumber: uploadTruck.truck_number,
        documentType: form.documentType,
        expiryDate: form.expiryDate,
        fileBase64,
        fileName: form.file.name,
        mimeType: form.file.type || "application/octet-stream",
        fileSize: form.file.size,
        section: "vehicle-documents"
      });

      notify(`${uploadTruck.truck_number} document saved.`);
      setForm((current) => ({ ...initialForm, truckId: current.truckId }));
      await loadDocuments(uploadTruck.id);
    } catch (error) {
      notify(error.message || "Document upload fail hua.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (document) => {
    setDownloadingId(document._id);
    try {
      const fullDocument = document.fileBase64 ? document : await api.getDocument(document._id);
      downloadBase64File(
        fullDocument.fileBase64,
        fullDocument.fileName || `${fullDocument.documentType}-${fullDocument.truckNumber}`
      );
      notify("Document downloaded.");
    } catch (error) {
      notify(error.message || "Document download nahi hua.", "error");
    } finally {
      setDownloadingId("");
    }
  };

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-title">
          <FileUp size={19} />
          <div>
            <h2>Upload Vehicle Document</h2>
            <p>Saved in separate document vault</p>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Fleet Vehicle</span>
            <select
              value={form.truckId}
              onChange={(event) => updateForm("truckId", event.target.value)}
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
              <span>Document Type</span>
              <select value={form.documentType} onChange={(event) => updateForm("documentType", event.target.value)}>
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Expiry Date</span>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(event) => updateForm("expiryDate", event.target.value)}
                required
              />
            </label>
          </div>

          <label className="field file-field">
            <span>PDF / Image File</span>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(event) => updateForm("file", event.target.files?.[0] || null)}
              required
            />
          </label>

          <button className="primary-button" type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Document"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-title">
          <FolderOpen size={19} />
          <div>
            <h2>Vehicle Documents</h2>
            <p>Separate section for uploaded truck files</p>
          </div>
        </div>

        <label className="field">
          <span>Open Vault For</span>
          <select value={selectedTruckId} onChange={(event) => loadDocuments(event.target.value)}>
            <option value="">Select truck</option>
            {trucks.map((truck) => (
              <option key={truck.id} value={truck.id}>
                {truck.truck_number}
              </option>
            ))}
          </select>
        </label>

        <div className="list-stack">
          {documentsLoading ? <EmptyState title="Loading documents..." /> : null}

          {!documentsLoading && !selectedTruck ? (
            <EmptyState title="Select a truck" detail="Uploaded vehicle documents will appear here." />
          ) : null}

          {!documentsLoading && selectedTruck && documents.length === 0 ? (
            <EmptyState title="No documents uploaded" detail="Upload a PDF or scanned copy above." />
          ) : null}

          {!documentsLoading &&
            documents.map((document) => {
              const remainingDays = daysUntil(document.expiryDate);
              const critical = remainingDays <= 10;

              return (
                <article className="document-card" key={document._id}>
                  <div className="document-main">
                    <div>
                      <h3>{document.documentType}</h3>
                      <p>{document.fileName || "Vehicle document"}</p>
                    </div>
                    <span className={critical ? "pill danger" : "pill ok"}>
                      {remainingDays < 0 ? "Expired" : `${remainingDays} days`}
                    </span>
                  </div>
                  <div className="document-meta">
                    <span>{document.truckNumber}</span>
                    <span>Expiry {formatDate(document.expiryDate)}</span>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={downloadingId === document._id}
                    onClick={() => handleDownload(document)}
                  >
                    <Download size={16} />
                    {downloadingId === document._id ? "Downloading..." : "Download"}
                  </button>
                </article>
              );
            })}
        </div>
      </section>
    </div>
  );
}
