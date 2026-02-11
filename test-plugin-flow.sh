#!/bin/bash

echo "=== Testing Plugin Flow ==="
echo ""

# Step 1: Create scan
echo "1. Creating scan..."
SCAN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/scans \
  -H "Content-Type: application/json" \
  -d '{"file_key":"test-flow","file_name":"Test Flow","file_url":"https://www.figma.com/file/test-flow","scan_type":"single_page","pages":[{"page_id":"page1","page_name":"Page 1"}]}')

echo "Response: $SCAN_RESPONSE"
SCAN_ID=$(echo $SCAN_RESPONSE | grep -o '"scan_id":[0-9]*' | grep -o '[0-9]*')
echo "Scan ID: $SCAN_ID"
echo ""

# Step 2: Upload issues
echo "2. Uploading issues..."
ISSUES_RESPONSE=$(curl -s -X POST http://localhost:3000/api/scans/$SCAN_ID/issues \
  -H "Content-Type: application/json" \
  -d '{"issues":[{"page_id":"page1","element_id":"elem1","element_name":"Button","category":"color_contrast","severity":"high","wcag_criteria":"1.4.3","wcag_level":"AA","description":"Low contrast","current_value":"2.5:1","required_value":"4.5:1","fix_recommendation":"Increase contrast","screenshot_url":"","location_x":100,"location_y":200,"frame_name":"Frame"}]}')

echo "Response: $ISSUES_RESPONSE"
echo ""

# Step 3: Verify scan
echo "3. Getting all scans..."
curl -s http://localhost:3000/api/scans | json_pp 2>/dev/null || cat
echo ""

echo "=== Test Complete ==="
