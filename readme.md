docker run -it --rm \
  -p 7001:7001 \
  -v $(pwd)/keys:/usr/src/app/keys \
  price-signature-api:1.0

docker buildx version
docker buildx build -t price-signature-api:latest  --load .

docker buildx build --no-cache --platform linux/amd64,linux/arm64 -t ghcr.io/stevehuytrannd92/price-signature-api:latest  --push .

echo "$PAT" | docker login ghcr.io -u stevehuytrannd92 --password-stdin

ssh -o StrictHostKeyChecking=no ubuntu@165.154.235.179 "mkdir -p /home/ubuntu/signer/keys" && \
scp -o StrictHostKeyChecking=no "/Users/steve/Coding/oracle_price_signer/keys/solana-oracle-keypair.json" ubuntu@165.154.235.179:/home/ubuntu/signer/keys/solana-oracle-keypair.json