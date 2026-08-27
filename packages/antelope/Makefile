TEST_FILES := $(wildcard test/*.ts)
TEST_DEPS := lib
BROWSER_OUT := test/browser.html
CLEAN_EXTRA := site/ test/browser.html

include ../../common.mk

.PHONY: mock-prune
mock-prune: lib
	@MOCK_LOG=$$(mktemp); \
		${MOCHA_ENV} MOCK_LOG=$$MOCK_LOG ${BIN}/mocha ${MOCHA_OPTS} test/*.ts >/dev/null || \
			(echo "Suite not passing, refusing to prune" && exit 1); \
		for f in test/data/*.json; do \
			grep -q $$(basename $$f) $$MOCK_LOG || rm -v $$f; \
		done; \
		rm -f $$MOCK_LOG

.PHONY: deploy-site
deploy-site: | clean build/pages
	@${BIN}/gh-pages -d build/pages
