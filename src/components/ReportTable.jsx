import { useState, useRef, useEffect, useCallback } from 'react';
import './ReportTable.css';

const SECTORS = ['General', 'Geo', 'Product Type', 'FICO'];

export default function ReportTable({ deals, groupedData, activeColumns }) {
  const [collapsed, setCollapsed] = useState({});
  const [offsets, setOffsets] = useState({ dealRow: 0, colRow: 0, mainHeader: 0, sectorHeader: 0 });
  const dealRowRef = useRef(null);
  const colRowRef = useRef(null);
  const mainHeaderRef = useRef(null);

  const measure = useCallback(() => {
    const dealH = dealRowRef.current?.offsetHeight || 0;
    const colH = colRowRef.current?.offsetHeight || 0;
    const mainH = mainHeaderRef.current?.offsetHeight || 0;
    setOffsets({
      dealRow: 0,
      colRow: dealH,
      mainHeader: dealH + colH,
      sectorHeader: dealH + colH + mainH,
    });
  }, []);

  useEffect(() => {
    measure();
  }, [deals, activeColumns, measure]);

  const toggleSector = (sector) => {
    setCollapsed((prev) => ({ ...prev, [sector]: !prev[sector] }));
  };

  const toggleAll = () => {
    setCollapsed((prev) => ({ ...prev, __all: !prev.__all }));
  };

  const isAllCollapsed = collapsed.__all;

  if (deals.length === 0) {
    return <div className="report-empty">Enter CUSIPs and click Run to view data.</div>;
  }

  const totalFieldCount = SECTORS.reduce(
    (sum, s) => sum + (groupedData[s]?.count || 0),
    0
  );

  return (
    <div className="report-table-wrapper">
      <table className="report-table">
        <thead>
          <tr className="header-deal-row" ref={dealRowRef}>
            <th className="col-sector" rowSpan={2} style={{ top: 0 }}></th>
            <th className="col-field-header" rowSpan={2} style={{ top: 0 }}></th>
            {deals.map((deal, dealIdx) => (
              <th
                key={deal.cusip}
                className={`col-deal-header${dealIdx > 0 ? ' deal-separator' : ''}`}
                colSpan={activeColumns.length}
                style={{ top: 0 }}
              >
                {deal.dealName}
              </th>
            ))}
          </tr>
          <tr className="header-col-row" ref={colRowRef}>
            {deals.map((deal, dealIdx) =>
              activeColumns.map((col, colIdx) => (
                <th
                  key={`${deal.cusip}-${col}`}
                  className={`col-value-header${dealIdx > 0 && colIdx === 0 ? ' deal-separator' : ''}`}
                  style={{ top: offsets.colRow }}
                >
                  {col}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          <tr className="section-header-main" onClick={toggleAll} ref={mainHeaderRef}>
            <td
              colSpan={2 + deals.length * activeColumns.length}
              style={{ top: offsets.mainHeader }}
            >
              <span className="collapse-icon">{isAllCollapsed ? '›' : '⌄'}</span>
              Collateral Characteristics ({totalFieldCount})
            </td>
          </tr>

          {!isAllCollapsed &&
            SECTORS.map((sector) => {
              const sectorData = groupedData[sector];
              if (!sectorData) return null;
              const isSectorCollapsed = collapsed[sector];

              return (
                <SectorSection
                  key={sector}
                  sector={sector}
                  sectorData={sectorData}
                  deals={deals}
                  activeColumns={activeColumns}
                  isCollapsed={isSectorCollapsed}
                  onToggle={() => toggleSector(sector)}
                  stickyTop={offsets.sectorHeader}
                />
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

function SectorSection({ sector, sectorData, deals, activeColumns, isCollapsed, onToggle, stickyTop }) {
  return (
    <>
      <tr className="section-header" onClick={onToggle}>
        <td
          colSpan={2 + deals.length * activeColumns.length}
          style={{ top: stickyTop }}
        >
          <span className="collapse-icon">{isCollapsed ? '›' : '⌄'}</span>
          {sector} ({sectorData.count})
        </td>
      </tr>
      {!isCollapsed &&
        sectorData.fields.map((fieldData, idx) => (
          <tr key={fieldData.field} className={idx % 2 === 0 ? 'row-even' : 'row-odd'}>
            <td className="col-sector"></td>
            <td className="col-field">{fieldData.field}</td>
            {deals.map((deal, dealIdx) => {
              const values = fieldData.deals[deal.cusip] || {};
              return activeColumns.map((col, colIdx) => (
                <td
                  key={`${deal.cusip}-${col}`}
                  className={`col-value${dealIdx > 0 && colIdx === 0 ? ' deal-separator' : ''}`}
                >
                  {values[col.toLowerCase()] || ''}
                </td>
              ));
            })}
          </tr>
        ))}
    </>
  );
}
