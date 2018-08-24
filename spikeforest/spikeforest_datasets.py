from mountainlab_pytools import mlproc as mlp
from jp_ephys_viz import ephys_viz_v1
import ipywidgets as widgets

def load_standard_datasets(verbose=True):
    datasets=[]
    
    groups=[
        dict(
            group_dir='kbucket://b5ecdf1474c5/datasets/synth_datasets/datasets',
            group_name='synth'
        ),
        dict(
            group_dir='kbucket://697623ec3681/kampff',
            group_name='kampff'
        ),
        dict(
            group_dir='kbucket://697623ec3681/boyden',
            group_name='boyden'
        ),
        dict(
            group_dir='kbucket://697623ec3681/bionet_8x',
            group_name='bionet_8x'
        ),
        dict(
            group_dir='kbucket://697623ec3681/mea256yger',
            group_name='mea256yger'
        )
    ]
    #groups=[groups[0]]
    
    for group in groups:
        group_dir=group['group_dir']
        group_name=group['group_name']
        if verbose:
            print('Reading '+group_dir);
        D=mlp.readDir(group_dir)
        for name in D['dirs']:
            datasets.append({
                "id":group_name+"--"+name,
                "raw_path":group_dir+'/'+name
            })
    
    return datasets

def view_dataset(dsdir,external_link=False,height=450,dataset_id='',firings='',visible_channels=None):
    params={'view':'dataset','dataset':dsdir}
    if firings:
        params['firings']=mlp.kbucketPath(firings)
    if visible_channels:
        if type(visible_channels)==list:
            visible_channels=','.join(str(x) for x in visible_channels)
        params['visible_channels']=visible_channels
    ephys_viz_v1(params=params,title='Dataset: {}'.format(dataset_id),external_link=external_link,height=height)
