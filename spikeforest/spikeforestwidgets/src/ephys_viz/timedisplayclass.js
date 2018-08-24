exports.TimeDisplay = EVTimeDisplay;

import * as d3 from 'd3'

function EVTimeDisplay(O) {
  // O is the subclass
  O = O || this;
  O.div = function() {
    return m_div;
  };
  O.setSampleRate = function(s) {
    m_samplerate = s;
    schedule_refresh();
  };
  O.setViewRange = function(range) {
    setViewRange(range);
  };
  O.currentTimepoint = function() {
    return m_current_timepoint;
  };
  O.setCurrentTimepoint = function(t) {
    m_current_timepoint = t;
    schedule_refresh();
  };
  O.setSize = function(W, H) {
    m_width = W;
    m_height = H;
    schedule_refresh();
  };
  O.samplerate = function() {
    return m_samplerate;
  };
  O.viewRange = function() {
    return JSON.parse(JSON.stringify(m_view_range));
  };
  //O.setContext=function(context) {setContext(context);};
  O.setContext = setContext;
  //TODO
  O.setAmpFac = function(af) {
    O.m_amp_factor = af;
    schedule_refresh();
  };

  // to be used by subclasses
  O._setNumTimepoints = function(num) {
    m_num_timepoints = num;
  };
  O._onRefresh = function(handler) {
    m_refresh_handlers.push(handler);
  };
  O._scheduleRefresh = function() {
    schedule_refresh();
  };


  function setContext(context) {
    m_context = context;
    m_context.onCurrentTemplateChanged(O._scheduleRefresh);
  }
  var m_context = null;
  //var m_width=300;
  //var m_height=300;
  var m_width = 0;
  var m_height = 0;
  var m_samplerate = 20000;
  var m_view_range = [0, 1000];
  var m_max_view_range = 25000;
  var m_min_view_range = 100;
  var m_current_timepoint = 40;
  var m_drag_anchor = -1;
  var m_drag_anchor_view_range;
  var m_dragging = false;
  var m_xscale = null;
  var m_num_timepoints = 0;
  var m_refresh_handlers = [];
  var m_amp_factor = 1;

  var top_panel_height = 35;
  var m_div = $(`
        <div class="ml-vlayout EVTimeDisplay">
            <div class="ml-vlayout-item" style="flex:0 0 ${top_panel_height}px">
                <button class="btn" id=amp_down><span class="fa fa-arrow-down"></span></button>
                <button class="btn" id=amp_up><span class="fa fa-arrow-up"></span></button>
                <button class="btn" id=time_zoom_in><span class="fa fa-search-plus"></span></button>
                <button class="btn" id=time_zoom_out><span class="fa fa-search-minus"></span></button>
                <a id=view_todo_list href=# style="font-size:9px" title="View todo list for this widget">todo</a>
            </div>
            <div class="ml-vlayout-item" style="flex:1">
                <svg id=holder></svg>
            </div>
        </div>
        `);
  m_div.find('#time_zoom_in').attr('title', 'Time zoom in [mousewheel up]').click(time_zoom_in);
  m_div.find('#time_zoom_out').attr('title', 'Time zoom out [mousewheel down]').click(time_zoom_out);
  m_div.find('#view_todo_list').click(view_todo_list);

  m_div.bind('mousewheel', function(e) {
    if (e.originalEvent.wheelDelta / 120 > 0) {
      time_zoom_in(); //scrolling up
    } else {
      time_zoom_out(); //scrolling down
    }
    return false;
  });

  function view_todo_list() {
    console.info(`
            * Label the horizontal (time) axis
            * Somehow indicate the vertical scale
            * Status bar showing information about the current timepoint, and some other stuff
            * Title of the dataset should be displayed somewhere (this should be an input parameter)
            * Improve the input query parameters somehow (I don't like having url's in the query parameters)
            * Document all the keyboard shortcuts (left, right, zoom in, zoom out, vertical scale, home, end, etc)
            * Make buttons for all the above actions
            * Handle very large channel counts (or actually that should be dealt with at a higher level -- let this widget just do what it does)            
            * Document how to set up a developement environment for ephys-viz so others can contribute to building the widgets
            * Make this smartphone/touchscreen friendly by implementing scrolling and zooming based on screen touches
        `);
    alert('Look at the developer console. You should see a list of todo items.');
  }

  function amp_down() {
    m_amp_factor /= 1.2;
    O.setAmpFac(m_amp_factor);
  }

  function amp_up() {
    m_amp_factor *= 1.2;
    O.setAmpFac(m_amp_factor);
  }


  document.onkeydown = function(evt) {
    return;
    evt = evt || window.event;
    if (evt.ctrlKey && evt.keyCode == 90) {
      alert("Ctrl-Z");
    }
    var code = (evt.keyCode ? evt.keyCode : evt.which);
    switch (code) {
      case 38: //Up
        amp_up();
        break;
      case 40: //Down
        amp_down();
        break;
      case 35: //End
        var t2 = m_num_timepoints;
        var t1 = t2 - (m_view_range[1] - m_view_range[0]);
        O.setViewRange([t1, t2]);
        break;
      case 36: //Home 
        var t2 = m_view_range[1] - m_view_range[0];
        O.setViewRange([0, t2]);
        break;
      case 37: //Left
        move(-1);
        break;
      case 39: //Right
        move(1);
        break;
      case 189: //minus
        time_zoom_out();
        break;
      case 187: //plus (or equals)
        time_zoom_in();
        break;
    }

    function move(sign) { //Left or Right
      var tdiff = sign * (m_view_range[1] - m_view_range[0]) / 2;
      [t1, t2] = m_view_range
      var t1_old = t1;
      t1 += tdiff;
      t2 += tdiff;
      t1 = Math.max(t1, 0);
      if (t1 == 0) {
        t2 = t1 + m_view_range[1] - m_view_range[0];
      } else {
        t2 = Math.min(t2, m_num_timepoints);
      }
      if (t2 == m_num_timepoints) {
        t1 = t2 - (m_view_range[1] - m_view_range[0]);
      }
      if (m_current_timepoint >= 0) {
        O.setCurrentTimepoint(m_current_timepoint + (t1 - t1_old));
      }
      O.setViewRange([t1, t2]);
    }
    //console.info("you pressed key " + code);
  };


  //var svg = d3.select(holder.find('svg')[0]);
  var svg = d3.select(m_div.find('svg')[0]);
  svg.on("mousedown", function() {
    if (!m_xscale) return;
    window.event.preventDefault();
    var pt = d3.mouse(this);
    var t0 = m_xscale.invert(pt[0]) * m_samplerate;
    m_drag_anchor = pt[0];
    m_drag_anchor_view_range = JSON.parse(JSON.stringify(m_view_range));
    //on_click_timepoint(t0);
  });
  svg.on("mouseup", function(evt) {
    if (!m_xscale) return;
    window.event.preventDefault();
    var pt = d3.mouse(this);
    var t0 = m_xscale.invert(pt[0]) * m_samplerate;
    if (!m_dragging) {
      on_click_timepoint(t0);
    }
    m_drag_anchor = -1;
    m_dragging = false;
  });
  svg.on("mousemove", function() {
    if (!m_xscale) return;
    var pt = d3.mouse(this);
    var t0 = m_xscale.invert(pt[0]) * m_samplerate;
    if (m_drag_anchor >= 0) {
      if (Math.abs(m_drag_anchor - pt[0]) > 5) {
        m_dragging = true;
        var drag_anchor_t0 = m_xscale.invert(m_drag_anchor) * m_samplerate;
        var offset = Math.floor(drag_anchor_t0 - t0);
        if (m_drag_anchor_view_range[0] + offset < 0) {
          offset = -m_drag_anchor_view_range[0];
        }
        if (m_drag_anchor_view_range[1] + offset >= m_num_timepoints) {
          offset = -m_drag_anchor_view_range[1] + m_num_timepoints - 1;
        }
        var t1 = m_drag_anchor_view_range[0] + offset;
        var t2 = m_drag_anchor_view_range[1] + offset;
        t1 = Math.max(t1, 0);
        t2 = Math.min(t2, m_num_timepoints - 1);
        O.setViewRange([t1, t2]);
      }
    }
  });
  svg.on("mouseleave", function() {
    m_drag_anchor = -1;
  });

  var refresh_timestamp = 0;
  var refresh_scheduled = false;

  function schedule_refresh() {
    if (refresh_scheduled) return;
    refresh_scheduled = true;
    var msec = 100;
    var elapsed = (new Date()) - refresh_timestamp;
    if (elapsed > 100) msec = 0;
    setTimeout(function() {
      refresh_scheduled = false;
      do_refresh();
      refresh_timestamp = new Date();
    }, msec);
  }

  function do_refresh() {

    var timer = new Date();

    var holder = m_div.find('#holder');

    var padding_left = 70;
    var padding_right = 20;
    var padding_top = 40;
    var padding_bottom = 60;

    let W = m_width || m_div.width();
    let H = m_height || m_div.height();

    var width = W;
    var height = H - top_panel_height;
    var samplerate = m_samplerate;

    holder.empty();

    var gg = d3.select(holder[0])
      .attr("width", width)
      .attr("height", height)
      .append("g");

    var t1 = m_view_range[0];
    var t2 = m_view_range[1];

    var xdomain = [t1 / samplerate, t2 / samplerate];
    var xrange = [padding_left, width - padding_right];
    m_xscale = d3.scaleLinear().domain(xdomain).range(xrange);
    var x_axis = d3.axisBottom().scale(m_xscale).ticks(5);
    var X = gg.append("g") // Add the X Axis
      .attr("class", "x axis")
      .attr("transform", 'translate(' + (0) + ', ' + (height - padding_bottom) + ')')
      .call(x_axis);

    // text label for the x axis
    gg.append('text')
      .attr("transform", 'translate(' + (xrange[0] + xrange[1]) / 2 + ', ' + (height - padding_bottom + 50) + ')')
      .style("text-anchor", "middle")
      .text("Time (sec)");

    if (m_current_timepoint >= 0) {
      var yscale = d3.scaleLinear().domain([0, 1]).range([padding_top, height - padding_bottom]);
      draw_current_timepoint(gg, m_xscale, yscale);
    }
    holder.find('.axis path, .axis line').css({
      fill: 'none',
      'shape-rendering': 'crispEdges',
      stroke: '#BBB',
      'stroke-width': 1
    });
    holder.find('.axis text').css({
      fill: '#766',
      'font-size': '12px'
    });

    for (var i in m_refresh_handlers) {
      var info = {
        xscale: m_xscale,
        padding_top: padding_top,
        padding_bottom: padding_bottom,
        padding_left: padding_left,
        padding_right: padding_right,
        width: width,
        height: height
      };
      m_refresh_handlers[i](holder, gg, info);
    }
  }

  let s_last_size = null;

  function check_size_changed() {
    let size0 = m_div.width() + ',' + m_div.height();
    if (size0 != s_last_size) {
      schedule_refresh();
      s_last_size = size0;
    }
    setTimeout(check_size_changed, 1000);
  }
  check_size_changed();

  function setViewRange(range) {
    var t1 = range[0];
    var t2 = range[1];
    if (t2 - t1 > m_max_view_range) {
      return;
    }
    if (t2 - t1 < m_min_view_range) {
      return;
    }
    m_view_range = [t1, t2];
    schedule_refresh();
  }

  function draw_current_timepoint(gg, xscale, yscale) {
    var data = [{
      x: m_current_timepoint / m_samplerate,
      y: 0
    }, {
      x: m_current_timepoint / m_samplerate,
      y: 1
    }];
    var line = d3.line()
      .x(function(d) {
        return xscale(d.x);
      })
      .y(function(d) {
        return yscale(d.y);
      });
    var path = gg.append("path")
      .attr("d", line(data));
    $(path.node()).css({
      fill: "none",
      stroke: 'lightgreen',
      "stroke-width": 2
    });
  }

  function on_click_timepoint(t0) {
    O.setCurrentTimepoint(Math.floor(t0));
  }

  function time_zoom_in() {
    time_zoom(1.2);
  }

  function time_zoom_out() {
    time_zoom(1 / 1.2);
  }

  function time_zoom(factor) {
    var tmid = (m_view_range[0] + m_view_range[1]) / 2;
    if (m_current_timepoint) tmid = m_current_timepoint;
    var t1 = Math.floor(tmid + (m_view_range[0] - tmid) / factor);
    var t2 = Math.ceil(tmid + (m_view_range[1] - tmid) / factor);
    t1 = Math.max(t1, 0);
    t2 = Math.min(t2, m_num_timepoints - 1);
    O.setViewRange([t1, t2]);
  }
}