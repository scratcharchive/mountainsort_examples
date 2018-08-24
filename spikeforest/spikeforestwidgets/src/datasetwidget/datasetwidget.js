import React from "react";
import ReactDOM from "react-dom";

const EVDatasetWidget=require(__dirname+'/../ephys_viz/evdatasetwidget.js').EVDatasetWidget;

class DatasetWidget extends React.Component {
	constructor(props) {
      super(props);
      this.state = {};
      this.X=new EVDatasetWidget();
      this.X.setDatasetDirectory(props.dataset.raw_path);
      this.X.setVisibleChannels(props.visible_channels);
      //this.X=new GeomWidget();
  }

  componentDidMount() {
      const parent = ReactDOM.findDOMNode(this);
      $(parent).append(this.X.element());
  }
  componentWillUnmount() {
      const parent = ReactDOM.findDOMNode(this);
      this.X.element().remove();
  }
  shouldComponentUpdate() {
      return false;
  }
  render() {
  	let div_style={
  		height:600
  	};
    return (
        <div style={div_style}></div>
    );
  }
}

module.exports=DatasetWidget