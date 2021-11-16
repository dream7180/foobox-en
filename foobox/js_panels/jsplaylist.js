﻿// Name "JSPlaylist"
// Version "1.3.2"
// Author "Br3tt aka Falstaff >> http://br3tt.deviantart.com"
// mod for foobox https://github.com/dream7180
var fbx_set = [];
window.NotifyOthers("get_fbx_set", fbx_set);
var zdpi = fbx_set[9];
var follow_cursor = fbx_set[10];
var ui_mode = fbx_set[11];
var random_mode = fbx_set[12];
var esl_font_auto = fbx_set[16];
var esl_font_bold = fbx_set[17];
var rating2tag = fbx_set[18];
var ui_noborder = fbx_set[19];
var ui_mode_set = fbx_set[20];
var album_front_disc = fbx_set[21];
var album_cover_dir = fbx_set[22];
var artist_cover_dir = fbx_set[23];
var genre_cover_dir = fbx_set[24];
var dir_cover_name = fbx_set[25];
var auto_sw = fbx_set[26];
var btn_fullscr = fbx_set[27];
var show_shadow = fbx_set[28];
var sys_scrollbar = fbx_set[29];
var col_by_cover = fbx_set[30];
// GLOBALS
var g_script_version = "6.1.6.8";
var g_middle_clicked = false;
var g_middle_click_timer = false;
var g_queue_origin = -1;
var g_textbox_tabbed = false;
var g_leave = false;
var g_focus = true;
var g_init_window = true;
var g_left_click_hold = false;
var g_selHolder = null;
var g_repaint = 0;
var g_seconds = 0;
var g_1x1 = false;
var repaint_main = true,
	repaint_main1 = true,
	repaint_main2 = true,
	g_timer1 = false,
	g_timer2 = false;
var repaint_cover1 = true,
	repaint_cover2 = false;
var window_visible = false;
var g_mouse_wheel_timer = false;
var fso = new ActiveXObject("Scripting.FileSystemObject");
//
var setting_init = false;
// drag'n drop from windows system
var g_dragndrop_status = false;
var g_dragndrop_x = -1;
var g_dragndrop_y = -1;
var g_dragndrop_bottom = false;
var g_dragndrop_timer = false;
var g_dragndrop_trackId = -1;
var g_dragndrop_rowId = -1;
var g_dragndrop_targetPlaylistId = -1;
var g_dragndrop_total_before = 0;
var g_dragndrop_drop_forbidden = false;
// font vars
var g_fname, g_fsize, g_fstyle;
var g_font = null;
var g_font_b = null;
var g_font_group1 = null;
var g_font_group2 = null;
var g_font_queue_idx;
// color vars
var g_color_normal_bg = 0;
var g_color_selected_bg = 0;
var g_color_normal_txt = 0;
var g_color_selected_txt = 0;
var g_color_highlight = 0;
var g_color_dl_bg, g_color_dl_txt, g_color_dl_txt_perc, g_color_dl_txt_ext, g_color_dl_txt_art;

// main window vars
var g_avoid_on_playlists_changed = false;
var g_avoid_on_playlist_items_reordered = false;
var g_avoid_on_item_focus_change = false;
var g_avoid_on_playlist_items_added = false;
var g_avoid_on_playlist_items_removed = false;
var g_collect_counter = 0;
var g_first_launch = true;
var g_instancetype = window.InstanceType;

var g_z2 = zoom(2, zdpi),
	g_z3 = zoom(3, zdpi),
	g_z4 = zoom(4, zdpi),
	g_z5 = zoom(5, zdpi),
	g_z6 = zoom(6, zdpi),
	g_z7 = zoom(7, zdpi),
	g_z8 = zoom(8, zdpi),
	g_z10 = zoom(10, zdpi),
	g_z16 = zoom(16, zdpi)
	g_z30 = zoom(30, zdpi);
var ww = 0,
	wh = 0;
var mouse_x = 0,
	mouse_y = 0;
var g_metadb;
var foo_playcount = utils.CheckComponent("foo_playcount", true);
clipboard = {
	selection: null
};
var star_arr = new Array(1*zdpi, 5.5*zdpi, 4.05*zdpi, 8.8*zdpi, 3.5*zdpi, 13*zdpi, 7.5*zdpi, 11.15*zdpi, 11.5*zdpi, 13*zdpi, 11*zdpi, 8.8*zdpi, 14*zdpi, 5.5*zdpi, 9.65*zdpi, 4.75*zdpi, 7.5*zdpi, 1*zdpi, 5.25*zdpi, 4.75*zdpi);

// WSH statistics globals
var tf_path = fb.TitleFormat("$left(%_path_raw%,4)");
var g_track_type;
var repeat_pls = window.GetProperty("PLAYBACK: Repeat playlists", false);
var dl_prefix_folder = window.GetProperty("DOWNLOAD: prefix output folder", "B:\\Download");
var dl_skip = window.GetProperty("DOWNLOAD: auto skip", true);
var dl_rename_by = window.GetProperty("DOWNLOAD: auto rename by", "%album artist% - %title%");
var tf_length_seconds = fb.TitleFormat("%length_seconds_fp%");
var first_played = fb.Titleformat("%first_played%");
var last_played = fb.Titleformat("%last_played%");
var play_counter = fb.Titleformat("%play_counter%");
var play_count = fb.Titleformat("%play_count%");
var l2_addinfo = window.GetProperty("SYSTEM.GroupBy.l2.AdditionalInfo", true);
//download var
var dlppt_x;
var StatusHeadersAvailable = 1 << 0;
var StatusDataReadComplete = 1 << 1;
client = utils.CreateHttpRequestEx(window.ID);
var dl_avoid_flush = false;

//=================================================// main properties / parameters
properties = {
	enableTouchControl: window.GetProperty("SYSTEM.Enable Touch Scrolling", false),
	collapseGroupsByDefault: window.GetProperty("SYSTEM.Collapse Groups by default", false),
	enablePlaylistFilter: window.GetProperty("SYSTEM.Enable Playlist Filter", false),
	NetDisableGroup: window.GetProperty("SYSTEM.NetPlaylist Disable Group", true),
	defaultPlaylistItemAction: window.GetProperty("SYSTEM.Default Playlist Action", "Play"),
	disableToolbar: window.GetProperty("TOOLBAR: Always Disabled", true),
	//"Add to playback queue",
	autocollapse: window.GetProperty("SYSTEM.Auto-Collapse", false),
	showgroupheaders: window.GetProperty("*GROUP: Show Group Headers", true),
	showscrollbar: window.GetProperty("CUSTOM Show Scrollbar", true),
	settingspanel: false,
	smoothscrolling: window.GetProperty("CUSTOM Enable Smooth Scrolling", true),
	cursor_min: 25*zdpi,
	cursor_max: sys_scrollbar ? 120*zdpi : 105*zdpi,
	repaint_rate1: 20,
	repaint_rate2: 60,
	max_columns: 24,
	max_patterns: 25
};

// Singleton for Images
images = {
	path: fb.FoobarPath + "themes\\foobox\\images\\",
	playing_ico: null,
	selected_ico: null,
	show_toolbar:null,
	mood_ico: null,
	sortdirection: null,
	glass_reflect: null,
	nocover: null,
	noartist: null,
	stream: null,
	beam: null,
	loading: null,
	loading_angle: 0
};

// Fonts / Dpi / Colors / Images init

function system_init() {
	get_font();
	get_colors();
	get_images_static();
	get_images_ui();
	get_images_color();
};
system_init();

// Titleformat field
var tf_group_key = null;
// tf fields used in incremental search feature
var tf_artist = fb.TitleFormat("$if(%length%,%artist%,'Stream')");
var tf_albumartist = fb.TitleFormat("$if(%length%,%album artist%,'Stream')");
var tf_bitrate = fb.TitleFormat("$if(%__bitrate_dynamic%,$if(%el_isplaying%,%__bitrate_dynamic%'K',$if($stricmp($left(%codec_profile%,3),'VBR'),%codec_profile%,%__bitrate%'K')),$if($stricmp($left(%codec_profile%,3),'VBR'),%codec_profile%,%__bitrate%'K'))");
var tf_bitrate_playing = fb.TitleFormat("$if(%__bitrate_dynamic%,$if(%_isplaying%,$select($add($mod(%_time_elapsed_seconds%,2),1),%__bitrate_dynamic%,%__bitrate_dynamic%),%__bitrate_dynamic%),%__bitrate%)'K'");
// Sort pattern
var sort_pattern_albumartist = "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_artist = "%artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_album = "%album% | %album artist% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_tracknumber = "%tracknumber% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %title%";
var sort_pattern_title = "%title% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber%";
var sort_pattern_path = "$directory_path(%path%) | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_date = "%date% | %album artist% | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_genre = "%genre% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_rating = "%rating% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_bitrate = "%bitrate% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_modified = "%last_modified% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_playcount = "$if2(%play_counter%,$if2(%play_count%,0)) | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_codec = "%codec% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_queue = "%queue_index% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %title%";
// Singletons
cRow = {
	default_playlist_h: window.GetProperty("SYSTEM.Playlist Row Height in Pixel", 35),
	playlist_h: 29,
	extra_line_h: window.GetProperty("SYSTEM.Playlist Extra-row Height in Pixel", 10),
	headerBar_h: 26,
	settings_h: 30
};

p = {
	headerBar: null,
	list: null,
	settings: null,
	timer_onKey: false
};

cTouch = {
	down: false,
	y_start: 0,
	y_end: 0,
	down_id: 0,
	up_id: 0
};

cSettings = {
	visible: false,
	topBarHeight: zoom(50, zdpi),
	tabPaddingWidth: Math.ceil(30 * zdpi / 14),
	rowHeight: Math.round(cRow.settings_h * zdpi),
	wheel_timer: false
};

cHeaderBar = {
	height: zoom(cRow.headerBar_h, zdpi),
	borderWidth: 2,//Math.ceil(cRow.headerBar_h * g_dpi / 100 / 14),
	locked: window.GetProperty("SYSTEM.HeaderBar.Locked", true),
	timerAutoHide: false,
	sortRequested: false
};

cScrollBar = {
	width: sys_scrollbar ? get_system_scrollbar_width() : 12*zdpi,
	buttonType: {
		cursor: 0,
		up: 1,
		down: 2
	},
	timerID: false,
	parentObjectScrolling: null,
	timerID1: false,
	timerID2: false,
	timerCounter: 0,
	timer_repaint: false
};

cTrack = {
	height: zoom(cRow.playlist_h, zdpi),
	parity: ((zoom(cRow.playlist_h, zdpi) / 2) == Math.floor(zoom(cRow.playlist_h, zdpi) / 2) ? 0 : 1)
};

cGroup = {
	show: window.GetProperty("*GROUP: Show Group Headers", true),
	default_collapsed_height: 3,
	default_expanded_height: 3,
	collapsed_height: 3,
	expanded_height: 3,
	default_count_minimum: window.GetProperty("*GROUP: Minimum number of rows in a group", 0),
	count_minimum: window.GetProperty("*GROUP: Minimum number of rows in a group", 0),
	extra_rows: 0,
	//type: 0,//window.GetProperty("*GROUP: type of cover", 0),
	pattern_idx: window.GetProperty("SYSTEM.Groups.Pattern Index", 0)
};

cover = {
	show: true,
	column: false,
	draw_glass_reflect: window.GetProperty("CUSTOM.Cover draw reflect", false),
	keepaspectratio: window.GetProperty("CUSTOM.Cover keep ration aspect", true),
	load_timer: false,
	repaint_timer: false,
	margin: 7,
	w: 0,
	max_w: cGroup.default_collapsed_height > cGroup.default_expanded_height ? cGroup.default_collapsed_height * cTrack.height : cGroup.default_expanded_height * cTrack.height,
	h: 0,
	max_h: cGroup.default_collapsed_height > cGroup.default_expanded_height ? cGroup.default_collapsed_height * cTrack.height : cGroup.default_expanded_height * cTrack.height,
	previous_max_size: -1,
	resized: false
};

cList = {
	search_string: "",
	incsearch_font: GdiFont(g_fname, g_fsize + 10, 1),
	inc_search_noresult: false,
	clear_incsearch_timer: false,
	incsearch_timer: false,
	repaint_timer: false,
	scrollstep: window.GetProperty("SYSTEM.Playlist Scroll Step", 6),
	touchstep: window.GetProperty("SYSTEM.Playlist Touch Step", 2),
	scroll_timer: false,
	scroll_delta: cTrack.height,
	scroll_direction: 1,
	scroll_step: Math.floor(cTrack.height / 3),
	scroll_div: 2,
	borderWidth: Math.ceil(cRow.headerBar_h * zdpi / 14),
	borderWidth_half: Math.ceil(cRow.headerBar_h * zdpi / 28),
	beam_timer: false,
	addToQueue_timer: false,
	enableExtraLine: window.GetProperty("SYSTEM.Enable Extra Line", false)
};

dragndrop = {
	enabled: true,
	contigus_sel: null,
	x: 0,
	y: 0,
	drag_id: -1,
	drop_id: -1,
	timerID: false,
	drag_in: false,
	drag_out: false,
	clicked: false,
	moved: false
};

