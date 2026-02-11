// Figma Plugin Main Code (runs in Figma's backend)

// Configuration - Update this with your web app URL
// Note: Figma plugins cannot access localhost, use your network IP instead
const API_BASE_URL = 'http://192.168.0.174:3000/api';

// Show UI
figma.showUI(__html__, { width: 400, height: 500 });

// Listen for messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'scan-page') {
    await scanCurrentPage();
  } else if (msg.type === 'scan-file') {
    await scanEntireFile();
  } else if (msg.type === 'configure-api') {
    // Store API configuration
    await figma.clientStorage.setAsync('apiUrl', msg.apiUrl);
    figma.ui.postMessage({ type: 'config-saved' });
  } else if (msg.type === 'reload-plugin') {
    // Close and reopen the plugin to reload it
    figma.closePlugin();
    // Note: User will need to reopen the plugin manually, but this clears the state
  }
};

// Scan current page
async function scanCurrentPage() {
  console.log('scanCurrentPage() called');

  figma.ui.postMessage({
    type: 'scan-started',
    scope: 'page',
    message: '🔍 Starting scan of current page...'
  });

  try {
    console.log('Getting current page...');
    const currentPage = figma.currentPage;
    console.log('Current page:', currentPage.name);

    figma.ui.postMessage({
      type: 'scan-step',
      message: `📄 Analyzing page: ${currentPage.name}`
    });

    console.log('Starting analyzePage...');
    let issues;
    try {
      issues = await analyzePage(currentPage);
      console.log('analyzePage complete, found', issues.length, 'issues');
    } catch (analyzeError) {
      console.error('analyzePage failed:', analyzeError);
      throw new Error(`Analysis failed: ${analyzeError instanceof Error ? analyzeError.message : String(analyzeError)}`);
    }

    figma.ui.postMessage({
      type: 'scan-step',
      message: `✓ Found ${issues.length} issue${issues.length !== 1 ? 's' : ''} on this page`
    });

    figma.ui.postMessage({
      type: 'scan-step',
      message: '📤 Sending results to dashboard...'
    });

    // Send to API
    try {
      await sendScanToAPI('single_page', [currentPage], issues);
    } catch (apiError) {
      console.error('sendScanToAPI failed:', apiError);
      throw new Error(`API failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
    }

    figma.ui.postMessage({
      type: 'scan-complete',
      scope: 'page',
      issueCount: issues.length,
    });
  } catch (error) {
    console.error('Scan current page error:', error);
    let errorMessage = 'Unknown error';
    let errorStack = '';

    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack || '';
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    } else {
      errorMessage = String(error);
    }

    figma.ui.postMessage({
      type: 'scan-error',
      error: `Page scan failed: ${errorMessage}`,
      stack: errorStack,
    });
  }
}

// Scan entire file
async function scanEntireFile() {
  figma.ui.postMessage({
    type: 'scan-started',
    scope: 'file',
    message: '🔍 Starting full file scan...'
  });

  try {
    const allIssues: any[] = [];
    const pages = figma.root.children;

    figma.ui.postMessage({
      type: 'scan-step',
      message: `📁 Found ${pages.length} page${pages.length !== 1 ? 's' : ''} to scan`
    });

    for (const page of pages) {
      const pageIndex = pages.indexOf(page) + 1;

      figma.ui.postMessage({
        type: 'scan-progress',
        current: pageIndex,
        total: pages.length,
        pageName: page.name,
        message: `📄 Scanning page ${pageIndex}/${pages.length}: ${page.name}`
      });

      const pageIssues = await analyzePage(page as PageNode);
      allIssues.push(...pageIssues);

      figma.ui.postMessage({
        type: 'scan-step',
        message: `✓ ${page.name}: Found ${pageIssues.length} issue${pageIssues.length !== 1 ? 's' : ''}`
      });
    }

    figma.ui.postMessage({
      type: 'scan-step',
      message: `✓ Total issues found: ${allIssues.length}`
    });

    figma.ui.postMessage({
      type: 'scan-step',
      message: '📤 Sending results to dashboard...'
    });

    // Send to API
    await sendScanToAPI('full_file', pages as PageNode[], allIssues);

    figma.ui.postMessage({
      type: 'scan-complete',
      scope: 'file',
      issueCount: allIssues.length,
    });
  } catch (error) {
    figma.ui.postMessage({
      type: 'scan-error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Analyze a page for accessibility issues
async function analyzePage(page: PageNode): Promise<any[]> {
  const issues: any[] = [];

  // Traverse all nodes in the page
  await traverseNode(page, issues, page);

  return issues;
}

// Recursively traverse nodes
async function traverseNode(node: BaseNode, issues: any[], page: PageNode) {
  // Text contrast check
  if (node.type === 'TEXT') {
    const textNode = node as TextNode;
    const contrastIssue = await checkTextContrast(textNode, page);
    if (contrastIssue) issues.push(contrastIssue);

    const sizeIssue = checkTextSize(textNode, page);
    if (sizeIssue) issues.push(sizeIssue);
  }

  // Touch target size check (buttons, interactive elements)
  if (isInteractiveElement(node)) {
    const touchTargetIssue = checkTouchTargetSize(node as SceneNode, page);
    if (touchTargetIssue) issues.push(touchTargetIssue);
  }

  // Recursively check children
  if ('children' in node) {
    for (const child of node.children) {
      await traverseNode(child, issues, page);
    }
  }
}

// Check text contrast ratio
async function checkTextContrast(node: TextNode, page: PageNode): Promise<any | null> {
  try {
    // Get text color
    const fills = node.fills as Paint[];
    if (!fills || fills.length === 0 || fills[0].type !== 'SOLID') return null;

    const textColor = fills[0] as SolidPaint;
    const textRgb = textColor.color;
    const textOpacity = textColor.opacity !== undefined ? textColor.opacity : 1;

    // Get background color (simplified - checks parent background)
    const parent = node.parent;
    let bgColor = { r: 1, g: 1, b: 1 }; // Default white

    if (parent && 'fills' in parent) {
      const parentFills = (parent as any).fills as Paint[];
      if (parentFills && parentFills.length > 0 && parentFills[0].type === 'SOLID') {
        const bgPaint = parentFills[0] as SolidPaint;
        bgColor = bgPaint.color;
      }
    }

    // Calculate contrast ratio
    const contrastRatio = calculateContrastRatio(textRgb, bgColor);

    // Determine if it passes WCAG standards
    const fontSize = node.fontSize as number;
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && node.fontWeight && node.fontWeight >= 700);

    const requiredRatio = isLargeText ? 3.0 : 4.5;
    const wcagLevel = isLargeText ? 'AA' : 'AA';

    if (contrastRatio < requiredRatio) {
      return {
        page_id: page.id,
        element_id: node.id,
        element_name: node.name,
        category: 'contrast',
        severity: contrastRatio < 3.0 ? 'critical' : 'high',
        wcag_criteria: '1.4.3',
        wcag_level: wcagLevel,
        description: `Text contrast ratio is below WCAG ${wcagLevel} standards`,
        current_value: `${contrastRatio.toFixed(2)}:1`,
        required_value: `${requiredRatio}:1`,
        fix_recommendation: `Increase contrast between text and background. Current: ${contrastRatio.toFixed(2)}:1, Required: ${requiredRatio}:1`,
        location_x: Math.round(node.x),
        location_y: Math.round(node.y),
        frame_name: getFrameName(node),
      };
    }
  } catch (error) {
    console.error('Contrast check error:', error);
  }

  return null;
}

// Check text size
function checkTextSize(node: TextNode, page: PageNode): any | null {
  const fontSize = node.fontSize as number;
  const MIN_TEXT_SIZE = 12;

  if (fontSize < MIN_TEXT_SIZE) {
    return {
      page_id: page.id,
      element_id: node.id,
      element_name: node.name,
      category: 'text_size',
      severity: 'medium',
      wcag_criteria: '1.4.4',
      wcag_level: 'AA',
      description: 'Text size is below recommended minimum for readability',
      current_value: `${fontSize}px`,
      required_value: `${MIN_TEXT_SIZE}px`,
      fix_recommendation: `Increase font size to at least ${MIN_TEXT_SIZE}px for better readability`,
      location_x: Math.round(node.x),
      location_y: Math.round(node.y),
      frame_name: getFrameName(node),
    };
  }

  return null;
}

// Check if element is interactive (simplified heuristic)
function isInteractiveElement(node: BaseNode): boolean {
  const name = node.name.toLowerCase();
  return (
    name.includes('button') ||
    name.includes('btn') ||
    name.includes('link') ||
    name.includes('input') ||
    name.includes('tab') ||
    (node.type === 'COMPONENT' || node.type === 'INSTANCE')
  );
}

// Check touch target size
function checkTouchTargetSize(node: SceneNode, page: PageNode): any | null {
  const MIN_TOUCH_TARGET = 44;

  if ('width' in node && 'height' in node) {
    const width = node.width;
    const height = node.height;

    if (width < MIN_TOUCH_TARGET || height < MIN_TOUCH_TARGET) {
      return {
        page_id: page.id,
        element_id: node.id,
        element_name: node.name,
        category: 'touch_target',
        severity: width < 24 || height < 24 ? 'high' : 'medium',
        wcag_criteria: '2.5.5',
        wcag_level: 'AAA',
        description: 'Touch target size is below recommended minimum',
        current_value: `${Math.round(width)}x${Math.round(height)}px`,
        required_value: `${MIN_TOUCH_TARGET}x${MIN_TOUCH_TARGET}px`,
        fix_recommendation: `Increase button/interactive element size to at least ${MIN_TOUCH_TARGET}x${MIN_TOUCH_TARGET}px`,
        location_x: Math.round(node.x),
        location_y: Math.round(node.y),
        frame_name: getFrameName(node),
      };
    }
  }

  return null;
}

// Calculate contrast ratio (WCAG formula)
function calculateContrastRatio(color1: RGB, color2: RGB): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);

  return (brightest + 0.05) / (darkest + 0.05);
}

// Get relative luminance
function getLuminance(color: RGB): number {
  const rsRGB = color.r;
  const gsRGB = color.g;
  const bsRGB = color.b;

  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Get frame name for context
function getFrameName(node: BaseNode): string {
  let current: BaseNode | null = node.parent;
  while (current) {
    if (current.type === 'FRAME' || current.type === 'COMPONENT') {
      return current.name;
    }
    current = current.parent;
  }
  return 'Unknown Frame';
}

// Send scan results to API
async function sendScanToAPI(scanType: string, pages: PageNode[], issues: any[]) {
  try {
    const apiUrl = await figma.clientStorage.getAsync('apiUrl') || API_BASE_URL;
    console.log('API URL:', apiUrl);

    figma.ui.postMessage({
      type: 'scan-step',
      message: '🔗 Connecting to dashboard API...'
    });

    // Step 1: Create scan
    const scanPayload = {
      file_key: figma.fileKey || 'unknown',
      file_name: figma.root.name,
      file_url: `https://www.figma.com/file/${figma.fileKey}`,
      scan_type: scanType,
      pages: pages.map((p) => ({
        page_id: p.id,
        page_name: p.name,
      })),
    };

    console.log('Creating scan with payload:', scanPayload);

    figma.ui.postMessage({
      type: 'scan-step',
      message: '📝 Creating scan record...'
    });

    let scanResponse;
    try {
      scanResponse = await fetch(`${apiUrl}/scans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanPayload),
      });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Failed to connect to API'}`);
    }

    console.log('Scan response status:', scanResponse.status);

    if (!scanResponse.ok) {
      const errorText = await scanResponse.text();
      console.error('Scan creation failed:', errorText);
      throw new Error(`Scan creation failed (${scanResponse.status}): ${errorText}`);
    }

    const scanData = await scanResponse.json();
    console.log('Scan created:', scanData);
    const scanId = scanData.scan_id;

  figma.ui.postMessage({
    type: 'scan-step',
    message: '✓ Scan record created'
  });

  // Step 2: Send issues
  if (issues.length > 0) {
    figma.ui.postMessage({
      type: 'scan-step',
      message: `📤 Uploading ${issues.length} issue${issues.length !== 1 ? 's' : ''}...`
    });

    const issuesResponse = await fetch(`${apiUrl}/scans/${scanId}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issues }),
    });

    if (!issuesResponse.ok) {
      throw new Error(`Issues upload failed: ${issuesResponse.statusText}`);
    }

    figma.ui.postMessage({
      type: 'scan-step',
      message: `✓ ${issues.length} issue${issues.length !== 1 ? 's' : ''} uploaded successfully`
    });
  } else {
    figma.ui.postMessage({
      type: 'scan-step',
      message: '✓ No issues found (great job!)'
    });
  }

    figma.ui.postMessage({
      type: 'api-success',
      scanId,
      webAppUrl: apiUrl.replace('/api', ''),
    });
  } catch (error) {
    console.error('sendScanToAPI error:', error);
    if (error instanceof Error) {
      throw error; // Re-throw with our detailed message
    }
    throw new Error(`API error: ${JSON.stringify(error)}`);
  }
}
