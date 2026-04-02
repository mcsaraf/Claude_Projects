import './DownloadButton.css';

export default function DownloadButton({ onDownload }) {
  return (
    <button className="download-btn" onClick={onDownload}>
      Download
    </button>
  );
}
