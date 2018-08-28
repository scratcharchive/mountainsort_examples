This example shows how to run the MountainSort v4 spike sorting algorithm using a bash script. This does not include the automated curation and is just intended to illustrate MountainLab usage from the command-line and using simple bash scripts. The recommended way to run spike sorting is by using python scripts in jupyterlab. See the documentation for more details.

First you must install the latest version of mountainlab and at least the following mountainlab packages (see docs for installation instructions):
* ml_ephys
* ml_ms4alg

In order to view the result you can also install ephys-viz and optionally qt-mountainview (see docs for installation instructions).

Create a synthetic dataset by running:

```
./synthesize_dataset.sh
```

This will create some files in the dataset/ directory. To view the dataset (using ephys-viz):

```
ev-dataset dataset
```

Next, run the spike sorting:

```
./ms4_sort_bash.sh
```

This should create an output directory with some files, including a `firings.mda` file.

Now, view the results using any of the following:

```
ev-templates output/templates.mda.prv
ev-timeseries dataset/raw.mda.prv --firings output/firings.mda.prv --samplerate=30000
qt-mountainview --raw dataset/raw.mda.prv --filt output/filt.mda.prv --pre output/pre.mda.prv --samplerate 30000 --firings output/firings.mda.prv
```
