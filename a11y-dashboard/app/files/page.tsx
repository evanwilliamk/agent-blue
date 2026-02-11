'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FigmaFile {
  id: string;
  file_key: string;
  file_name: string;
  file_url: string;
  last_scanned_at: string;
  created_at: string;
  scan_count: number;
  total_issues: number;
  critical_count: number;
  high_count: number;
  open_count: number;
}

export default function FilesPage() {
  const [files, setFiles] = useState<FigmaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);

      // Fetch files via scans API (grouped by file)
      const response = await fetch('/api/scans');

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data = await response.json();

      // Group scans by file
      const fileMap = new Map<string, FigmaFile>();

      data.scans?.forEach((scan: any) => {
        const existing = fileMap.get(scan.file_key);

        if (existing) {
          existing.scan_count++;
          existing.total_issues += scan.total_issues || 0;
          existing.critical_count += scan.critical_count || 0;
          existing.high_count += scan.high_count || 0;
          // Update last scanned if more recent
          if (new Date(scan.created_at) > new Date(existing.last_scanned_at)) {
            existing.last_scanned_at = scan.created_at;
          }
        } else {
          fileMap.set(scan.file_key, {
            id: scan.file_id,
            file_key: scan.file_key,
            file_name: scan.file_name,
            file_url: `https://www.figma.com/file/${scan.file_key}`,
            last_scanned_at: scan.created_at,
            created_at: scan.created_at,
            scan_count: 1,
            total_issues: scan.total_issues || 0,
            critical_count: scan.critical_count || 0,
            high_count: scan.high_count || 0,
            open_count: 0, // Would need additional query
          });
        }
      });

      setFiles(Array.from(fileMap.values()).sort((a, b) =>
        new Date(b.last_scanned_at).getTime() - new Date(a.last_scanned_at).getTime()
      ));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const totalIssues = files.reduce((sum, f) => sum + f.total_issues, 0);
  const totalCritical = files.reduce((sum, f) => sum + f.critical_count, 0);
  const totalHigh = files.reduce((sum, f) => sum + f.high_count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Figma Files</h1>
              <p className="text-gray-600 mt-1">
                View all scanned Figma files and their accessibility status
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
              className="px-6 py-4 font-medium text-sm border-b-4 border-blue-600 text-blue-600 bg-blue-50"
            >
              Files
            </Link>
            <Link
              href="/scans"
              className="px-6 py-4 font-medium text-sm border-b-4 border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
            <div className="text-2xl font-bold text-gray-900">{files.length}</div>
            <div className="text-sm text-gray-600">Total Files</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm border-2 border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{totalIssues}</div>
            <div className="text-sm text-gray-600">Total Issues</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 shadow-sm border-2 border-red-200">
            <div className="text-2xl font-bold text-red-600">{totalCritical}</div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 shadow-sm border-2 border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{totalHigh}</div>
            <div className="text-sm text-gray-600">High</div>
          </div>
        </div>

        {/* Files List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading files...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">Error loading files</p>
            <p className="text-red-600 text-sm mt-2">{error}</p>
            <button
              onClick={fetchFiles}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : files.length === 0 ? (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-12 text-center">
            <p className="text-lg text-gray-600 mb-2">No files scanned yet</p>
            <p className="text-sm text-gray-500">
              Run a scan in the Figma plugin to see files here
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {file.file_name}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">{file.file_key}</p>
                  </div>
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Open in Figma →
                  </a>
                </div>

                {/* Issue Summary */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-50 rounded p-3 text-center">
                    <div className="text-xl font-bold text-gray-900">{file.total_issues}</div>
                    <div className="text-xs text-gray-600">Total Issues</div>
                  </div>
                  <div className="bg-red-50 rounded p-3 text-center">
                    <div className="text-xl font-bold text-red-600">{file.critical_count}</div>
                    <div className="text-xs text-gray-600">Critical</div>
                  </div>
                  <div className="bg-orange-50 rounded p-3 text-center">
                    <div className="text-xl font-bold text-orange-600">{file.high_count}</div>
                    <div className="text-xs text-gray-600">High</div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Scans</span>
                    <span className="font-medium text-gray-900">{file.scan_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Scanned</span>
                    <span className="font-medium text-gray-900">
                      {new Date(file.last_scanned_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>First Scanned</span>
                    <span className="font-medium text-gray-900">
                      {new Date(file.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Link
                    href={`/issues?file_id=${file.id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    View Issues
                  </Link>
                  <Link
                    href={`/scans?file_id=${file.id}`}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                  >
                    View Scans
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
