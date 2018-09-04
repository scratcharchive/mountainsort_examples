**This README is a work in progress**

MountainSort is spike sorting software. It is part of MountainLab, a larger framework for conducting reproducible and shareable data analysis.
 
## Installation and basic usage

### Overview
 
Since there are many ways to use MountainSort and MountainLab, and since every user has different constraints, there is not one set of installation instructions that will fit all use cases. The software is flexible enough to accommodate a wide range of these scenarios. Therefore, rather than provide a one-size-fits-all set of installation and usage instructions, I will describe the software tools available, the various ways they are packaged, and provide recommendations for how to proceed with installation depending on the application. In some cases there will be clear examples and recipes to follow. In other cases, you will want to become familiar with how the system is structured so you can utilize the tools in a way that makes the most sense for you. We welcome contributions to the documentation and software.

### The relationship between MountainSort and MountainLab

The core MountainSort algorithm is implemented in a python package called ml_ms4alg that is available via github [**link**], pypi [**link**], and conda [**link**]. The pre- and post-processing methods as well as other, more general utilities for working with electrophysiology datasets are found in a second python package called ml_ephys [**link**], also available via github, pypi, and conda. Some legacy packages (ml_ms3 and ml_pyms) are also available on github and as conda packages.

The recommended way to use these packages is through MountainLab, which is available via github [**link**], npm [**link**], and conda [**link**]. This allows all the processing routines to be called from a single common interface, either from command line, bash scripts, python scripts, jupyter notebooks, or other high level languages. The framework also enables operating on remote data using remote processing resources. It facilitates sharing of data, processing pipelines, and spike sorting results.

### Installation using conda
 
To install using conda, first install miniconda (or anaconda). If you are not a conda user you may be wary of doing this since, by default, it injects itself into your system path and can cause conflicts with other installed software. However, there are relatively simple remedies for this issue, and conda in general is working to solve this in the default. Miniconda installation details are here (**link needed**). 

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

More information about MountainLab and creating custom processors can be found elsewhere (**link needed**). You may want to inspect the MountainLab configuration, and adjust the settings, such as where temporary data files are stored, by running

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

### Installation using pip and npm

If you choose not to (or cannot) use conda, you can alternatively install the software from source or by using the pip and npm package managers. Note that the ml_ms3 and qt-mountainview conda packages cannot be installed via (non-conda) package manager since they require Qt5/C++ compilation.

MountainLab can be installed globally using npm

```
npm install -g mountainlab
```

If you experience permissions issues, see [this note] [**link needed**].

To install the ml_ms4alg, ml_ephys, and ml_pyms packages, the first step is to use pip:

```
pip3 install ml_ms4alg
pip3 install ml_ephys
pip3 install ml_pyms
```

Then you must link those packages into the directory where MountainLab can find them. There is a convenience function for this distributed with mountainlab:

```
ml-link-python-module ml_ms4alg `ml-config package_directory`/ml_ms4alg
ml-link-python-module ml_ephys `ml-config package_directory`/ml_ephys
ml-link-python-module ml_pyms `ml-config package_directory`/ml_pyms
```

This creates a symbolic link to the installed python module directory from within the MountainLab package directory. If you are in not in a conda environment, this location is by default `~/.mountainlab/packages`.

To confirm that these processing packages have been installed properly, try the `ml-list-processors`, `ml-spec`, and `ml-config` commands as above.

You can install ephys-viz using npm:

```
npm install -g ephys-viz
```

and mountainlab_pytools using pip:

```
pip3 install mountainlab_pytools
```

It is possible to install ml_ms3 and qt-mountainview from source, but we are moving away from these packages, so if you need them, I recommend following the conda instructions above.

### Compilating from source

If you want to help develop the framework, or if you for some reason want to avoid using the above package managers, you can install everything from source. For mountainlab, simply do:

```
git clone https://github.com/flatironinstitute/mountainlab-js
cd mountainlab-js
npm install
export PATH=[fill-in-path]/mountainlab-js/bin:$PATH
```

The last line should also be appended to your `~/.bashrc` file.

Now use the following to determine where MountainLab expects packages to be:

```
ml-config package_directory
```

If you are not in a conda environment, this should default to `~/.mountainlab/packages`. This is where you should put the processing packages. For convenience it is easiest to compile them elsewhere and then create symbolic links.

How you should install the processing packages depends on whether you want to just use them or if you want to modify/develop them. In the former case, just clone the repositories and then use `pip3` and `ml-link-python-module` as follows:


```
git clone https://github.com/magland/ml_ms4alg
pip3 install ml_ms4alg
ml-link-python-module ml_ms4alg `ml-config package_directory`/ml_ms4alg
```

On the other hand, if you plan to modify or develop the code then you should instead do the following

```
git clone https://github.com/magland/ml_ms4alg
export PYTHONPATH=[fill-in-path]/ml_ms4alg:$PYTHONPATH
ml-link-python-module ml_ms4alg `ml-config package_directory`/ml_ms4alg
```

But it is important that you also install all of the dependencies found in `setup.py` using pip3. The `export` command should also be appended to your `~/.bashrc` file.

A similar procedure applies to the `ml_ephys` package, and something similar can be done for `ml_pyms`. The `ml_ms3` package involves Qt5/C++ and is more complicated to compile.

Installation of `ephys-viz` is similar to that of `mountainlab-js`. Follow the above instructions, substituting `ephys-viz` for `mountainlab-js`.

### Getting started

The recommended way to run MountainSort is via JupyterLab (or python scripts) as described below. But first, a simple bash script example can be found at [bash_examples/001_ms4_bash_example](bash_examples/001_ms4_bash_example). See the [readme.md](bash_examples/001_ms4_bash_example/readme.md) file there. This example shows how to call MountainLab-registered processors from the command line or using bash scripts.

Some examples using Jupyter notebooks can be found in the `jupyter_examples/` directory.

