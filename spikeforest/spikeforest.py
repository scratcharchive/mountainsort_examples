import os
from mountainlab_pytools import mdaio
from mountainlab_pytools import mlproc as mlp
import vdom
import jp_proxy_widget
import ipywidgets as widgets

def add_run_to_pipeline(run, output_base_dir, verbose='minimal'):
    DS=run['dataset']
    ALG=run['alg']
    print(':::: Applying '+ALG['name']+' to '+DS['id'])
    dsdir=DS['raw_path']
    dsid=DS['id']
    algname=ALG['name']
    output_dir=output_base_dir+'/'+dsid+'--'+algname
    run['output_dir']=output_dir
    ALG['run'](
        dataset_dir=dsdir,
        output_dir=output_dir
    )
    summarize_sorting_results(
        dataset_dir=dsdir,
        sorting_output_dir=output_dir,
        output_dir=output_dir+'/summary',
        opts={'verbose':verbose}
    )
    ## TODO: Think of better term
    validate_sorting_results(
        dataset_dir=dsdir,
        sorting_output_dir=output_dir,
        output_dir=output_dir+'/validation',
        opts={'verbose':verbose}
    )

def summarize_sorting_results(*,dataset_dir,sorting_output_dir,output_dir,opts):
    if not os.path.exists(output_dir):
        os.mkdir(output_dir)
    compute_templates(timeseries=dataset_dir+'/raw.mda',firings=sorting_output_dir+'/firings.mda',templates_out=output_dir+'/templates.mda')
    
def compute_templates(*,timeseries,firings,templates_out,opts={}):
    return mlp.addProcess(
        'ephys.compute_templates',
        {
            'timeseries':timeseries,
            'firings':firings
        },
        {
            'templates_out':templates_out
        },
        {},
        opts
    )['outputs']['templates_out']

def validate_sorting_results(*,dataset_dir,sorting_output_dir,output_dir,opts):
    if not os.path.exists(output_dir):
        os.mkdir(output_dir)

    compare_ground_truth(
        firings=sorting_output_dir+'/firings.mda',
        firings_true=dataset_dir+'/firings_true.mda',
        json_out=output_dir+'/compare_ground_truth.json'
    )
    
def compare_ground_truth(*,firings,firings_true,json_out,opts={}):
    return mlp.addProcess(
        'ephys.compare_ground_truth',
        dict(
            firings=firings,
            firings_true=firings_true
        ),
        dict(
            json_out=json_out
        ),
        dict(),
        opts
    )['outputs']['json_out']

def get_run_output(run):
    out={}
    ds=run['dataset']
    alg=run['alg']
    out['dataset']=ds
    out['alg']={'name':alg['name']}
    out['output_dir']=run['output_dir']
    return out

def ephys_viz(*,params,title='View',external_link=False,height=450):
    if external_link:
        query=''
        for key in params:
            query=query+'{}={}&'.format(key,params[key])
        href='https://ephys-viz.herokuapp.com/?{}'.format(query)
        display(vdom.a(title,href=href,target='_blank'))
    else:
        if title:
            display(vdom.h3(title))
        W=jp_proxy_widget.JSProxyWidget()
        W.load_js_files(['ephys-viz/web/bundle.js'])
        W.load_js_files(['ephys-viz/node_modules/d3/dist/d3.min.js'])
        W.load_css('ephys-viz/node_modules/bootstrap/dist/css/bootstrap.min.css')
        W.load_css('ephys-viz/web/ml-layout.css')
        display(W)
        W.js_init('''
            element.empty()
            window.init_ephys_viz(params,element);
            element.css({height:height,overflow:'auto'})
        ''',params=params,height=height)
        
class RunSelector:
    def __init__(self,sf_output):
        self._sf_output=sf_output
        self._W=None
        pass
    def display(self):
        options=[]
        output=self._sf_output
        for i in range(len(output['runs'])):
            run=output['runs'][i]
            options.append(run['dataset']['id']+' ::: '+run['alg']['name'])
        self._W=widgets.Select(options=options)
        display(self._W)
    def selectedRun(self):
        return self._sf_output['runs'][self._W.index]
        
def view_dataset(dataset,external_link=False,height=450):
    dataset_id=dataset['id']
    raw_path=dataset['raw_path']
    ephys_viz(params={'view':'dataset','dataset':raw_path},title='Dataset: {}'.format(dataset_id),external_link=external_link,height=height)