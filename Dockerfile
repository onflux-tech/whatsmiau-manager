# syntax=docker/dockerfile:1

FROM --platform=$BUILDPLATFORM node:22-alpine AS frontend
WORKDIR /app/site

ARG VERSION=dev

COPY site/package.json site/package-lock.json ./
RUN npm ci --ignore-scripts

COPY site/ .
ENV VITE_APP_VERSION=$VERSION
RUN npm run build

FROM --platform=$BUILDPLATFORM golang:1.25-alpine AS backend
WORKDIR /app

ARG TARGETOS
ARG TARGETARCH
ARG VERSION=dev

COPY go.mod go.sum ./
RUN go mod download

COPY . .
COPY --from=frontend /app/site/dist site/dist

RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} \
    go build -trimpath \
    -ldflags="-s -w -X main.Version=${VERSION}" \
    -o manager main.go

FROM alpine:3.21
RUN apk add --no-cache ca-certificates tzdata \
    && rm -rf /var/cache/apk/*
WORKDIR /app
COPY --from=backend /app/manager .
EXPOSE 8090
VOLUME /app/pb_data
CMD ["./manager", "serve", "--http=0.0.0.0:8090"]
