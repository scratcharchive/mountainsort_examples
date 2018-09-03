import os
from mountainlab_pytools import mdaio
from mountainlab_pytools import mlproc as mlp

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
