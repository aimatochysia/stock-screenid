
export function downloadCSV(data, filename = 'stock-data.csv') {
  if (!data || data.length === 0) {
    console.warn('No data to download');
    return;
  }

  const allKeys = new Set();
  data.forEach(row => {
    Object.keys(row).forEach(key => allKeys.add(key));
  });

  const headers = Array.from(allKeys);
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];


      if (value == null) return '';


      if (typeof value === 'string') {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }


      if (typeof value === 'number') {
        return value.toString();
      }


      return String(value);
    }).join(',');
  });


  const csvContent = [csvHeaders, ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    alert('CSV download is not supported in your browser. Please use a modern browser or copy the data manually.');
    console.warn('CSV download is not supported in this browser.');
  }
}


export async function downloadLatestDataCSV() {
  try {
    const response = await fetch('https://stock-results.vercel.app/api/technical/latest');
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    const flatData = Object.entries(data).map(([symbol, values]) => ({
      symbol: symbol.replace('.json', ''),
      ...values
    }));

    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(flatData, `stock-data-${timestamp}.csv`);

    return true;
  } catch (error) {
    console.error('Error downloading CSV:', error);
    throw error;
  }
}
