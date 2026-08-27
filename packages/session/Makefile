MOCK_DIR := ./test/data
MOCHA_EXTRA := --no-timeout
LINT_PATHS := src test

include ../../common.mk

.PHONY: accounts
accounts:
	TSX_TSCONFIG_PATH=test/utils/setup/tsconfig.json ${BIN}/tsx test/utils/setup/accounts.ts