columns = {
	rating: false,
	rating_x: 0,
	rating_w: 0,
	rating_drag: false,
	mood: false,
	mood_x: 0,
	mood_w: 0,
	mood_drag: false
};
//toolbar
oToolbar = function(){
	this.disabled = properties.disableToolbar;
	this.state = 0;
	this.width = 280*zdpi;
	this.height = 32*zdpi;
	this.x = 0;
	this.y = 0;
	this.showgh_org = properties.showgroupheaders;
	this.timer_show = false;
	this.dlmode = false;
	this.dl_rowh = Math.ceil(g_fsize + (14*zdpi));
	this.totalh = this.dl_rowh * 5 + this.height + g_z6;
	this.dl_pctw = Math.floor(35*zdpi);
	this.dl_titlex = 0;
	this.dl_hide = window.GetProperty("DOWNLOAD: Hide Download Panel", false);
	this.dl_timer = false;
	this.dl_count = 0;
	
	this.setSize = function(){
		this.x = Math.max(0, (ww - this.width)/2);
		this.y = wh - this.height;
		this.dl_titlex = this.x + g_z10 + this.dl_pctw;
	}
	
	this.draw = function(gr){
		if(cSettings.visible) return;
		if(this.disabled) return;
		if(this.state == 0 && !this.dlmode && !properties.disableToolbar) gr.DrawImage(images.show_toolbar, (ww - images.show_toolbar.Width)/2, wh- images.show_toolbar.Height, images.show_toolbar.Width, images.show_toolbar.Height, 0, 0, images.show_toolbar.Width, images.show_toolbar.Height, 0, 70);
		else{
			var x2=2*zdpi, x3=3*zdpi, x4=4*zdpi, x23=23*zdpi, end_x = this.x + this.width, mid_x = this.x+this.width/2, col_activeitem = g_color_dl_txt &0x40ffffff;
			var imgw = images.tool_album.Width, imgh = images.tool_album.Height;
			gr.SetSmoothingMode(0);
			gr.FillSolidRect(this.x, this.y, this.width, this.height, g_color_dl_bg);
			gr.SetSmoothingMode(2);
			this.groupAlb_bt.draw(gr, end_x - 2*imgw-x4, this.y+x3, 255);
			this.groupArt_bt.draw(gr, end_x - imgw-x3, this.y+x3, 255);
			if(!properties.disableToolbar) {
				if(properties.showgroupheaders)gr.FillRoundRect(this.x+x3, this.y+x3, x23, x23, 3, 3, col_activeitem);
				gr.gdiDrawText("G", g_font, g_color_dl_txt, this.x + x2, this.y+x3, imgw, imgh, ccs_txt);
				this.groupby_bt.draw(gr, this.x + x2, this.y+x3, 255);
			} else if(p.list.dlitems.length){
				this.dlcancel_bt.draw(gr, this.x + x2, this.y+x3, 255);
				gr.DrawImage(images.dl_cancel, this.x + x2, this.y+x3, imgw, imgh, 0, 0, imgw, imgh, 0, 255);
			}else{
				this.close_bt.draw(gr, this.x + x2, this.y+x3, 255);
				gr.DrawImage(images.close, this.x + x2, this.y+x3, imgw, imgh, 0, 0, imgw, imgh, 0, 255);
			}
			if(p.list.dlitems.length){
				this.dl_showhide.draw(gr, this.x + imgw+x3, this.y+x3, 255);
				gr.FillEllipse(this.x + imgw+x4, this.y+x4, imgw-x2,imgw-x2,g_color_dl_txt)
				gr.gdiDrawText(this.dl_count, g_font_2, g_color_dl_bg, this.x + imgw+x4, this.y+x4, imgw,imgh, ccs_txt);
				if(!properties.disableToolbar){
					this.dlcancel_bt.draw(gr, this.x + 2*(imgw+x2), this.y+x3, 255);
					gr.DrawImage(images.dl_cancel, this.x + 2*(imgw+x2), this.y+x3, imgw, imgh, 0, 0, imgw, imgh, 0, 255);
				}
			}else {
				gr.DrawImage(images.dl_folder, this.x + imgw+x3, this.y+x3, imgw, imgh, 0, 0, imgw, imgh, 0, 255);
				this.dlfolder_bt.draw(gr, this.x + imgw+x3, this.y+x3, 255);
			}
			if(cGroup.pattern_idx == 0){gr.FillRoundRect(end_x - 2*imgw-x3, this.y+x4, x23, x23, 3, 3, col_activeitem);}
			else if(cGroup.pattern_idx == 3){gr.FillRoundRect(end_x - imgw-x2, this.y+x4, x23, x23, 3, 3, col_activeitem);}
			gr.SetSmoothingMode(0);
			gr.DrawImage(images.tool_album, end_x - 2*imgw-x4, this.y+x3, imgw, imgh, 0, 0, imgw, imgh, 0, 255);
			gr.DrawImage(images.tool_artist, end_x - imgw-x3, this.y+x3, imgw, images.tool_artist.Height, 0, 0, imgw, images.tool_artist.Height, 0, 255);
		}
	}
	
	this.repaint = function(){
		window.RepaintRect(this.x-1, this.y-1, this.width+2, this.height+2);
	}
	
	this.repaint_dl = function(forced){
		if(this.dl_hide && !forced) window.RepaintRect(this.x-1, this.y-1, this.width+2, this.height+2);
		else window.RepaintRect(this.x-1, wh -this.totalh-1, this.width+2, this.totalh+1);
	}
	
	this.checkState = function(event, x, y){
		if(this.disabled) return;
		switch (event) {
		case "move":
			if(this.state == 0 && !this.dlmode && !properties.disableToolbar){
				if(x > (this.x + this.width*0.2) && x < (this.x + this.width * 0.8) && y > (this.y + this.height*0.25)) {
					this.state = 1;
					if(!toolbar.timer_show){
						toolbar.timer_show = window.SetTimeout(function() {
							if(toolbar.state == 1){
								toolbar.repaint();
							}
							toolbar.timer_show && window.ClearTimeout(toolbar.timer_show);
							toolbar.timer_show = false;
						}, 300);
					}
				}
				//else {
				//	this.state = 0;
				//}
			} else{
				if(x > this.x && x < (this.x + this.width) && y > this.y) {
					this.state = 1;
					if(!toolbar.timer_show) {
						this.groupAlb_bt_check(event, x, y);
						this.groupArt_bt_check(event, x, y);
						if(!properties.disableToolbar) this.groupby_bt_check(event, x, y);
						else if(p.list.dlitems.length == 0) this.close_bt_check(event, x, y);
						if(p.list.dlitems.length) {
							this.dlcancel_bt_check(event, x, y);
						}else this.dlfolder_bt_check(event, x, y);
					}
				} else {
					this.state = 0;
					this.groupAlb_bt_check("leave");
					this.groupArt_bt_check("leave");
					if(!properties.disableToolbar) this.groupby_bt_check("leave");
					else if(p.list.dlitems.length == 0) this.close_bt_check("leave");
					if(p.list.dlitems.length) {
						this.dlcancel_bt_check("leave");
					}else this.dlfolder_bt_check("leave");
					if(!this.dlmode) this.repaint();
				}
			}
			break;
		case "down":
			if(!this.state) return;
			this.groupAlb_bt_check(event, x, y);
			this.groupArt_bt_check(event, x, y);
			if(!properties.disableToolbar) this.groupby_bt_check(event, x, y);
			else if(p.list.dlitems.length == 0) this.close_bt_check(event, x, y);
			if(p.list.dlitems.length) {
				this.dlcancel_bt_check(event, x, y);
			}else this.dlfolder_bt_check(event, x, y);
			break;
		case "up":
			if(!this.state) return;
			this.groupAlb_bt_check(event, x, y);
			this.groupArt_bt_check(event, x, y);
			if(!properties.disableToolbar) this.groupby_bt_check(event, x, y);
			else if(p.list.dlitems.length == 0) this.close_bt_check(event, x, y);
			if(p.list.dlitems.length) {
				this.dlcancel_bt_check(event, x, y);
				this.dl_showhide.checkstate(event, x, y);
				if(this.dl_showhide.state == ButtonStates.hover){
					this.dl_hide = !this.dl_hide;
					window.SetProperty("DOWNLOAD: Hide Download Panel", this.dl_hide);
					this.repaint_dl(true);
				}
			}else this.dlfolder_bt_check(event, x, y);
			break;
		case "leave":
			if(this.state != 0){
				this.state = 0;
				this.groupAlb_bt_check(event);
				this.groupArt_bt_check(event);
				if(!properties.disableToolbar) this.groupby_bt_check(event);
				else if(p.list.dlitems.length == 0) this.close_bt_check(event);
				if(p.list.dlitems.length) {
					this.dlcancel_bt_check(event);
				}else this.dlfolder_bt_check(event);
				if(!this.dlmode) this.repaint();
			}
			break;
		}
	}
	
	this.init_radiolist = function() {
		var pl_type = p.list.name.substring(0, 5);
		if (pl_type == "Radio") {
			if(properties.NetDisableGroup) nethide_groupheader(true);
		}else{
			if(properties.NetDisableGroup) nethide_groupheader(false);
		}
	}
	
	this.init_tbbtn = function(){
		this.groupby_bt = new button(images.toolbtn_n, images.toolbtn_h, images.toolbtn_d);
		this.groupAlb_bt = new button(images.toolbtn_n, images.toolbtn_h, images.toolbtn_d);
		this.groupArt_bt = new button(images.toolbtn_n, images.toolbtn_h, images.toolbtn_d);
		this.dl_showhide = new button(images.toolbtn_n, images.toolbtn_n, images.toolbtn_n);
		this.dlfolder_bt = new button(images.toolbtn_n, images.toolbtn_h, images.toolbtn_d);
		this.dlcancel_bt = new button(images.toolbtn_n, images.toolbtn_h, images.toolbtn_d);
		this.close_bt = new button(images.toolbtn_n, images.toolbtn_h, images.toolbtn_d);
		
	}
	this.init_tbbtn();

	this.close_bt_check = function(event, x, y){
		switch (event) {
		case "move":
			this.close_bt.checkstate(event, x, y);
			break;
		case "down":
			this.close_bt.checkstate(event, x, y);
			break;
		case "up":
			this.close_bt.checkstate(event, x, y);
			if(this.close_bt.state == ButtonStates.hover){
				this.disabled = true;
				this.state = 0;
				this.repaint();
			}
			break;
		case "leave":
			this.close_bt.state = ButtonStates.normal;
			break;
		}
	}
	
	this.groupby_bt_check = function(event, x, y){
		switch (event) {
		case "move":
			this.groupby_bt.checkstate(event, x, y);
			break;
		case "down":
			this.groupby_bt.checkstate(event, x, y);
			break;
		case "up":
			this.groupby_bt.checkstate(event, x, y);
			if(this.groupby_bt.state == ButtonStates.hover){
				showhide_groupheader();
			}
			break;
		case "leave":
			this.groupby_bt.state = ButtonStates.normal;
			break;
		}
	}
	
	this.groupAlb_bt_check = function(event, x, y){
		switch (event) {
		case "move":
			this.groupAlb_bt.checkstate(event, x, y);
			break;
		case "down":
			this.groupAlb_bt.checkstate(event, x, y);
			break;
		case "up":
			this.groupAlb_bt.checkstate(event, x, y);
			if(this.groupAlb_bt.state == ButtonStates.hover){
				cGroup.pattern_idx = 0;
				window.SetProperty("SYSTEM.Groups.Pattern Index", cGroup.pattern_idx);
				window.NotifyOthers("PLMan to change sorting", p.list.groupby[cGroup.pattern_idx].sortOrder);
				plman.SortByFormatV2(plman.ActivePlaylist, p.list.groupby[cGroup.pattern_idx].sortOrder, 1);
				p.list.updateHandleList(plman.ActivePlaylist, false);
				p.list.setItems(true);
				p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
				full_repaint();
			}
			break;
		case "leave":
			this.groupAlb_bt.state = ButtonStates.normal;
			break;
		}
	}
	
	this.groupArt_bt_check = function(event, x, y){
		switch (event) {
		case "move":
			this.groupArt_bt.checkstate(event, x, y);
			break;
		case "down":
			this.groupArt_bt.checkstate(event, x, y);
			break;
		case "up":
			this.groupArt_bt.checkstate(event, x, y);
			if(this.groupArt_bt.state == ButtonStates.hover){
				cGroup.pattern_idx = 3;
				window.SetProperty("SYSTEM.Groups.Pattern Index", cGroup.pattern_idx);
				window.NotifyOthers("PLMan to change sorting", p.list.groupby[cGroup.pattern_idx].sortOrder);
				plman.SortByFormatV2(plman.ActivePlaylist, p.list.groupby[cGroup.pattern_idx].sortOrder, 1);
				p.list.updateHandleList(plman.ActivePlaylist, false);
				p.list.setItems(true);
				p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
				full_repaint();
			}
			break;
		case "leave":
			this.groupAlb_bt.state = ButtonStates.normal;
			break;
		}
	}
	
	this.dlfolder_bt_check = function(event, x, y){
		switch (event) {
		case "move":
			this.dlfolder_bt.checkstate(event, x, y);
			break;
		case "down":
			this.dlfolder_bt.checkstate(event, x, y);
			break;
		case "up":
			this.dlfolder_bt.checkstate(event, x, y);
			if(this.dlfolder_bt.state == ButtonStates.hover){
				var WshShell = new ActiveXObject("WScript.Shell");
				if (!fso.FolderExists(dl_prefix_folder)) {
					try{
						fso.CreateFolder(dl_prefix_folder)
					} catch(e) {
						fb.trace("Download: Invalid path");
						break;
					}
				}
				var filepath = dl_prefix_folder;
				if (dl_prefix_folder.substring(0,1) == "B") filepath = filepath.replace('B:\\', fb.FoobarPath);
				WshShell.Run("explorer.exe" + " \"" + filepath+ "\"");
			}
			break;
		case "leave":
			this.dlfolder_bt.state = ButtonStates.normal;
			break;
		}
	}
	
	this.dlcancel_bt_check = function(event, x, y){
		switch (event) {
		case "move":
			this.dlcancel_bt.checkstate(event, x, y);
			break;
		case "down":
			this.dlcancel_bt.checkstate(event, x, y);
			break;
		case "up":
			this.dlcancel_bt.checkstate(event, x, y);
			if(this.dlcancel_bt.state == ButtonStates.hover){
				for (var i = 0; i < p.list.dl_num; i++){
						client.AbortAsync(i, url = "");
						try{
							if(p.list.dlitems[i].downloaded < 100) fso.DeleteFile(dl_prefix_folder + "\\" + p.list.dlitems[i].filename, true);
						}catch(e){}
					}
					var timer_flush = window.SetTimeout(function() {
						p.list.dlitems = [];
						p.list.dl_num = 0;
						toolbar.dlmode = false;
						toolbar.repaint_dl();
						toolbar.checkState("move", mouse_x, mouse_y);
						timer_flush && window.ClearTimeout(timer_flush);
						timer_flush = false;
					}, 250);
			}
			break;
		case "leave":
			this.dlcancel_bt.state = ButtonStates.normal;
			break;
		}
	}
}
// Smoother scrolling in playlist

function set_scroll_delta() {
	var maxOffset = (p.list.totalRows > p.list.totalRowVisible ? p.list.totalRows - p.list.totalRowVisible : 0);
	if (p.list.offset > 0 && p.list.offset < maxOffset) {
		if (!cList.scroll_timer) {
			cList.scroll_delta = cTrack.height;
			if (!(cList.scroll_direction > 0 && p.list.offset == 0) && !(cList.scroll_direction < 0 && p.list.offset >= p.list.totalRows - p.list.totalRowVisible)) {
				cList.scroll_timer = window.SetInterval(function() {
					cList.scroll_step = Math.round(cList.scroll_delta / cList.scroll_div);
					cList.scroll_delta -= cList.scroll_step;
					if (cList.scroll_delta <= 1) {
						window.ClearTimeout(cList.scroll_timer);
						cList.scroll_timer = false;
						cList.scroll_delta = 0;
					};
					full_repaint();
				}, 30);
			};
		};
		else {
			cList.scroll_delta = cTrack.height;
		};
	};
};

function on_artDown_notify(type, infoMetadb){
	if(type == 1 && cGroup.pattern_idx > 1 && cGroup.pattern_idx < 6) return;
	if(type == 2 && cGroup.pattern_idx != 2 && cGroup.pattern_idx != 3) return;
	var fin = p.list.items.length;
	var ThisIndex = null;
	for (var i = 0; i < fin; i++) {
		if(p.list.items[i].metadb.Compare(infoMetadb)){
		//if(fb.TitleFormat("%album artist%-%album%").EvalWithMetadb(p.list.items[i].metadb) == art_alb) {
			ThisIndex = i;
			break;
		}
	}
	if(ThisIndex){
		p.list.groups[p.list.items[ThisIndex].group_index].load_requested = 0;
		p.list.groups[p.list.items[ThisIndex].group_index].cover_img = g_image_cache.hit(p.list.items[ThisIndex].metadb, p.list.items[ThisIndex].group_index, true);
		full_repaint();
	}
}

// Images cache
function on_get_album_art_done(metadb, art_id, image, image_path) {

	if (g_image_cache.counter > 0) g_image_cache.counter--;

	var cover_metadb = null;
	var fin = p.list.items.length;
	for (var i = 0; i < fin; i++) {
		if (p.list.items[i].metadb) {
			var albumIndex = p.list.items[i].group_index;
			if (cover.column) {
				cover_metadb = p.list.handleList.Item(p.list.groups[albumIndex].start);
			};
			else {
				cover_metadb = p.list.items[i].metadb;
			};
			if (cover_metadb.Compare(metadb)) {
				p.list.groups[albumIndex].cover_img = g_image_cache.getit(metadb, p.list.items[i].tracktype, image, albumIndex);
				var cx = p.list.items[i].x;
				var cy = p.list.items[i].y;
				// fix for a weird behaviour with engine Jscript9
				if (!cx) cx = 2;
				else if (cx < 2) cx = 2;
				if (!cy) cy = 2;
				else if (cy < 2) cy = 2;
				var cw = cover.column ? ((p.headerBar.columns[0].w <= cover.max_w) ? cover.max_w : p.headerBar.columns[0].w) : cover.max_w;
				if (!g_mouse_wheel_timer && !cScrollBar.timerID2 && !cList.repaint_timer) {
					if (!cover.repaint_timer) {
						cover.repaint_timer = window.SetTimeout(function() {
							g_1x1 = false;
							if (!g_mouse_wheel_timer && !cScrollBar.timerID2 && !cList.repaint_timer) cover_repaint(); //window.RepaintRect(p.list.x, p.list.y, cw, p.list.h);
							cover.repaint_timer && window.ClearTimeout(cover.repaint_timer);
							cover.repaint_timer = false;
						}, 20);
					};
					g_1x1 = true;
					window.RepaintRect(0, 0, 1, 1);
					g_1x1 = false;
				};
				break;
			};
		};
	};
};

function on_load_image_done(tid, image){
    var fin = p.list.items.length;
    for(var k = 0; k < fin; k++) {
        if(p.list.items[k].metadb) {
			var albumIndex = p.list.items[k].group_index;
			if(p.list.groups[albumIndex].tid == tid && p.list.groups[albumIndex].load_requested == 1) {
				p.list.groups[albumIndex].load_requested = 2;
				p.list.groups[albumIndex].cover_img = g_image_cache.getit(p.list.items[k].metadb, p.list.items[k].tracktype, image, albumIndex);
				var cx = p.list.items[k].x;
				var cy = p.list.items[k].y;
				// fix for a weird behaviour with engine Jscript9
				if (!cx) cx = 2;
				else if (cx < 2) cx = 2;
				if (!cy) cy = 2;
				else if (cy < 2) cy = 2;
				var cw = cover.column ? ((p.headerBar.columns[0].w <= cover.max_w) ? cover.max_w : p.headerBar.columns[0].w) : cover.max_w;
				if (!g_mouse_wheel_timer && !cScrollBar.timerID2 && !cList.repaint_timer) {
					if (!cover.repaint_timer) {
						cover.repaint_timer = window.SetTimeout(function() {
							g_1x1 = false;
							if (!g_mouse_wheel_timer && !cScrollBar.timerID2 && !cList.repaint_timer) cover_repaint(); //window.RepaintRect(p.list.x, p.list.y, cw, p.list.h);
							cover.repaint_timer && window.ClearTimeout(cover.repaint_timer);
							cover.repaint_timer = false;
						}, 20);
					};
					g_1x1 = true;
					window.RepaintRect(0, 0, 1, 1);
					g_1x1 = false;
				};
                break;
            };
        };
    };
};

