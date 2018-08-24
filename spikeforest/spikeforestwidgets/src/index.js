import React from "react";
import ReactDOM from "react-dom";

const registered_widgets={
	DatasetSelectWidget:require(__dirname+'/datasetselectwidget/datasetselectwidget.js')
};

console.log(registered_widgets);

window.render_widget=function(widget_name,props,element) {
	console.log('props:');
	console.log(props);
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

/*
import Select from 'react-select';

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' }
];

class SomeOptions extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
	    selectedOption: 'chocolate',
	  };
	  this.handleChange = this.handleChange.bind(this);
	}
  
  handleChange(selectedOption) {
    this.setState({ selectedOption });
    console.log(`Option selected:`, selectedOption);
  }
  render() {
    const { selectedOption } = this.state;

    console.log(selectedOption);
    console.log(options);
    return (
      <Select
        value={selectedOption}
        onChange={this.handleChange}
        options={options}
      />
    );
  }
}
*/


class CustomForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            inputText: "Willson"
        };

        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(e) {
        const inputText = e.target.value;
        this.setState({ inputText });
    }

    render() {
        return (
            <div className="custom-form">
                <div className="custom-form-header">
                    <p>Hello, {this.state.inputText}</p>
                </div>
                <div className="custom-form-body">
                    <input type="text"
                           value={this.state.inputText}
                           onChange={this.handleInputChange} />
                </div>
            </div>
        );
    }
}

/*
const registered_components={
	CustomForm:CustomForm,
	//SomeOptions:SomeOptions,
	TestTable:TestTable
};
*/




