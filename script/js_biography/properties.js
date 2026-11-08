'use strict';

class PanelProperty { // UI-settable properties: stored in panel.cfg
	constructor(id, default_value) {
		this.id = id;
		this.default_value = default_value;
		this.value = panelCfg.value(id);
	}

	// Methods

	get() {
		return this.value;
	}
	set(new_value) {
		if (this.value !== new_value) {
			panelCfg.record(this.id, new_value);
			this.value = new_value;
		}
	}
}

class WindowProperty { // properties without a UI: stored directly in the fb2k panel properties
	constructor(name, default_value) {
		this.name = name;
		this.default_value = default_value; // aligned with PanelProperty: needed by reset (updateProp 'default_value')
		const saved = window.GetProperty(name, default_value);
		this.value = typeof saved === typeof default_value ? saved : default_value; // wrong type (e.g. corrupt data) falls back to the default
	}

	// Methods

	get() {
		return this.value;
	}
	set(new_value) {
		if (this.value !== new_value) {
			window.SetProperty(this.name, new_value);
			this.value = new_value;
		}
	}
}

class PanelProperties {
	constructor() { // this.name_list = {}; debug
	}

	// Methods

	init(cfgProps, winProps) {
		cfgProps.forEach(v => this.add(v, PanelProperty)); // v = [variable name, default value], description as a trailing comment
		winProps.forEach(v => this.add(v, WindowProperty)); // v = [description, default value, variable name]
	}

	add(item, cls) { // cls decides storage and shape: PanelProperty two elements / WindowProperty three
		const id = cls === WindowProperty ? item[2] : item[0];
		const arg = cls === WindowProperty ? item[0] : id;
		this[id + '_internal'] = new cls(arg, item[1]);
		Object.defineProperty(this, id, {
			get() {
				return this[id + '_internal'].get();
			},
			set(new_value) {
				this[id + '_internal'].set(new_value);
			}
		});
	}

	get(name, default_value) { // unregistered runtime names (SYSTEM.* flags, dialog size etc.): straight to the panel properties
		const saved = panelCfg.value(name);
		return saved === undefined ? window.GetProperty(name, default_value) : saved;
	} // initialisation

	set(name, new_value) {
		if (!panelCfg.has(name)) return window.SetProperty(name, new_value); // unregistered names go to the panel properties
		panelCfg.record(name, new_value);
		return true;
	}

	toggle(name) {
		this[name] = !this[name];
	}
}

