﻿//foobox https://github.com/dream7180, jsspm http://br3tt.deviantart.com
window.DefinePanel('JS Smooth Playlist Manager', {author: 'Br3tt, Asion, dreamawake, always_beta(CN)', version: '20151115-1000-151', features: {drag_n_drop: true} });
include(fb.ProfilePath + 'foobox\\script\\js_common\\common.js');
include(fb.ProfilePath + 'foobox\\script\\js_common\\JScommon.js');
include(fb.ProfilePath + 'foobox\\script\\js_common\\JSinputbox.js');
include(fb.ProfilePath + 'foobox\\script\\js_common\\JScomponents.js');
include(fb.ProfilePath + 'foobox\\script\\js_panels\\search.js');

var sys_scrollbar = window.GetProperty("foobox.ui.scrollbar.system", false);
var zdpi = 1, dark_mode = 0;
var default_sort =  window.GetProperty("_PROPERTY: New playlist sortorder", "%album% | %discnumber% | %tracknumber% | %title%");
var g_font, g_font_b, g_font_track;
var g_color_line, g_color_line_div, g_color_playing_txt = c_white;

var brw = null;
var isScrolling = false;

var g_filterbox = null;
var g_searchbox = null;
var filter_text = "";

// drag'n drop from windows system
var g_dragndrop_status = false;
var g_dragndrop_x = -1;
var g_dragndrop_y = -1;
var g_dragndrop_trackId = -1;
var g_dragndrop_rowId = -1;
var g_dragndrop_targetPlaylistId = -1;
//
var ww = 0, wh = 0;
var m_x = 0, m_y = 0;
var g_active_playlist = null;
// color vars
var g_color_normal_bg = 0;
var g_color_selected_bg = 0;
var g_color_normal_txt = 0;
var g_color_selected_txt = 0;
var g_color_highlight = 0;
var c_default_hl = 0;
var g_first_populate_launched = false;
//
var repaintforced = false;
var repaint_main = true,
	repaint_main1 = true,
	repaint_main2 = true;
var window_visible = false;
var scroll_ = 0,
	scroll = 0,
	scroll_prev = 0;
var g_start_ = 0,
	g_end_ = 0;
var radiom3u = [];

ppt = {
	defaultRowHeight: window.GetProperty("_PROPERTY: Row Height", 33),
	rowHeight: 0,
	rowScrollStep: window.GetProperty("_PROPERTY: Scroll Step", 3),
	scrollSmoothness: 3.0,
	refreshRate: 20,
	showFilter: window.GetProperty("_DISPLAY: Show Filter", true),
	lockReservedPlaylist: window.GetProperty("_PROPERTY: Lock Reserved Playlist", false),
	SearchBarHeight: 28,
	headerBarHeight: 28,
	showGrid: window.GetProperty("_PROPERTY: Show Grid", true),
	confirmRemove: window.GetProperty("_PROPERTY: Confirm Before Removing", true),
	enableTouchControl: window.GetProperty("_PROPERTY: Touch control", true)
};

cPlaylistManager = {
	drag_clicked: false,
	drag_droped: false,
	drag_target_id: -1
};

cTouch = {
	down: false,
	y_start: 0,
	y_end: 0,
	y_current: 0,
	y_prev: 0,
	y_move: 0,
	scroll_delta: 0,
	t1: null,
	timer: false,
	multiplier: 0,
	delta: 0
};

cFilterBox = {
	enabled: window.GetProperty("_PROPERTY: Enable Filter Box", true),
	x: 14,
	y: 4,
	w: 106,
	h: 20
};

cSearchBox = {
	x: 11,
	y: 3,
	w: 106,
	h: 22
};

cScrollBar = {
	visible: true,
	width: 12,
	ButtonType: {
		cursor: 0,
		up: 1,
		down: 2
	},
	minCursorHeight: 25,
	maxCursorHeight: 110,
	timerID: false,
	timerCounter: -1
};

images = {};

blink = {
	x: 0,
	y: 0,
	totaltracks: 0,
	id: -1,
	counter: -1,
	timer: false
};

timers = {
	mouseDown: false,
	movePlaylist: false
};

//=================================================// Extra functions for playlist manager panel
function renamePlaylist(autopl_pending) {
	let org_name = brw.rows[brw.inputboxID].name;
	let rowid = brw.rows[brw.inputboxID].idx;
	if (!brw.inputbox.text || brw.inputbox.text == "" || brw.inputboxID == -1) brw.inputbox.text = brw.rows[brw.inputboxID].name;
	if (brw.inputbox.text.length > 0) {
		brw.rows[brw.inputboxID].name = brw.inputbox.text;
		plman.RenamePlaylist(rowid, brw.inputbox.text);
		window.SetCursor(IDC_ARROW);
		brw.repaint();
		window.NotifyOthers("Playlist_Renamed", [org_name, brw.inputbox.text]);
	};
	brw.inputboxID = -1;
	if(autopl_pending) plman.ShowAutoPlaylistUI(rowid);
}

function DeletePlaylist(){
	function delete_confirmation(status, confirmed) {
		if(confirmed){
			for(var i = 0; i < brw.actionRows.length; i++){
				var cidx = brw.rows[brw.actionRows[i]].idx - i;
				plman.RemovePlaylistSwitch(cidx);
			}
		}
	}
	var parsed_tabname = "";
	for(var i = 0; i < brw.actionRows.length; i++){
		if(i == 0) parsed_tabname += plman.GetPlaylistName(brw.rows[brw.actionRows[i]].idx);
		else parsed_tabname += ", " + plman.GetPlaylistName(brw.rows[brw.actionRows[i]].idx);
	}
	HtmlDialog("Remove playlist", "Are you sure to remove the following " + brw.actionRows.length + " playlist" + (brw.actionRows.length>1 ? "s" : "") + "?<p class=line_name>" + parsed_tabname + "</p>", "Yes", "No", delete_confirmation);
}

function HtmlDialog(msg_title, msg_content, btn_yes_label, btn_no_label, confirm_callback){
	utils.ShowHtmlDialog(window.ID, `file://${fb.ProfilePath}foobox\\script\\html\\ConfirmDialog.html`, {
		data: [msg_title, msg_content, btn_yes_label, btn_no_label, confirm_callback],
	});
}

//==============Objects======================================================
oPlaylist = function(idx, rowId, name) {
	this.idx = idx;
	this.rowId = rowId;
	this.name = name;
	this.isAutoPlaylist = plman.IsAutoPlaylist(idx);
	this.islocked = false;
	if (ppt.lockReservedPlaylist && this.name == "Library" && this.idx == 0) this.islocked = true;
};

