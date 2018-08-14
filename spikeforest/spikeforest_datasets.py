from mountainlab_pytools import mlproc as mlp
from jp_ephys_viz import ephys_viz_v1
import ipywidgets as widgets

def all_datasets():
    datasets=[]
    datasets.append({
        "id":"synth_tetrode_30min",
        "raw_path":"kbucket://d97debc4bea2/spikeforest/datasets/synth_tetrode_30min"
    })
    datasets.append({
        "id":"synth_tetrode_120min",
        "raw_path":"kbucket://d97debc4bea2/spikeforest/datasets/synth_tetrode_120min"
    })
    datasets.append({
        "id":"synth_16ch_30min",
        "raw_path":"kbucket://d97debc4bea2/spikeforest/datasets/synth_16ch_30min"
    })

    # bionet_8x
    datasets.append({
        "id":"bionet_8x/static_8x_A_2A",
        "raw_path":"kbucket://4c21262c8704/static_8x_A_2A"
    })

    #datasets.append({
    #    "id":"synth_tetrode_30min",
    #    "raw_path":"kbucket://b5ecdf1474c5/datasets/synth_datasets/datasets/synth_tetrode_30min"
    #});
    #datasets.append({
    #    "id":"synth_tetrode_120min",
    #    "raw_path":"kbucket://b5ecdf1474c5/datasets/synth_datasets/datasets/synth_tetrode_120min"
    #});
    #datasets.append({
    #    "id":"synth_16ch_30min",
    #    "raw_path":"kbucket://b5ecdf1474c5/datasets/synth_datasets/datasets/synth_16ch_30min"
    #});
    
    return datasets

def find_dataset(id):
    datasets=all_datasets()
    for ds in datasets:
        if ds['id']==id:
            return ds
    return None

def view_dataset(dsdir,external_link=False,height=450,dataset_id='',firings=''):
    params={'view':'dataset','dataset':dsdir}
    if firings:
        params['firings']=mlp.kbucketPath(firings)
    ephys_viz_v1(params=params,title='Dataset: {}'.format(dataset_id),external_link=external_link,height=height)
    
def dataset_selection_box():
    datasets=all_datasets()
    dataset_ids=[]
    for ds in datasets:
        dataset_ids.append(ds['id'])
    print('Select a dataset:')
    SS=widgets.Select(
        options=dataset_ids,
        #value='',
        rows=10,
        #description='Select a dataset:',
        disabled=False
    )
    return SS