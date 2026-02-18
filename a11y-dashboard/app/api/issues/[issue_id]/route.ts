import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';
import { memoryIssues, isUsingFallback, enableFallback, getCommentsForIssue } from '@/lib/memory-storage';

// GET /api/issues/[issue_id] - Get issue details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ issue_id: string }> }
) {
  try {
    const { issue_id } = await params;

    // Try in-memory storage first if enabled
    if (isUsingFallback()) {
      return handleFallbackGET(issue_id);
    }

    try {
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
    } catch (dbError) {
      // Database failed, switch to fallback mode
      console.log('Database connection failed, switching to in-memory storage');
      enableFallback();
      return handleFallbackGET(issue_id);
    }
  } catch (error) {
    console.error('Issue fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issue' },
      { status: 500 }
    );
  }
}

// Fallback GET handler for in-memory storage
function handleFallbackGET(issue_id: string) {
  const issue = memoryIssues.find((i) => i.id === parseInt(issue_id));

  if (!issue) {
    return NextResponse.json(
      { error: 'Issue not found' },
      { status: 404 }
    );
  }

  const comments = getCommentsForIssue(parseInt(issue_id));

  return NextResponse.json({
    issue,
    comments,
    annotations: [],
  });
}

// PATCH /api/issues/[issue_id] - Update issue
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ issue_id: string }> }
) {
  try {
    const { issue_id } = await params;
    const body = await request.json();
    const { status, assigned_to, severity, fix_recommendation } = body;

    // Try in-memory storage first if enabled
    if (isUsingFallback()) {
      return handleFallbackPATCH(issue_id, body);
    }

    try {
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
    } catch (dbError) {
      // Database failed, switch to fallback mode
      console.log('Database connection failed, switching to in-memory storage');
      enableFallback();
      return handleFallbackPATCH(issue_id, body);
    }
  } catch (error) {
    console.error('Issue update error:', error);
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    );
  }
}

// Fallback PATCH handler for in-memory storage
function handleFallbackPATCH(issue_id: string, body: any) {
  const { status, assigned_to, severity, fix_recommendation } = body;
  const issue = memoryIssues.find((i) => i.id === parseInt(issue_id));

  if (!issue) {
    return NextResponse.json(
      { error: 'Issue not found' },
      { status: 404 }
    );
  }

  // Update fields
  if (status !== undefined) {
    issue.status = status;
    if (status === 'resolved') {
      issue.resolved_at = new Date().toISOString();
    }
  }
  if (assigned_to !== undefined) issue.assigned_to = assigned_to;
  if (severity !== undefined) issue.severity = severity;
  if (fix_recommendation !== undefined) issue.fix_recommendation = fix_recommendation;

  issue.updated_at = new Date().toISOString();

  return NextResponse.json({
    issue,
    message: 'Issue updated successfully',
  });
}