oBrowser = function() {
	this.rows = [];
	this.scrollbar = new oScrollbar();
	this.inputbox = null;
	this.inputboxID = -1;
	this.actionRows = [];
	this.new_bt = null;

	this.images = {
		topbar_btn: null,
		topbar_btn_ov: null
	};

	this.getImages = function() {
		var gb;
		var bt_h = z(24);
		
		this.images.topbar_btn = gdi.CreateImage(bt_h, bt_h);
		gb = this.images.topbar_btn.GetGraphics();
		this.images.topbar_btn.ReleaseGraphics(gb);
		
		this.images.topbar_btn_ov = gdi.CreateImage(bt_h, bt_h);
		gb = this.images.topbar_btn_ov.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillRoundRect(zdpi, zdpi, z(22)-1, z(22)-1, z(3), z(3), g_color_bt_overlay);
		this.images.topbar_btn_ov.ReleaseGraphics(gb);

		this.new_bt = new button(this.images.topbar_btn, this.images.topbar_btn_ov, this.images.topbar_btn_ov);
		this.new_menu = new button(this.images.topbar_btn, this.images.topbar_btn_ov, this.images.topbar_btn_ov);
	};
	this.getImages();
	
	this.launch_populate = function() {
		var launch_timer = window.SetTimeout(function() {
			brw.populate(true, true);
			launch_timer && window.ClearTimeout(launch_timer);
			launch_timer = false;
		}, 5);
	};

	this.repaint = function() {
		repaint_main1 = repaint_main2;
	};

	this.setSize = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.marginLR = 0;
		this.paddingLeft = 8;
		this.paddingRight = cScrollBar.width + 1;
		this.totalRows = Math.ceil(this.h / ppt.rowHeight);
		this.totalRowsVis = Math.floor(this.h / ppt.rowHeight);

		this.getlimits();

		g_filterbox.setSize(cFilterBox.w, cFilterBox.h);
		g_searchbox.setSize(cSearchBox.x, cSearchBox.y, cSearchBox.w, cSearchBox.h);

		if (this.inputboxID > -1) {
			var rh = ppt.rowHeight - 10;
			var tw = this.w - rh - 10;
			this.inputbox && this.inputbox.setSize(tw, rh);
		};

		this.scrollbar.setSize();

		scroll = Math.round(scroll / ppt.rowHeight) * ppt.rowHeight;
		scroll = check_scroll(scroll);
		scroll_ = scroll;

		// scrollbar update       
		this.scrollbar.updateScrollbar();
	};

	this.init_groups = function() {
		var rowId = 0;
		var name = "";
		var total = plman.PlaylistCount;
		this.previous_playlistCount = total;

		this.rows.splice(0, this.rows.length);
		var str_filter = process_string(filter_text);

		for (var i = 0; i < total; i++) {
			name = plman.GetPlaylistName(i);
			if (str_filter.length > 0) {
				var toAdd = match(name, str_filter);
			} else {
				var toAdd = true;
			};
			if (toAdd) {
				this.rows.push(new oPlaylist(i, rowId, name));
				rowId++;
			};
		};
		this.rowsCount = rowId;
		this.getlimits();
	};

	this.getlimits = function() {
		if (this.rowsCount <= this.totalRowsVis) {
			var start_ = 0;
			var end_ = this.rowsCount - 1;
		} else {
			if (scroll_ < 0) scroll_ = scroll;
			var start_ = Math.round(scroll_ / ppt.rowHeight + 0.4);
			var end_ = start_ + this.totalRows;
			// check boundaries
			start_ = start_ > 0 ? start_ - 1 : start_;
			if (start_ < 0) start_ = 0;
			if (end_ >= this.rows.length) end_ = this.rows.length - 1;
		};
		g_start_ = start_;
		g_end_ = end_;
	};

	this.populate = function(repaint_now, reset_scroll) {
		this.init_groups();
		if (reset_scroll) scroll = scroll_ = 0;
		this.scrollbar.updateScrollbar();
		if(repaint_now) this.repaint();
	};

	this.getRowIdFromIdx = function(idx) {
		if(g_filterbox.inputbox.text.length == 0) return idx;
		var total = this.rows.length;
		var rowId = -1;
		if (plman.PlaylistCount > 0) {
			for (var i = 0; i < total; i++) {
				if (this.rows[i].idx == idx) {
					rowId = i;
					break;
				};
			};
		};
		return rowId;
	};

	this.isVisiblePlaylist = function(idx) {
		var rowId = this.getRowIdFromIdx(idx);
		var offset_active_pl = ppt.rowHeight * rowId;
		if (offset_active_pl < scroll || offset_active_pl + ppt.rowHeight > scroll + this.h) {
			return false;
		}
		else {
			return true;
		};
	};

	this.isVisibleRow = function(rowid) {
		var offset_activerow = ppt.rowHeight * rowid;
		if (offset_activerow < scroll || offset_activerow + ppt.rowHeight > scroll + this.h) {
			return false;
		}
		else {
			return true;
		};
	};

	this.showActiveRow = function() {
		if (!this.isVisibleRow(this.activeRow)) {
			scroll = (this.activeRow - Math.floor(this.totalRowsVis / 2)) * ppt.rowHeight;
			scroll = check_scroll(scroll);
			this.scrollbar.updateScrollbar();
		} else this.repaint();
	};

	this.showActivePlaylist = function() {
		var rowId = this.getRowIdFromIdx(plman.ActivePlaylist);
		if (!this.isVisiblePlaylist(plman.ActivePlaylist)) {
			scroll = (rowId - Math.floor(this.totalRowsVis / 2)) * ppt.rowHeight;
			scroll = check_scroll(scroll);
			this.scrollbar.updateScrollbar();
		};
	};
	
	this.callRename = function(id, pl_idx, autopl_pending) {
		var rh = ppt.rowHeight - 10;
		var tw = this.w - rh - 20;
		this.inputbox = new oInputbox(tw, rh, plman.GetPlaylistName(pl_idx), "", g_color_normal_txt, g_color_normal_bg, c_black, g_color_selected_bg, autopl_pending ? "renamePlaylist(true)" : "renamePlaylist(false)", "brw");
		this.inputboxID = id;
		// activate inputbox for edit
		this.inputbox.on_focus(true);
		this.inputbox.edit = true;
		this.inputbox.Cpos = this.inputbox.text.length;
		this.inputbox.anchor = this.inputbox.Cpos;
		if (!cInputbox.timer_cursor) {
			this.inputbox.resetCursorTimer();
		};
		this.inputbox.dblclk = true;
		this.inputbox.SelBegin = 0;
		this.inputbox.SelEnd = this.inputbox.text.length;
		this.inputbox.text_selected = this.inputbox.text;
		this.inputbox.select = true;
		this.repaint();
	}

	this.draw = function(gr) {
		if (repaint_main || !repaintforced) {
			repaint_main = false;
			repaintforced = false;
			if (this.rows.length > 0) {
				var ax = this.marginLR;
				var ay = 0;
				var aw = this.w + cScrollBar.width;
				var ah = ppt.rowHeight;
				for (var i = g_start_; i <= g_end_; i++) {
					ay = Math.floor(this.y + (i * ah) - scroll_);
					this.rows[i].x = ax;
					this.rows[i].y = ay;
					if (ay > this.y - ppt.headerBarHeight - ah && ay < this.y + this.h) {
						// row bg
						var track_color_txt = blendColors(g_color_normal_bg, g_color_normal_txt, 0.65);
						if(ppt.showGrid) gr.DrawLine(ax, ay + ah, aw, ay + ah, 1, g_color_line);
						// active playlist row bg
						if (this.rows[i].idx == plman.ActivePlaylist) {
							track_color_txt = g_color_normal_txt;
							gr.FillSolidRect(ax, ay, aw, ah, g_color_selected_bg);
						} else if(this.actionRows.indexOf(i) > -1){
							track_color_txt = g_color_normal_txt;
							gr.FillSolidRect(ax, ay, aw, ah, g_color_selected_bg &0x75ffffff)
						}
						if (this.rows[i].idx == plman.PlayingPlaylist && fb.IsPlaying) {
							gr.FillSolidRect(ax, ay, aw, ah, g_color_highlight);
						}
						// hover item
						if (i == this.activeRow && !g_dragndrop_status && !cPlaylistManager.drag_clicked) {
							gr.FillSolidRect(ax, ay, 4, ah, g_color_highlight);
						};
						// target location mark
						if (cPlaylistManager.drag_target_id == i && !this.rows[i].islocked) {
							if (cPlaylistManager.drag_target_id > this.actionRows[0]) {
								gr.FillSolidRect(ax, ay + ppt.rowHeight - 2, aw - 1, 2, RGBA(0, 0, 0, 105));
								gr.FillSolidRect(ax, ay + ppt.rowHeight - 2, aw - 1, 2, g_color_highlight);
							}
							else if (cPlaylistManager.drag_target_id < this.actionRows[0]) {
								gr.FillSolidRect(ax, ay + 1, aw - 1, 2, RGBA(0, 0, 0, 105));
								gr.FillSolidRect(ax, ay + 1, aw - 1, 2, g_color_highlight);
							};
						};
						if (g_dragndrop_status && i == g_dragndrop_targetPlaylistId && !this.rows[i].isAutoPlaylist) {
							gr.FillSolidRect(ax, ay, aw, ah, g_color_highlight &0x40ffffff);
						};
						// draw blink rectangle after an external drag'n drop files
						if (blink.counter > -1) {
							if (i == blink.id && !this.rows[i].isAutoPlaylist) {
								if (blink.counter <= 5 && Math.floor(blink.counter / 2) == Math.ceil(blink.counter / 2)) {
									gr.DrawRect(ax + 1, ay + 1, aw - 2, ah - 2, 2.0, g_color_selected_bg);
								};
							};
						};
						// =====
						// text
						// =====
						var playlist_icon = playlistName2icon(this.rows[i].name, this.rows[i].isAutoPlaylist, (fb.IsPlaying && this.rows[i].idx == plman.PlayingPlaylist));
						var rh = playlist_icon.Width;
						gr.DrawImage(playlist_icon, ax + this.paddingLeft, ay + Math.round(ah / 2 - playlist_icon.Height / 2) - 1, playlist_icon.Width, playlist_icon.Height, 0, 0, playlist_icon.Width, playlist_icon.Height, 0, 255);
						if (fb.IsPlaying && this.rows[i].idx == plman.PlayingPlaylist){
							var font = g_font_b;
							var name_color = g_color_playing_txt;
							var track_color = g_color_playing_txt;
						}
						else {
							var font = g_font;
							var name_color = g_color_normal_txt;
							var track_color = track_color_txt;
						};
						// fields
						var track_total = plman.PlaylistItemCount(this.rows[i].idx);
						var track_total_w = gr.CalcTextWidth(track_total, font);
						var tx = ax + rh + this.paddingLeft + 4;
						if (this.inputboxID == i) {
							this.inputbox.draw(gr, tx + 2, ay + 5);
						}
						else {
							gr.GdiDrawText(this.rows[i].name, font, name_color, tx, ay, aw - tx - track_total_w - this.paddingRight - 5, ah, lc_txt);
							gr.GdiDrawText(track_total, g_font_track, track_color, ax + aw - track_total_w - this.paddingRight, ay, track_total_w, ah, rc_txt);
						};
					};
				};
			}
			gr.FillSolidRect(0, 0, ww, ppt.headerBarHeight+1, g_color_normal_bg);
			gr.FillSolidRect(0, 0, ww, ppt.SearchBarHeight - 2, g_color_topbar);
			if(ppt.showFilter){
				var boxText = this.rows.length.toString();
				var tw = gr.CalcTextWidth(boxText, g_font_track);
				gr.GdiDrawText(boxText, g_font_track, g_color_normal_txt, this.w - tw, 0, tw, ppt.headerBarHeight + ppt.SearchBarHeight - 1, rc_txt);
			}
			gr.DrawLine(0, ppt.SearchBarHeight, ww, ppt.SearchBarHeight, 1, g_color_line_div);
			var bt_y = (ppt.SearchBarHeight - brw.images.topbar_btn.Height)/2;
			this.new_menu.draw(gr, Math.round(ww - 2*brw.images.topbar_btn.Width), Math.round(bt_y - zdpi), 255);
			this.new_bt.draw(gr, Math.round(ww - brw.images.topbar_btn.Width),  Math.round(bt_y - zdpi), 255);
			gr.DrawImage(images.add_menu, Math.round(ww - 1.5*brw.images.topbar_btn.Width - images.add_menu.Height/2), Math.round((ppt.SearchBarHeight - images.add_menu.Height)/2-2), images.add_menu.Width, images.add_menu.Height, 0, 0, images.add_menu.Width, images.add_menu.Height, 0, 255);
			gr.FillGradRect(Math.round(ww - brw.images.topbar_btn.Width-1), 0, 1, ppt.SearchBarHeight/2, 90, RGBA(0, 0, 0, 3), RGBA(0, 0, 0, 35));
			gr.FillGradRect(Math.round(ww - brw.images.topbar_btn.Width-1), ppt.SearchBarHeight/2, 1, ppt.SearchBarHeight/2, 270, RGBA(0, 0, 0, 3), RGBA(0, 0, 0, 35));
			gr.FillSolidRect(Math.round(ww - brw.images.topbar_btn.Width), 0, 1, ppt.SearchBarHeight - 2, g_color_normal_bg);
			gr.DrawImage(images.newplaylist_img, Math.round(ww - 0.5*brw.images.topbar_btn.Width - images.newplaylist_img.Height/2), Math.round((ppt.SearchBarHeight - images.newplaylist_img.Height)/2-2), images.newplaylist_img.Width, images.newplaylist_img.Height, 0, 0, images.newplaylist_img.Width, images.newplaylist_img.Height, 0, 255);
			brw.scrollbar && brw.scrollbar.draw(gr);
		};
	};

	this._isHover = function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	};

	this.on_mouse = function(event, x, y) {
		this.ishover = this._isHover(x, y);

		// get hover row index (mouse cursor hover)
		this.activeRow = -1;
		if (this.ishover) {
			if (y > this.y && y < this.y + this.h) {
				this.activeRow = Math.ceil((y + scroll_ - this.y) / ppt.rowHeight - 1);
				if (this.activeRow >= this.rows.length) this.activeRow = -1;
			}
		}
		if (brw.activeRow != brw.activeRowSaved) {
			brw.activeRowSaved = brw.activeRow;
			window.RepaintRect(0, 0, 5, wh);
		};

		switch (event) {
		case "down":
			this.down = true;
			if (!cTouch.down && !timers.mouseDown && this.ishover && this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
				if (this.activeRow == this.inputboxID) {
					this.inputbox.check("down", x, y, true);
				} else {
					if (this.inputboxID > -1) {
						this.inputbox.check("down", x, y, true);
						this.inputboxID = -1;
					}
					if(utils.IsKeyPressed(VK_CONTROL)){
						var cid = this.getRowIdFromIdx(plman.ActivePlaylist);
						var rid = this.actionRows.indexOf(this.activeRow);
						if(rid < 0) {
							if(!this.rows[this.activeRow].islocked) this.actionRows.push(this.activeRow);
						}
						else if(rid != cid) this.actionRows.splice(rid, 1);
					} else if(utils.IsKeyPressed(VK_SHIFT)){
						var cid = this.getRowIdFromIdx(plman.ActivePlaylist);
						if(cid > this.activeRow){
							var _start = this.activeRow;
							var _end = cid;
						} else{
							var _start = cid;
							var _end = this.activeRow;
						}
						this.actionRows.splice(0, this.actionRows.length);
						for (var i = _start; i <= _end; i++) {
							if(!this.rows[i].islocked) this.actionRows.push(i);
						};
					} else {
						var rid = this.actionRows.indexOf(this.activeRow);
						if(rid < 0) {
							this.actionRows.splice(0, this.actionRows.length);
							this.actionRows.push(this.activeRow);
							if (plman.ActivePlaylist != this.rows[this.activeRow].idx) {
								plman.ActivePlaylist = this.rows[this.activeRow].idx;
							}
						};
					}
					if (!this.rows[this.activeRow].islocked) {
						if (!this.up) {
							// set dragged item to reorder list
							cPlaylistManager.drag_clicked = true;
						};
					}
				};
				this.repaint();
			} else {
				if (this.inputboxID > -1) {
					this.inputbox.check("down", x, y, true);
					this.inputboxID = -1;
					this.repaint();
				}
				// scrollbar
				if (cScrollBar.visible) {
					this.scrollbar && this.scrollbar.on_mouse(event, x, y);
				};
				this.new_bt.checkstate("down", x, y);
				if (this.new_menu.checkstate("down", x, y) == ButtonStates.down) {
					this.buttonClicked = true;
					this.new_menu.state = ButtonStates.hover;
				};
			};
			this.up = false;
			break;
		case "up":
			this.up = true;
			if (this.down) {
				// scrollbar
				if (cScrollBar.visible) {
					brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
				};

				if (this.new_bt.checkstate("up", x, y) == ButtonStates.hover) {
					var total = plman.PlaylistCount;
					var pl_idx = total;
					var id = this.rowsCount;
					plman.CreatePlaylist(pl_idx, "");
					plman.ActivePlaylist = pl_idx;
					this.callRename(id, pl_idx);
				};
				
				if (this.buttonClicked && this.new_menu.checkstate("up", x, y) == ButtonStates.hover) {
					this.context_menu(Math.round(ww - 2*brw.images.topbar_btn.Width), ppt.SearchBarHeight - 3*zdpi, null, true);
					this.new_menu.state = ButtonStates.normal;
					this.new_menu.repaint();
				}
				this.buttonClicked = false;

				if (this.inputboxID >= 0) {
					this.inputbox.check("up", x, y);
				} else {
					// drop playlist switch
					if(this.actionRows.indexOf(this.activeRow) > -1) {
						if((!utils.IsKeyPressed(VK_SHIFT) && !utils.IsKeyPressed(VK_CONTROL)) || !cPlaylistManager.drag_clicked) {
							this.actionRows.splice(0, this.actionRows.length);
							if(!this.rows[this.activeRow].islocked) this.actionRows.push(this.activeRow);
							if (plman.ActivePlaylist != this.rows[this.activeRow].idx) {
								plman.ActivePlaylist = this.rows[this.activeRow].idx;
							};
							this.repaint();
						}
					}
					this.actionRows.sort(function(a,b){return a - b});
					if (cPlaylistManager.drag_target_id > (ppt.lockReservedPlaylist ? 0 : -1)) {
						if (this.actionRows.indexOf(cPlaylistManager.drag_target_id) < 0) {
							cPlaylistManager.drag_droped = true
							for(var i = 0; i < this.actionRows.length; i++){
								if (cPlaylistManager.drag_target_id < this.actionRows[i]) {
									plman.MovePlaylist(this.rows[this.actionRows[i]].idx, this.rows[cPlaylistManager.drag_target_id].idx);
									this.actionRows[i] = cPlaylistManager.drag_target_id;
									cPlaylistManager.drag_target_id++;
								}
								else if (cPlaylistManager.drag_target_id > this.actionRows[i]) {
									plman.MovePlaylist(this.rows[this.actionRows[i]].idx, this.rows[cPlaylistManager.drag_target_id].idx);
									this.actionRows[i] = cPlaylistManager.drag_target_id - i;
									if(i < this.actionRows.length -1) {
										if(cPlaylistManager.drag_target_id < this.actionRows[i + 1]) cPlaylistManager.drag_target_id++;
									}
									for(var j = i + 1; j < this.actionRows.length; j++){
										if (cPlaylistManager.drag_target_id > this.actionRows[j]) this.actionRows[j]--;
									}
								};
							};
						}
					};
				};
				if (timers.movePlaylist) {
					timers.movePlaylist && window.ClearInterval(timers.movePlaylist);
					timers.movePlaylist = false;
				};
			};

			this.down = false;

			if (cPlaylistManager.drag_moved) window.SetCursor(IDC_ARROW);

			cPlaylistManager.drag_clicked = false;
			cPlaylistManager.drag_moved = false;
			cPlaylistManager.drag_target_id = -1;
			break;
		case "dblclk":
			if (this.ishover && this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
				var focus_item = plman.GetPlaylistFocusItemIndex(plman.ActivePlaylist);
				if(focus_item > -1)
					plman.ExecutePlaylistDefaultAction(this.rows[this.activeRow].idx, focus_item);
				else
					plman.ExecutePlaylistDefaultAction(this.rows[this.activeRow].idx, 0);
			}
			else {
				if (cScrollBar.visible) {
					brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
				};
			};
			break;
		case "move":
			this.up = false;
			if (this.inputboxID >= 0) {
				this.inputbox.check("move", x, y);
			}
			else {
				if (cPlaylistManager.drag_clicked) {
					cPlaylistManager.drag_moved = true;
				};
				if (cPlaylistManager.drag_moved) {
					if (this.activeRow > -1) {
						if (timers.movePlaylist) {
							timers.movePlaylist && window.ClearInterval(timers.movePlaylist);
							timers.movePlaylist = false;
						};
						if (this.actionRows.indexOf(this.activeRow) < 0) {
							cPlaylistManager.drag_target_id = this.activeRow;
						}
						else if (y > this.rows[this.rowsCount - 1].y + ppt.rowHeight && y < this.rows[this.rowsCount - 1].y + ppt.rowHeight * 2) {
							cPlaylistManager.drag_target_id = this.rowsCount;
						}
						else {
							cPlaylistManager.drag_target_id = -1;
						};
					}
					else {
						if (y < this.y) {
							if (!timers.movePlaylist) {
								timers.movePlaylist = window.SetInterval(function() {
									scroll -= ppt.rowHeight;
									scroll = check_scroll(scroll);
									cPlaylistManager.drag_target_id = cPlaylistManager.drag_target_id > 0 ? cPlaylistManager.drag_target_id - 1 : 0;
								}, 100);
							}
						}
						else if (y > this.y + this.h) {
							if (!timers.movePlaylist) {
								timers.movePlaylist = window.SetInterval(function() {
									scroll += ppt.rowHeight;
									scroll = check_scroll(scroll);
									cPlaylistManager.drag_target_id = cPlaylistManager.drag_target_id < this.rowsCount - 1 ? cPlaylistManager.drag_target_id + 1 : this.rowsCount - 1;
								}, 100);
							}
						};
					};
					brw.repaint();
				};
			};

			// scrollbar
			if (cScrollBar.visible) {
				brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
			};

			this.new_bt.checkstate("move", x, y);
			this.new_menu.checkstate("move", x, y);
			break;
		case "right":
			if (this.inputboxID >= 0) {
				if (!this.inputbox.hover) {
					this.inputboxID = -1;
					this.on_mouse("right", x, y);
				}
				else {
					this.inputbox.check("right", x, y);
				};
			}
			else {
				if (this.ishover) {
					if (this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
						if(this.actionRows.indexOf(this.activeRow) < 0){
							this.actionRows.splice(0, this.actionRows.length);
							if(!this.rows[this.activeRow].islocked) this.actionRows.push(this.activeRow);
						}
					}
					this.context_menu(x, y, this.activeRow);
				}
				else {
					if (cScrollBar.visible) {
						brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
					};
				};
			};
			break;
		case "leave":
			this.new_bt.checkstate("leave", x, y);
			this.check_leavemenu();
			// scrollbar
			if (cScrollBar.visible) {
				this.scrollbar && this.scrollbar.on_mouse(event, 0, 0);
			};
			break;
		case "drag_over":
			if (this.rows.length > 0) {
				if (y > brw.y) {
					if (this.activeRow > -1) {
						if (this.rows[this.activeRow].isAutoPlaylist) {
							g_dragndrop_targetPlaylistId = -2;
						}
						else {
							g_dragndrop_targetPlaylistId = this.activeRow;
						};
					}
					else {
						g_dragndrop_targetPlaylistId = -1;
					};
				} else if(y > ppt.headerBarHeight) g_dragndrop_targetPlaylistId = -1;
			}
			else {
				g_dragndrop_bottom = true;
				g_dragndrop_trackId = 0;
				g_dragndrop_rowId = 0;
			};
			break;
		};
	};

	if (this.g_time) {
		window.ClearInterval(this.g_time);
		this.g_time = false;
	};
	this.g_time = window.SetInterval(function() {
		if (!window.IsVisible) {
			window_visible = false;
			return;
		};

		var repaint_1 = false;

		if (!window_visible) {
			window_visible = true;
		};

		if (!g_first_populate_launched) {
			g_first_populate_launched = true;
			brw.launch_populate();
		};

		if (repaint_main1 == repaint_main2) {
			repaint_main2 = !repaint_main1;
			repaint_1 = true;
		};

		scroll = check_scroll(scroll);
		if (Math.abs(scroll - scroll_) >= 1) {
			scroll_ += (scroll - scroll_) / ppt.scrollSmoothness;
			repaint_1 = true;
			isScrolling = true;
			//
			if (scroll_prev != scroll) brw.scrollbar.updateScrollbar();
		}
		else {
			if (isScrolling) {
				if (scroll_ < 1) scroll_ = 0;
				isScrolling = false;
				repaint_1 = true;
			};
		};

		if (repaint_1) {
			if (brw.rows.length > 0) brw.getlimits();
			repaintforced = true;
			repaint_main = true;
			window.Repaint();
		};
		scroll_prev = scroll;
	}, ppt.refreshRate);
	
	this.check_leavemenu = function(){
		var _state = this.new_menu.state;
		if(this.buttonClicked && _state == ButtonStates.hover) this.buttonClicked = false;
		else this.new_menu.state = ButtonStates.normal;
		if(this.new_menu.state != _state) this.new_menu.repaint();
	}

	this.context_menu = function(x, y, id, setting_mode) {
		var _menu = window.CreatePopupMenu();
		var _newplaylist = window.CreatePopupMenu();
		var _autoplaylist = window.CreatePopupMenu();
		var _options = window.CreatePopupMenu();
		var PLRecManager = plman.PlaylistRecycler;
		var _restorepl = window.CreatePopupMenu();
		var _radiolist = window.CreatePopupMenu();
		var idx;
		var total_area, visible_area;
		var bout, z;
		var add_mode = (id == null || id < 0);
		var total = plman.PlaylistCount;
		
		if(setting_mode){
			_menu.AppendMenuItem(MF_STRING, 21, "Search in playlist");
			_menu.AppendMenuItem(MF_STRING, 22, "Search in library");
			_menu.CheckMenuRadioItem(21, 22, ppts.source + 20);
			_menu.AppendMenuSeparator();
	
			var SearchHistoryMenu = window.CreatePopupMenu();
			var SearchOptionMenu = window.CreatePopupMenu();

			for (var i = g_searchbox.historylist.length - 1; i >= 0; i--) {
				SearchHistoryMenu.AppendMenuItem(MF_STRING, i + 51, g_searchbox.historylist[i][0].replace("&", "&&"));
			}
			if (g_searchbox.historylist.length == 0) {
				SearchHistoryMenu.AppendMenuItem(MF_GRAYED, 40, "No history");
			} else {
				SearchHistoryMenu.AppendMenuSeparator();
				SearchHistoryMenu.AppendMenuItem(MF_STRING, ppts.historymaxitems + 60, "Clear history");
			}

			SearchHistoryMenu.AppendTo(_menu, MF_STRING, "Search history");

			if (ppts.source == 1) {
				_menu.AppendMenuItem(MF_STRING, 1, "Auto-validation");
				_menu.CheckMenuItem(1, ppts.autosearch ? 1 : 0);
				SearchOptionMenu.AppendMenuItem(MF_STRING, 2, "Search: Auto");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 3, "Search: Artist");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 4, "Search: Album");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 5, "Search: Title");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 6, "Search: Genre");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 7, "Search: Date");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 8, "Search: File name");
				SearchOptionMenu.AppendMenuSeparator();
				SearchOptionMenu.AppendMenuItem(MF_STRING, 9, "Search: Comment");
				SearchOptionMenu.CheckMenuRadioItem(2, 9, ppts.scope + 2);

			} else if (ppts.source == 2) {
				var now_playing_track = fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem();
				var quickSearchMenu = window.CreatePopupMenu();
				quickSearchMenu.AppendMenuItem(MF_STRING, 36, "Same artist");
				quickSearchMenu.AppendMenuItem(MF_STRING, 37, "Same album");
				quickSearchMenu.AppendMenuItem(MF_STRING, 38, "Same genre");
				quickSearchMenu.AppendMenuItem(MF_STRING, 39, "Same date");
				quickSearchMenu.AppendTo(_menu, MF_STRING, "Quick search...");
				_menu.AppendMenuItem(MF_STRING, 27, "Keep previous search playlist");
				_menu.CheckMenuItem(27, ppts.multiple ? 1 : 0);
				SearchOptionMenu.AppendMenuItem(MF_STRING, 2, "Search: Auto");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 3, "Search: Artist");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 4, "Search: Album");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 5, "Search: Title");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 6, "Search: Genre");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 7, "Search: Date");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 8, "Search: File name");
				SearchOptionMenu.AppendMenuSeparator();
				SearchOptionMenu.AppendMenuItem(MF_STRING, 9, "Search: Comment");
				SearchOptionMenu.CheckMenuRadioItem(2, 9, ppts.scope + 2);
			}
			SearchOptionMenu.AppendTo(_menu, MF_STRING, "Search scope");
			_menu.AppendMenuSeparator();
		}
		
		if (!add_mode) {
			_menu.AppendMenuItem(this.rows[id].islocked ? MF_DISABLED : MF_STRING, 10, "Remove");
			_menu.AppendMenuSeparator();
			_menu.AppendMenuItem(this.rows[id].islocked ? MF_DISABLED : MF_STRING, 11, "Rename");
			_menu.AppendMenuItem(MF_STRING, 12, "Copy");
			if (plman.IsAutoPlaylist(id)) {
				_menu.AppendMenuSeparator();
				_menu.AppendMenuItem(MF_STRING, 13, "Autoplaylist properties...");
				_menu.AppendMenuItem(this.rows[id].islocked ? MF_DISABLED : MF_STRING, 14, "Convert to a normal playlist");
			};
			_menu.AppendMenuSeparator();
		}

		if (!add_mode) {
			var pl_idx = this.rows[id].idx;
			_newplaylist.AppendTo(_menu, (g_filterbox.inputbox.text.length > 0 ? MF_GRAYED | MF_DISABLED : MF_STRING), "Insert playlist...");
		}
		else {
			id = this.rowsCount;
			var pl_idx = total;
			_newplaylist.AppendTo(_menu, (g_filterbox.inputbox.text.length > 0 ? MF_GRAYED | MF_DISABLED : MF_STRING), "Add playlist...");
		};
		_newplaylist.AppendMenuItem(MF_STRING, 100, "New playlist");
		_newplaylist.AppendMenuItem(MF_STRING, 101, "New autoplaylist");
		_autoplaylist.AppendTo(_newplaylist, MF_STRING, "Preset autoplaylists");
		_autoplaylist.AppendMenuItem(MF_STRING, 200, "Library (full)");
		_autoplaylist.AppendMenuItem(MF_STRING, 204, "Tracks never played");
		_autoplaylist.AppendMenuItem(MF_STRING, 205, "History (tracks played in one week)");
		_autoplaylist.AppendMenuItem(MF_STRING, 206, "Tracks played often");
		_autoplaylist.AppendMenuItem(MF_STRING, 210, "Tracks recently added");
		_autoplaylist.AppendMenuSeparator();
		_autoplaylist.AppendMenuItem(MF_STRING, 250, "Favorites (mood)");
		_autoplaylist.AppendMenuSeparator();
		_autoplaylist.AppendMenuItem(MF_STRING, 225, "Tracks rated 5");
		_autoplaylist.AppendMenuItem(MF_STRING, 224, "Tracks rated 4");
		_autoplaylist.AppendMenuItem(MF_STRING, 223, "Tracks rated 3");
		_autoplaylist.AppendMenuItem(MF_STRING, 222, "Tracks rated 2");
		_autoplaylist.AppendMenuItem(MF_STRING, 221, "Tracks rated 1");
		_autoplaylist.AppendMenuItem(MF_STRING, 220, "Tracks unrated");
		_radiolist.AppendTo(_newplaylist, MF_STRING, "Internet radio");
		_radiolist.AppendMenuItem(MF_STRING, 30, "Radio (github)");
		_radiolist.AppendMenuItem(MF_STRING, 31, "Radio (gitee)");
		if(radiom3u.length > 0){
			for(var urlcount = 0; urlcount < radiom3u.length; urlcount++){
				_radiolist.AppendMenuItem(MF_STRING, 300 + urlcount, radiom3u[urlcount]);
			}
		}
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 15, "Load playlist");
		_menu.AppendMenuItem(MF_STRING, 16, "Save all playlists");
		if (!add_mode) {
			_menu.AppendMenuItem(MF_STRING, 17, "Save this playlist");
			_menu.AppendMenuSeparator();
			_restorepl.AppendTo(_menu, PLRecManager.Count >= 1 ? MF_STRING : MF_GRAYED | MF_DISABLED, "Playlist history");
			if (PLRecManager.Count >= 1) {
				for (var irm = 0; irm < PLRecManager.Count; irm++) {
					_restorepl.AppendMenuItem(MF_STRING, 2001 + irm, PLRecManager.GetName(irm));
				}
				_restorepl.AppendMenuItem(MF_SEPARATOR, 0, 0);
				_restorepl.AppendMenuItem(MF_STRING, 2000, "Clear history");
			}
			if (!plman.IsAutoPlaylist(id)) {
				_menu.AppendMenuSeparator();
				_menu.AppendMenuItem((plman.PlaylistItemCount(id) >= 1) ? MF_STRING : MF_GRAYED | MF_DISABLED, 18, "Clear");
				_menu.AppendMenuItem((plman.PlaylistItemCount(id) >= 1) ? MF_STRING : MF_GRAYED | MF_DISABLED, 19, "Remove duplicates");
				_menu.AppendMenuItem((plman.PlaylistItemCount(id) >= 1) ? MF_STRING : MF_GRAYED | MF_DISABLED, 20, "Remove dead items");
			}
		};
		if(setting_mode){
			_menu.AppendMenuSeparator();
			_options.AppendTo(_menu, MF_STRING, "Panel options");
			_options.AppendMenuItem(MF_STRING, 23, "Confirmation before removing playlist");
			_options.CheckMenuItem(23, ppt.confirmRemove);
			_options.AppendMenuSeparator();
			_options.AppendMenuItem(MF_STRING, 24, "Show filter");
			_options.CheckMenuItem(24, ppt.showFilter);
			_options.AppendMenuItem(MF_STRING, 25, "Show grids");
			_options.CheckMenuItem(25, ppt.showGrid);
			_options.AppendMenuItem(MF_STRING, 26, "Panel properties");
		}
		idx = _menu.TrackPopupMenu(x, y);

		switch (true) {
		case (idx == 1):
			ppts.autosearch = !ppts.autosearch;
			g_searchbox.inputbox.autovalidation = ppts.autosearch;
			window.SetProperty("Search Box: Auto-validation", ppts.autosearch);
			break;
		case (idx >= 2 && idx <= 9):
			ppts.scope = idx - 2;
			window.SetProperty("Search Box: Scope", ppts.scope);
			break;
		case (idx == 27):
			ppts.multiple = !ppts.multiple;
			window.SetProperty("Search Box: Keep Playlist", ppts.multiple);
			break;
		case (idx >= 21 && idx <= 22):
			window.SetProperty("Search Source", ppts.source = idx - 20);
			g_searchbox.inputbox.autovalidation = (ppts.source > 1) ? false : ppts.autosearch;
			g_searchbox.inputbox.empty_text = (ppts.source == 1) ? "Search in playlist" : "Search in library";
			g_searchbox.repaint();
			break;
		case (idx == 36):
			quickSearch(now_playing_track, "artist");
			break;
		case (idx == 37):
			quickSearch(now_playing_track, "album");
			break;
		case (idx == 38):
			quickSearch(now_playing_track, "genre");
			break;
		case (idx == 39):
			quickSearch(now_playing_track, "date");
			break;
		case (idx >= 51 && idx <= ppts.historymaxitems + 51):
			g_searchbox.inputbox.text = g_searchbox.historylist[idx - 51][0];
			g_searchbox.on_char();
			g_searchbox.repaint();
			break;
		case (idx == ppts.historymaxitems + 60):
			g_searchbox.historyreset();
			break;
		case (idx == 30):
			LoadRadio("Internet Radio", "https://raw.githubusercontent.com/dream7180/Resource/main/radio/radio.fpl");
			break;
		case (idx == 31):
			LoadRadio("Internet Radio", "https://gitee.com/dream7180/Resource/raw/main/radio/radio.fpl");
			break;
		case (idx >= 300 && idx < 300 + radiom3u.length):
			LoadRadio("Internet Radio", radiom3u[idx - 300]);
			break;
		case (idx == 100):
			plman.CreatePlaylist(total, "");
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			this.callRename(id, pl_idx);
			break;
		case (idx == 101):
			plman.CreateAutoPlaylist(total, "", "Enter your query here", "", 0);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			this.callRename(id, pl_idx, true);
			break;
		case (idx == 15):
			fb.RunMainMenuCommand("File/Load playlist...");
			break;
		case (idx == 16):
			fb.RunMainMenuCommand("File/Save all playlists...");
			break;
		case (idx == 11):
			this.callRename(id, pl_idx);
			break;
		case (idx == 17):
			fb.RunMainMenuCommand("File/Save playlist...");
			break;
		case (idx == 12):
			for(var i = 0; i < brw.actionRows.length; i++){
				var cidx = brw.rows[brw.actionRows[i]].idx + i;
				plman.DuplicatePlaylist(cidx, plman.GetPlaylistName(cidx) + " (copy)");
			}
			brw.actionRows.splice(0, brw.actionRows.length);
			break;
		case (idx == 13):
			plman.ShowAutoPlaylistUI(pl_idx);
			break;
		case (idx == 14):
			plman.DuplicatePlaylist(pl_idx, plman.GetPlaylistName(pl_idx));
			plman.RemovePlaylist(pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 10):
			if (brw.rowsCount > 0) {
				if(ppt.confirmRemove){
					DeletePlaylist();
				} else {
					for(var i = 0; i < brw.actionRows.length; i++){
						var cidx = brw.rows[brw.actionRows[i]].idx - i;
						plman.RemovePlaylistSwitch(cidx);
					}
				}
				brw.actionRows.splice(0, brw.actionRows.length);
			}
			break;
		case (idx == 24):
			ppt.showFilter = !ppt.showFilter;
			window.SetProperty("_DISPLAY: Show Filter", ppt.showFilter);
			ppt.headerBarHeight = ppt.SearchBarHeight + (ppt.showFilter ? ppt.rowHeight : 0);
			brw.setSize(0, ppt.headerBarHeight, ww - cScrollBar.width, wh - ppt.headerBarHeight);
			brw.repaint();
			break;
		case (idx == 18):
			fb.RunMainMenuCommand("Edit/Clear");
			break;
		case (idx == 19):
			fb.RunMainMenuCommand("Edit/Remove duplicates");
			break;
		case (idx == 20):
			fb.RunMainMenuCommand("Edit/Remove dead items");
			break;
		case (idx == 26):
			window.ShowProperties();
			break;
		case (idx == 23):
			ppt.confirmRemove = !ppt.confirmRemove;
			window.SetProperty("_PROPERTY: Confirm Before Removing", ppt.confirmRemove);
			break;
		case (idx == 25):
			ppt.showGrid = !ppt.showGrid;
			window.SetProperty("_PROPERTY: Show Grid", ppt.showGrid);
			brw.repaint();
			break;
		case (idx == 200):
			if (ppt.lockReservedPlaylist) checkMediaLibrayPlaylist();
			else {
				var total = plman.PlaylistCount;
				plman.CreateAutoPlaylist(total, "Library", "ALL", default_sort, 0);
				plman.MovePlaylist(total, pl_idx);
				plman.ActivePlaylist = pl_idx;
			}
			break;
		case (idx == 204):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "Never played", "%play_count% IS 0", default_sort, 1);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 205):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "History", "%last_played% DURING LAST 1 WEEK SORT DESCENDING BY %last_played%", "", 1);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 206):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "Played often", "%play_count% GREATER 0 SORT DESCENDING BY %play_count%", "", 1);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 210):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "Recently added", "%added% DURING LAST 12 WEEKS SORT DESCENDING BY %added%", "", 1);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 220):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "Unrated", "%rating% MISSING", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 221):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "Rated 1", "%rating% IS 1", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 222):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "Rated 2", "%rating% IS 2", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 223):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "Rated 3", "%rating% IS 3", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 224):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "Rated 4", "%rating% IS 4", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 225):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "Rated 5", "%rating% IS 5", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 250):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "Favorites", "%mood% GREATER 0", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 2000):
			var affectedItems = Array();
			for (var i = 0; i < PLRecManager.Count; i++) {
				affectedItems.push(i);
			}
			PLRecManager.Purge(affectedItems);
			break;
		case (idx > 2000):
			(PLRecManager.Count >= 1) && PLRecManager.Restore(idx - 2001);
			break;
		};
		brw.repaint();
		return true;
	};
};

 
//=================================== Main ================================================================

