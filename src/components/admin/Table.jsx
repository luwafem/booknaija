export default function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="text-left py-3 px-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors">
              {row.cells.map((cell, j) => (
                <td key={j} className="py-3 px-2">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}