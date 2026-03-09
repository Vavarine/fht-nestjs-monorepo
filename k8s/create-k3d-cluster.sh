#!/usr/bin/env bash

set -euo pipefail

CLUSTER_NAME="${1:-fht-cluster}"

# Detecta se está no Windows e usa k3d.exe, senão usa k3d
if command -v k3d.exe &> /dev/null; then
    K3D_CMD="k3d.exe"
elif [ -f "../k3d.exe" ]; then
    K3D_CMD="../k3d.exe"
elif [ -f "./k3d.exe" ]; then
    K3D_CMD="./k3d.exe"
else
    K3D_CMD="k3d"
fi

echo "Recriando cluster k3d '${CLUSTER_NAME}' com portas publicadas..."

# Remove o cluster antigo, se existir
$K3D_CMD cluster delete "${CLUSTER_NAME}" >/dev/null 2>&1 || true

# Cria cluster com:
# - API NodePort (30080) exposta no host
# - Prometheus NodePort (30090) exposta no host
# - Grafana NodePort (30030) exposta no host
# - User Notifier NodePort (30082) exposta no host
# - RustFS Console NodePort (30901) exposta no host
# - RabbitMQ Management NodePort (31672) exposta no host
# - Portas padrão de Ingress expostas no host
$K3D_CMD cluster create "${CLUSTER_NAME}" \
  -p "30080:30080@loadbalancer" \
  -p "30082:30082@loadbalancer" \
  -p "30090:30090@loadbalancer" \
  -p "30030:30030@loadbalancer" \
  -p "30901:30901@loadbalancer" \
  -p "31672:31672@loadbalancer" \
  -p "8080:80@loadbalancer" \
  -p "8443:443@loadbalancer"
