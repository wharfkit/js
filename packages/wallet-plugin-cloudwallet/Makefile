include ../../common.mk

dev: $(SRC_FILES) package.json tsconfig.json rollup.config.mjs
	@${BIN}/rollup -c ./rollup.config.mjs -w
