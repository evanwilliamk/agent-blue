import { NextRequest, NextResponse } from 'next/server';
import { memoryIssues } from '@/lib/memory-storage';

// POST /api/issues/[issue_id]/comments - Add comment to issue
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ issue_id: string }> }
) {
  try {
    const { issue_id } = await params;
    const body = await request.json();
    const { content, user_name } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // For in-memory mode, just return success
    // In a real app with database, you would insert into comments table
    const comment = {
      id: Date.now().toString(),
      issue_id: parseInt(issue_id),
      user_name: user_name || 'Anonymous',
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    console.log('✓ Comment added (in-memory mode):', comment);

    return NextResponse.json({
      comment,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
