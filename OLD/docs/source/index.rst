MountainSort Documentation
==========================

MountainSort is spike sorting software developed by Jeremy Magland, Alex Barnett, and Leslie Greengard at the Center for Computational Biology, Flatiron Institute in close collaboration with Jason Chung and Loren Frank at UCSF department of Physiology. The algorithm was featured in

`Chung, Jason E.*, Jeremy F. Magland*, Alex H. Barnett, Vanessa M. Tolosa, Angela C. Tooker, Kye Y. Lee, Kedar G. Shah, Sarah H. Felix, Loren M. Frank, and Leslie F. Greengard. "A Fully Automated Approach to Spike Sorting." Neuron 95, no. 6 (2017): 1381-1394. <http://www.cell.com/neuron/fulltext/S0896-6273(17)30745-6>`_

MountainSort is a plugin package to :doc:`MountainLab <mountainlab/mountainlab>`, a general framework for scientific data analysis, sharing, and visualization.

Getting started with MountainSort
---------------------------------

There are various ways to install and/or use MountainSort. The best choice will depend on how you plan to interact with the program. You can use MountainSort...

* as a plugin package to :doc:`MountainLab <mountainlab/mountainlab>` (ML)
* from the web interface (cloud computing)
* as a standalone program

Below, we will describe installation as a plugin to ML (recommended), and the remarks below will indicate how it could be used as a standalone program. Documentation about using the web framework will come soon.

Supported operating systems
---------------------------

Ubuntu 16.04 is the currently supported development platform. Other Linux flavors should also work. Currently, Mac and Windows are not supported.

If you do not have a linux machine available, we recommend setting up an `Ubuntu virtual machine. <https://help.ubuntu.com/community/VirtualMachines>`_

Installation
------------

The following instructions are for installing MountainSort on Ubuntu 16.04 (recommended). Installation instructions requiring compilation can be :doc:`found here <installation_advanced>`. 

.. code:: bash

  add-apt-repository -y ppa:magland/mountainlab
  apt update
  apt install mountainlab
  apt install mlpipeline
  apt install mountainsort
  apt install mountainview

*Caution: If you have python3 already installed using a tool such as miniconda, then you should make sure that miniconda/bin is not in your path. The above packages will install python3 as a Ubuntu package.*

Note: There may be a subtle bug in numpy version 1.11 (default installed on Ubuntu 16.04), so the following additional steps are recommended to upgrade to a later version of numpy:

.. code:: bash

  apt install python3-pip
  pip3 install numpy


Once installed, run the following to choose a temporary directory path. This is where MountainSort will store large intermediate files during processing. Put it somewhere with space.

.. code:: bash

  mlconfig

Periodically you can run the following to get the most up-to-date packages

.. code:: bash
  
  apt update
  apt upgrade mountainlab mlpipeline mountainsort mountainview


Testing the installation
------------------------

The first thing to try is

.. code:: bash

  mp-list-processors

This will list the mountainlab processors installed on your system. For example, you should see "ms3.bandpass_filter", "ms3.whiten", and "mountainsortalg.ms3alg". These are among the core steps of the MountainSort spike sorting pipeline.

Next, to get an idea for how processors work, try

.. code:: bash

  mp-spec ms3.bandpass_filter

This will give the specification (inputs/outputs/parameters) for this particular processor.

Next, try the examples in the mountainsort_examples repository

**1. Clone the examples repo:**

.. code:: bash

  git clone https://github.com/flatironinstitute/mountainsort_examples
  cd mountainsort_examples/examples/example1_mlp

**2. Simulate data for the test:**

.. code:: bash

  mlp-run synthesize_v1.mlp synthesize --timeseries=data/raw.mda --geom=data/geom.csv --waveforms_true=data/waveforms_true.mda --_params=params_synth.json

This will generate test raw data 'raw.mda', geometry data 'geom.csv', and waveform data 'waveforms_true.mda' in the current directory. The file synthesize_v1.mlp represents a processing pipeline, and "synthesize" is the single exported subroutine. To view and/or edit this pipeline use the following command to launch the mlpipeline GUI:

.. code:: bash

  mlpipeline synthesize_v1.mlp


**3. Sort the test data**

You will now call the mountainsort3 sort pipeline, passing it the newly-created raw data 'raw.mda' and geometry data 'geom.csv'. You will also tell it what to call the output firings, 'firings.mda'. Finally, you will pass it parameters, already in the directory, 'params.json'.

.. code:: bash

  mlp-run mountainsort3.mlp sort --raw=data/raw.mda --geom=data/geom.csv --firings_out=data/firings.mda --_params=params.json

As in the previous step, mountainsort3.mlp is a processing pipeline with a single exported subroutine called "sort". You can edit this using:

.. code:: bash

  mlpipeline synthesize_v1.mlp

**4. View the test sorting**

The GUI only requires a timeseries, in this case raw data, 'raw.mda', and the firings information (times/labels), 'firings.mda'. We can also pass it the geometry information and samplerate.

.. code:: bash

  mountainview --raw=data/raw.mda --firings=data/firings.mda --geom=data/geom.csv --samplerate=30000

**5. Re-sort the data with automated curation (masking of low-quality clusters and bursting-related merging)**

This time, you will add the automated curation option, '--curate=true'. This will mask out low-quality clusters and do bursting-related merging.

.. code:: bash

  mlp-run mountainsort3.mlp sort --raw=data/raw.mda --geom=data/geom.csv --firings_out=data/firings2.mda --_params=params.json --curate=true

**6. View the curated test sorting**

.. code:: bash

  mountainview --raw=data/raw.mda --firings=data/firings2.mda --geom=data/geom.csv --samplerate=30000

.. image:: https://user-images.githubusercontent.com/3679296/33456186-a0162f64-d5ec-11e7-976f-70d45b7a79dd.png
  :width: 70%

Note that sorting low signal-to-noise ratio data with relabeling may result in there being no apparent clusters (all clusters are of low quality). For this reason, we suggest first sorting your data without curation.
 
You are now ready to sort your own data :doc:`first_sort`
