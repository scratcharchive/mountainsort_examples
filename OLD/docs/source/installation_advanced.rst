Compilation instructions
========================

`Installing using the Debian packages <https://mountainlab.readthedocs.org>`_ is recommended for most users. However, if you wish to be able to compile MountainLab, MLPipelines, MountainSort, and MountainView, you will need to install several dependencies first. Again, Linux/Ubuntu and Debian are the currently supported development platforms. Other Linux flavors should also work. macOS and Windows are currently not supported. We aim to support macOS in the relatively near future.

Prerequisites
-------------

If you are on Ubuntu 16.04 or later, you can get away with using package managers to install the prerequisites:

.. code :: bash

	# Note: Run the apt-get commands as root, or using sudo

	# Install qt5
	apt-get update
	apt-get install software-properties-common
	apt-add-repository ppa:ubuntu-sdk-team/ppa
	apt-get update
	apt-get install qtdeclarative5-dev qt5-default qtbase5-dev qtscript5-dev make g++

	# For MLPipeline, you will also need to install the webkit module for Qt
	sudo apt-get install libqt5webkit5-dev

	# Install nodejs and npm
	apt-get update
	apt-get install nodejs npm nodejs-legacy

	# Install python3, python3-pip, and packages
	apt-get update
	apt-get install python3 python3-pip
	pip3 install numpy scipy pybind11 cppimport numpydoc
	# Note: you may want to use a virtualenv or other system to manage your python packages

	# Install docker (optional) for using mldock
	apt-get update
	apt-get install docker.io

	# If you are going to install the mountainsort plugin package, install fftw and sklearn
	apt-get update
	apt-get install libfftw3-dev
	pip3 install sklearn

	# Optionally, you can install MATLAB or Octave
	apt-get update
	apt-get install octave

Otherwise, if you are on a different operating system, use the following links for installing the prequisites:

* :doc:`Qt5 (version 5.5 or later) <qt5_installation>` 
* :doc:`NodeJS <nodejs_installation>`
* Python 3 together with some packages (see above)
* :doc:`FFTW <fftw_installation>`
* Optional: `MATLAB <https://www.mathworks.com/>`_ or `Octave <https://www.gnu.org/software/octave/>`_

Compilation
-----------

Important: You should be a regular user when you perform this step -- do not use sudo here or your files will be owned by root.

First time:

.. code :: bash

	git clone https://github.com/flatironinstitute/mountainlab.git
	cd mountainlab
	
	./compile_components.sh

Subsequent updates:

.. code :: bash

	cd mountainlab
	git pull
	./compile_components.sh


You must add mountainlab/bin to your PATH environment variable. For example append the following to your ~/.bashrc file, and open a new terminal (or, source .bashrc):

.. code :: bash

	export PATH=[/path/to/mountainlab]/bin:$PATH

Installing MLPipeline
---------------------

Do the following (after following the prerequisite installation instructions above)

.. code :: bash

	git clone https://github.com/flatironinstitute/mlpipeline.git
	cd mlpipeline
	./compile_components.sh

Add mlpipeline/bin to your PATH environment variable.

Next you must the install NodeJS dependencies for larinet:

.. code :: bash

	cd mlpipeline/processing_server/larinet
	npm install

Start running larinet in a separate terminal:

.. code :: bash

	mlp-larinet

The following command should open the GUI:

.. code :: bash

	mlpipeline

Installing the MountainSort plugin package
------------------------------------------

MountainLab packages can be added in one of two ways. They can be added using docker via the "mldock" command, or (preferred for now), by cloning the package repository into the packages/ directory and compiling them there.

For MountainSort, simply do the following (after following the prerequisite installation instructions above)

.. code :: bash
	
	cd mountainlab/packages
	git clone https://github.com/flatironinstitute/mountainsort.git
	cd mountainsort
	./compile_components.sh

	# Then test to see if we have the mountainsort processors
	mp-list-processors

Subsequently, to update the package periodically:

.. code :: bash

	cd mountainlab/packages/mountainsort
	git pull
	./compile_components.sh

Installing MountainView (spike sorting visualization)
-----------------------------------------------------

Do the following (after following the prerequisite installation instructions above)

.. code :: bash

	git clone https://github.com/flatironinstitute/mountainview.git
	cd mountainview
	./compile_components.sh

You must add mountainview/bin to your PATH environment variable.

.. code :: bash

	# Then test to see if this opens the GUI:
	mountainview


Testing the installation
------------------------

If you installed MountainSort as a plugin package to MountainLab, then you should see that the processors have been properly installed by running

.. code:: bash

  mp-list-processors

You should see a list of processors including, for example ms3.bandpass_filter and pyms.extract_timeseries.

To see the inputs/outputs for each of these registered processors, use the mp-spec command as described in the MountainLab documentation.

The following command will give me a synthetic (pure noise) dataset

.. code:: bash

	mp-run-process pyms.synthesize_timeseries --timeseries_out=sim.mda --duration=10 --samplerate=30000

If successful, then we can check the dimensions and datatype using the "mda" command:

.. code:: bash

	> mda sim.mda
	{
	    "data_type": -3,
	    "data_type_string": "float32",
	    "dims": [4,300000],
	    "header_size": 20,
	    "num_bytes_per_entry": 4,
	    "num_dims": 2
	}

All arrays are stored in the `.mda file format <http://mountainlab.readthedocs.io/en/latest/mda_file_format.html>`_. If you have installed mountainview, you can visualize this pure noise dataset by running

.. code:: bash

	> mountainview --raw=raw.mda --samplerate=30000

We can then filter the timeseries using the pyms.bandpass_filter processor (use mp-spec to determine the proper inputs/outputs).

If you are not using MountainLab, you can still run these commands with a bit more effort because you will not have the assistance of tools such as mp-spec, mp-list-processors, and mda:

.. code:: bash

	packages/pyms/basic/basic.mp pyms.synthesize_timeseries --timeseries_out=sim.mda --duration=10 --samplerate=30000

You can also plunge into the python code itself to use these tools from within your python programs. However, note that the processors operate on files rather than taking numpy arrays as arguments.

If you are more comfortable in MATLAB, or if your raw data is loadable into MATLAB, ML has utilities for reading and writing .mda files and for wrapping ML processors. For example, the to generate the above data one could also execute (from within MATLAB):

.. code:: matlab

	cd mountainlab/matlab
	mlsetup

	inputs=struct();
	outputs=struct('timeseries_out','tmp_raw.mda');
	params=struct('duration',10,'samplerate',30000);
	opts=struct;
	mp_run_process('pyms.synthesize_timeseries',inputs,outputs,params,opts);
	X=readmda('tmp_raw.mda');
	disp(size(X));
