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

Agora você pode acessar a API em `http://localhost:3000` e a interface de gerenciamento do RabbitMQ em `http://localhost:15672` (usuário e senha padrão: `guest`).

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

### 3. Valide os recursos
```bash
kubectl get pods -n fiap-hack
kubectl get svc -n fiap-hack
```

### 4. Acesse os serviços
- API (NodePort): `http://localhost:30080`
- RustFS Console: `http://localhost:30901`
- RabbitMQ Management: `http://localhost:31672`

### 5. Comandos úteis de debug
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
- [x] Implementa o k8s

- [ ] Observabilidade (Prometheus Grafana Worker)
- [ ] Worker de notificacões

- [ ] Usuários Login Senha (Subir cognito like servico? Fazer internamente?)
- [ ] CI/CD Buildar images
