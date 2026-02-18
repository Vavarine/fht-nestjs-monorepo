#!/bin/bash

# Deploy script para aplicar toda a configuração Kubernetes

set -e

NAMESPACE="fiap-hack"
K8S_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_IMAGE="${API_IMAGE:-vavarine/fiap-hack-api:latest}"
VIDEO_PROCESSOR_IMAGE="${VIDEO_PROCESSOR_IMAGE:-${WORKER_IMAGE:-vavarine/fiap-hack-video-processor:latest}}"
RUSTFS_IMAGE="${RUSTFS_IMAGE:-rustfs/rustfs:latest}"

echo "🚀 Iniciando deploy do projeto FIAP Hack no Kubernetes..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Criar namespace
echo -e "${YELLOW}1. Criando namespace...${NC}"
kubectl apply -f "$K8S_DIR/namespace.yaml"

# Aguardar namespace
sleep 2

# Criar ConfigMap e Secrets
echo -e "${YELLOW}2. Criando ConfigMap e Secrets...${NC}"
kubectl apply -f "$K8S_DIR/configmap.yaml"
kubectl apply -f "$K8S_DIR/secret.yaml"

# Criar PersistentVolumeClaims
echo -e "${YELLOW}3. Criando Persistent Volumes...${NC}"
kubectl apply -f "$K8S_DIR/persistent-volumes.yaml"

# Aguardar PVCs
sleep 3

# Deployed services
echo -e "${YELLOW}4. Deploying PostgreSQL...${NC}"
kubectl apply -f "$K8S_DIR/postgres.yaml"

echo -e "${YELLOW}5. Deploying RabbitMQ...${NC}"
kubectl apply -f "$K8S_DIR/rabbitmq.yaml"

echo -e "${YELLOW}6. Deploying Rustfs...${NC}"
kubectl apply -f "$K8S_DIR/rustfs.yaml"
kubectl set image deployment/rustfs rustfs="$RUSTFS_IMAGE" -n "$NAMESPACE"

# Aguardar serviços essenciais
echo -e "${YELLOW}⏳ Aguardando PostgreSQL ficar pronto...${NC}"
kubectl wait --for=condition=ready pod -l app=postgres -n "$NAMESPACE" --timeout=300s

echo -e "${YELLOW}⏳ Aguardando RabbitMQ ficar pronto...${NC}"
kubectl wait --for=condition=ready pod -l app=rabbitmq -n "$NAMESPACE" --timeout=300s

echo -e "${YELLOW}⏳ Aguardando Rustfs ficar pronto...${NC}"
kubectl wait --for=condition=ready pod -l app=rustfs -n "$NAMESPACE" --timeout=300s

# Aplicações
echo -e "${YELLOW}7. Deploying API...${NC}"
kubectl apply -f "$K8S_DIR/api.yaml"
kubectl set image deployment/api api="$API_IMAGE" -n "$NAMESPACE"

echo -e "${YELLOW}8. Deploying Video Processor...${NC}"
kubectl delete deployment video-processor -n "$NAMESPACE" --ignore-not-found=true
kubectl delete hpa video-processor-hpa -n "$NAMESPACE" --ignore-not-found=true
kubectl apply -f "$K8S_DIR/video-processor.yaml"
kubectl set image deployment/video-processor video-processor="$VIDEO_PROCESSOR_IMAGE" -n "$NAMESPACE"

# Ingress (optional)
echo -e "${YELLOW}9. Deploying Ingress...${NC}"
kubectl apply -f "$K8S_DIR/ingress.yaml" || echo -e "${YELLOW}⚠️  Ingress pode não estar disponível${NC}"

echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo "🖼️  Imagens aplicadas:"
echo "  API: $API_IMAGE"
echo "  Video Processor: $VIDEO_PROCESSOR_IMAGE"
echo "  RustFS: $RUSTFS_IMAGE"
echo ""
echo "📊 Status dos recursos:"
kubectl get pods -n "$NAMESPACE"
echo ""
echo "🔗 Services:"
kubectl get svc -n "$NAMESPACE"
echo ""
echo "💾 PersistentVolumeClaims:"
kubectl get pvc -n "$NAMESPACE"
