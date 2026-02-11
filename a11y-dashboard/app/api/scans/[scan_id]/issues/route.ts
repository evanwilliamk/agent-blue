import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/client';
import {
  memoryScans,
  memoryIssues,
  isUsingFallback,
  enableFallback,
  getNextIssueId
} from '@/lib/memory-storage';

// POST /api/scans/[scan_id]/issues - Bulk create issues from Figma plugin
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ scan_id: string }> }
) {
  try {
    const { scan_id } = await params;
    const body = await request.json();
    const { issues } = body;

    if (!Array.isArray(issues) || issues.length === 0) {
      return NextResponse.json(
        { error: 'Issues array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Use fallback if enabled
    if (isUsingFallback()) {
      return handleFallbackPOST(scan_id, issues);
    }

    try {
      // Use transaction for bulk insert
      const result = await transaction(async (client) => {
      let created_count = 0;
      const issue_ids = [];

      // Count by severity for scan summary
      const severity_counts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      };

      for (const issue of issues) {
        // Get page UUID from page_id string
        const pageResult = await client.query(
          `SELECT id FROM figma_pages WHERE page_id = $1`,
          [issue.page_id]
        );

        if (pageResult.rows.length === 0) {
          console.warn(`Page not found for page_id: ${issue.page_id}`);
          continue;
        }

        const page_uuid = pageResult.rows[0].id;

        // Insert issue
        const issueResult = await client.query(
          `INSERT INTO issues (
            scan_id, page_id, element_id, element_name, category, severity,
            wcag_criteria, wcag_level, description, current_value, required_value,
            fix_recommendation, screenshot_url, location_x, location_y, frame_name, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'open')
          RETURNING id`,
          [
            scan_id,
            page_uuid,
            issue.element_id,
            issue.element_name,
            issue.category,
            issue.severity,
            issue.wcag_criteria,
            issue.wcag_level,
            issue.description,
            issue.current_value,
            issue.required_value,
            issue.fix_recommendation,
            issue.screenshot_url,
            issue.location_x,
            issue.location_y,
            issue.frame_name,
          ]
        );

        issue_ids.push(issueResult.rows[0].id);
        created_count++;

        // Count severity
        if (issue.severity in severity_counts) {
          severity_counts[issue.severity as keyof typeof severity_counts]++;
        }
      }

      // Update scan with counts and mark as completed
      await client.query(
        `UPDATE scans
         SET total_issues = $1,
             critical_count = $2,
             high_count = $3,
             medium_count = $4,
             low_count = $5,
             status = 'completed',
             completed_at = NOW()
         WHERE id = $6`,
        [
          created_count,
          severity_counts.critical,
          severity_counts.high,
          severity_counts.medium,
          severity_counts.low,
          scan_id,
        ]
      );

      return { created_count, issue_ids, severity_counts };
      });

      return NextResponse.json({
        created_count: result.created_count,
        issue_ids: result.issue_ids,
        severity_counts: result.severity_counts,
        message: 'Issues created successfully',
      });
    } catch (dbError) {
      // Database failed, switch to fallback mode
      console.log('Database connection failed, switching to in-memory storage');
      enableFallback();
      return handleFallbackPOST(scan_id, issues);
    }
  } catch (error) {
    console.error('Issues creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create issues', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Fallback POST handler for in-memory storage
function handleFallbackPOST(scan_id: string, issues: any[]) {
  // Count by severity
  const severity_counts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  const issue_ids: number[] = [];

  // Add all issues to memory
  issues.forEach((issue: any) => {
    const issueRecord = {
      id: getNextIssueId(),
      scan_id: parseInt(scan_id),
      page_id: issue.page_id,
      element_id: issue.element_id,
      element_name: issue.element_name,
      category: issue.category,
      severity: issue.severity,
      wcag_criteria: issue.wcag_criteria,
      wcag_level: issue.wcag_level,
      description: issue.description,
      current_value: issue.current_value,
      required_value: issue.required_value,
      fix_recommendation: issue.fix_recommendation,
      screenshot_url: issue.screenshot_url,
      location_x: issue.location_x,
      location_y: issue.location_y,
      frame_name: issue.frame_name,
      status: 'open',
      created_at: new Date().toISOString()
    };

    memoryIssues.push(issueRecord);
    issue_ids.push(issueRecord.id);

    // Count severity
    if (issue.severity in severity_counts) {
      severity_counts[issue.severity as keyof typeof severity_counts]++;
    }
  });

  // Update scan status in memory
  const scanIdNum = parseInt(scan_id);
  let scanFound = false;
  for (const file of memoryScans) {
    const scan = file.scans.find((s: any) => s.id === scanIdNum);
    if (scan) {
      scan.status = 'completed';
      scan.completed_at = new Date().toISOString();
      scan.total_issues = issues.length;
      scan.critical_count = severity_counts.critical;
      scan.high_count = severity_counts.high;
      scan.medium_count = severity_counts.medium;
      scan.low_count = severity_counts.low;
      scanFound = true;
      break;
    }
  }

  console.log(`✓ In-memory issues created: ${issues.length} issues for scan ${scan_id} (scan ${scanFound ? 'updated' : 'not found'})`);

  return NextResponse.json({
    created_count: issues.length,
    issue_ids,
    severity_counts,
    message: 'Issues created successfully (in-memory mode)',
  });
}