function on_init() {
	window.DlgCode = DLGC_WANTALLKEYS;
	get_font();
	get_colors();
	get_metrics();
	get_images();
	g_active_playlist = plman.ActivePlaylist;
	g_filterbox = new oFilterBox();
	g_searchbox = new searchbox();
	g_searchbox.on_init();
	brw = new oBrowser();
	if(ppt.lockReservedPlaylist && fb.IsLibraryEnabled()) checkMediaLibrayPlaylist();
	try{
		var _radiolist = utils.ReadTextFile(fb.ProfilePath + "foobox\\config\\misc", 0);
		_radiolist = _radiolist.split("##")[0];
	}catch(e){}
	if(_radiolist && _radiolist != "null") {
		radiom3u = _radiolist.split(";");
	}
};
on_init();

// START

function on_size() {
	ww = window.Width;
	wh = window.Height;
	if (!ww || !wh) {
		ww = 1;
		wh = 1;
	};
	window.MinWidth = 1;
	window.MinHeight = 1;
	cFilterBox.w = Math.floor(ww * 0.6);
	cSearchBox.w = ww - brw.images.topbar_btn.Width * 2 - cSearchBox.x;
	// set Size of browser
	brw.setSize(0, ppt.headerBarHeight, ww - cScrollBar.width, wh - ppt.headerBarHeight);
	brw.repaint();
};

