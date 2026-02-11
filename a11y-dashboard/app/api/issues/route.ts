import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';
import { memoryIssues, memoryScans, isUsingFallback, enableFallback } from '@/lib/memory-storage';

// GET /api/issues - List issues with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const file_id = searchParams.get('file_id');
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const category = searchParams.get('category');
    const assigned_to = searchParams.get('assigned_to');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Try in-memory storage first if enabled
    if (isUsingFallback()) {
      return handleFallbackGET(searchParams, limit, offset);
    }

    try {
      let queryText = `
        SELECT
          i.*,
          p.page_name,
          p.page_id as page_string_id,
          f.file_name,
          f.file_key,
          u.name as assigned_to_name,
          COUNT(c.id) as comment_count
        FROM issues i
        JOIN figma_pages p ON i.page_id = p.id
        JOIN figma_files f ON p.file_id = f.id
        LEFT JOIN users u ON i.assigned_to = u.id
        LEFT JOIN comments c ON i.id = c.issue_id
      `;

      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (file_id) {
        conditions.push(`p.file_id = $${paramIndex++}`);
        params.push(file_id);
      }

      if (status) {
        conditions.push(`i.status = $${paramIndex++}`);
        params.push(status);
      }

      if (severity) {
        conditions.push(`i.severity = $${paramIndex++}`);
        params.push(severity);
      }

      if (category) {
        conditions.push(`i.category = $${paramIndex++}`);
        params.push(category);
      }

      if (assigned_to) {
        conditions.push(`i.assigned_to = $${paramIndex++}`);
        params.push(assigned_to);
      }

      if (conditions.length > 0) {
        queryText += ` WHERE ${conditions.join(' AND ')}`;
      }

      queryText += ` GROUP BY i.id, p.page_name, p.page_id, f.file_name, f.file_key, u.name`;
      queryText += ` ORDER BY i.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(limit, offset);

      const result = await query(queryText, params);

      // Get total count
      let countQuery = `SELECT COUNT(*) FROM issues i JOIN figma_pages p ON i.page_id = p.id`;
      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
      const countResult = await query(countQuery, params.slice(0, -2));
      const total = parseInt(countResult.rows[0].count);

      return NextResponse.json({
        issues: result.rows,
        count: result.rowCount,
        total,
        limit,
        offset,
      });
    } catch (dbError) {
      // Database failed, switch to fallback mode
      console.log('Database connection failed, switching to in-memory storage');
      enableFallback();
      return handleFallbackGET(searchParams, limit, offset);
    }
  } catch (error) {
    console.error('Issues list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issues', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Fallback GET handler for in-memory storage
function handleFallbackGET(searchParams: URLSearchParams, limit: number, offset: number) {
  const file_id = searchParams.get('file_id');
  const status = searchParams.get('status');
  const severity = searchParams.get('severity');
  const category = searchParams.get('category');

  // Filter issues based on query parameters
  let filteredIssues = [...memoryIssues];

  if (status) {
    filteredIssues = filteredIssues.filter(i => i.status === status);
  }

  if (severity) {
    filteredIssues = filteredIssues.filter(i => i.severity === severity);
  }

  if (category) {
    filteredIssues = filteredIssues.filter(i => i.category === category);
  }

  // Add file/page metadata from memoryScans
  const enrichedIssues = filteredIssues.map(issue => {
    // Find the scan and file info
    let file_name = 'Unknown';
    let file_key = '';
    let page_name = 'Unknown';

    for (const file of memoryScans) {
      const scan = file.scans.find((s: any) => s.id === issue.scan_id);
      if (scan) {
        file_name = file.file_name;
        file_key = file.file_key;
        page_name = issue.page_id || 'Unknown Page';
        break;
      }
    }

    return {
      ...issue,
      file_name,
      file_key,
      page_name,
      page_string_id: issue.page_id,
      comment_count: 0,
      assigned_to_name: null
    };
  });

  // Sort by created_at DESC
  enrichedIssues.sort((a, b) => {
    const aTime = new Date(a.created_at || 0).getTime();
    const bTime = new Date(b.created_at || 0).getTime();
    return bTime - aTime;
  });

  const total = enrichedIssues.length;
  const paginatedIssues = enrichedIssues.slice(offset, offset + limit);

  console.log(`✓ In-memory issues list: ${paginatedIssues.length} of ${total} total`);

  return NextResponse.json({
    issues: paginatedIssues,
    count: paginatedIssues.length,
    total,
    limit,
    offset,
  });
}
