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
	constructor() {
		// this.key_list = {}; debug

		this.subPth = 'foobox\\data\\biography\\';
		this.storageFolder = bioDataPth;
		$.buildPth(this.storageFolder);
		this.cfgFile = `${this.storageFolder}server.cfg`;
		this.item_properties = `${this.storageFolder}item_properties.json`;
		this.nowplaying = `${this.storageFolder}nowplaying.txt`;

		this.cfg = $.jsonParse(this.cfgFile, {}, 'file-utf8'); // Regorxxx <- Force UTF-8 ->
		this.lfmSim = true;
		this.lang = {
			arr: ['EN', 'DE', 'ES', 'FR', 'IT', 'JA', 'PL', 'PT', 'RU', 'SV', 'TR', 'ZH'],
			ix: 0,
			ok: false
		}
		this.remap = {}
		this.pth = {}
		this.tf = {}
		this.dispPth = {} // path shown as a hint on the settings page when the setting is empty (never saved)
		this.caPath = `${this.storageFolder}biography-cache`;
		this.cachePath = `${this.caPath}\\`;
		this.cacheRootDefaultDisp = `%profile%\\${this.subPth}biography-cache`; // default text in the cache-root box (no trailing slash)
		this.tails = {
			foLfmRev: 'review\\lastfm\\$lower($cut(%BIO_ALBUMARTIST%,1))',
			foLfmBio: 'biography\\lastfm\\$lower($cut(%BIO_ARTIST%,1))',
			foWikiRev: 'review\\wikipedia\\$lower($cut(%BIO_ALBUMARTIST%,1))',
			foWikiBio: 'biography\\wikipedia\\$lower($cut(%BIO_ARTIST%,1))',
			foImgArt: 'art_img\\$lower($cut(%BIO_ARTIST%,1))\\%BIO_ARTIST%',
			foImgRev: 'rev_img\\$lower($cut(%BIO_ALBUMARTIST%,1))\\%BIO_ALBUMARTIST%',
			foLfmSim: 'lastfm\\$lower($cut(%BIO_ARTIST%,1))'
		};
		this.cycDefault = '%storage_folder%\\biography-cache\\' + this.tails.foImgArt; // built-in default of the photo cycle folder (the cover cycle is fixed to the same path)
		this.defPth = {}; // default paths actually used at runtime
		this.defPthDisp = {}; // same paths in %profile% form (settings-page hint only)
		this.rootPth = this.cachePath;
		this.rootDisp = `%profile%\\${this.subPth}biography-cache\\`;
		this.dispCacheRoot = this.cacheRootDefaultDisp;
		this.buildDefPth();

		this.photoRecycler = `${this.storageFolder}oldPhotosForDeletion\\`;
		this.settingsKeys = [];
		this.writeDefer = 0; // > 0: keep changes in memory, flush once when the batch ends
		this.writeDirty = false;
		
		this.suffix = {
			foLfmRev: ' [Lastfm Review]',
			foLfmBio: ' [Lastfm Biography]',
			foWikiRev: ' [Wikipedia Review]',
			foWikiBio: ' [Wikipedia Biography]'
		}
		this.lfmDisplayName = 'Last.fm';
		this.wikiDisplayName = 'Wikipedia';
	}

	// Methods

	init(settings) {
		// dozens of settings may be restored to their defaults at startup: batch into a single write
		this.beginBatch();
		try {
			this.build(settings);
		} finally {
			this.endBatch();
		}
	}

	build(settings) {
		this.checkCfg(settings);
		this.settingsKeys = settings.map(v => v[3]);
		settings.forEach(v => {
			// this.validate(v); debug
			this.add(v);
		});
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
		$.save(this.cfgFile, JSON.stringify($.sortKeys(this.cfg), null, 3), true);
	}

	toggle(name) {
		this[name] = !this[name];
	}

	checkCfg(settings) {
		if (!$.file(this.item_properties)) $.save(this.item_properties, item_properties, true);
		if (!$.file(this.nowplaying)) $.save(this.nowplaying, nowplaying, true);
		if ($.file(this.cfgFile)) return;
		// first run: create the config file with default values
		settings.forEach(v => {
			this.cfg[v[3]] = v[1];
		});
		$.save(this.cfgFile, JSON.stringify($.sortKeys(this.cfg), null, 3), true);
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
					panelCfg.reset();
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
		popUpBox.config(JSON.stringify(ppt), JSON.stringify(cfg), dialogWindow, ok_callback, this.lang.ix, $.folder(cfg.photoRecycler));
	}

	// cache root: the value from the settings if set (trailing slashes trimmed), otherwise the built-in
	// %profile%\\foobox\\data\\biography\\biography-cache\\. Every detailed default path is derived from it,
	// so changing the root never needs per-item maintenance.
	buildDefPth() {
		// the root only applies in "Custom" mode; with "Default" selected the built-in cache folder is always used
		const raw = this.autoCache ? (this.cacheRoot || '').trim().replace(/\//g, '\\').replace(/\\+$/, '') : '';
		this.dispCacheRoot = raw || this.cacheRootDefaultDisp;
		// expand %profile% / %storage_folder% to an absolute path first: the whole prefix is tf-escaped only once
		const abs = raw.replace(/^%profile%\\?/i, () => fb.ProfilePath).replace(/^%storage_folder%\\?/i, () => this.storageFolder).replace(/\\+$/, '');
		this.rootPth = raw ? abs + '\\' : this.cachePath;
		this.rootDisp = raw ? raw + '\\' : `%profile%\\${this.subPth}biography-cache\\`;
		const caPth = $.tfEscape(this.rootPth); // runtime prefix, tf-escaped once (' ( ) [ ] , % $)
		Object.keys(this.tails).forEach(k => {
			this.defPth[k] = caPth + this.tails[k];
			this.defPthDisp[k] = this.rootDisp + this.tails[k];
		});
	}

	parse() {
		this.buildDefPth(); // the cache root may have changed: re-derive the defaults of the 7 detailed paths
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

		this.dispPth = {};
		items.forEach(v => {
			const def = this.defPth[v]; // the 7 paths are always derived from the root, never read from settings; foImgCov/fnImgCov have no default
			if (!def) {
				this.pth[v] = this.substituteTf(this[v]); // auto-save cover: still uses the setting as is
				return;
			}
			this.pth[v] = this.substituteTf(def);
			// remap keeps the raw tf form for per-item substitution elsewhere (radio streams etc.);
			// %BIO_* normalised by purpose (an identity replacement for the built-in tails)
			this.remap[v] = v.endsWith('Rev')
				? def.replace(/%BIO_ALBUMARTIST%|%BIO_ARTIST%/gi, '%BIO_ALBUMARTIST%')
				: def.replace(/%BIO_ARTIST%|%BIO_ALBUMARTIST%/gi, '%BIO_ARTIST%');
		});
		// settings page hint: the 7 paths always show the current root-derived path (foImgRev only uses remap, it is not in items)
		Object.keys(this.defPth).forEach(v => {
			this.dispPth[v] = this.defPthDisp[v];
		});
		// foImgRev is not in items (it has no corresponding setting), but review image download/lookup
		// works via remap only: derive it from the root as well. Missing it yields an empty path, so
		// downloaded images would be saved relative to the script folder.
		this.remap.foImgRev = this.defPth.foImgRev.replace(/%BIO_ALBUMARTIST%|%BIO_ARTIST%/gi, '%BIO_ALBUMARTIST%');

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

		// the cover cycle folder is no longer customisable: fixed to the artist photo folder (menu>Sources>Cover>Cycle from artist photos)
		this.albCovFolder = this.substituteTf(this.expandPath(this.autoCache && this.cacheRoot ? this.rootDisp + this.tails.foImgArt : this.cycDefault));

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

		// VA (Various Artists) lookup list: the va setting accepts several values separated by ; or ,
		// (default "Various Artists; 群星"). Any match counts as a compilation marker: it is kept out of
		// "More Tags" and Wikipedia searches are done for 'Various Artists' instead.
		this.vaList = ('' + (this.va || '')).split(/[;,，；、]/).map(v => v.trim().toLowerCase()).filter(v => v);

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

	// Various Artists detection: true when the value matches any entry of va (multi-value, see vaList
	// in parse), ignoring case and surrounding blanks. Used by the "More Tags" filter and by Wikipedia
	// searches (a match is looked up as 'Various Artists').
	isVA(n) {
		if (!n) return false;
		return (this.vaList || []).indexOf(('' + n).trim().toLowerCase()) != -1;
	}

	expandPath(pth) {
		if (/%profile%\\/i.test(pth) && /%storage_folder%\\/i.test(pth)) pth = pth.replace(/%profile%\\/gi, '');
		return pth.replace(/^%profile%\\?/i, $.tfEscape(fb.ProfilePath)).replace(/^%storage_folder%\\?/i, $.tfEscape(cfg.storageFolder));
	}

	preview(n, tfAll, excludeStream, artistView, trackReview) {
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

		tfNames.forEach((v, i) => n = n.replace(RegExp(v, 'gi'), tf[i]));

		const wildCard = /[*?]/.test(n);
		return !wildCard ? panel.cleanPth(n, false) : panel.cleanPth(n.replace(/\*/g, '@!@').replace(/\?/g, '!@!'), false).replace(/@!@/g, '*').replace(/!@!/g, '?');
	}

	resetCfg() { // Server settings reset: delete server.cfg outright; defaults are rebuilt on next load (no backup)
		try {
			fso.DeleteFile(this.cfgFile);
		} catch (e) {
			fb.ShowPopupMessage(`Unable to reset server settings.\n\nserver.cfg is being used by another program.`, 'Biography');
			return;
		}
		window.Reload();
	}

	setCacheMode() {
		// cache-mode change: updateCfg has already recomputed all paths. No full Reload (it would kill the
		// config dialog's callbacks and force it closed); just force-refresh text & images of the current
		// track so the new paths apply immediately. Everything else updates on the next track / refresh event.
		txt.rev.amFallback = true;
		txt.rev.wikiFallback = true;
		txt.on_playback_new_track(true);
		img.on_playback_new_track(true);
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
		txt.rev.cur = -1;
		txt.bio.cur = -1;
		
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
				const wsh = popUpBox.confirm(caption, prompt, 'OK', 'Cancel', '', '', continue_confirmation);
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
const cfg = new Settings();

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

	['Cache Root', '', 'text', 'cacheRoot'],
	['Auto Cache', 0, 'num', 'autoCache'], // 0 = Default (built-in cache folder), 1 = Custom

	['Image [Artist] Initial Download Number (1-20)', 5, 'num', 'photoNum'],
	['Image [Artist] Auto-Add New', true, 'boolean', 'photoAutoAdd'],
	['Image [Artist] Cache Limit', 0, 'num', 'photoLimit'],

	['Auto-Save', false, 'boolean',  'dlLfmCov'],
	['Auto-Save Folder', '$directory_path(%path%)', 'text', 'foImgCov'],
	['Auto-Save File Name', 'cover', 'text', 'fnImgCov'],

	['Album Name Auto-Clean', false, 'boolean', 'albStrip'],
	['Auto-Update Interval (days: min 30, 0 disables auto-update)', 0, 'num', 'exp'],

	['Review Image Quality 0-Medium 1-High', true, 'boolean', 'imgRevHQ'],
	['Search: Include Partial Matches', true, 'boolean',  'partialMatchEnabled'],
	['Search: Fuzzy Match Level Review', 80, 'num',  'fuzzyMatchReview'],
	['Search: Fuzzy Match Level Track', 80, 'num',  'fuzzyMatchTrack'],
	['Search: Fuzzy Match Level Composition', 66, 'num',  'fuzzyMatchComposition'],
	['Similar Artists: Number to Display(0-10)', 6, 'num', 'menuSimilarNum'],
	['Various Artists', 'Various Artists; 群星', 'text', 'va'],

	['Write Tag: Album Genre Last.fm', true, 'boolean', 'tagEnabled0'],
	['Write Tag: Album Statistics Last.fm', false, 'boolean', 'tagEnabled1'],
	['Write Tag: Artist Genre Last.fm', true, 'boolean', 'tagEnabled2'],
	['Write Tag: Artist Statistics Last.fm', false, 'boolean', 'tagEnabled3'],
	['Write Tag: Locale Last.fm', true, 'boolean', 'tagEnabled4'],
	['Write Tag: Similar Artists Last.fm', false, 'boolean', 'tagEnabled5'],
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