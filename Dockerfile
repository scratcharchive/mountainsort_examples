FROM magland/jp_proxy_widget:20180831

### Set up the environment
ADD environment.yml /working/environment.yml
RUN conda env update --file /working/environment.yml -n base

### Add the examples
ADD . /mountainsort_examples
WORKDIR /mountainsort_examples

