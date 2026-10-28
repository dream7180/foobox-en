'use strict';

class Setting {
	constructor(key, default_value, type) {
		this.key = key;
		this.default_value = default_value;
		this.type = type;
		this.value = cfg.get(this.key, this.default_value, this.type);
	}

	// Methods

	get() {
		return this.value;
	}
	set(new_value) {
		if (this.value !== new_value) {
			switch (this.type) {
				case 'text':
					if (!new_value && new_value != this.default_value) {
						new_value = this.default_value;
					}
					break;
				case 'boolean':
					if (new_value !== true && new_value !== false) new_value = this.default_value;
					break;
				case 'num':
					new_value = parseInt(new_value);
					if (isNaN(new_value)) {
						new_value = this.default_value;
					}
					break;
			}
			cfg.set(this.key, new_value);
			this.value = new_value;
		}
	}
}

class Settings {
	constructor(name) {
		// this.key_list = {}; debug

		this.cfgBaseName = name;
		this.storageFolder = fb.ProfilePath + 'foobox\\data\\biography\\';
		$.buildPth(this.storageFolder);
		this.bio = `${this.storageFolder + this.cfgBaseName}.cfg`;
		this.item_properties = `${this.storageFolder}item_properties.json`;
		this.nowplaying = `${this.storageFolder}nowplaying.txt`;

		this.cfg = $.jsonParse(this.bio, {}, 'file-utf8'); // Regorxxx <- Force UTF-8 ->
		this.lfmSim = true;

		this.lang = {
			arr: ['EN', 'DE', 'ES', 'FR', 'IT', 'JA', 'PL', 'PT', 'RU', 'SV', 'TR', 'ZH'],
			ix: 0,
			ok: false
		}

		this.remap = {}
		this.pth = {}
		this.sup = {}
		this.tf = {}
		this.dispPth = {} // path shown as a hint on the settings page when the setting is empty (never saved)
		// built-in default paths: these 7 settings default to ''; empty means "use the value below"
		this.defPth = {
			foLfmRev: '%profile%\\yttm\\review\\lastfm\\$lower($cut(%BIO_ALBUMARTIST%,1))',
			foLfmBio: '%profile%\\yttm\\biography\\lastfm\\$lower($cut(%BIO_ARTIST%,1))',
			foWikiRev: '%profile%\\yttm\\review\\wikipedia\\$lower($cut(%BIO_ALBUMARTIST%,1))',
			foWikiBio: '%profile%\\yttm\\biography\\wikipedia\\$lower($cut(%BIO_ARTIST%,1))',
			foImgArt: '%profile%\\yttm\\art_img\\$lower($cut(%BIO_ARTIST%,1))\\%BIO_ARTIST%',
			foImgRev: '%profile%\\yttm\\rev_img\\$lower($cut(%BIO_ALBUMARTIST%,1))\\%BIO_ALBUMARTIST%',
			foLfmSim: '%profile%\\yttm\\lastfm\\$lower($cut(%BIO_ARTIST%,1))'
		};

		this.photoRecycler = `${this.storageFolder}oldPhotosForDeletion\\`;
		this.settingsKeys = [];
		this.writeDefer = 0; // > 0: keep changes in memory, flush once when the batch ends
		this.writeDirty = false;
		
		this.caPath = `${this.storageFolder}biography-cache`;
		this.cachePath = `${this.caPath}\\`;
		
		this.suffix = {
			foLfmRev: ' [Lastfm Review]',
			foLfmBio: ' [Lastfm Biography]',
			foWikiRev: ' [Wikipedia Review]',
			foWikiBio: ' [Wikipedia Biography]'
		}
	}

	// Methods

	init(settings) {
		// defaults restored/migrated at startup can be dozens of keys: batch into a single write
		this.beginBatch();
		try {
			this.build(settings);
		} finally {
			this.endBatch();
		}
	}

	build(settings) {
		const update = this.checkCfg();
		// migrate old tag settings (0-4 AllMusic removed; shift 5-13 down by 5)
		if (this.cfg.tagEnabled13 !== undefined) {
			for (let j = 0; j < 9; j++) {
				this.cfg[`tagEnabled${j}`] = this.cfg[`tagEnabled${j + 5}`];
				if (j < 8) this.cfg[`tagName${j}`] = this.cfg[`tagName${j + 5}`];
			}
			for (let j = 9; j < 14; j++) delete this.cfg[`tagEnabled${j}`];
			for (let j = 8; j < 13; j++) delete this.cfg[`tagName${j}`];
		}
		this.settingsKeys = settings.map(v => v[3]);
		settings.forEach(v => {
			// this.validate(v); debug
			this.add(v);
		});
		// migrate (once): older versions stored the built-in default path in cfg; these settings now default to '',
		// so clear any value that is exactly the built-in default. A marker prevents wiping the same value if the
		// user later types it in on purpose.
		if (!this.cfg.pthEmptyMigrated) {
			Object.keys(this.defPth).forEach(v => {
				if (this[v] === this.defPth[v]) this[v] = '';
			});
			this.cfg.pthEmptyMigrated = 1;
			this.writeDirty = true;
		}
		if (update) {
			delete this.cfg.langLfm;
			delete this.cfg.langLfmFallback;
			this.autoCache = 0;
			this.tagName1 = 'Album Statistics Last.fm';
			this.tagName3 = 'Artist Statistics Last.fm';
		}
		this.parse();
	}

