'use client';

import { useState, useEffect } from 'react';
import { checkContrast, isValidHex, normalizeHex, getWCAGLevel } from '@/lib/utils/contrast';

export default function ContrastChecker() {
  const [foreground, setForeground] = useState('#000000');
  const [background, setBackground] = useState('#FFFFFF');
  const [result, setResult] = useState(checkContrast('#000000', '#FFFFFF'));

  useEffect(() => {
    if (isValidHex(foreground) && isValidHex(background)) {
      const fg = normalizeHex(foreground);
      const bg = normalizeHex(background);
      setResult(checkContrast(fg, bg));
    }
  }, [foreground, background]);

  const getStatusIcon = (passes: boolean) => (passes ? '✓' : '✗');
  const getStatusColor = (passes: boolean) => (passes ? 'text-green-600' : 'text-red-600');

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Color Contrast Checker</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Foreground Color */}
        <div>
          <label htmlFor="foreground" className="block text-sm font-medium text-gray-700 mb-2">
            Foreground (Text Color)
          </label>
          <div className="flex gap-3">
            <input
              type="color"
              id="foreground-picker"
              value={normalizeHex(foreground)}
              onChange={(e) => setForeground(e.target.value)}
              className="w-16 h-16 rounded border-2 border-gray-300 cursor-pointer"
              aria-label="Pick foreground color"
            />
            <input
              type="text"
              id="foreground"
              value={foreground}
              onChange={(e) => setForeground(e.target.value)}
              placeholder="#000000"
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg"
              aria-describedby="foreground-help"
            />
          </div>
          <p id="foreground-help" className="text-xs text-gray-500 mt-1">
            Enter hex color (e.g., #000000)
          </p>
        </div>

        {/* Background Color */}
        <div>
          <label htmlFor="background" className="block text-sm font-medium text-gray-700 mb-2">
            Background Color
          </label>
          <div className="flex gap-3">
            <input
              type="color"
              id="background-picker"
              value={normalizeHex(background)}
              onChange={(e) => setBackground(e.target.value)}
              className="w-16 h-16 rounded border-2 border-gray-300 cursor-pointer"
              aria-label="Pick background color"
            />
            <input
              type="text"
              id="background"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="#FFFFFF"
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg"
              aria-describedby="background-help"
            />
          </div>
          <p id="background-help" className="text-xs text-gray-500 mt-1">
            Enter hex color (e.g., #FFFFFF)
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Preview</h3>
        <div
          className="rounded-lg p-8 border-2 border-gray-300"
          style={{ backgroundColor: normalizeHex(background) }}
        >
          <p
            className="text-base mb-4"
            style={{ color: normalizeHex(foreground) }}
          >
            Normal text (16px): The quick brown fox jumps over the lazy dog
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: normalizeHex(foreground) }}
          >
            Large text (24px): The quick brown fox
          </p>
        </div>
      </div>

      {/* Contrast Ratio Result */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Contrast Ratio</h3>
          <div className="text-4xl font-bold text-gray-900">{result.ratio}:1</div>
        </div>

        {/* WCAG Compliance Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Normal Text */}
          <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Normal Text</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">WCAG AA (4.5:1)</span>
                <span className={`text-xl font-bold ${getStatusColor(result.passesAA)}`}>
                  {getStatusIcon(result.passesAA)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">WCAG AAA (7:1)</span>
                <span className={`text-xl font-bold ${getStatusColor(result.passesAAA)}`}>
                  {getStatusIcon(result.passesAAA)}
                </span>
              </div>
            </div>
          </div>

          {/* Large Text */}
          <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Large Text (18pt+/14pt+ bold)</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">WCAG AA (3:1)</span>
                <span className={`text-xl font-bold ${getStatusColor(result.passesAALarge)}`}>
                  {getStatusIcon(result.passesAALarge)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">WCAG AAA (4.5:1)</span>
                <span className={`text-xl font-bold ${getStatusColor(result.passesAAALarge)}`}>
                  {getStatusIcon(result.passesAAALarge)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Recommendation</h4>
        <p className="text-sm text-blue-800">
          {result.passesAA
            ? result.passesAAA
              ? '✓ Excellent! This combination passes AAA standards for all text sizes.'
              : '✓ Good! This combination passes AA standards. Consider higher contrast for AAA compliance.'
            : '⚠️ This combination does not meet WCAG AA standards. Increase contrast to at least 4.5:1 for normal text.'}
        </p>
      </div>
    </div>
  );
}
