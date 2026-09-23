#!/bin/bash

TOKEN="a2cd2bd0-6523-4c84-90b1-6a2ea6fe322d|xQAL2WnXxU4ngNzxvgAJ0s9q9gRue2ZPgFFg4Xv7330120af"
BASE="https://uzcloud.stackpoc.in/backend/api"

# Получаем slug первой ВМ
VM_SLUG=$(curl -s -X GET "$BASE/virtual-machines" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data'][0]['slug'])")

echo "=========================================="
echo "Детали ВМ: $VM_SLUG"
echo "=========================================="

echo ""
echo "Полный JSON ответ:"
curl -s -X GET "$BASE/virtual-machines/$VM_SLUG" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" > /tmp/vm_details.json

echo "Сохранено в /tmp/vm_details.json"
echo ""
echo "Размер файла:"
ls -lh /tmp/vm_details.json

echo ""
echo "Первые 100 строк:"
head -n 100 /tmp/vm_details.json
