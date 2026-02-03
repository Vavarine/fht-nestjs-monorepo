# base stage to have pnpm installed
FROM node:24-alpine AS base
RUN npm i -g pnpm@latest-10

# development stage
FROM base AS development 
ARG APP=api
ARG NODE_ENV=development 
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app 
COPY package.json pnpm-lock.yaml ./ 
RUN pnpm i 
COPY . . 
RUN pnpm prisma generate --schema apps/${APP}/prisma/schema.prisma  
RUN pnpm run build ${APP} 

# production stage
FROM base AS production 
ARG APP=api
ARG NODE_ENV=production 
ENV NODE_ENV=${NODE_ENV} 
WORKDIR /usr/src/app 
COPY package.json pnpm-lock.yaml ./ 
RUN pnpm install --prod

COPY --from=development /usr/src/app/dist ./dist 
COPY --from=development /usr/src/app/apps/${APP}/prisma ./prisma
COPY --from=development /usr/src/app/apps/${APP}/prisma.config.ts ./prisma.config.ts
RUN mkdir -p uploads 

# Add an env to save ARG
ENV APP_MAIN_FILE=dist/apps/${APP}/main 
CMD ["sh", "-c", "pnpm prisma migrate deploy --schema=./prisma/schema.prisma && node ${APP_MAIN_FILE}"]