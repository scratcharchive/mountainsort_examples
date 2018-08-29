import os
from mountainlab_pytools import mdaio
from mountainlab_pytools import mlproc as mlp

def validate_sorting_results(*,dataset_dir,sorting_output_dir,output_dir):
    if not os.path.exists(output_dir):
        os.mkdir(output_dir)
        
    compare_ground_truth(
        firings=sorting_output_dir+'/firings.mda',
        firings_true=dataset_dir+'/firings_true.mda',
        json_out=output_dir+'/compare_ground_truth.json',
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