function on_paint(gr) {

	if (!ww) return;
	gr.FillSolidRect(0, 0, ww, wh, g_color_normal_bg);
	brw && brw.draw(gr);
	if(ppt.showFilter && g_filterbox.inputbox.w >25) g_filterbox.draw(gr, cFilterBox.x, cFilterBox.y, true);
	if(g_searchbox.inputbox.w >5) g_searchbox.draw(gr);
};

function on_mouse_lbtn_down(x, y) {
	// stop inertia
	if (cTouch.timer) {
		window.ClearInterval(cTouch.timer);
		cTouch.timer = false;
		// stop scrolling but not abrupt, add a little offset for the stop
		if (Math.abs(scroll - scroll_) > ppt.rowHeight) {
			scroll = (scroll > scroll_ ? scroll_ + ppt.rowHeight : scroll_ - ppt.rowHeight);
			scroll = check_scroll(scroll);
		};
	};

	var is_scroll_enabled = brw.rowsCount > brw.totalRowsVis;
	if (ppt.enableTouchControl && is_scroll_enabled) {
		if (brw._isHover(x, y) && !brw.scrollbar._isHover(x, y)) {
			if (!timers.mouseDown) {
				cTouch.y_prev = y;
				cTouch.y_start = y;
				if (cTouch.t1) {
					cTouch.t1.Reset();
				}
				else {
					cTouch.t1 = fb.CreateProfiler("t1");
				};
				timers.mouseDown = window.SetTimeout(function() {
					window.ClearTimeout(timers.mouseDown);
					timers.mouseDown = false;
					if (Math.abs(cTouch.y_start - m_y) > 015) {
						cTouch.down = true;
					}
					else {
						brw.on_mouse("down", x, y);
					};
				}, 50);
			};
		}
		else {
			brw.on_mouse("down", x, y);
		};
	}
	else {
		brw.on_mouse("down", x, y);
	};
	if(ppt.showFilter) g_filterbox.on_mouse("lbtn_down", x, y);
	g_searchbox.on_mouse("lbtn_down", x, y);
};

