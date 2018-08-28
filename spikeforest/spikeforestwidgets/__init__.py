import jp_proxy_widget
import os
from IPython.display import Javascript

loaded_javascript_files={}
def load_javascript_file(fname):
    modified_timestamp=os.path.getmtime(fname)
    if fname in loaded_javascript_files:
        if loaded_javascript_files[fname]['mtime']==modified_timestamp:
            return
    with open(fname,'r') as f:
        js=f.read()
    print('Loading javascript: '+fname);
    display(Javascript(js))
    loaded_javascript_files[fname]=dict(mtime=modified_timestamp)
    
def reload_javascript():
    dirname=os.path.dirname(os.path.realpath(__file__))
    load_javascript_file(dirname+'/dist/main.js');
    
reload_javascript()

def createWidget(component,props):
    reload_javascript()
    W=jp_proxy_widget.JSProxyWidget()
    W.state={}
    def on_state_changed(state0):
        W.state=state0
    W.js_init('''
    element.empty();
    props.onStateChanged=function(state) {{
        on_state_changed(state);
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

class DatasetWidget:
    def __init__(self,dataset,visible_channels):
        self._dataset=dataset
        self._widget=createWidget('DatasetWidget',dict(dataset=dataset,visible_channels=visible_channels))
    def display(self):
        display(self._widget)