image_cache = function() {
	this.counter = 0;
	this._cachelist = {};
	this.hit = function(metadb, albumIndex, force) {
		var _crc = p.list.groups[albumIndex].cachekey;
		var img = this._cachelist[_crc];
		if (typeof img == "undefined" || img == null || force) { // if image not in cache, we load it asynchronously
			var crc_exist = check_cache(albumIndex);
			if (crc_exist && p.list.groups[albumIndex].load_requested == 0){
				if (!cover.load_timer) {
					cover.load_timer = window.SetTimeout(function() {
						try {
                                p.list.groups[albumIndex].tid = load_image_from_cache(_crc);
                                p.list.groups[albumIndex].load_requested = 1;
                            }; catch(e) {};
						cover.load_timer && window.ClearTimeout(cover.load_timer);
						cover.load_timer = false;
					}, (g_mouse_wheel_timer || cScrollBar.timerID2 ? 20 : 5));
				};
			}
			else if(p.list.groups[albumIndex].load_requested == 0){
				if (!cover.load_timer) {
					cover.load_timer = window.SetTimeout(function() {
						switch (cGroup.pattern_idx) {
						case 0:
						case 1:
							var art_id = AlbumArtId.front;
							break;
						case 2:
						case 3:
							var art_id = AlbumArtId.artist;
							break;
						default:
							var art_id = AlbumArtId.front;
						};
						var metadb_tracktype = TrackType(tf_path.EvalWithMetadb(metadb));
						if (cGroup.pattern_idx == 4) {
							var _path = genre_cover_dir + "\\" + GetGenre(fb.TitleFormat("%genre%").EvalWithMetadb(metadb));
							var genre_img = gdi.Image( _path + ".jpg") || gdi.Image( _path + ".png");
							p.list.groups[albumIndex].load_requested = 1;
							img = g_image_cache.getit(metadb, metadb_tracktype, genre_img, albumIndex);
							full_repaint();
						} else if (cGroup.pattern_idx == 5) {
							var _path = fb.TitleFormat("$directory_path(%path%)\\").EvalWithMetadb(metadb);
							var dir_img = gdi.Image( _path + dir_cover_name + ".jpg") || gdi.Image( _path + dir_cover_name + ".png");
							p.list.groups[albumIndex].load_requested = 1;
							img = g_image_cache.getit(metadb, metadb_tracktype, dir_img, albumIndex);
							full_repaint();
						}
						else {
							g_image_cache.counter++;
							if((cGroup.pattern_idx < 2 || cGroup.pattern_idx > 5) && album_front_disc && metadb_tracktype < 2){
								if (utils.GetAlbumArtEmbedded(metadb.RawPath, 2))
									art_id = AlbumArtId.disc;
								CollectGarbage();
							}
							p.list.groups[albumIndex].load_requested = 1;
							utils.GetAlbumArtAsync(window.ID, metadb, art_id, true, false, false);
						}
						cover.load_timer && window.ClearTimeout(cover.load_timer);
						cover.load_timer = false;
					}, (g_mouse_wheel_timer || cScrollBar.timerID2 ? 30 : 10));
				};
			}
		};
		return img;
	};
	this.getit = function(metadb, track_type, image, albumIndex) {
		var cw = cover.column ? ((p.headerBar.columns[0].w <= cover.max_w) ? cover.max_w : p.headerBar.columns[0].w) : cover.max_w;
		var ch = cw;
		var img;
		if (cover.keepaspectratio) {
			if (!image) {
				var pw = cw + cover.margin * 2;
				var ph = ch + cover.margin * 2;
			};
			else {
				if (image.Height >= image.Width) {
					var ratio = image.Width / image.Height;
					var pw = (cw + cover.margin * 2) * ratio;
					var ph = ch + cover.margin * 2;
				};
				else {
					var ratio = image.Height / image.Width;
					var pw = cw + cover.margin * 2;
					var ph = (ch + cover.margin * 2) * ratio;
				};
			};
		};
		else {
			var pw = cw + cover.margin * 2;
			var ph = ch + cover.margin * 2;
		};
		// cover.type : 0 = nocover, 1 = external cover, 2 = embedded cover, 3 = stream
		//if (track_type != 3) {
			if (metadb) {
				img = FormatCover(image, pw, ph, cover.draw_glass_reflect, false);
				if (!img) {
					//img = (cGroup.type == 1) ? images.noartist : images.nocover;
					if(track_type == 3) img = images.stream;
					else img = null;
					//cover.type = 0;
				};
				//else {
					//cover.type = 1;
				//};
			};
		//};
		//else {
		//	img = images.stream;
			//cover.type = 3;
		//};
		this._cachelist[p.list.groups[albumIndex].cachekey] = img;
		return img;
	};
};
var g_image_cache = new image_cache;

//=================================================// Cover tools

function FormatCover(image, w, h, reflect, rawBitmap) {
	if (!image || w <= 0 || h <= 0) return image;
	if (reflect) {
		var new_img = image.Resize(w, h, 2);
		var gb = new_img.GetGraphics();
		if (h > w) {
			gb.DrawImage(images.glass_reflect, Math.floor((h - w) / 2) * -1 + 1, 1, h - 2, h - 2, 0, 0, images.glass_reflect.Width, images.glass_reflect.Height, 0, 150);
		};
		else {
			gb.DrawImage(images.glass_reflect, 1, Math.floor((w - h) / 2) * -1 + 1, w - 2, w - 2, 0, 0, images.glass_reflect.Width, images.glass_reflect.Height, 0, 150);
		};
		new_img.ReleaseGraphics(gb);
		if (rawBitmap) {
			return new_img.CreateRawBitmap();
		};
		else {
			return new_img;
		};
	};
	else {
		if (rawBitmap) {
			return image.Resize(w, h, 2).CreateRawBitmap();
		};
		else {
			return image.Resize(w, h, 2);
		};
	};

};

function reset_cover_timers() {
	cover.load_timer && window.ClearTimeout(cover.load_timer);
	cover.load_timer = false;
};
// ================================================================================================== //

function full_repaint() {
	repaint_main1 = repaint_main2;
};

function cover_repaint() {
	repaint_cover1 = repaint_cover2;
};

function resize_panels() {

	// list row height
	if (cList.enableExtraLine) {
		cRow.playlist_h = cRow.default_playlist_h + cRow.extra_line_h;
	};
	else {
		cRow.playlist_h = cRow.default_playlist_h;
	};
	cTrack.height = zoom(cRow.playlist_h, zdpi);
	cTrack.parity = ((zoom(cRow.playlist_h, zdpi) / 2) == Math.floor(zoom(cRow.playlist_h, zdpi) / 2) ? 0 : 1);

	if (cHeaderBar.locked) {
		var headerbar_h = cHeaderBar.height;
		p.headerBar.visible = true;
	};
	else {
		var headerbar_h = 1; //(topbar_h == 0) ? 0 : 1;
		p.headerBar.visible = false;
	};
	// list default height ?
	var list_h = wh - headerbar_h - (p.headerBar.visible ? cHeaderBar.borderWidth : 0);
	// set Size of Header Bar
	p.headerBar && p.headerBar.setSize(0, 0, ww, cHeaderBar.height);
	p.headerBar.calculateColumns();

	// set Size of List
	p.list.setSize(0, (wh - list_h), ww, list_h);
	if (!g_init_window) {
		p.list.setItems(true);
	};

	// set Size of scrollbar
	p.scrollbar.setSize(p.list.x + p.list.w - cScrollBar.width, p.list.y, cScrollBar.width, p.list.h);
	p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);

	// set Size of Settings
	if (cSettings.visible) p.settings.setSize(0, 0, ww, wh);
};

//=================================================// Init

function on_init() {
	window.DlgCode = DLGC_WANTALLKEYS;
	// clear queue and queue playlist
	plman.FlushPlaybackQueue();
	ClearQueuePlaylist();

	// check properties
	if (!properties.showgroupheaders) {
		cGroup.collapsed_height = 0;
		cGroup.expanded_height = 0;
	};

	p.list = new oList("p.list", plman.ActivePlaylist);
	p.headerBar = new oHeaderBar();
	p.headerBar.initColumns();
	p.scrollbar = new oScrollbar( /*cScrollBar.themed*/ );
	p.settings = new oSettings();
	toolbar = new oToolbar();

	if (g_timer1) {
		window.KillTimer(g_timer1);
		g_timer1 = false;
	};
	g_timer1 = window.SetInterval(function() {
		if (!window.IsVisible) {
			window_visible = false;
			return;
		};

		var repaint_1 = false;

		if (!window_visible) {
			window_visible = true;
		};

		if (repaint_main1 == repaint_main2) {
			repaint_main2 = !repaint_main1;
			repaint_1 = true;
		};

		if (repaint_1) {
			window.Repaint();
		};

	}, properties.repaint_rate1);

	if (g_timer2) {
		window.KillTimer(g_timer2);
		g_timer2 = false;
	};
	g_timer2 = window.SetInterval(function() {

		if (repaint_main1 == repaint_main2) {
			return;
		};

		if (!window.IsVisible) {
			window_visible = false;
			return;
		};

		var repaint_2 = false;

		if (!window_visible) {
			window_visible = true;
		};

		images.loading_angle = (images.loading_angle < 360 ? images.loading_angle + 36 : 36);

		if (repaint_cover1 == repaint_cover2) {
			repaint_cover2 = !repaint_cover1;
			if (!cScrollBar.timerID2 && !g_mouse_wheel_timer) repaint_2 = true;
		};

		if (repaint_2 || g_image_cache.counter > 0) {
			if (!g_mouse_wheel_timer && !cScrollBar.timerID2 && !cList.repaint_timer) {
				var bigger_grp_height = (cGroup.default_expanded_height > cGroup.default_collapsed_height ? cGroup.default_expanded_height : cGroup.default_collapsed_height);
				if (p.headerBar.columns[0].percent > 0) {
					var cw = cover.margin + p.headerBar.columns[0].w;
				};
				else if (cover.show) {
					var cw = cover.margin + (cTrack.height * bigger_grp_height);
				};
				window.RepaintRect(p.list.x, p.list.y, cw, p.list.h);
			};
		};
	}, properties.repaint_rate2);
};
on_init();

// OnSize

function on_size() {
	if (!window.Width || !window.Height) return;
	if (g_instancetype == 0) { // CUI
		window.MinWidth = 360;
		window.MinHeight = 200;
	};
	else if (g_instancetype == 1) { // DUI
		window.MinWidth = zoom(360, zdpi);
		window.MinHeight = zoom(200, zdpi);
	};

	ww = window.Width;
	wh = window.Height;
	resize_panels();
	//toolbar
	toolbar.setSize();

	// Set the empty rows count in playlist setup for cover column size!
	if (p.headerBar.columns[0].percent > 0) {
		//cover.resized = true;
		cover.column = true;
		cGroup.count_minimum = Math.ceil((p.headerBar.columns[0].w) / cTrack.height);
		if (cGroup.count_minimum < cGroup.default_count_minimum) cGroup.count_minimum = cGroup.default_count_minimum;
	};
	else {
		cover.column = false;
		cGroup.count_minimum = cGroup.default_count_minimum;
	};

	if (g_init_window) {
		properties.collapseGroupsByDefault = (p.list.groupby[cGroup.pattern_idx].collapseGroupsByDefault == 0 ? false : true);
		update_playlist(properties.collapseGroupsByDefault);
		g_init_window = false;
	} else {
		if(cover.column && p.headerBar.columns[0].w != cover.previous_max_size) update_playlist(properties.collapseGroupsByDefault);
	}
	cover.previous_max_size = p.headerBar.columns[0].w;
};

//=================================================// OnPaint

function on_paint(gr) {
	if (!ww) return true;

	if (!g_1x1) {

		if (!cSettings.visible) {
			gr.FillSolidRect(0, p.list.y, ww, wh - p.list.y, g_color_normal_bg);

			// List
			if (p.list) {
				if (p.list.count > 0) {
					// calculate columns metrics before drawing row contents!
					p.headerBar.calculateColumns();

					// draw rows of the playlist
					p.list && p.list.draw(gr);

					// scrollbar
					if (properties.showscrollbar && p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
						p.scrollbar.visible = true;
						p.scrollbar.draw(gr);
					};
					else {
						p.scrollbar.visible = false;
					};

					// draw flashing beam if scroll max reached on mouse wheel! (android like effect)
					if (p.list.beam > 0) {
						var r = getRed(g_color_highlight);
						var g = getGreen(g_color_highlight);
						var b = getBlue(g_color_highlight);
						var a = Math.floor((p.list.beam_alpha <= 250 ? p.list.beam_alpha : 250) / 12);
						var beam_h = Math.floor(cTrack.height * 7 / 4);
						var alpha = (p.list.beam_alpha <= 255 ? p.list.beam_alpha : 255);
						switch (p.list.beam) {
						case 1:
							// top beam
							gr.DrawImage(images.beam, p.list.x, p.list.y - cHeaderBar.borderWidth * 10, p.list.w, beam_h - cHeaderBar.borderWidth, 0, 0, images.beam.Width, images.beam.Height, 180, alpha);
							break;
						case 2:
							// bot beam
							gr.DrawImage(images.beam, p.list.x, p.list.y + p.list.h - beam_h + cHeaderBar.borderWidth * 10, p.list.w, beam_h, 0, 0, images.beam.Width, images.beam.Height, 0, alpha);
							break;
						};
					};

				};
				else {

					if (fb.PlaylistCount > 0) {
						var text_top = p.list.name;
						var text_bot = "This playlist is empty.";
					};
					else {
						var text_top = "Create a playlist to start!";
						var text_bot = "No playlist";
					};
					// if Search Playlist, draw image "No Result"
					if (text_top.substr(0, 8) == "Search [") {
						gr.SetTextRenderingHint(4);
						var search_text = text_top.substr(4, text_top.length - 5);
						gr.DrawString("No Result for \"" + search_text + "\"", g_font_blank, g_color_normal_txt & 0x40ffffff, 0, 0 - zoom(20, zdpi), ww, wh, cc_stringformat);
						gr.DrawString(text_bot, g_font_group2, g_color_normal_txt & 0x40ffffff, 0, 0 + zoom(20, zdpi), ww, wh, cc_stringformat);
						gr.FillGradRect(40, Math.floor(wh / 2), ww - 80, 1, 0, 0, g_color_normal_txt & 0x40ffffff, 0.5);
					};
					else {
						// if empty playlist, display text info
						gr.SetTextRenderingHint(4);
						gr.DrawString(text_top, g_font_blank, g_color_normal_txt & 0x40ffffff, 0, 0 - zoom(20, zdpi), ww, wh, cc_stringformat);
						gr.DrawString(text_bot, g_font_group2, g_color_normal_txt & 0x40ffffff, 0, 0 + zoom(20, zdpi), ww, wh, cc_stringformat);
						gr.FillGradRect(40, Math.floor(wh / 2), ww - 80, 1, 0, 0, g_color_normal_txt & 0x40ffffff, 0.5);
					};
				};
			};

			// draw background part above playlist (topbar + headerbar)
			if (p.headerBar.visible) {
				gr.FillSolidRect(0, 0, ww, p.list.y, g_color_normal_bg);
				gr.FillSolidRect(0, p.list.y, ww, 1, RGBA(0, 0, 0, 50));
			};
			// HeaderBar
			if (p.headerBar.visible) {
				p.headerBar && p.headerBar.drawColumns(gr);
				if (p.headerBar.borderDragged && p.headerBar.borderDraggedId >= 0) {
					// all borders
					var fin = p.headerBar.borders.length;
					for (var b = 0; b < fin; b++) {
						var lg_x = p.headerBar.borders[b].x - 2;
						var lg_w = p.headerBar.borders[b].w;
						var segment_h = g_z5;
						var gap_h = g_z5;
						if (b == p.headerBar.borderDraggedId) {
							var d = ((mouse_x / g_z10) - Math.floor(mouse_x / g_z10)) * g_z10; // give a value between [0;9]
						};
						else {
							d = 5;
						};
						var ty = 0;
						for (var lg_y = p.list.y; lg_y < p.list.y + p.list.h + segment_h; lg_y += segment_h + gap_h) {
							ty = lg_y - segment_h + d;
							th = segment_h;
							if (ty < p.list.y) {
								th = th - Math.abs(p.list.y - ty);
								ty = p.list.y;
							}
							if (b == p.headerBar.borderDraggedId) {
								gr.FillSolidRect(lg_x, ty, lg_w, th, g_color_normal_txt & 0x32ffffff);
							};
							else {
								gr.FillSolidRect(lg_x, ty, lg_w, th, g_color_normal_txt & 0x16ffffff);
							};
						};
					};
				};
			};
			else {
				p.headerBar && p.headerBar.drawHiddenPanel(gr);
			};

			// Incremental Search Display
			if (cList.search_string.length > 0) {
				var string_w = gr.CalcTextWidth(cList.search_string, cList.incsearch_font);
				gr.SetSmoothingMode(2);
				p.list.tt_w = Math.round(string_w + 24 * zdpi);
				p.list.tt_h = cTrack.height * 1.5;
				p.list.tt_x = Math.floor((p.list.w - p.list.tt_w) / 2);
				p.list.tt_y = p.list.y + Math.floor((p.list.h - p.list.tt_h) / 2);;
				gr.FillRoundRect(p.list.tt_x, p.list.tt_y, p.list.tt_w, p.list.tt_h, 5, 5, RGBA(0, 0, 0, 150));
				gr.DrawRoundRect(p.list.tt_x-1, p.list.tt_y-1, p.list.tt_w+2, p.list.tt_h+2, 5, 5, 1.0, RGBA(0, 0, 0, 180));
				try {
					gr.GdiDrawText(cList.search_string, cList.incsearch_font, RGB(0, 0, 0), p.list.tt_x + 1, p.list.tt_y + 1, p.list.tt_w, p.list.tt_h, ccf_txt);
					gr.GdiDrawText(cList.search_string, cList.incsearch_font, cList.inc_search_noresult ? RGB(255, 70, 70) : RGB(250, 250, 250), p.list.tt_x, p.list.tt_y, p.list.tt_w, p.list.tt_h, ccf_txt);
				};
				catch (e) {};
			};

		};
		else {
			// Settings...
			p.settings && p.settings.draw(gr);
		};
	};
	toolbar.draw(gr);

	// tweaks to fix bug in timer/memory/repaint handle in WSH Panel Mod v1.5.6
	g_collect_counter++;
	if (g_collect_counter > 50) {
		g_collect_counter = 0;
		CollectGarbage();
	};

	gr.DrawLine(0, 0, 0, wh, 1, RGBA(0, 0, 0, 80));//100));
	//gr.DrawLine(1, 0, 1, wh, 1, RGBA(0, 0, 0, 60));
	//gr.DrawLine(2, 0, 2, wh, 1, RGBA(0, 0, 0, 30));
	//gr.DrawLine(3, 0, 3, wh, 1, RGBA(0, 0, 0, 15));
	
	gr.DrawLine(0, 0, ww, 0, 1, RGBA(0, 0, 0, 100));
	gr.DrawLine(0, wh - 1, ww, wh - 1, 1, RGBA(0, 0, 0, 100));
	
	if(show_shadow){
		gr.DrawLine(0, 1, ww, 1, 1, RGBA(0, 0, 0, 60));
		gr.DrawLine(0, 2, ww, 2, 1, RGBA(0, 0, 0, 30));
		gr.DrawLine(0, 3, ww, 3, 1, RGBA(0, 0, 0, 15));

		gr.DrawLine(0, wh - 2, ww, wh - 2, 1, RGBA(0, 0, 0, 60));
		gr.DrawLine(0, wh - 3, ww, wh - 3, 1, RGBA(0, 0, 0, 30));
		gr.DrawLine(0, wh - 4, ww, wh - 4, 1, RGBA(0, 0, 0, 15));
	}
};