	validate(item) {
		if (!$.isArray(item) || item.length !== 4 || typeof item[3] !== 'string') {
			throw ('invalid settings: requires array: [string, any, string, string, string]: ' + item[3]);
		}

		if (item[3] === 'add') {
			throw ('settings_id: ' + item[3] + '\nThis id is reserved');
		}

		if (this[item[3]] != null || this[item[3] + '_internal'] != null) {
			throw ('settings_id: ' + item[3] + '\nThis id is already occupied');
		}

		if (this.key_list[item[3]] != null) {
			throw ('settings_key: ' + item[3] + '\nThis key is already occupied');
		}
	}

	add(item) {
		// this.key_list[item[3]] = 1; debug
		this[item[3] + '_internal'] = new Setting(item[3], item[1], item[2]);

		Object.defineProperty(this, item[3], {
			get() {
				return this[item[3] + '_internal'].get();
			},
			set(new_value) {
				this[item[3] + '_internal'].set(new_value);
			}
		});
	}

	get(key, default_value, type) { // initialisation
		let saved_value = this.cfg[key];
		switch (type) { // guard check against users directly editing file erroneously
			case 'text':
				if (!saved_value && saved_value != default_value) {
					this.set(key, default_value);
					return default_value;
				}
				break;
			case 'boolean':
				if (saved_value !== true && saved_value !== false) {
					this.set(key, default_value);
					return default_value;
				}
				break;
			case 'num':
				saved_value = parseInt(saved_value);
				if (isNaN(saved_value)) {
					this.set(key, default_value);
					return default_value;
				}
				break;
		}
		return saved_value;
	}

	set(key, new_value) {
		this.cfg[key] = new_value;
		if (this.writeDefer) { // inside a batch: mark only, no disk write
			this.writeDirty = true;
			return;
		}
		this.writeCfg();
	}

	// Batched writes: every change between begin/end (including the clamps applied by parse())
	// stays in memory and the file is rewritten once at the end, instead of once per key.
	beginBatch() {
		this.writeDefer++;
	}

	endBatch() {
		if (this.writeDefer > 0) this.writeDefer--;
		if (!this.writeDefer && this.writeDirty) this.writeCfg();
	}

	writeCfg() {
		this.writeDirty = false;
		$.save(this.bio, JSON.stringify($.sortKeys(this.cfg), null, 3), true);
	}

	toggle(name) {
		this[name] = !this[name];
	}

	checkCfg() {
		if (!$.file(this.item_properties)) $.save(this.item_properties, item_properties, true);
		if (!$.file(this.nowplaying)) $.save(this.nowplaying, nowplaying, true);
		if ($.file(this.bio)) return;
		const orig_cfg = `${fb.ProfilePath}yttm\\biography.cfg`;
		if ($.file(orig_cfg)) {
			try {
				fso.CopyFile(orig_cfg, this.bio);
				this.cfg = $.jsonParse(this.bio, {}, 'file-utf8'); // Regorxxx <- Force UTF-8 ->
				const blacklist_image = `${fb.ProfilePath}yttm\\blacklist_image.json`;
				if ($.file(blacklist_image)) {
					fso.CopyFile(blacklist_image, `${cfg.storageFolder}blacklist_image.json`);
				}
				return true;
			} catch (e) {
				this.createCfg(settings);
				return false;
			}
		} else {
			this.createCfg(settings);
			return false;
		}
	}


	createCfg(settings) {
		settings.forEach(v => {
			this.cfg[v[3]] = v[1];
		});
		if (this.cfg.supFo && this.cfg.supFo.includes('>')) {
			const split = this.cfg.supFo.split('>');
			if (split[0].length && split[1].length) {
				this.cfg.supFind = split[0];
				this.cfg.supReplace = split[1];
			}
		}
		$.save(this.bio, JSON.stringify($.sortKeys(this.cfg), null, 3), true);
	}

	getLangIndex(n) {
		if (n) this.language = n;
		this.lang.arr.some((v, i) => {
			if (v.toLowerCase() == this.language.toLowerCase()) {
				this.lang.ix = i;
				return this.lang.ok = true;
			}
		});
	}

