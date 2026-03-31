FROM denoland/deno:latest
WORKDIR /app
COPY . .
# server card game nusantara
CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "main.ts"]