// Mouse Callbacks

function on_mouse_lbtn_down(x, y) {

	if (properties.enableTouchControl) {
		cTouch.up_id = -1;
		if (cSettings.visible) {
			cTouch.down = true;
			cTouch.y_start = y;
		};
		else {
			if (p.list.isHoverObject(x, y) && !p.scrollbar.isHoverObject(x, y)) {
				cTouch.down = true;
				cTouch.y_start = y;
			};
		};
	};

	g_left_click_hold = true;

	// check settings
	if (cSettings.visible) {
		p.settings.on_mouse("down", x, y);
	};
	else {
		toolbar.checkState("down", x, y);
		cover.previous_max_size = p.headerBar.columns[0].w;

		// check list
		p.list.check("down", x, y);
		if (properties.showscrollbar && p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
			p.scrollbar.check("down", x, y);
		};

		// check scrollbar scroll on click above or below the cursor
		if (p.scrollbar.hover && !p.scrollbar.cursorDrag) {
			var scrollstep = p.list.totalRowVisible;
			if (y < p.scrollbar.cursorPos) {
				if (!p.list.buttonclicked && !cScrollBar.timerID1) {
					p.list.buttonclicked = true;
					p.list.scrollItems(1, scrollstep);
					cScrollBar.timerID1 = window.SetTimeout(function() {
						p.list.scrollItems(1, scrollstep);
						cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
						cScrollBar.timerID1 = false;
						cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
						cScrollBar.timerID2 = window.SetInterval(function() {
							if (p.scrollbar.hover) {
								if (mouse_x > p.scrollbar.x && p.scrollbar.cursorPos > mouse_y) {
									p.list.scrollItems(1, scrollstep);
								};
							};
						}, 60);
					}, 400);
				};
			};
			else {
				if (!p.list.buttonclicked && !cScrollBar.timerID1) {
					p.list.buttonclicked = true;
					p.list.scrollItems(-1, scrollstep);
					cScrollBar.timerID1 = window.SetTimeout(function() {
						p.list.scrollItems(-1, scrollstep);
						cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
						cScrollBar.timerID1 = false;
						cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
						cScrollBar.timerID2 = window.SetInterval(function() {
							if (p.scrollbar.hover) {
								if (mouse_x > p.scrollbar.x && p.scrollbar.cursorPos + p.scrollbar.cursorHeight < mouse_y) {
									p.list.scrollItems(-1, scrollstep);
								};
							};
						}, 60);
					}, 400)
				};
			};
		};
		// check headerbar
		if (p.headerBar.visible) p.headerBar.on_mouse("down", x, y);
	};
};

function on_mouse_lbtn_dblclk(x, y, mask) {

	g_left_click_hold = true;

	// check settings
	if (cSettings.visible) {
		p.settings.on_mouse("dblclk", x, y);
	};
	else {
		// check list
		p.list.check("dblclk", x, y);
		// check headerbar
		if (p.headerBar.visible) p.headerBar.on_mouse("dblclk", x, y);

		// check scrollbar
		if (properties.showscrollbar && p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
			p.scrollbar.check("dblclk", x, y);
			if (p.scrollbar.hover) {
				on_mouse_lbtn_down(x, y); // ...to have a scroll response on double clicking scrollbar area above or below the cursor!
			};
		};
	};
};

function on_mouse_lbtn_up(x, y) {

	// check settings
	if (cSettings.visible) {
		p.settings.on_mouse("up", x, y);
	};
	else {
		toolbar.checkState("up", x, y);
		// scrollbar scrolls up and down RESET
		p.list.buttonclicked = false;
		cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
		cScrollBar.timerID1 = false;
		cScrollBar.timerID2 && window.ClearTimeout(cScrollBar.timerID2);
		cScrollBar.timerID2 = false;

		// after a cover column resize, update cover image cache
		if (cover.resized == true) {
			cover.resized = false;
			// reset cache
			if (!g_first_launch) {
				cover.max_w = (cGroup.default_collapsed_height > cGroup.default_expanded_height ? cGroup.default_collapsed_height * cTrack.height : cGroup.default_expanded_height * cTrack.height);
				g_image_cache = new image_cache;
				CollectGarbage();
			};
			else {
				g_first_launch = false;
			};
			update_playlist(properties.collapseGroupsByDefault);
		};

		// check list
		p.list.check("up", x, y);

		if (dragndrop.drag_out) {

			if (x < 0 && y > 0 && y < wh) {

				window.NotifyOthers("WSH_playlist_drag_drop", p.list.metadblist_selection);
				dragndrop.drag_out = false;
			};
		};

		// check scrollbar
		if (properties.showscrollbar && p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
			p.scrollbar.check("up", x, y);
		};

		// Drop items after a drag'n drop INSIDE the playlist
		if (!properties.enableTouchControl) {
			if (p.list.ishover && dragndrop.drag_in) {
				if (dragndrop.drag_id >= 0 && dragndrop.drop_id >= 0) {
					var save_focus_handle = plman.GetPlaylistFocusItemHandle(p.list.playlist);
					var drop_handle = p.list.handleList.Item(dragndrop.drop_id);
					var nb_selected_items = p.list.metadblist_selection.Count;

					if (dragndrop.contigus_sel && nb_selected_items > 0) {
						if (dragndrop.drop_id > dragndrop.drag_id) {
							// on pointe sur le dernier item de la selection si on move vers le bas
							var new_drag_pos = p.list.handleList.Find(p.list.metadblist_selection.item(nb_selected_items - 1));
							var move_delta = dragndrop.drop_id - new_drag_pos;
						};
						else {
							// on pointe sur le 1er item de la selection si on move vers le haut
							var new_drag_pos = p.list.handleList.Find(p.list.metadblist_selection.item(0));
							var move_delta = dragndrop.drop_id - new_drag_pos;
						};

						plman.MovePlaylistSelection(p.list.playlist, move_delta);

					};
					else {

						// 1st: move selected item at the full end of the playlist to make then contigus
						g_avoid_on_item_focus_change = true;
						g_avoid_on_playlist_items_reordered = true;
						plman.MovePlaylistSelection(p.list.playlist, plman.PlaylistItemCount(p.list.playlist));
						// 2nd: move bottom selection to new drop_id place (to redefine first...)
						plman.SetPlaylistFocusItemByHandle(p.list.playlist, drop_handle);
						var drop_id_new = plman.GetPlaylistFocusItemIndex(p.list.playlist);
						plman.SetPlaylistFocusItemByHandle(p.list.playlist, save_focus_handle);
						if (dragndrop.drag_id > drop_id_new) {
							var mdelta = p.list.count - nb_selected_items - drop_id_new;
						};
						else {
							var mdelta = p.list.count - nb_selected_items - drop_id_new - 1;
						};
						plman.MovePlaylistSelection(p.list.playlist, mdelta * -1);
						g_avoid_on_playlist_items_reordered = false;
						g_avoid_on_item_focus_change = false;
					};
				};
			};
		};

		dragndrop.drag_id = -1;
		dragndrop.drop_id = -1;
		dragndrop.drag_in = false;
		dragndrop.drag_out = false;
		dragndrop.moved = false;
		dragndrop.clicked = false;
		dragndrop.moved = false;
		dragndrop.x = 0;
		dragndrop.y = 0;
		dragndrop.timerID && window.ClearTimeout(dragndrop.timerID);
		dragndrop.timerID = false;
		//window.SetCursor(IDC_ARROW);

		// check headerbar
		if (p.headerBar.visible) p.headerBar.on_mouse("up", x, y);

		// repaint on mouse up to refresh covers just loaded
		full_repaint();
	};

	if (cTouch.down) {
		cTouch.down = false;
		cTouch.y_start = y;
		cTouch.down_id = cTouch.up_id;
	};

	g_left_click_hold = false;
};

function on_mouse_rbtn_down(x, y) {
	/*if (!g_left_click_hold) {
		// check settings
		if (cSettings.visible) {
			p.settings.on_mouse("right", x, y);
		};
		else {
			// check list
			p.list.check("right", x, y);
			// check headerbar
			if (p.headerBar.visible) p.headerBar.on_mouse("right", x, y);
		};
	};*/
};

function on_mouse_rbtn_up(x, y) {
	if (!g_left_click_hold) {
		// check settings
		if (cSettings.visible) {
			p.settings.on_mouse("right", x, y);
		};
		else {
			// check list
			p.list.check("right", x, y);
			// check headerbar
			if (p.headerBar.visible) p.headerBar.on_mouse("right", x, y);
		};
	};
	//if (!utils.IsKeyPressed(VK_SHIFT)) {
	return true;
	//};
};

function on_mouse_move(x, y) {

	if (x == mouse_x && y == mouse_y) return true;

	if (x >= 0 && x < ww && y >= 0 && y < wh) g_leave = false;

	// check settings
	if (cSettings.visible) {

		if (cTouch.down) {
			cTouch.y_end = y;
			var y_delta = (cTouch.y_end - cTouch.y_start);
			if (x < p.list.w) {
				if (y_delta > p.settings.h / cSettings.rowHeight) {
					on_mouse_wheel(1); // scroll up
					cTouch.y_start = cTouch.y_end;
				};
				if (y_delta < -p.settings.h / cSettings.rowHeight) {
					on_mouse_wheel(-1); // scroll down
					cTouch.y_start = cTouch.y_end;
				};
			};
		};
		p.settings.on_mouse("move", x, y);

	};
	else {

		if (cTouch.down) {

			if (p.headerBar.columnDragged < 1 && !p.headerBar.borderDragged) {
				cTouch.y_end = y;
				var y_delta = (cTouch.y_end - cTouch.y_start);
				if (x < p.list.w) {
					if (y_delta > p.list.h / cTrack.height) {
						on_mouse_wheel(1); // scroll up
						cTouch.y_start = cTouch.y_end;
					};
					if (y_delta < -p.list.h / cTrack.height) {
						on_mouse_wheel(-1); // scroll down
						cTouch.y_start = cTouch.y_end;
					};
				};
			};

		};
		else {
			toolbar.checkState("move", x, y);
			// check list
			p.list.check("move", x, y);

			if (properties.showscrollbar && p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
				p.scrollbar.check("move", x, y);
			};

			// check headerbar
			if (p.headerBar.visible) p.headerBar.on_mouse("move", x, y);

			// if cover column resized (or init), refresh column cover, minimum count, ... and playlist
			if (cover.previous_max_size != p.headerBar.columns[0].w) {
				cover.resized = true;
				if (p.headerBar.columns[0].w > 0) {
					cover.column = true;
					cGroup.count_minimum = Math.ceil((p.headerBar.columns[0].w) / cTrack.height);
					if (cGroup.count_minimum < cGroup.default_count_minimum) cGroup.count_minimum = cGroup.default_count_minimum;
				};
				else {
					cover.column = false;
					cGroup.count_minimum = cGroup.default_count_minimum;
				};
				cover.previous_max_size = p.headerBar.columns[0].w;
			};

			// check headerbar for mouse icon dragging mode ***
			if (p.list.mclicked && !p.headerBar.borderDragged && !p.headerBar.columnDragged) {
				if (p.list.ishover) {
					if (dragndrop.enabled && (dragndrop.drag_in || dragndrop.moved)) {
						window.SetCursor(IDC_HELP);
					};
					else {
						window.SetCursor(IDC_ARROW);
					};
				};
				else {
					if (dragndrop.enabled && (dragndrop.drag_in || dragndrop.moved)) {
						if (x < 0 && y > 0 && y < wh) window.SetCursor(IDC_HELP);
						else window.SetCursor(IDC_NO);
					};
					else {
						window.SetCursor(IDC_ARROW);
					};
				};
			};

			// if Dragging Track on playlist, scroll playlist if required
			if (dragndrop.drag_in) {
				// Dragn Drop
				if (y < p.list.y) {
					if (!p.list.buttonclicked) {
						p.list.buttonclicked = true;
						//
						var scroll_speed_ms = 5;
						//
						if (!cScrollBar.timerID1) {
							cScrollBar.timerID1 = window.SetInterval(function() {
								on_mouse_wheel(1);
							}, scroll_speed_ms);
						};
					};
					else {
						full_repaint();
					};
				};
				else if (y > p.list.y + p.list.h) {
					if (!p.list.buttonclicked) {
						p.list.buttonclicked = true;
						//
						var scroll_speed_ms = 5;
						//
						if (!cScrollBar.timerID1) {
							cScrollBar.timerID1 = window.SetInterval(function() {
								on_mouse_wheel(-1);
							}, scroll_speed_ms);
						};
					};
					else {
						full_repaint();
					};
				};
				else {
					cScrollBar.timerID1 && window.ClearInterval(cScrollBar.timerID1);
					cScrollBar.timerID1 = false;
					p.list.buttonclicked = false;
					if (!dragndrop.timerID) {
						dragndrop.timerID = window.SetTimeout(function() {
							full_repaint();
							dragndrop.timerID && window.ClearTimeout(dragndrop.timerID);
							dragndrop.timerID = false;
						}, 75);
					};
				};
			};
		};
	};

	// save coords
	mouse_x = x;
	mouse_y = y;
};

function on_mouse_wheel(delta) {

	if (g_middle_clicked) return;
		// check settings
	if (cSettings.visible) {
		p.settings.on_mouse("wheel", mouse_x, mouse_y, delta);
		if (cSettings.wheel_timer) {
			window.ClearTimeout(cSettings.wheel_timer);
			cSettings.wheel_timer = false;
		};
		cSettings.wheel_timer = window.SetTimeout(function() {
			on_mouse_move(mouse_x + 1, mouse_y + 1);
			window.ClearTimeout(cSettings.wheel_timer);
			cSettings.wheel_timer = false;
		}, 50);
	};
	else {
		// handle p.list Beam
		var limit_reached = false;
		var maxOffset = (p.list.totalRows > p.list.totalRowVisible ? p.list.totalRows - p.list.totalRowVisible : 0);
		if (maxOffset > 0) {
			if (delta > 0) { // scroll up requested
				if (p.list.offset == 0) {
					// top beam to draw
					p.list.beam = 1;
					cList.beam_sens = 1;
					limit_reached = true;
				};
			};
			else { // scroll down requested
				if (p.list.offset >= maxOffset) {
					// bottom beam to draw
					p.list.beam = 2;
					cList.beam_sens = 1;
					limit_reached = true;
				};
			};
			if (limit_reached) {
				if (!cList.beam_timer) {
					p.list.beam_alpha = 0;
					cList.beam_timer = window.SetInterval(function() {
						if (cList.beam_sens == 1) {
							p.list.beam_alpha = (p.list.beam_alpha <= 275 ? p.list.beam_alpha + 25 : 300);
							if (p.list.beam_alpha >= 300) {
								cList.beam_sens = 2;
							};
						};
						else {
							p.list.beam_alpha = (p.list.beam_alpha >= 25 ? p.list.beam_alpha - 25 : 0);
							if (p.list.beam_alpha <= 0) {
								p.list.beam = 0;
								window.ClearInterval(cList.beam_timer);
								cList.beam_timer = false;
							};
						};
						full_repaint();
					}, 32);
				};
			};
		};

		reset_cover_timers();

		if (p.list.ishover || cScrollBar.timerID1 || cList.repaint_timer) {
			// timer to tell to other functions (on cover load asynch done, ...) that a repaint is already running
			if (!g_mouse_wheel_timer) {
				// set scroll speed / mouse y offset from panel limits
				if (g_dragndrop_status) {
					if (g_dragndrop_y < p.list.y + cTrack.height) {
						var s = Math.abs(g_dragndrop_y - (p.list.y + cTrack.height));
						var h = Math.ceil(cTrack.height / 2);
						if (s > h) s = h;
						var t = h - s + 1;
						var r = Math.round(500 / h);
						var scroll_speed_ms = ((t * r) < 10 ? 10 : (t * r));
					};
					else if (g_dragndrop_y > p.list.y + p.list.h - cTrack.height) {
						var s = Math.abs(g_dragndrop_y - (p.list.y + p.list.h - cTrack.height));
						var h = Math.ceil(cTrack.height / 2);
						if (s > h) s = h;
						var t = h - s + 1;
						var r = Math.round(500 / h);
						var scroll_speed_ms = ((t * r) < 10 ? 10 : (t * r));
					};
					else {
						scroll_speed_ms = 20;
					};
				};
				else {
					if (mouse_y < p.list.y) {
						var s = Math.abs(mouse_y - p.list.y);
						var h = Math.ceil(cTrack.height / 2);
						if (s > h) s = h;
						var t = h - s + 1;
						var r = Math.round(500 / h);
						var scroll_speed_ms = ((t * r) < 10 ? 10 : (t * r));
					};
					else if (mouse_y > p.list.y + p.list.h) {
						var s = Math.abs(mouse_y - (p.list.y + p.list.h));
						var h = Math.ceil(cTrack.height / 2);
						if (s > h) s = h;
						var t = h - s + 1;
						var r = Math.round(500 / h);
						var scroll_speed_ms = ((t * r) < 10 ? 10 : (t * r));
					};
					else {
						scroll_speed_ms = 20;
					};
				};
					//
				g_mouse_wheel_timer = window.SetTimeout(function() {
					var cw = cover.column ? ((p.headerBar.columns[0].w <= cover.max_w) ? cover.max_w : p.headerBar.columns[0].w) : cover.max_w;
					var ch = cw;
					p.list.scrollItems(delta, properties.enableTouchControl ? cList.touchstep : cList.scrollstep);
					g_mouse_wheel_timer && window.ClearTimeout(g_mouse_wheel_timer);
					g_mouse_wheel_timer = false;
				}, scroll_speed_ms);
			};
		};
	};
};

