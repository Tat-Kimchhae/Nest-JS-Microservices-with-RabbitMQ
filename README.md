# NestJS RabbitMQ Microservices

The project runs four independent applications: an HTTP gateway and the
catalog, media, and search RabbitMQ microservices. Start MongoDB instances
configured by the corresponding environment variables and copy `.env.example`
to `.env`, filling in the values required by the services you run.

## Required environment variables

- `GATEWAY_PORT`
- `RABBITMQ_URL`, `CATALOG_QUEUE`, `MEDIA_QUEUE`, `SEARCH_QUEUE`
- `MONGO_URI_USERS`, `MONGO_URI_CATALOG`, `MONGO_URI_MEDIA`, `MONGO_URI_SEARCH`
- `CLERK_SECRET_KEY` (and optionally `CLERK_PUBLISHABLE_KEY`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

RabbitMQ can be started locally with:

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

## Build and run

```bash
npm install
npm run build:apps
npm run start:prod:gateway
npm run start:prod:catalog
npm run start:prod:media
npm run start:prod:search
```

Run each `start:prod` command in its own terminal or process. The gateway is
the public HTTP entry point.

## Tests

```bash
npm test
```
