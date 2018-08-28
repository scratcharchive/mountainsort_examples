FROM magland/jp_proxy_widget:20180824

ADD environment.yml /working/environment.yml
RUN conda env update --file /working/environment.yml -n base

ADD . /mountainsort_examples
WORKDIR /mountainsort_examples

