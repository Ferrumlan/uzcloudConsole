#!/bin/bash

TOKEN="a2cd2bd0-6523-4c84-90b1-6a2ea6fe322d|xQAL2WnXxU4ngNzxvgAJ0s9q9gRue2ZPgFFg4Xv7330120af"
BASE="https://uzcloud.stackpoc.in/backend/api"

echo "=== Network Plans ==="
curl -s -X GET "$BASE/network-plans" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "=== Network Offerings ==="
curl -s -X GET "$BASE/network-offerings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
