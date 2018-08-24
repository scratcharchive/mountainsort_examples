exports.JSQWidget=JSQWidget;
exports.JSQObject=JSQObject;
var JSQ=new JSQCore();
exports.JSQ=JSQ;

function JSQWidget(O) {
	O=O||this;
	JSQObject(O);
	
	O.div=function() {return m_div;};
	O.size=function() {return JSQ.clone(m_size);};
	O.width=function() {return m_size[0];};
	O.height=function() {return m_size[1];};
	O.setSize=function(W,H) {setSize(W,H);};
	O.position=function() {return m_position;};
	O.left=function() {return m_position[0];};
	O.top=function() {return m_position[1];};
	O.setPosition=function(x,y) {setPosition(x,y);};
	O.setGeometry=function(x,y,W,H) {setGeometry(x,y,W,H);};
	O.geometry=function() {return [m_position[0],m_position[1],m_size[0],m_size[1]];};
	O.showFullBrowser=function() {showFullBrowser();};
	var JSQObject_setParent=O.setParent;
	O.setParent=function(parent) {setParent(parent);};
	O.parentWidget=function() {return parentWidget();};
	O.setVisible=function(visible) {setVisible(visible);};
	O.show=function() {O.setVisible(true);};
	O.hide=function() {O.setVisible(false);};
	O.hasFocus=function() {return hasFocus();};
	O.setFocus=function(val) {JSQ._set_widget_focus(O,val);};

	O.onMousePress=function(handler) {onMousePress(handler);};
	O.onMouseRelease=function(handler) {onMouseRelease(handler);};
	O.onMouseMove=function(handler) {onMouseMove(handler);};
	O.onMouseEnter=function(handler) {onMouseEnter(handler);};
	O.onMouseLeave=function(handler) {onMouseLeave(handler);};
	O.onWheel=function(handler) {onWheel(handler);};
	O.onKeyPress=function(handler) {onKeyPress(handler);};

	JSQ.connect(O,'destroyed',O,on_destroyed);
	function on_destroyed() {
		m_div.remove();
	}

	function connect_div() {
		m_div.mousedown(function(e) {JSQ._report_mouse_press(O); mouse_actions.emit('press',jq_mouse_event($(this),e));});
		m_div.mouseup(function(e) {mouse_actions.emit('release',jq_mouse_event($(this),e));});
		m_div.mousemove(function(e) {mouse_actions.emit('move',jq_mouse_event($(this),e));});
		m_div.mouseenter(function(e) {mouse_actions.emit('enter',jq_mouse_event($(this),e));});
		m_div.mouseleave(function(e) {mouse_actions.emit('leave',jq_mouse_event($(this),e));});
		m_div.on('dragstart',function() {return false;});
		m_div.bind('mousewheel', function(e){
			wheel_actions.emit('wheel',jq_wheel_event($(this),e));
    	});
    	m_div.css({overflow:"hidden"});
    	if (O.parentWidget()) {
    		O.parentWidget().div().append(m_div);
    	}
		set_div_geom();
	}
	function setSize(W,H) {
		var size=[W,H];
		if (H===undefined) size=W;
		if ((size[0]==m_size[0])&&(size[1]==m_size[1])) {
			return;
		}
		m_size[0]=size[0];
		m_size[1]=size[1];
		set_div_geom();
		O.emit('sizeChanged');
	}
	function setPosition(x,y) {
		var pos=[x,y];
		if (y===undefined) pos=x;
		if ((m_position[0]==pos[0])&&(m_position[1]==pos[1])) {
			return;
		}
		m_position[0]=pos[0];
		m_position[1]=pos[1];
		set_div_geom();
		O.emit('positionChanged');
	}
	function setGeometry(x,y,W,H) {
		var geom=[x,y,W,H];
		if (y===undefined) {
			geom=x;
		}
		O.setSize(geom[2],geom[3]);
		O.setPosition(geom[0],geom[1]);
	}
	function showFullBrowser(opts) {
		if (!opts) opts={};
		opts.margin_left=opts.margin_left||10;
		opts.margin_right=opts.margin_right||10;
		opts.margin_top=opts.margin_top||10;
		opts.margin_bottom=opts.margin_bottom||10;
		if ('margin' in opts) {
			opts.margin_left=opts.margin_right=opts.margin_top=opts.margin_bottom=opts.margin;
		}

		var X=new BrowserWindow();
		JSQ.connect(X,'sizeChanged',O,set_size);
		function set_size() {
			var ss=X.size();
			O.setSize([ss[0]-opts.margin_left-opts.margin_right,ss[1]-opts.margin_top-opts.margin_bottom]);
			O.setPosition([opts.margin_left,opts.margin_top]);
		}
		$('body').append(O.div());
		set_size();
		O.setFocus(true);
	}
	function setParent(parent) {
		JSQObject_setParent(parent);
		if ((parent)&&(parent.isWidget())) {
			parent.div().append(O.div());
		}
	}
	function parentWidget() {
		if (!O.parent()) return null;
		if (!O.parent().isWidget()) return null;
		return O.parent();
	}

	function mouseMove() {
		O.div().addClass('hovered');
	}
	function mouseEnter() {
		O.div().addClass('hovered');
	}
	function mouseLeave() {
		O.div().removeClass('hovered');
	}

	var mouse_actions=new JSQObject();
	var wheel_actions=new JSQObject();
	function onMousePress(handler) {
		JSQ.connect(mouse_actions,'press',O,function(sender,args) {
			handler(args);
		});
	}
	function onMouseRelease(handler) {
		JSQ.connect(mouse_actions,'release',O,function(sender,args) {
			handler(args);
		});
	}
	function onMouseMove(handler) {
		JSQ.connect(mouse_actions,'move',O,function(sender,args) {
			handler(args);
		});
	}
	function onMouseEnter(handler) {
		JSQ.connect(mouse_actions,'enter',O,function(sender,args) {
			handler(args);
		});
	}
	function onMouseLeave(handler) {
		JSQ.connect(mouse_actions,'leave',O,function(sender,args) {
			handler(args);
		});
	}
	function onKeyPress(handler) {
		JSQ.connect(O,'keyPress',O,function(sender,args) {
			handler(args.event);
		});
	}
	function onWheel(handler) {
		JSQ.connect(wheel_actions,'wheel',O,function(sender,args) {
			handler(args);
		});
	}
	function jq_mouse_event(elmt,e) {
		//var parentOffset = $(this).parent().offset(); 
		var offset=elmt.offset(); //if you really just want the current element's offset
		var posx = e.pageX - offset.left;
		var posy = e.pageY - offset.top;
		return {
			pos:[posx,posy],
			modifiers:{ctrlKey:e.ctrlKey}
		};
	}
	function jq_wheel_event(elmt,e) {
		return {
			delta:e.originalEvent.wheelDelta
		};
	}
	function setVisible(visible) {
		if (visible) m_div.css({visibility:'inherit'});
		else m_div.css({visibility:'hidden'});
	}
	function hasFocus() {
		return JSQ._widget_has_focus(O);
	}

	O._set_is_widget(true);
	var m_position=[0,0];
	var m_size=[0,0];

	var m_div=$('<div></div>');
	connect_div(m_div);

	function set_div_geom() {
		m_div.css({
			position:'absolute',
			left:m_position[0],
			top:m_position[1],
			width:m_size[0],
			height:m_size[1]
		})
	}

	O.onMouseMove(mouseMove);
	O.onMouseEnter(mouseEnter);
	O.onMouseLeave(mouseLeave);
}

