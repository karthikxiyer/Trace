FROM eclipse-temurin:21-jdk-alpine AS base
RUN apk add --no-cache nodejs npm curl

ARG SIGNAL_CLI_VERSION=0.13.4
RUN curl -LO https://github.com/AsamK/signal-cli/releases/download/v${SIGNAL_CLI_VERSION}/signal-cli-${SIGNAL_CLI_VERSION}-Linux.tar.gz \
  && tar -xf signal-cli-${SIGNAL_CLI_VERSION}-Linux.tar.gz -C /opt \
  && ln -s /opt/signal-cli-${SIGNAL_CLI_VERSION}/bin/signal-cli /usr/local/bin/signal-cli \
  && rm signal-cli-${SIGNAL_CLI_VERSION}-Linux.tar.gz

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .

EXPOSE 3001
CMD ["sh", "start.sh"]
