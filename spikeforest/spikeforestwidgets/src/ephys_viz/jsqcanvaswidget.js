exports.JSQCanvasWidget=JSQCanvasWidget;

var JSQWidget=require('./jsqcore.js').JSQWidget;
var JSQObject=require('./jsqcore.js').JSQObject;
var JSQ=require('./jsqcore.js').JSQ;

function JSQCanvasWidget(O) {
	O=O||this;
	JSQWidget(O);

	O.update=function() {private_signals.emit('paint');};

	//protected methods
	var private_signals=new JSQObject();
	O.onPaint=function(handler) {paint(handler);};

	JSQ.connect(O,'sizeChanged',O,update_canvas_size);

	var m_canvas=$(document.createElement('canvas'));
	O.div().append(m_canvas);
	m_canvas.css('position','absolute');
	var m_painter=new JSQCanvasPainter(m_canvas);

	function update_canvas_size() {
		var ss=O.size();
		m_canvas[0].width=ss[0];
		m_canvas[0].height=ss[1];
		m_canvas.css({
			width:ss[0],
			height:ss[1]
		});
		O.update();
	}

	function paint(handler) {
		JSQ.connect(private_signals,'paint',O,function(sender,args) {
			m_painter._initialize(O.size()[0],O.size()[1]);
			handler(m_painter);
			m_painter._finalize();
		},'queued');
	}
}

function JSQCanvasPainter(canvas) {
	var that=this;
	var ctx=canvas[0].getContext('2d');

	var m_pen={color:'black'};
	var m_font={"pixel-size":12,family:'Arial'};
	var m_brush={color:'black'};

	this.pen=function() {return JSQ.clone(m_pen);};
	this.setPen=function(pen) {setPen(pen);};
	this.font=function() {return JSQ.clone(m_font);};
	this.setFont=function(font) {setFont(font);};
	this.brush=function() {return JSQ.clone(m_brush);};
	this.setBrush=function(brush) {setBrush(brush);};

	this._initialize=function(W,H) {
		//ctx.fillStyle='black';
		//ctx.fillRect(0,0,W,H);
	};
	this._finalize=function() {
	};
	this.clearRect=function(x,y,W,H) {
		ctx.clearRect(x,y,W,H);
	};
	this.fillRect=function(x,y,W,H,brush) {
		if (typeof brush === 'string') brush={color:brush};
		if (!('color' in brush)) brush={color:brush};
		ctx.fillStyle=to_color(brush.color);
		ctx.fillRect(x,y,W,H);
	};
	this.drawRect=function(x,y,W,H) {
		ctx.strokeStyle=to_color(m_pen.color);
		ctx.strokeRect(x,y,W,H);
	};
	this.drawPath=function(painter_path) {
		ctx.strokeStyle=to_color(m_pen.color);
		painter_path._draw(ctx);
	};
	this.drawLine=function(x1,y1,x2,y2) {
		var ppath=new JSQPainterPath();
		ppath.moveTo(x1,y1);
		ppath.lineTo(x2,y2);
		that.drawPath(ppath);
	};
	this.drawText=function(rect,alignment,txt) {
		var x,y,textAlign,textBaseline;
		if (alignment.AlignLeft) {
			x=rect[0];
			textAlign='left';
		}
		else if (alignment.AlignCenter) {
			x=rect[0]+rect[2]/2;
			textAlign='center';
		}
		else if (alignment.AlignRight) {
			x=rect[0]+rect[2];
			textAlign='right';
		}

		if (alignment.AlignTop) {
			y=rect[1];
			textBaseline='top';
		}
		else if (alignment.AlignBottom) {
			y=rect[1]+rect[3];
			textBaseline='bottom';
		}
		else if (alignment.AlignVCenter) {
			y=rect[1]+rect[3]/2;
			textBaseline='middle';
		}

		ctx.font=m_font['pixel-size']+'px'+' '+m_font.family;
		ctx.textAlign=textAlign;
		ctx.textBaseline=textBaseline;
		ctx.strokeStyle=to_color(m_pen.color);
		ctx.fillStyle=to_color(m_brush.color);
		ctx.fillText(txt,x,y);
	}
	this.drawEllipse=function(rect) {
		ctx.strokeStyle=to_color(m_pen.color);
		ctx.beginPath();
		ctx.ellipse(rect[0]+rect[2]/2,rect[1]+rect[3]/2,rect[2]/2,rect[3]/2,0,0,2*Math.PI);
		ctx.stroke();
	}
	this.fillEllipse=function(rect,brush) {
		if (brush) {
			if (typeof brush === 'string') brush={color:brush};
			if (!('color' in brush)) brush={color:brush};
			ctx.fillStyle=to_color(brush.color);
		}
		else {
			ctx.fillStyle=to_color(m_brush.color);
		}
		ctx.beginPath();
		ctx.ellipse(rect[0]+rect[2]/2,rect[1]+rect[3]/2,rect[2]/2,rect[3]/2,0,0,2*Math.PI);
		ctx.fill();
	}

	function setPen(pen) {
		m_pen=JSQ.clone(pen);
	}

	function setFont(font) {
		m_font=JSQ.clone(font);
	}

	function setBrush(brush) {
		m_brush=JSQ.clone(brush);
	}

	function to_color(col) {
		if (typeof col === 'string') return col;
		return 'rgb('+Math.floor(col[0])+','+Math.floor(col[1])+','+Math.floor(col[2])+')';
	}
}


function JSQPainterPath() {
	this.moveTo=function(x,y) {moveTo(x,y);};
	this.lineTo=function(x,y) {lineTo(x,y);};

	this._draw=function(ctx) {
		ctx.beginPath();
		for (var i=0; i<m_actions.length; i++) {
			apply_action(ctx,m_actions[i]);
		}
		ctx.stroke();
	}
	var m_actions=[];

	function moveTo(x,y) {
		if (y===undefined) {moveTo(x[0],x[1]); return;}
		m_actions.push({
			name:'moveTo',
			x:x,y:y
		});
	}
	function lineTo(x,y) {
		if (y===undefined) {lineTo(x[0],x[1]); return;}
		m_actions.push({
			name:'lineTo',
			x:x,y:y
		});
	}

	function apply_action(ctx,a) {
		if (a.name=='moveTo') {
			ctx.moveTo(a.x,a.y);
		}
		else if (a.name=='lineTo') {
			ctx.lineTo(a.x,a.y);
		}
	}
}

/**
 * Copyright 2014 Google Inc. All rights reserved.
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 *
 * @fileoverview Description of this file.
 *
 * A polyfill for HTML Canvas features, including
 * Path2D support.
 */
if (CanvasRenderingContext2D.prototype.ellipse == undefined) {
  CanvasRenderingContext2D.prototype.ellipse = function(x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
    this.save();
    this.translate(x, y);
    this.rotate(rotation);
    this.scale(radiusX, radiusY);
    this.arc(0, 0, 1, startAngle, endAngle, antiClockwise);
    this.restore();
  }
}

