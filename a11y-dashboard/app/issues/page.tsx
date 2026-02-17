'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Issue {
  id: string;
  element_name: string;
  category: string;
  severity: string;
  status: string;
  wcag_criteria: string;
  wcag_level: string;
  description: string;
  current_value: string;
  required_value: string;
  page_name: string;
  file_name: string;
  file_key: string;
  assigned_to_name?: string;
  comment_count: number;
  created_at: string;
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [principleFilter, setPrincipleFilter] = useState('all');

  // Fetch issues
  useEffect(() => {
    fetchIssues();
  }, [statusFilter, severityFilter, categoryFilter]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      // Request all issues (increase limit to 10000)
      params.append('limit', '10000');

      const response = await fetch(`/api/issues?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch issues');
      }

      const data = await response.json();
      setIssues(data.issues || []);
      setTotal(data.total || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-50 text-red-700';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700';
      case 'resolved':
        return 'bg-green-50 text-green-700';
      case 'wont_fix':
        return 'bg-gray-50 text-gray-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'contrast':
        return '🎨';
      case 'text_size':
        return '📏';
      case 'touch_target':
        return '👆';
      case 'heading_structure':
        return '📑';
      case 'keyboard':
        return '⌨️';
      case 'semantics':
        return '🏷️';
      default:
        return '⚠️';
    }
  };

  // WCAG Principle mapping
  const getWCAGPrinciple = (criteria: string) => {
    if (!criteria) return 'Unknown';
    const num = parseFloat(criteria);
    if (num >= 1.0 && num < 2.0) return 'Perceivable';
    if (num >= 2.0 && num < 3.0) return 'Operable';
    if (num >= 3.0 && num < 4.0) return 'Understandable';
    if (num >= 4.0 && num < 5.0) return 'Robust';
    return 'Unknown';
  };

  // Group issues by WCAG principle
  const issuesByPrinciple = {
    Perceivable: issues.filter(i => getWCAGPrinciple(i.wcag_criteria) === 'Perceivable'),
    Operable: issues.filter(i => getWCAGPrinciple(i.wcag_criteria) === 'Operable'),
    Understandable: issues.filter(i => getWCAGPrinciple(i.wcag_criteria) === 'Understandable'),
    Robust: issues.filter(i => getWCAGPrinciple(i.wcag_criteria) === 'Robust'),
    Unknown: issues.filter(i => getWCAGPrinciple(i.wcag_criteria) === 'Unknown'),
  };

  const stats = {
    total: issues.length,
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    open: issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Issues Dashboard</h1>
              <p className="text-gray-600 mt-1">
                View and manage accessibility issues from Figma scans
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
              className="px-6 py-4 font-medium text-sm border-b-4 border-blue-600 text-blue-600 bg-blue-50"
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
              className="px-6 py-4 font-medium text-sm border-b-4 border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              Scans
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Issues</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 shadow-sm border-2 border-red-200">
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 shadow-sm border-2 border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
            <div className="text-sm text-gray-600">High</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 shadow-sm border-2 border-red-200">
            <div className="text-2xl font-bold text-red-600">{stats.open}</div>
            <div className="text-sm text-gray-600">Open</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm border-2 border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
        </div>

        {/* WCAG Principles */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">📋 Issues by WCAG Principle</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{issuesByPrinciple.Perceivable.length}</div>
              <div className="text-sm text-gray-600">1. Perceivable</div>
              <div className="text-xs text-gray-500 mt-1">Content must be perceivable</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{issuesByPrinciple.Operable.length}</div>
              <div className="text-sm text-gray-600">2. Operable</div>
              <div className="text-xs text-gray-500 mt-1">UI must be operable</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
              <div className="text-2xl font-bold text-green-600">{issuesByPrinciple.Understandable.length}</div>
              <div className="text-sm text-gray-600">3. Understandable</div>
              <div className="text-xs text-gray-500 mt-1">Content must be understandable</div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
              <div className="text-2xl font-bold text-indigo-600">{issuesByPrinciple.Robust.length}</div>
              <div className="text-sm text-gray-600">4. Robust</div>
              <div className="text-xs text-gray-500 mt-1">Compatible with tech</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Filters</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="wont_fix">Won't Fix</option>
              </select>
            </div>

            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <select
                id="severity"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="contrast">Color Contrast</option>
                <option value="text_size">Text Size</option>
                <option value="touch_target">Touch Target</option>
                <option value="heading_structure">Heading Structure</option>
                <option value="keyboard">Keyboard</option>
                <option value="semantics">Semantics</option>
              </select>
            </div>

            <div>
              <label htmlFor="principle" className="block text-sm font-medium text-gray-700 mb-2">
                WCAG Principle
              </label>
              <select
                id="principle"
                value={principleFilter}
                onChange={(e) => setPrincipleFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Principles</option>
                <option value="Perceivable">1. Perceivable</option>
                <option value="Operable">2. Operable</option>
                <option value="Understandable">3. Understandable</option>
                <option value="Robust">4. Robust</option>
              </select>
            </div>
          </div>
        </div>

        {/* Issues List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading issues...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">Error loading issues</p>
            <p className="text-red-600 text-sm mt-2">{error}</p>
            <button
              onClick={fetchIssues}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-12 text-center">
            <p className="text-lg text-gray-600 mb-2">No issues found</p>
            <p className="text-sm text-gray-500">
              {statusFilter !== 'all' || severityFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Run a scan in the Figma plugin to see issues here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues
              .filter(i => principleFilter === 'all' || getWCAGPrinciple(i.wcag_criteria) === principleFilter)
              .map((issue) => (
              <Link
                key={issue.id}
                href={`/issues/${issue.id}`}
                className="block bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`px-3 py-1 text-xs font-semibold rounded border ${getSeverityColor(issue.severity)}`}>
                          {issue.severity.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {issue.wcag_criteria && (
                          <span className="px-3 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
                            WCAG {issue.wcag_criteria} ({issue.wcag_level})
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{issue.element_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                  <div className="flex items-center gap-4">
                    <span>📁 {issue.file_name}</span>
                    <span>📄 {issue.page_name}</span>
                    {issue.current_value && (
                      <span>Current: {issue.current_value} → Required: {issue.required_value}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {issue.assigned_to_name && <span>👤 {issue.assigned_to_name}</span>}
                    {issue.comment_count > 0 && <span>💬 {issue.comment_count}</span>}
                    <span className="text-xs">{new Date(issue.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
