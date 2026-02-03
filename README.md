# FIAP Hackathon NestJs Monorepo


## Running the Application
1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the development environment using Docker (PostgreSQL and RabbitMQ):
   ```bash
    pnpm docker:dev:up
   ```

3. Migrate the database:
   ```bash
   pnpm prisma:dev:migrate
   ```

4. Generate Prisma client:
   ```bash
   pnpm prisma:dev:generate
   ```

5. Start the application:
   ```bash
   pnpm start:dev
   ```

You can now access the API at `http://localhost:3000`, and the rabbitmq management UI at `http://localhost:15672` (default username and password are both `guest`).

## Running via Docker
Build api image
```
  docker build --build-arg APP=api -t fiap-hack-api:latest . 
```

Run docker compose up
```
  docker compose up
```