function on_mouse_lbtn_up(x, y) {
	if(ppt.showFilter) g_filterbox.on_mouse("lbtn_up", x, y);	
	brw.on_mouse("up", x, y);
	g_searchbox.on_mouse("lbtn_up", x, y);
	if (timers.mouseDown) {
		window.ClearTimeout(timers.mouseDown);
		timers.mouseDown = false;
		if (Math.abs(cTouch.y_start - m_y) <= 030) {
			brw.on_mouse("down", x, y);
		};
	};
	// create scroll inertia on mouse lbtn up
	if (cTouch.down) {
		cTouch.down = false;
		cTouch.y_end = y;
		cTouch.scroll_delta = scroll - scroll_;
		if (Math.abs(cTouch.scroll_delta) > 030) {
			cTouch.multiplier = ((1000 - cTouch.t1.Time) / 20);
			cTouch.delta = Math.round((cTouch.scroll_delta) / 030);
			if (cTouch.multiplier < 1) cTouch.multiplier = 1;
			if (cTouch.timer) window.ClearInterval(cTouch.timer);
			cTouch.timer = window.SetInterval(function() {
				scroll += cTouch.delta * cTouch.multiplier;
				scroll = check_scroll(scroll);
				cTouch.multiplier = cTouch.multiplier - 1;
				cTouch.delta = cTouch.delta - (cTouch.delta / 10);
				if (cTouch.multiplier < 1) {
					window.ClearInterval(cTouch.timer);
					cTouch.timer = false;
				};
			}, 75);
		};
	};
};

function on_mouse_lbtn_dblclk(x, y, mask) {
	if (y >= brw.y) {
		brw.on_mouse("dblclk", x, y);
	}
	else if (ppt.showFilter && x > brw.x && y > cSearchBox.h && y < cSearchBox.h + ppt.rowHeight) {
		brw.showActivePlaylist();
	}
};

function on_mouse_rbtn_down(x, y, mask) {
};

function on_mouse_rbtn_up(x, y) {
	if (!utils.IsKeyPressed(VK_SHIFT)) {
		if(ppt.showFilter) g_filterbox.on_mouse("rbtn_down", x, y);
		g_searchbox.on_mouse("rbtn_down", x, y);
		brw.on_mouse("right", x, y);
	};
	return true;
};

function on_mouse_move(x, y) {
	if(m_x == x && m_y == y) return;
	if (!cPlaylistManager.drag_moved) {
		if(ppt.showFilter) g_filterbox.on_mouse("move", x, y);
		g_searchbox.on_mouse("move", x, y);
	};
	if (cTouch.down) {
		cTouch.y_current = y;
		cTouch.y_move = (cTouch.y_current - cTouch.y_prev);
		if (x < brw.w) {
			scroll -= cTouch.y_move;
			cTouch.scroll_delta = scroll - scroll_;
			if (Math.abs(cTouch.scroll_delta) < 030) cTouch.y_start = cTouch.y_current;
			cTouch.y_prev = cTouch.y_current;
		};
	}
	else brw.on_mouse("move", x, y);
	m_x = x;
	m_y = y;
};

function on_mouse_wheel(step) {
	if (cTouch.timer) {
		window.ClearInterval(cTouch.timer);
		cTouch.timer = false;
	};
	if (brw.rowsCount >0) {
		var g_start_y = brw.rows[g_start_].y;
		if(g_start_ && g_start_y) {
			var voffset = g_start_y - ppt.rowHeight - ppt.headerBarHeight;
			scroll -= step * ppt.rowHeight * (ppt.rowScrollStep - step/Math.abs(step)) - voffset;
		}
		else scroll -= step * ppt.rowHeight * ppt.rowScrollStep;
		scroll = check_scroll(scroll);
	}
};

function on_mouse_leave() {
	if(ppt.showFilter) g_filterbox.on_mouse("leave", 0, 0);
	g_searchbox.on_mouse("leave");
	brw.on_mouse("leave", 0, 0);
};

//=================================================// Metrics & Fonts & Colors & Images

