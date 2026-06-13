SHELL := /bin/bash

ROOT_PATH := $(CURDIR)
FMT_IMAGE := ghcr.io/oullin/go-fmt:v0.4.0
FMT_RUN := docker run --rm \
	--user $$(id -u):$$(id -g) \
	-v $(ROOT_PATH):/work \
	-w /work \
	-e HOST_PROJECT_PATH=$(ROOT_PATH) \
	$(FMT_IMAGE)

TS_GLOBS := '*.ts' '*.tsx' '*.vue' '*.mts' '*.cts'

.DEFAULT_GOAL := help

define step
	@printf "\n\033[1;36m==>\033[0m \033[1m%s\033[0m\n" "$(1)"
endef

define run_oxfmt
@cd "$(ROOT_PATH)" && tmp=$$(mktemp); git ls-files -z $(1) --exclude-standard -- $(TS_GLOBS) | while IFS= read -r -d '' f; do [ -f "$$f" ] && printf '%s\0' "$$f"; done > "$$tmp"; if [ ! -s "$$tmp" ]; then echo "No TS/Vue files to format."; rm -f "$$tmp"; else xargs -0 $(FMT_RUN) format < "$$tmp"; rc=$$?; rm -f "$$tmp"; exit $$rc; fi
endef

define run_in
	@cd "$(1)" && $(2)
endef

.PHONY: help dev format format-all fresh

help:
	@awk 'BEGIN {FS = ":.*?## "; printf "\nUsage: \033[36mmake <target>\033[0m\n"} \
		/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5); next } \
		/^[a-zA-Z0-9_.-]+:.*?##/ { printf "  \033[36m%-28s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""

##@ Development
dev: ## Run the docs dev server
	$(call run_in,$(ROOT_PATH),pnpm --filter docs dev)

##@ Formatting
format: ## Format + lint untracked + modified TS/Vue files via oxfmt/oxlint
	$(call run_oxfmt,--others --modified)

format-all: ## Format + lint every non-ignored TS/Vue file in the repo via oxfmt/oxlint
	@cd "$(ROOT_PATH)" && tmp=$$(mktemp); git ls-files -z --cached --others --exclude-standard -- $(TS_GLOBS) | while IFS= read -r -d '' f; do [ -f "$$f" ] && printf '%s\0' "$$f"; done > "$$tmp"; if [ ! -s "$$tmp" ]; then echo "No TS/Vue files to format."; rm -f "$$tmp"; else xargs -0 $(FMT_RUN) format < "$$tmp"; rc=$$?; rm -f "$$tmp"; exit $$rc; fi

##@ Maintenance
fresh: ## Clean generated state, reinstall dependencies, then run local gates
	$(call step,Removing generated dependency/cache/build state)
	@test -n "$(ROOT_PATH)" && test "$(ROOT_PATH)" != "/" || { echo "Refusing to clean unsafe ROOT_PATH='$(ROOT_PATH)'"; exit 1; }
	rm -rf "$(ROOT_PATH)/node_modules" "$(ROOT_PATH)"/packages/*/node_modules "$(ROOT_PATH)/.turbo" "$(ROOT_PATH)/packages/artefacts/.cache" "$(ROOT_PATH)/packages/artefacts/.logs" "$(ROOT_PATH)/packages/artefacts/dist" "$(ROOT_PATH)/packages/tui/dist"
	$(call step,Removing TypeScript build info files)
	find "$(ROOT_PATH)" -name '*.tsbuildinfo' -type f -delete
	$(call step,Installing dependencies)
	cd "$(ROOT_PATH)" && pnpm install
	$(call step,Running local gates)
	cd "$(ROOT_PATH)" && pnpm build && pnpm typecheck && pnpm test
