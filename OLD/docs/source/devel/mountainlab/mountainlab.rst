====================================================================================
MountainLab -- A framework for reproducible, transparent and shareable data analysis
====================================================================================

Processor libraries
-------------------

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

Tutorials on creating processors using C++, python and matlab do not exist yet, but there are examples in the MountainSort github repository. [todo: create tutorials for creating processors in the various languages]

The following command lists all the processors that are registered in the system

.. code:: bash

    > mp-list-processors

Use the mp-spec command to see the specification for a particular processor. For example:


.. code :: bash

    > mp-spec pyms.extract_clips
    {
        "name": "pyms.extract_clips",
        "version": "0.1",
        "description": "Extract clips corresponding to spike events",
        "inputs": [
            {
                "description": "Path of timeseries mda file (MxN) from which to draw the event clips (snippets)",
                "name": "timeseries",
                "optional": false
            },
            {
                "description": "Path of firings mda file (RxL) where R>=2 and L is the number of events. Second row are timestamps.",
                "name": "firings",
                "optional": false
            }
        ],
        "outputs": [
            {
                "description": "Path of clips mda file (MxTxL). T=clip_size",
                "name": "clips_out",
                "optional": false
            }
        ],
        "parameters": [
            {
                "datatype": "int",
                "default_value": 100,
                "description": "(Optional) clip size, aka snippet size, aka number of timepoints in a single clip",
                "name": "clip_size",
                "optional": true
            }
        ],
        "exe_command": "python3 /home/magland/dev/mountainlab/packages/pymountainsort/basic/basic.py pyms.extract_clips $(arguments)"
    }

More information on using mp-list-processors and mp-spec can be found in the MountainLab command reference [todo: create this section]

MDA file format
---------------

The .mda file format was created as a simple method for storing multi-dimensional arrays of numbers. Of course the simplest way would be to store the array as a raw binary file, but the problem with this is that fundamental information required to read the data is missing -- specifically,

* the data type (e.g., float32, int16, byte, complex float, etc).
* the number of dimensions
* the size of the dimensions (e.g., number of rows and columns in a matrix)

How should this information be included? There are many strategies. The MDA format includes these in a minimal binary header.

In contrast to file formats that can hold multiple data entitities, each .mda file is guaranteed to contain one and only one multi-dimensional array of byte, integer, or floating point numbers. The .mda file contains a small well-defined header containing only the minimal information required to read the array, namely the number and size of the dimensions as well as the data format of the entries. Immediately following the header, the data of the multi-dimensional array is stored in raw binary format.


The format has evolved slightly over time (for example the first version only supported complex numbers), so please forgive the few arbitrary choices.

The first four bytes contains a 32-bit signed integer containing a negative number representing the data format:

.. code ::

  -1 is complex float32
  -2 is byte
  -3 is float32
  -4 is int16
  -5 is int32
  -6 is uint16
  -7 is double
  -8 is uint32

The next four bytes contains a 32-bit signed integer representing the number of bytes in each entry (okay a bit redundant, I know).

The next four bytes contains a 32-bit signed integer representing the number of dimensions (num_dims should be between 1 and 50). If this number is negative, then it signals that the sizes of the dimensions are stored in 64-bit integers (rather than 32-bit), and the absolute value is used for the number of dimensions.

The next 4*num_dims bytes contains a list of signed 32-bit integers (or 64-bit, see previous paragraph) representing the size of each of the dimensions.

That's it! Next comes the raw data.

The easiest way to read and write .mda files is by using the readmda and writemda* functions available in matlab or python, or by using the C++ classes for mda i/o.

For example, in matlab you can do the following after setting up the appropriate paths:

.. code :: matlab

  > X=readmda('myfile.mda');
  > writemda32(X,'newfile.mda');
  > writemda16i(X,'newfile_16bit_integer.mda');

The python functions are available by importing the mlpy library (see packages/pymountainsort in the mountainlab repository).

Examples of C++ usage are found in the mountainsortalg package (packages/mountainsortalg in the mountainlab repository).


Running processors locally
--------------------------

There are three commands that can be used to execute processors on a computer that has MountainLab installed. These are

.. code :: bash

    mp-exec-process
    mp-run-process
    mp-queue-process

The first just calls the processor, plain and simple. The second calls it and remembers the result, caching information about the checksums of the input and output files, so that if it is run a second time it does not need to recompute. The third queues the process to run at a later time when resources become available. Typically, mp-run-process is the right choice. Here is an example usage:


.. code :: bash

    > mp-run-process pyms.extract_clips --timeseries=raw.mda --firings=firings.mda --clips_out=output.mda --clip_size=123

Note that the parameter values as well as paths to the input and output files are specified using --[key]=[value] syntax.



PRV files
---------

Processing scripts
------------------

File storage and sharing via KBucket
------------------------------------

Processing servers
------------------

MLStudy and web access
----------------------

Browser-based visualization
---------------------------