function on_mouse_mbtn_down(x, y, mask) {
	g_middle_clicked = true;
};

function on_mouse_mbtn_dblclk(x, y, mask) {
	on_mouse_mbtn_down(x, y, mask);
};

function on_mouse_mbtn_up(x, y, mask) {
	if (g_middle_click_timer) {
		window.ClearTimeout(g_middle_click_timer);
		g_middle_click_timer = false;
	};
	g_middle_click_timer = window.SetTimeout(function() {
		g_middle_clicked = false;
		window.ClearTimeout(g_middle_click_timer);
		g_middle_click_timer = false;
	}, 250);
	if (cSettings.visible) return;
	var fin = p.list.items.length;
	for (var i = 0; i < fin; i++) {
		if (p.list.items[i].ishover) {
			plman.SetPlaylistFocusItem(p.list.playlist, p.list.items[i].track_index);
			plman.AddItemToPlaybackQueue(plman.GetPlaylistFocusItemHandle(p.list.playlist));
		}
	};
};

function on_mouse_leave() {
	g_leave = true;
	//p.list.check("leave", 0, 0);
	if (properties.showscrollbar && p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
		p.scrollbar.check("leave", 0, 0);
	};
	if(!cSettings.visible) toolbar.checkState("leave", 0, 0);
	//p.headerBar.on_mouse("leave", 0, 0);
};

// Callbacks

function update_playlist(iscollapsed) {
	if (g_selHolder) g_selHolder.Dispose();
	g_selHolder = fb.AcquireUiSelectionHolder();
	// activate playlist selection tracking
	g_selHolder.SetPlaylistSelectionTracking();

	g_group_id_focused = 0;
	p.list.updateHandleList(plman.ActivePlaylist, iscollapsed);

	p.list.setItems(false);
	p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
	// if sort by header click was requested, reset mouse cursor to default
	if (cHeaderBar.sortRequested) {
		window.SetCursor(IDC_ARROW);
		cHeaderBar.sortRequested = false;
	};
	toolbar.init_radiolist();
	if(toolbar.state) toolbar.repaint();
};

function on_playlist_switch() {
	update_playlist(properties.collapseGroupsByDefault);
	p.headerBar.resetSortIndicators();
	full_repaint();
};

function on_playlists_changed() {

	if (!g_avoid_on_playlists_changed) {

		if (plman.ActivePlaylist < 0 || plman.ActivePlaylist > plman.PlaylistCount - 1) {
			plman.ActivePlaylist = 0;
		};

		// close timers if dragging tracks is running
		if (dragndrop.drag_in || dragndrop.moved) {
			if (dragndrop.timerID) {
				window.ClearTimeout(dragndrop.timerID);
				dragndrop.timerID = false;
			};
			dragndrop.drag_in = false;
			dragndrop.moved = false;
			dragndrop.x = 0;
			dragndrop.y = 0;
			on_mouse_move(mouse_x + 1, mouse_y); // to reset window cursor style to a simple arrow
		};

		p.list.playlist = plman.ActivePlaylist;
		full_repaint();
	};
};

function on_playlist_items_added(playlist_idx) {
	if (!g_avoid_on_playlist_items_added) {
		if (playlist_idx == p.list.playlist) {
			update_playlist(properties.collapseGroupsByDefault);
			p.headerBar.resetSortIndicators();
			full_repaint();
		};
	};
};

function on_playlist_items_removed(playlist_idx, new_count) {
	if (!g_avoid_on_playlist_items_removed) {
		if (playlist_idx == p.list.playlist) {
			update_playlist(properties.collapseGroupsByDefault);
			p.headerBar.resetSortIndicators();
			full_repaint();
		};
	};
};

function on_playlist_items_reordered(playlist_idx) {
	if (!g_avoid_on_playlist_items_reordered) {
		if (playlist_idx == p.list.playlist && p.headerBar.columnDragged == 0) {
			update_playlist(properties.collapseGroupsByDefault);
			p.headerBar.resetSortIndicators();
			full_repaint();
		};
		else {
			p.headerBar.columnDragged = 0;
		};
	};
};

function on_playlist_items_selection_change() {
	full_repaint();
};

//function on_selection_changed(metadb) {
//	if (metadb) {
//		g_path = tf_path.EvalWithMetadb(metadb);
//		g_track_type = TrackType(g_path);
//	};
//};

function on_item_focus_change(playlist, from, to) {
	if (!g_avoid_on_item_focus_change) {
		g_metadb = (fb.IsPlaying || fb.IsPaused) ? fb.GetNowPlaying() : fb.PlaylistItemCount(fb.ActivePlaylist) > 0 ? fb.GetFocusItem() : false;
		if (g_metadb) {
			on_metadb_changed();
		};
		//else {
		//	g_path = "";
		//	g_track_type = "";
		//};
		if (playlist == p.list.playlist) {
			p.list.focusedTrackId = to;
			plman.SetActivePlaylistContext();
			var center_focus_item = p.list.isFocusedItemVisible();

			if (properties.autocollapse) { // && !center_focus_item
				var grpId = p.list.getGroupIdfromTrackId(to);
				if (grpId >= 0) {
					if (p.list.groups[grpId].collapsed) {
						p.list.updateGroupStatus(grpId);
						p.list.setItems(true);
						center_focus_item = p.list.isFocusedItemVisible();
					};
					else {
						if ((!center_focus_item && !p.list.drawRectSel) || (center_focus_item && to == 0)) {
							p.list.setItems(true);
						};
					};
				};
			};
			else {
				if ((!center_focus_item && !p.list.drawRectSel) || (center_focus_item && to == 0)) {
					p.list.setItems(true);
				};
			};
			p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
		};
	};
};

function on_metadb_changed(metadb_or_metadbs, fromhook) {
	//if (g_metadb) {
	//	g_path = tf_path.EvalWithMetadb(g_metadb);
	//	g_track_type = TrackType(g_path);
	//};
	// rebuild list to draw
	p.list.setItems(false);
	full_repaint();
};


//=================================================// Keyboard Callbacks

function on_key_up(vkey) {
	if (cSettings.visible) {
		var fin = p.settings.pages[p.settings.currentPageId].elements.length;
		for (var j = 0; j < fin; j++) {
			p.settings.pages[p.settings.currentPageId].elements[j].on_key("up", vkey);
		};
	};
	else {

		// after a cover column resize, update cover image and empty rows to show the whole cover if low tracks count in group
		if (cover.resized == true) {
			cover.resized = false;
			update_playlist(properties.collapseGroupsByDefault);
		};

		// scroll keys up and down RESET (step and timers)
		p.list.keypressed = false;
		cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
		cScrollBar.timerID1 = false;
		cScrollBar.timerID2 && window.ClearTimeout(cScrollBar.timerID2);
		cScrollBar.timerID2 = false;
		if (vkey == VK_SHIFT) {
			p.list.SHIFT_start_id = null;
			p.list.SHIFT_count = 0;
		};
	};
};

function on_key_down(vkey) {

	var mask = GetKeyboardMask();

	if (cSettings.visible) {
		g_textbox_tabbed = false;
		if (mask == KMask.ctrl) {
			if (vkey == 80) { // CTRL+P
				fb.RunMainMenuCommand("File/Preferences");
			};
		};
		var fin = p.settings.pages[p.settings.currentPageId].elements.length;
		for (var j = 0; j < fin; j++) {
			p.settings.pages[p.settings.currentPageId].elements[j].on_key("down", vkey);
		};
	};
	else {
		if (dragndrop.drag_in) return true;

		var act_pls = plman.ActivePlaylist;

		if (mask == KMask.none) {
			switch (vkey) {
			case VK_F2:
				p.list.showNowPlaying();
				p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
				break;
			case VK_F5:
				refresh_cover();
				break;
			case VK_TAB:
				if (!cSettings.visible && p.list.totalRows > 0 && !properties.autocollapse && cGroup.expanded_height > 0 && cGroup.collapsed_height > 0) {
					resize_panels();
					p.list.updateHandleList(plman.ActivePlaylist, true);
					p.list.setItems(true);
					p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
					full_repaint();
				}
				break;
			case VK_BACK:
				if (cList.search_string.length > 0) {
					cList.inc_search_noresult = false;
					p.list.tt_x = ((p.list.w) / 2) - (((cList.search_string.length * zoom(13, zdpi)) + (g_z10 * 2)) / 2);
					p.list.tt_y = p.list.y + Math.floor((p.list.h / 2) - g_z30);
					p.list.tt_w = ((cList.search_string.length * zoom(13, zdpi)) + (g_z10 * 2));
					p.list.tt_h = zoom(60, zdpi);
					cList.search_string = cList.search_string.substring(0, cList.search_string.length - 1);
					full_repaint();
					cList.clear_incsearch_timer && window.ClearTimeout(cList.clear_incsearch_timer);
					cList.clear_incsearch_timer = false;
					cList.incsearch_timer && window.ClearTimeout(cList.incsearch_timer);
					cList.incsearch_timer = window.SetTimeout(function() {
						p.list.incrementalSearch();
						window.ClearTimeout(cList.incsearch_timer);
						cList.incsearch_timer = false;
						cList.inc_search_noresult = false;
					}, 500);
				};
				break;
			case VK_ESCAPE:
			case 222:
				//
				p.list.tt_x = ((p.list.w) / 2) - (((cList.search_string.length * zoom(13, zdpi)) + (g_z10 * 2)) / 2);
				p.list.tt_y = p.list.y + Math.floor((p.list.h / 2) - g_z30);
				p.list.tt_w = ((cList.search_string.length * zoom(13, zdpi)) + (g_z10 * 2));
				p.list.tt_h = zoom(60, zdpi);
				cList.search_string = "";
				window.RepaintRect(0, p.list.tt_y - 2, p.list.w, p.list.tt_h + 4);
				break;
			case VK_UP:
				var scrollstep = 1;
				var new_focus_id = 0;
				if (p.list.count > 0 && !p.list.keypressed && !cScrollBar.timerID1) {
					p.list.keypressed = true;
					reset_cover_timers();

					if (p.list.focusedTrackId < 0) {
						var old_grpId = 0;
					};
					else {
						var old_grpId = p.list.getGroupIdfromTrackId(p.list.focusedTrackId);
					};
					new_focus_id = (p.list.focusedTrackId > 0) ? p.list.focusedTrackId - scrollstep : 0;
					var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
					if (!properties.autocollapse) {
						if (p.list.groups[old_grpId].collapsed) {
							if (old_grpId > 0 && old_grpId == grpId) {
								new_focus_id = (p.list.groups[grpId].start > 0) ? p.list.groups[grpId].start - scrollstep : 0;
								var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
							};
						};
					};

					//new_focus_id = (p.list.focusedTrackId > 0) ? p.list.focusedTrackId - scrollstep : 0;
					// if new track focused id is in a collapsed group, set the 1st track of the group as the focused track (= group focused)
					//var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
					if (p.list.groups[grpId].collapsed) {
						if (properties.autocollapse) {
							new_focus_id = p.list.groups[grpId].start + p.list.groups[grpId].count - 1;
						};
						else {
							new_focus_id = p.list.groups[grpId].start;
						};
					};
					if (p.list.focusedTrackId == 0 && p.list.offset > 0) {
						p.list.scrollItems(1, scrollstep);
						cScrollBar.timerID1 = window.SetTimeout(function() {
							p.list.scrollItems(1, scrollstep);
							cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
							cScrollBar.timerID1 = false;
							cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
							cScrollBar.timerID2 = window.SetInterval(function() {
								p.list.scrollItems(1, scrollstep);
							}, 50);
						}, 400);
					};
					else {
						plman.SetPlaylistFocusItem(act_pls, new_focus_id);
						plman.ClearPlaylistSelection(act_pls);
						plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
						cScrollBar.timerID1 = window.SetTimeout(function() {
							cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
							cScrollBar.timerID1 = false;
							cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
							cScrollBar.timerID2 = window.SetInterval(function() {
								new_focus_id = (p.list.focusedTrackId > 0) ? p.list.focusedTrackId - scrollstep : 0;
								// if new track focused id is in a collapsed group, set the 1st track of the group as the focused track (= group focused)
								var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
								if (p.list.groups[grpId].collapsed) {
									if (properties.autocollapse) {
										new_focus_id = p.list.groups[grpId].start + p.list.groups[grpId].count - 1;
									};
									else {
										new_focus_id = p.list.groups[grpId].start;
									};
								};
								plman.SetPlaylistFocusItem(act_pls, new_focus_id);
								plman.ClearPlaylistSelection(act_pls);
								plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
							}, 50);
						}, 400);
					};
				};
				break;
			case VK_DOWN:
				var new_focus_id = 0;
				if (p.list.count > 0 && !p.list.keypressed && !cScrollBar.timerID1) {
					p.list.keypressed = true;
					reset_cover_timers();

					if (p.list.focusedTrackId < 0) {
						var old_grpId = 0;
					};
					else {
						var old_grpId = p.list.getGroupIdfromTrackId(p.list.focusedTrackId);
					};
					new_focus_id = (p.list.focusedTrackId < p.list.count - 1) ? p.list.focusedTrackId + 1 : p.list.count - 1;
					var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
					if (!properties.autocollapse) {
						if (p.list.groups[old_grpId].collapsed) {
							if (old_grpId < (p.list.groups.length - 1) && old_grpId == grpId) {
								new_focus_id = ((p.list.groups[grpId].start + p.list.groups[grpId].count - 1) < (p.list.count - 1)) ? (p.list.groups[grpId].start + p.list.groups[grpId].count - 1) + 1 : p.list.count - 1;
								var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
							};
						};
					};

					//new_focus_id = (p.list.focusedTrackId < p.list.count - 1) ? p.list.focusedTrackId + 1 : p.list.count - 1;
					// if new track focused id is in a collapsed group, set the last track of the group as the focused track (= group focused)
					//var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
					if (p.list.groups[grpId].collapsed) {
						if (properties.autocollapse) {
							new_focus_id = p.list.groups[grpId].start;
						};
						else {
							new_focus_id = p.list.groups[grpId].start + p.list.groups[grpId].count - 1;
						};
					};
					plman.SetPlaylistFocusItem(act_pls, new_focus_id);
					plman.ClearPlaylistSelection(act_pls);
					plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
					cScrollBar.timerID1 = window.SetTimeout(function() {
						cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
						cScrollBar.timerID1 = false;
						cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
						cScrollBar.timerID2 = window.SetInterval(function() {
							new_focus_id = (p.list.focusedTrackId < p.list.count - 1) ? p.list.focusedTrackId + 1 : p.list.count - 1;
							// if new track focused id is in a collapsed group, set the last track of the group as the focused track (= group focused)
							var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
							if (p.list.groups[grpId].collapsed) {
								if (properties.autocollapse) {
									new_focus_id = p.list.groups[grpId].start;
								};
								else {
									new_focus_id = p.list.groups[grpId].start + p.list.groups[grpId].count - 1;
								};
							};
							plman.SetPlaylistFocusItem(act_pls, new_focus_id);
							plman.ClearPlaylistSelection(act_pls);
							plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
						}, 50);
					}, 400);
				};
				break;
			case VK_PGUP:
				var scrollstep = p.list.totalRowVisible;
				var new_focus_id = 0;
				if (p.list.count > 0 && !p.list.keypressed && !cScrollBar.timerID1) {
					p.list.keypressed = true;
					reset_cover_timers();
					new_focus_id = (p.list.focusedTrackId > scrollstep) ? p.list.focusedTrackId - scrollstep : 0;
					if (p.list.focusedTrackId == 0 && p.list.offset > 0) {
						p.list.scrollItems(1, scrollstep);
						cScrollBar.timerID1 = window.SetTimeout(function() {
							p.list.scrollItems(1, scrollstep);
							cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
							cScrollBar.timerID1 = false;
							cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
							cScrollBar.timerID2 = window.SetInterval(function() {
								p.list.scrollItems(1, scrollstep);
							}, 60);
						}, 400);
					};
					else {
						plman.SetPlaylistFocusItem(act_pls, new_focus_id);
						plman.ClearPlaylistSelection(act_pls);
						plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
						cScrollBar.timerID1 = window.SetTimeout(function() {
							cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
							cScrollBar.timerID1 = false;
							cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
							cScrollBar.timerID2 = window.SetInterval(function() {
								new_focus_id = (p.list.focusedTrackId > scrollstep) ? p.list.focusedTrackId - scrollstep : 0;
								plman.SetPlaylistFocusItem(act_pls, new_focus_id);
								plman.ClearPlaylistSelection(act_pls);
								plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
							}, 60);
						}, 400);
					};
				};
				break;
			case VK_PGDN:
				var scrollstep = p.list.totalRowVisible;
				var new_focus_id = 0;
				if (p.list.count > 0 && !p.list.keypressed && !cScrollBar.timerID1) {
					p.list.keypressed = true;
					reset_cover_timers();
					new_focus_id = (p.list.focusedTrackId < p.list.count - scrollstep) ? p.list.focusedTrackId + scrollstep : p.list.count - 1;
					plman.SetPlaylistFocusItem(act_pls, new_focus_id);
					plman.ClearPlaylistSelection(act_pls);
					plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
					cScrollBar.timerID1 = window.SetTimeout(function() {
						cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
						cScrollBar.timerID1 = false;
						cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
						cScrollBar.timerID2 = window.SetInterval(function() {
							new_focus_id = (p.list.focusedTrackId < p.list.count - scrollstep) ? p.list.focusedTrackId + scrollstep : p.list.count - 1;
							plman.SetPlaylistFocusItem(act_pls, new_focus_id);
							plman.ClearPlaylistSelection(act_pls);
							plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
						}, 60);
					}, 400);
				};
				break;
			case VK_RETURN:
				// play/enqueue focused item
				if (!isQueuePlaylistActive()) {
					var cmd = properties.defaultPlaylistItemAction;
					if (cmd == "Play") {
						plman.ExecutePlaylistDefaultAction(act_pls, p.list.focusedTrackId);
					};
					else {
						fb.RunContextCommandWithMetadb(cmd, p.list.handleList.Item(p.list.focusedTrackId), 0);
					};
				};
				break;
			case VK_END:
				if (p.list.count > 0) {
					plman.SetPlaylistFocusItem(act_pls, p.list.count - 1);
					plman.ClearPlaylistSelection(act_pls);
					plman.SetPlaylistSelectionSingle(act_pls, p.list.count - 1, true);
				};
				break;
			case VK_HOME:
				if (p.list.count > 0) {
					plman.SetPlaylistFocusItem(act_pls, 0);
					plman.ClearPlaylistSelection(act_pls);
					plman.SetPlaylistSelectionSingle(act_pls, 0, true);
				};
				break;
			case VK_DELETE:
				if (!fb.IsAutoPlaylist(act_pls)) {
					if (isQueuePlaylistActive()) {
						var affected_items = Array();
						var first_focus_id = null;
						var next_focus_id = null;
						for (var k = 0; k < p.list.count; k++) {
							if (plman.IsPlaylistItemSelected(act_pls, k)) {
								affected_items.push(k);
								if (first_focus_id == null) fist_focus_id = k;
								next_focus_id = k + 1;
							};
						};
						if (next_focus_id >= p.list.count) {
							next_focus_id = first_focus_id;
						};
						if (next_focus_id != null) {
							plman.SetPlaylistFocusItem(act_pls, next_focus_id);
							plman.SetPlaylistSelectionSingle(act_pls, next_focus_id, true);
						};
						plman.RemoveItemsFromPlaybackQueue(affected_items);
					};
					else {
						plman.RemovePlaylistSelection(act_pls, false);
					};
					plman.RemovePlaylistSelection(act_pls, false);
					plman.SetPlaylistSelectionSingle(act_pls, plman.GetPlaylistFocusItemIndex(act_pls), true);
				};
				break;
			};
		};
		else {
			switch (mask) {
			case KMask.shift:
				switch (vkey) {
				case VK_SHIFT:
					// SHIFT key alone
					p.list.SHIFT_count = 0;
					break;
				case VK_UP:
					// SHIFT + KEY UP
					if (p.list.SHIFT_count == 0) {
						if (p.list.SHIFT_start_id == null) {
							p.list.SHIFT_start_id = p.list.focusedTrackId;
						};
						plman.ClearPlaylistSelection(act_pls);
						plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, true);
						if (p.list.focusedTrackId > 0) {
							p.list.SHIFT_count--;
							p.list.focusedTrackId--;
							plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, true);
							plman.SetPlaylistFocusItem(act_pls, p.list.focusedTrackId);
						};
					};
					else if (p.list.SHIFT_count < 0) {
						if (p.list.focusedTrackId > 0) {
							p.list.SHIFT_count--;
							p.list.focusedTrackId--;
							plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, true);
							plman.SetPlaylistFocusItem(act_pls, p.list.focusedTrackId);
						};
					};
					else {
						plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, false);
						p.list.SHIFT_count--;
						p.list.focusedTrackId--;
						plman.SetPlaylistFocusItem(act_pls, p.list.focusedTrackId);
					};
					break;
				case VK_DOWN:
					// SHIFT + KEY DOWN
					if (p.list.SHIFT_count == 0) {
						if (p.list.SHIFT_start_id == null) {
							p.list.SHIFT_start_id = p.list.focusedTrackId;
						};
						plman.ClearPlaylistSelection(act_pls);
						plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, true);
						if (p.list.focusedTrackId < p.list.count - 1) {
							p.list.SHIFT_count++;
							p.list.focusedTrackId++;
							plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, true);
							plman.SetPlaylistFocusItem(act_pls, p.list.focusedTrackId);
						};
					};
					else if (p.list.SHIFT_count > 0) {
						if (p.list.focusedTrackId < p.list.count - 1) {
							p.list.SHIFT_count++;
							p.list.focusedTrackId++;
							plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, true);
							plman.SetPlaylistFocusItem(act_pls, p.list.focusedTrackId);
						};
					};
					else {
						plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, false);
						p.list.SHIFT_count++;
						p.list.focusedTrackId++;
						plman.SetPlaylistFocusItem(act_pls, p.list.focusedTrackId);
					};
					break;
				};
				break;
			case KMask.ctrl:
				if (vkey == 0x09) {
					if (!cSettings.visible && p.list.totalRows > 0 && !properties.autocollapse && cGroup.expanded_height > 0 && cGroup.collapsed_height > 0) {
						resize_panels();
						p.list.updateHandleList(plman.ActivePlaylist, false);
						p.list.setItems(true);
						p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
						full_repaint();
					}
				}
				if (vkey == 65) { // CTRL+A
					fb.RunMainMenuCommand("Edit/Select all");
					p.list.metadblist_selection = plman.GetPlaylistSelectedItems(p.list.playlist);
					full_repaint();
				};
				if (vkey == 88) { // CTRL+X
					if (!fb.IsAutoPlaylist(act_pls)) {
						clipboard.selection = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);

						if (isQueuePlaylistActive()) {
							var affected_items = Array();
							var first_focus_id = null;
							var next_focus_id = null;
							for (var k = 0; k < p.list.count; k++) {
								if (plman.IsPlaylistItemSelected(act_pls, k)) {
									affected_items.push(k);
									if (first_focus_id == null) fist_focus_id = k;
									next_focus_id = k + 1;
								};
							};
							if (next_focus_id >= p.list.count) {
								next_focus_id = first_focus_id;
							};
							if (next_focus_id != null) {
								plman.SetPlaylistFocusItem(act_pls, next_focus_id);
								plman.SetPlaylistSelectionSingle(act_pls, next_focus_id, true);
							};
							plman.RemoveItemsFromPlaybackQueue(affected_items);
						};
						else {
							plman.RemovePlaylistSelection(act_pls, false);
						};

						plman.RemovePlaylistSelection(act_pls, false);
						plman.SetPlaylistSelectionSingle(act_pls, plman.GetPlaylistFocusItemIndex(act_pls), true);
					};
				};
				if (vkey == 67) { // CTRL+C
					clipboard.selection = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);
				};
				if (vkey == 86) { // CTRL+V
					// insert the clipboard selection (handles) after the current position in the active playlist
					if (clipboard.selection) {
						if (clipboard.selection.Count > 0) {
							try {
								if (p.list.count > 0) {
									plman.InsertPlaylistItems(plman.ActivePlaylist, p.list.focusedTrackId + 1, clipboard.selection);
								};
								else {
									plman.InsertPlaylistItems(plman.ActivePlaylist, 0, clipboard.selection);
								};
							};
							catch (e) {
								fb.trace("WSH Playlist WARNING: Clipboard can't be pasted, invalid clipboard content.");
							};
						};
					};
				};
				if (vkey == 70) { // CTRL+F
					fb.RunMainMenuCommand("Edit/Search");
				};
				if (vkey == 78) { // CTRL+N
					fb.RunMainMenuCommand("File/New playlist");
				};
				if (vkey == 79) { // CTRL+O
					fb.RunMainMenuCommand("File/Open...");
				};
				if (vkey == 80) { // CTRL+P
					fb.RunMainMenuCommand("File/Preferences");
				};
				if (vkey == 83) { // CTRL+S
					fb.RunMainMenuCommand("File/Save playlist...");
				};
				if (vkey == 84) { // CTRL+T
					// Toggle headerbar
					if (!p.timer_onKey) {
						cHeaderBar.locked = !cHeaderBar.locked;
						window.SetProperty("SYSTEM.HeaderBar.Locked", cHeaderBar.locked);
						if (!cHeaderBar.locked) {
							p.headerBar.visible = false;
						};
						resize_panels();
						full_repaint();
						p.timer_onKey = window.SetTimeout(function() {
							p.timer_onKey && window.ClearTimeout(p.timer_onKey);
							p.timer_onKey = false;
						}, 300);
					};
				};
				break;
			case KMask.alt:
				switch (vkey) {
				case 65:
					// ALT+A
					fb.RunMainMenuCommand("View/Always on Top");
					break;
				case VK_ALT:
					// ALT key alone
					break;
				};
				break;
			};
		};
		// };
	};
};