function JSQObject(O) {
	O=O||this;
	O.objectId=function() {return m_object_id;}
	O.setParent=function(parent_object) {setParent(parent_object);}
	O.parent=function() {return parent();}
	O.setProperty=function(name,value) {setProperty(name,value);}
	O.property=function(name) {return property(name);}
	O.emit=function(signal_name,args) {emit(signal_name,args);}
	O.destroy=function() {destroy();}
	O.isWidget=function() {return m_is_widget;}

	function setParent(parent_object) {
		if (O.parent()) {
			O.parent()._remove_child(O);
		}
		if (parent_object) {
			m_parent_id=parent_object.objectId();
			parent_object._add_child(O);
		}
		else {
			m_parent_id=null;
		}
	}
	function parent() {
		if (!m_parent_id) return null;
		return JSQ._object(m_parent_id);
	}
	function setProperty(name,val) {
		m_properties[name]=val;
	}
	function property(name) {
		if (name in m_properties)
			return m_properties[name];
		else
			return null;
	}
	function emit(signal_name,args) {
		JSQ.emit(O,signal_name,args);
	}
	function destroy() {
		for (var id in m_child_ids) {
			var child_obj=JSQ._object(id);
			if (child_obj) {
				child_obj.destroy();
			}
		}
		O.setParent(null);
		O.emit('destroyed');
		JSQ._removeObject(m_object_id);
	}
	O._remove_child=function(child) {
		var id=child.objectId();
		if (id in m_child_ids) {
			delete m_child_ids[id];
		}
	}
	O._add_child=function(child) {
		var id=child.objectId();
		if (!id) return;
		m_child_ids[id]=1;
	}
	O._connect=function(signal_name,receiver,callback,connection_type) {
		JSQ.connect(O,signal_name,receiver,callback,connection_type);
	}
	O._set_is_widget=function() {m_is_widget=true;}

	var m_object_id=JSQ.makeRandomId(10);
	var m_parent_id=null;;
	var m_child_ids={};
	var m_properties={};
	var m_is_widget=false;

	JSQ._addObject(m_object_id,O);
}

