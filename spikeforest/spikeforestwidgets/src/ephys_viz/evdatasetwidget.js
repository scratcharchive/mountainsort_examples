exports.EVDatasetWidget = EVDatasetWidget;

import './ml-layout.css'
import 'bootstrap/dist/css/bootstrap.css'

const TimeseriesModel = require(__dirname + '/timeseriesmodel.js').TimeseriesModel;
const FiringsModel=require('./firingsmodel.js').FiringsModel;
const KBClient = require('kbclient').v1;

const GeomWidget = require(__dirname + '/geomwidget.js').GeomWidget;
const TimeseriesWidget = require(__dirname + '/timeserieswidget.js').TimeseriesWidget;
const load_binary_file_part=require('./load_binary_file_part.js').load_binary_file_part;

const EventEmitter = require('events');
const Mda = require(__dirname + '/mda.js').Mda;

class MyEmitter extends EventEmitter {};

function EVDatasetWidget() {
  var that = this;

  this.element = function() {
    return m_element;
  };
  this.setDatasetDirectory = function(dataset_directory) {
    if (m_dataset_directory == dataset_directory) return;
    m_dataset_directory = dataset_directory;
    m_dataset.setDirectory(m_dataset_directory);
    m_dataset.initialize();
  };
  this.setFirings = function(firings) {
    view_context.firings=firings;
  };
  this.setVisibleChannels = function(visible_channels) {
    console.log('setting visible channels: '+visible_channels);
    view_context.visible_channels=visible_channels;
  };

  let m_element = $(`
        <div class="EVDatasetWidget ml-hlayout">
        <div class="ml-hlayout-item" style="flex:0 0 300px; border:solid 1px lightgray; padding:15px">
            <span id=left_panel>
            </span>
        </div>
        <div class="ml-hlayout-item" style="flex:1; padding:15px">
            <span id=view_holder></span>
        </div>
        </div>
    `);
  let m_dataset_directory = '';
  let m_params = {};
  let m_dataset = new EVDataset();

  let view_context = {
    dataset: m_dataset,
    firings: null,
    visible_channels: null
  };

  let m_views = [];
  m_views.push(new _SummaryView(view_context));
  m_views.push(new _GeometryView(view_context));
  m_views.push(new _TimeseriesView(view_context));

  let m_left_panel = new LeftPanel(m_views);
  m_left_panel.onOpenView(open_view);
  m_element.find('#left_panel').append(m_left_panel.element());

  function initialize() {
    m_dataset.initialize();
  }

  function open_view(V) {
    for (var i in m_views) {
      let V0 = m_views[i];
      if (V0._initialized)
        V0.element().detach();
    }
    if (!V._initialized) {
      V.initialize();
      V._initialized = true;
    }
    m_element.find('#view_holder').empty();
    m_element.find('#view_holder').append(V.element());
    m_left_panel.setCurrentView(V);
  }
  open_view(m_views[0]);
}

function LeftPanel(views) {
  this.element = function() {
    return m_element;
  };
  let m_emitter = new MyEmitter();
  this.onOpenView = function(handler) {
    m_emitter.on('open_view', handler);
  };
  this.setCurrentView = function(V) {
    m_current_view = V;
    refresh();
  }

  let m_element = $(`
        <div class="ml-vlayout LeftPanel">
            <ul id=view_list style="list-style-type: none; padding:0; margin:0">
            <ul>
        </div>
        `);
  let m_current_view = null;

  function refresh() {
    var ul = m_element.find('#view_list');
    ul.empty();
    for (let i in views) {
      let V = views[i];
      let link = create_view_link(V);
      let li = $('<li />');
      li.append(link);
      ul.append(li);
      if (V==m_current_view) {
        li.css({"font-weight":"bold"});
        li.find('a').css({"color":"darkblue"});
      }
    }
  }



  function create_view_link(V) {
    let link = $(`<a href=# style="color:black">${V.label()}</a>`);
    link.click(function() {
      m_emitter.emit('open_view', V);
    });
    return link;
  }

  refresh();
}

function _SummaryView(view_context) {
  this.initialize = function() {
    initialize();
  };
  this.element = function() {
    return m_summary_view.element();
  };
  this.label = function() {
    return 'Dataset summary';
  };
  this.refresh = function() {
    m_summary_view.refresh()
  };

  let m_summary_view = null;

  function initialize() {
    m_summary_view = new EVDatasetSummaryView(view_context.dataset);
    view_context.dataset.onChanged(function() {
      m_summary_view.refresh();
    });
    m_summary_view.refresh();
  }
}

function _GeometryView(view_context) {
  this.initialize = function() {
    initialize();
  };
  this.element = function() {
    return m_geom_widget.div();
  };
  this.label = function() {
    return 'Geometry';
  };
  this.refresh = function() {
    refresh();
  };

  let m_geom_widget = null;

  function initialize() {
    m_geom_widget = new GeomWidget();
    view_context.dataset.onChanged(function() {
      refresh();
    });
    refresh();
  }

  function refresh() {
    if (view_context.visible_channels) {
      m_geom_widget.setVisibleChannels(view_context.visible_channels);
    }
    view_context.dataset.getGeomText(function(txt) {
      if (txt) {
        m_geom_widget.setGeomText(txt);
      }
    });
  }
}

