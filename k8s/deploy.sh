#!/bin/bash

# Deploy script para aplicar toda a configuração Kubernetes

set -e

NAMESPACE="fiap-hack"
K8S_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_IMAGE="${API_IMAGE:-vavarine/fiap-hack-api:latest}"
VIDEO_PROCESSOR_IMAGE="${VIDEO_PROCESSOR_IMAGE:-${WORKER_IMAGE:-vavarine/fiap-hack-video-processor:latest}}"
GATEKEEPER_IMAGE="${GATEKEEPER_IMAGE:-vavarine/fiap-hack-gatekeeper:latest}"
USER_NOTIFIER_IMAGE="${USER_NOTIFIER_IMAGE:-vavarine/fiap-hack-user-notifier:latest}"
RUSTFS_DEPLOY_MODE="${RUSTFS_DEPLOY_MODE:-helm}" # ou "manifest"
RUSTFS_IMAGE="${RUSTFS_IMAGE:-rustfs/rustfs:latest}"
RUSTFS_HELM_REPO_URL="${RUSTFS_HELM_REPO_URL:-https://charts.rustfs.com}"
RUSTFS_HELM_CHART="${RUSTFS_HELM_CHART:-rustfs/rustfs}"

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

echo -e "${YELLOW}5.1. Deploying Cognito Local...${NC}"
kubectl apply -f "$K8S_DIR/cognito.yaml"

echo -e "${YELLOW}⏳ Aguardando Cognito Local ficar pronto...${NC}"
kubectl wait --for=condition=ready pod -l app=cognito-local -n "$NAMESPACE" --timeout=120s

echo -e "${YELLOW}5.2. Bootstrapping Cognito user pool e app client...${NC}"
kubectl delete job cognito-bootstrap -n "$NAMESPACE" --ignore-not-found=true
kubectl apply -f "$K8S_DIR/cognito-bootstrap-job.yaml"
if ! kubectl wait --for=condition=complete job/cognito-bootstrap -n "$NAMESPACE" --timeout=120s; then
  echo "❌ Falha no bootstrap do Cognito."
  kubectl logs job/cognito-bootstrap -n "$NAMESPACE" --tail=200 || true
  exit 1
fi
echo -e "${GREEN}Cognito bootstrap concluído. IDs:${NC}"
kubectl logs job/cognito-bootstrap -n "$NAMESPACE" --tail=10

COGNITO_POOL_ID=$(kubectl logs job/cognito-bootstrap -n "$NAMESPACE" | grep "User Pool ID:" | awk '{print $NF}')
COGNITO_CLIENT_ID=$(kubectl logs job/cognito-bootstrap -n "$NAMESPACE" | grep "Client ID:" | awk '{print $NF}')
kubectl patch configmap app-config -n "$NAMESPACE" \
  --type merge \
  -p "{\"data\":{\"COGNITO_USER_POOL_ID\":\"$COGNITO_POOL_ID\",\"COGNITO_CLIENT_ID\":\"$COGNITO_CLIENT_ID\"}}"
echo -e "${GREEN}ConfigMap atualizado: COGNITO_USER_POOL_ID=$COGNITO_POOL_ID | COGNITO_CLIENT_ID=$COGNITO_CLIENT_ID${NC}"

echo -e "${YELLOW}6. Deploying Rustfs...${NC}"
if [ "$RUSTFS_DEPLOY_MODE" = "helm" ]; then
  if ! command -v helm >/dev/null 2>&1; then
    echo "❌ Helm não encontrado. Instale Helm v3+ ou use RUSTFS_DEPLOY_MODE=manifest."
    exit 1
  fi

  # Cleanup de recursos legados baseados em manifesto
  kubectl delete deployment rustfs -n "$NAMESPACE" --ignore-not-found=true
  kubectl delete statefulset rustfs -n "$NAMESPACE" --ignore-not-found=true
  kubectl delete svc rustfs rustfs-svc rustfs-management -n "$NAMESPACE" --ignore-not-found=true

  if ! helm repo add rustfs "$RUSTFS_HELM_REPO_URL" --force-update; then
    echo "❌ Falha ao adicionar repo helm do RustFS: $RUSTFS_HELM_REPO_URL"
    echo "   Tente definir RUSTFS_HELM_REPO_URL correto ou use RUSTFS_DEPLOY_MODE=manifest."
    exit 1
  fi
  helm repo update
  helm upgrade --install rustfs "$RUSTFS_HELM_CHART" \
    -n "$NAMESPACE" \
    -f "$K8S_DIR/rustfs-helm-values.yaml"
else
  kubectl apply -f "$K8S_DIR/rustfs.yaml"
  kubectl set image deployment/rustfs rustfs="$RUSTFS_IMAGE" -n "$NAMESPACE"
fi

