import React from "react";
import ReactDOM from "react-dom";

import $ from 'jquery';
window.jQuery = $;
window.$ = $;

const registered_widgets={
	DatasetSelectWidget:require(__dirname+'/datasetselectwidget/datasetselectwidget.js'),
  DatasetWidget:require(__dirname+'/datasetwidget/datasetwidget.js')
};

window.render_widget=function(widget_name,props,element) {
	const Index = function(props) {
	  return <div>Title: {props.title}</div>;
	};
	let C=registered_widgets[widget_name];
	if (!C) {
		console.error('No such widget: '+widget_name);
		return;
	}
	//console.log(C);
	//ReactDOM.render(React.createElement('Index',props), element[0]);
	//ReactDOM.render(<Index title={props.title} />, element[0]);
	//ReactDOM.render(React.createElement(Index,props), element[0]);
	return ReactDOM.render(React.createElement(C,props), element[0]);
};




