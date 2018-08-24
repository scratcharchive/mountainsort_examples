import jp_proxy_widget
import os

dirname=os.path.dirname(os.path.realpath(__file__))

def createWidget(component,props):
    W=jp_proxy_widget.JSProxyWidget()
    W.state={}
    def on_state_changed(state0):
        W.state=state0
    W.load_js_files([dirname+'/dist/main.js'])
    W.js_init('''
    element.empty();
    props.onStateChanged=function(state) {{
        console.log('on_state_changed',state);
        on_state_changed(state);
        console.log('test');
    }};
    X=window.render_widget('{}',props,element);
    '''.format(component),props=props,on_state_changed=on_state_changed)
    
    return W

class DatasetSelectWidget:
    def __init__(self,datasets):
        self._datasets=datasets
        self._widget=createWidget('DatasetSelectWidget',dict(datasets=datasets))
    def display(self):
        display(self._widget)
    def selectedDataset(self):
        if 'selectedDatasetId' in self._widget.state:
            id=self._widget.state['selectedDatasetId']
            return self._find_dataset(id)
        else:
            return None
    def _find_dataset(self,id):
        for ds in self._datasets:
            if ds['id']==id:
                return ds
        return None