let properties = [
	['artistView', true], // Artist View

	['sameStyle', true], // Bio & Rev Same Style

	['classicalMusicMode', false], // Classical Music Mode
	['classicalAlbFallback', false], // Classical Music Mode Album Fallback
	['colLineDark', false], // Colour Line Dark
	['swapCol', false], // Colour Swap

	['covBorderDual', false], // Cover Border [Dual Mode]
	['covBorderImgOnly', false], // Cover Border [Image Only]
	['loadCovAllFb', false], // Cover Load All
	['loadCovSelFb', JSON.stringify([0, 1, 2, 3, 4])], // Cover Selection
	['loadCovFolder', false], // Cover Load Folder
	['covReflDual', false], // Cover Reflection [Dual Mode]
	['covReflImgOnly', false], // Cover Reflection [Image Only]
	['covShadowDual', false], // Cover Shadow [Dual Mode]
	['covShadowImgOnly', false], // Cover Shadow [Image Only]
	['covStyleDual', 0], // Cover Style [Dual Mode] Regular-0 Auto-Fill-1 Circular-2
	['covStyleImgOnly', 0], // Cover Style [Image Only] Regular-0 Auto-Fill-1 Circular-2
	['covType', 0], // Cover Type

	['bg', '4,39,68'], // Custom Colour Background
	['frame', '29, 62, 99, 208'], // Custom Colour Film Active Item Frame
	['headingBtn', '121,194,255'], // Custom Colour Heading Button
	['headingText', '121,194,255'], // Custom Colour Heading Text
	['line', '12,21,31'], // Custom Colour Line
	['rectOv', 'rgb(64-0-0)'], // Custom Colour Overlay Fill
	['rectOvBor', '0,255,255'], // Custom Colour Overlay Border
	['stars', '255,190,0'], // Custom Colour Rating Stars
	['summary', '128,228,0'], // Custom Colour Summary
	['text', '171,171,190'], // Custom Colour Text
	['text_h', '121,194,255'], // Custom Colour Text Highlight
	['bgTrans', '0,0,0,0.06'], // Custom Colour Transparent Fill

	['bgUse', false], // Custom Colour Background Use
	['frameUse', false], // Custom Colour Film Active Item Frame Use
	['headingBtnUse', false], // Custom Colour Heading Button Use
	['headingTextUse', false], // Custom Colour Heading Text Use
	['lineUse', false], // Custom Colour Line Use
	['rectOvUse', false], // Custom Colour Overlay Fill Use
	['rectOvBorUse', false], // Custom Colour Overlay Border Use
	['starsUse', false], // Custom Colour Rating Stars Use
	['summaryUse', false], // Custom Colour Summary Use
	['textUse', false], // Custom Colour Text Use
	['text_hUse', false], // Custom Colour Text Highlight Use
	['bgTransUse', false], // Custom Colour Transparent Fill Use

	['custFont', 'Segoe UI,16,0'], // Custom Font
	['custHeadFont', 'Segoe UI,18,2'], // Custom Font Heading

	['custFontUse', false], // Custom Font Use
	['custHeadFontUse', false], // Custom Font Heading Use

	['cycItem', false], // Cycle Item
	['cycPhoto', true], // Cycle Photo
	['cycPhotoLocation', 0], // Cycle Photo Location
	['cycPic', true], // Cycle Picture
	['cycTimeItem', 60], // Cycle Time Item
	['cycTimePic', 20], // Cycle Time Picture

	['dblClickToggle', true], // Double-Click Toggle
	['expandLists', true], // Expand Lists

	['filmStripAutofit', true], // Filmstrip Autofit
	['filmCoverStyle', 1], // Filmstrip Cover Regular-0 Auto-Fill-1 Circular-2
	['filmStripMargin', 0], // Filmstrip Margin
	['filmStripOverlay', false], // Filmstrip Overlay Image
	['filmPhotoStyle', 2], // Filmstrip Photo Regular-0 Auto-Fill-1 Circular-2
	['filmStripPos', 3], // Filmstrip Pos
	['showFilmStrip', true], // Filmstrip Show
	['autoFilm', true], // Filmstrip Show Auto


	['heading', 1], // Heading Hide-0 Show-1
	['fullWidthHeading', false], // Heading Always Full Width
	['hdPos', 0], // Heading Button Position Left-0 Right-1 Center-2
	['hdBtnShow', true], // Heading Button Show
	['hdShowBtnLabel', 1], // Heading Button Show Label
	['bioFlagShow', true], // Heading Flag Artist View
	['revFlagShow', false], // Heading Flag Album View
	['hdLine', 1], // Heading Line Hide-0 Bottom-1 Center-2
	['hdBtnPad', 0], // Heading Padding Button
	['hdLinePad', 0], // Heading Padding Bottom Line
	['hdPad', 0], // Heading Padding
	['hdShowBtnBg', true], // Heading Show Button Background
	['hdShowRedLfm', false], // Heading Show Button Red Lfm
	['hdShowTitle', true], // Heading Show Title
	['headFontStyle', 1], // Heading Style
	['revHeading', '$if2(%BIO_ALBUMARTIST%,Artist Unknown) - $if2(%BIO_ALBUM%,Album Unknown)'], // Heading Title Format Album Review
	['bioHeading', '$if2(%BIO_ARTIST%,Artist Unknown)'], // Heading Title Format Biography
	['trkHeading', '> $if2(%BIO_ARTIST%,Artist Unknown) - $if2(%BIO_TITLE%,Title Unknown)'], // Heading Title Format Track Review
	['lyricHeading', '$if2(%BIO_ARTIST%,Artist Unknown) - $if2(%BIO_TITLE%,Title Unknown)'], // Heading Title Format Lyrics

	['highlightHdBtn', false], // Highlight Heading Button
	['highlightHdText', true], // Highlight Heading Text
	['highlightHdLine', true], // Highlight Heading Line
	['highlightImgBor', false], // Highlight Image Border
	['highlightOvBor', true], // Highlight Overlay Border
	['highlightStars', true], // Highlight Rating Stars
	['highlightSubHd', true], // Highlight Subheadings
	['highlightSummary', false], // Highlight Summary Text
	['highlightText', false], // Highlight Text

	['alignAuto', true], // Image Align Auto
	['textAlign', false], // Image Align With Text
	['alignH', 1], // Image Alignment Horizontal
	['alignV', 1], // Image Alignment Vertical
	['autoEnlarge', false], // Image Auto Enlarge
	['blurAutofill', false], // Image Blur Background Auto-Fill
	['blurTemp', 90], // Image Blur Background Level (%)
	['blurAlpha', 30], // Image Blur Background Opacity (%)
	['covBlur', false], // Image Blur Background Always Use Front Cover
	['imgCounter', false], // Image Counter
	['imgFilterLfm', false], // Image Filter Lastfm
	['imgFilterMaxSz', 12000], // Image Filter Size Max Size
	['imgFilterMaxSzEnabled', false], // Image Filter Size Max Size Enabled
	['imgFilterMinNo', 3], // Image Filter Size Min Number
	['imgFilterMinPx', 500], // Image Filter Size Min Px
	['imgFilterMinPxEnabled', false], // Image Filter Size Min Px Enabled
	['imgFilterMinSz', 50], // Image Filter Size Min Size
	['imgFilterMinSzEnabled', false], // Image Filter Size Min Size Enabled
	['imgFilterBothPx', true], // Image Filter Size Width & Height
	['img_only', false], // Image Only
	['imgReflType', 0], // Image Reflection Type
	['imgSeeker', true], // Image Seeker
	['imgSeekerShow', 0], // Image Seeker Show
	['imgSeekerDisabled', false], // Image Seeker Disabled
	['imgSeekerDots', 1], // Image Seeker Dot Style
	['imgSmoothTrans', false], // Image Smooth Transition
	['transLevel', 92], // Image Smooth Transition Level (%)

	['style', 3], // Layout
	['bioMode', 0], // Layout Bio Mode
	['bioStyle', 3], // Layout Bio
	['gap', 20], // Layout Margin Between Image & Text
	['borL', 20], // Layout Margin Image Left
	['borR', 20], // Layout Margin Image Right
	['borT', 0], // Layout Margin Image Top
	['borB', 0], // Layout Margin Image Bottom
	['textL', 20], // Layout Margin Text Left
	['textR', 20], // Layout Margin Text Right
	['textT', 20], // Layout Margin Text Top
	['textB', 20], // Layout Margin Text Bottom
	['thumbNailGap', 0], // Layout Padding Between Thumbnails
	['revMode', 0], // Layout Rev Mode
	['revStyle', 3], // Layout Rev

	['textPad', 1.6], // Line Padding
	['lockBio', false], // Lock Bio
	['autoLock', false], // Lock Auto

	['menuShowPaste', 1], // Menu Show Paste
	['menuShowMissingData', 0], // Menu Show Missing Data
	['menuShowTagger', 1], // Menu Show Tagger

	['overlayBorderWidth', 1], // Overlay Border Width (px)
	['overlayGradient', 10], // Overlay Gradient (%)
	['overlayStrength', 84.5], // Overlay Strength (%)
	['typeOverlay', 0], // Overlay Type

	['focusLoadImmediate', false], // Panel Focus Load Immediate
	['focusLoadRate', 250], // Panel Focus Load Refresh Rate 200-3000 msec (Max)

	['artBorderDual', false], // Photo Border [Dual Mode]
	['artBorderImgOnly', false], // Photo Border [Image Only]
	['artReflDual', false], // Photo Reflection [Dual Mode]
	['artReflImgOnly', false], // Photo Reflection [Image Only]
	['artShadowDual', false], // Photo Shadow [Dual Mode]
	['artShadowImgOnly', false], // Photo Shadow [Image Only]
	['artStyleDual', 0], // Photo Style [Dual Mode] Regular-0 Auto-Fill-1 Circular-2
	['artStyleImgOnly', 0], // Photo Style [Image Only] Regular-0 Auto-Fill-1 Circular-2

	['focus', false], // Prefer Focus

	['star', 0], // Rating Position Prefer Heading-0 Text-1
	['lfmRating', true], // Rating Show Last.fm
	['lfmRatingName', 'Album rating'], // Rating Text Name Last.fm
	['ratingTextPos', 0], // Rating Text Position Auto-0 Embed-1 Own Line-2

	['reflGradient', 10], // Reflection Gradient (%)
	['reflSize', 100], // Reflection Size (%)
	['reflStrength', 14.5], // Reflection Strength (%)

	['scrollStep', 3], // Scroll Step 0-10 (0 = Page)
	['durationScroll', 500], // Scroll Smooth Duration 0-5000 msec (Max)
	['durationTouchFlick', 3000], // Scroll Touch Flick Duration 0-5000 msec (Max)
	['flickDistance', 0.8], // Scroll Touch Flick Distance 0-10
	['smooth', true], // Scroll: Smooth Scroll
	['sbarArrowWidth', Math.round(11 * $.scale)], // Scrollbar Arrow Width
	['sbarButType', 0], // Scrollbar Button Type
	['sbarCol', 1], // Scrollbar Colour Grey-0 Blend-1
	['sbarGripHeight', Math.round(20 * $.scale)], // Scrollbar Grip MinHeight
	['sbarGripRounded', false], // Scrollbar Grip Rounded
	['sbarFullHeight', false], // Scrollbar Height Prefer Full
	['sbarPad', 0], // Scrollbar Padding
	['narrowSbarWidth', 0], // Scrollbar Narrow Bar Width (0 = Auto)
	['sbarShow', 1], // Scrollbar Show
	['sbarType', 0], // Scrollbar Type Default-0 Styled-1 WindowsLightMode-2 WindowsDarkMode-3
	['sbarWidth', Math.round(11 * $.scale)], // Scrollbar Width
	['sbarWinMetrics', false], // Scrollbar Windows Metrics


	['showMoreTags', true], // Show More Tags
	['showSimilarArtists', true], // Show Similar Artists
	['showTopAlbums', true], // Show Top Albums

	['sourceAll', false], // Source All
	['sourcebio', 0], // Source Bio 0-Lfm 1-Wiki 2-Text
	['sourcerev', 2], // Source Rev 0-Lfm 1-Wiki 2-Text

	['stats', true], // Statistics Show Last.fm Scrobbles & Listeners

	['trackSubHeading', '> $if2(%BIO_ARTIST%,Artist Unknown) - $if2(%BIO_TITLE%,Title Unknown)'], // Subheading [Track Review] Title Format
	['sourceHeading', 1], // Subheading Source Hide-0 Auto-1 Show-2
	['sourceStyle', 1], // Subheading Source Style
	['trackHeading', 1], // Subheading Track Hide-0 Auto-1 Show-2
	['trackStyle', 1], // Subheading Track Style
	['wikiStyle', 1], // Subheading Wikipedia Style

	['summaryCompact', true], // Summary Compact
	['summaryDate', true], // Summary Dates
	['summaryGenre', true], // Summary Genres
	['summaryLocale', true], // Summary Locale
	['summaryOther', true], // Summary Other
	['summaryPopNow', true], // Summary Popular Now
	['summaryLatest', true], // Summary Latest Release
	['summaryShow', true], // Summary Show
	['summaryStyle', 0], // Summary Style
	['topAlign', false], // Text Align Always Top
	['autoOptimiseText', true], // Text Auto Optimise Multiple Items
	['text_only', false], // Text Only

	['txtReaderEnable', true], // Text Reader Enable
	['fieldWidth', 0], // Text Reader Item Properties: Field Width
	['lineDividers', true], // Text Reader Item Properties: Show Line Dividers
	['rowStripes', true], // Text Reader Item Properties: Show Row Stripes
	['vCenter', false], // Text Reader Nowplaying: Vertical Center
	['hCenter', true], // Text Reader Nowplaying: Horizontal Center
	['useTxtReader0', true], // Text Reader 1 Use
	['useTxtReader1', false], // Text Reader 2 Use
	['useTxtReader2', false], // Text Reader 3 Use
	['useTxtReader3', true], // Text Reader 4 Use
	['useTxtReader4', false], // Text Reader 5 Use
	['useTxtReader5', false], // Text Reader 6 Use
	['useTxtReader6', false], // Text Reader 7 Use
	['useTxtReader7', true], // Text Reader 8 Use
	['largerSyncLyricLine', 1], // Text Reader Larger Sync Line
	['lyricsFadeHeight', 0], // Text Reader Lyrics Fade Height
	['lyricsFontStyle', 0], // Text Reader Lyrics Font Style
	['lyricsScrollMaxMethod', 0], // Text Reader Lyrics Scroll Max Method
	['lyricsScrollTimeMax', 500], // Text Reader Lyrics Scroll Time Max
	['lyricsScrollTimeAvg', 750], // Text Reader Lyrics Scroll Time Average
	['scrollSynced', true], // Text Reader Scroll Synced Lyrics
	['scrollUnsynced', false], // Text Reader Scroll Unsynced Lyrics
	['nmTxtReader0', 'lyrics'], // Text Reader 1 Name
	['nmTxtReader1', 'lyrics'], // Text Reader 2 Name
	['nmTxtReader2', 'lyrics'], // Text Reader 3 Name
	['nmTxtReader3', 'nowplaying'], // Text Reader 4 Name
	['nmTxtReader4', 'lyrics'], // Text Reader 5 Name
	['nmTxtReader5', 'lyrics'], // Text Reader 6 Name
	['nmTxtReader6', 'lyrics'], // Text Reader 7 Name
	['nmTxtReader7', 'item properties'], // Text Reader 8 Name
	['pthTxtReader0', '$if2(%lyrics%,%syncedlyrics%)'], // Text Reader 1 Item (field or full path)
	['pthTxtReader1', '%profile%\\lyrics\\%BIO_ARTIST% - %BIO_TITLE%.lrc'], // Text Reader 2 Item (field or full path)
	['pthTxtReader2', '$if2(%unsynced lyrics%,%unsyncedlyrics%)'], // Text Reader 3 Item (field or full path)
	['pthTxtReader3', '%storage_folder%\\nowplaying.txt'], // Text Reader 4 Item (field or full path)
	['pthTxtReader4', '$if2(%lyrics%,%syncedlyrics%)'], // Text Reader 5 Item (field or full path)
	['pthTxtReader5', '%profile%\\lyrics\\%BIO_ARTIST% - %BIO_TITLE%.lrc'], // Text Reader 6 Item (field or full path)
	['pthTxtReader6', '$if2(%unsynced lyrics%,%unsyncedlyrics%)'], // Text Reader 7 Item (field or full path)
	['pthTxtReader7', '%storage_folder%\\item_properties.json'], // Text Reader 8 Item (field or full path)
	['lyricsTxtReader0', true], // Text Reader 1 Lyrics
	['lyricsTxtReader1', true], // Text Reader 2 Lyrics
	['lyricsTxtReader2', true], // Text Reader 3 Lyrics
	['lyricsTxtReader4', true], // Text Reader 5 Lyrics
	['lyricsTxtReader5', true], // Text Reader 6 Lyrics
	['lyricsTxtReader6', true], // Text Reader 7 Lyrics
	['dropShadowLevel', 0], // Text Reader Lyrics/Nowplaying Drop Shadow Level
	['syncTxtReaderLyrics', false], // Text Reader Synchronise With Lyrics Download

	['theme', 0], // Theme
	['touchControl', false], // Touch Control
	['inclTrackRev', 0], // Track Review
	['showTrackRevOptions', false], // Track Review Show Options
];

