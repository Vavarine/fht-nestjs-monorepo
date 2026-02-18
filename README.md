# FIAP Hackathon NestJs Monorepo


## Running the Application
1. Install dependencies:

```bash
   pnpm install
```

2. Start the development environment using Docker (PostgreSQL and RabbitMQ):
```bash
   pnpm docker:dev:up
```

3. Migrate the database:
```bash
   pnpm prisma:dev:migrate
```

4. Generate Prisma client:
```bash
   pnpm prisma:dev:generate
```

5. Start the api application:
```bash
   pnpm start:dev api
```

6. Start the video-processor application:
```bash
   pnpm start:dev video-processor
```

You can now access the API at `http://localhost:3000`, and the rabbitmq management UI at `http://localhost:15672` (default username and password are both `guest`).

## Running prod via Docker Compose
Build api image
```bash
  docker build -t fiap-hack-api:latest -f docker/api.dockerfile .
```

Build video-processor image
```bash
   docker build -t fiap-hack-video-processor:latest -f docker/video-processor.dockerfile .
```

Run docker compose
```bash
   docker compose -f docker-compose.prod.yaml up
```

## Running on Kubernetes (k3d + k3s)

### Prerequisites
- `docker`
- `kubectl`
- `k3d`

### 1. Create (or recreate) local cluster
This script creates a k3d cluster with host ports already mapped for local access.

```bash
./k8s/create-k3d-cluster.sh
```

If script execution is blocked, grant execute permission first:

```bash
chmod +x k8s/create-k3d-cluster.sh k8s/deploy.sh
```

### 2. Deploy all Kubernetes resources
```bash
./k8s/deploy.sh
```

### 3. Validate resources
```bash
kubectl get pods -n fiap-hack
kubectl get svc -n fiap-hack
```

### 4. Access services
- API (NodePort): `http://localhost:30080`
- RustFS Console: `http://localhost:30901/rustfs/console/index.html`
- RabbitMQ Management: `http://localhost:31672`

### 5. Useful debug commands
```bash
kubectl logs -n fiap-hack deployment/api -f
kubectl logs -n fiap-hack deployment/video-processor -f
kubectl get events -n fiap-hack --sort-by='.lastTimestamp'
```

## To-dos

- [ ] Implementar função de trocar status do job no banco via api - Messageria

- [x] Implementar a parte do processamento - ffmpeg.
- [x] Implementar sistema de arquivos compartilhado (Volumes Docker)
- [x] Implementar sistema de arquivos S3 Like subido pelo docker

- [ ] Observabilidade (Prometheus Grafana Worker)
- [ ] Worker de notificacões

- [ ] Passar do docker-compose para K8S
- [ ] Usuários Login Senha (Subir cognito like servico? Fazer internamente?)
- [ ] CI/CD Buildar images
