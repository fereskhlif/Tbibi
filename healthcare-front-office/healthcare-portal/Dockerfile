# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

# Stage 2: Serve
FROM node:20-alpine
RUN npm install -g http-server
WORKDIR /app
COPY --from=build /app/dist/healthcare-portal/browser ./

EXPOSE 80

CMD ["http-server", ".", "-p", "80"]