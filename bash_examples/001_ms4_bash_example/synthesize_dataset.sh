#!/bin/bash

set -e

mkdir -p dataset

# Create some random spike waveforms
ml-run-process ephys.synthesize_random_waveforms \
	--outputs \
		waveforms_out:dataset/waveforms_true.mda.prv \
		geometry_out:dataset/geom.csv \
	--parameters \
		upsamplefac:13 \
		M:4 \
		average_peak_amplitude:100 \

# Create random firing event timings
ml-run-process ephys.synthesize_random_firings \
	--outputs \
		firings_out:dataset/firings_true.mda.prv \
	--parameters \
		duration:600

# Make a synthetic ephys dataset
ml-run-process ephys.synthesize_timeseries \
	--inputs \
		firings:dataset/firings_true.mda.prv \
		waveforms:dataset/waveforms_true.mda.prv \
	--outputs \
		timeseries_out:dataset/raw.mda.prv \
	--parameters \
		duration:600 \
		waveform_upsamplefac:13 \
		noise_level:10

# Create the params.json file
printf "{\n  \"samplerate\":30000,\n  \"spike_sign\":1\n}" > dataset/params.json

