import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/client';
import {
  memoryScans,
  isUsingFallback,
  enableFallback,
  getNextScanId,
  getNextFileId
} from '@/lib/memory-storage';

// POST /api/scans - Create new scan from Figma plugin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { file_key, file_name, file_url, scan_type, pages, initiated_by } = body;

    // Validate required fields
    if (!file_key || !file_name || !scan_type) {
      return NextResponse.json(
        { error: 'Missing required fields: file_key, file_name, scan_type' },
        { status: 400 }
      );
    }

    // Try database first, fallback to memory on failure
    if (isUsingFallback()) {
      return handleFallbackPOST(body);
    }

    try {
      // Use transaction to ensure atomicity
      const result = await transaction(async (client) => {
        // Upsert Figma file
        const fileResult = await client.query(
          `INSERT INTO figma_files (file_key, file_name, file_url, last_scanned_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (file_key)
           DO UPDATE SET file_name = $2, file_url = $3, last_scanned_at = NOW()
           RETURNING id`,
          [file_key, file_name, file_url]
        );
        const file_id = fileResult.rows[0].id;

        // Upsert pages if provided
        if (pages && Array.isArray(pages)) {
          for (const page of pages) {
            await client.query(
              `INSERT INTO figma_pages (file_id, page_id, page_name, last_scanned_at)
               VALUES ($1, $2, $3, NOW())
               ON CONFLICT (file_id, page_id)
               DO UPDATE SET page_name = $3, last_scanned_at = NOW()`,
              [file_id, page.page_id, page.page_name]
            );
          }
        }

        // Create scan record
        const scanResult = await client.query(
          `INSERT INTO scans (file_id, initiated_by, scan_type, status)
           VALUES ($1, $2, $3, 'in_progress')
           RETURNING id`,
          [file_id, initiated_by || null, scan_type]
        );
        const scan_id = scanResult.rows[0].id;

        return { scan_id, file_id };
      });

      return NextResponse.json({
        scan_id: result.scan_id,
        file_id: result.file_id,
        message: 'Scan initiated successfully',
      });
    } catch (dbError) {
      // Database failed, switch to fallback mode
      console.log('Database connection failed, switching to in-memory storage');
      enableFallback();
      return handleFallbackPOST(body);
    }
  } catch (error) {
    console.error('Scan creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create scan', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Fallback POST handler for in-memory storage
function handleFallbackPOST(body: any) {
  const { file_key, file_name, file_url, scan_type, pages } = body;

  // Find or create file in memory
  let file = memoryScans.find((f: any) => f.file_key === file_key);
  if (!file) {
    file = {
      id: getNextFileId(),
      file_key,
      file_name,
      file_url,
      last_scanned_at: new Date().toISOString(),
      scans: []
    };
    memoryScans.push(file);
  } else {
    file.file_name = file_name;
    file.file_url = file_url;
    file.last_scanned_at = new Date().toISOString();
  }

  // Create scan in memory
  const scan = {
    id: getNextScanId(),
    file_id: file.id,
    scan_type,
    status: 'in_progress',
    created_at: new Date().toISOString(),
    file_name,
    file_key
  };
  file.scans.push(scan);

  console.log(`✓ In-memory scan created: ${scan.id} for ${file_name}`);

  return NextResponse.json({
    scan_id: scan.id,
    file_id: file.id,
    message: 'Scan initiated successfully (in-memory mode)',
  });
}

// GET /api/scans - List all scans
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const file_id = searchParams.get('file_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Use fallback if enabled
    if (isUsingFallback()) {
      return handleFallbackGET(file_id, limit, offset);
    }

    try {
      let queryText = `
        SELECT
          s.*,
          f.file_name,
          f.file_key,
          u.name as initiated_by_name
        FROM scans s
        JOIN figma_files f ON s.file_id = f.id
        LEFT JOIN users u ON s.initiated_by = u.id
      `;

      const params: any[] = [];
      if (file_id) {
        queryText += ` WHERE s.file_id = $1`;
        params.push(file_id);
      }

      queryText += ` ORDER BY s.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await query(queryText, params);

      return NextResponse.json({
        scans: result.rows,
        count: result.rowCount,
      });
    } catch (dbError) {
      // Database failed, switch to fallback mode
      console.log('Database connection failed, switching to in-memory storage');
      enableFallback();
      return handleFallbackGET(file_id, limit, offset);
    }
  } catch (error) {
    console.error('Scan list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scans' },
      { status: 500 }
    );
  }
}

// Fallback GET handler for in-memory storage
function handleFallbackGET(file_id: string | null, limit: number, offset: number) {
  // Flatten all scans from all files
  let allScans: any[] = [];
  memoryScans.forEach((file: any) => {
    file.scans.forEach((scan: any) => {
      allScans.push({
        ...scan,
        file_name: file.file_name,
        file_key: file.file_key
      });
    });
  });

  // Filter by file_id if provided
  if (file_id) {
    allScans = allScans.filter(scan => scan.file_id === parseInt(file_id));
  }

  // Sort by created_at descending
  allScans.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Apply pagination
  const paginatedScans = allScans.slice(offset, offset + limit);

  return NextResponse.json({
    scans: paginatedScans,
    count: paginatedScans.length,
  });
}
