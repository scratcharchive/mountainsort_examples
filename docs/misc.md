## Running these examples via epoxy

http://epoxyhub.org/?source=https://github.com/flatironinstitute/mountainsort_examples

Navigigate to jupyter_examples/example1 and open the example1.ipynb

Singularity... each MountainLab processing library can have a Singularity file. For example
https://github.com/magland/ml_ephys

Singularity-hub (https://www.singularity-hub.org/) can be configured to automatically build new Singularity images (aka containers) encapsulating the processors.

The following code tells mountainlab to use a particular version of the singularity image for ml_ephys for ALL processors that begin with the string 'ephys.'

```
mlp.addContainerRule(pattern='ephys.*',container='shub://magland/ml_ephys:v0.2.5')
```
