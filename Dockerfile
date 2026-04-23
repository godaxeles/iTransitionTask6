# syntax=docker/dockerfile:1.7

# ----- Stage 1: build the React client -----
FROM node:22-alpine AS client
WORKDIR /src/client

COPY client/package.json client/package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY client/ ./
# Vite writes to ../iTransitionTask6/wwwroot/dist (via vite.config.ts build.outDir)
RUN mkdir -p /src/iTransitionTask6 && \
    npm run build

# ----- Stage 2: publish the .NET server -----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS server
WORKDIR /src

COPY iTransitionTask6.sln ./
COPY iTransitionTask6/*.csproj iTransitionTask6/
RUN dotnet restore iTransitionTask6/iTransitionTask6.csproj

COPY iTransitionTask6/ iTransitionTask6/
COPY --from=client /src/iTransitionTask6/wwwroot/dist iTransitionTask6/wwwroot/dist

RUN dotnet publish iTransitionTask6/iTransitionTask6.csproj \
    -c Release -o /app/publish \
    --no-restore \
    /p:UseAppHost=false

# ----- Stage 3: runtime -----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=server /app/publish ./

ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    Database__Provider=Postgres

EXPOSE 8080

ENTRYPOINT ["dotnet", "Plot.dll"]
