const SECTOR_FIELDS = {
  General: 15,
  Geo: 5,
  'Product Type': 6,
  FICO: 4,
};

export function filterByCusips(data, cusips) {
  const cusipSet = new Set(cusips.map((c) => c.trim().toUpperCase()));
  return data.filter((row) => cusipSet.has(row.cusip.toUpperCase()));
}

export function getDeals(filteredData) {
  const dealMap = new Map();
  for (const row of filteredData) {
    if (!dealMap.has(row.cusip)) {
      dealMap.set(row.cusip, row.deal_name);
    }
  }
  return Array.from(dealMap.entries()).map(([cusip, dealName]) => ({
    cusip,
    dealName,
  }));
}

export function getReportDate(filteredData) {
  if (filteredData.length > 0) {
    return filteredData[0].report_date;
  }
  return '';
}

export function groupBySector(filteredData) {
  const sectors = ['General', 'Geo', 'Product Type', 'FICO'];
  const grouped = {};

  for (const sector of sectors) {
    const sectorRows = filteredData.filter((row) => row.sector === sector);
    const fieldMap = new Map();

    for (const row of sectorRows) {
      const key = row.field;
      if (!fieldMap.has(key)) {
        fieldMap.set(key, { field: key, fieldOrder: parseInt(row.field_order), deals: {} });
      }
      const entry = fieldMap.get(key);
      entry.deals[row.cusip] = {
        outstanding: row.outstanding,
        current: row.current,
        delinquent: row.delinquent,
        prepaid: row.prepaid,
        defaulted: row.defaulted,
      };
    }

    const fields = Array.from(fieldMap.values()).sort((a, b) => a.fieldOrder - b.fieldOrder);
    grouped[sector] = {
      count: SECTOR_FIELDS[sector] || fields.length,
      fields,
    };
  }

  return grouped;
}

export function exportToCSV(deals, groupedData, activeColumns) {
  const headers = ['Sector', 'Field'];
  for (const deal of deals) {
    for (const col of activeColumns) {
      headers.push(`${deal.dealName} - ${col}`);
    }
  }

  const rows = [headers.join(',')];

  for (const [sector, { fields }] of Object.entries(groupedData)) {
    for (const fieldData of fields) {
      const row = [sector, `"${fieldData.field}"`];
      for (const deal of deals) {
        const values = fieldData.deals[deal.cusip] || {};
        for (const col of activeColumns) {
          row.push(values[col.toLowerCase()] || '');
        }
      }
      rows.push(row.join(','));
    }
  }

  return rows.join('\n');
}