function get_metrics() {
	cScrollBar.minCursorHeight = 25*zdpi;
	if(sys_scrollbar){
		cScrollBar.width = get_system_scrollbar_width();
		cScrollBar.maxCursorHeight = 125*zdpi;
	}else{
		cScrollBar.width = 12*zdpi;
		cScrollBar.maxCursorHeight = 110*zdpi;
	}
	ppt.rowHeight = Math.round(ppt.defaultRowHeight * zdpi);
	ppt.SearchBarHeight = z(26) + 2;
	ppt.headerBarHeight = ppt.SearchBarHeight + (ppt.showFilter ? ppt.rowHeight : 0);
	cFilterBox.h = Math.min(ppt.rowHeight, z(20));
	cFilterBox.y = Math.round(ppt.SearchBarHeight + (ppt.rowHeight - cFilterBox.h)/2);
	cSearchBox.h = 22 * zdpi;
	cSearchBox.y = Math.round((ppt.SearchBarHeight - cSearchBox.h)/2);
};

function playlistName2icon(name, auto_playlist, playing_playlist) {
	if (playing_playlist && !dark_mode) {
		if (auto_playlist){
			if (name == "Library") return images.library_icon_hl;
			if (name == "Recently added") return images.newly_added_icon_hl;
			if (name == "History") return images.history_icon_hl;
			if (name == "Played often") return images.most_played_icon_hl;
			if (name == "Favorites") return images.mood_icon_hl;
			else return images.icon_auto_pl_hl;
		}else{
			if (name.substr(0, 5) == "Radio") return images.radios_icon_hl;
			else if(name.substr(0, 14) == "Internet Radio") return images.radios_icon_hl;
			else return images.icon_normal_pl_playing_hl;
		}
	} else {
		if (auto_playlist){
			if (name == "Library") return images.library_icon;
			if (name == "Recently added") return images.newly_added_icon;
			if (name == "History") return images.history_icon;
			if (name == "Played often") return images.most_played_icon;
			if (name == "Favorites") return images.mood_icon;
			else return images.icon_auto_pl;
		} else{
			if (name.substr(0, 5) == "Radio") return images.radios_icon;
			else if(name.substr(0, 14) == "Internet Radio") return images.radios_icon;
			else return images.icon_normal_pl;
		}
	}
}

function get_images() {
	var gb, mood_font = GdiFont("Segoe UI", Math.round(g_font.Size*1.5), 0);
	var imgw = Math.floor(27*zdpi), imgh = Math.floor(25*zdpi);
	var x2 = Math.floor(2*zdpi), x3 = Math.ceil(3*zdpi), _x5 = 5*zdpi, _x7 = 7*zdpi, _x8 = 8*zdpi, _x9 = 9*zdpi, _x10 = 10*zdpi, _x11 = 11*zdpi, _x12 = 12*zdpi, 
			_x13 = 13*zdpi, _x14 = 14*zdpi, _x15 = 15*zdpi, _x16 = 16*zdpi, _x18 = 18*zdpi, _x19 = 19*zdpi;
	let x8 = Math.round(_x8), x7 = Math.round(_x7), x14 = Math.round(_x14), x19 = Math.round(_x19);
	
	images.newplaylist_img = gdi.CreateImage(_x10, _x10);
		gb = images.newplaylist_img.GetGraphics();
		gb.FillSolidRect(1, Math.floor(_x10/2), Math.floor(_x10), 1, g_color_normal_txt);
		gb.FillSolidRect(Math.floor(_x10/2), 1, 1, Math.floor(_x10), g_color_normal_txt);
	images.newplaylist_img.ReleaseGraphics(gb);
		
	images.add_menu = gdi.CreateImage(x14, x14);
		gb = this.images.add_menu.GetGraphics();
		var point_arr = new Array(3*zdpi,Math.floor(_x5),_x11,Math.floor(_x5),_x7,_x10);
		gb.SetSmoothingMode(2);
		gb.DrawPolygon(g_color_normal_txt,1,point_arr);
		gb.SetSmoothingMode(0);
	images.add_menu.ReleaseGraphics(gb);
		
	images.icon_normal_pl = gdi.CreateImage(imgw, imgh);
	gb = images.icon_normal_pl.GetGraphics();
	
	gb.DrawLine(_x8, _x8, _x19, _x8, 1, g_color_normal_txt);
	gb.DrawLine(_x8, _x8+x3, 17*zdpi, _x8+x3, 1, g_color_normal_txt);
	gb.DrawLine(_x8, _x8+x3*2, _x19, _x8+x3*2, 1, g_color_normal_txt);
	gb.DrawLine(_x8, _x8+x3*3, _x18, _x8+x3*3, 1, g_color_normal_txt);
	images.icon_normal_pl.ReleaseGraphics(gb);

	images.icon_normal_pl_playing = gdi.CreateImage(imgw, imgh);
	gb = images.icon_normal_pl_playing.GetGraphics();
	gb.DrawLine(_x8, _x11, _x8, _x18, 1, g_color_normal_txt);
	gb.DrawLine(_x8+x3, _x7, _x8+x3, _x18, 1, g_color_normal_txt);
	gb.DrawLine(_x8+x3*2, _x13, _x8+x3*2, _x18, 1, g_color_normal_txt);
	gb.DrawLine(_x8+x3*3, _x9, _x8+x3*3, _x18, 1, g_color_normal_txt);
	images.icon_normal_pl_playing.ReleaseGraphics(gb);

	images.icon_auto_pl = gdi.CreateImage(imgw, imgh);
	gb = images.icon_auto_pl.GetGraphics();
	gb.DrawLine(_x8, _x8, _x16, _x8, 1, g_color_normal_txt);
	gb.DrawLine(_x8, _x8+x3, _x15, _x8+x3, 1, g_color_normal_txt);
	gb.DrawLine(_x8, _x8+x3*2, _x12, _x8+x3*2, 1, g_color_normal_txt);
	gb.DrawLine(_x8, _x8+x3*3, _x12, _x8+x3*3, 1, g_color_normal_txt);
	gb.DrawLine(18.3*zdpi, _x9, 18.3*zdpi, 17*zdpi, 1, g_color_normal_txt);
	gb.SetSmoothingMode(2)
	gb.DrawEllipse(_x14, _x15, 4*zdpi, 4*zdpi, 1, g_color_normal_txt);
	gb.SetSmoothingMode(0)
	images.icon_auto_pl.ReleaseGraphics(gb);

	images.history_icon = gdi.CreateImage(imgw, imgh);
	gb = images.history_icon.GetGraphics();
	gb.DrawRect(x7, x7, Math.round(_x12), Math.round(_x10), 1, g_color_normal_txt);
	gb.DrawLine(Math.round(_x10), Math.ceil(_x5), Math.round(_x10), Math.floor(_x9), 1, g_color_normal_txt);
	gb.DrawLine(x7+Math.round(_x9), Math.ceil(_x5),x7+Math.round(_x9), Math.floor(_x9), 1, g_color_normal_txt);
	gb.DrawLine(x7, Math.ceil(_x11), x7+Math.round(_x12), Math.ceil(_x11), 1, g_color_normal_txt);
	images.history_icon.ReleaseGraphics(gb);
	
	images.library_icon = gdi.CreateImage(imgw, imgh);
	gb = images.library_icon.GetGraphics();
	gb.DrawRect(x8, x7, Math.round(_x12)-1, x2*6, 1, g_color_normal_txt);
	gb.DrawLine(x8+x2, x7+x2, x14, x7+x2, 1, g_color_normal_txt);gb.DrawLine(_x16, x7+x2, x19-x2, x7+x2, 1, g_color_normal_txt);
	gb.DrawLine(x8, x7+x2*2, x19, x7+x2*2, 1, g_color_normal_txt);
	gb.DrawLine(x8+x2, x7+x2*3, x14, x7+x2*3, 1, g_color_normal_txt);gb.DrawLine(_x16, x7+x2*3, x19-x2, x7+x2*3, 1, g_color_normal_txt);
	gb.DrawLine(x8, x7+x2*4, x19, x7+x2*4, 1, g_color_normal_txt);
	gb.DrawLine(x8+x2, x7+x2*5, x14, x7+x2*5, 1, g_color_normal_txt);gb.DrawLine(_x16, x7+x2*5, x19-x2, x7+x2*5, 1, g_color_normal_txt);
	images.library_icon.ReleaseGraphics(gb);

	images.newly_added_icon = gdi.CreateImage(imgw, imgh);
	gb = images.newly_added_icon.GetGraphics();
	gb.DrawLine(_x8, _x8, _x19, _x8, 1, g_color_normal_txt);
	gb.DrawLine(_x8, _x8+x3, _x15, _x8+x3, 1, g_color_normal_txt);
	gb.DrawLine(_x8, _x8+x3*2, _x13, _x8+x3*2, 1, g_color_normal_txt);
	gb.DrawLine(_x8, _x8+x3*3, _x13, _x8+x3*3, 1, g_color_normal_txt);
	gb.DrawLine(_x18, _x13, _x18, _x18, 1, g_color_normal_txt);
	gb.DrawLine(_x15, _x15, 20*zdpi, _x15, 1, g_color_normal_txt);
	images.newly_added_icon.ReleaseGraphics(gb);

	var point_arr2 = new Array(x7, Math.round(_x11), (x7+Math.round(_x18))/2, 6*zdpi, Math.round(_x18), Math.round(_x11), Math.round(_x15), Math.round(_x11), Math.round(_x15), Math.floor(_x18), Math.round(_x10), Math.floor(_x18), Math.round(_x10), Math.round(_x11));
	images.most_played_icon = gdi.CreateImage(imgw, imgh);
	gb = images.most_played_icon.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawPolygon(g_color_normal_txt,1,point_arr2);
	gb.SetSmoothingMode(0);
	gb.DrawLine(x7, Math.floor(_x18), Math.round(_x18), Math.floor(_x18), 1, g_color_normal_txt);
	images.most_played_icon.ReleaseGraphics(gb);
	
	images.radios_icon = gdi.CreateImage(imgw, imgh);
	gb = images.radios_icon.GetGraphics();
	gb.DrawLine(_x12, _x12, _x12, Math.floor(_x19), 1, g_color_normal_txt);
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(_x10, _x8, 4*zdpi, 4*zdpi, 1, g_color_normal_txt);
	gb.DrawEllipse(_x7, _x5, _x10, _x10, 1, g_color_normal_txt);
	gb.SetSmoothingMode(0);
	images.radios_icon.ReleaseGraphics(gb);
	
	images.mood_icon = gdi.CreateImage(imgw, imgh);
	gb = images.mood_icon.GetGraphics();
	gb.SetTextRenderingHint(4);
	gb.DrawString("♡", mood_font, g_color_normal_txt, 0, 0, imgw, imgh, cc_stringformat);
	gb.SetTextRenderingHint(0);
	images.mood_icon.ReleaseGraphics(gb);

	if (dark_mode) return;

	images.icon_normal_pl_playing_hl = gdi.CreateImage(imgw, imgh);
	gb = images.icon_normal_pl_playing_hl.GetGraphics();
	gb.DrawLine(_x8, _x11, _x8, _x18, 1, g_color_playing_txt);
	gb.DrawLine(_x8+x3, _x7, _x8+x3, _x18, 1, g_color_playing_txt);
	gb.DrawLine(_x8+x3*2, _x13, _x8+x3*2, _x18, 1, g_color_playing_txt);
	gb.DrawLine(_x8+x3*3, _x9, _x8+x3*3, _x18, 1, g_color_playing_txt);
	images.icon_normal_pl_playing_hl.ReleaseGraphics(gb);

	images.icon_auto_pl_hl = gdi.CreateImage(imgw, imgh);
	gb = images.icon_auto_pl_hl.GetGraphics();
	gb.DrawLine(_x8, _x8, _x16, _x8, 1, g_color_playing_txt);
	gb.DrawLine(_x8, _x8+x3, _x15, _x8+x3, 1, g_color_playing_txt);
	gb.DrawLine(_x8, _x8+x3*2, _x12, _x8+x3*2, 1, g_color_playing_txt);
	gb.DrawLine(_x8, _x8+x3*3, _x12, _x8+x3*3, 1, g_color_playing_txt);
	gb.DrawLine(_x18, _x8, _x18, _x14, 1, g_color_playing_txt);
	gb.SetSmoothingMode(2)
	gb.DrawEllipse(_x14, _x13, 4*zdpi, 4*zdpi, 1, g_color_playing_txt);
	gb.SetSmoothingMode(0)
	images.icon_auto_pl_hl.ReleaseGraphics(gb);
	
	images.history_icon_hl = gdi.CreateImage(imgw, imgh);
	gb = images.history_icon_hl.GetGraphics();
	gb.DrawRect(x7, x7, Math.round(_x12), Math.round(_x10), 1, g_color_playing_txt);
	gb.DrawLine(Math.round(_x10), Math.ceil(_x5), Math.round(_x10), Math.floor(_x9), 1, g_color_playing_txt);
	gb.DrawLine(x7+Math.round(_x9), Math.ceil(_x5),x7+Math.round(_x9), Math.floor(_x9), 1, g_color_playing_txt);
	gb.DrawLine(x7, Math.ceil(_x11), x7+Math.round(_x12), Math.ceil(_x11), 1, g_color_playing_txt);
	images.history_icon_hl.ReleaseGraphics(gb);

	images.library_icon_hl = gdi.CreateImage(imgw, imgh);
	gb = images.library_icon_hl.GetGraphics();
	gb.DrawRect(_x8, _x7, Math.floor(_x11), x2*6, 1, g_color_playing_txt);
	gb.DrawLine(_x8+x2, _x7+x2, _x14, _x7+x2, 1, g_color_playing_txt);gb.DrawLine(_x16, _x7+x2, _x16+1, _x7+x2, 1, g_color_playing_txt);
	gb.DrawLine(_x8, _x7+x2*2, _x19, _x7+x2*2, 1, g_color_playing_txt);
	gb.DrawLine(_x8+x2, _x7+x2*3, _x14, _x7+x2*3, 1, g_color_playing_txt);gb.DrawLine(_x16, _x7+x2*3, _x16+1, _x7+x2*3, 1, g_color_playing_txt);
	gb.DrawLine(_x8, _x7+x2*4, _x19, _x7+x2*4, 1, g_color_playing_txt);
	gb.DrawLine(_x8+x2, _x7+x2*5, _x14, _x7+x2*5, 1, g_color_playing_txt);gb.DrawLine(_x16, _x7+x2*5, _x16+1, _x7+x2*5, 1, g_color_playing_txt);
	images.library_icon_hl.ReleaseGraphics(gb);
	
	images.newly_added_icon_hl = gdi.CreateImage(imgw, imgh);
	gb = images.newly_added_icon_hl.GetGraphics();
	gb.DrawLine(_x8, _x8, _x19, _x8, 1, g_color_playing_txt);
	gb.DrawLine(_x8, _x8+x3, _x15, _x8+x3, 1, g_color_playing_txt);
	gb.DrawLine(_x8, _x8+x3*2, _x13, _x8+x3*2, 1, g_color_playing_txt);
	gb.DrawLine(_x8, _x8+x3*3, _x13, _x8+x3*3, 1, g_color_playing_txt);
	gb.DrawLine(_x18, _x13, _x18, _x18, 1, g_color_playing_txt);
	gb.DrawLine(_x15, _x15, 20*zdpi, _x15, 1, g_color_playing_txt);
	images.newly_added_icon_hl.ReleaseGraphics(gb);

	images.most_played_icon_hl = gdi.CreateImage(imgw, imgh);
	gb = images.most_played_icon_hl.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawPolygon(g_color_playing_txt,1,point_arr2);
	gb.SetSmoothingMode(0);
	gb.DrawLine(x7, Math.floor(_x18), Math.round(_x18), Math.floor(_x18), 1, g_color_playing_txt);
	images.most_played_icon_hl.ReleaseGraphics(gb);
	
	images.radios_icon_hl = gdi.CreateImage(imgw, imgh);
	gb = images.radios_icon_hl.GetGraphics();
	gb.DrawLine(_x12, _x12, _x12, Math.floor(_x19), 1, g_color_playing_txt);
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(_x10, _x8, 4*zdpi, 4*zdpi, 1, g_color_playing_txt);
	gb.DrawEllipse(_x7, _x5, _x10, _x10, 1, g_color_playing_txt);
	gb.SetSmoothingMode(0);
	images.radios_icon_hl.ReleaseGraphics(gb);
	
	images.mood_icon_hl = gdi.CreateImage(imgw, imgh);
	gb = images.mood_icon_hl.GetGraphics();
	gb.SetTextRenderingHint(4);
	gb.DrawString("♡", mood_font, g_color_playing_txt, 0, 0, imgw, imgh, cc_stringformat);
	gb.SetTextRenderingHint(0);
	images.mood_icon_hl.ReleaseGraphics(gb);
};

