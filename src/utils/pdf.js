import jsPDF from "jspdf";
import { formatDate } from "./format";

let logoDataUrlPromise;

export async function exportTripsPdf({ truckNumber, trips, fromDate, toDate }) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const logoDataUrl = await loadLogoDataUrl();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const titleX = logoDataUrl ? margin + 58 : margin;
  const tableTop = 154;
  const rowHeight = 28;
  const columns = [
    { label: "Date", x: margin, width: 82 },
    { label: "Source", x: margin + 86, width: 118 },
    { label: "Destination", x: margin + 208, width: 120 },
    { label: "Driver 1", x: margin + 332, width: 90 },
    { label: "Driver 2", x: margin + 426, width: 86 }
  ];

  let y = tableTop;
  let page = 1;

  const drawHeader = () => {
    pdf.setFillColor(17, 24, 39);
    pdf.rect(0, 0, pageWidth, 92, "F");

    if (logoDataUrl) {
      pdf.addImage(logoDataUrl, "PNG", margin, 20, 44, 44);
    }

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("SANTOSH FLYASH SERVICE", titleX, 38);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(`Trip Report: ${truckNumber}`, titleX, 58);
    pdf.text(`Range: ${fromDate || "All"} to ${toDate || "All"}`, titleX, 74);

    pdf.setTextColor(17, 24, 39);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text(`Generated: ${formatDate(new Date())}`, pageWidth - margin - 132, 38);
    pdf.text(`Page ${page}`, pageWidth - margin - 42, 58);

    drawTableHead();
  };

  const drawTableHead = () => {
    pdf.setFillColor(245, 158, 11);
    pdf.rect(margin, 118, pageWidth - margin * 2, 24, "F");
    pdf.setTextColor(17, 24, 39);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    columns.forEach((column) => pdf.text(column.label, column.x + 6, 134));
  };

  const drawFooter = () => {
    pdf.setTextColor(100, 116, 139);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("Santosh fleet report", margin, pageHeight - 24);
  };

  const nextPage = () => {
    drawFooter();
    pdf.addPage();
    page += 1;
    y = tableTop;
    drawHeader();
  };

  drawHeader();

  pdf.setFontSize(9);
  trips.forEach((trip, index) => {
    if (y + rowHeight > pageHeight - 48) {
      nextPage();
    }

    if (index % 2 === 0) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, y - 16, pageWidth - margin * 2, rowHeight, "F");
    }

    pdf.setTextColor(17, 24, 39);
    pdf.setFont("helvetica", "normal");

    const row = [
      formatDate(trip.log_date),
      trip.source,
      trip.destination,
      trip.driver1,
      trip.driver2 || "-"
    ];

    row.forEach((value, columnIndex) => {
      const column = columns[columnIndex];
      const wrapped = pdf.splitTextToSize(String(value || "-"), column.width - 8);
      pdf.text(wrapped.slice(0, 2), column.x + 6, y);
    });

    y += rowHeight;
  });

  drawFooter();
  pdf.save(`TripReport_${sanitizePart(truckNumber)}_${fromDate || "All"}_to_${toDate || "All"}.pdf`);
}

export async function exportChallanPdf({
  slipNumber,
  truckNumber,
  account,
  product,
  tareWeight,
  netWeight,
  grossWeight,
  grossDateTime,
  tareDateTime
}) {
  const pdf = new jsPDF("p", "mm", "a4");
  const logoDataUrl = await loadLogoDataUrl();
  let y = 45;
  const labelX = 25;
  const valueX = 75;

  const row = (label, value) => {
    pdf.setFont("helvetica", "bold");
    pdf.text(label, labelX, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(String(value || ""), valueX, y);
    y += 7;
  };

  if (logoDataUrl) {
    pdf.addImage(logoDataUrl, "PNG", 22, 9, 22, 22);
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text("Santosh", 105, 18, { align: "center" });

  pdf.setFontSize(9);
  pdf.text("Fleet Challan", 105, 24, { align: "center" });
  pdf.text("Vehicle Dispatch Copy", 105, 29, { align: "center" });

  pdf.setLineWidth(0.6);
  pdf.line(20, 33, 190, 33);
  pdf.setFontSize(10);

  row("Slip Number", slipNumber);
  row("Truck Number", truckNumber);
  row("Account", String(account || "").toUpperCase());

  pdf.setFont("helvetica", "bold");
  pdf.text("Product", labelX, y);
  pdf.setFont("helvetica", "normal");
  pdf.text(String(product || "").toUpperCase(), valueX, y);
  y += 5;
  pdf.text("STOCK", valueX, y);
  y += 10;

  pdf.setFont("helvetica", "bold");
  pdf.text("Gross Weight", labelX, y);
  pdf.setFont("helvetica", "normal");
  pdf.text(String(grossWeight || ""), valueX, y);
  pdf.text(formatDateTime(grossDateTime), 120, y);

  y += 7;
  pdf.setFont("helvetica", "bold");
  pdf.text("Tare Weight", labelX, y);
  pdf.setFont("helvetica", "normal");
  pdf.text(String(tareWeight || ""), valueX, y);
  pdf.text(formatDateTime(tareDateTime), 120, y);

  y += 7;
  pdf.setFont("helvetica", "bold");
  pdf.text("Net Weight", labelX, y);
  pdf.setFont("helvetica", "normal");
  pdf.text(String(netWeight || ""), valueX, y);

  y += 12;
  pdf.setLineWidth(0.6);
  pdf.line(20, y, 190, y);

  pdf.setFont("helvetica", "normal");
  pdf.text("Operator Sign", 145, y - 5);

  pdf.save(`${sanitizePart(truckNumber)}_challan.pdf`);
}

function sanitizePart(value) {
  return String(value || "truck").replace(/[^a-z0-9-]+/gi, "_");
}

function loadLogoDataUrl() {
  if (logoDataUrlPromise) return logoDataUrlPromise;

  logoDataUrlPromise = fetch("/logo.png")
    .then((response) => {
      if (!response.ok) throw new Error("Logo not found");
      return response.blob();
    })
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Logo read failed"));
          reader.readAsDataURL(blob);
        })
    )
    .catch(() => "");

  return logoDataUrlPromise;
}

function formatDateTime(value) {
  if (!value) return "";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}
