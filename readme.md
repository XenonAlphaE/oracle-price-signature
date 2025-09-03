docker run -it --rm \
  -p 7001:7001 \
  -v $(pwd)/keys:/usr/src/app/keys \
  sol-api

