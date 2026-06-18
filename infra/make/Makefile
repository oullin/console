SHELL := /bin/bash

INFRA_MAKE_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
ROOT_PATH := $(abspath $(INFRA_MAKE_DIR)/../..)
INFRA_MAKE_DIR := $(ROOT_PATH)/infra/make

# Shared helpers/vars first (defines run_in, paths, etc.), then each concern.
# All make target definitions live under infra/make so they have one owner.
include $(INFRA_MAKE_DIR)/shared.mk
include $(INFRA_MAKE_DIR)/turbo.mk
include $(INFRA_MAKE_DIR)/format.mk
include $(INFRA_MAKE_DIR)/dev.mk
include $(INFRA_MAKE_DIR)/fresh.mk

.DEFAULT_GOAL := help