# Aguardar serviços essenciais
echo -e "${YELLOW}⏳ Aguardando PostgreSQL ficar pronto...${NC}"
kubectl wait --for=condition=ready pod -l app=postgres -n "$NAMESPACE" --timeout=300s

echo -e "${YELLOW}⏳ Aguardando RabbitMQ ficar pronto...${NC}"
kubectl wait --for=condition=ready pod -l app=rabbitmq -n "$NAMESPACE" --timeout=300s

echo -e "${YELLOW}⏳ Aguardando Rustfs ficar pronto...${NC}"
if kubectl get statefulset rustfs -n "$NAMESPACE" >/dev/null 2>&1; then
  kubectl rollout status statefulset/rustfs -n "$NAMESPACE" --timeout=300s
elif kubectl get deployment rustfs -n "$NAMESPACE" >/dev/null 2>&1; then
  kubectl rollout status deployment/rustfs -n "$NAMESPACE" --timeout=300s
else
  kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=rustfs -n "$NAMESPACE" --timeout=300s
fi

echo -e "${YELLOW}7. Garantindo bucket no Rustfs...${NC}"
kubectl delete job rustfs-bootstrap-bucket -n "$NAMESPACE" --ignore-not-found=true
kubectl apply -f "$K8S_DIR/rustfs-bootstrap-bucket-job.yaml"
if ! kubectl wait --for=condition=complete job/rustfs-bootstrap-bucket -n "$NAMESPACE" --timeout=300s; then
  echo "❌ Falha ao criar bucket no RustFS."
  kubectl logs job/rustfs-bootstrap-bucket -n "$NAMESPACE" --tail=200 || true
  exit 1
fi

# Aplicações
echo -e "${YELLOW}8. Deploying API...${NC}"
kubectl apply -f "$K8S_DIR/api.yaml"
kubectl set image deployment/api api="$API_IMAGE" -n "$NAMESPACE"

echo -e "${YELLOW}9. Deploying Video Processor...${NC}"
kubectl delete deployment video-processor -n "$NAMESPACE" --ignore-not-found=true
kubectl delete hpa video-processor-hpa -n "$NAMESPACE" --ignore-not-found=true
kubectl apply -f "$K8S_DIR/video-processor.yaml"
kubectl set image deployment/video-processor video-processor="$VIDEO_PROCESSOR_IMAGE" -n "$NAMESPACE"

echo -e "${YELLOW}10. Deploying User Notifier...${NC}"
kubectl delete deployment user-notifier -n "$NAMESPACE" --ignore-not-found=true
kubectl delete hpa user-notifier-hpa -n "$NAMESPACE" --ignore-not-found=true
kubectl apply -f "$K8S_DIR/user-notifier.yaml"
kubectl set image deployment/user-notifier user-notifier="$USER_NOTIFIER_IMAGE" -n "$NAMESPACE"

echo -e "${YELLOW}11. Deploying Gatekeeper...${NC}"
kubectl delete deployment gatekeeper -n "$NAMESPACE" --ignore-not-found=true
kubectl delete hpa gatekeeper-hpa -n "$NAMESPACE" --ignore-not-found=true
kubectl apply -f "$K8S_DIR/gatekeeper.yaml"
kubectl set image deployment/gatekeeper gatekeeper="$GATEKEEPER_IMAGE" -n "$NAMESPACE"

# Ingress (optional)
echo -e "${YELLOW}12. Deploying Ingress...${NC}"
kubectl apply -f "$K8S_DIR/ingress.yaml" || echo -e "${YELLOW}⚠️  Ingress pode não estar disponível${NC}"

echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo "🖼️  Imagens aplicadas:"
echo "  API: $API_IMAGE"
echo "  Video Processor: $VIDEO_PROCESSOR_IMAGE"
echo "  User Notifier: $USER_NOTIFIER_IMAGE"
echo "  Gatekeeper: $GATEKEEPER_IMAGE"
if [ "$RUSTFS_DEPLOY_MODE" = "helm" ]; then
  echo "  RustFS: via Helm chart $RUSTFS_HELM_CHART"
else
  echo "  RustFS: via manifesto ($RUSTFS_IMAGE)"
fi
echo ""
echo "📊 Status dos recursos:"
kubectl get pods -n "$NAMESPACE"
echo ""
echo "🔗 Services:"
kubectl get svc -n "$NAMESPACE"
echo ""
echo "💾 PersistentVolumeClaims:"
kubectl get pvc -n "$NAMESPACE"

echo "Acesso API (NodePort):      http://localhost:30080"
echo "Acesso Gatekeeper:          http://localhost:30081"
echo "RustFS Console:             http://localhost:30901"
echo "RabbitMQ Management:        http://localhost:31672"
echo "Acesso Ingress HTTP:        http://localhost:8080"
echo "Acesso Ingress HTTPS:       https://localhost:8443"