function on_char(code) {
	if (cSettings.visible) {
		var fin = p.settings.pages.length;
		var fin2;
		for (var i = 0; i < fin; i++) {
			fin2 = p.settings.pages[i].elements.length;
			for (var j = 0; j < fin2; j++) {
				p.settings.pages[i].elements[j].on_char(code);
			};
		};
	};
	else {
		if (p.list.count > 0) {
			p.list.tt_x = ((p.list.w) / 2) - (((cList.search_string.length * zoom(13, zdpi)) + (g_z10 * 2)) / 2);
			p.list.tt_y = p.list.y + Math.floor((p.list.h / 2) - g_z30);
			p.list.tt_w = ((cList.search_string.length * zoom(13, zdpi)) + (g_z10 * 2));
			p.list.tt_h = zoom(60, zdpi);
			if (code == 32 && cList.search_string.length == 0) return true; // SPACE Char not allowed on 1st char
			if (cList.search_string.length <= 20 && p.list.tt_w <= p.list.w - 20) {
				if (code > 31) {
					cList.search_string = cList.search_string + String.fromCharCode(code);//.toUpperCase();
					full_repaint();
					cList.clear_incsearch_timer && window.ClearTimeout(cList.clear_incsearch_timer);
					cList.clear_incsearch_timer = false;
					cList.incsearch_timer && window.ClearTimeout(cList.incsearch_timer);
					cList.incsearch_timer = window.SetTimeout(function() {
						p.list.incrementalSearch();
						window.ClearTimeout(cList.incsearch_timer);
						cList.incsearch_timer = false;
					}, 500);
				};
			};
		};
		//};
	};
};

// Playback Callbacks

function on_playback_starting(cmd, is_paused) {
	// called only on user action (cmd)
};

function on_playback_new_track(metadb) {
	// update g_metadb and g_track_type because of on_playback_time uses
	//g_metadb = metadb;
	//if (g_metadb) {
	//	g_path = tf_path.EvalWithMetadb(g_metadb);
	//	g_track_type = TrackType(g_path);
	//};
	full_repaint();
};

function on_playback_stop(reason) { // reason: (integer, begin with 0): user, eof, starting_another
	switch (reason) {
	// user stop
	case 0:
		full_repaint();
		break;
	case 1:
		// eof (e.g. end of playlist)
		if(repeat_pls && fb.PlaybackOrder == 0){
			if(plman.ActivePlaylist + 1 > plman.PlaylistCount - 1) plman.ActivePlaylist = 0;
			else plman.ActivePlaylist += 1;
			plman.ExecutePlaylistDefaultAction(plman.ActivePlaylist, 0);
		}
		full_repaint();
		break;
	case 2:
		// starting_another (only called on user action, i.e. click on next button)
		break;
	};

};

function on_playback_pause(state) {
	if (p.list.nowplaying_y + cTrack.height > p.list.y && p.list.nowplaying_y < p.list.y + p.list.h) {
		window.RepaintRect(p.list.x, p.list.nowplaying_y, p.list.w, cTrack.height);
	};
};

function on_playback_seek(time) {

};

function on_playback_time(time) {
	g_seconds = time;
	if (!cSettings.visible) {
		if (p.list.nowplaying_y + cTrack.height > p.list.y && p.list.nowplaying_y < p.list.y + p.list.h) {
			window.RepaintRect(p.list.x, p.list.nowplaying_y, p.list.w, cTrack.height);
		};
	};
};

function on_playback_order_changed(new_order_index) {

};

function on_focus(is_focused) {

	g_focus = is_focused;
	if (!is_focused) {
		full_repaint();
	};
	else {

	};
};

function on_notify_data(name, info) {
	switch (name) {
	case "set_font":	
		fbx_set[13] = info[0];
		fbx_set[14] = info[1];
		fbx_set[15] = info[2];
		window.Reload();
		//get_font();
		//full_repaint();
		break;
	case "set_ui_mode":
		ui_mode = info;
		get_colors();
		get_images_ui();
		get_images_color();
		p.headerBar.setButtons();
		if (p.list) {
			if (p.list.totalRows > p.list.totalRowVisible) {
				p.scrollbar.setButtons();
				p.scrollbar.setCursorButton();
			};
			p.list.setItemColors();
			toolbar.init_tbbtn();
		};
		if (cSettings.visible) {
			p.settings.refreshColors();
		};
		full_repaint();
		break;
	case "set_random_color":
		fbx_set[0] = info[0];
		fbx_set[1] = info[1];
		fbx_set[2] = info[2];
		fbx_set[3] = info[3];
		fbx_set[4] = info[4];
		fbx_set[5] = info[5];
		fbx_set[6] = info[6];
		fbx_set[7] = info[7];
		fbx_set[12] = info[7];
		get_colors();
		get_images_color();
		p.headerBar.setButtons();
		if (p.list) {
			if (p.list.totalRows > p.list.totalRowVisible) {
				p.scrollbar.setButtons();
				p.scrollbar.setCursorButton();
			};
			p.list.setItemColors();
		};
		if (cSettings.visible) {
			p.settings.refreshColors();
		};
		full_repaint();
		break;
	case "show_Now_Playing":
		p.list.showNowPlaying();
		p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
		break;
	case "set_rating_2_tag":
		rating2tag = info;
		break;
	case "set_album_cover":
		album_front_disc = info;
		if(cGroup.pattern_idx == 0 || cGroup.pattern_idx == 1){
			g_image_cache = new image_cache;
			CollectGarbage();
			full_repaint();
		}
		break;
	case "refresh cover":
		on_artDown_notify(info[0], info[1]);
		break;
	case "refresh covers PL":
		if(info) {
			refresh_cover();
		}
		break;
	case "jsplaylistview_show_playlist":
		if(info){
			if(cSettings.visible){
				p.settings.colorWidgetFocusedId = -1;
				p.settings.colorSliderFocusedId = -1;
				cSettings.visible = false;
				properties.collapseGroupsByDefault = (p.list.groupby[cGroup.pattern_idx].collapseGroupsByDefault == 0 ? false : true);
				update_playlist(properties.collapseGroupsByDefault);
				full_repaint();
			}
		} else {
			show_setting(3);
		}
		break;
	};
};

function show_setting(pageid, column_index){
	if(random_mode == 0) p.settings.refreshColors();
	if(!setting_init) {
		p.settings.initpages();
		p.settings.setButtons();
		setting_init = true;
	}
	if(!p.settings.page_loaded[pageid]){
		p.settings.pages[pageid].init();
		p.settings.page_loaded[pageid] = true;
	}
	cSettings.visible = true;
	p.settings.currentPageId = pageid;
	p.settings.setSize(0, 0, ww, wh);
	if(pageid == 1 && column_index) p.settings.pages[pageid].elements[0].showSelected(column_index);
	else if(pageid == 2 && column_index) p.settings.pages[pageid].elements[0].showSelected(column_index);
	full_repaint();
}

function get_font() {
	g_fname = fbx_set[13];
	g_fsize = fbx_set[14];
	g_fstyle = fbx_set[15];

	g_font = GdiFont(g_fname, g_fsize, g_fstyle);
	g_font_b = GdiFont(g_fname, g_fsize, 1);
	g_font_2 = GdiFont(g_fname, g_fsize - 1, g_fstyle);
	g_font_queue_idx = GdiFont("tahoma", zoom(11, zdpi), 1);
	g_font_wd3_scrollBar = GdiFont("wingdings 3", g_z10, 0);
	g_font_blank = GdiFont(g_fname, g_fsize + 4, 1);
	// group font
	g_font_group1 = GdiFont(g_fname, g_fsize + 4, 0);
	g_font_group1_bold = GdiFont(g_fname, g_fsize + 3, 1);
	g_font_group2 = GdiFont(g_fname, g_fsize + 2, 0);

};

