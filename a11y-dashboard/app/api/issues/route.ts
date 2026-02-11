import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';

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
  } catch (error) {
    console.error('Issues list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issues', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
