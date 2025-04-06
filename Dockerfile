FROM node:18-slim

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy app source
COPY . .

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD node -e "require('http').request({ host: 'localhost', port: 3000, path: '/', method: 'GET' }, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1)).end()"

# Start the app using npm start script from package.json
CMD ["npm", "start"] 