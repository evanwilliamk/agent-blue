'use client';

import { useState } from 'react';
import type { A11yIssue, IssueSeverity, IssueStatus } from '@/lib/types';

interface IssueTrackerProps {
  wcagGuidelines: { id: string; number: string; title: string }[];
}

export default function IssueTracker({ wcagGuidelines }: IssueTrackerProps) {
  const [issues, setIssues] = useState<A11yIssue[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IssueSeverity>('medium');
  const [component, setComponent] = useState('');
  const [figmaLink, setFigmaLink] = useState('');
  const [selectedGuidelines, setSelectedGuidelines] = useState<string[]>([]);
  const [assignee, setAssignee] = useState('');

  // Filter state
  const [filterStatus, setFilterStatus] = useState<IssueStatus | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<IssueSeverity | 'all'>('all');

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Issue title is required');
      return;
    }

    const newIssue: A11yIssue = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      severity,
      status: 'open',
      wcagGuidelines: selectedGuidelines,
      component: component.trim() || undefined,
      figmaLink: figmaLink.trim() || undefined,
      assignee: assignee.trim() || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setIssues([newIssue, ...issues]);

    // Reset form
    setTitle('');
    setDescription('');
    setSeverity('medium');
    setComponent('');
    setFigmaLink('');
    setSelectedGuidelines([]);
    setAssignee('');
    setIsCreating(false);
  };

  const updateIssueStatus = (issueId: string, newStatus: IssueStatus) => {
    setIssues(
      issues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              status: newStatus,
              updatedAt: new Date(),
              resolvedAt: newStatus === 'resolved' ? new Date() : undefined,
            }
          : issue
      )
    );
  };

  const deleteIssue = (issueId: string) => {
    if (confirm('Are you sure you want to delete this issue?')) {
      setIssues(issues.filter((issue) => issue.id !== issueId));
    }
  };

  const getSeverityColor = (sev: IssueSeverity) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getStatusColor = (stat: IssueStatus) => {
    switch (stat) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'wont-fix':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || issue.severity === filterSeverity;
    return matchesStatus && matchesSeverity;
  });

  const issueStats = {
    total: issues.length,
    open: issues.filter((i) => i.status === 'open').length,
    inProgress: issues.filter((i) => i.status === 'in-progress').length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
    critical: issues.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length,
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Issue Tracker</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          {isCreating ? 'Cancel' : '+ New Issue'}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{issueStats.total}</div>
          <div className="text-sm text-gray-600">Total Issues</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{issueStats.open}</div>
          <div className="text-sm text-gray-600">Open</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{issueStats.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{issueStats.resolved}</div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{issueStats.critical}</div>
          <div className="text-sm text-gray-600">Critical</div>
        </div>
      </div>

      {/* Create Issue Form */}
      {isCreating && (
        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Create New Issue</h3>
          <form onSubmit={handleCreateIssue} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="issue-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="issue-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Button missing accessible label"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <select
                  id="severity"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label htmlFor="issue-component" className="block text-sm font-medium text-gray-700 mb-2">
                  Component
                </label>
                <input
                  type="text"
                  id="issue-component"
                  value={component}
                  onChange={(e) => setComponent(e.target.value)}
                  placeholder="e.g., Navigation Bar"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="issue-figma" className="block text-sm font-medium text-gray-700 mb-2">
                  Figma Link
                </label>
                <input
                  type="url"
                  id="issue-figma"
                  value={figmaLink}
                  onChange={(e) => setFigmaLink(e.target.value)}
                  placeholder="https://figma.com/..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="issue-assignee" className="block text-sm font-medium text-gray-700 mb-2">
                  Assignee
                </label>
                <input
                  type="text"
                  id="issue-assignee"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="issue-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="issue-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the accessibility issue..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related WCAG Guidelines
                </label>
                <div className="max-h-40 overflow-y-auto border-2 border-gray-300 rounded-lg p-3 space-y-2">
                  {wcagGuidelines.slice(0, 10).map((guideline) => (
                    <label key={guideline.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedGuidelines.includes(guideline.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGuidelines([...selectedGuidelines, guideline.id]);
                          } else {
                            setSelectedGuidelines(selectedGuidelines.filter((id) => id !== guideline.id));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-gray-700">
                        {guideline.number} - {guideline.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Create Issue
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            id="filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="wont-fix">Won&apos;t Fix</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-severity" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Severity
          </label>
          <select
            id="filter-severity"
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as any)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">
              {issues.length === 0 ? 'No issues yet.' : 'No issues match your filters.'}
            </p>
            {issues.length === 0 && (
              <button
                onClick={() => setIsCreating(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first issue
              </button>
            )}
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div key={issue.id} className="border-2 border-gray-200 rounded-lg p-5 hover:border-blue-300 transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded border ${getSeverityColor(issue.severity)}`}>
                      {issue.severity.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded ${getStatusColor(issue.status)}`}>
                      {issue.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{issue.title}</h3>
                  {issue.description && <p className="text-sm text-gray-600 mb-2">{issue.description}</p>}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {issue.component && <span>📦 {issue.component}</span>}
                    {issue.assignee && <span>👤 {issue.assignee}</span>}
                    {issue.figmaLink && (
                      <a href={issue.figmaLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        🔗 Figma
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteIssue(issue.id)}
                  className="text-red-600 hover:text-red-700 text-xl ml-4"
                  aria-label="Delete issue"
                >
                  ×
                </button>
              </div>

              <div className="flex gap-2">
                {(['open', 'in-progress', 'resolved', 'wont-fix'] as IssueStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateIssueStatus(issue.id, status)}
                    disabled={issue.status === status}
                    className={`px-3 py-1 text-xs font-medium rounded transition ${
                      issue.status === status
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'wont-fix' ? "Won't Fix" : status.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
