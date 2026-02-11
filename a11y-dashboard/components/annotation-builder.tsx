'use client';

import { useState } from 'react';
import type { ComponentAnnotation } from '@/lib/types';

interface AnnotationBuilderProps {
  onSave?: (annotation: Omit<ComponentAnnotation, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export default function AnnotationBuilder({ onSave }: AnnotationBuilderProps) {
  const [componentName, setComponentName] = useState('');
  const [role, setRole] = useState('');
  const [ariaLabel, setAriaLabel] = useState('');
  const [ariaDescribedBy, setAriaDescribedBy] = useState('');
  const [keyboardNavigation, setKeyboardNavigation] = useState('');
  const [focusManagement, setFocusManagement] = useState('');
  const [semanticHTML, setSemanticHTML] = useState('');
  const [notes, setNotes] = useState('');
  const [figmaLink, setFigmaLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!componentName.trim()) {
      alert('Component name is required');
      return;
    }

    const annotation = {
      componentName: componentName.trim(),
      role: role.trim() || undefined,
      ariaLabel: ariaLabel.trim() || undefined,
      ariaDescribedBy: ariaDescribedBy.trim() || undefined,
      keyboardNavigation: keyboardNavigation.trim() || undefined,
      focusManagement: focusManagement.trim() || undefined,
      semanticHTML: semanticHTML.trim() || undefined,
      notes: notes.trim() || undefined,
      figmaLink: figmaLink.trim() || undefined,
    };

    if (onSave) {
      onSave(annotation);
    }

    // Reset form
    setComponentName('');
    setRole('');
    setAriaLabel('');
    setAriaDescribedBy('');
    setKeyboardNavigation('');
    setFocusManagement('');
    setSemanticHTML('');
    setNotes('');
    setFigmaLink('');

    alert('Annotation saved! (In a full app, this would persist to a database)');
  };

  const commonRoles = [
    'button',
    'link',
    'navigation',
    'main',
    'complementary',
    'banner',
    'contentinfo',
    'search',
    'form',
    'dialog',
    'alert',
    'alertdialog',
    'menu',
    'menubar',
    'menuitem',
    'tab',
    'tabpanel',
    'tablist',
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Component Annotation Builder</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Component Name */}
        <div>
          <label htmlFor="componentName" className="block text-sm font-medium text-gray-700 mb-2">
            Component Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="componentName"
            value={componentName}
            onChange={(e) => setComponentName(e.target.value)}
            placeholder="e.g., Primary Navigation, Login Button, Search Modal"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Figma Link */}
        <div>
          <label htmlFor="figmaLink" className="block text-sm font-medium text-gray-700 mb-2">
            Figma Link
          </label>
          <input
            type="url"
            id="figmaLink"
            value={figmaLink}
            onChange={(e) => setFigmaLink(e.target.value)}
            placeholder="https://figma.com/file/..."
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="border-t-2 border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Accessibility Attributes</h3>

          {/* ARIA Role */}
          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              ARIA Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select role (or use semantic HTML)</option>
              {commonRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Only needed if semantic HTML isn&apos;t sufficient
            </p>
          </div>

          {/* ARIA Label */}
          <div className="mb-4">
            <label htmlFor="ariaLabel" className="block text-sm font-medium text-gray-700 mb-2">
              aria-label
            </label>
            <input
              type="text"
              id="ariaLabel"
              value={ariaLabel}
              onChange={(e) => setAriaLabel(e.target.value)}
              placeholder="e.g., Close dialog, Search products"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Accessible name for screen readers
            </p>
          </div>

          {/* ARIA Described By */}
          <div className="mb-4">
            <label htmlFor="ariaDescribedBy" className="block text-sm font-medium text-gray-700 mb-2">
              aria-describedby
            </label>
            <input
              type="text"
              id="ariaDescribedBy"
              value={ariaDescribedBy}
              onChange={(e) => setAriaDescribedBy(e.target.value)}
              placeholder="e.g., help-text, error-message"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              ID of element providing additional description
            </p>
          </div>
        </div>

        <div className="border-t-2 border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Implementation Notes</h3>

          {/* Semantic HTML */}
          <div className="mb-4">
            <label htmlFor="semanticHTML" className="block text-sm font-medium text-gray-700 mb-2">
              Semantic HTML
            </label>
            <textarea
              id="semanticHTML"
              value={semanticHTML}
              onChange={(e) => setSemanticHTML(e.target.value)}
              placeholder="e.g., Use <button> not <div>, Use <nav> for navigation"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              rows={3}
            />
          </div>

          {/* Keyboard Navigation */}
          <div className="mb-4">
            <label htmlFor="keyboardNavigation" className="block text-sm font-medium text-gray-700 mb-2">
              Keyboard Navigation
            </label>
            <textarea
              id="keyboardNavigation"
              value={keyboardNavigation}
              onChange={(e) => setKeyboardNavigation(e.target.value)}
              placeholder="e.g., Tab to navigate, Enter to activate, Esc to close"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          {/* Focus Management */}
          <div className="mb-4">
            <label htmlFor="focusManagement" className="block text-sm font-medium text-gray-700 mb-2">
              Focus Management
            </label>
            <textarea
              id="focusManagement"
              value={focusManagement}
              onChange={(e) => setFocusManagement(e.target.value)}
              placeholder="e.g., Focus moves to modal on open, returns to trigger on close"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          {/* Additional Notes */}
          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any other accessibility considerations or implementation details..."
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition"
          >
            Save Annotation
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('Clear all fields?')) {
                setComponentName('');
                setRole('');
                setAriaLabel('');
                setAriaDescribedBy('');
                setKeyboardNavigation('');
                setFocusManagement('');
                setSemanticHTML('');
                setNotes('');
                setFigmaLink('');
              }
            }}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-200 transition"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Quick Reference */}
      <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Quick Reference</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use semantic HTML first (button, nav, header, etc.)</li>
          <li>• Add ARIA roles only when semantic HTML isn&apos;t enough</li>
          <li>• Always provide labels for interactive elements</li>
          <li>• Document keyboard shortcuts and focus behavior</li>
          <li>• Link to Figma for design reference</li>
        </ul>
      </div>
    </div>
  );
}
