#!/bin/bash

TOKEN="a2cd2bd0-6523-4c84-90b1-6a2ea6fe322d|xQAL2WnXxU4ngNzxvgAJ0s9q9gRue2ZPgFFg4Xv7330120af"
BASE="https://uzcloud.stackpoc.in/backend/api"

echo "=========================================="
echo "1. Список виртуальных машин (первые 2)"
echo "=========================================="
curl -s -X GET "$BASE/virtual-machines" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.data[:2]'

echo ""
echo "=========================================="
echo "2. Детали первой ВМ"
echo "=========================================="
VM_SLUG=$(curl -s -X GET "$BASE/virtual-machines" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq -r '.data[0].slug')

curl -s -X GET "$BASE/virtual-machines/$VM_SLUG" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "=========================================="
echo "3. Список тарифных планов (первые 3)"
echo "=========================================="
curl -s -X GET "$BASE/plans/service/Virtual%20Machine" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.data[:3]'

echo ""
echo "=========================================="
echo "4. Пример создания ВМ (без отправки)"
echo "=========================================="
echo "Требуемые поля для создания ВМ:"
echo "- name: string"
echo "- hostname: string (опционально)"
echo "- cloud_provider: string (slug)"
echo "- region: string (slug)"
echo "- project: string (slug)"
echo "- template: string (slug)"
echo "- plan: string (slug)"
echo "- billing_cycle: string (monthly/yearly)"
echo "- storage_category: string (standard/premium)"
echo "- disk_size: number (в GB, мин 20)"
echo "- public_ip: boolean"
