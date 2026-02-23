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

## Observabilidade (Prometheus + Grafana)

O projeto inclui um sistema completo de observabilidade para monitorar o worker de processamento de vídeo:

### Serviços de Monitoramento

- **Prometheus**: `http://localhost:9090` - Coleta e armazena métricas
- **Grafana**: `http://localhost:3001` - Visualização de dashboards (admin/admin)

### Métricas Disponíveis

O worker expõe métricas específicas para processamento de vídeo:

- `video_processing_duration_seconds` - Duração do processamento de vídeos
- `video_processing_total` - Total de vídeos processados (sucesso/erro)
- `video_processing_errors_total` - Total de erros por tipo e estágio
- `video_processing_queue_size` - Tamanho atual da fila
- `ffmpeg_command_duration_seconds` - Duração dos comandos FFmpeg
- `video_file_size_bytes` - Tamanho dos arquivos processados
- `worker_memory_usage_bytes` - Uso de memória do worker

### Dashboard

O dashboard "Video Processing Worker - Observabilidade" inclui:

- Taxa de processamento em tempo real
- Duração média de processamento
- Tamanho da fila
- Taxa de erros
- Percentis de tempo de FFmpeg
- Uso de memória
- Análise de tamanhos de arquivo

### Acessando Métricas

- Worker métricas: `http://localhost:3002/metrics`
- Prometheus targets: `http://localhost:9090/targets`

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
- RustFS Console: `http://localhost:30901`
- RabbitMQ Management: `http://localhost:31672`

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
- [x] Observabilidade (Prometheus Grafana Worker)
- [ ] Worker de notificacões
- [ ] Usuários Login Senha (Subir cognito like servico? Fazer internamente?)
- [ ] CI/CD Buildar images
