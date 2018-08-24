exports.TimeseriesWidget=TimeseriesWidget;
const TimeDisplay = require(__dirname+'/timedisplayclass.js').TimeDisplay

import * as d3 from 'd3'

function TimeseriesWidget() {
    TimeDisplay(this);
    var that=this;
    this.setTimeseriesModel=function(X) {setTimeseriesModel(X);};
    this.setFiringsModel=function(X) {setFiringsModel(X);};
    this.setChannels=function(channels) {setChannels(channels);};

    var m_timeseries_model=null;
    var m_firings_model=null;
    that.m_amp_factor=1; //what's going on with this?
    let m_amp_factor=that.m_amp_factor;
    var m_timeseries_stats=null; //{channel_means:[],channel_stdevs:[],overall_stdev:0};
    var m_drag_anchor=-1;
    var m_drag_anchor_view_range;
    var m_dragging=false;
    var m_xscale=null;
    var m_channels=null;

    //todo: move these html elements to this subclass
    that.div().find('#amp_down').attr('title','Scale amplitude down').click(amp_down);
    that.div().find('#amp_up').attr('title','Scale amplitude up').click(amp_up);

    that._onRefresh(refresh_view);


    function refresh_view(holder,gg,info) {
        m_amp_factor = that.m_amp_factor;
        if (!m_timeseries_stats) {
            schedule_compute_timeseries_stats();
            return;
        }

        var spacing=0; //between channels

        var timer=new Date();

        var TS=m_timeseries_model;

        var samplerate=that.samplerate();

        var channels=get_channels();
        var M=channels.length;

        var gg = d3.select(holder[0])
            .append("g");

        var view_range=that.viewRange();

        var t1=view_range[0];
        var t2=view_range[1];
        var chunk=m_timeseries_model.getChunk({t1:t1,t2:t2+1});
        if (!chunk) {
            //unable to get chunk... perhaps it has not yet been loaded
            that._scheduleRefresh();
            return;
        }

        var firings=null;
        if (m_firings_model) {
            firings=m_firings_model.getChunk({t1:t1,t2:t2+1});
            if (!firings) {
                //unable to get firings chunk... perhaps it has not yet been loaded
                that._scheduleRefresh();
                return;
            }
        }

        var xdata=d3.range(t1,t2+1);
        for (var i=0; i<xdata.length; i++) {
            xdata[i]=xdata[i]/samplerate;
        }

        var channel_colors=mv_default_channel_colors();

        var full_yrange=[info.padding_top,info.height-info.padding_bottom];

        if (firings) {
            var line=d3.line()
                .x(function(d) {return info.xscale(d.x);})
                .y(function(d) {return d.y;});
            for (var i=0; i<firings.times.length; i++) {
                var data0=[];
                data0.push({x:firings.times[i]/samplerate,y:info.padding_top});
                data0.push({x:firings.times[i]/samplerate,y:info.height-info.padding_bottom});
                var path=gg.append("path") // Add the line path from the data
                    .attr("d", line(data0));
                $(path.node()).css({fill:"none",stroke:'pink',"stroke-width":1});

                gg.append("text")
                    .attr("transform",'translate('+(info.xscale(firings.times[i]/samplerate))+', '+(info.padding_top-10)+')')
                    .style("text-anchor", "middle")
                    .style('font-size','12px')
                    .style('fill','pink')
                    .text(firings.labels[i]);
            }
        }

        for (var m=0; m<M; m++) {
            var color=channel_colors[m%channel_colors.length];
            var aa=full_yrange[0];
            var bb=full_yrange[1]-full_yrange[0];
            var hh=(bb-(M-1)*spacing)/M;
            //var y0range=[aa+m*(hh+spacing),aa+m*(hh+spacing)+hh];
            var y0range=[aa+m*(hh+spacing)+hh,aa+m*(hh+spacing)];
            var ymu=m_timeseries_stats.channel_means[m];
            //var ysig=m_timeseries_stats.channel_stdevs[m];
            var ysig=m_timeseries_stats.overall_stdev;
            var y0domain=[ymu-7*ysig/m_amp_factor,ymu+7*ysig/m_amp_factor];
            var y0scale = d3.scaleLinear().domain(y0domain).range(y0range);
            var y0_axis=d3.axisLeft().scale(y0scale).ticks(0);

            gg.append("g") // Add the Y Axis
                .attr("class", "y axis")
                .attr("transform",'translate('+(info.padding_left-5)+', '+(0)+')')
                .call(y0_axis);

            // text label for the y axis
            gg.append('text')
                .attr("transform",'translate('+(info.padding_left-15)+', '+(y0range[0]+y0range[1])/2+')')
                .style("text-anchor", "end")
                .text("Ch. "+channels[m]);

            var ydata0=d3.range(t2-t1+1); //todo: use something like d3.zeros
            var data0=[];
            for (var i=0; i<t2-t1+1; i++) {
                if (t1+i<TS.numTimepoints()) {
                    //Note that sometimes the value was coming out as NaN. Not sure why. Debugged for a long time. Just replacing with zero for now.
                    data0.push({x:xdata[i],y:chunk.value(channels[m]-1,t1+i-t1)||0});
                }
            }
            var line=d3.line()
                .x(function(d) {return info.xscale(d.x);})
                .y(function(d) {return y0scale(d.y);});
            var path=gg.append("path") // Add the line path from the data
                .attr("d", line(data0));
            $(path.node()).css({fill:"none",stroke:color,"stroke-width":1});
        }
    }
    var compute_timeseries_stats_timestamp=0;
    var compute_timeseries_stats_scheduled=false;
    function schedule_compute_timeseries_stats() {
        if (compute_timeseries_stats_scheduled) return;
        compute_timeseries_stats_scheduled=true;
        var msec=100;
        var elapsed=(new Date())-compute_timeseries_stats_timestamp;
        if (elapsed>100) msec=0;
        setTimeout(function() {
            compute_timeseries_stats_scheduled=false;
            do_compute_timeseries_stats();
            compute_timeseries_stats_timestamp=new Date();
        },msec);
    }
    function get_channels() {
        if (m_channels) return m_channels;
        var channels=[];
        if (!m_timeseries_model) return [];
        for (var mm=1; mm<=m_timeseries_model.numChannels(); mm++) {
            channels.push(mm);
        }
        return channels;
    }
    function do_compute_timeseries_stats() {
        var channels=get_channels();
        var M=channels.length;
        //var M=m_timeseries_model.numChannels();
        var N=m_timeseries_model.numTimepoints();
        m_timeseries_stats={};
        var S=m_timeseries_stats;
        S.channel_means=[];
        S.channel_stdevs=[];
        S.overall_stdev=0;
        for (var m=0; m<M; m++) {
            S.channel_means.push(0);
            S.channel_stdevs.push(0);
        }

        var chunk=m_timeseries_model.getChunk({t1:0,t2:Math.min(N-1,30000)});
        if (!chunk) {
            //perhaps has not been retrieved yet
            schedule_compute_timeseries_stats();
            return;
        }
        var count=0;
        var overall_count=0,overall_sum=0,overall_sumsqr=0;
        for (var n=0; n<chunk.N2(); n++) {
            count++;
            for (var m=0; m<M; m++) {
                var val=chunk.value(channels[m]-1,n);
                S.channel_means[m]+=val; //sum for now
                S.channel_stdevs[m]+=val*val; //sum of squares for now
                overall_sum+=val;
                overall_sumsqr+=val*val;
                overall_count++;
            }
        }

        /*
    var sampling_interval=Math.max(1,Math.ceil(N/1000));
    var count=0;
    var overall_count=0,overall_sum=0,overall_sumsqr=0;
    for (var n=0; n<N; n+=sampling_interval) {
      count++;
      for (var m=0; m<M; m++) {
        var val=m_timeseries_model.value(m,n);
        S.channel_means[m]+=val; //sum for now
        S.channel_stdevs[m]+=val*val; //sum of squares for now
        overall_sum+=val;
        overall_sumsqr+=val*val;
        overall_count++;
      }
    }
    */

        for (var m=0; m<M; m++) {
            var a=S.channel_means[m];
            var b=S.channel_stdevs[m];
            S.channel_means[m]=a/count;
            S.channel_stdevs[m]=Math.sqrt(b/count-a*a/(count*count));
        }
        S.overall_stdev=Math.sqrt(overall_sumsqr/overall_count-overall_sum*overall_sum/(overall_count*overall_count));
        that._scheduleRefresh();
    }
    function amp_down() {
        that.m_amp_factor/=1.2;
        that._scheduleRefresh();
    }
    function amp_up() {
        that.m_amp_factor*=1.2;
        that._scheduleRefresh();
    }
    function setTimeseriesModel(X) {
        m_timeseries_model=X;
        that._setNumTimepoints(X.numTimepoints());
        that._scheduleRefresh();
    }
    function setFiringsModel(X) {
        m_firings_model=X;
        that._scheduleRefresh();
    }
    function setChannels(channels) {
        if (typeof(channels)=='string') {
            let list=channels.split(',');
            channels=[];
            for (let i=0; i<list.length; i++) {
                channels.push(Number(list[i]));
            }
        }
        m_channels=JSON.parse(JSON.stringify(channels));
        that._scheduleRefresh();
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
