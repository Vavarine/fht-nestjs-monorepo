# Kubernetes Deployment Guide for FIAP Hack Project

## Estrutura dos Arquivos

Este diretório contém a configuração completa do Kubernetes para o projeto FIAP Hack, baseado no `docker-compose.prod.yaml`.

### Arquivos YAML:

1. **namespace.yaml** - Cria o namespace `fiap-hack` para isolamento de recursos
2. **secret.yaml** - Armazena dados sensíveis (senhas, credenciais)
3. **configmap.yaml** - Armazena variáveis de configuração não-sensíveis
4. **persistent-volumes.yaml** - Define os PVCs para armazenamento permanente
5. **postgres.yaml** - StatefulSet do PostgreSQL com Service
6. **rabbitmq.yaml** - StatefulSet do RabbitMQ com Services
7. **rustfs.yaml** - Deployment do Rustfs com Service
8. **api.yaml** - Deployment da API com HPA e Service
9. **worker.yaml** - Deployment do Worker com HPA
10. **ingress.yaml** - Configuração de Ingress para acesso externo

## Pré-requisitos

- Kubernetes 1.19+
- kubectl configurado
- Storage Class disponível (para PVCs)
- (Opcional) Nginx Ingress Controller
- (Opcional) Cert-manager para SSL

## Instalação

### 1. Preparar as Secrets

Antes de aplicar os recursos, edite o arquivo `secret.yaml` com as credenciais reais:

```bash
kubectl edit secret app-secrets -n fiap-hack
```

### 2. Aplicar os recursos em ordem:

```bash
# Criar namespace
kubectl apply -f namespace.yaml

# Criar ConfigMap e Secrets
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml

# Criar volumes
kubectl apply -f persistent-volumes.yaml

# Aplicar serviços de infraestrutura
kubectl apply -f postgres.yaml
kubectl apply -f rabbitmq.yaml
kubectl apply -f rustfs.yaml

# Aguardar que os serviços estejam prontos
kubectl wait --for=condition=ready pod -l app=postgres -n fiap-hack --timeout=300s
kubectl wait --for=condition=ready pod -l app=rabbitmq -n fiap-hack --timeout=300s

# Aplicar aplicações
kubectl apply -f api.yaml
kubectl apply -f worker.yaml

# (Opcional) Aplicar Ingress
kubectl apply -f ingress.yaml
```

### 3. Ou aplicar tudo de uma vez:

```bash
kubectl apply -f k8s/
```

## Verificar Status

```bash
# Verificar pods
kubectl get pods -n fiap-hack

# Verificar services
kubectl get svc -n fiap-hack

# Verificar deployments
kubectl get deployments -n fiap-hack

# Ver logs
kubectl logs -n fiap-hack -f deployment/api

# Acessar pod
kubectl exec -it -n fiap-hack <pod-name> -- /bin/sh
```

## Considerações de Segurança

1. **Secrets**: Use `sealed-secrets` ou `external-secrets` para gerenciar credenciais em produção
2. **RBAC**: Configure Role-Based Access Control conforme necessário
3. **Network Policies**: Adicione policies para restringir tráfego entre pods
4. **Images**: Use image scanning e configure imagePullSecrets para registries privados

## Escalonamento

Os Deployments de API e Worker estão configurados com HPA (Horizontal Pod Autoscaler):
- Mínimo: 2 replicas
- Máximo: 5 replicas
- Trigger: CPU > 70% ou Memory > 80%

## Persistência

Os volumes estão configurados com:
- PostgreSQL: 20Gi
- Rustfs Data: 50Gi
- Rustfs Logs: 10Gi

Ajuste os tamanhos conforme necessário em `persistent-volumes.yaml`.

## Atualizações

Para atualizar as imagens:

```bash
kubectl set image deployment/api api=fiap-hack-api:v2 -n fiap-hack
kubectl set image deployment/worker worker=fiap-hack-worker:v2 -n fiap-hack
```

## Remover Recursos

```bash
kubectl delete namespace fiap-hack
```

Isso irá remover todos os recursos do namespace automaticamente.

## Troubleshooting

### Pod não inicia
```bash
kubectl describe pod <pod-name> -n fiap-hack
```

### Verificar eventos
```bash
kubectl get events -n fiap-hack --sort-by='.lastTimestamp'
```

### Verificar recursos disponíveis
```bash
kubectl top nodes
kubectl top pods -n fiap-hack
```

## Notas Importantes

- As imagens Docker (`fiap-hack-api`, `fiap-hack-worker`) devem estar disponíveis no seu registry
- Modifique os hostnames no `ingress.yaml` para seus domínios reais
- Configure o Cert-Manager ou use certificados pré-existentes para HTTPS
- Configure o storage backend apropriado para seu cluster (AWS EBS, GCE Persistent Disk, etc)