function get_colors() {
	switch (ui_mode) {
	case (1):
		g_color_normal_bg = RGB(255,255,255);
		g_color_line = RGBA(0, 0, 0, 35);
		g_color_line_div = RGBA(0, 0, 0, 80);
		g_color_selected_txt = RGB(25, 25, 25);
		g_color_normal_txt = RGB(36, 36, 36);
		g_scroll_color = fbx_set[0];
		g_color_selected_bg = fbx_set[7];
		g_group_header_bg = RGBA(0, 0, 0, 6);
		g_color_dl_bg = blendColors(g_scroll_color, RGB(15, 15, 15), 0.5);//RGBA(15, 15, 15, 220);
		g_color_dl_txt = RGB(245, 245, 245);
		g_color_dl_txt_perc = RGB(132, 255, 99);
		g_color_dl_txt_ext = RGB(200, 125, 250);
		g_color_topbar = g_color_normal_txt & 0x15ffffff;
		g_color_dl_txt_art = RGB(150,150,150);
		break;
	case (2):
		g_color_normal_bg = fbx_set[3];
		g_color_line = RGBA(0, 0, 0, 35);
		g_color_line_div = RGBA(0, 0, 0, 80);
		g_color_selected_txt = RGB(25, 25, 25);
		g_color_normal_txt = RGB(36, 36, 36);
		g_scroll_color = fbx_set[0];
		g_color_selected_bg = fbx_set[7];
		g_group_header_bg = RGBA(255, 255, 255, 110);
		g_color_dl_bg = blendColors(g_scroll_color, RGB(15, 15, 15), 0.5);// RGBA(15, 15, 15, 220);
		g_color_dl_txt = RGB(245, 245, 245);
		g_color_dl_txt_perc = RGB(132, 255, 99);
		g_color_dl_txt_ext = RGB(200, 125, 250);
		g_color_topbar = g_color_normal_txt & 0x15ffffff;
		g_color_dl_txt_art = RGB(150,150,150);
		break;
	case (3):
		g_color_normal_bg = fbx_set[0];
		g_color_line = RGBA(0, 0, 0, 35);
		g_color_line_div = RGBA(0, 0, 0, 75);
		g_color_selected_txt = RGB(255, 255, 255);
		g_color_normal_txt = RGB(235, 235, 235);
		g_scroll_color = fbx_set[5];
		g_color_selected_bg = fbx_set[7];
		g_group_header_bg = g_color_normal_txt & 0x09ffffff;
		g_color_dl_bg = blendColors(g_scroll_color, RGB(250, 240, 195), 0.7);//RGBA(250, 240, 195, 220);
		g_color_dl_txt = RGB(25, 25, 25);
		g_color_dl_txt_perc = RGB(200, 20, 100);
		g_color_dl_txt_ext = RGB(10, 100, 20);
		g_color_topbar = g_color_normal_txt & 0x12ffffff;
		g_color_dl_txt_art = RGB(100,100,100);
		break;
	case (4):
		g_color_normal_bg = fbx_set[2];
		g_color_line = RGBA(0, 0, 0, 55);
		g_color_line_div = RGBA(0, 0, 0, 110);
		g_color_selected_txt = RGB(255, 255, 255);
		g_color_normal_txt = RGB(235, 235, 235);
		g_scroll_color = fbx_set[5];
		g_color_selected_bg = (random_mode == 1 || g_color_normal_bg == RGB(10, 10, 10)) ? RGBA(255, 255, 255, 30) : fbx_set[7];
		g_group_header_bg = g_color_normal_txt & 0x09ffffff;
		g_color_dl_bg = blendColors(g_scroll_color, RGB(250, 240, 195), 0.7);//RGBA(250, 240, 195, 220);
		g_color_dl_txt = RGB(25, 25, 25);
		g_color_dl_txt_perc = RGB(200, 20, 100);
		g_color_dl_txt_ext = RGB(10, 100, 20);
		g_color_topbar = g_color_normal_txt & 0x12ffffff;
		g_color_dl_txt_art = RGB(100,100,100);
		break;
	}
	g_color_playing_txt = RGB(255, 255, 255);
	g_color_highlight = fbx_set[6];
};

function get_images_color() {
	var color_ico_bg = blendColors(g_color_normal_bg, RGB(0, 0, 0), 0.1);
	var color_ico = blendColors(g_color_normal_bg, g_color_normal_txt, 0.25);
	images.nocover = gdi.CreateImage(150, 150);
	gb = images.nocover.GetGraphics();
	gb.FillSolidRect(0, 0, 150, 150, color_ico_bg);
	gb.SetSmoothingMode(2);
	gb.FillEllipse(20, 20, 110, 110, color_ico);
	gb.FillEllipse(55, 55, 40, 40, color_ico_bg);
	gb.SetSmoothingMode(0);
	images.nocover.ReleaseGraphics(gb);

	images.noartist = gdi.CreateImage(150, 150);
	gb = images.noartist.GetGraphics();
	gb.FillSolidRect(0, 0, 150, 150, color_ico_bg);
	gb.SetSmoothingMode(2);
	gb.FillEllipse(20, 20, 110, 110, color_ico);
	gb.FillEllipse(55, 35, 40, 40, color_ico_bg);
	gb.FillEllipse(45, 80, 80, 120, color_ico_bg);
	gb.SetSmoothingMode(0);
	images.noartist.ReleaseGraphics(gb);
	
	imgh = Math.floor(15*zdpi);
	images.star = gdi.CreateImage(imgh, imgh);
	gb = images.star.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillPolygon(RGBA(150, 150, 150, 90), 0, star_arr);
	gb.SetSmoothingMode(0);
	images.star.ReleaseGraphics(gb);

	images.star_h = gdi.CreateImage(imgh, imgh);
	gb = images.star_h.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillPolygon(g_color_highlight, 0, star_arr);
	gb.SetSmoothingMode(0);
	images.star_h.ReleaseGraphics(gb);

	images.star_h_playing = gdi.CreateImage(imgh, imgh);
	gb = images.star_h_playing.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillPolygon(g_color_playing_txt, 0, star_arr);
	gb.SetSmoothingMode(0);
	images.star_h_playing.ReleaseGraphics(gb);
	
	var imgw = Math.floor(16*zdpi);
	imgh = Math.floor(18*zdpi);
	var _x2 = 2*zdpi, _x15 = 15*zdpi, _x12 = 12*zdpi;
	var points_arr = Array(_x2,_x2,_x2,_x15,7*zdpi,11*zdpi,_x12,_x15,_x12,_x2);
	var points_arr_2 = Array(_x2,_x2+imgh,_x2,_x15+imgh,7*zdpi,11*zdpi+imgh,_x12,_x15+imgh,_x12,_x2+imgh);
	var points_arr_3 = Array(_x2,_x2+imgh*2,_x2,_x15+imgh*2,7*zdpi,11*zdpi+imgh*2,_x12,_x15+imgh*2,_x12,_x2+imgh*2);
	var points_arr_4 = Array(_x2,_x2+imgh*3,_x2,_x15+imgh*3,7*zdpi,11*zdpi+imgh*3,_x12,_x15+imgh*3,_x12,_x2+imgh*3);
	images.mood_ico = gdi.CreateImage(imgw, imgh*4);
	gb = images.mood_ico.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawPolygon(g_color_highlight, 2, points_arr);
	gb.DrawPolygon(RGBA(0,0,0,40), 2, points_arr_2);
	gb.DrawPolygon(RGBA(255,255,255,40), 2, points_arr_3);
	gb.DrawPolygon(RGBA(255,255,255,255), 2, points_arr_4);
	gb.SetSmoothingMode(0);
	images.mood_ico.ReleaseGraphics(gb);
	
	images.beam = draw_beam_image();
}

function get_images_ui() {
	var gb;
	var x5=5*zdpi, x7=7*zdpi,  x13=13*zdpi, x15=15*zdpi, x23=23*zdpi;
	images.sortdirection = gdi.CreateImage(x7, x5);
	gb = images.sortdirection.GetGraphics();
	gb.SetSmoothingMode(2);
	var points_arr = new Array(4*zdpi,4*zdpi,zdpi,zdpi,x7,zdpi);
	gb.FillPolygon(g_color_normal_txt, 0, points_arr);
	gb.SetSmoothingMode(0);
	
	images.sortdirection.ReleaseGraphics(gb);
	
	var imgh = Math.floor(14*zdpi);
	images.selected_ico = gdi.CreateImage(imgh, imgh);
	gb = images.selected_ico.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawLine(2*zdpi, 8*zdpi, x7, 12*zdpi, 1, g_color_normal_txt);
	gb.DrawLine(x7, 12*zdpi, x13, 3*zdpi, 1, g_color_normal_txt);
	gb.SetSmoothingMode(0);
	images.selected_ico.ReleaseGraphics(gb);
	
	var points_arr = Array(zdpi,x5,4*zdpi,zdpi,x7,x5);
	images.show_toolbar = gdi.CreateImage(10*zdpi, x7);
	gb = images.show_toolbar.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillPolygon(g_color_normal_txt, 0, points_arr);
	gb.SetSmoothingMode(0);
	images.show_toolbar.ReleaseGraphics(gb);

	//var imgw = 50*zdpi;
	imgh = 25*zdpi;
	
	images.toolbtn_n = gdi.CreateImage(imgh, imgh);
	gb = images.toolbtn_n.GetGraphics();
	images.toolbtn_n.ReleaseGraphics(gb);
	
	images.toolbtn_h = gdi.CreateImage(imgh, imgh);
	gb = images.toolbtn_h.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillRoundRect(zdpi,zdpi,x23,x23,3,3,g_color_dl_txt&0x40ffffff);
	gb.SetSmoothingMode(0);
	images.toolbtn_h.ReleaseGraphics(gb);
	
	images.toolbtn_d = gdi.CreateImage(imgh, imgh);
	gb = images.toolbtn_d.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillRoundRect(zdpi,zdpi,x23,x23,3,3,g_color_dl_txt&0x25ffffff);
	gb.SetSmoothingMode(0);
	images.toolbtn_d.ReleaseGraphics(gb);
	
	images.tool_album = gdi.CreateImage(imgh, imgh);
	gb = images.tool_album.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(x5,x5,x15,x15,1,g_color_dl_txt);
	gb.DrawEllipse(10*zdpi,10*zdpi,x5,x5,1,g_color_dl_txt);
	gb.SetSmoothingMode(0);
	images.tool_album.ReleaseGraphics(gb);
	
	images.tool_artist = gdi.CreateImage(imgh, 20*zdpi);
	gb = images.tool_artist.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(8*zdpi,6*zdpi,8*zdpi,8*zdpi,1,g_color_dl_txt);
	gb.DrawEllipse(x5,14*zdpi,x15,imgh,1,g_color_dl_txt);
	gb.SetSmoothingMode(0);
	images.tool_artist.ReleaseGraphics(gb);
	
	images.close = gdi.CreateImage(imgh, imgh);
	gb = images.close.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(x5,x5,x15,x15,1,g_color_dl_txt);
	gb.DrawLine(16*zdpi, 9*zdpi, 9*zdpi, 16*zdpi, 1, g_color_dl_txt);
	gb.DrawLine(9*zdpi, 9*zdpi, 16*zdpi, 16*zdpi, 1, g_color_dl_txt);
	gb.SetSmoothingMode(0);
	images.close.ReleaseGraphics(gb);
	
	images.dl_folder = gdi.CreateImage(imgh, imgh);
	gb = images.dl_folder.GetGraphics();
	gb.DrawRect(x5,6*zdpi,x15,14*zdpi,1,g_color_dl_txt);
	gb.DrawLine(x13, 9*zdpi, x13, 16*zdpi, 1, g_color_dl_txt);
	gb.SetSmoothingMode(2);
	gb.DrawLine(x13, 16*zdpi, 9*zdpi, x13, 1, g_color_dl_txt);
	gb.DrawLine(x13, 16*zdpi, 17*zdpi, x13, 1, g_color_dl_txt);
	gb.SetSmoothingMode(0);
	images.dl_folder.ReleaseGraphics(gb);
	
	images.dl_cancel = gdi.CreateImage(imgh, imgh);
	gb = images.dl_cancel.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(x5,x5,x15,x15,1,g_color_dl_txt);
	gb.DrawLine(18*zdpi, 8*zdpi, 7*zdpi, 17*zdpi, 1, g_color_dl_txt);
	gb.SetSmoothingMode(0);
	images.dl_cancel.ReleaseGraphics(gb);
	
	if (ui_mode < 3) images.loading = gdi.Image(images.path + "load_dark.png");
	else images.loading = gdi.Image(images.path + "load_light.png");
};

function get_images_static() {
	var gb;
	images.glass_reflect = draw_glass_reflect(150, 150);
	var imgh = Math.floor(14*zdpi);
	images.playing_ico = gdi.CreateImage(Math.floor(16*zdpi), imgh*2);
	gb = images.playing_ico.GetGraphics();
	gb.SetSmoothingMode(2);
	var ponit_arr = new Array(3*zdpi,2*zdpi,3*zdpi,12*zdpi,13*zdpi,7*zdpi);
	gb.FillPolygon(RGBA(255, 255, 255,100), 0, ponit_arr);
	ponit_arr = new Array(3*zdpi,2*zdpi+imgh,3*zdpi,12*zdpi+imgh,13*zdpi,7*zdpi+imgh);
	gb.FillPolygon(RGBA(255, 255, 255,255), 0, ponit_arr);
	gb.SetSmoothingMode(0);
	images.playing_ico.ReleaseGraphics(gb);

	ico_color = RGBA(150, 150, 150, 100);
	stream_1 = gdi.CreateImage(50, 150);
	gb = stream_1.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(30, 35, 60, 60, 6, ico_color);
	gb.SetSmoothingMode(0);
	stream_1.ReleaseGraphics(gb);

	stream_2 = gdi.CreateImage(50, 150);
	gb = stream_2.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(-40, 35, 60, 60, 6, ico_color);
	gb.SetSmoothingMode(0);
	stream_2.ReleaseGraphics(gb);

	images.stream = gdi.CreateImage(150, 150);
	gb = images.stream.GetGraphics();
	gb.FillSolidRect(0, 0, 150, 150, RGBA(0, 0, 0, 20));
	gb.DrawImage(stream_1, 0, 0, 50, 150, 0, 0, 50, 150, 0, 255);
	gb.DrawImage(stream_2, 100, 0, 50, 150, 0, 0, 50, 150, 0, 255);
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(60, 50, 30, 30, 6, ico_color);
	gb.SetSmoothingMode(0);
	gb.FillSolidRect(71, 85, 6, 40, ico_color);
	images.stream.ReleaseGraphics(gb);
}

function draw_beam_image() {
	var sbeam = gdi.CreateImage(500, 128);
	// Get graphics interface like "gr" in on_paint
	var gb = sbeam.GetGraphics();
	gb.FillEllipse(-250, 50, 1000, 640, g_color_highlight & 0x60ffffff);
	sbeam.ReleaseGraphics(gb);

	var beamA = sbeam.Resize(500 / 50, 128 / 50, 2);
	var beamB = beamA.Resize(500, 128, 2);
	return beamB;
};

function draw_blurred_image(image, ix, iy, iw, ih, bx, by, bw, bh, blur_value, overlay_color) {
	var blurValue = blur_value;
	var imgA = image.Resize(iw * blurValue / 100, ih * blurValue / 100, 2);
	var imgB = imgA.resize(iw, ih, 2);

	var bbox = gdi.CreateImage(bw, bh);
	// Get graphics interface like "gr" in on_paint
	var gb = bbox.GetGraphics();
	var offset = 90 - blurValue;
	gb.DrawImage(imgB, 0 - offset, 0 - (ih - bh) - offset, iw + offset * 2, ih + offset * 2, 0, 0, imgB.Width, imgB.Height, 0, 255);
	bbox.ReleaseGraphics(gb);

	var newImg = gdi.CreateImage(iw, ih);
	var gb = newImg.GetGraphics();

	if (ix != bx || iy != by || iw != bw || ih != bh) {
		gb.DrawImage(image, ix, iy, iw, ih, 0, 0, image.Width, image.Height, 0, 255);
		gb.FillSolidRect(bx, by, bw, bh, 0xffffffff);
	};
	gb.DrawImage(bbox, bx, by, bw, bh, 0, 0, bbox.Width, bbox.Height, 0, 255);

	// overlay
	if (overlay_color != null) {
		gb.FillSolidRect(bx, by, bw, bh, overlay_color);
	};

	// top border of blur area
	if (ix != bx || iy != by || iw != bw || ih != bh) {
		gb.FillSolidRect(bx, by, bw, 1, 0x22ffffff);
		gb.FillSolidRect(bx, by - 1, bw, 1, 0x22000000);
	};
	newImg.ReleaseGraphics(gb);

	return newImg;
};

function showhide_groupheader(){
	if (properties.showgroupheaders) {
		properties.showgroupheaders = false;
	} else {
		properties.showgroupheaders = true;
	};
	window.SetProperty("*GROUP: Show Group Headers", properties.showgroupheaders);
	toolbar.showgh_org = properties.showgroupheaders;

	if (cGroup.collapsed_height > 0) {
		cGroup.collapsed_height = 0;
		cGroup.expanded_height = 0;
		// disable autocollapse when there is no group!
		properties.autocollapse = false;
		window.SetProperty("SYSTEM.Auto-Collapse", properties.autocollapse);
	} else {
		cGroup.collapsed_height = cGroup.default_collapsed_height;
		cGroup.expanded_height = cGroup.default_expanded_height;
	};

	// refresh playlist
	p.list.updateHandleList(plman.ActivePlaylist, false);
	p.list.setItems(true);
	p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
}