	open() {
		const ok_callback = (new_ppt, new_cfg, type, new_dialogWindow) => {
			if (new_dialogWindow) ppt.set('Biography Dialog Box', new_dialogWindow);
			if (new_ppt) ui.updateProp($.jsonParse(new_ppt, {}), 'value');
			if (new_cfg) {
				const lang_ix = this.lang.ix;
				const cache_type = this.autoCache;
				this.updateCfg($.jsonParse(new_cfg, {}));
				if (cache_type != this.autoCache) this.setCacheMode();
				if (lang_ix != this.lang.ix) this.setLanguage(this.lang.ix);
			}
			if (new_ppt || new_cfg) return;
			switch (type) {
				case 'resetPanelCfg':
					ui.updateProp(ppt, 'default_value');
					break;
				case 'resetServerCfg':
					this.resetCfg();
					break;
				case 'empty': {
					try {
						const app = new ActiveXObject('Shell.Application');
						app.NameSpace(10).MoveHere(this.photoRecycler);
					} catch (e) {
						$.trace('unable to empty photo recycler: can be emptied using windows explorer');
					}
					break;
				}
				case 'open':
					$.browser(this.photoRecycler, false);
					break;
			}
		}
		let dialogWindow = ppt.get('Biography Dialog Box', JSON.stringify({
			w: 85,
			h: 60,
			def_w: 85,
			def_h: 60,
			tab: 'PanelCfg',
			panelPage: 'display',
			serverPage: 'download',
			displaySaveFolders: false,
			version: `v${window.ScriptInfo.Version}`
		}));
		dialogWindow = $.jsonParse(dialogWindow);
		dialogWindow.version = `v${window.ScriptInfo.Version}`;
		dialogWindow = JSON.stringify(dialogWindow);
		if (popUpBox.isHtmlDialogSupported()) popUpBox.config(JSON.stringify(ppt), JSON.stringify(cfg), dialogWindow, ok_callback, this.lang.ix, $.folder(cfg.photoRecycler));
		else {
			popUpBox.ok = false;
			$.trace('the options html dialog doesn\'t appear to be available with the current operating system. All settings in options are available elsewhere: 1) panel settings are in panel properties; 2) server settings that apply to all panels are in the cfg file - default settings should be fine for most users, but can be changed by careful editing in a text editor. Common settings are on the menu.');	
		}
	}

