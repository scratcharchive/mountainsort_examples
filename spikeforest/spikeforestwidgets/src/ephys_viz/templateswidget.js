const TimeDisplay=require('./timedisplayclass.js').TimeDisplay

exports.TemplatesWidget=TemplatesWidget;

function TemplatesWidget() {
  TimeDisplay(this);  
  var that=this;
  this.div=function() {return m_div;};
  this.setTemplates=function(X) {setTemplates(X);};
  this.setViewRange=function(range) {setViewRange(range);};
  this.currentTemplateIndex=function() {return m_current_template_index;};
  this.setCurrentTemplateIndex=function(ii) {m_current_template_index=ii; that._scheduleRefresh();};
  this.setSize=function(W,H) {m_width=W; m_height=H; that._scheduleRefresh();};
    
  var m_templates=null;
  var m_width=300;
  var m_height=300;
  that.m_amp_factor=1;
  var m_view_range=[-1,-1];
  var m_current_template_index=-1;
  var m_templates_stats=null;
  var m_drag_anchor=-1;
  var m_drag_anchor_view_range;
  var m_dragging=false;
  var m_xscale=null;
  var m_min_view_range=100;
  var m_max_view_range=50000;
  var m_clip_size=150;
  var m_spacing=30;
  
  var top_panel_height=35;
  var m_div=$(`
  <div class="ml-vlayout">
    <div class="ml-vlayout-item" style="flex:0 0 ${top_panel_height}px">
      <button class="btn" id=amp_down><span class="fa fa-arrow-down"></span></button>
      <button class="btn" id=amp_up><span class="fa fa-arrow-up"></span></button>
      <button class="btn" id=time_zoom_in><span class="fa fa-search-plus"></span></button>
      <button class="btn" id=time_zoom_out><span class="fa fa-search-minus"></span></button>
    </div>
    <div class="ml-vlayout-item" style="flex:1">
      <svg id=holder></svg>
    </div>
  </div>
  `);
  m_div.find('#amp_down').attr('title','Scale amplitude down').click(amp_down);
  m_div.find('#amp_up').attr('title','Scale amplitude up').click(amp_up);
  m_div.find('#time_zoom_in').attr('title','Time zoom in [mousewheel up]').click(time_zoom_in);
  m_div.find('#time_zoom_out').attr('title','Time zoom out [mousewheel down]').click(time_zoom_out);
  
  m_div.bind('mousewheel', function(e){
    if(e.originalEvent.wheelDelta /120 > 0) {
      time_zoom_in(); //scrolling up
    }
    else{
      time_zoom_out(); //scrolling down
    }
  });

  that._onRefresh(refresh_view);


  function refresh_view() {
    if (!m_templates_stats) {
      schedule_compute_templates_stats();
      return;
    }
    m_amp_factor=that.m_amp_factor;
    var timer=new Date();
    
    var holder=m_div.find('#holder');
    
    var padding_left=70;
    var padding_right=20;
    var padding_top=40;
    var padding_bottom=60;
    var spacing=0; //between channels
    
    var width=m_width;
    var height=m_height-top_panel_height;
    
    var M=m_templates.N1();
    holder.empty();
    
    var gg = d3.select(holder[0])
      .attr("width", width)
      .attr("height", height)
      .append("g");

    /*
    var gg = d3.select(holder[0])
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g");
      */
    
    /*
    gg.call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));
    
    function dragstarted(a,b,c) {
      var pt=d3.mouse(svg.node());
      m_drag_anchor=pt[0];
      m_drag_anchor_view_range=JSON.parse(JSON.stringify(m_view_range));
      console.log ('dragstarted',m_drag_anchor);
    }
    function dragged(a,b,c) {
      var pt=d3.mouse(svg.node());
      var new_timepoint=pt[0];
      console.log ('dragged',m_drag_anchor,new_timepoint);
    }
    function dragended(a,b,c) {
      m_drag_anchor=-1;
      console.log ('dragended',a,b,c);
    }
    */
    
    if ((m_view_range[0]<0)||(m_view_range[1]<0)) {
      m_view_range[0]=0;
      m_view_range[1]=Math.min(m_max_view_range-1,num_timepoints()-1);
    }

    var t1=m_view_range[0];
    var t2=m_view_range[1];
    
    var xdata=d3.range(t1,t2+1);
    for (var i=0; i<xdata.length; i++) {
      xdata[i]=xdata[i];
    }
    
    var channel_colors=mv_default_channel_colors();

    var xdomain=d3.extent(xdata);
    var xrange=[padding_left,width-padding_right];
    m_xscale = d3.scaleLinear().domain(xdomain).range(xrange);

    /*
    var x_axis=d3.axisBottom().scale(m_xscale).ticks(5);
    var X=gg.append("g") // Add the X Axis
      .attr("class", "x axis")
      .attr("transform",'translate('+(0)+', '+(height-padding_bottom)+')')
      .call(x_axis);

    // text label for the x axis
    gg.append('text')
        .attr("transform",'translate('+(xrange[0]+xrange[1])/2+', '+(height-padding_bottom+50)+')')
        .style("text-anchor", "middle")
        .text("Time (sec)");
    */

    if (current_timepoint()>=0) {
      var yscale=d3.scaleLinear().domain([0,1]).range([padding_top,height-padding_bottom]);
      draw_current_timepoint(gg,m_xscale,yscale);
    }
    holder.find('.axis path, .axis line').css({fill:'none','shape-rendering':'crispEdges',stroke:'#BBB','stroke-width':1});
    holder.find('.axis text').css({fill:'#766','font-size':'12px'});
    
    var full_yrange=[padding_top,height-padding_bottom];

    for (var m=0; m<M; m++) {
      var color=channel_colors[m%channel_colors.length];
      var aa=full_yrange[0];
      var bb=full_yrange[1]-full_yrange[0];
      var hh=(bb-(M-1)*spacing)/M;
      //var y0range=[aa+m*(hh+spacing),aa+m*(hh+spacing)+hh];
      var y0range=[aa+m*(hh+spacing)+hh,aa+m*(hh+spacing)];
      var ymu=(m_templates_stats.channel_mins[m]+m_templates_stats.channel_maxs[m])/2;
      //var ysig=m_timeseries_stats.channel_stdevs[m];
      var ysig=m_templates_stats.overall_max_range;
      var y0domain=[ymu-ysig/m_amp_factor,ymu+ysig/m_amp_factor];
      var y0scale = d3.scaleLinear().domain(y0domain).range(y0range);
      var y0_axis=d3.axisLeft().scale(y0scale).ticks(0);
      
      gg.append("g") // Add the Y Axis
        .attr("class", "y axis")
        .attr("transform",'translate('+(padding_left-5)+', '+(0)+')')
        .call(y0_axis);
      
      // text label for the y axis
      gg.append('text')
        .attr("transform",'translate('+(padding_left-15)+', '+(y0range[0]+y0range[1])/2+')')
        .style("text-anchor", "end")
        .text("Ch. "+(m+1));

      var ydata0=d3.range(t2-t1+1); //todo: use something like d3.zeros
      var data0=[];
      for (var i=0; i<t2-t1+1; i++) {
        if (t1+i<num_timepoints()) {
          var val=get_value(m,t1+i);
          if (val!==undefined) {
            data0.push({x:xdata[i],y:val});
          }
          if (get_value(m,t1+i+1)===undefined) {
            var line=d3.line()
              .x(function(d) {return m_xscale(d.x);})
              .y(function(d) {return y0scale(d.y);});
            var path=gg.append("path") // Add the line path from the data
              .attr("d", line(data0));
            $(path.node()).css({fill:"none",stroke:color,"stroke-width":1});
            data0=[];
          }
        }
      }
    }
  }
  function setViewRange(range) {
    var t1=range[0];
    var t2=range[1];
    if (t2-t1>m_max_view_range) {
      return;
    }
    if (t2-t1<m_min_view_range) {
      return;
    }
    //that.
    m_view_range=[t1,t2];
    that._scheduleRefresh();
  }
  function draw_current_timepoint(gg,xscale,yscale) {
    var t0=current_timepoint();
    if (t0<0) return;
    var data=[{x:t0,y:0},{x:t0,y:1}];
    var line=d3.line()
        .x(function(d) {return xscale(d.x);})
        .y(function(d) {return yscale(d.y);});
      var path=gg.append("path")
        .attr("d", line(data));
      $(path.node()).css({fill:"none",stroke:'lightgreen',"stroke-width":2});
  }

  function current_timepoint() {
    if (m_current_template_index<0) return -1;
    return Math.floor((m_clip_size+m_spacing)*m_current_template_index+m_clip_size/2);
  }

  function num_timepoints() {
    if (!m_templates) return 0;
    return m_templates.N3()*(m_clip_size+m_spacing)-m_spacing;
  }

  function get_value(m,t) {
    if (!m_templates) return undefined;
    var ii=Math.floor(t/(m_clip_size+m_spacing));
    if ((ii<0)||(ii>=m_templates.N3())) return undefined;
    var t0=t-(m_clip_size+m_spacing)*ii;
    if (t0>=m_templates.N2()) return undefined;
    return m_templates.value(m,t0,ii);
  }

  var compute_templates_stats_timestamp=0;
  var compute_templates_stats_scheduled=false;
  function schedule_compute_templates_stats() {
    if (compute_templates_stats_scheduled) return;
    compute_templates_stats_scheduled=true;
    var msec=100;
    var elapsed=(new Date())-compute_templates_stats_timestamp;
    if (elapsed>100) msec=0;
    setTimeout(function() {
      compute_templates_stats_scheduled=false;
      do_compute_templates_stats();
      compute_templates_stats_timestamp=new Date();
    },msec);
  }
  function do_compute_templates_stats() {
    var M=m_templates.N1();
    var T=m_templates.N2();
    var K=m_templates.N3();
    var N=num_timepoints();
    m_templates_stats={};
    var S=m_templates_stats;
    S.channel_mins=[];
    S.channel_maxs=[];
    S.overall_max_range=0;
    for (var m=0; m<M; m++) {
      var minval=0,maxval=0;
      var first=true;
      for (var k=0; k<K; k++) {
        for (var t=0; t<T; t++) {
          var val=m_templates.value(m,t,k);
          if ((first)||(val<minval)) minval=val;
          if ((first)||(val>maxval)) maxval=val;
          first=false;
        }
      }
      S.overall_max_range=Math.max(S.overall_max_range,maxval-minval);
      S.channel_mins.push(minval);
      S.channel_maxs.push(maxval);
    }
    that._scheduleRefresh()
  }
  function setTemplates(X) {
    m_templates=X;
    that._scheduleRefresh();
  }
  function on_click_timepoint(t0) {
    var ii=Math.floor(t0/(m_clip_size+m_spacing));
    that.setCurrentTemplateIndex(ii);
  }
  function amp_down() {
    that.m_amp_factor/=1.2;
    that._scheduleRefresh();
  }
  function amp_up() {
    that.m_amp_factor*=1.2;
    that._scheduleRefresh();
  }
  function time_zoom_in() {
    time_zoom(1.2);
  }
  function time_zoom_out() {
    time_zoom(1/1.2);
  }
  function time_zoom(factor) {
    var tmid=(m_view_range[0]+m_view_range[1])/2;
    if (current_timepoint()) tmid=current_timepoint();
    var t1=Math.floor(tmid+(m_view_range[0]-tmid)/factor);
    var t2=Math.ceil(tmid+(m_view_range[1]-tmid)/factor);
    t1=Math.max(t1,0);
    t2=Math.min(t2,num_timepoints()-1);
    that.setViewRange([t1,t2]);
  }
}

function mv_default_channel_colors() {
    var ret=[];
    ret.push('rgb(40,40,40)');
    ret.push('rgb(64,32,32)');
    ret.push('rgb(32,64,32)');
    ret.push('rgb(32,32,112)');
    return ret;
}

