from mountainlab_pytools import mlproc as mlp
import os
import json

def read_dataset_params(dsdir):
    params_fname=mlp.realizeFile(dsdir+'/params.json')
    if not os.path.exists(params_fname):
        raise Exception('Dataset parameter file does not exist: '+params_fname)
    with open(params_fname) as f:
        return json.load(f)

def sort_dataset(dataset_dir,output_dir):
    if not os.path.exists(output_dir):
        os.mkdir(output_dir)
        
    # Dataset parameters
    ds_params=read_dataset_params(dataset_dir)
    
    detect_sign=1
    if 'spike_sign' in ds_params:
        detect_sign=ds_params['spike_sign']
    if 'detect_sign' in ds_params:
        detect_sign=ds_params['detect_sign']
    
    mlp.addProcess(
        'ironclust.sort',
        {
            'timeseries':dataset_dir+'/raw.mda',
            'geom':dataset_dir+'/geom.csv',
        },{
            'firings_out':output_dir+'/firings.mda'
        },
        {
            'samplerate':ds_params['samplerate'],
            'detect_sign':detect_sign,
            'prm_template_name':'tetrode_template.prm'
            #'should_cause_error':123
        },
        {
        }
    )