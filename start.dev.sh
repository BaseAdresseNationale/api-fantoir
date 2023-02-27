echo "DOCKER_LOAD_FANTOIR_DATA : $FORCE_LOAD_FANTOIR_DATA"

if [[ "$FORCE_LOAD_FANTOIR_DATA" = "true" ]]; then
  echo "loading fantoir data into DB..."
  npm run load-data
fi

npm run start