docker run -it --rm \
  -p 7001:7001 \
  -v $(pwd)/keys:/usr/src/app/keys \
  price-signature-api:1.0

docker buildx version
docker buildx build -t price-signature-api:1.0  --load .

docker buildx build --platform linux/amd64,linux/arm64 -t price-signature-api:1.0  --push .
