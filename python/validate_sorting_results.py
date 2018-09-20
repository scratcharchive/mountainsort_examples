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

def count_matching_events(times1,times2,delta=20):
    times_concat=np.concatenate((times1,times2))
    membership=np.concatenate((np.ones(times1.shape)*1,np.ones(times2.shape)*2))
    indices=times_concat.argsort()
    times_concat_sorted=times_concat[indices]
    membership_sorted=membership[indices]
    diffs=times_concat_sorted[1:]-times_concat_sorted[:-1]
    inds=np.where((diffs<=delta)&(membership_sorted[0:-1]!=membership_sorted[1:]))[0]
    if (len(inds)==0):
        return 0
    inds2=np.where(inds[:-1]+1!=inds[1:])[0]
    return len(inds2)+1

def compare_ground_truth_helper(times1,labels1,times2,labels2):
    K1=int(np.max(labels1))
    K2=int(np.max(labels2))
    matching_event_counts=np.zeros((K1,K2))
    counts1=np.zeros(K1)
    for k1 in range(1,K1+1):
        times_k1=times1[np.where(labels1==k1)[0]]
        counts1[k1-1]=len(times_k1)
    counts2=np.zeros(K2)
    for k2 in range(1,K2+1):
        times_k2=times2[np.where(labels2==k2)[0]]
        counts2[k2-1]=len(times_k2)
    for k1 in range(1,K1+1):
        times_k1=times1[np.where(labels1==k1)[0]]
        for k2 in range(1,K2+1):
            times_k2=times2[np.where(labels2==k2)[0]]
            num_matching_events=count_matching_events(times_k1,times_k2)
            matching_event_counts[k1-1,k2-1]=num_matching_events
    pairwise_accuracies=np.zeros((K1,K2))
    for k1 in range(1,K1+1):
        for k2 in range(1,K2+1):
            if (counts1[k1-1]>0) or (counts2[k2-1]>0):
                matching_count=matching_event_counts[k1-1,k2-1]
                pairwise_accuracies[k1-1,k2-1]=matching_count/(counts1[k1-1]+counts2[k2-1]-matching_count)
    ret={
        "true_units":{}
    }
    for k1 in range(1,K1+1):
        k2_match=int(1+np.argmax(pairwise_accuracies[k1-1,:].ravel()))
        num_matches=matching_event_counts[k1-1,k2_match-1]
        num_false_positives=int(counts2[k2_match-1]-num_matches)
        num_false_negatives=int(counts1[k1-1]-num_matches)
        unit={
            "best_match":k2_match,
            "accuracy":pairwise_accuracies[k1-1,k2_match-1],
            "num_matches":num_matches,
            "num_false_positives":num_false_positives,
            "num_false_negatives":num_false_negatives
        }
        ret['true_units'][k1]=unit
    return ret
    
def compare_ground_truth(*,firings,firings_true,json_out,opts={}):
    Ft=mdaio.readmda(mlp.realizeFile(firings_true))
    F=mdaio.readmda(mlp.realizeFile(firings))
    times1=Ft[1,:]
    labels1=Ft[2,:]
    times2=F[1,:]
    labels2=F[2,:]
    out=compare_ground_truth_helper(times1,labels1,times2,labels2)
    with open(json_out, 'w') as outfile:
        json.dump(out, outfile, indent=4)
    
    
#def compare_ground_truth(*,firings,firings_true,json_out,opts={}):
#    return mlp.addProcess(
#        'ephys.compare_ground_truth',
#        dict(
#            firings=firings,
#            firings_true=firings_true
#        ),
#        dict(
#            json_out=json_out
#        ),
#        dict(),
#        opts
#    )['outputs']['json_out']

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