function nethide_groupheader(isnet){
	if(!properties.showgroupheaders && !toolbar.showgh_org) return;
	var tmp = properties.showgroupheaders;
	if(isnet){
		properties.showgroupheaders = false;
	}else{
		properties.showgroupheaders = toolbar.showgh_org;
	}
	if(properties.showgroupheaders != tmp){
		if (cGroup.collapsed_height > 0) {
			cGroup.collapsed_height = 0;
			cGroup.expanded_height = 0;
			// disable autocollapse when there is no group!
			properties.autocollapse = false;
			window.SetProperty("SYSTEM.Auto-Collapse", properties.autocollapse);
		} else {
			cGroup.collapsed_height = cGroup.default_collapsed_height;
			cGroup.expanded_height = cGroup.default_expanded_height;
		};

		// refresh playlist
		p.list.updateHandleList(plman.ActivePlaylist, false);
		p.list.setItems(true);
		p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
	}
}

//=================================================// Queue Playlist features

function isQueuePlaylistActive() {
	var queue_pl_idx = isQueuePlaylistPresent();
	if (queue_pl_idx < 0) {
		return false;
	};
	else if (plman.ActivePlaylist == queue_pl_idx) {
		return true;
	};
	else {
		return false;
	};
};

function isQueuePlaylistPresent() {
	for (var i = 0; i < plman.PlaylistCount; i++) {
		if (plman.GetPlaylistName(i) == "Queue Content") return i;
	};
	return -1;
};

function isTrackQueued(handle) {
	var queue_total = plman.GetPlaybackQueueCount();
	if (queue_total > 0) {
		var vbarr = plman.GetPlaybackQueueContents();
		var arr = vbarr.toArray();
		for (var j = 0; j < queue_total; j++) {
			if (handle.Compare(arr[j].Handle)) {
				return j + 1;
			}
		};
		return -1;
	};
	else {
		return -1;
	};
};

function SetPlaylistQueue() {
	var total_pl = plman.PlaylistCount;
	var queue_pl_idx = isQueuePlaylistPresent();
	if (queue_pl_idx < 0) {
		return true;
	};
	else {
		var total_in_pls = plman.PlaylistItemCount(queue_pl_idx);
		if (total_in_pls > 0) {
			var affected_items = Array();
			for (var i = 0; i < total_in_pls; i++) {
				affected_items.push(i);
			};
			plman.SetPlaylistSelection(queue_pl_idx, affected_items, true);
			plman.RemovePlaylistSelection(queue_pl_idx);
		};
	};
	var queue_total = plman.GetPlaybackQueueCount();
	var vbarr = plman.GetPlaybackQueueContents();
	var arr = vbarr.toArray();
	var q_handlelist = plman.GetPlaylistSelectedItems(-1);
	for (var j = 0; j < queue_total; j++) {
		q_handlelist.Add(arr[j].Handle);
	};
	plman.InsertPlaylistItems(queue_pl_idx, j, q_handlelist, false);
};

function ShowPlaylistQueue(focus_id) {
	var total_pl = plman.PlaylistCount;
	var queue_pl_idx = isQueuePlaylistPresent();
	if (queue_pl_idx < 0) {
		plman.CreatePlaylist(total_pl, "Queue Content");
		queue_pl_idx = total_pl;
		plman.ActivePlaylist = queue_pl_idx;
	};
	else {
		plman.ActivePlaylist = queue_pl_idx;
		fb.ClearPlaylist();
	};
	var queue_total = plman.GetPlaybackQueueCount();
	var vbarr = plman.GetPlaybackQueueContents();
	var arr = vbarr.toArray();
	var q_handlelist = plman.GetPlaylistSelectedItems(-1);
	for (var i = 0; i < queue_total; i++) {
		q_handlelist.Add(arr[i].Handle);
	};
	plman.InsertPlaylistItems(queue_pl_idx, i, q_handlelist, false);
	plman.SetPlaylistFocusItem(queue_pl_idx, 0);
};

function ClearQueuePlaylist() {
	var current_pl = plman.ActivePlaylist;
	var total_pl = plman.PlaylistCount;
	var queue_pl_idx = isQueuePlaylistPresent();
	if (queue_pl_idx >= 0) {
		plman.ActivePlaylist = queue_pl_idx;
		plman.RemovePlaylist(queue_pl_idx);
		//fb.ClearPlaylist();
		plman.ActivePlaylist = current_pl < plman.PlaylistCount ? current_pl : current_pl - 1;
	};
};

function CheckPlaylistQueue() {
	var current = plman.ActivePlaylist;
	var total_pl = plman.PlaylistCount;
	var queue_pl_idx = isQueuePlaylistPresent();
	if (queue_pl_idx < 0) {
		plman.CreatePlaylist(total_pl, "Queue Content");
		queue_pl_idx = total_pl;
	};
	else {
		plman.RemovePlaylist(queue_pl_idx);
		plman.CreatePlaylist(queue_pl_idx, "Queue Content");
	};
	var queue_total = plman.GetPlaybackQueueCount();
	var vbarr = plman.GetPlaybackQueueContents();
	var arr = vbarr.toArray();
	var q_handlelist = plman.GetPlaylistSelectedItems(-1);
	for (var i = 0; i < queue_total; i++) {
		q_handlelist.Add(arr[i].Handle);
	};
	plman.InsertPlaylistItems(queue_pl_idx, i, q_handlelist, false);
	plman.SetPlaylistFocusItem(queue_pl_idx, 0);
};

function on_playback_queue_changed(origin) {
	g_queue_origin = origin;

	if (!cList.addToQueue_timer) {

		g_avoid_on_playlists_changed = true;
		g_avoid_on_playlist_items_added = true;
		g_avoid_on_playlist_items_removed = true;

		switch (g_queue_origin) {
		case 0:
			// changed_user_added
			// Prepare/Clear Queue playlist
			var current = plman.ActivePlaylist;
			var total_pl = plman.PlaylistCount;
			var queue_pl_idx = isQueuePlaylistPresent();
			if (queue_pl_idx < 0) {
				plman.CreatePlaylist(total_pl, "Queue Content");
				queue_pl_idx = total_pl;
			};
			else {
				if (current == queue_pl_idx) {
					fb.ClearPlaylist();
				};
				else {
					plman.RemovePlaylist(queue_pl_idx);
					plman.CreatePlaylist(queue_pl_idx, "Queue Content");
				};
			};
			// fill it
			var queue_total = plman.GetPlaybackQueueCount();
			var vbarr = plman.GetPlaybackQueueContents();
			var arr = vbarr.toArray();
			var q_handlelist = plman.GetPlaylistSelectedItems(-1);
			for (var i = 0; i < queue_total; i++) {
				q_handlelist.Add(arr[i].Handle);
			};
			plman.InsertPlaylistItems(queue_pl_idx, 0, q_handlelist, false);
			break;
		case 1:
			// changed_user_removed
			// clear Queue playlist
			var current = plman.ActivePlaylist;
			var total_pl = plman.PlaylistCount;
			var queue_pl_idx = isQueuePlaylistPresent();
			if (queue_pl_idx < 0) {
				return false;
			};
			else {
				if (current == queue_pl_idx) {
					fb.ClearPlaylist();
				};
				else {
					plman.RemovePlaylist(queue_pl_idx);
					plman.CreatePlaylist(queue_pl_idx, "Queue Content");
				};
			};
			// fill it
			var queue_total = plman.GetPlaybackQueueCount();
			if (queue_total > 0) {
				var vbarr = plman.GetPlaybackQueueContents();
				var arr = vbarr.toArray();
				var q_handlelist = plman.GetPlaylistSelectedItems(-1);
				for (var i = 0; i < queue_total; i++) {
					q_handlelist.Add(arr[i].Handle);
				};
				plman.InsertPlaylistItems(queue_pl_idx, 0, q_handlelist, false);
			};
			else { // remove queue playlist!
				plman.RemovePlaylist(queue_pl_idx);
			};
			break;
		case 2:
			// changed_playback_advance
			// clear Queue playlist
			var current = plman.ActivePlaylist;
			var total_pl = plman.PlaylistCount;
			var queue_pl_idx = isQueuePlaylistPresent();
			if (queue_pl_idx < 0) {
				return false;
			};
			else {
				var queue_total = plman.GetPlaybackQueueCount();
				if (queue_total > 0) {
					if (current == queue_pl_idx) {
						fb.ClearPlaylist();
					};
					else {
						plman.RemovePlaylist(queue_pl_idx);
						plman.CreatePlaylist(queue_pl_idx, "Queue Content");
					};
					// fill it
					var queue_total = plman.GetPlaybackQueueCount();
					var vbarr = plman.GetPlaybackQueueContents();
					var arr = vbarr.toArray();
					var q_handlelist = plman.GetPlaylistSelectedItems(-1);
					for (var i = 0; i < queue_total; i++) {
						q_handlelist.Add(arr[i].Handle);
					};
					plman.InsertPlaylistItems(queue_pl_idx, 0, q_handlelist, false);
				};
				else { // remove queue playlist!
					plman.RemovePlaylist(queue_pl_idx);
				};
			};
			break;
		};

		if (isQueuePlaylistActive()) {
			ShowPlaylistQueue(0);
			full_repaint();
		};
		else {
			SetPlaylistQueue();
			//CheckPlaylistQueue();
		};

		g_avoid_on_playlists_changed = false;
		g_avoid_on_playlist_items_added = false;
		g_avoid_on_playlist_items_removed = false;

		cList.addToQueue_timer = window.SetTimeout(function() {
			window.ClearTimeout(cList.addToQueue_timer);
			cList.addToQueue_timer = false;
		}, 250);

	};

};

//=================================================// Drag'n'Drop Callbacks

function on_drag_enter() {
	g_dragndrop_status = true;
	g_dragndrop_drop_forbidden = false;
};

function on_drag_leave() {
	g_dragndrop_status = false;
	g_dragndrop_trackId = -1;
	g_dragndrop_rowId = -1;
	g_dragndrop_targetPlaylistId = -1;
	p.list.buttonclicked = false;
	cScrollBar.timerID1 && window.ClearInterval(cScrollBar.timerID1);
	cScrollBar.timerID1 = false;
	if (g_dragndrop_drop_forbidden) {
		g_dragndrop_drop_forbidden = false;
		full_repaint();
	};
};

function on_drag_over(action, x, y, mask) {

	if (x == g_dragndrop_x && y == g_dragndrop_y) return true;

	if (fb.IsAutoPlaylist(plman.ActivePlaylist)) {
		g_dragndrop_drop_forbidden = true;
		full_repaint();
		return true;
	};

	g_dragndrop_trackId = -1;
	g_dragndrop_rowId = -1;
	g_dragndrop_targetPlaylistId = -1;
	g_dragndrop_bottom = false;
	p.list.check("drag_over", x, y);
	if (p.list.offset > 0 && y < p.list.y + cTrack.height) {
		if (!p.list.buttonclicked) {
			p.list.buttonclicked = true;
			//
			var scroll_speed_ms = 5;
			//
			if (!cScrollBar.timerID1) {
				cScrollBar.timerID1 = window.SetInterval(function() {
					on_mouse_wheel(1);
					if (p.list.offset <= 0) {
						window.ClearInterval(cScrollBar.timerID1);
						cScrollBar.timerID1 = false;
						p.list.buttonclicked = false;
						if (!dragndrop.timerID) {
							dragndrop.timerID = window.SetTimeout(function() {
								p.list.check("drag_over", g_dragndrop_x, g_dragndrop_y);
								full_repaint();
								dragndrop.timerID && window.ClearTimeout(dragndrop.timerID);
								dragndrop.timerID = false;
							}, 75);
						};
					};
				}, scroll_speed_ms);
			};
		};
		else {
			full_repaint();
		};
	};
	else if (p.list.offset < p.list.totalRows - p.list.totalRowVisible && y > p.list.y + p.list.h - cTrack.height) {
		if (!p.list.buttonclicked) {
			p.list.buttonclicked = true;
			//
			var scroll_speed_ms = 5;
			//
			if (!cScrollBar.timerID1) {
				cScrollBar.timerID1 = window.SetInterval(function() {
					on_mouse_wheel(-1);
					if (p.list.offset >= p.list.totalRows - p.list.totalRowVisible) {
						window.ClearInterval(cScrollBar.timerID1);
						cScrollBar.timerID1 = false;
						p.list.buttonclicked = false;
						if (!dragndrop.timerID) {
							dragndrop.timerID = window.SetTimeout(function() {
								p.list.check("drag_over", g_dragndrop_x, g_dragndrop_y);
								full_repaint();
								dragndrop.timerID && window.ClearTimeout(dragndrop.timerID);
								dragndrop.timerID = false;
							}, 75);
						};
					};
				}, scroll_speed_ms);
			};
		};
		else {
			full_repaint();
		};
	};
	else {
		cScrollBar.timerID1 && window.ClearInterval(cScrollBar.timerID1);
		cScrollBar.timerID1 = false;
		p.list.buttonclicked = false;
		if (!dragndrop.timerID) {
			dragndrop.timerID = window.SetTimeout(function() {
				full_repaint();
				dragndrop.timerID && window.ClearTimeout(dragndrop.timerID);
				dragndrop.timerID = false;
			}, 75);
		};
	};

	full_repaint();

	g_dragndrop_x = x;
	g_dragndrop_y = y;
};

function on_drag_drop(action, x, y, mask) {
	if (fb.IsAutoPlaylist(plman.ActivePlaylist)) {
		g_dragndrop_drop_forbidden = false;
		full_repaint();
		return true;
	};

	g_dragndrop_total_before = p.list.count;
	p.list.buttonclicked = false;
	cScrollBar.timerID1 && window.ClearInterval(cScrollBar.timerID1);
	cScrollBar.timerID1 = false;
	g_dragndrop_status = false;

	// We are going to process the dropped items to a playlist
	var total_pl = plman.PlaylistCount;
	if (total_pl < 1) {
		plman.CreatePlaylist(0, "Dropped Items");
		plman.ActivePlaylist = 0;
		action.ToPlaylist();
		action.Playlist = plman.ActivePlaylist;
		action.ToSelect = true;
	};
	else {
		if (g_dragndrop_bottom) {
			plman.ClearPlaylistSelection(plman.ActivePlaylist);
			action.ToPlaylist();
			action.Playlist = plman.ActivePlaylist;
			action.ToSelect = true;
			g_dragndrop_timer && window.ClearTimeout(g_dragndrop_timer);
			g_dragndrop_timer = window.SetTimeout(function() {
				plman.SetPlaylistFocusItem(plman.ActivePlaylist, g_dragndrop_total_before);
				p.list.showFocusedItem();
				//full_repaint();
				g_dragndrop_trackId = -1;
				g_dragndrop_rowId = -1;
				window.ClearTimeout(g_dragndrop_timer);
				g_dragndrop_timer = false;
			}, 75);
		};
		else {
			g_avoid_on_playlist_items_added = true;
			g_avoid_on_playlist_items_reordered = true;

			plman.ClearPlaylistSelection(plman.ActivePlaylist);
			action.ToPlaylist();
			action.Playlist = plman.ActivePlaylist;;
			action.ToSelect = true;

			g_dragndrop_timer && window.ClearTimeout(g_dragndrop_timer);
			g_dragndrop_timer = window.SetTimeout(function() {
				var delta = (g_dragndrop_total_before - g_dragndrop_trackId) * -1;
				plman.MovePlaylistSelection(plman.ActivePlaylist, delta);
				plman.SetPlaylistFocusItem(plman.ActivePlaylist, g_dragndrop_trackId);
				p.list.showFocusedItem();
				g_dragndrop_trackId = -1;
				g_dragndrop_rowId = -1;
				g_avoid_on_playlist_items_added = false;
				g_avoid_on_playlist_items_reordered = false;
				window.ClearTimeout(g_dragndrop_timer);
				g_dragndrop_timer = false;
			}, 75);
		};
	};

	g_dragndrop_drop_forbidden = false;
	full_repaint();
};

function on_http_ex_run_status(info){
	if(p.list.dlitems.length == 0) return;
	if(info.Status & StatusDataReadComplete){//文件下载完成
		p.list.dlitems[info.ID].downloaded = 100;
	}else{
		p.list.dlitems[info.ID].downloaded = Math.floor(info.Length/info.ContentLength * 100);
	}
}

function process_cachekey(str) {
	var str_return = "";
	str = str.toLowerCase();
	var len = str.length;
	for (var i = 0; i < len; i++) {
		var charcode = str.charCodeAt(i);
		if (charcode > 96 && charcode < 123) str_return += str.charAt(i);
		if (charcode > 47 && charcode < 58) str_return += str.charAt(i);
	};
	return str_return;
};

function check_cache(albumIndex) {
	var crc = p.list.groups[albumIndex].cachekey;
	if (fso.FileExists(fb.ProfilePath + "cache\\imgcache\\" + crc)) {
		return true;
	};
	return false;
};

function load_image_from_cache(crc) {
	if (fso.FileExists(fb.ProfilePath + "cache\\imgcache\\" + crc)) { // image in folder cache
		var tdi = gdi.LoadImageAsync(window.ID, fb.ProfilePath + "cache\\imgcache\\" + crc);
		return tdi;
	};
	else {
		return -1;
	};
};

function refresh_cover(){
	var fin = p.list.groups.length;
    for(var i = 0; i < fin; i++) {
		p.list.groups[i].load_requested = 0;
		p.list.groups[i].tid = -1;
	}
	g_image_cache = new image_cache;
	CollectGarbage();
	full_repaint();
}

function on_script_unload() {
	g_timer1 && window.ClearInterval(g_timer1);
	g_timer1 = false;
	g_timer2 && window.ClearInterval(g_timer2);
	g_timer2 = false;
	ClearQueuePlaylist();
};