#!/bin/sh

set -e

mlp-run synthesize_v1.mlp synthesize --samplerate=30000 --duration=600 --timeseries=raw.mda --geom=geom.csv --waveforms_true=waveforms_true.mda --firings_true=firings_true.mda --num_channels=10 --num_units=50

mlp-run mountainsort3.mlp sort --raw=raw.mda --geom=geom.csv --firings_out=firings.mda --_params=params.json --curate=true

mp-run-process ms3.confusion_matrix --firings1=firings_true.mda --firings2=firings.mda --confusion_matrix_out=confusion_matrix.mda

mp-run-process pyms.compute_accuracies --confusion_matrix=confusion_matrix.mda --output=accuracies.json

cat accuracies.json
