import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ReportTable from './components/ReportTable';
import DownloadButton from './components/DownloadButton';
import { loadCollateralData } from './utils/csvLoader';
import {
  filterByCusips,
  getDeals,
  getReportDate,
  groupBySector,
  exportToCSV,
} from './utils/dataTransform';
import './App.css';

function App() {
  const [allData, setAllData] = useState([]);
  const [deals, setDeals] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [reportDate, setReportDate] = useState('');
  const [columns, setColumns] = useState(['Outstanding', 'Current']);
  const [hideNonOutstanding, setHideNonOutstanding] = useState(false);

  useEffect(() => {
    loadCollateralData().then(setAllData);
  }, []);

  const handleRun = (cusips) => {
    const filtered = filterByCusips(allData, cusips);
    setDeals(getDeals(filtered));
    setReportDate(getReportDate(filtered));
    setGroupedData(groupBySector(filtered));
  };

  const handleToggleHide = () => {
    setHideNonOutstanding((prev) => {
      const next = !prev;
      if (next) {
        setColumns(['Outstanding']);
      } else {
        setColumns(['Outstanding', 'Current']);
      }
      return next;
    });
  };

  const handleDownload = () => {
    const csv = exportToCSV(deals, groupedData, columns);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'collateral_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-layout">
      <div className="top-bar">
        <div className="top-bar-left">
          <span className="top-bar-title">LP Collateral Analytics</span>
        </div>
        <div className="top-bar-right"></div>
      </div>
      <div className="app-body">
        <Sidebar
          onRun={handleRun}
          columns={columns}
          onColumnsChange={setColumns}
          hideNonOutstanding={hideNonOutstanding}
          onToggleHide={handleToggleHide}
        />
        <div className="main-content">
          <div className="main-header">
            <div>
              <h1 className="main-title">LP Collateral Characteristics and Performance</h1>
              {reportDate && <div className="report-date">Report Date: {reportDate}</div>}
            </div>
            {deals.length > 0 && <DownloadButton onDownload={handleDownload} />}
          </div>
          <ReportTable
            deals={deals}
            groupedData={groupedData}
            activeColumns={columns}
            reportDate={reportDate}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
