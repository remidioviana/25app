FROM python:3.12-slim@sha256:5e2bdb1b0d542d5039cffb8181c65930093949194a65c365dfb1b0fe13a4fa5b
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 HOST=0.0.0.0 PORT=8000 AGENT_DATA_DIR=/data
WORKDIR /app
COPY requirements-agentic.txt requirements-documents.txt ./
RUN --mount=type=secret,id=build_ca \
    if [ -f /run/secrets/build_ca ]; then export PIP_CERT=/run/secrets/build_ca; fi; \
    pip install --no-cache-dir -r requirements-agentic.txt -r requirements-documents.txt \
    && groupadd --gid 10001 agent \
    && useradd --uid 10001 --gid 10001 --no-create-home agent \
    && mkdir /data && chown 10001:10001 /data
COPY --chown=10001:10001 *.py index.html sw.js ./
COPY --chown=10001:10001 agents/ ./agents/
COPY --chown=10001:10001 public/ ./public/
USER 10001:10001
VOLUME ["/data"]
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD python -c "import os,urllib.request; urllib.request.urlopen('http://127.0.0.1:'+os.environ.get('PORT','8000')+'/api/config',timeout=3).close()"
CMD ["python", "server.py"]