/*
if (typeof module !== 'undefined' && module.exports) {
	exports.JSQ=JSQ;
	window={};
}
*/

function JSQCore() {
	this.connect=function(sender,signal,receiver,callback,connection_type) {connect(sender,signal,receiver,callback,connection_type);};
	this.emit=function(sender,signal_name,args) {emit(sender,signal_name,args);};
	this.clone=function(obj_or_array) {return clone(obj_or_array);};
	this.compare=function(X,Y) {return compare(X,Y);};
	this.computeSha1SumOfString=function(str) {return computeSha1SumOfString(str);};
	this.numSet2List=function(set) {return numSet2List(set);};
	this.numSort=function(array) {numSort(array);};
	this.makeRandomId=function(num_chars) {return make_random_id(num_chars||10);};
	this.toSet=function(list) {return toSet(list);};
	this.addPreventDefaultKeyPressHandler=function(handler) {m_prevent_default_key_press_handlers.push(handler);};

	this._object=function(id) {return object(id);};
	this._addObject=function(id,obj) {addObject(id,obj);};
	this._removeObject=function(id) {removeObject(id);};

	this._report_mouse_press=function(W) {_report_mouse_press(W);};
	this._widget_has_focus=function(W) {return (W.objectId() in m_focused_widget_ids_set);};
	this._set_widget_focus=function(W,val) {_set_widget_focus(W,val);};
	this._handle_key_press=function(e) {_handle_key_press(e);};

	var m_prevent_default_key_press_handlers=[];

	function connect(sender,signal_name,receiver,callback,connection_type) {
		m_connection_manager.connect(sender,signal_name,receiver,callback,connection_type);
	}
	function emit(sender,signal_name,args) {
		m_connection_manager.emit(sender,signal_name,args);
	}
	function clone(obj_or_array) {
		return JSON.parse(JSON.stringify(obj_or_array));
	}
	function compare(X,Y) {
		return (JSON.stringify(X)==JSON.stringify(Y));
	}
	function object(id) {
		if (id in m_objects) {
			return m_objects[id];
		}
		return null;
	}
	function addObject(id,obj) {
		m_objects[id]=obj;
	}
	function removeObject(id) {
		if (id in m_objects) {
			delete m_objects[id];
		}
	}
	function computeSha1SumOfString(str) {
		return Sha1.hash(str);
	}
	function numSet2List(set) {
		var ret=[];
		for (var key in set) {
			ret.push(key);
		}
		JSQ.numSort(ret);
		return ret;
	}
	function numSort(array) {
		array.sort(function(a,b) {return (a-b);});
	}
	function toSet(list) {
		var ret={};
		for (var i in list) {
			ret[list[i]]=1;
		}
		return ret;
	}
	var m_focused_widget_ids=[];
	var m_focused_widget_ids_set={};
	var m_last_mouse_press_group=0;
	var m_mouse_press_group=1;
	function _report_mouse_press(W,timestamp) {
		if (m_mouse_press_group!=m_last_mouse_press_group) {
			m_last_mouse_press_group=m_mouse_press_group;
			m_focused_widget_ids=[];
			m_focused_widget_ids_set={};
			setTimeout(function() {m_mouse_press_group=m_last_mouse_press_group+1},1);
		}
		m_focused_widget_ids.push(W.objectId());
		m_focused_widget_ids_set[W.objectId()]=true;
	}
	function _set_widget_focus(W,val) {
		if (val) {
			if (!m_focused_widget_ids_set[W.objectId()]) {
				m_focused_widget_ids.push(W.objectId());
				m_focused_widget_ids_set[W.objectId()]=true;
			}
		}
		else {
			if (m_focused_widget_ids_set[W.objectId()]) {
				delete m_focused_widget_ids[W.objectId()];
				var ii=m_focused_widget_ids.indexOf(W.objectId());
				m_focused_widget_ids.splice(ii,1);
			}	
		}
	}
	function _handle_key_press(e) {
		if (!e.key) e.key=String.fromCharCode(e.keyCode); //for support Qt webkit
		for (var j=0; j<m_focused_widget_ids.length; j++) {
			var obj=object(m_focused_widget_ids[j]);
			if (obj) {
				obj.emit('keyPress',{event:e,key:e.which});
			}
		}
		for (var i in m_prevent_default_key_press_handlers) {
			if (m_prevent_default_key_press_handlers[i](e)) {
				e.preventDefault();
				return false;
			}
		}
	}

	var m_connection_manager=new JSQConnectionManager();
	var m_objects={};
}