function get_font() {
	g_font = window.GetFontDUI(FontTypeDUI.playlists);
	zdpi = g_font.Size / 12;
	g_font_b = GdiFont(g_font.Name, g_font.Size, 1);
	g_track_size = Math.max(10, g_font.Size - 2);
	g_font_track = GdiFont(g_font.Name, g_track_size, g_font.Style);
};

function get_colors() {
	g_color_normal_txt = window.GetColourDUI(ColorTypeDUI.text);
	g_color_selected_txt = g_color_normal_txt;
	g_color_normal_bg_default = window.GetColourDUI(ColorTypeDUI.background);
	g_color_normal_bg = g_color_normal_bg_default;
	g_color_bt_overlay = g_color_normal_txt & 0x35ffffff;
	g_scroll_color = g_color_normal_txt & 0x95ffffff;
	g_color_selected_bg_default = window.GetColourDUI(ColorTypeDUI.selection);
	g_color_selected_bg = g_color_selected_bg_default;
	c_default_hl = window.GetColourDUI(ColorTypeDUI.highlight);
	g_color_highlight = c_default_hl;
	if(isDarkMode(g_color_normal_bg)){
		dark_mode = 1;
		g_color_topbar = RGBA(0, 0, 0, 30);
		g_color_line = RGBA(0, 0, 0, 25);
		g_color_line_div = RGBA(0, 0, 0, 55);
	}else{
		dark_mode = 0;
		g_color_topbar = RGBA(0, 0, 0, 15);
		g_color_line = RGBA(0, 0, 0, 18);
		g_color_line_div = RGBA(0, 0, 0, 45);
	}
};

function on_script_unload() {
	brw.g_time && window.ClearInterval(brw.g_time);
	brw.g_time = false;
};

//=================================================// Keyboard Callbacks

function on_key_up(vkey) {
	if(ppt.showFilter) g_filterbox.on_key("up", vkey);
	g_searchbox.on_key("up", vkey);
	// scroll keys up and down RESET (step and timers)
	cScrollBar.timerCounter = -1;
	if(cScrollBar.timerID){
		window.ClearTimeout(cScrollBar.timerID);
		cScrollBar.timerID = false;
		brw.repaint();
	}
};

function on_key_down(vkey) {
	var mask = GetKeyboardMask();
	if (brw.inputboxID >= 0) {
		if (mask == KMask.none) {
			switch (vkey) {
			case VK_ESCAPE:
			case 222:
				brw.inputboxID = -1;
				window.SetCursor(IDC_ARROW);
				brw.repaint();
				break;
			default:
				brw.inputbox.on_key_down(vkey);
			};
		} else {
			brw.inputbox.on_key_down(vkey);
		}
	} else {
		if(ppt.showFilter) g_filterbox.on_key("down", vkey);
		g_searchbox.on_key("down", vkey);

		if (mask == KMask.none) {
			switch (vkey) {
			case VK_F2:
				if (brw.rowsCount > 0) {
					var rowId = brw.activeRow;
					if (rowId > (ppt.lockReservedPlaylist ? 0 : -1)) {
						brw.callRename(rowId, brw.rows[rowId].idx);
					};
				}
				break;
			case VK_F3:
				brw.showActivePlaylist();
				break;
			case VK_F5:
				brw.repaint();
				break;
			case VK_ESCAPE:
			case 222:
				brw.inputboxID = -1;
				break;
			case VK_UP:
				if (brw.rowsCount > 0) {
					if (ppt.showFilter && g_filterbox.inputbox.edit) return;
					var rowId = brw.activeRow;
					if (rowId > 0) {
						if (brw.inputboxID > -1) brw.inputboxID = -1;
						brw.activeRow--;
						if (brw.activeRow < 0) brw.activeRow = 0;
						brw.showActiveRow();
					};
				};
				break;
			case VK_DOWN:
				if (brw.rowsCount > 0) {
					if (ppt.showFilter && g_filterbox.inputbox.edit) return;
					var rowId = brw.activeRow;
					if (rowId < brw.rowsCount - 1) {
						if (brw.inputboxID > -1) brw.inputboxID = -1;
						brw.activeRow++;
						if (brw.activeRow > brw.rowsCount - 1) brw.activeRow = brw.rowsCount - 1;
						brw.showActiveRow();
					};
				};
				break;
			case VK_RETURN:
				if (brw.rowsCount > 0) {
					if (ppt.showFilter && g_filterbox.inputbox.edit) return;
					if (g_searchbox.inputbox.edit) return;
					if(brw.activeRow > -1) {
						plman.ActivePlaylist = brw.rows[brw.activeRow].idx;
						brw.actionRows.splice(0, brw.actionRows.length);
					}
				};
				break;
			case VK_PGUP:
				if (cTouch.timer) {
					window.ClearInterval(cTouch.timer);
					cTouch.timer = false;
				};
				scroll -= brw.totalRowsVis * ppt.rowHeight;
				scroll = check_scroll(scroll);
				break;
			case VK_PGDN:
				if (cTouch.timer) {
					window.ClearInterval(cTouch.timer);
					cTouch.timer = false;
				};
				if (brw.rowsCount >0){
					var g_start_y = brw.rows[g_start_].y;
					var voffset = g_start_y - ppt.headerBarHeight;
					scroll += ppt.rowHeight * (brw.totalRowsVis - 1) - voffset;
					scroll = check_scroll(scroll);
				}
				break;
			case VK_END:
				if (brw.rowsCount > 0) {
					if (ppt.showFilter && g_filterbox.inputbox.edit) return;
					if (brw.inputboxID > -1) brw.inputboxID = -1;
					brw.activeRow = brw.rowsCount - 1;
					brw.showActiveRow();
				};
				break;
			case VK_HOME:
				if (brw.rowsCount > 0) {
					if (ppt.showFilter && g_filterbox.inputbox.edit) return;
					if (brw.inputboxID > -1) brw.inputboxID = -1;
					brw.activeRow = 0;
					brw.showActiveRow();
				};
				break;
			case VK_DELETE:
				if(ppt.showFilter && g_filterbox.inputbox.edit) return;
				if (brw.rowsCount > 0) {
					if(!brw.actionRows.length && brw.activeRow > -1) brw.actionRows.push(brw.activeRow);
					if(ppt.confirmRemove){
						DeletePlaylist();
					} else {
						for(var i = 0; i < brw.actionRows.length; i++){
							var cidx = brw.rows[brw.actionRows[i]].idx - i;
							plman.RemovePlaylistSwitch(cidx);
						}
					}
					brw.actionRows.splice(0, brw.actionRows.length);
				}
				break;
			}
		} else if (mask == KMask.alt) {
			if(vkey == 115) fb.RunMainMenuCommand("File/Exit");
		} else if (mask == KMask.ctrl) {
			if(vkey == 65) { // CTRL+A
				brw.actionRows.splice(0, brw.actionRows.length);
				for(var i = 0; i < brw.rows.length; i++){
					if(!brw.rows[i].islocked) brw.actionRows.push(i);
				}
				brw.repaint();
			}
		}
	};
};

