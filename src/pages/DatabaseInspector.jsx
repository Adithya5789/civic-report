import React, { useState, useEffect } from 'react';
import { Database, Table, Search, Download, AlertCircle, RefreshCw, ChevronRight, ChevronDown } from 'lucide-react';

const DatabaseInspector = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingRows, setFetchingRows] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const API_BASE = '/api';

  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/tables`);
      if (!res.ok) throw new Error('Failed to fetch tables');
      const data = await res.json();
      setTables(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRows = async (tableName) => {
    setFetchingRows(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/tables/${tableName}`);
      if (!res.ok) throw new Error(`Failed to fetch rows for ${tableName}`);
      const data = await res.json();
      setRows(data);
      setSelectedTable(tableName);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetchingRows(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const COLUMN_MAPPING = {
    issues: {
      id: 'traking id',
      reporter_name: 'user name',
      reporter_phone: 'phone number',
      title: 'issue',
      status: 'status',
      assigned_to: 'worker',
      created_at: 'issed date',
      updated_at: 'solved date'
    }
  };

  const getVisibleColumns = (tableName, allDataRows) => {
    const mapping = COLUMN_MAPPING[tableName];
    if (!mapping) {
      if (allDataRows.length === 0) return [];
      return Object.keys(allDataRows[0]).map(key => ({ key, label: key.replace(/_/g, ' ') }));
    }
    
    // For whitelisted tables, always show these columns regardless of row data existence
    return Object.keys(mapping).map(key => ({ key, label: mapping[key] }));
  };

  const visibleColumns = getVisibleColumns(selectedTable, rows);

  const filteredRows = rows.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const exportCSV = () => {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-slate-500 font-medium">Initializing Database Inspector...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <Database className="w-8 h-8 mr-3 text-blue-600" /> Database Inspector
          </h1>
          <p className="text-slate-500 mt-1">Direct tabular access to system records.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchTables}
            className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
            title="Refresh Schema"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center animate-in slide-in-from-top duration-300">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table List Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest px-2">System Tables</h3>
          <div className="space-y-1">
            {tables.map(t => (
              <button
                key={t.name}
                onClick={() => fetchRows(t.name)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  selectedTable === t.name 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center">
                  <Table className={`w-4 h-4 mr-3 ${selectedTable === t.name ? 'text-blue-200' : 'text-slate-400'}`} />
                  <span className="font-medium text-sm">{t.name}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                   selectedTable === t.name ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Data Grid Area */}
        <div className="lg:col-span-3">
          {!selectedTable ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-20 text-center">
              <Table className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600">No Table Selected</h3>
              <p className="text-slate-400 max-w-xs mx-auto mt-2">Choose a table from the sidebar to inspect its raw tabular data.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[700px]">
              {/* Toolbar */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Search ${selectedTable}...`}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <button 
                      onClick={exportCSV}
                      disabled={rows.length === 0}
                      className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" /> Export
                    </button>
                    <button 
                      onClick={() => fetchRows(selectedTable)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <RefreshCw className={`w-4 h-4 ${fetchingRows ? 'animate-spin' : ''}`} />
                    </button>
                </div>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-auto">
                {fetchingRows ? (
                  <div className="flex justify-center py-20">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : filteredRows.length === 0 ? (
                  <div className="p-20 text-center text-slate-400">
                    No results matching "{searchTerm}"
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-sm z-10 border-b border-slate-200">
                      <tr>
                        {visibleColumns.map(col => (
                          <th key={col.key} className="px-4 py-3 text-[10px] font-bold text-slate-500 tracking-widest truncate max-w-[150px]">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                          {visibleColumns.map(col => (
                            <td key={col.key} className="px-4 py-3 text-sm text-slate-600 truncate max-w-[200px]" title={String(row[col.key])}>
                              {row[col.key] === null ? (
                                <span className="text-slate-300 italic">null</span>
                              ) : (col.key === 'created_at' || col.key === 'updated_at') ? (
                                new Date(row[col.key]).toLocaleDateString()
                              ) : typeof row[col.key] === 'string' && row[col.key].length > 50 ? (
                                `${row[col.key].substring(0, 50)}...`
                              ) : String(row[col.key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Info Bar */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                <span>Showing {filteredRows.length} of {rows.length} records</span>
                <span>Active Table: {selectedTable}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseInspector;
