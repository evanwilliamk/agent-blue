'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface IssueDetail {
  issue: {
    id: string;
    element_name: string;
    element_id: string;
    category: string;
    severity: string;
    status: string;
    wcag_criteria: string;
    wcag_level: string;
    description: string;
    current_value: string;
    required_value: string;
    fix_recommendation: string;
    screenshot_url?: string;
    location_x?: number;
    location_y?: number;
    frame_name: string;
    page_name: string;
    file_name: string;
    file_key: string;
    file_url: string;
    assigned_to_name?: string;
    created_at: string;
    updated_at: string;
  };
  comments: Array<{
    id: string;
    user_name: string;
    content: string;
    created_at: string;
  }>;
  annotations: Array<{
    id: string;
    annotation_type: string;
    title: string;
    description: string;
    created_by_name: string;
    created_at: string;
  }>;
}

export default function IssueDetailPage() {
  const params = useParams();
  const issue_id = params.issue_id as string;

  const [data, setData] = useState<IssueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    fetchIssueDetail();
  }, [issue_id]);

  const fetchIssueDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/issues/${issue_id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch issue');
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateIssueStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/issues/${issue_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await fetchIssueDetail();
    } catch (err) {
      alert('Error updating status: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setUpdating(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      setAddingComment(true);
      const response = await fetch(`/api/issues/${issue_id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          user_name: 'Anonymous' // In a real app, this would come from auth
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      setNewComment('');
      await fetchIssueDetail(); // Refresh to show new comment
    } catch (err) {
      alert('Error adding comment: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setAddingComment(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-medium">Error loading issue</p>
          <p className="text-red-600 text-sm mt-2">{error}</p>
          <Link
            href="/issues"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Back to Issues
          </Link>
        </div>
      </div>
    );
  }

  const { issue, comments, annotations } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/issues"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block"
              >
                ← Back to Issues
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{issue.element_name}</h1>
              <p className="text-gray-600 mt-1">{issue.description}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Details */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-3 py-1 text-sm font-semibold rounded border ${getSeverityColor(issue.severity)}`}>
                  {issue.severity.toUpperCase()}
                </span>
                <span className={`px-3 py-1 text-sm font-semibold rounded ${getStatusColor(issue.status)}`}>
                  {issue.status.replace('_', ' ').toUpperCase()}
                </span>
                {issue.wcag_criteria && (
                  <span className="px-3 py-1 text-sm font-semibold rounded bg-purple-100 text-purple-800 border border-purple-300">
                    WCAG {issue.wcag_criteria} ({issue.wcag_level})
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Description</h3>
                  <p className="text-gray-900">{issue.description}</p>
                </div>

                {issue.current_value && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">Current Value</h3>
                      <p className="text-red-600 font-mono">{issue.current_value}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">Required Value</h3>
                      <p className="text-green-600 font-mono">{issue.required_value}</p>
                    </div>
                  </div>
                )}

                {issue.fix_recommendation && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Recommendation</h3>
                    <p className="text-blue-800">{issue.fix_recommendation}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Location</h3>
                  <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>📁 File: {issue.file_name}</div>
                    <div>📄 Page: {issue.page_name}</div>
                    <div>🖼️ Frame: {issue.frame_name}</div>
                    {issue.location_x !== undefined && issue.location_y !== undefined && (
                      <div>📍 Position: ({issue.location_x}, {issue.location_y})</div>
                    )}
                  </div>
                  {issue.file_url && (
                    <a
                      href={issue.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Open in Figma →
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Comments ({comments.length})
              </h2>
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm mb-4">No comments yet</p>
              ) : (
                <div className="space-y-4 mb-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-l-4 border-blue-200 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{comment.user_name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Form */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">💬 Add Comment</h3>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add your comment or annotation..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
                <button
                  onClick={addComment}
                  disabled={addingComment || !newComment.trim()}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {addingComment ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
            </div>

            {/* Annotations */}
            {annotations.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Annotations ({annotations.length})
                </h2>
                <div className="space-y-4">
                  {annotations.map((annotation) => (
                    <div key={annotation.id} className="border-l-4 border-purple-200 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{annotation.title}</span>
                        <span className="text-xs text-gray-500">
                          {annotation.annotation_type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{annotation.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        By {annotation.created_by_name} on{' '}
                        {new Date(annotation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Actions */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
              <div className="space-y-2">
                {['open', 'in_progress', 'resolved', 'wont_fix'].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateIssueStatus(status)}
                    disabled={updating || issue.status === status}
                    className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition ${
                      issue.status === status
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    {status === 'wont_fix'
                      ? "Won't Fix"
                      : status.replace('_', ' ').charAt(0).toUpperCase() +
                        status.replace('_', ' ').slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-600">Element ID</dt>
                  <dd className="text-gray-900 font-mono text-xs">{issue.element_id}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Category</dt>
                  <dd className="text-gray-900 capitalize">{issue.category.replace('_', ' ')}</dd>
                </div>
                {issue.assigned_to_name && (
                  <div>
                    <dt className="text-gray-600">Assigned To</dt>
                    <dd className="text-gray-900">{issue.assigned_to_name}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-gray-600">Created</dt>
                  <dd className="text-gray-900">{new Date(issue.created_at).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Updated</dt>
                  <dd className="text-gray-900">{new Date(issue.updated_at).toLocaleString()}</dd>
                </div>
              </dl>
            </div>

            {/* WCAG Reference */}
            {issue.wcag_criteria && (
              <div className="bg-purple-50 rounded-lg border-2 border-purple-200 p-6">
                <h2 className="text-lg font-semibold text-purple-900 mb-2">WCAG Guideline</h2>
                <p className="text-sm text-purple-800 mb-4">
                  {issue.wcag_criteria} - Level {issue.wcag_level}
                </p>
                <Link
                  href={`/?tab=guidelines&search=${issue.wcag_criteria}`}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  View Guideline Details →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
