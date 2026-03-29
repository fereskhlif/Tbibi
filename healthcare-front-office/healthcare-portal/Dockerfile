# Stage 1: Build the Angular application
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application for production
RUN npm run build -- --configuration production

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the custom Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from Stage 1 to Nginx's html directory
COPY --from=build /app/dist/healthcare-portal/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
