'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Scan {
  id: string;
  file_name: string;
  file_key: string;
  scan_type: string;
  total_issues: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  status: string;
  initiated_by_name?: string;
  created_at: string;
  completed_at?: string;
}

export default function ScansPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/scans?limit=50');

      if (!response.ok) {
        throw new Error('Failed to fetch scans');
      }

      const data = await response.json();
      setScans(data.scans || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getScanTypeIcon = (type: string) => {
    return type === 'full_file' ? '📁' : '📄';
  };

  const stats = {
    total: scans.length,
    completed: scans.filter(s => s.status === 'completed').length,
    inProgress: scans.filter(s => s.status === 'in_progress').length,
    totalIssues: scans.reduce((sum, s) => sum + (s.total_issues || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scan History</h1>
              <p className="text-gray-600 mt-1">
                View all accessibility scans and their results
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              ← Back to Tools
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2">
            <Link
              href="/issues"
              className="px-6 py-4 font-medium text-sm border-b-4 border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              Issues
            </Link>
            <Link
              href="/files"
              className="px-6 py-4 font-medium text-sm border-b-4 border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              Files
            </Link>
            <Link
              href="/scans"
              className="px-6 py-4 font-medium text-sm border-b-4 border-blue-600 text-blue-600 bg-blue-50"
            >
              Scans
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Scans</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 shadow-sm border-2 border-green-200">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm border-2 border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 shadow-sm border-2 border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{stats.totalIssues}</div>
            <div className="text-sm text-gray-600">Issues Found</div>
          </div>
        </div>

        {/* Scans List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading scans...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">Error loading scans</p>
            <p className="text-red-600 text-sm mt-2">{error}</p>
            <button
              onClick={fetchScans}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : scans.length === 0 ? (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-12 text-center">
            <p className="text-lg text-gray-600 mb-2">No scans yet</p>
            <p className="text-sm text-gray-500">
              Run a scan in the Figma plugin to see history here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {scans.map((scan) => (
              <div
                key={scan.id}
                className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 hover:border-blue-300 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{getScanTypeIcon(scan.scan_type)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{scan.file_name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded border ${getStatusColor(scan.status)}`}>
                          {scan.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">
                          {scan.scan_type === 'full_file' ? 'Full File Scan' : 'Single Page Scan'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{scan.total_issues}</div>
                    <div className="text-xs text-gray-600">Issues Found</div>
                  </div>
                </div>

                {/* Issue Breakdown */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="bg-red-50 rounded p-2 text-center">
                    <div className="text-lg font-bold text-red-600">{scan.critical_count}</div>
                    <div className="text-xs text-gray-600">Critical</div>
                  </div>
                  <div className="bg-orange-50 rounded p-2 text-center">
                    <div className="text-lg font-bold text-orange-600">{scan.high_count}</div>
                    <div className="text-xs text-gray-600">High</div>
                  </div>
                  <div className="bg-yellow-50 rounded p-2 text-center">
                    <div className="text-lg font-bold text-yellow-600">{scan.medium_count}</div>
                    <div className="text-xs text-gray-600">Medium</div>
                  </div>
                  <div className="bg-blue-50 rounded p-2 text-center">
                    <div className="text-lg font-bold text-blue-600">{scan.low_count}</div>
                    <div className="text-xs text-gray-600">Low</div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="border-t pt-4 flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    {scan.initiated_by_name && <span>👤 {scan.initiated_by_name}</span>}
                    <span>🕐 {new Date(scan.created_at).toLocaleString()}</span>
                    {scan.completed_at && (
                      <span>
                        ✓ Completed in{' '}
                        {Math.round(
                          (new Date(scan.completed_at).getTime() - new Date(scan.created_at).getTime()) / 1000
                        )}s
                      </span>
                    )}
                  </div>
                  {scan.status === 'completed' && scan.total_issues > 0 && (
                    <Link
                      href={`/issues?scan_id=${scan.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Issues →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
