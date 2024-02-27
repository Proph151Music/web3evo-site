# Use an official Node runtime as a parent image
FROM node:18.13

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Bundle app source inside the Docker image
COPY . .

# Build the JS files
RUN npm run prisma:generate
RUN npm run build

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define environment variable
# ENV NODE_ENV production

# Conditionally run a command based on the environment
CMD if [ "$NODE_ENV" = "development" ]; \
  then npm run dev; \
  else node ./dist/server.js; \
  fi