function _TimeseriesView(view_context) {
  this.initialize = function() {
    initialize();
  };
  this.element = function() {
    return m_timeseries_widget.div();
  };
  this.label = function() {
    return 'Timeseries';
  };
  this.refresh = function() {
    refresh();
  };

  let m_timeseries_widget = null;

  function initialize() {
    m_timeseries_widget = new TimeseriesWidget();
    let X = new TimeseriesModel(view_context.dataset.directory() + '/raw.mda', view_context.dataset.params());
    X.initialize(function(err) {
      if (err) {
        throw 'Error initializing timeseries model: ' + err;
      }
      m_timeseries_widget.setTimeseriesModel(X);
      if (view_context.visible_channels)
        m_timeseries_widget.setChannels(view_context.visible_channels);
      if (view_context.firings) {
        load_firings_model(view_context.firings,function(err,model) {
          if (err) {
            throw 'Error initializing firings model: ' + err;
          }
          m_timeseries_widget.setFiringsModel(model);
        });
      }
    });
  }

  function load_firings_model(firings,callback) {
    if (firings) {
      let KBC=new KBClient();
      KBC.readBinaryFilePart(firings, {})
        .then(function(buf) {
          var X=new Mda();
          X.setFromArrayBuffer(buf);
          FM=new FiringsModel(X);
          callback(null,FM);
        })
        .catch(function(err) {
          callback(`Error loading firings file: ${firings}: ${err.message}`);
          return;
        });
    }
    else {
      callback();
    }
  }

  function refresh() {
  }
}

function EVDataset() {
  this.setDirectory = function(directory) {
    m_directory = directory;
  };
  this.initialize = function() {
    initialize();
  };
  this.directory = function() {
    return m_directory;
  };
  this.params = function() {
    return JSON.parse(JSON.stringify(m_params));
  };
  this.onChanged = function(handler) {
    m_emitter.on('changed', handler);
  };
  this.getGeomText = function(callback) {
    getGeomText(callback);
  };

  let m_params = {};
  let m_emitter = new MyEmitter();
  let m_files = {};
  let m_dirs = {};
  let m_directory = '';

  function initialize() {
    let KBC = new KBClient();
    KBC.readDir(m_directory, {})
      .then(function(xx) {
        m_files = xx.files;
        if (m_files['params.json']) {
          load_params_file(m_directory + '/params.json', function() {
            initialize_params();
          });
        } else {
          initialize_params();
        }
      })
      .catch(function(err) {
        console.error('Error reading directory: ' + err);
      });
  }

  function initialize_params() {
    if (m_files['raw.mda']) {
      let X = new TimeseriesModel(m_directory + '/raw.mda', m_params);
      X.initialize(function(err) {
        if (err) {
          throw 'Error initializing timeseries model: ' + err;
        }
        m_params['directory'] = m_directory;
        m_params['num_channels'] = X.numChannels();
        m_params['num_samples'] = X.numTimepoints();
        m_params['dtype'] = X.dtype();
        m_emitter.emit('changed');
      });
    }
  }

  function load_params_file(params_fname, callback) {
    let KBC = new KBClient();
    KBC.readTextFile(params_fname)
      .then(function(txt) {
        m_params = JSON.parse(txt);
        m_emitter.emit('changed');
        callback();
      })
      .catch(function(err) {
        console.error('Error loading parameter file: ' + err);
        return;
      });
  }

  function getGeomText(callback) {
    if (!m_files['geom.csv']) {
      callback(null);
      return;
    }
    let KBC = new KBClient();
    KBC.readTextFile(m_directory + '/geom.csv')
      .then(function(txt) {
        callback(txt);
      })
      .catch(function(err) {
        console.error('Error loading geom file: ' + err);
        callback(null);
      });
  }
}

function EVDatasetSummaryView(EVD) {
  this.element = function() {
    return m_element;
  };
  this.refresh = function() {
    refresh();
  };
  let m_element = $(`
        <div>
        <table class=table>
            <tr>
                <th>directory</th>
                <td><span id=directory></span></td>
            </tr>
            <tr>
                <th>num_channels</th>
                <td><span id=num_channels></span></td>
            </tr>
            <tr>
                <th>num_samples</th>
                <td><span id=num_samples></span></td>
            </tr>
            <tr>
                <th>samplerate (Hz)</th>
                <td><span id=samplerate></span></td>
            </tr>
            <tr>
                <th>duration (min)</th>
                <td><span id=duration_min></span></td>
            </tr>
            <tr>
                <th>dtype</th>
                <td><span id=dtype></span></td>
            </tr>
            <tr>
                <th>spike_sign</th>
                <td><span id=spike_sign></span></td>
            </tr>
        </table>
        </div>
    `);

  /*
  m_element.find('th').css({
    "max-width": "30px"
  });
  */

  function refresh() {
    let samplerate=Number(EVD.params().samplerate||0);
    let num_samples=Number(EVD.params().num_samples||0);
    let duration_min=num_samples/samplerate/60;
    let directory_elmt=create_directory_elmt(EVD.params().directory||'');
    m_element.find('#directory').empty();
    m_element.find('#directory').append(directory_elmt);
    m_element.find('#num_channels').html(EVD.params().num_channels || undefined);
    m_element.find('#num_samples').html(num_samples);
    m_element.find('#samplerate').html(samplerate);
    m_element.find('#duration_min').html(duration_min);
    m_element.find('#dtype').html(EVD.params().dtype || undefined);
    m_element.find('#spike_sign').html(EVD.params().spike_sign || EVD.params().detect_sign || undefined);
  }

  function create_directory_elmt(directory) {
    if (directory.startsWith('kbucket://')) {
        let str=directory.slice(('kbucket://').length);
        let list=str.split('/');
        let kbshare_id=list[0]||'';
        let subdirectory=str.slice(kbshare_id.length+1);
        let url=`https://kbucketgui.herokuapp.com/?share=${kbshare_id}&subdirectory=${subdirectory}`;
        return $(`<a href="${url}" target="_blank">${directory}</a>`);
    }
    else {
        return $(`<span>${directory}</span>`);
    }
  }
}