FROM magland/jp_proxy_widget:20180831

### Install conda packages
RUN conda config --add channels flatiron
RUN conda config --add channels conda-forge
RUN conda install mountainlab>=0.15
RUN conda install mountainlab_pytools
RUN conda install ml_ephys ml_ms4alg ml_ms3 ml_pyms
RUN conda install ml_spikeforest

### Add this repo
ADD . /working
WORKDIR /working
