# MountainSort

MountainSort is spike sorting software. It is part of MountainLab, a larger framework for conducting reproducible and shareable data analysis.
 
## Installation and basic usage

### Overview
 
There are many ways to use MountainSort and MountainLab, and there is not one set of installation instructions that will fit all use cases. We welcome contributions to the documentation and software.

The core MountainSort algorithm is implemented in a python package called [ml_ms4alg](https://github.com/magland/ml_ms4alg) that is available via github, pypi, and conda. The pre- and post-processing methods as well as other, more general utilities for working with electrophysiology datasets are found in a second python package called [ml_ephys](https://github.com/magland/ml_ephys), also available via github, pypi, and conda. Some legacy packages (ml_ms3 and ml_pyms) are also available on github and as conda packages.

The recommended way to use these packages is through [MountainLab](https://github.com/flatironinstitute/mountainlab-js). This allows all the processing routines to be called from a single common interface, either from command line, bash scripts, python scripts, jupyter notebooks, or other high level languages. The framework also enables operating on remote data using remote processing resources and supports encapsulating processors in [Singularity](https://www.singularity-hub.org/) containers. It also facilitates sharing of data, processing pipelines, and spike sorting results.

### Installation options

<details>
<summary>
Installation with conda (recommended)
</summary>

To install using conda, first [install miniconda (or anaconda)](https://github.com/flatironinstitute/mountainlab-js/blob/master/docs/conda.md). If you are not a conda user you may be wary of doing this since, by default, it injects itself into your system path and can cause conflicts with other installed software. However, there are relatively simple remedies for this issue, and conda in general is working to solve this in the default. Some details are [here](https://github.com/flatironinstitute/mountainlab-js/blob/master/docs/conda.md). 

After you have installed Miniconda and have created and activated a new conda environment, you can install the required MountainLab and MountainSort packages via:

```
conda install -c flatiron -c conda-forge \
			mountainlab \
			mountainlab_pytools \
			ml_ephys \
			ml_ms3 \
			ml_ms4alg \
			ml_pyms
```

At a later time you can update these packages via:

```
conda update -c flatiron -c conda-forge \
			mountainlab \
			etc...
```

You can test the installation by running

```
ml-list-processors
```

You should see a list of a few dozen processors. These are individual processing steps that can be pieced together to form a processing pipeline. You can get information on any particular processor via

```
ml-spec [processor_name] -p
```

More information about MountainLab and creating custom processors can be found in the [MountainLab documentation](https://github.com/flatironinstitute/mountainlab-js/blob/master/README.md). You may want to inspect the MountainLab configuration, and adjust the settings, such as where temporary data files are stored, by running

```
ml-config
```

You should also install the ephys-viz package which allows basic visualization of ephys datasets and the results of spike sorting:

```
conda install -c flatiron -c conda-forge ephys-viz
```

MountainView is an older (but more functional) GUI that can be installed via

```
conda install -c flatiron -c conda-forge qt-mountainview
```

Remember to periodically update these packages using the `conda update` command as shown above.

</details>


<details>
<summary>
Installation without conda
</summary>

If you choose not to (or cannot) use conda, you can alternatively install the software from source or by using the pip and npm package managers. Note that the ml_ms3 and qt-mountainview conda packages cannot be installed via (non-conda) package manager since they require Qt5/C++ compilation.

Instructions on installing MountainLab and mountainlab_pytools can be found in the [MountainLab documentation](https://github.com/flatironinstitute/mountainlab-js/blob/master/README.md).

To install the ml_ms4alg, ml_ephys, and ml_pyms packages without using conda, the first step is to use pip (and python 3.6 or later):

```
pip install ml_ms4alg
pip install ml_ephys
pip install ml_pyms
```

Then you must link those packages into the directory where MountainLab can find them. There is a convenience function for this distributed with mountainlab as described in [the docs](https://github.com/flatironinstitute/mountainlab-js/blob/master/README.md):

```
ml-link-python-module ml_ms4alg `ml-config package_directory`/ml_ms4alg
ml-link-python-module ml_ephys `ml-config package_directory`/ml_ephys
ml-link-python-module ml_pyms `ml-config package_directory`/ml_pyms
```

This creates a symbolic link to the installed python module directory from within the MountainLab package directory. If you are in not in a conda environment, this location is by default `~/.mountainlab/packages`.

To confirm that these processing packages have been installed properly, try the `ml-list-processors`, `ml-spec`, and `ml-config` commands as above.

You can also install ephys-viz using npm:

```
npm install -g ephys-viz
```

It is possible to install ml_ms3 and qt-mountainview from source, but we are gradually moving away from these packages, so if you need them, I recommend following the conda instructions above.

</details>

<details>
<summary>
Developer installation
</summary>

If you want to help develop the framework, or if you for some reason want to avoid using the above package managers, you can install everything from source. Developer installation instructions for MountainLab can be found in [the docs](https://github.com/flatironinstitute/mountainlab-js/blob/master/README.md).

As for the processor packages, use the following to determine where MountainLab expects packages to be:

```
ml-config package_directory
```

If you are not in a conda environment, this should default to `~/.mountainlab/packages`. This is where you should put the processing packages. For convenience it is easiest to develop them elsewhere and create symbolic links.

How you should install the processing packages depends on whether you want to just use them or if you want to modify/develop them. In the former case, just clone the repositories and then use `pip` and `ml-link-python-module` as follows:


```
git clone https://github.com/magland/ml_ms4alg
pip install ml_ms4alg
ml-link-python-module ml_ms4alg `ml-config package_directory`/ml_ms4alg
```

On the other hand, if you plan to modify or develop the code then you should instead do the following

```
git clone https://github.com/magland/ml_ms4alg

# PYTHONPATH affects where pip searches for python modules $
export PYTHONPATH=[fill-in-path]/ml_ms4alg:$PYTHONPATH

ml-link-python-module ml_ms4alg `ml-config package_directory`/ml_ms4alg
```

But it is important that you also install all of the dependencies found in `setup.py` using pip3. The `export` command should also be appended to your `~/.bashrc` file.

A similar procedure applies to the `ml_ephys` package, and something similar can be done for `ml_pyms`. The `ml_ms3` package involves Qt5/C++ and is more complicated to compile.

Installation of `ephys-viz` is similar to that of `mountainlab-js`. Follow the above instructions, substituting `ephys-viz` for `mountainlab-js`.

</details>

## Getting started

### Prepare datasets in MountainSort format

To use MountainSort with your own data, you should prepare datasets in the following directory structure:

```
study_directory/
  dataset1/
    raw.mda
    geom.csv
    params.json
  dataset2/
    ...
```

Details on the contents of these files can be found [here](docs/preparing_datasets.md).

### Simple bash example

The recommended way to run MountainSort is via JupyterLab (or python scripts) as described below. But to illustrate basic usage without notebooks or python, a simple bash script example can be found at [bash_examples/001_ms4_bash_example](bash_examples/001_ms4_bash_example). See the [readme.md](bash_examples/001_ms4_bash_example/readme.md) file there. This example demonstrates how to call MountainLab-registered processors from the command line or using bash scripts.

### Accessing and interpreting outputs

The output of spike sorting for MountainSort is a single file named `firings.mda`. This contains a `R x L` array where `R` is at least 3 and `L` is the number of firing events.

The second row contains the integer time points (1-based indexing) of the firing events (in sample units).

The third row contains the integer labels or cluster IDs.

Depending on the algorithm, the first row may be all zeros, or may contain the integer channel (1-based indexing) corresponding to the primary channels for each firing event. The channel numbers correspond to the first (channel) dimension in the raw input timeseries.

Further rows may be used in the future for providing reliability metrics for individual events, or quantities that identify outliers.

We are working on various tools for visualizing the output, but for now you can use qt-mountainview, which can be installed via conda as described elsewhere:

```
qt-mountainview --raw=raw.mda --geom=geom.csv --firings=firings.mda --samplerate=30000
```

In this command, you need to replace the file names according to your directory setup.


### Jupyter notebooks

Some examples using Jupyter notebooks can be found in the `jupyter_examples/` directory. These require installation of jupyterlab and spikeforestwidgets, e.g., using conda

```
conda install jupyterlab
conda install -c flatiron -c conda-forge spikeforestwidgets
```

In addition, many of the examples depend on some jupyterlab extensions which can be installed as follows:

```
jupyter nbextension enable --py --sys-prefix jp_proxy_widget
jupyter labextension install @jupyter-widgets/jupyterlab-manager --no-build
jupyter labextension install jp_proxy_widget --no-build
jupyter lab build
```

The first example, [ms4_jupyter_example.ipynb](jupyter_examples/001_ms4_jupyter_example/ms4_jupyter_example.ipynb), shows how to create a synthetic dataset, run spike sorting, and compare with ground truth.

Another example, [example1.ipynb](jupyter_examples/example1/example1.ipynb), shows how to do the same thing, except that it runs processing in Singularity containers on a remote compute server. This is also a live web example that can be run without any installation.

### Sharing datasets

MountainLab makes it possible to share electrophysiology datasets by hosting them from your own computer so that you can take advantage of the web-based sorting capabilities. This is helpful for troubleshooting spike sorting issues, comparing methods, and collaborating on algorithm development. See [sharing_datasets.md](docs/sharing_datasets.md)