// properties without a UI entry (15): gestures / derived values / read-only defaults, kept in the fb2k panel properties
const windowProperties = [
	['Filmstrip Size 0-1', 0.15, 'filmStripSize'],
	['Font Size', 16, 'baseFontSize'],
	['Freestyle Custom', JSON.stringify([]), 'styleFree'],
	['Language [Menu] EN-0 ZH-CN-1 ZH-TW-2', 0, 'menuLanguage'],
	['Layout Image Size 0-1', 0.65, 'rel_imgs'],
	['Overlay', JSON.stringify({
		'name': 'Overlay',
		'imL': 0,
		'imR': 0,
		'imT': 0,
		'imB': 0,
		'txL': 0,
		'txR': 0,
		'txT': 0.632,
		'txB': 0
	}), 'styleOverlay'],
	['Panel Focus Server Refresh Rate 1500-15000 msec (Max)', 5000, 'focusServerRate'],
	['Panel Lookup Refresh Rate 1500-15000 msec (Max)', 2500, 'lookUpServerRate'],
	['Statistics Show Last.fm Metacritic Score', true, 'score'],
	['Touch Step 1-10', 1, 'touchStep'],
	['Zoom Font Size (%)', 100, 'zoomFont'],
	['Zoom Heading Font Size (%)', 115, 'zoomHead'],
	['Zoom Button Heading Size (%)', 100, 'zoomHeadBtn'],
	['Zoom Button LookUp Size (%)', 100, 'zoomLookUpBtn'],
	['Text Reader Default codepage (auto = 0)', 65001, 'fileCodePage']// Regorxxx <- Fix text reading for files without BOM ->
];

