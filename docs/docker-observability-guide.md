# 📊 Guia Rápido - Observabilidade com Docker

## 🚀 **Inicio Rápido (5 minutos)**

### 1. **Subir toda infraestrutura:**
```bash
cd fht-nestjs-monorepo
pnpm docker:observability:up
```

### 2. **Preparar banco:**
```bash
pnpm prisma:dev:migrate
pnpm prisma:dev:generate
```

### 3. **Iniciar aplicações com métricas:**
```bash
# Terminal 1
pnpm start:dev api

# Terminal 2  
pnpm start:dev video-processor
```

### 4. **Testar se funciona:**
```bash
# Teste simples da API
curl http://localhost:3000/

# Gerar métricas
curl http://localhost:3000/metrics

# Ver métricas do Video Processor
curl http://localhost:3002/metrics
```

### 5. **Acessar Grafana:**
- 🔗 **URL**: http://localhost:3001
- 👤 **User**: admin  
- 🔑 **Pass**: admin123

### 6. **Dashboards disponíveis:**
- **Video Processing System** - Métricas de jobs de vídeo
- **API Performance** - Latência, requests, erros

---

## 🧪 **Simular carga para gerar métricas:**

```bash
# Fazer alguns uploads (simular atividade)
for i in {1..5}; do
  echo "Upload $i..."
  curl -X POST http://localhost:3000/video-processing-jobs \
    -F "file=@exemplo.mp4" \
    -F "userId=user$i"
  sleep 2
done

# Ver métricas mudando no Grafana em tempo real!
```

---

## ✅ **Limpar ambiente:**

```bash
# Parar tudo
pnpm docker:observability:down

# Limpar dados (opcional)
docker compose -f docker-compose.observability.yaml down -v
```

---

## 📈 **O que você vai ver no Grafana:**

### **Dashboard "Video Processing System":**
- 📊 Jobs criados vs processados (última hora)
- ⚡ Taxa de processamento (jobs/segundo)
- ⏱️ Tempo médio de processamento
- 🚨 Taxa de erros

### **Dashboard "API Performance":**
- 🚀 Request rate (requests/segundo)
- 📊 Response time (percentil 50 e 95)
- 🚨 Taxa de erro por status code (4xx, 5xx)
- ✅ Taxa de sucesso de uploads

### **Prometheus (métricas raw):**
- 🔗 http://localhost:9090
- Queries exemplo:
  ```promql
  rate(http_requests_total[5m])
  increase(video_jobs_created_total[1h])
  ```

---

## 🔥 **Pronto!** 
Agora você tem **observabilidade completa** no ambiente de desenvolvimento Docker! 🎉