**This README is a work in progress**

MountainSort is spike sorting software. It is part of MountainLab, a larger framework for conducting reproducible and shareable data analysis.
 
## Installation and basic usage

### Overview
 
Since there are many ways to use MountainSort and MountainLab, and since every user has different constraints, there is not one set of installation instructions that will fit all use cases. The software has been written to be flexible in order to accommodate a wide range of these scenarios. Therefore, rather than provide a one-size-fits-all set of installation and usage instructions, I will describe the software tools available, the various ways they are packaged, and provide recommendations for how to proceed with installation depending on the application. In some cases there will be clear examples and recipes to follow. In other cases, you will want to become familiar with how the system is structured so you can utilize the tools in a way that makes the most sense for you. We welcome contributions to the documentation and software.
 
### Simplest case -- sorting a single, relatively small dataset

In the simplest scenario, you may want to spike sort a relatively small tetrode dataset that fits completely into memory on your laptop. In that case you may be able to forgo the larger framework and simply use the python programs directly (see ml_ephys, ml_ms4alg, and ml_pyms below). Or you may want to take advantage of the conda packages for these MountainLab-plugins, and use bash or python scripts to call the various steps in the pipeline. I recommend the latter approach, although there are cases when you might want to use the python libraries directly. Something that might be confusing is that the low-level sorting algorithms are written in python, and the recommended way to create pipelines is also written in python. But this is not a strict language requirement -- high level scripts and low level processors are by design independent and can be written in any language (matlab or bash, mix and match, for example). Nevertheless, python is recommend.
 
To install using conda, first install miniconda (or anaconda). If you are not a conda user you may be wary of doing this since conda by default injects itself onto your path and can cause conflicts with other installed software. However, there are relatively simple remedies for this issue, and conda in general is working to solve this in the default. Miniconda installation details are here (**link needed**). 

After you have installed Miniconda and have created and activated a new conda environment, you can install the required MountainLab and MountainSort packages via:

```
conda install -c flatiron -c conda-forge mountainlab mountainlab_pytools ml_ephys ml_ms3 ml_ms4alg ml_pyms
```

At a later time you can update these packages via:

```
conda update -c flatiron -c conda-forge mountainlab mountainlab_pytools ml_ephys ml_ms3 ml_ms4alg ml_pyms
```

You can test the installation by running

```
ml-list-processors
```

You should see a list of a few dozen processors. These are individual processing steps that can be pieced together to form a processing pipeline. You can get information on any particular processor via

```
ml-spec [processor_name] -p
```

More information about MountainLab and creating custom processors can be found elsewhere (**link needed**). You may want to inspect the MountainLab configuration, and adjust the settings, such as where temporary data files are stored by running

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

Now, within this conda environment, you are ready to test spike sorting. The first example is a simple bash script and is intended to demonstrate the basic usage of MountainLab using the command line and simple scripts. The recommended way to run processing is via python scripts and jupyterlab as described below. But for now, you can check out the bash script example at [bash_examples/001_ms4_bash_example](bash_examples/001_ms4_bash_example). See the [readme.md](bash_examples/001_ms4_bash_example/readme.md) file there.
