.PHONY: format format-all

##@ Formatting
format: ## Format + lint untracked + modified TS/Vue files via oxfmt/oxlint
	$(call run_oxfmt,--others --modified)

format-all: ## Format + lint every non-ignored TS/Vue file in the repo via oxfmt/oxlint
	@cd "$(ROOT_PATH)" && tmp=$$(mktemp); git ls-files -z --cached --others --exclude-standard -- $(TS_GLOBS) | while IFS= read -r -d '' f; do [ -f "$$f" ] && printf '%s\0' "$$f"; done > "$$tmp"; if [ ! -s "$$tmp" ]; then echo "No TS/Vue files to format."; rm -f "$$tmp"; else xargs -0 $(FMT_RUN) format < "$$tmp"; rc=$$?; rm -f "$$tmp"; exit $$rc; fi
