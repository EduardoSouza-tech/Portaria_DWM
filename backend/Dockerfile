# Usar imagem Python oficial
FROM python:3.13-slim

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY requirements.txt .

# Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código da aplicação
COPY . .

# Criar script de inicialização
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'python init_db.py' >> /app/start.sh && \
    echo 'exec uvicorn main:app --host 0.0.0.0 --port 8080' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expor porta
EXPOSE 8080

# Comando para iniciar
CMD ["/app/start.sh"]
