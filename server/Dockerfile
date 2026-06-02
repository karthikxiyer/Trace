FROM node:22-alpine

RUN apk add --no-cache curl libstdc++

ARG SIGNAL_CLI_VERSION=0.14.4.1
RUN curl -L "https://github.com/AsamK/signal-cli/releases/download/v${SIGNAL_CLI_VERSION}/signal-cli-${SIGNAL_CLI_VERSION}-Linux-native.tar.gz" \
  -o signal-cli.tar.gz \
  && tar -xf signal-cli.tar.gz -C /opt \
  && ln -s /opt/signal-cli-${SIGNAL_CLI_VERSION}/bin/signal-cli /usr/local/bin/signal-cli \
  && rm signal-cli.tar.gz

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .

EXPOSE 3001
CMD ["sh", "start.sh"]
