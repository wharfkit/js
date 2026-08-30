include .env
export

BIN := ../../node_modules/.bin
SHELL := /bin/bash
CDT_IMAGE := conformance-cdt:$(CDT_VERSION)
INCLUDES := -I include
PKG_VERSION := $(shell sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' package.json)

DOCKER_RUN = docker run --rm --platform=linux/amd64 \
	-u $$(id -u):$$(id -g) \
	-e HOME=/tmp \
	-v "$(CURDIR)":/repo \
	-w /repo \
	$(CDT_IMAGE)

DOCKER_BUILD_FLAGS ?=

.PHONY: docker/image
docker/image:
	docker build --platform=linux/amd64 $(DOCKER_BUILD_FLAGS) \
		--build-arg CDT_VERSION=$(CDT_VERSION) \
		-t $(CDT_IMAGE) docker

# CONTRACT BUILD
# Production artifacts are committed as build/conformance.{wasm,abi}.
# Debug artifacts (build/conformance.debug.{wasm,abi}) enable the wipe action and are gitignored.

.PHONY: build build/debug build/production
build: build/production

build/debug: docker/image
	$(DOCKER_RUN) make native/build/debug

build/production: docker/image
	$(DOCKER_RUN) make native/build/production

.PHONY: native/build/debug native/build/production
native/build/debug: | build/dir
	cdt-cpp -O=2 -abigen -abigen_output=build/$(CONFORMANCE_CONTRACT_NAME).debug.abi \
		-contract=$(CONFORMANCE_CONTRACT_NAME) \
		-o build/$(CONFORMANCE_CONTRACT_NAME).debug.wasm src/$(CONFORMANCE_CONTRACT_NAME).cpp -R src $(INCLUDES) \
		-DDEBUG -DCONTRACT_VERSION=\"$(PKG_VERSION)\" -DCDT_VERSION=\"$(CDT_VERSION)\"

native/build/production: | build/dir
	cdt-cpp -O=2 -abigen -abigen_output=build/$(CONFORMANCE_CONTRACT_NAME).abi \
		-contract=$(CONFORMANCE_CONTRACT_NAME) \
		-o build/$(CONFORMANCE_CONTRACT_NAME).wasm src/$(CONFORMANCE_CONTRACT_NAME).cpp -R src $(INCLUDES) \
		-DCONTRACT_VERSION=\"$(PKG_VERSION)\" -DCDT_VERSION=\"$(CDT_VERSION)\"

build/dir:
	mkdir -p build

.PHONY: clean
clean:
	rm -rf build/*.debug.* codegen/*.ts

# CODEGEN

.PHONY: codegen
codegen: codegen/conformance.ts

codegen/conformance.ts: build/$(CONFORMANCE_CONTRACT_NAME).debug.abi node_modules | codegen/dir
	$(BIN)/wharfkit generate --json build/$(CONFORMANCE_CONTRACT_NAME).debug.abi --file codegen/conformance.ts $(CONFORMANCE_CONTRACT_NAME)

codegen/dir:
	mkdir -p codegen

node_modules:
	bun install --cwd ../..

# TESTS AND CHECKS

.PHONY: test
test: build/debug codegen node_modules
	bun test

.PHONY: check cppcheck jscheck
check: jscheck

CPP_SOURCES := $(wildcard src/*.cpp) $(wildcard include/conformance/*.hpp) $(wildcard include/conformance/cases/*.hpp)

cppcheck:
	@if [ -n "$(CPP_SOURCES)" ]; then \
		clang-format --dry-run --Werror $(CPP_SOURCES); \
	else \
		echo "no C++ sources yet, skipping cppcheck"; \
	fi

TS_SOURCES := $(wildcard test/*.ts) $(wildcard testnet/*.ts)
TS_DIRS := $(wildcard test) $(wildcard testnet)

jscheck: node_modules
	@if [ -n "$(TS_SOURCES)" ]; then \
		$(BIN)/oxlint $(TS_DIRS) --max-warnings 0 && echo "Ok"; \
	else \
		echo "no TS sources yet, skipping jscheck"; \
	fi

.PHONY: format
format:
	@if [ -n "$(CPP_SOURCES)" ]; then clang-format -i $(CPP_SOURCES); fi
	@if [ -n "$(TS_SOURCES)" ]; then $(BIN)/oxlint $(TS_DIRS) --fix && $(BIN)/oxfmt $(TS_DIRS); fi

# TESTNET

.PHONY: testnet testnet/seed testnet/verify
testnet: build/production
	cleos -u $(TESTNET_NODE_URL) set contract $(CONFORMANCE_TESTNET_ACCOUNT) \
		build/ $(CONFORMANCE_CONTRACT_NAME).wasm $(CONFORMANCE_CONTRACT_NAME).abi

SEED_STEP ?= 40
SEED_FROM ?= 0

# Seeds [SEED_FROM, grid_size) in SEED_STEP slices through cleos; needs an unlocked wallet holding the account's active key.
testnet/seed:
	@size=$$(cleos -u $(TESTNET_NODE_URL) get table $(CONFORMANCE_TESTNET_ACCOUNT) $(CONFORMANCE_TESTNET_ACCOUNT) version \
		| sed -n 's/.*"grid_size": *\([0-9]*\).*/\1/p' | head -1); \
	if [ -z "$$size" ]; then \
		size=$$(cleos -u $(TESTNET_NODE_URL) push action $(CONFORMANCE_TESTNET_ACCOUNT) version '[]' --read 2>&1 \
			| sed -n 's/.*"grid_size":\([0-9]*\).*/\1/p' | head -1); \
	fi; \
	test -n "$$size" || { echo "could not read grid_size"; exit 1; }; \
	echo "grid_size=$$size"; \
	from=$(SEED_FROM); \
	while [ $$from -lt $$size ]; do \
		to=$$((from + $(SEED_STEP))); [ $$to -gt $$size ] && to=$$size; \
		echo "seed [$$from, $$to)"; \
		cleos -u $(TESTNET_NODE_URL) push action $(CONFORMANCE_TESTNET_ACCOUNT) seed "[$$from,$$to]" \
			-p $(CONFORMANCE_TESTNET_ACCOUNT)@active >/dev/null || exit 1; \
		from=$$to; sleep 1; \
	done

testnet/verify: codegen
	bun testnet/verify.ts
