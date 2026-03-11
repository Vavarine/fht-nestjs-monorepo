# Observabilidade - Prometheus & Grafana

## 📊 O que é observado

### 1. **Métricas da API**
- **http_requests_total**: Total de requests HTTP
- **http_request_duration_seconds**: Duração das requests HTTP
- **video_uploads_total**: Total de tentativas de upload
- **video_uploads_successful_total**: Uploads bem-sucedidos
- **video_jobs_created_total**: Jobs de vídeo criados

### 2. **Métricas do Video Processor**
- **video_jobs_processed_total**: Jobs processados com sucesso
- **video_jobs_failed_total**: Jobs que falharam
- **video_processing_duration_seconds**: Tempo total de processamento
- **ffmpeg_execution_duration_seconds**: Tempo de execução do FFmpeg
- **video_file_size_mb_processed**: Tamanho dos arquivos processados
- **active_video_processing_jobs**: Jobs ativos no momento

### 3. **Métricas do Sistema**
- **active_database_connections**: Conexões ativas no banco
- **rabbitmq_queue_messages**: Mensagens na fila do RabbitMQ
- **container_cpu_usage_seconds_total**: CPU dos containers
- **container_memory_usage_bytes**: Memória dos containers

## 🚀 Como testar

### 1. Deploy com observabilidade
```bash
# Deploy completo incluindo Prometheus e Grafana
./k8s/deploy.sh
```

### 2. Verificar se as métricas estão sendo coletadas
```bash
# Verificar se pods estão rodando
kubectl get pods -n fiap-hack | grep -E "(prometheus|grafana)"

# Testar endpoint de métricas da API
curl http://localhost:30080/metrics

# Testar endpoint de métricas do Video Processor
kubectl port-forward svc/video-processor 3001:80 -n fiap-hack &
curl http://localhost:3001/metrics
```

### 3. Acessar dashboards

**Grafana**: `http://localhost:30030`
- Usuário: `admin`
- Senha: `admin123`

**Prometheus**: `http://localhost:30090`

## 📈 Dashboards disponíveis

### 1. **Video Processing System**
- Jobs criados vs processados
- Taxa de processamento (jobs/segundo)
- Tempo médio de processamento
- Tamanho da fila RabbitMQ
- Taxa de erro

### 2. **API Performance**
- Taxa de requests por segundo
- Latência (percentil 95)
- Taxa de erro por código de status
- Taxa de sucesso de uploads

### 3. **System Resources**
- CPU dos pods
- Uso de memória
- Conexões de banco de dados
- Storage utilizado (RustFS)

## 🔎 Queries úteis Prometheus

```promql
# Taxa de requests da API nos últimos 5 minutos
rate(http_requests_total[5m])

# Tempo médio de processamento de vídeo
rate(video_processing_duration_seconds_sum[5m]) / rate(video_processing_duration_seconds_count[5m])

# Taxa de erro na API
rate(http_requests_total{status=~"4..|5.."}[5m])

# Tamanho da fila de processamento
rabbitmq_queue_messages{queue="video_processing"}

# Jobs processados vs criados na última hora
increase(video_jobs_processed_total[1h]) / increase(video_jobs_created_total[1h])
```

## 🚨 Alertas configurados

### 1. **Alta taxa de falha no processamento**
- Trigger: > 10% de falha por 2+ minutos
- Severidade: Warning

### 2. **Fila de processamento com backlog**
- Trigger: > 100 vídeos na fila por 5+ minutos
- Severidade: Warning

### 3. **Alta taxa de erro na API**
- Trigger: > 5% de erro por 2+ minutos
- Severidade: Warning

### 4. **Alta latência da API**
- Trigger: Percentil 95 > 2 segundos por 5+ minutos
- Severidade: Warning

## 🔧 Para desenvolvimento local

### 1. Instalar dependências
```bash
# Adicionar prom-client ao projeto
pnpm add prom-client

# Para testes de carga
pnpm loadtest:k6
```

### 2. Testar métricas localmente
```bash
# Iniciar aplicações
pnpm start:dev api
pnpm start:dev video-processor

# Em outro terminal, fazer requests para gerar métricas
curl -X POST http://localhost:3000/video-processing-jobs \
  -F "file=@exemplo.mp4" \
  -F "userId=test"

# Verificar métricas
curl http://localhost:3000/metrics
```

### 3. Desenvolvimento de novas métricas

Para adicionar novas métricas:

1. **No MetricsService**: Definir a métrica
```typescript
readonly newMetric = new promClient.Counter({
  name: 'new_metric_total',
  help: 'Description of the metric',
  labelNames: ['label1', 'label2'],
  registers: [this.registry],
});
```

2. **No código**: Registrar eventos
```typescript
this.metricsService.newMetric.inc({ label1: 'value1', label2: 'value2' });
```

3. **No Grafana**: Criar visualização usando PromQL
```promql
rate(new_metric_total[5m])
```

## 📚 Links úteis

- [Documentação Prometheus](https://prometheus.io/docs/)
- [Documentação Grafana](https://grafana.com/docs/)
- [PromQL Guide](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Node.js prom-client](https://github.com/siimon/prom-client)