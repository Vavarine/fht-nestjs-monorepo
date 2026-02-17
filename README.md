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

6. Start the worker application:
```bash
   pnpm start:dev worker
```

You can now access the API at `http://localhost:3000`, and the rabbitmq management UI at `http://localhost:15672` (default username and password are both `guest`).

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

## Running prod via Docker Compose
Build api image
```bash
  docker build -t fiap-hack-api:latest -f docker/api.dockerfile .
```

Build worker image
```bash
   docker build -t fiap-hack-worker:latest -f docker/worker.dockerfile .
```

Run docker compose
```bash
   docker compose -f docker-compose.prod.yaml up
```

## To-dos

- [ ] Implementar função de trocar status do job no banco via api - Messageria

- [ ] Implementar a parte do processamento - ffmpeg.
- [ ] Implementar sistema de arquivos compartilhado (Volumes Docker)

- [x] Observabilidade (Prometheus Grafana Worker)

- [ ] Passar do docker-compose para K8S
- [ ] Usuários Login Senha (Subir cognito like servico? Fazer internamente?)
- [ ] CI/CD Buildar images

- [ ] Implementar sistema de arquivos S3 Like subido pelo docker