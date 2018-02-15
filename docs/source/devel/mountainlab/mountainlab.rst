====================================================================================
MountainLab -- A framework for reproducible, transparent and shareable data analysis
====================================================================================

Processors
----------

A MountainLab processor is a program that operates on a well-defined set of input files and produces a collection of output files. In a programming language, such an entity would be called a function, a procedure, or a subroutine. The difference is that ML processors always operate on disk files, rather than on objects in memory. One such example would be a bandpass filter that operates on a multi-channel timeseries data file and produces a new file containing the filtered result.

In order to use such a processor in MountainLab, it must first be registered. There are two ways to register a library of processors. The first and simplest way is to create an executable file with a .mp extension that responds to the “spec” argument by returning the specification for the processors in JSON format. That executable .mp file should be placed in a directory that is searched by MountainLab. For example, MountainLab will always search for processor libraries in ~/.mountainlab/packages.

The JSON spec output by the .mp file has the following form:

.. code-block:: json

    {
        "processors": [P1,P2,...]
    }

where the P*'s are objects representing individual processors. These take the form

.. code-block:: json

    {
        "name": "{processor name}",
        "version": "{processor version}",
        "description": "{short description}",
        "inputs": [in1,in2,...],
        "outputs": [out1,out2,...],
        "parameters": [param1,param2,...],
        "opts": {{options}},
        "exe_command": "{dynamically generated run command}"
    }

The *name* should be a string that uniquely identifies the processor and is used in every call. The *version* string should be changed (e.g., incremented) whenever the underlying program changes. The inputs, outputs, and parameters are all objects of the form

.. code-block:: json

    {
        "name": "{processor name}",
        "description": "{short description}",
        "optional": {true|false},
        "default_value": {for optional parameters only}
    }

Some additional options can be specified in the "opts" field. For example, if "force_run" is set to *true*, then the processor is executed every time it is called (i.e., the results are not cached).

The *exe_command* string is a command (system call) to be executed when the processor is run. It can be dynamically generated at the time the *spec* is requested so as to correspond to the environment. For example, the absolute path to an executable program can be generated.

For example, the following is the spec for the *ms3.bandpass_filter* processor which takes a single input file (multi-channel timeseries) and produces a single output file containing the filtered timeseries.

.. code-block:: json

    {
        "name": "ms3.bandpass_filter",
        "version": "0.20",
        "description": "Apply a bandpass filter to a multi-channel timeseries",
        "inputs": [
            {"name": "timeseries","optional": false}
        ],
        "outputs": [
            {"name": "timeseries_out","optional": false}
        ],
        "parameters": [
            {"name": "samplerate","optional": true,"default_value": 30000},
            {"name": "freq_min","optional": false},
            {"name": "freq_max","optional": false},
            ...
        ],
        opts:{"force_run":false},
        "exe_command": "/home/magland/dev/modules/packages/mountainsort/packages/ms3/bin/ms3.mp ms3.bandpass_filter $(arguments)"
    }
