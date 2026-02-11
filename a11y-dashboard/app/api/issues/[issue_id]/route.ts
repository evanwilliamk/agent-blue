import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';

// GET /api/issues/[issue_id] - Get issue details
export async function GET(
  request: NextRequest,
  { params }: { params: { issue_id: string } }
) {
  try {
    const { issue_id } = params;

    // Get issue with related data
    const issueResult = await query(
      `SELECT
        i.*,
        p.page_name,
        p.page_id as page_string_id,
        f.file_name,
        f.file_key,
        f.file_url,
        u.name as assigned_to_name,
        u.email as assigned_to_email
      FROM issues i
      JOIN figma_pages p ON i.page_id = p.id
      JOIN figma_files f ON p.file_id = f.id
      LEFT JOIN users u ON i.assigned_to = u.id
      WHERE i.id = $1`,
      [issue_id]
    );

    if (issueResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    const issue = issueResult.rows[0];

    // Get comments
    const commentsResult = await query(
      `SELECT c.*, u.name as user_name, u.email as user_email
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.issue_id = $1
       ORDER BY c.created_at ASC`,
      [issue_id]
    );

    // Get annotations
    const annotationsResult = await query(
      `SELECT a.*, u.name as created_by_name
       FROM annotations a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.issue_id = $1
       ORDER BY a.created_at DESC`,
      [issue_id]
    );

    return NextResponse.json({
      issue,
      comments: commentsResult.rows,
      annotations: annotationsResult.rows,
    });
  } catch (error) {
    console.error('Issue fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issue' },
      { status: 500 }
    );
  }
}

// PATCH /api/issues/[issue_id] - Update issue
export async function PATCH(
  request: NextRequest,
  { params }: { params: { issue_id: string } }
) {
  try {
    const { issue_id } = params;
    const body = await request.json();
    const { status, assigned_to, severity, fix_recommendation } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);

      if (status === 'resolved') {
        updates.push(`resolved_at = NOW()`);
      }
    }

    if (assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramIndex++}`);
      values.push(assigned_to || null);
    }

    if (severity !== undefined) {
      updates.push(`severity = $${paramIndex++}`);
      values.push(severity);
    }

    if (fix_recommendation !== undefined) {
      updates.push(`fix_recommendation = $${paramIndex++}`);
      values.push(fix_recommendation);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    values.push(issue_id);

    const result = await query(
      `UPDATE issues SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      issue: result.rows[0],
      message: 'Issue updated successfully',
    });
  } catch (error) {
    console.error('Issue update error:', error);
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    );
  }
}
