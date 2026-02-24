# FIAP Hackathon NestJs Monorepo


## Rodando a Aplicação
1. Instale as dependências:

```bash
   pnpm install
```

2. Inicie o ambiente de desenvolvimento com Docker (PostgreSQL e RabbitMQ):
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

Agora você pode acessar:
- **API**: `http://localhost:3000` 
- **Video Processor**: `http://localhost:3002`
- **RabbitMQ Management**: `http://localhost:15672` (usuário e senha padrão: `guest`)

## ✅ **Verificar se está funcionando**
```bash
# Testar API
curl http://localhost:3000/

# Testar métricas da API  
curl http://localhost:3000/metrics

# Testar métricas do Video Processor
curl http://localhost:3002/metrics
```

## 🚀 **Desenvolvimento com Observabilidade (Docker)**

Quer métricas no desenvolvimento local? Use este comando para subir **PostgreSQL + RabbitMQ + Prometheus + Grafana**:

### **1. Subir infraestrutura + observabilidade:**
```bash
# ⚠️ IMPORTANTE: Pare outros ambientes antes
pnpm docker:dev:down

# Subir toda infraestrutura com observabilidade
pnpm docker:observability:up

# Verificar status
docker compose -f docker-compose.observability.yaml ps

# Ver logs (opcional)
pnpm docker:observability:logs
```

**🚨 Conflito de portas?** Se der erro de "port already allocated":
```bash
# Verificar o que está usando as portas
netstat -ano | findstr ":5432 :5672"

# Parar PostgreSQL nativo (Windows)
Get-Service -Name "*postgres*" | Stop-Service

# Ou matar processo específico
taskkill /PID <PID_NUMBER> /F
```

### **2. Rodar aplicações (nativas):**
```bash
# Migrations e client Prisma (usando porta 5433 do observability)
pnpm observability:migrate
pnpm observability:generate

# Terminal 1: API com métricas
pnpm observability:api

# Terminal 2: Video Processor com métricas  
pnpm observability:worker
```

**💡 Dica:** O ambiente observability usa PostgreSQL na **porta 5433** para evitar conflitos.

### **3. Acessar serviços:**
- **API**: `http://localhost:3000`
- **Video Processor**: `http://localhost:3002`  
- **🔥 Grafana**: `http://localhost:3001` (admin/admin123)
- **📈 Prometheus**: `http://localhost:9090`
- **🐰 RabbitMQ**: `http://localhost:15672`
- **🗄️ PostgreSQL**: `localhost:5433` (porta diferente para evitar conflitos)

### **4. Dashboards pré-configurados no Grafana:**
- **📊 Video Processing System**: Jobs criados/processados, tempo médio
- **🚀 API Performance**: Request rate, latência, erros por status code
- **📈 Upload Success Rate**: Taxa de sucesso de uploads

### **5. Para parar tudo:**
```bash
# Parar containers
pnpm docker:observability:down

# Parar containers + remover volumes (limpar dados)
pnpm docker:observability:down && docker compose -f docker-compose.observability.yaml down -v
```

## ⚡ **3 Formas de rodar:**

| Modo | Comando | Observabilidade | Características |
|------|---------|----------------|-----------------|
| **🔧 Docker Simples** | `pnpm docker:dev:up` | ❌ | Rápido, só infra |
| **📊 Docker + Grafana** | `pnpm docker:observability:up` | ✅ | **Métricas em dev** |
| **☸️ Kubernetes** | `./k8s/deploy.sh` | ✅ | Produção completa |

## Rodando em Produção via Docker Compose
Build da imagem da API:
```bash
  docker build -t fiap-hack-api:latest -f docker/api.dockerfile .
```

Build da imagem do video-processor:
```bash
   docker build -t fiap-hack-video-processor:latest -f docker/video-processor.dockerfile .
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

### 2. Faça o deploy de todos os recursos Kubernetes
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

### 3. Valide os recursos
```bash
kubectl get pods -n fiap-hack
kubectl get svc -n fiap-hack
```

### 4. Acesse os serviços
- API (NodePort): `http://localhost:30080`
- Prometheus: `http://localhost:30090`
- Grafana: `http://localhost:30030`
- RustFS Console: `http://localhost:30901`
- RabbitMQ Management: `http://localhost:31672`
- **Prometheus: `http://localhost:30090`**
- **Grafana: `http://localhost:30030` (usuário: admin, senha: admin123)**

#### 🔍 **Observabilidade**
O sistema inclui monitoramento completo com **Prometheus** e **Grafana**:

**Dashboards disponíveis no Grafana:**
- **Video Processing System**: Métricas de jobs de vídeo (criados vs processados, tempo de processamento, taxa de erro)
- **API Performance**: Latência, rate de requests, códigos de status HTTP
- **System Resources**: CPU, memória dos pods, conexões do banco, storage utilizado

**Métricas coletadas:**
- Métricas HTTP (latência, throughput, erros)
- Métricas de processamento de vídeos (duração, sucesso/falha)
- Métricas de infraestrutura (RabbitMQ, PostgreSQL, recursos do sistema)
- Métricas customizadas de negócio

### 5. Comandos úteis de debug
```bash
kubectl logs -n fiap-hack deployment/api -f
kubectl logs -n fiap-hack deployment/video-processor -f
kubectl get events -n fiap-hack --sort-by='.lastTimestamp'
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

- [x] **Observabilidade (Prometheus Grafana)** ✨
- [ ] Worker de notificacões

- [ ] Usuários Login Senha (Subir cognito like servico? Fazer internamente?)
- [ ] CI/CD Buildar images