	parse() {
		const bioRevItems = ['foLfmRev', 'foLfmBio', 'foImgArt', 'foImgRev', 'foWikiRev', 'foWikiBio'];
		const items = ['foLfmRev', 'foLfmBio', 'foImgArt', 'foLfmSim', 'foWikiRev', 'foWikiBio', 'foImgCov', 'fnImgCov'];
		const tfIni = ['tfAlbumArtist', 'tfArtist', 'tfAlbum', 'tfTitle', 'tfComposition'];
		const tfItems = ['albumArtist', 'artist', 'album', 'title', 'composition'];
		const tfNames = ['%BIO_ALBUMARTIST%', '%BIO_ARTIST%', '%BIO_ALBUM%', '%BIO_TITLE%', '%BIO_COMPOSITION%'];

		tfNames.forEach((v, i) => { // remove self
			this.tf[tfItems[i]] = this[tfIni[i]].replace(RegExp(v, 'gi'), '');
		});

		this.substituteTf = n => {
			tfNames.forEach((v, i) => {
				n = n.replace(RegExp(v, 'gi'), this.tf[tfItems[i]]);
			})
			return n;
		}

		tfItems.forEach(v => this.tf[v] = this.substituteTf(this.tf[v]));

		// built-in default paths live in the "package data" cache folder (%profile%\\yttm\\ -> biography-cache)
		const cachePth = d => d.replace('%profile%\\yttm\\', $.tfEscape(this.cachePath));
		const dispCachePth = d => d.replace('%profile%\\yttm\\', '%storage_folder%\\biography-cache\\');
		this.dispPth = {};
		items.forEach((v, i) => {
			const def = this.defPth[v]; // only the 7 path settings have a built-in default; foImgCov/fnImgCov have none
			const auto = this.autoCache && i <= 5 && !!def;
			let base;
			if (!def) base = this[v]; // auto-save cover: no built-in default, use the setting as is
			else if (auto) {
				base = cachePth(def);
				this.remap[v] = base;
			} else base = this[v] || cachePth(def); // empty -> built-in default (same folder as default mode, so switching modes does not move data)
			this.pth[v] = this.substituteTf(base);
		});
		// settings page hint: all 7 path settings use "empty -> default cache path" (foImgRev only uses remap, it is not in items)
		Object.keys(this.defPth).forEach(v => {
			this.dispPth[v] = this[v] ? this[v] : dispCachePth(this.defPth[v]);
		});

		if (!this.classicalModeEnable) {
			ppt.classicalMusicMode = false;
			ppt.classicalAlbFallback = false;
		}

		this.suffix = {
			foLfmRev: ' [Lastfm Review]',
			foLfmBio: ' [Lastfm Biography]',
			foWikiRev: ' [Wikipedia Review]',
			foWikiBio: ' [Wikipedia Biography]'
		}

		const needRevSuffix = [...new Set([this.pth.foLfmRev, this.pth.foWikiRev])].length != 2;
		if (!needRevSuffix) {
			this.suffix.foLfmRev = this.suffix.foWikiRev = '';
		}

		const needBioSuffix = [...new Set([this.pth.foLfmBio, this.pth.foWikiBio])].length != 2;
		if (!needBioSuffix) {
			this.suffix.foLfmBio = this.suffix.foWikiBio = '';
		}

		this.albCovFolder = this.substituteTf(this.expandPath(this.foCycCov));
		this.artCusImgFolder = this.substituteTf(this.expandPath(this.foCycPhoto));

		this.exp = this.exp > 0 ? Math.max(this.exp, 30) : 0; // 0: auto-update disabled; otherwise min 30 days
		this.getLangIndex();
		if (!this.lang.ok) this.language = 'EN';
		this.menuSimilarNum = $.clamp(this.menuSimilarNum, 0, 10);
		this.lfmSim = this.dlLfmSim;
		if (this.lfmSim && this.menuSimilarNum < 7 && (!this.tagEnabled5 || this.tagEnabled8 < 7)) this.lfmSim = false;
		this.photoNum = $.clamp(this.photoNum, 1, 40);
		this.photoLimit = this.photoLimit ? Math.max(this.photoLimit, this.photoNum, this.photoAutoAdd * 5) : 0;
		
		this.fuzzyMatchReview = $.clamp(this.fuzzyMatchReview, 0, 100);
		this.fuzzyMatchTrack = $.clamp(this.fuzzyMatchTrack, 0, 100);
		this.fuzzyMatchComposition = $.clamp(this.fuzzyMatchComposition, 0, 100);
		this.partialMatch = this.partialMatchEnabled + '-' + this.fuzzyMatchReview + '-' + this.fuzzyMatchTrack + '-' + this.fuzzyMatchComposition;
		this.tagEnabled8 = $.clamp(this.tagEnabled8, 1, 6);
		
		if (this.autoCache) {
			this.remap['foImgRev'] = cachePth(this.defPth['foImgRev']);
		} else {
			bioRevItems.forEach(v => {
				this.remap[v] = this[v] || cachePth(this.defPth[v]); // empty -> built-in default
				if (v.endsWith('Rev')) this.remap[v] = this.remap[v].replace(/%BIO_ALBUMARTIST%|%BIO_ARTIST%/gi, '%BIO_ALBUMARTIST%'); // simplify later substitutions + convert case
				else this.remap[v] = this.remap[v].replace(/%BIO_ARTIST%|%BIO_ALBUMARTIST%/gi, '%BIO_ARTIST%'); // simplify later substitutions + convert case
			});
		}

		if (this.supCache) { // supplemental
			let replace = this.supFind.split('|');
			const arr1 = replace.map(v => v.trim() || 'yttm');
			replace = this.supReplace.split('|');
			const arr2 = replace.map(v => v.trim() || 'yttm\\bio_supplemental');
			bioRevItems.forEach(v => {
				this.sup[v] = this[v] || cachePth(this.defPth[v]); // empty -> built-in default
				if (arr1.length == arr2.length) arr1.forEach((w, j) => {
					this.sup[v] = this.sup[v].replace(RegExp(w, 'gi'), arr2[j]);
				});
				if (v.endsWith('Rev')) this.sup[v] = this.sup[v].replace(/%BIO_ALBUMARTIST%|%BIO_ARTIST%/gi, '%BIO_ALBUMARTIST%');
				else this.sup[v] = this.sup[v].replace(/%BIO_ARTIST%|%BIO_ALBUMARTIST%/gi, '%BIO_ARTIST%');
			});
		}

		const fields = n => n.replace(/\$.*?\(/gi, '').replace(/(,(|\s+)\d+)/gi, '').replace(/[,()[\]%]/gi, '|').split('|');
		this.albartFields = fields(this.tf.albumArtist).filter(v => v.trim());
		this.artFields = fields(this.tf.artist).filter(v => v.trim());
		this.albFields = fields(this.tf.album).filter(v => v.trim());

		if (this.cusCov) { // custom covers
			this.cusCovPaths = [];
			const nm = this.cusCov0;
			if (nm && nm.length) this.cusCovPaths.push(this.substituteTf(this.expandPath(nm)));
		}
	}

	expandPath(pth) {
		if (/%profile%\\/i.test(pth) && /%storage_folder%\\/i.test(pth)) pth = pth.replace(/%profile%\\/gi, '');
		return pth.replace(/^%profile%\\?/i, $.tfEscape(fb.ProfilePath)).replace(/^%storage_folder%\\?/i, $.tfEscape(cfg.storageFolder));
	}

	preview(n, tfAll, excludeStream, sFind, sReplace, artistView, trackReview) {
		if (!tfAll) return txt.tf(n, artistView, trackReview); // heading
		if (excludeStream) {
			const handle = $.handle(panel.id.focus, true);
			if (!handle) return;
			const covCanBeSaved = !handle.RawPath.startsWith('fy+') && !handle.RawPath.startsWith('3dydfy:') && !handle.RawPath.startsWith('http');
			if (!covCanBeSaved) return 'Stream: Covers Not Saved';
		}
		n = this.expandPath(n);
		const tf = tfAll.split('~#~');
		const tfNames = ['%BIO_ALBUMARTIST%', '%BIO_ARTIST%', '%BIO_ALBUM%', '%BIO_TITLE%'];

		if (sFind || sReplace) { // supplemental
			let replace = sFind.split('|');
			const arr1 = replace.map(v => v.trim() || 'yttm');
			replace = sReplace.split('|');
			const arr2 = replace.map(v => v.trim() || 'yttm\\bio_supplemental');
			if (arr1.length == arr2.length) {
				n = this.expandPath(this.dispPth.foLfmBio || this.foLfmBio);
				arr1.forEach((v, i) => n = n.replace(RegExp(v, 'gi'), arr2[i]));
			} else n = 'Invalid find and replace'
			n = n.replace(/%BIO_ARTIST%|%BIO_ALBUMARTIST%/gi, '%BIO_ARTIST%');
		}
		tfNames.forEach((v, i) => n = n.replace(RegExp(v, 'gi'), tf[i]));

		const wildCard = /[*?]/.test(n);
		return !wildCard ? panel.cleanPth(n, false) : panel.cleanPth(n.replace(/\*/g, '@!@').replace(/\?/g, '!@!'), false).replace(/@!@/g, '*').replace(/!@!/g, '?');
	}

	move(n) {
		const d = new Date;
		const timestamp = [d.getFullYear(), $.padNumber((d.getMonth() + 1), 2), $.padNumber(d.getDate(), 2)].join('-') + '_' + [$.padNumber(d.getHours(), 2), $.padNumber(d.getMinutes(), 2), $.padNumber(d.getSeconds(), 2)].join('-');
		try {
			const fn = `${this.storageFolder + this.cfgBaseName}_old_${timestamp}.cfg`;
			if (!$.file(fn)) fso.MoveFile(this.bio, fn);
		} catch (e) {
			if (n) fb.ShowPopupMessage(`Unable to reset server settings.\n\n${this.cfgBaseName}.cfg is being used by another program.`, 'Biography');
		}
	}

	resetCfg() {
		cfg.move(true);
		window.Reload();
	}

	setCacheMode() {
		window.Reload();
	}

	setLanguage(i) {
		if (i < this.lang.arr.length) {
			this.lang.ix = i;
			this.language = this.lang.arr[this.lang.ix];
		} else this.toggle('languageFallback');
		txt.bio.subhead = {
			lfm: [this.lfmDisplayName, `${this.lfmDisplayName} ${txt.bio.lang[this.lang.ix]}`],
			wiki: [this.wikiDisplayName, `${this.wikiDisplayName} ${txt.bio.lang[this.lang.ix]}`],
			txt: ['', '']
		}
		txt.rev.subhead = {
			lfm: [this.lfmDisplayName, `${this.lfmDisplayName} ${txt.rev.lang[this.lang.ix]}`],
			wiki: [this.wikiDisplayName, `${this.wikiDisplayName} ${txt.rev.lang[this.lang.ix]}`],
			txt: ['', '']
		}
		txt.artistReset(true);
		txt.albumReset(true);
		txt.albumFlush();
		txt.artistFlush();
		txt.rev.cur = '';
		txt.bio.cur = '';
		
		txt.bio.loaded = {
			lfm: false,
			wiki: false,
			txt: false,
			ix: -1
		}
		txt.rev.loaded = {
			lfm: false,
			wiki: false,
			txt: false,
			ix: -1
		}
		
		txt.loadReader();
		txt.getText(true);
		but.createStars();
		txt.getSubHeadWidths();
		txt.artCalc();
		txt.albCalc();
		server.setLanguage(this.language);
		panel.callServer(2, panel.id.focus, '', 1);
	}

	setTag(i, handles) {
		switch (true) {
			case i && i < 9:
				this.toggle(`tagEnabled${i - 1}`);
				break;
			case i == 9: {
				const cur = $.jsonParse(ppt.get('Biography Dialog Box'), {});
				ppt.set('Biography Dialog Box', JSON.stringify({
					w: cur.w,
					h: cur.h,
					def_w: 85,
					def_h: 60,
					tab: 'ServerCfg',
					panelPage: cur.panelPage,
					serverPage: 'tagger'
				}));
				this.open();
				break;
			}
			case i == 10: {
				if (!this.taggerConfirm) {
					if (this.tagEnabled5 && this.tagEnabled8 < 7) tag.check(handles);
					else tag.write(handles);
					break;
				}
				const continue_confirmation = (status, confirmed) => {
					if (confirmed) {
						if (this.tagEnabled5 && this.tagEnabled8 < 7) tag.check(handles);
						else tag.write(handles);
					}
				}
				const caption = 'Tag Files:';
				const prompt = handles.Count < 2000 ? `Update ${handles.Count} ${handles.Count > 1 ? 'tracks' : 'track'}.\n\nContinue?` : `Update ${handles.Count} tracks.\n\nADVISORY: This operation analyses a lot of data.\n\nContinue?`;
				const wsh = popUpBox.isHtmlDialogSupported() ? popUpBox.confirm(caption, prompt, 'OK', 'Cancel', '', '', continue_confirmation) : true;
				if (wsh) continue_confirmation('ok', $.wshPopup(prompt, caption));
				break;
			}
		}
	}

	updateCfg(new_cfg) {
		this.beginBatch();
		try {
			this.settingsKeys.forEach(v => cfg[v] = this.cfg[v] = new_cfg[v + '_internal'].value);
			tag.setGenres();
			this.parse();
		} finally {
			this.endBatch();
		}
	}
}
const cfg = new Settings('biography');

let settings = [
	['Album Review [Lastfm] Auto-Download', false, 'boolean', 'dlLfmRev'],
	['Biography [Lastfm] Auto-Download', true, 'boolean', 'dlLfmBio'],
	['Album Review [Wikipedia] Auto-Download', false, 'boolean', 'dlWikiRev'],
	['Biography [Wikipedia] Auto-Download', true, 'boolean', 'dlWikiBio'],
	['Image [Artist] Auto-Download', true, 'boolean', 'dlArtImg'],
	['Image [Review] Auto-Download', true, 'boolean', 'dlRevImg'],
	['Save List 0-Never 1-Auto', true, 'boolean', 'dlLfmSim'],

	['%BIO_ALBUMARTIST%', '$if3($meta(album artist,0),$meta(artist,0),$meta(composer,0),$meta(performer,0))', 'text', 'tfAlbumArtist'],
	['%BIO_ARTIST%', '$if3($meta(artist,0),$meta(album artist,0),$meta(composer,0),$meta(performer,0))', 'text', 'tfArtist'],
	['%BIO_ALBUM%', '$meta(album,0)', 'text', 'tfAlbum'],
	['%BIO_TITLE%', '$meta(title,0)', 'text', 'tfTitle'],
	['%BIO_COMPOSITION%', '$if2($meta(work,0),$meta(group,0))', 'text', 'tfComposition'],

	['Classical Music Mode Enable', false, 'boolean', 'classicalModeEnable'],

	['Lastfm & Wikipedia Language', 'EN', 'text', 'language'],
	['Lastfm & Wikipedia Language Fallback To English', false, 'boolean', 'languageFallback'],
	['Wikipedia English Genres', true, 'boolean', 'wikipediaEnGenres'],

	['Album Review [Lastfm] Folder', '', 'text', 'foLfmRev'],
	['Biography [Lastfm] Folder', '', 'text', 'foLfmBio'],
	['Album Review [Wikipedia] Folder', '', 'text', 'foWikiRev'],
	['Biography [Wikipedia] Folder', '', 'text', 'foWikiBio'],
	['Image [Artist] Folder', '', 'text', 'foImgArt'],
	['Image [Review] Folder', '', 'text', 'foImgRev'],

	['Auto Cache', 1, 'num', 'autoCache'],
	['Save Folder', '', 'text', 'foLfmSim'],

	['Image [Artist] Initial Download Number (1-20)', 5, 'num', 'photoNum'],
	['Image [Artist] Auto-Add New', true, 'boolean', 'photoAutoAdd'],
	['Image [Artist] Cache Limit', 0, 'num', 'photoLimit'],

	['Auto-Save', false, 'boolean',  'dlLfmCov'],
	['Auto-Save Folder', '$directory_path(%path%)', 'text', 'foImgCov'],
	['Auto-Save File Name', 'cover', 'text', 'fnImgCov'],

	['Folder', '%storage_folder%\\biography-cache\\art_img\\$lower($cut(%BIO_ARTIST%,1))\\%BIO_ARTIST%', 'text', 'foCycCov'],
	['Folder', '%storage_folder%\\biography-cache\\art_img\\$lower($cut(%BIO_ARTIST%,1))\\%BIO_ARTIST%', 'text', 'foCycPhoto'],
	['Album Name Auto-Clean', false, 'boolean', 'albStrip'],
	['Auto-Update Interval (days: min 30, 0 disables auto-update)', 0, 'num', 'exp'],

	['Review Image Quality 0-Medium 1-High', false, 'boolean', 'imgRevHQ'],
	['Search: Include Partial Matches', true, 'boolean',  'partialMatchEnabled'],
	['Search: Fuzzy Match Level Review', 80, 'num',  'fuzzyMatchReview'],
	['Search: Fuzzy Match Level Track', 80, 'num',  'fuzzyMatchTrack'],
	['Search: Fuzzy Match Level Composition', 66, 'num',  'fuzzyMatchComposition'],
	['Similar Artists: Number to Display(0-10)', 6, 'num', 'menuSimilarNum'],
	['Various Artists', 'Various Artists', 'text', 'va'],

	['Site Display Name Last.fm', 'Last.fm', 'text', 'lfmDisplayName'],
	['Site Display Name Wikipedia', 'Wikipedia', 'text', 'wikiDisplayName'],

	['Write Tag: Album Genre Last.fm', true, 'boolean', 'tagEnabled0'],
	['Write Tag: Album Statistics Last.fm', false, 'boolean', 'tagEnabled1'],
	['Write Tag: Artist Genre Last.fm', true, 'boolean', 'tagEnabled2'],
	['Write Tag: Artist Statistics Last.fm', false, 'boolean', 'tagEnabled3'],
	['Write Tag: Locale Last.fm', true, 'boolean', 'tagEnabled4'],
	['Write Tag: Similar Artists Last.fm', true, 'boolean', 'tagEnabled5'],
	['Write Tag: Album Genre Wikipedia', true, 'boolean', 'tagEnabled6'],
	['Write Tag: Artist Genre Wikipedia', true, 'boolean', 'tagEnabled7'],
	['Write Tag: Similar Artists Last.fm: Number to Write (0-100)', 5, 'num', 'tagEnabled8'],

	['Tag Name: Album Genre Last.fm', 'Album Genre Last.fm', 'text', 'tagName0'],
	['Tag Name: Album Statistics Last.fm', 'Album Statistics Last.fm', 'text', 'tagName1'],
	['Tag Name: Artist Genre Last.fm', 'Artist Genre Last.fm', 'text', 'tagName2'],
	['Tag Name: Artist Statistics Last.fm', 'Artist Statistics Last.fm', 'text', 'tagName3'],
	['Tag Name: Locale Last.fm', 'Locale Last.fm', 'text', 'tagName4'],
	['Tag Name: Similar Artists Last.fm', 'Similar Artists Last.fm', 'text', 'tagName5'],

	['Tag Name: Album Genre Wikipedia', 'Album Genre Wikipedia', 'text', 'tagName6'],
	['Tag Name: Artist Genre Wikipedia', 'Artist Genre Wikipedia', 'text', 'tagName7'],

	['Tagger Show Confirm PopUp Box', true, 'boolean', 'taggerConfirm'],
	['Tagger Last.fm Genre Use Whitelist', 1, 'num', 'useWhitelist'],
	['Tagger Last.fm Genre Custom Genres', '', 'text', 'customGenres'],
	['Tagger Last.fm Genre Translate', 'alt country>alternative country, canterbury>canterbury scene, chanson francaise>chanson fran\u00e7aise, christmas>christmas music, christmas songs>christmas music, eletronica>electronica, motown soul>motown, musicals>musical, neoclassical>neoclassicism, orchestra>orchestral, popular>pop, prog>progressive, rnb>r&b, rhythm and blues>r&b, rb>r&b, relaxing>relaxation, relax>relaxation, rock & roll>rock and roll, rock n roll>rock and roll, tropicalia>tropic\u00e1lia, xmas>christmas music, ye ye>y\u00e9-y\u00e9', 'text', 'translate'],

	['Image [Cover] Check Custom Paths', false, 'boolean', 'cusCov'],
	['Image [Cover] Custom Path [Full Path Minus Extension]', '', 'text', 'cusCov0'],

	['Use Supplemental Cache', false, 'boolean', 'supCache'],
	['Supplemental Cache [Use Find>Replace on SAVE paths]', 'yttm>yttm\\bio_supplemental', 'text', 'supFo'],
	['Supplemental Cache Find', 'yttm', 'text', 'supFind'],
	['Supplemental Cache Replace', 'yttm\\bio_supplemental', 'text', 'supReplace'],

	['Configuration Width', 67, 'num', 'configWidth'],
	['Configuration Height', 85, 'num', 'configHeight'],
	['Show console messages', true, 'boolean', 'showConsoleMessages']
];

let item_properties =

`{
	"*****HELP*****": [
		"Set show to false to hide a group",
		"All groups except General*, Metadata* and Other* can be edited, i.e. properties added, removed or changed (keep the properties key)",
		"All groups can be removed or moved",
		"New groups can be added",
		"Group names can be changed except those that auto-expand*",
		"If edit, maintain the general format. If the file can't be parsed, item properties won't display and the console will report 'item_properties: invalid JSON'",
		"An on-line JSON validator can be used check integrity and locate errors",
		"Save file name must include item_properties for recognition, e.g. my_item_properties, can be used",
		"adjust uppercase list at end if required (| separator: whole word match; applies to auto-expanded names)"
	],
	"showEmpty": false,
	"Metadata": {
		"show": true,
		"properties": [
			{"name": "Artist", "titleformat": "[$meta(artist)]"},
			{"name": "Track", "titleformat": "[$meta(title)]"},
			{"name": "Album", "titleformat": "[$meta(album)]"},
			{"name": "Date", "titleformat": "[%date%]"},
			{"name": "Genre", "titleformat": "[%genre%]"},
			{"name": "Track number", "titleformat": "[%tracknumber%]"},
			{"name": "Composer", "titleformat": "[%composer%]"},
			{"name": "Performer", "titleformat": "[%performer%]"},
			{"name": "Album artist", "titleformat": "[$meta(album artist)]"},
			{"name": "Total tracks", "titleformat": "[%totaltracks%]"},
			{"name": "Disc number", "titleformat": "[$if2($meta(discnumber),$meta(disc))]"},
			{"name": "Total discs", "titleformat": "[%totaldiscs%]"},
			{"name": "Comment", "titleformat": "[%comment%]"}
		]
	},
	"Metadata*": {
		"show": false,
		"properties": [
			"This group item is not configurable: items are auto-expanded. It can only be removed, moved or hidden by setting show to false. Don't change the group name.",
			"Use for an alternative grouping. It will show all metadata in alphabetical order as opposed to the groupings used by default.",
			"To use set show to true. If used, it's best to set show to false for the above Metadata, Popularity, Last.fm & Wikipedia groups."
		]
	},
	"Popularity": {
		"show": true,
		"properties": [
			{"name": "Artist", "titleformat": "[$meta(artist statistics last.fm,5[score])]"},
			{"name": "Album", "titleformat": "[$meta(album statistics last.fm,5[score])]"},
			{"name": "Track", "titleformat": "[$meta(track statistics last.fm,5[score])]"}
		]
	},
	"Last.fm": {
		"show": true,
		"properties": [
			{"name": "Artist genre", "titleformat": "[%artist genre last.fm%]"},
			{"name": "Album genre", "titleformat": "[%album genre last.fm%]"},
			{"name": "Locale", "titleformat": "[%locale last.fm%]"},
			{"name": "Similar artists", "titleformat": "[%similar artists last.fm%]"}
		]
	},
	"Wikipedia": {
		"show": true,
		"properties": [
			{"name": "Artist genre", "titleformat": "[%artist genre wikipedia%]"},
			{"name": "Album genre", "titleformat": "[%album genre wikipedia%]"}
		]
	},
	"YouTube": {
		"show": true,
		"properties": [
			{"name": "Channel title", "titleformat": "[%fy_channel_title%]"},
			{"name": "Channel url", "titleformat": "[%fy_channel_url%]"},
			{"name": "Description", "titleformat": "[%fy_description%]"},
			{"name": "Like count", "titleformat": "[%fy_like_count%]"},
			{"name": "Dislike count", "titleformat": "[%fy_dislike_count%]"},
			{"name": "Search title", "titleformat": "[%search_title%]"},
			{"name": "Thumbnail url", "titleformat": "[%fy_thumbnail_url%]"},
			{"name": "Title", "titleformat": "[%fy_title%]"},
			{"name": "Upload date", "titleformat": "[%fy_upload_date%]"},
			{"name": "View count", "titleformat": "[%fy_view_count%]"}
		]
	},
	"Statistics": {
		"show": true,
		"properties": [
			{"name": "Play count", "titleformat": "[%play_count%]"},
			{"name": "First played", "titleformat": "[%first_played%]"},
			{"name": "Last played", "titleformat": "[%last_played%]"},
			{"name": "Added", "titleformat": "[%added%]"},
			{"name": "Rating", "titleformat": "[$if2(%rating%,$meta(rating))]"}
		]
	},
	"Location": {
	"show": true,
		"properties": [
			{"name": "File name", "titleformat": "[%filename_ext%]"},
			{"name": "Folder name", "titleformat": "[$directory_path(%path%)]"},
			{"name": "File path", "titleformat": "[%path%]"},
			{"name": "Subsong index", "titleformat": "[%subsong%]"},
			{"name": "File size", "titleformat": "[%filesize_natural%]"},
			{"name": "Last modified", "titleformat": "[%last_modified%]"},
			{"name": "Created", "titleformat": "[%file_created%]"}
		]
	},
	"General*": {
		"show": true,
		"properties": ["This group item is not configurable: items are auto-expanded. It can only be removed, moved or hidden by setting show to false. Don't change the group name."]
	},
	"ReplayGain": {
		"show": true,
		"properties": [
			{"name": "Track gain", "titleformat": "[%replaygain_track_gain%]"},
			{"name": "Track peak", "titleformat": "[%replaygain_track_peak%]"},
			{"name": "Album gain", "titleformat": "[%replaygain_album_gain%]"},
			{"name": "Album peak", "titleformat": "[%replaygain_album_peak%]"}
		]
	},
	"Other*": {
		"show": true,
		"properties": ["This group item is not configurable: items are auto-expanded. It can only be removed, moved or hidden by setting show to false. Don't change the group name."]
	},
	"uppercase": "ANV|MB"
}`

let nowplaying = `Artist: %BIO_ARTIST%$crlf()
$crlf()
Title: %BIO_TITLE%$crlf()
$crlf()
[Album: %BIO_ALBUM%$crlf()
$crlf()]
$if2(%playback_time%,0:00)[ / %length%]`;

cfg.init(settings);
settings = undefined;
item_properties = undefined;
nowplaying = undefined;