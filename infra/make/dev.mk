.PHONY: dev

##@ Development
dev: ## Run the docs dev server
	$(call run_in,$(ROOT_PATH),pnpm --filter docs dev)
