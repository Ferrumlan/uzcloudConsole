#!/bin/bash

TOKEN="a2cd2bd0-6523-4c84-90b1-6a2ea6fe322d|xQAL2WnXxU4ngNzxvgAJ0s9q9gRue2ZPgFFg4Xv7330120af"
BASE="https://uzcloud.stackpoc.in/backend/api"

# Получаем slug первой ВМ
VM_SLUG=$(curl -s -X GET "$BASE/virtual-machines" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq -r '.data[0].slug')

echo "=========================================="
echo "Детали ВМ: $VM_SLUG"
echo "=========================================="

# Пробуем разные endpoints для получения деталей
echo ""
echo "1. GET /virtual-machines/$VM_SLUG"
curl -s -X GET "$BASE/virtual-machines/$VM_SLUG" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '{
    id: .data.id,
    slug: .data.slug,
    name: .data.name,
    state: .data.state,
    public_ip: .data.public_ip,
    private_ip: .data.private_ip,
    hostname: .data.hostname,
    template: .data.template,
    blockstorage_plan_id: .data.blockstorage_plan_id,
    custom_plan: .data.custom_plan,
    has: {
      service_offering: (.data.service_offering != null),
      plan: (.data.plan != null),
      configuration: (.data.configuration != null),
      resources: (.data.resources != null)
    }
  }'

echo ""
echo "2. GET /virtual-machines/$VM_SLUG/details (если есть)"
curl -s -X GET "$BASE/virtual-machines/$VM_SLUG/details" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.' 2>/dev/null || echo "Endpoint не существует"

echo ""
echo "3. GET /virtual-machines/$VM_SLUG/configuration (если есть)"
curl -s -X GET "$BASE/virtual-machines/$VM_SLUG/configuration" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.' 2>/dev/null || echo "Endpoint не существует"

echo ""
echo "4. Проверяем blockstorage plan"
curl -s -X GET "$BASE/blockstorage-plans" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.data[:3] | .[] | {id, slug, name, size, storage}'
