import Papa from 'papaparse';

export async function loadCollateralData() {
  const response = await fetch(`${import.meta.env.BASE_URL}Data/collateral_data.csv`);
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    });
  });
}
