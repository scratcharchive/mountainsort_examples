import os, json
from mountainlab_pytools import mdaio
from mountainlab_pytools import mlproc as mlp
import numpy as np

def validate_sorting_results(*,dataset_dir,sorting_output_dir,output_dir):
    if not os.path.exists(output_dir):
        os.mkdir(output_dir)
        
    compare_ground_truth(
        firings=sorting_output_dir+'/firings.mda',
        firings_true=dataset_dir+'/firings_true.mda',
        json_out=output_dir+'/compare_ground_truth.json',
    )
    
    compute_templates(
        timeseries=dataset_dir+'/raw.mda',
        firings=dataset_dir+'/firings_true.mda',
        templates_out=output_dir+'/templates_true.mda.prv'
    )
    
    mlp.runPipeline()
    
    templates_true=mdaio.readmda(mlp.realizeFile(output_dir+'/templates_true.mda'))
    amplitudes_true=np.max(np.max(np.abs(templates_true),axis=1),axis=0)
    accuracies=get_accuracies(output_dir+'/compare_ground_truth.json')
    return dict(
        accuracies=accuracies,
        amplitudes_true=amplitudes_true
    )

def get_accuracies(fname):
    with open(fname,'r') as f:
        obj=json.load(f)
    true_units=obj['true_units']
    K=np.max([int(k) for k in true_units])
    units=[]
    for k in range(1,K+1):
        units.append(true_units[str(k)])
    accuracies=[unit['accuracy'] for unit in units]
    return accuracies
    
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

def compute_templates(*,timeseries,firings,templates_out=True,opts={}):
    return mlp.addProcess(
        'ephys.compute_templates',
        dict(
            firings=firings,
            timeseries=timeseries
        ),
        dict(
            templates_out=templates_out
        ),
        dict(),
        opts
    )['outputs']['templates_out']
