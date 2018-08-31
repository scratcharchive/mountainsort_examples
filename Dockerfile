FROM continuumio/miniconda3:latest

### Prerequisites
RUN conda install python=3.6
RUN conda install -c conda-forge nodejs=9.11

### Set up the environment
ADD environment.yml /working/environment.yml
RUN conda env update --file /working/environment.yml -n base

### JupyterLab with extensions
RUN conda install jupyterlab
RUN jupyter labextension install @jupyter-widgets/jupyterlab-manager
RUN pip install jp_proxy_widget
RUN jupyter nbextension enable --py --sys-prefix jp_proxy_widget
RUN jupyter labextension install jp_proxy_widget

### Add the examples
ADD . /mountainsort_examples
WORKDIR /mountainsort_examples

