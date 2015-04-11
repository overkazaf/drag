(function (window, $, undefined){
	window.Drag = Drag;
	function Drag (opts) {
		if (this instanceof Drag ) {
			var defaults = {
				handler : ".drag-header",
				container : "#testDiv", 
				fixBorder : true
			};
			this.op = $.extend({}, defaults, opts);
			this.origin = {};
			this.prepare();
		} else {
			return new Drag(opts);
		}
	}

	Drag.prototype = {
		prepare : function (){
			var _this = this;
			_this.containerW = $(_this.op.container).width();
			_this.containerH = $(_this.op.container).height();
			log(_this.containerW);
			log(_this.containerH);
			_this.obj = $(_this.op.container).get(0);
			_this.handler = $(_this.obj).find(_this.op.handler);
			_this.onstart();
		}, 
		onstart : function (){
			var _this = this;
			var handler = _this.handler;
			
			handler.on('mousedown',function (e){
				var e = e || window.event;
				_this.origin = {
					"x" : e.clientX,
					"y" : e.clientY
				};

				log('========//////////////===========');
				var o = _this.obj;
				var exy = {
					x : getStyle(o, 'left'),
					y : getStyle(o, 'top')
				}
				_this.obj.x = parseInt(exy.x);
				_this.obj.y = parseInt(exy.y);

				$(document).on('mousemove', function(){_this.ondrag.apply(_this);});
				$(document).on('mouseup', function (){_this.onstop.apply(_this);});
			});

			return false;
		},
		ondrag : function (e){
			var _this = this;
			var e = e || window.event;
			var xy = {
				x : e.clientX,
				y : e.clientY
			};

			_this.currentX = xy.x;
			_this.currentY = xy.y;
			
			var incX = _this.currentX - _this.origin.x;
			var incY = _this.currentY - _this.origin.y;
			var preX = _this.obj.x + incX;
			var preY = _this.obj.y + incY;
			if (_this.op.fixBorder) {
				if (preX < 10)
					preX = 10;
				var fixX = fixY = 10;
				if (preX + _this.containerW + 20 > $(window).width())
				{
					fixX = $(window).width() - _this.containerW - 20;
					fixX = fixX > 10 ? fixX : 10;
					preX = fixX;
				}
					
				if (preY < 10)
					preY = 10;

				if (preY + _this.containerH + 20 > $(window).height())
				{
					var fixY = $(window).height() - _this.containerH - 20;
					fixY = fixY > 10 ? fixY : 10;
					preY = fixY;
				}

			}
			var targetX = preX + "px";
			var targetY = preY + "px";
			setStyle(_this.obj,{'left':targetX, 'top':targetY});
		},
		onstop : function (e){
			$(document).off('mousemove');
			$(document).off('mouseup');
		},
		refresh : function (){
			var _this = this;
			window.onresize = function (){
				throttle(_this.obj,function (){
					var o = _this.obj;
					var exy = {
						x : parseInt(getStyle(o, 'left')),
						y : parseInt(getStyle(o, 'top'))
					};
					var ewh = {
						w : $(o).width(),
						h : $(o).height()
					}
					if(exy.x + ewh.w > $(window).width()){
						setStyle(o,{'left':$(window).width() - ewh.w});
					}
				});
			}
		}
	};

	function throttle (obj, fn) {
		clearTimeout(obj.timerId);
		obj.timerId = setTimeout(function (){
			fn.apply(obj);
		}, 0);
	}
	function getStyle (elem, name) {
		if (elem.style[name]) {
			return elem.style[name];
		} else if (elem.currentStyle) {
			return elem.currentStyle[name];
		} else if (document.defaultView && document.defaultView.getComputedStyle) {
			name = name.replace(/([A-Z])/g, "-$1");
			name = name.toLowerCase();

			var s = document.defaultView.getComputedStyle(elem, "");
			return s && s.getPropertyValue(name);
		} else {
			return null;
		}
	}
	function setStyle (obj, json) {
		for (var attr in json) {
			obj.style[attr] = json[attr];
		}
	}
	function addEvent (element, type, handler) {
		if (!handler.$$guid) handler.$$guid = addEvent.guid++;

		if (!element.events) element.events = {};

		var handlers = element.events[type];
		if (!handlers) {
			handlers = element.events[type] = {};
			if (element["on" + type]) {
				handlers[0] = element["on" + type];
			}
		}

		handlers[handler.$$guid] = handler;

		element["on" + type] = handleEvent;
	}
	addEvent.guid = 1;
	function removeEvent (element, type, handler) {
		if (element.events && element.events[type]) {
			delete element.events[type][handler.$$guid];
		}
	}
	return Drag;
})(window, $);

window.debug = true;
function log (k, v) {
	if (window.debug) {
		console && console.log && (v ? console.log(k, v) : console.log(k));
	}
}