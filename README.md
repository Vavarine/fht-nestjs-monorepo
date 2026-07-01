# FIAP Hackathon NestJS Monorepo

[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Lauraellen_fht-nestjs-monorepo\&metric=coverage\&token=95f37a91b4f51c4e850222c62aa15edd671486e5)](https://sonarcloud.io/summary/new_code?id=Lauraellen_fht-nestjs-monorepo)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Lauraellen_fht-nestjs-monorepo\&metric=bugs\&token=95f37a91b4f51c4e850222c62aa15edd671486e5)](https://sonarcloud.io/summary/new_code?id=Lauraellen_fht-nestjs-monorepo)

## 🚀 Rodando a aplicação

### Início rápido (recomendado)

1. Instale as dependências:

```bash
pnpm install
```

2. Suba toda a infraestrutura (PostgreSQL, RabbitMQ, RustFS, Prometheus e Grafana):

```bash
pnpm docker:dev:up
```

3. Execute as migrations:

```bash
pnpm prisma:dev:migrate
```

4. Gere o Prisma Client:

```bash
pnpm prisma:dev:generate
```

5. Inicie a API:

```bash
pnpm start:dev api
```

6. Inicie o Video Processor:

```bash
pnpm start:dev video-processor
```

7. Inicie o Gatekeeper:

```bash
pnpm start:dev gatekeeper
```

8. Inicie o User Notifier:

```bash
pnpm start:dev user-notifier
```

### Serviços disponíveis

| Serviço             | Endereço                                 |
| ------------------- | ---------------------------------------- |
| API                 | http://localhost:3000                    |
| Video Processor     | http://localhost:3001                    |
| User Notifier       | http://localhost:3002                    |
| Grafana             | http://localhost:3003 (`admin/admin123`) |
| Prometheus          | http://localhost:9090                    |
| RabbitMQ Management | http://localhost:15672 (`guest/guest`)   |
| RustFS Console      | http://localhost:9001                    |

## 📦 Comandos Docker úteis

```bash
# Ver logs
pnpm docker:dev:logs

# Parar containers
pnpm docker:dev:down

# Parar e remover volumes
pnpm docker:dev:clean
```

## ✅ Verificando se está funcionando

```bash
curl http://localhost:3000/
curl http://localhost:3000/metrics
curl http://localhost:3001/metrics
curl http://localhost:3002/metrics
```

---

# Rodando em produção com Docker Compose

## Build das imagens

API

```bash
docker build -t fiap-hack-api:latest -f docker/api.dockerfile .
```

Video Processor

```bash
docker build -t fiap-hack-video-processor:latest -f docker/video-processor.dockerfile .
```

Gatekeeper

```bash
docker build -t fiap-hack-gatekeeper:latest -f docker/gatekeeper.dockerfile .
```

User Notifier

```bash
docker build -t fiap-hack-user-notifier:latest -f docker/user-notifier.dockerfile .
```

## Subir ambiente

```bash
docker compose -f docker-compose.prod.yaml up
```

---

# Rodando no Kubernetes (k3d)

## Pré-requisitos

* Docker
* kubectl
* k3d
* Helm 3+

## 1. Criar o cluster

```bash
./k8s/create-k3d-cluster.sh
```

Caso necessário:

```bash
chmod +x k8s/create-k3d-cluster.sh
chmod +x k8s/deploy.sh
```

## 2. Build e import das imagens

```bash
docker build -t fiap-hack-api:latest -f docker/api.dockerfile .

docker build -t fiap-hack-video-processor:latest -f docker/video-processor.dockerfile .

docker build -t fiap-hack-gatekeeper:latest -f docker/gatekeeper.dockerfile .

docker build -t fiap-hack-user-notifier:latest -f docker/user-notifier.dockerfile .

k3d image import \
    fiap-hack-api:latest \
    fiap-hack-video-processor:latest \
    fiap-hack-gatekeeper:latest \
    fiap-hack-user-notifier:latest \
    -c fht-cluster
```

> **Windows:** caso utilize o executável diretamente, substitua `k3d` por `k3d.exe`.

## 3. Deploy

```bash
./k8s/deploy.sh
```

O RustFS é instalado via Helm utilizando:

```
k8s/rustfs-helm-values.yaml
```

Caso o Helm apresente problemas:

```bash
RUSTFS_DEPLOY_MODE=manifest ./k8s/deploy.sh
```

Para depuração:

```bash
helm repo add rustfs https://charts.rustfs.com --force-update
helm repo update
helm search repo rustfs
```

## 4. Validar recursos

```bash
kubectl get pods -n fiap-hack

kubectl get svc -n fiap-hack
```

## 5. Serviços disponíveis

| Serviço             | Endereço                                  |
| ------------------- | ----------------------------------------- |
| API                 | http://localhost:30080                    |
| User Notifier       | http://localhost:30082                    |
| Grafana             | http://localhost:30030 (`admin/admin123`) |
| Prometheus          | http://localhost:30090                    |
| RabbitMQ Management | http://localhost:31672 (`guest/guest`)    |
| RustFS Console      | http://localhost:30901                    |

## 6. Comandos úteis

```bash
kubectl logs -n fiap-hack deployment/api -f

kubectl logs -n fiap-hack deployment/video-processor -f

kubectl logs -n fiap-hack deployment/gatekeeper -f

kubectl logs -n fiap-hack deployment/user-notifier -f

kubectl get events -n fiap-hack --sort-by='.lastTimestamp'
```

---

# 🧪 Testes

## Testes unitários

Executar todos:

```bash
pnpm test
```

Coverage:

```bash
pnpm test:cov
```

Modo watch:

```bash
pnpm test:watch
```

## Testes E2E

### Com mocks

```bash
pnpm test:e2e
```

### Com infraestrutura completa

```bash
pnpm docker:dev:up

pnpm test:e2e:full
```

### Coverage

```bash
pnpm test:e2e:cov
```

---

# 🚀 Teste de carga (k6)

O projeto possui um teste de carga em:

```
k6/api-load.ts
```

Endpoint utilizado:

```
POST /video-processing-jobs
```

O upload utiliza, por padrão:

```
k6/exemple.mp4
```

## Executar localmente

```bash
pnpm loadtest:k6
```

## Executar via Docker

```bash
pnpm loadtest:k6:docker
```

## Alterar URL

```bash
BASE_URL=http://localhost:30080 TARGET_PATH=/video-processing-jobs pnpm loadtest:k6
```

## Alterar arquivo de vídeo

```bash
VIDEO_FILE_PATH=./k6/exemple.mp4 pnpm loadtest:k6
```

## Endpoint protegido

```bash
AUTH_TOKEN=<seu_token_jwt> pnpm loadtest:k6
```

---

# ✅ To-do

* [x] Atualização de status do job via mensageria
* [x] Processamento de vídeo com FFmpeg
* [x] Sistema de arquivos compartilhado (Docker Volumes)
* [x] Armazenamento S3-like
* [x] Kubernetes
* [x] Observabilidade (Prometheus + Grafana)
* [ ] Worker de notificações
* [ ] Login e autenticação de usuários
* [ ] Pipeline de CI/CD para build e publicação das imagens
