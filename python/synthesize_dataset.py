import os
from mountainlab_pytools import mlproc as mlp
import json

def synthesize_dataset(dsdir,*,M,duration,average_snr,K=20):
    if not os.path.exists(dsdir):
        os.mkdir(dsdir)
    noise_level=10
    average_peak_amplitude=10*average_snr
    upsamplefac=13
    samplerate=30000
    mlp.addProcess(
        'ephys.synthesize_random_waveforms',
        dict(
        ),
        dict(
            waveforms_out=dsdir+'/waveforms_true.mda.prv',
            geometry_out=dsdir+'/geom.csv'
        ),
        dict(
            upsamplefac=upsamplefac,
            M=M,
            K=K,
            average_peak_amplitude=average_peak_amplitude
        )
    )
    mlp.addProcess(
        'ephys.synthesize_random_firings',
        dict(
        ),
        dict(
            firings_out=dsdir+'/firings_true.mda.prv'
        ),
        dict(
            duration=duration,
            samplerate=samplerate,
            K=K
        )
    )
    mlp.addProcess(
        'ephys.synthesize_timeseries',
        dict(
            firings=dsdir+'/firings_true.mda',
            waveforms=dsdir+'/waveforms_true.mda'
        ),
        dict(
            timeseries_out=dsdir+'/raw.mda.prv'
        ),
        dict(
            duration=duration,
            waveform_upsamplefac=upsamplefac,
            noise_level=noise_level,
            samplerate=samplerate
        )
    )
    params=dict(
        samplerate=samplerate,
        spike_sign=1
    )
    with open(dsdir+'/params.json','w') as f:
        json.dump(params,f)