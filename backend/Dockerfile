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

# Inicializar banco de dados
RUN python init_db.py

# Expor porta
EXPOSE 8080

# Comando para iniciar servidor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
