**This README document is a work in progress**

MountainSort is spike sorting software. It is part of MountainLab, which is a larger framework for conducting reproducible and shareable data analysis.
 
## Installation overview
 
Since there are many ways to use MountainSort and MountainLab, and since every user has different constraints, there is not one set of installation instructions that will fit all use cases. The software has been written to be flexible in order to accommodate a wide range of these scenarios. Therefore, rather than provide a one-size-fits all set of installation and usage instructions, I will describe the software tools available, the various ways they are packaged, and provide recommendations for how to proceed with installation depending on the application. In some cases there will be clear examples and recipes to follow. In other cases, you will want to become familiar with how the system is structured so you can utilize the tools in a way that makes the most sense for you. We welcome contributions to the documentation and software.
 
## Use cases
 
### Simplest case, sorting a single, relatively small dataset

In the simplest scenario, you may want to spike sort a relatively small tetrode dataset that fits completely into memory on your laptop. In that case you may be able to forgo the larger framework and simply use the python programs directly (see ml_ephys, ml_ms4alg, and ml_pyms below). Or you may want to take advantage of the conda packages for these MountainLab-plugins, and use bash or python scripts to call the various steps in the pipeline. I recommend the latter approach, although there are cases when you might want to use the python libraries directly. Something that might be confusing is that the low-level sorting algorithms are written in python, and the recommended way to create pipelines is also written in python. But this is not a strict language requirement -- high level scripts and low level processors are by design independent and can be written in any language (matlab or bash, mix and match, for example). Nevertheless, python is recommend.
 

