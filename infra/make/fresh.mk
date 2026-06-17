.PHONY: fresh

##@ Maintenance
fresh: ## Clean generated state, reinstall dependencies, then build
	$(call step,Removing generated dependency/cache/build state)
	@test -n "$(ROOT_PATH)" && test "$(ROOT_PATH)" != "/" || { echo "Refusing to clean unsafe ROOT_PATH='$(ROOT_PATH)'"; exit 1; }
	rm -rf \
		"$(ROOT_PATH)/node_modules" \
		"$(ROOT_PATH)"/packages/*/node_modules \
		"$(ROOT_PATH)/infra/node_modules" \
		"$(ROOT_PATH)/infra/.cache" \
		"$(ROOT_PATH)/packages/docs/src/.vitepress/cache" \
		"$(ROOT_PATH)/packages/docs/src/.vitepress/dist" \
		"$(ROOT_PATH)/packages/docs/src/api" \
		"$(ROOT_PATH)/packages/tui/dist"
	$(call step,Removing generated workspace caches)
	find "$(ROOT_PATH)" -path "$(ROOT_PATH)/.git" -prune -o -type d -name '.turbo' -prune -exec rm -rf {} +
	find "$(ROOT_PATH)" -path "$(ROOT_PATH)/.git" -prune -o -path "$(ROOT_PATH)/infra/.cache" -prune -o -type d -name '.cache' -prune -exec rm -rf {} +
	$(call step,Removing TypeScript build info files)
	find "$(ROOT_PATH)" -name '*.tsbuildinfo' -type f -delete
	$(call step,Installing dependencies)
	$(call run_in,$(ROOT_PATH),pnpm install)
	$(call step,Building from scratch)
	$(call run_in,$(ROOT_PATH),pnpm build)
