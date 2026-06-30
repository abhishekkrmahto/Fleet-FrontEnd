const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === "object" ? payload.error || payload.message : payload;
    throw new Error(message || "Request failed");
  }

  return payload;
}

export const api = {
  getTrucks() {
    return request("/trucks");
  },

  addTruck(truckNumber) {
    return request("/trucks/add", {
      method: "POST",
      body: JSON.stringify({ truck_number: truckNumber })
    });
  },

  addLog(payload) {
    return request("/logs/add", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  getTruckHistory(truckId, truckNumber) {
    return request(`/trucks/history/${encodeURIComponent(truckId)}/${encodeURIComponent(truckNumber)}`);
  },

  getDocuments(truckNumber) {
    return request(`/docs?truckNumber=${encodeURIComponent(truckNumber)}`);
  },

  getDocument(documentId) {
    return request(`/docs/${encodeURIComponent(documentId)}`);
  },

  uploadDocument(payload) {
    return request("/docs/upload", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};
