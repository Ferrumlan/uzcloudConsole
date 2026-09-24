#!/bin/bash

TOKEN="a2cd2bd0-6523-4c84-90b1-6a2ea6fe322d|xQAL2WnXxU4ngNzxvgAJ0s9q9gRue2ZPgFFg4Xv7330120af"
BASE="https://uzcloud.stackpoc.in/backend/api"

echo "=== Network Plans (через /plans/service/Network) ==="
curl -s -X GET "$BASE/plans/service/Network" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "=== Network Plans (через /plans/service/Virtual Network) ==="
curl -s -X GET "$BASE/plans/service/Virtual%20Network" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "=== VPC Plans ==="
curl -s -X GET "$BASE/plans/service/VPC" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
