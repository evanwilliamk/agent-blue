'use client';

import { useState } from 'react';
import Link from 'next/link';
import ContrastChecker from '@/components/contrast-checker';
import GuidelinesBrowser from '@/components/guidelines-browser';
import AnnotationBuilder from '@/components/annotation-builder';
import IssueTracker from '@/components/issue-tracker';
import guidelinesDataRaw from '@/data/wcag-guidelines.json';
import type { WCAGGuideline } from '@/lib/types';

const guidelinesData = guidelinesDataRaw as WCAGGuideline[];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'contrast' | 'guidelines' | 'annotations' | 'issues'>(
    'contrast'
  );

  const tabs = [
    { id: 'contrast' as const, label: 'Contrast Checker', icon: '🎨' },
    { id: 'guidelines' as const, label: 'WCAG Guidelines', icon: '📚' },
    { id: 'annotations' as const, label: 'Component Annotations', icon: '📝' },
    { id: 'issues' as const, label: 'Issue Tracker', icon: '🐛' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blue Line Assistant</h1>
              <p className="text-gray-600 mt-1">
                Accessibility tools for UX designers working in Figma
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                ← Back to Dashboard
              </Link>
              <span className="text-sm text-gray-500">WCAG 2.1 & 2.2</span>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" title="All systems operational" />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b-2 border-gray-200" role="tablist" aria-label="Dashboard sections">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-4 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div
          id="contrast-panel"
          role="tabpanel"
          aria-labelledby="contrast-tab"
          hidden={activeTab !== 'contrast'}
        >
          {activeTab === 'contrast' && <ContrastChecker />}
        </div>

        <div
          id="guidelines-panel"
          role="tabpanel"
          aria-labelledby="guidelines-tab"
          hidden={activeTab !== 'guidelines'}
        >
          {activeTab === 'guidelines' && <GuidelinesBrowser guidelines={guidelinesData} />}
        </div>

        <div
          id="annotations-panel"
          role="tabpanel"
          aria-labelledby="annotations-tab"
          hidden={activeTab !== 'annotations'}
        >
          {activeTab === 'annotations' && <AnnotationBuilder />}
        </div>

        <div
          id="issues-panel"
          role="tabpanel"
          aria-labelledby="issues-tab"
          hidden={activeTab !== 'issues'}
        >
          {activeTab === 'issues' && (
            <IssueTracker
              wcagGuidelines={guidelinesData.map((g) => ({
                id: g.id,
                number: g.number,
                title: g.title,
              }))}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Built with accessibility in mind. WCAG 2.1 & 2.2 compliant.
            </p>
            <div className="flex gap-6 text-sm">
              <a
                href="https://www.w3.org/WAI/WCAG21/quickref/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                WCAG Quick Reference
              </a>
              <a
                href="https://webaim.org/resources/contrastchecker/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                WebAIM Resources
              </a>
              <a
                href="https://www.figma.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Figma
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
