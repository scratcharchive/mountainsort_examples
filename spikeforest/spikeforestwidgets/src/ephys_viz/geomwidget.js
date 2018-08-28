exports.GeomWidget = GeomWidget;

var JSQCanvasWidget = require('./jsqcanvaswidget.js').JSQCanvasWidget;

function GeomWidget(O) {
  O = O || this;
  JSQCanvasWidget(O);
  O.div().addClass('GeomWidget');
  O.setGeometry(0, 0, 300, 300);
  O.div().css({
    position: 'relative'
  });

  this.setGeomText = function(txt) {
    setGeomText(txt);
  };
  this.setVisibleChannels = function(visible_channels) {
    setVisibleChannels(visible_channels);
  };

  var m_geom = [];
  var m_xmin = 0,
    m_xmax = 1;
  var m_ymin = 0,
    m_ymax = 1;
  var m_mindist = 1; //dist between nearby electrodes
  var m_transpose = false;
  let m_visible_channels = null;

  O.onPaint(paint);

  function paint(painter) {
    var W = O.width();
    var H = O.height();
    painter.fillRect(0, 0, W, H, 'rgb(240,240,240)');

    var W1 = W,
      H1 = H;
    if (m_transpose) {
      W1 = H;
      H1 = W;
    }

    var x1 = m_xmin - m_mindist,
      x2 = m_xmax + m_mindist;
    var y1 = m_ymin - m_mindist,
      y2 = m_ymax + m_mindist;
    var w0 = x2 - x1,
      h0 = y2 - y1;
    var offset, scale;
    if (w0 * H1 > h0 * W1) {
      scale = W1 / w0;
      offset = [0 - x1 * scale, (H1 - h0 * scale) / 2 - y1 * scale];
    } else {
      scale = H1 / h0;
      offset = [(W1 - w0 * scale) / 2 - x1 * scale, 0 - y1 * scale];
    }
    for (var i in m_geom) {
      var pt0 = m_geom[i];
      var x = pt0[0] * scale + offset[0];
      var y = pt0[1] * scale + offset[1];
      var rad = m_mindist * scale / 3;
      var x1 = x,
        y1 = y;
      if (m_transpose) {
        x1 = y;
        y1 = x;
      }
      let col = get_channel_color(Number(i) + 1);
      painter.fillEllipse([x1 - rad, y1 - rad, rad * 2, rad * 2], col);
    }

  }

  function get_channel_color(ch) {
  	if (is_visible_channel(ch))
  		return 'blue';
  	else
  		return 'gray';
  }

  function is_visible_channel(ch) {
  	if (m_visible_channels) {
  		for (let i in m_visible_channels) {
  			if (m_visible_channels[i]==ch)
  				return true;
  		}
  		return false;
  	}
  	else {
  		return true;
  	}
  }

  function setVisibleChannels(channels) {
  	if (typeof(channels)=='string') {
  		let list=channels.split(',');
  		channels=[];
  		for (let i in list) {
  			channels.push(Number(list[i]));
  		}
  	}
  	m_visible_channels = JSON.parse(JSON.stringify(channels));
    O.update();
  }


  function setGeomText(txt) {
    m_geom = [];
    var list = txt.split('\n');
    for (var i in list) {
      if (list[i].trim()) {
        var vals = list[i].trim().split(',');
        for (var j in vals) {
          vals[j] = Number(vals[j]);
        }
        while (vals.length < 2) vals.push(0);
        m_geom.push(vals);
      }
    }

    var pt0 = m_geom[0] || [0, 0];
    var xmin = pt0[0],
      xmax = pt0[0];
    var ymin = pt0[1],
      ymax = pt0[1];
    for (var i in m_geom) {
      var pt = m_geom[i];
      xmin = Math.min(xmin, pt[0]);
      xmax = Math.max(xmax, pt[0]);
      ymin = Math.min(ymin, pt[1]);
      ymax = Math.max(ymax, pt[1]);
    }
    if (xmax == xmin) xmax++;
    if (ymax == ymin) ymax++;

    m_xmin = xmin;
    m_xmax = xmax;
    m_ymin = ymin;
    m_ymax = ymax;

    m_transpose = (m_ymax - m_ymin > m_xmax - m_xmin);

    var mindists = [];
    for (var i in m_geom) {
      var pt0 = m_geom[i];
      var mindist = -1;
      for (var j in m_geom) {
        var pt1 = m_geom[j];
        var dx = pt1[0] - pt0[0];
        var dy = pt1[1] - pt0[1];
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          if ((dist < mindist) || (mindist < 0))
            mindist = dist;
        }
      }
      if (mindist > 0) mindists.push(mindist);
    }
    var avg_mindist = compute_average(mindists);
    if (avg_mindist <= 0) avg_mindist = 1;
    m_mindist = avg_mindist;

    O.update();
  }

  function compute_average(list) {
    if (list.length == 0) return 0;
    var sum = 0;
    for (var i in list) sum += list[i];
    return sum / list.length;
  }
}
