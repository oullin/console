.PHONY: test

##@ Quality
test: ## Run the workspace test suite from the repo root
	$(call run_in,$(ROOT_PATH),pnpm run test)
