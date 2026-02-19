#!/usr/bin/env bash

set -euo pipefail

CLUSTER_NAME="${1:-fht-cluster}"

echo "Recriando cluster k3d '${CLUSTER_NAME}' com portas publicadas..."

# Remove o cluster antigo, se existir
k3d cluster delete "${CLUSTER_NAME}" >/dev/null 2>&1 || true

# Cria cluster com:
# - API NodePort (30080) exposta no host
# - RustFS Console NodePort (30901) exposta no host
# - RabbitMQ Management NodePort (31672) exposta no host
# - Portas padrão de Ingress expostas no host
k3d cluster create "${CLUSTER_NAME}" \
  -p "30080:30080@loadbalancer" \
  -p "30901:30901@loadbalancer" \
  -p "31672:31672@loadbalancer" \
  -p "8080:80@loadbalancer" \
  -p "8443:443@loadbalancer"
