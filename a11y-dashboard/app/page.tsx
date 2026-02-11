'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ProjectSummary {
  id: string;
  file_key: string;
  file_name: string;
  file_url: string;
  last_scanned_at: string;
  total_issues: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  open_count: number;
  resolved_count: number;
}

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [figmaUrl, setFigmaUrl] = useState('');
  const [checkingUrl, setCheckingUrl] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectUrl, setNewProjectUrl] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/scans');

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();

      // Group by file to create project summaries
      const projectMap = new Map<string, ProjectSummary>();

      data.scans?.forEach((scan: any) => {
        const existing = projectMap.get(scan.file_key);

        if (existing) {
          existing.total_issues += scan.total_issues || 0;
          existing.critical_count += scan.critical_count || 0;
          existing.high_count += scan.high_count || 0;
          existing.medium_count += scan.medium_count || 0;
          existing.low_count += scan.low_count || 0;

          if (new Date(scan.created_at) > new Date(existing.last_scanned_at)) {
            existing.last_scanned_at = scan.created_at;
          }
        } else {
          projectMap.set(scan.file_key, {
            id: scan.file_id || scan.file_key,
            file_key: scan.file_key,
            file_name: scan.file_name,
            file_url: `https://www.figma.com/file/${scan.file_key}`,
            last_scanned_at: scan.created_at,
            total_issues: scan.total_issues || 0,
            critical_count: scan.critical_count || 0,
            high_count: scan.high_count || 0,
            medium_count: scan.medium_count || 0,
            low_count: scan.low_count || 0,
            open_count: 0,
            resolved_count: 0,
          });
        }
      });

      setProjects(Array.from(projectMap.values()).sort((a, b) =>
        new Date(b.last_scanned_at).getTime() - new Date(a.last_scanned_at).getTime()
      ));
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheck = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!figmaUrl.trim()) {
      alert('Please enter a Figma URL');
      return;
    }

    setCheckingUrl(true);

    try {
      // Extract file key from Figma URL
      const match = figmaUrl.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);

      if (!match) {
        alert('Invalid Figma URL. Please use a valid Figma file or design link.');
        return;
      }

      const fileKey = match[1];

      // Check if project already exists
      const existing = projects.find(p => p.file_key === fileKey);

      if (existing) {
        alert('This file has already been scanned. View it in the projects list below or run a new scan from the Figma plugin.');
        return;
      }

      // Guide user to use the plugin
      alert('To scan this Figma file:\n\n1. Open the file in Figma Desktop App\n2. Go to Plugins → A11y Checker\n3. Click "Scan Current Page" or "Scan Entire File"\n\nThe results will appear here automatically!');

    } catch (error) {
      alert('Error processing URL. Please try again.');
    } finally {
      setCheckingUrl(false);
    }
  };

  const handleNewProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProjectName.trim() || !newProjectUrl.trim()) {
      alert('Please provide both a project name and Figma URL');
      return;
    }

    // Extract file key from URL
    const match = newProjectUrl.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);

    if (!match) {
      alert('Invalid Figma URL. Please use a valid Figma file or design link.');
      return;
    }

    const fileKey = match[1];
    const existing = projects.find(p => p.file_key === fileKey);

    if (existing) {
      alert(`This file has already been scanned as "${existing.file_name}".\n\nView it in the projects list below or run a new scan from the Figma plugin.`);
      setShowNewProjectModal(false);
      setNewProjectName('');
      setNewProjectUrl('');
      return;
    }

    // Show instructions to scan
    alert(`Project "${newProjectName}" ready to scan!\n\nTo scan this Figma file:\n\n1. Open the file in Figma Desktop App\n2. Go to Plugins → A11y Checker\n3. Click "Scan Current Page" or "Scan Entire File"\n4. Results will appear here automatically!`);

    setShowNewProjectModal(false);
    setNewProjectName('');
    setNewProjectUrl('');
  };

  const handleGetPlugin = () => {
    const pluginPath = '/Users/ekosowski/Desktop/a11y/figma-plugin/manifest.json';
    alert(`📦 Load the A11y Checker Plugin:\n\n1. Open Figma Desktop App\n2. Go to Menu → Plugins → Development → Import plugin from manifest\n3. Select this file:\n   ${pluginPath}\n\n4. The plugin will appear in Plugins → Development → A11y Checker\n\nNote: Copy the file path above to load the plugin!`);
  };

  const stats = {
    totalProjects: projects.length,
    totalIssues: projects.reduce((sum, p) => sum + p.total_issues, 0),
    criticalIssues: projects.reduce((sum, p) => sum + p.critical_count, 0),
    openIssues: projects.reduce((sum, p) => sum + p.open_count, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Blue Line Assistant</h1>
              <p className="text-gray-600 mt-2 text-lg">
                Accessibility checking for Figma designs
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/tools"
                className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Tools
              </Link>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                + New Project
              </button>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" title="All systems operational" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section - Create New Project */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-12 mb-12 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Start Accessibility Check</h2>
            <p className="text-blue-100 text-lg mb-8">
              Scan your Figma designs for WCAG compliance issues including color contrast, text size, and touch targets.
            </p>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <form onSubmit={handleQuickCheck} className="space-y-4">
                <div>
                  <label htmlFor="figma-url" className="block text-sm font-medium text-gray-700 mb-2">
                    Figma File URL
                  </label>
                  <input
                    type="url"
                    id="figma-url"
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                    placeholder="https://www.figma.com/file/..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Paste a Figma file URL to check if it's been scanned
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={checkingUrl}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold text-lg"
                >
                  {checkingUrl ? 'Checking...' : 'Check Figma File'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3 font-medium">Or scan using the Figma plugin:</p>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li>1. Open your design in <span className="font-medium">Figma Desktop App</span></li>
                  <li>2. Go to <span className="font-medium">Plugins → A11y Checker</span></li>
                  <li>3. Click <span className="font-medium">"Scan Current Page"</span> or <span className="font-medium">"Scan Entire File"</span></li>
                  <li>4. Results appear here automatically!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200">
            <div className="text-3xl font-bold text-gray-900">{stats.totalProjects}</div>
            <div className="text-sm text-gray-600 mt-1">Projects</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-6 shadow-sm border-2 border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{stats.totalIssues}</div>
            <div className="text-sm text-gray-600 mt-1">Total Issues</div>
          </div>
          <div className="bg-red-50 rounded-xl p-6 shadow-sm border-2 border-red-200">
            <div className="text-3xl font-bold text-red-600">{stats.criticalIssues}</div>
            <div className="text-sm text-gray-600 mt-1">Critical</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-6 shadow-sm border-2 border-orange-200">
            <div className="text-3xl font-bold text-orange-600">{stats.openIssues}</div>
            <div className="text-sm text-gray-600 mt-1">Open Issues</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/issues"
            className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition group"
          >
            <div className="mb-4 group-hover:scale-110 transition">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">View All Issues</h3>
            <p className="text-gray-600 text-sm">Browse and filter accessibility issues across all projects</p>
          </Link>

          <Link
            href="/files"
            className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition group"
          >
            <div className="mb-4 group-hover:scale-110 transition">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Browse Files</h3>
            <p className="text-gray-600 text-sm">View all scanned Figma files and their metrics</p>
          </Link>

          <Link
            href="/tools"
            className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition group"
          >
            <div className="mb-4 group-hover:scale-110 transition">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Accessibility Tools</h3>
            <p className="text-gray-600 text-sm">Contrast checker, WCAG guidelines, annotations</p>
          </Link>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
            <Link
              href="/files"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4 flex justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xl text-gray-600 mb-2">No projects yet</p>
              <p className="text-gray-500 mb-6">
                Scan your first Figma file using the plugin to get started
              </p>
              <button
                onClick={() => {
                  const pluginPath = '/Users/ekosowski/Desktop/a11y/figma-plugin/manifest.json';
                  alert(`📦 Load the A11y Checker Plugin:\n\n1. Open Figma Desktop App\n2. Go to Menu → Plugins → Development → Import plugin from manifest\n3. Select this file:\n   ${pluginPath}\n\n4. The plugin will appear in Plugins → Development → A11y Checker\n\nNote: Copy the file path above to load the plugin!`);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Load Local Plugin
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {project.file_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Last scanned {new Date(project.last_scanned_at).toLocaleDateString()}
                      </p>
                    </div>
                    <a
                      href={project.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Open in Figma →
                    </a>
                  </div>

                  {/* Issue Summary */}
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    <div className="bg-gray-50 rounded p-3 text-center">
                      <div className="text-xl font-bold text-gray-900">{project.total_issues}</div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                    <div className="bg-red-50 rounded p-3 text-center">
                      <div className="text-xl font-bold text-red-600">{project.critical_count}</div>
                      <div className="text-xs text-gray-600">Critical</div>
                    </div>
                    <div className="bg-orange-50 rounded p-3 text-center">
                      <div className="text-xl font-bold text-orange-600">{project.high_count}</div>
                      <div className="text-xs text-gray-600">High</div>
                    </div>
                    <div className="bg-yellow-50 rounded p-3 text-center">
                      <div className="text-xl font-bold text-yellow-600">{project.medium_count}</div>
                      <div className="text-xs text-gray-600">Medium</div>
                    </div>
                    <div className="bg-blue-50 rounded p-3 text-center">
                      <div className="text-xl font-bold text-blue-600">{project.low_count}</div>
                      <div className="text-xs text-gray-600">Low</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/issues?file_key=${project.file_key}`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      View Issues
                    </Link>
                    <Link
                      href={`/scans?file_key=${project.file_key}`}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                    >
                      View Scans
                    </Link>
                  </div>
                </div>
              ))}

              {projects.length > 5 && (
                <div className="text-center pt-4">
                  <Link
                    href="/files"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All {projects.length} Projects →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">New Project</h2>
              <button
                onClick={() => {
                  setShowNewProjectModal(false);
                  setNewProjectName('');
                  setNewProjectUrl('');
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleNewProjectSubmit} className="space-y-6">
              <div>
                <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  id="project-name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., Homepage Redesign"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="project-url" className="block text-sm font-medium text-gray-700 mb-2">
                  Figma File URL
                </label>
                <input
                  type="url"
                  id="project-url"
                  value={newProjectUrl}
                  onChange={(e) => setNewProjectUrl(e.target.value)}
                  placeholder="https://www.figma.com/file/..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={handleGetPlugin}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                >
                  📦 Get Plugin
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Next Steps:</span>
                </p>
                <ol className="text-sm text-gray-600 space-y-1 ml-4 list-decimal">
                  <li>Create your project above</li>
                  <li>Load the plugin in Figma Desktop</li>
                  <li>Run a scan on your design</li>
                  <li>View results here!</li>
                </ol>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
