all: update clean core

update:
	@echo "Preparing Resources"
	@mkdir -p cache
	@echo " - Extracting DelverLens Database"
	@test -f cache/delver.sqlite || unzip -jp $(shell ls input/delverlab.*.apk | head -n1) res/raw/data.db > cache/delver.sqlite
	@echo " - Copying Card Backup Database"
	@test -f cache/cards.sqlite || cp -f $(shell ls input/*.dlens.bin | head -n1) cache/cards.sqlite
	@echo " - Downloading MTGJSON Database"
	@test -f cache/mtgjson.sqlite || curl -q --progress-bar https://mtgjson.com/api/v5/AllPrintings.sqlite -o cache/mtgjson.sqlite

core:
	@node main.js

clean:
	rm -rf collection/*

distclean: clean
	rm -rf cache
