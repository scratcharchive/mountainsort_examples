#!/bin/sh

set -e

mlp-run synthesize_v1.mlp synthesize --samplerate=30000 --duration=600 --timeseries=data/raw.mda --geom=data/geom.csv --waveforms_true=data/waveforms_true.mda --firings_true=data/firings_true.mda --num_channels=10 --num_units=50

mlp-run mountainsort3.mlp sort --raw=data/raw.mda --geom=data/geom.csv --firings_out=data/firings.mda --_params=params.json --curate=true

mp-run-process ms3.confusion_matrix --firings1=data/firings_true.mda --firings2=data/firings.mda --confusion_matrix_out=data/confusion_matrix.mda

mp-run-process pyms.compute_accuracies --confusion_matrix=data/confusion_matrix.mda --output=data/accuracies.json

cat data/accuracies.json

echo ""


