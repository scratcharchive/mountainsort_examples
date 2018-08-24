window.init_ephys_viz = function(PARAMS, parent_element) {
  if (!parent_element) {
    parent_element=$('#content');
  }
  if (PARAMS.view == 'timeseries') {
    require('./view_timeseries').view_timeseries(PARAMS, parent_element);
  } else if (PARAMS.view == 'templates') {
    require('./view_templates').view_templates(PARAMS, parent_element);
  } else if (PARAMS.view == 'sort_comparison') {
    require('./view_sort_comparison').view_sort_comparison(PARAMS, parent_element);
  } else if (PARAMS.view == 'cluster_metrics') {
    require('./view_cluster_metrics').view_cluster_metrics(PARAMS, parent_element);
  } else if (PARAMS.view == 'geometry') {
    require('./view_geometry').view_geometry(PARAMS, parent_element);
  } else if (PARAMS.view == 'dataset') {
    require('./view_dataset').view_dataset(PARAMS, parent_element);
  } else {
    throw Error('Unknown view: ' + PARAMS.view);
  }
};

/*
require('./timeserieswidget.js');
require('./templateswidget.js');
require('./geomwidget.js');
require('./clustermetricswidget.js');
require('./sortcomparisonwidget.js');

require('./view_timeseries.js');
require('./view_templates.js');
require('./view_geometry.js');
require('./view_cluster_metrics.js');
require('./view_sort_comparison.js');

*/