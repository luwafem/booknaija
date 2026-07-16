import ExportButton from './ExportButton';

export default function ReportsTab({
  reportStart, setReportStart,
  reportEnd, setReportEnd,
  reportMetrics, setReportMetrics,
  generateReport, reportResult, exportCSV,
}) {
  const metricsList = ['businesses', 'revenue', 'affiliates'];

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Custom Report</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400">Start Date</label>
              <input
                type="date"
                value={reportStart}
                onChange={(e) => setReportStart(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400">End Date</label>
              <input
                type="date"
                value={reportEnd}
                onChange={(e) => setReportEnd(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400">Metrics</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {metricsList.map(m => (
                <label key={m} className="flex items-center gap-1 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={reportMetrics.includes(m)}
                    onChange={() => {
                      if (reportMetrics.includes(m)) {
                        setReportMetrics(reportMetrics.filter(x => x !== m));
                      } else {
                        setReportMetrics([...reportMetrics, m]);
                      }
                    }}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-purple-600"
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={generateReport}
            className="w-full bg-white text-zinc-900 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-200"
          >
            Generate Report
          </button>
        </div>
      </div>

      {reportResult && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Report Results</h3>
          <div className="space-y-2">
            {Object.entries(reportResult.report).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-zinc-800 py-2">
                <span className="text-zinc-300">{key}</span>
                <span className="text-white font-bold">{value}</span>
              </div>
            ))}
            <div className="text-xs text-zinc-400 mt-2">
              Period: {new Date(reportResult.startDate).toLocaleDateString()} – {new Date(reportResult.endDate).toLocaleDateString()}
            </div>
          </div>
          <ExportButton onClick={() => exportCSV([reportResult.report], 'custom_report.csv')} />
        </div>
      )}
    </div>
  );
}