function JSQConnectionManager() {
	this.connect=function(sender,signal_name,receiver,callback,connection_type) {connect(sender,signal_name,receiver,callback,connection_type);}
	this.emit=function(sender,signal_name,args) {emit(sender,signal_name,args);}

	function signal(sender_id,signal_name) {
		var code=sender_id+'-'+signal_name;
		if (!(code in m_signals)) {
			m_signals[code]={
				sender_id:sender_id,
				signal_name:signal_name,
				connections:[]
			}
		}
		return m_signals[code];
	}
	function connect(sender,signal_name,receiver,callback,connection_type) {
		var SS=signal(sender.objectId(),signal_name);
		var receiver_id=null;
		if (receiver) receiver_id=receiver.objectId();
		var CC={
			receiver_id:receiver_id,
			callback:callback,
			connection_type:connection_type||'direct', //should direct be the default?
			scheduled:false
		}
		SS.connections.push(CC);
	}
	function emit(sender,signal_name,args) {
		var sender_id=sender.objectId();
		var code=sender_id+'-'+signal_name;
		if (code in m_signals) {
			var SS=m_signals[code];
			for (var j=0; j<SS.connections.length; j++) {
				var CC=SS.connections[j];
				if ((!CC.receiver_id)||(JSQ._object(CC.receiver_id))) { //make sure receiver has not been destroyed
					if (CC.connection_type=='direct') {
						CC.callback(sender,args);
					}
					else if (CC.connection_type=='queued') {
						schedule_trigger_connection(CC,sender,args);
					}
				}
				else {
					/// TODO: delete this connection because the receiver has been destroyed
				}
			}
		}
	}
	function schedule_trigger_connection(CC,sender,args) {
		if (CC.scheduled) return;
		CC.scheduled=true;
		setTimeout(function() {
			CC.scheduled=false;
			if ((!CC.receiver_id)||(JSQ._object(CC.receiver_id))) { //make sure object has not been destroyed
				CC.callback(sender,args);
			}
		},1);
	}
	var m_signals={};
}

function make_random_id(num_chars)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < num_chars; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}