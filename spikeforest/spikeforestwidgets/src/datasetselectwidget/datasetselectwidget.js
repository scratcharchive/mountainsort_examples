import React from "react";
import ReactDOM from "react-dom";
import { SelectList } from 'react-widgets';
import 'react-widgets/dist/css/react-widgets.css';

class DatasetSelectWidget extends React.Component {
	constructor(props) {
      super(props);
      this.state = {selectedDatasetId:''};
  }

  render() {
  	const {
  		datasets
  	} = this.props;

  	let ListItem = ({ item }) => (
		  <span>
		  	<span className={'fa fa-folder'}>
		  	</span>
		    {" " + item.id}
		  </span>
		);

		let div_style={
			overflow:'auto',
			height:300,
			width:600
		};

  	return (
  		<span>
  		<h3>Select dataset</h3>
  		<div style={div_style}>
		  <SelectList
		    data={datasets}
		    textField='id'
		    valueField='id'
		    onChange={
		    	(value) => {
		    		let state={ selectedDatasetId:value.id||'' };
		    		this.setState(state);
		    		this.props.onStateChanged(state);
		    	}
		    }
		    itemComponent={ListItem}
		  />
		  </div>
		  </span>
		);
	}
}

module.exports=DatasetSelectWidget