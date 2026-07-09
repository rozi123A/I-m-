FROM node:20-slim

# Disable corepack completely to avoid pnpm conflicts
RUN corepack disable

# Install pnpm directly via npm
RUN npm install -g pnpm@10.4.1

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

COPY . .

RUN NODE_ENV=production pnpm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["pnpm", "start"]
