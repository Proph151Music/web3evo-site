# Prerequisites

Before you begin, ensure you have the following tools:

1. **Docker**: You need [Docker](https://www.docker.com/products/docker-desktop) installed and running on your machine. Docker is used to create, manage, and run our containers.

2. **Node.js and npm**: Make sure you have [Node.js](https://nodejs.org/) version 18 or above.

3. **(Optional) Docker Without Sudo**: For Linux users, if you want to run Docker commands without `sudo`, you can follow the [post-installation steps](https://docs.docker.com/engine/install/linux-postinstall/#manage-docker-as-a-non-root-user) in the Docker documentation.

# Getting Started

## Quick Start

```bash
sudo docker compose -f docker-compose.yaml -f docker-compose.local.yaml up --build
```

## 1. Install all dependencies

In your terminal move to the root folder of the project and run

```bash
npm run install:all
```

This script will install the dependencies in both the frontend and backend directories.

## 2. Setup your Environment Variables

Not all the environment variables can be stored in `.env` as some of them contain sensitive information, and `.env` is a tracked file.

To run the project locally, you must create `.env.local` file inside the `backend` folder using `.env.local.example` as your template.

## 3. Run the Servers

With the dependencies and environment variables setup, and assuming you have Docker installed, you are now ready to fire up the servers.

```bash
npm run servers
```

> [!NOTE]
> If getting following error `"error getting credentials - err: exit status 1, out: ``"...`
> Run `rm ~/.docker/config.json `

This will fire up three services:

- The database service
- The backend service
- The frontend service

## 4. Migrate the Prisma Schema

If this is the first time you run this project, or if you have made changes to the Prisma schema, you need to migrate the schema to the database.

With the servers still running, open a new terminal instance and from root folder of this project, run:

```bash
npm run prisma:migrate
```

Note that this will run the `prisma migrate dev` command. If you are migrating to a production database, you should instead run:

```bash
npm run prisma:deploy
```

## 5. Seed the Database (optional)

This is an optional step that allows you to fill the data with predefined data inside `backend/prisma/seed.ts`.

With the servers running, run:

```bash
npm run prisma:seed
```

# Improving Development Experience

Simply running the container with all three services makes development difficult as you will need to restart the container to test changes made to the code.

For a more productive developer experience, it is best to run the service you are working with on a local terminal, and **_only the dependency service_** in the docker container.

## Backend

For backend developers, assuming the `.env.local` file is taken care of (see [_Setup your Environment Variables_](#2-setup-your-environment-variables)
)

1. Fire up the database server alone

```bash
npm run servers:db
```

2. Install the backend dependencies if you haven't already

```bash
npm run install:backend
```

3. Generate the Prisma types if you haven't already

```bash
npm run prisma:generate
```

4. Migrate the database schema if you haven't already

```bash
npm run prisma:migrate
```

5. Run the backend's development server

```bash
npm run dev:backend
```

You can start making requests to `http://localhost:5000` and changes to the code will be reflected immediately

## Frontend

For frontend developers, assuming the `.env.local` file is taken care of (see [_Setup your Environment Variables_](#2-setup-your-environment-variables)

1. Fire up the backend server (this will also automatically fire up the database server)

```bash
npm run servers:backend
```

2. Install the frontend dependencies if you haven't already

```bash
npm install:frontend
```

3. Run the frontend's development server

```bash
npm run dev:frontend
```

You can go to `http://localhost:3000` from your browser and changes to the code will be reflected immediately.