function on_char(code) {
	// rename inputbox
	if (brw.inputboxID >= 0) {
		brw.inputbox.on_char(code);
	}
	else {
		if(ppt.showFilter) g_filterbox.on_char(code);
		g_searchbox.on_char(code);
	};
};

//=================================================// Playlist Callbacks
var playing_pl = null;
function on_playback_new_track(metadb) {
	if(playing_pl != plman.PlayingPlaylist) {
		playing_pl = plman.PlayingPlaylist;
		window.Repaint();
	}
};
function on_playback_stop() {
	playing_pl = null;
	window.Repaint();
}

function on_playlists_changed() {
	if (cPlaylistManager.drag_droped) {
		window.SetCursor(IDC_ARROW);
	}
	else {
		if (ppt.showFilter && (brw.previous_playlistCount != plman.PlaylistCount)) g_filterbox.clearInputbox();
	};
	brw.populate(false, false);
	brw.repaint();
};

function on_playlist_switch() {
	g_active_playlist = plman.ActivePlaylist;
	brw.showActivePlaylist();
	brw.repaint();
};

function on_playlist_items_added(playlist_idx) {
	brw.repaint();
};

function on_playlist_items_removed(playlist_idx, new_count) {
	brw.repaint();
};

function on_focus(is_focused) {
	g_searchbox.on_focus(is_focused);
	if(ppt.showFilter) g_filterbox.on_focus(is_focused);
	if (brw.inputboxID >= 0) {
		brw.inputbox.on_focus(is_focused, true);
	};
	if (!is_focused) {
		brw.inputboxID = -1;
		//brw.repaint();
	};
};

//=================================================// Custom functions

function match(input, str) {
	var temp = "";
	input = input.toLowerCase();
	for (var j in str) {
		if (input.indexOf(str[j]) < 0) return false;
	};
	return true;
};

function process_string(str) {
	str_ = [];
	str = str.toLowerCase();
	while (str != (temp = str.replace("  ", " ")))
	str = temp;
	var str = str.split(" ").sort();
	for (var i in str) {
		if (str[i] != "") str_[str_.length] = str[i];
	};
	return str_;
};

function checkMediaLibrayPlaylist() {
	// check if library playlist is present
	var isMediaLibraryFound = false;
	var total = plman.PlaylistCount;
	for (var i = 0; i < total; i++) {
		if (plman.GetPlaylistName(i) == "Library") {
			var mediaLibraryIndex = i;
			isMediaLibraryFound = true;
			break;
		};
	};
	if (!isMediaLibraryFound) {
		plman.CreateAutoPlaylist(total, "Library", "%path% PRESENT", default_sort, 0);
		// Move it to the top
		plman.MovePlaylist(total, 0);
	}
	else if (mediaLibraryIndex > 0) {
		// Always move it to the top
		plman.MovePlaylist(mediaLibraryIndex, 0);
	};
};

function check_scroll(scroll___) {
	if (scroll___ < 0) scroll___ = 0;
	var end_limit = (brw.rowsCount * ppt.rowHeight) - brw.scrollbar.totalRowsVish;
	if (scroll___ != 0 && scroll___ > end_limit) {
		scroll___ = end_limit;
	};
	if (scroll___ == 1) scroll___ = 0;
	return scroll___;
};

function g_sendResponse() {
	if (g_filterbox.inputbox.text.length == 0) {
		filter_text = "";
	}
	else {
		filter_text = g_filterbox.inputbox.text;
	};
	// filter in current panel
	brw.actionRows.splice(0, brw.actionRows.length);
	brw.populate(true);
};

function on_font_changed() {
	get_font();
	get_metrics();
	g_searchbox.inputbox.FontUpdte();
	g_searchbox.getImages();
	get_images();
	brw.getImages();
	g_filterbox.inputbox.FontUpdte();
	g_filterbox.getImages();
	cSearchBox.w = ww - brw.images.topbar_btn.Width * 2 - cSearchBox.x;
	brw.setSize(0, ppt.headerBarHeight, ww - cScrollBar.width, wh - ppt.headerBarHeight);
	brw.repaint();
};

function on_colours_changed() {
	get_colors();
	g_searchbox.getImages();
	g_searchbox.reset_colors();
	get_images();
	brw.getImages();
	if (brw)
		brw.scrollbar.setNewColors();
	g_filterbox.getImages();
	g_filterbox.reset_colors();
	brw.repaint();
};

function on_notify_data(name, info) {
	switch (name) {
	case "color_scheme_updated":
		if(!info) {
			g_color_highlight = c_default_hl;
			g_color_normal_bg = g_color_normal_bg_default;
			g_color_selected_bg = g_color_selected_bg_default;
		} else {
			g_color_highlight = RGB(info[0], info[1], info[2]);
			if(info.length > 3) {
				g_color_normal_bg = RGB(info[3], info[4], info[5]);
				g_color_selected_bg = RGB(info[6], info[7], info[8]);
			}
		}
		brw.repaint();
		break;
	case "lock_lib_playlist":
		if (ppt.lockReservedPlaylist == info) break;
		ppt.lockReservedPlaylist = info;
		window.SetProperty("_PROPERTY: Lock Reserved Playlist", ppt.lockReservedPlaylist);
		if (ppt.lockReservedPlaylist) checkMediaLibrayPlaylist();
		brw.actionRows.splice(0, brw.actionRows.length);
		brw.populate(true, false);
		break;
	case "scrollbar_width":
		sys_scrollbar = info;
		window.SetProperty("foobox.ui.scrollbar.system", sys_scrollbar);
		cScrollBar.width = sys_scrollbar ? get_system_scrollbar_width() : 12*zdpi;
		cScrollBar.maxCursorHeight = sys_scrollbar ? 125*zdpi : 110*zdpi;
		get_metrics();
		brw.scrollbar.updateScrollbar();
		brw.scrollbar.setSize();
		brw.setSize(0, ppt.headerBarHeight, ww - cScrollBar.width, wh - ppt.headerBarHeight);
		brw.repaint();
		break;
	case "ScrollStep":
		ppt.rowScrollStep = info;
		window.SetProperty("_PROPERTY: Scroll Step", ppt.rowScrollStep);
		break;
	case "Radio_list":
		radiom3u.splice(0, radiom3u.length);
		if(info && info != "null") {
			radiom3u = info.split(";");
		}
		break;
	case "row_height_changed":
		ppt.defaultRowHeight = info;
		window.SetProperty("_PROPERTY: Row Height", ppt.defaultRowHeight),
		get_metrics();
		brw.setSize(0, ppt.headerBarHeight, ww - cScrollBar.width, wh - ppt.headerBarHeight);
		brw.repaint();
		break;
	}
};

//=================================================// Drag'n'Drop Callbacks

function on_drag_enter() {
	g_dragndrop_status = true;
};

function on_drag_leave() {
	g_dragndrop_status = false;
	g_dragndrop_trackId = -1;
	g_dragndrop_rowId = -1;
	g_dragndrop_targetPlaylistId = -1;
	brw.buttonClicked = false;
	cScrollBar.timerID && window.ClearInterval(cScrollBar.timerID);
	cScrollBar.timerID = false;
	brw.repaint();
};

function on_drag_over(action, x, y, mask) {
	if (x == g_dragndrop_x && y == g_dragndrop_y) return true;
	g_dragndrop_trackId = -1;
	g_dragndrop_rowId = -1;
	g_dragndrop_targetPlaylistId = -1;
	g_dragndrop_bottom = false;
	brw.on_mouse("drag_over", x, y);
	brw.repaint();
	g_dragndrop_x = x;
	g_dragndrop_y = y;
};

function on_drag_drop(action, x, y, mask) {
	if (y < ppt.headerBarHeight) {
		action.Effect = 0;
	} else {
		var drop_done = false;
		if (g_dragndrop_targetPlaylistId == -1) {
			// blank area, drop to new playlist
			drop_done = true;
			var total_pl = plman.PlaylistCount;
			plman.CreatePlaylist(total_pl, "Dragged Items");
			action.Playlist = total_pl;
			action.Base = plman.PlaylistItemCount(total_pl);
			action.ToSelect = plman.PlaylistCount == 1; // switch to and set focus if only playlist
			action.Effect = 1;
		} else if (g_dragndrop_targetPlaylistId == -2 || plman.IsPlaylistLocked(g_dragndrop_targetPlaylistId)) {
			// mouse over an existing playlist but can't drop there
			action.Effect = 0;
			fb.ShowPopupMessage("  Error Message\n----------------\nTarget playlist is autoplaylist or is locked, unable to add track manually.", "Action not allowed");
		} else {
			// drop to an existing playlist
			drop_done = true;
			action.Playlist = g_dragndrop_targetPlaylistId;
			action.Base = plman.PlaylistItemCount(g_dragndrop_targetPlaylistId);
			action.ToSelect = false;
			action.Effect = 1;
		}
		if (drop_done) {
			if (!blink.timer) {
				blink.x = x;
				blink.y = y;
				blink.totaltracks = 1;
				blink.id = brw.activeRow;
				blink.counter = 0;
				blink.timer = window.SetInterval(function () {
					blink.counter++;
					if (blink.counter > 5) {
						blink.timer && window.ClearInterval(blink.timer);
						blink.timer = false;
						blink.counter = -1;
						blink.id = null;
					};
					brw.repaint();
				}, 125);
			}
		}
	}
	g_dragndrop_status = false;
	brw.repaint();
};