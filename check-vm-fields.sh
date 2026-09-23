#!/bin/bash

echo "=== OFFERING (конфигурация CPU/RAM) ==="
jq '.data.offering' /tmp/vm_details.json

echo ""
echo "=== IP ADDRESSES ==="
jq '.data.ipaddresses' /tmp/vm_details.json

echo ""
echo "=== OPERATING SYSTEM ==="
jq '.data.operating_system' /tmp/vm_details.json

echo ""
echo "=== STORAGE SETTING ==="
jq '.data.storage_setting' /tmp/vm_details.json