// Panel properties sink: UI-settable values live ONLY in panel.cfg (window properties are not written any more);
// the handful of properties without a UI entry stay in the window properties as before
class PanelCfg {
	constructor(file) {
		this.file = file;
		const saved = $.file(file) ? $.jsonParse(file, null, 'file-utf8') : null;
		const valid = !!saved && typeof saved === 'object' && !$.isArray(saved);
		this.exists = valid; // missing or corrupt file counts as first run: rebuild it from the code defaults
		this.data = valid ? saved : {};
		this.defaults = {}; // property name -> default value, used by fillDefaults / reset
		this.timer = 0;
		this.dirty = false;
	}

	bind(properties) { // called before init(): register the defaults
		properties.forEach(v => this.defaults[v[0]] = v[1]);
	}

	has(name) { // true when panel.cfg owns this property
		return name in this.defaults;
	}

	value(name) { // value from the file: missing or wrong type falls back to that property's own default
		if (!this.has(name)) return undefined;
		const def = this.defaults[name];
		const v = this.data[name];
		return typeof v === typeof def ? v : def;
	}

	fillDefaults() { // first run / reset: fill with the code defaults, never read the old panel properties
		this.data = {};
		Object.keys(this.defaults).forEach(name => {
			this.data[name] = this.defaults[name];
		});
		this.exists = true;
		this.dirty = false;
	}

