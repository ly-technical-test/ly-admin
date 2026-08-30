.PHONY: restart

restart:
	sudo env ENVIRONMENT=sandbox DOCKER_SUFFIX=dev docker compose up -d --build

.PHONY: logs

logs:
	sudo env ENVIRONMENT=sandbox DOCKER_SUFFIX=dev docker compose logs -f