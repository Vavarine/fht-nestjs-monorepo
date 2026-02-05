#!/bin/bash

# Deploy script para aplicar toda a configuração Kubernetes

set -e

NAMESPACE="fiap-hack"
K8S_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

# Aguardar serviços essenciais
echo -e "${YELLOW}⏳ Aguardando PostgreSQL ficar pronto...${NC}"
kubectl wait --for=condition=ready pod -l app=postgres -n "$NAMESPACE" --timeout=300s || true

echo -e "${YELLOW}⏳ Aguardando RabbitMQ ficar pronto...${NC}"
kubectl wait --for=condition=ready pod -l app=rabbitmq -n "$NAMESPACE" --timeout=300s || true

echo -e "${YELLOW}⏳ Aguardando Rustfs ficar pronto...${NC}"
kubectl wait --for=condition=ready pod -l app=rustfs -n "$NAMESPACE" --timeout=300s || true

# Aplicações
echo -e "${YELLOW}7. Deploying API...${NC}"
kubectl apply -f "$K8S_DIR/api.yaml"

echo -e "${YELLOW}8. Deploying Worker...${NC}"
kubectl apply -f "$K8S_DIR/worker.yaml"

# Ingress (optional)
echo -e "${YELLOW}9. Deploying Ingress...${NC}"
kubectl apply -f "$K8S_DIR/ingress.yaml" || echo -e "${YELLOW}⚠️  Ingress pode não estar disponível${NC}"

echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo "📊 Status dos recursos:"
kubectl get pods -n "$NAMESPACE"
echo ""
echo "🔗 Services:"
kubectl get svc -n "$NAMESPACE"
echo ""
echo "💾 PersistentVolumeClaims:"
kubectl get pvc -n "$NAMESPACE"
