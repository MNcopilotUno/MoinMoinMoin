# Cursus in a container: Node 22, no build step (types are stripped at run time), no npm install
# (the relay has no runtime dependencies). Build from the repository root:
#   docker build -f services/cursus/deploy/Dockerfile -t cursus .
#   docker run -d -p 127.0.0.1:4175:4175 -v cursus:/data -e CURSUS_ORIGIN=https://… cursus
FROM node:22-alpine
WORKDIR /app
COPY services/cursus/src ./src
COPY services/cursus/package.json ./
ENV CURSUS_DB=/data/cursus.sqlite CURSUS_HOST=0.0.0.0 CURSUS_PORT=4175 CURSUS_TRUST_PROXY=1
VOLUME /data
USER node
EXPOSE 4175
CMD ["node", "--disable-warning=ExperimentalWarning", "src/main.ts"]
