'use client';

import { useState, useMemo } from 'react';
import type { WCAGGuideline } from '@/lib/types';

interface GuidelinesBrowserProps {
  guidelines: WCAGGuideline[];
}

export default function GuidelinesBrowser({ guidelines }: GuidelinesBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'A' | 'AA' | 'AAA'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    guidelines.forEach((g) => g.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [guidelines]);

  // Filter guidelines
  const filteredGuidelines = useMemo(() => {
    return guidelines.filter((guideline) => {
      const matchesSearch =
        searchQuery === '' ||
        guideline.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guideline.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guideline.number.includes(searchQuery);

      const matchesLevel = selectedLevel === 'all' || guideline.level === selectedLevel;

      const matchesTag = selectedTag === 'all' || guideline.tags.includes(selectedTag);

      return matchesSearch && matchesLevel && matchesTag;
    });
  }, [guidelines, searchQuery, selectedLevel, selectedTag]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'A':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'AA':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'AAA':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">WCAG Guidelines Reference</h2>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Guidelines
          </label>
          <input
            type="search"
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, or number..."
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Level and Tag Filters */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
              WCAG Level
            </label>
            <select
              id="level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as any)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="A">Level A (Minimum)</option>
              <option value="AA">Level AA (Recommended)</option>
              <option value="AAA">Level AAA (Enhanced)</option>
            </select>
          </div>

          <div>
            <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="tag"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredGuidelines.length} of {guidelines.length} guidelines
      </div>

      {/* Guidelines List */}
      <div className="space-y-4">
        {filteredGuidelines.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No guidelines found matching your filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLevel('all');
                setSelectedTag('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          filteredGuidelines.map((guideline) => {
            const isExpanded = expandedId === guideline.id;

            return (
              <div
                key={guideline.id}
                className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : guideline.id)}
                  className="w-full px-6 py-4 flex items-start justify-between text-left hover:bg-gray-50 transition"
                  aria-expanded={isExpanded}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-bold text-gray-600">
                        {guideline.number}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded border ${getLevelColor(
                          guideline.level
                        )}`}
                      >
                        {guideline.level}
                      </span>
                      {guideline.version === '2.2' && (
                        <span className="px-2 py-1 text-xs font-semibold rounded border bg-yellow-100 text-yellow-800 border-yellow-300">
                          WCAG 2.2
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{guideline.title}</h3>
                    <p className="text-sm text-gray-600">{guideline.description}</p>
                  </div>
                  <div className="ml-4 text-2xl text-gray-400">{isExpanded ? '−' : '+'}</div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 bg-gray-50 border-t-2 border-gray-200">
                    {/* How to Meet */}
                    <div className="mb-6 mt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">✓ How to Meet</h4>
                      <ul className="space-y-2">
                        {guideline.howToMeet.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-green-600 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Common Mistakes */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">⚠️ Common Mistakes</h4>
                      <ul className="space-y-2">
                        {guideline.commonMistakes.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-red-600 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Examples */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h4 className="font-semibold text-green-700 mb-2">✓ Good Examples</h4>
                        <div className="bg-green-50 border-2 border-green-200 rounded p-3 space-y-2">
                          {guideline.examples.good.map((example, idx) => (
                            <code
                              key={idx}
                              className="block text-xs text-green-900 break-all font-mono"
                            >
                              {example}
                            </code>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-700 mb-2">✗ Bad Examples</h4>
                        <div className="bg-red-50 border-2 border-red-200 rounded p-3 space-y-2">
                          {guideline.examples.bad.map((example, idx) => (
                            <code key={idx} className="block text-xs text-red-900 break-all font-mono">
                              {example}
                            </code>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {guideline.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full hover:bg-gray-300 transition"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
