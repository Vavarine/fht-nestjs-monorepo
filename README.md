# FIAP Hackathon NestJs Monorepo


## Rodando a Aplicação

### 🚀 **Início Rápido (Recomendado)**

1. Instale as dependências:
```bash
pnpm install
```

2. **Suba TODA a infraestrutura** (PostgreSQL + RabbitMQ + RustFS + Prometheus + Grafana):
```bash
pnpm docker:dev:up
```

3. Rode as migrations do banco:
```bash
pnpm prisma:dev:migrate
```

4. Gere o client do Prisma:
```bash
pnpm prisma:dev:generate
```

5. Inicie a aplicação da API:
```bash
pnpm start:dev api
```

6. Inicie a aplicação video-processor:
```bash
pnpm start:dev video-processor
```

7. Inicie a aplicação user-notifier:
```bash
pnpm start:dev user-notifier
```

**🎯 Pronto! Agora você pode acessar:**
- **API**: http://localhost:3000
- **Video Processor**: http://localhost:3001
- **User Notifier**: http://localhost:3002
- **Grafana** (Dashboards): http://localhost:3003 (admin/admin123)
- **Prometheus** (Métricas): http://localhost:9090
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **RustFS Console**: http://localhost:9001

### 📊 **Comandos Docker Úteis**
```bash
# Ver logs em tempo real
pnpm docker:dev:logs

# Parar tudo
pnpm docker:dev:down

# Parar e limpar volumes (reset completo)
pnpm docker:dev:clean
```

## ✅ **Verificar se está funcionando**
```bash
# Testar API
curl http://localhost:3000/

# Testar métricas da API  
curl http://localhost:3000/metrics

# Testar métricas do Video Processor
curl http://localhost:3001/metrics

# Testar métricas do User Notifier
curl http://localhost:3002/metrics
```
---

## Rodando em Produção via Docker Compose
Build da imagem da API:
```bash
  docker build -t fiap-hack-api:latest -f docker/api.dockerfile .
```

Build da imagem do video-processor:
```bash
   docker build -t fiap-hack-video-processor:latest -f docker/video-processor.dockerfile .
```

Build da imagem do user-notifier:
```bash
   docker build -t fiap-hack-user-notifier:latest -f docker/user-notifier.dockerfile .
```

Suba com docker compose:
```bash
   docker compose -f docker-compose.prod.yaml up
```

## Rodando no Kubernetes k3d

### Pré-requisitos
- `docker`
- `kubectl`
- `k3d`
- `helm` (v3+)

### 1. Crie (ou recrie) o cluster local
Esse script cria um cluster k3d com portas do host já mapeadas para acesso local.

```bash
./k8s/create-k3d-cluster.sh
```

Se a execução de script estiver bloqueada, dê permissão antes:

```bash
chmod +x k8s/create-k3d-cluster.sh k8s/deploy.sh
```

### 2. Build e import das imagens Docker (desenvolvimento local)
```bash
# Build das imagens
docker build -t fiap-hack-api:latest -f docker/api.dockerfile .
docker build -t fiap-hack-video-processor:latest -f docker/video-processor.dockerfile .
docker build -t fiap-hack-user-notifier:latest -f docker/user-notifier.dockerfile .

# Import para o k3d cluster
./k3d.exe image import fiap-hack-api:latest fiap-hack-video-processor:latest fiap-hack-user-notifier:latest -c fht-cluster
```

### 3. Faça o deploy de todos os recursos Kubernetes
```bash
./k8s/deploy.sh
```

Observação: o RustFS é instalado via Helm (`rustfs/rustfs`) usando o arquivo `k8s/rustfs-helm-values.yaml`.

Se o Helm falhar no seu ambiente, você pode usar o modo manifesto (fallback):
```bash
RUSTFS_DEPLOY_MODE=manifest ./k8s/deploy.sh
```

Para depurar erro de Helm:
```bash
helm repo add rustfs https://charts.rustfs.com --force-update
helm repo update
helm search repo rustfs
```

### 4. Valide os recursos
```bash
kubectl get pods -n fiap-hack
kubectl get svc -n fiap-hack
```

### 5. Acesse os serviços
- **API** (NodePort): http://localhost:30080
- **User Notifier** (NodePort): http://localhost:30082
- **Grafana** (Dashboards): http://localhost:30030 (admin/admin123)
- **Prometheus** (Métricas): http://localhost:30090
- **RustFS Console**: http://localhost:30901
- **RabbitMQ Management**: http://localhost:31672 (guest/guest)

### 6. Comandos úteis de debug
```bash
kubectl logs -n fiap-hack deployment/api -f
kubectl logs -n fiap-hack deployment/video-processor -f
kubectl logs -n fiap-hack deployment/user-notifier -f
kubectl get events -n fiap-hack --sort-by='.lastTimestamp'
```

## 🧪 Executando Testes

O projeto possui uma suíte completa de testes unitários para os use cases.

### Testes Unitários

#### Executar todos os testes
```bash
pnpm test
```

#### Executar testes com coverage
```bash
pnpm test:cov
```

#### Executar testes em modo watch (desenvolvimento)
```bash
pnpm test:watch
```

### Testes E2E (End-to-End)

#### Testes E2E com mocks (rápido, sem infraestrutura)
```bash
pnpm test:e2e
```

#### Testes E2E completos (requer infraestrutura)
```bash
# 1. Subir toda a infraestrutura
pnpm docker:dev:up

# 2. Executar testes E2E completos
pnpm test:e2e:full
```

#### Testes E2E com coverage
```bash
pnpm test:e2e:cov
```
## Teste de carga com k6

O projeto possui um script de carga em `k6/api-load.ts` para o endpoint:
- `POST /video-processing-jobs` (multipart/form-data)

O upload usa o arquivo local `k6/exemple.mp4` por padrão.

### Opção 1: k6 instalado localmente
```bash
pnpm loadtest:k6
```

### Opção 2: rodar k6 via Docker
```bash
pnpm loadtest:k6:docker
```

### Personalizar alvo do teste
```bash
BASE_URL=http://localhost:30080 TARGET_PATH=/video-processing-jobs pnpm loadtest:k6
```

### Personalizar arquivo de vídeo de entrada
```bash
VIDEO_FILE_PATH=./k6/exemple.mp4 pnpm loadtest:k6
```

### Endpoint protegido (Bearer token)
```bash
AUTH_TOKEN=<seu_token_jwt> pnpm loadtest:k6
```

## To-dos

- [x] Implementar função de trocar status do job no banco via api - Messageria

- [x] Implementar a parte do processamento - ffmpeg.
- [x] Implementar sistema de arquivos compartilhado (Volumes Docker)
- [x] Implementar sistema de arquivos S3 Like subido pelo docker
- [x] Implementa o k8s
- [x] Observabilidade (Prometheus Grafana)
- [ ] Worker de notificacões

- [ ] Usuários Login Senha (Subir cognito like servico? Fazer internamente?)
- [ ] CI/CD Buildar images