	record(name, value) {
		if (!this.has(name)) return;
		if (JSON.stringify(this.data[name]) === JSON.stringify(value)) return;
		this.data[name] = value;
		this.dirty = true;
		if (this.timer) return;
		this.timer = setTimeout(() => { // drag / wheel changes run in bursts: save once at the end
			this.timer = 0;
			this.flush();
		}, 800);
	}

	ensureFolder() {
		const ix = Math.max(this.file.lastIndexOf('\\'), this.file.lastIndexOf('/'));
		if (ix < 0) return;
		const dir = this.file.substring(0, ix);
		if ($.folder(dir)) return;
		try {
			utils.CreateFolder(dir); // creates the whole chain, parents included
		} catch (e) {
			console.log('Biography: cannot create panel.cfg folder: ' + dir);
		}
	}

	write() { // folder + write + verify: $.save fails silently, so log when nothing landed (no $.trace: cfg is not ready yet)
		this.ensureFolder();
		$.save(this.file, JSON.stringify($.sortKeys(this.data), null, 3), true);
		if (!$.file(this.file)) console.log('Biography: panel.cfg write failed: ' + this.file);
	}

	flush() {
		if (!this.dirty) return;
		this.dirty = false;
		this.write();
	}

	reset() { // panel settings were reset: write the code defaults for the UI properties, leave the rest alone
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = 0;
		}
		this.fillDefaults();
		this.write();
	}
}

const panelCfg = new PanelCfg(bioDataPth + 'panel.cfg');
panelCfg.bind(properties);

const ppt = new PanelProperties;
ppt.init(properties, windowProperties);

if (!panelCfg.exists) { // first run (or corrupt file): build the file from the code defaults, never read or migrate any old config
	panelCfg.fillDefaults();
	panelCfg.write();
}
properties = undefined;