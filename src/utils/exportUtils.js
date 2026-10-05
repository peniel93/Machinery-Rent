import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Export array of objects to CSV file
export const exportToCSV = (filename, headers, rows) => {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(header => {
        const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export to PDF document
export const exportToPDF = (title, headers, rows) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.setTextColor(2, 132, 199);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

  const tableData = rows.map(row => headers.map(h => row[h] ?? ''));

  doc.autoTable({
    head: [headers.map(h => h.toUpperCase().replace(/_/g, ' '))],
    body: tableData,
    startY: 28,
    theme: 'grid',
    headStyles: { fillColor: [2, 132, 199], textColor: 255 },
    styles: { fontSize: 8, cellPadding: 3 }
  });

  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
};

// Export to Word document (.doc formatted HTML)
export const exportToWord = (filename, title, headers, rows) => {
  let html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><title>${title}</title><style>
    body { font-family: Arial, sans-serif; }
    h2 { color: #0284c7; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background-color: #0284c7; color: white; border: 1px solid #ccc; padding: 8px; text-align: left; }
    td { border: 1px solid #ccc; padding: 8px; }
  </style></head><body>
  <h2>${title}</h2>
  <p>Date: ${new Date().toLocaleString()}</p>
  <table>
    <thead><tr>${headers.map(h => `<th>${h.toUpperCase().replace(/_/g, ' ')}</th>`).join('')}</tr></thead>
    <tbody>
      ${rows.map(row => `<tr>${headers.map(h => `<td>${row[h] ?? ''}</td>`).join('')}</tr>`).join('')}
    </tbody>
  </table>
  </body></html>`;

  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Print table content in printable modal / window
export const printData = (title, headers, rows) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #0284c7; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
        th { background-color: #f0f9ff; color: #0369a1; }
        tr:nth-child(even) { background-color: #f8fafc; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Report Date: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h.toUpperCase().replace(/_/g, ' ')}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(row => `<tr>${headers.map(h => `<td>${row[h] ?? ''}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      <script>
        window.onload = function() { window.print(); window.close(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
