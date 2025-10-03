docker run -it --rm \
  -p 7001:7001 \
  -v /home/ubuntu/signer/keys:/usr/src/app/keys \
  ghcr.io/stevehuytrannd92/pricesignatureapi:latest



docker run -d \
  --name pricesignatureapi \
  --restart unless-stopped \
  -p 7001:7001 \
  -v /home/ubuntu/signer/keys:/usr/src/app/keys \
  ghcr.io/stevehuytrannd92/pricesignatureapi:latest




docker pull ghcr.io/stevehuytrannd92/pricesignatureapi
docker restart pricesignatureapi


docker buildx version
docker buildx build -t pricesignatureapi:latest  --load .

docker buildx build --no-cache --platform linux/amd64,linux/arm64 -t ghcr.io/stevehuytrannd92/pricesignatureapi  --push .

echo "$PAT" | docker login ghcr.io -u stevehuytrannd92 --password-stdin

ssh -o StrictHostKeyChecking=no ubuntu@165.154.235.179 "mkdir -p /home/ubuntu/signer/keys" && \
scp -o StrictHostKeyChecking=no "/Users/steve/Coding/oracle_price_signer/keys/solana-oracle-keypair.json" ubuntu@165.154.235.179:/home/ubuntu/signer/keys/solana-oracle-keypair.json

scp -o StrictHostKeyChecking=no "/Users/steve/Coding/oracle_price_signer/btcsymbol_net.conf" ubuntu@165.154.235.179:/home/ubuntu/btcsymbol_net.conf

docker exec -it pricesignatureapi bash

**inner vps**

sudo mv /home/ubuntu/btcsymbol_net.conf /etc/nginx/sites-available/btcsymbol_net.conf
sudo chown root:root /etc/nginx/sites-available/btcsymbol_net.conf
sudo ln -sf /etc/nginx/sites-available/btcsymbol_net.conf /etc/nginx/sites-enabled/btcsymbol_net.conf
cat /etc/nginx/sites-available/btcsymbol_net.conf
sudo nginx -t && sudo systemctl reload nginx