# Set the base image to Ubuntu
FROM ubuntu:xenial
#FROM ubuntu:zesty

MAINTAINER Jeremy Magland

RUN apt-get update

RUN apt-get update && apt-get install -y software-properties-common

# Do not cache starting from here if using --build_arg build_date="$date"
ARG build_date=unknown
RUN build_date=${build_date} && echo "build_date=$build_date"
RUN add-apt-repository -y ppa:magland/mountainlab
RUN apt-get update && apt-get install -y mountainlab
RUN apt-get update && apt-get install -y mlpipeline
RUN apt-get update && apt-get install -y mountainsort
RUN apt-get update && apt-get install -y mountainview

RUN apt-get update && apt-get install -y python3-pip
##### RUN pip3 install --upgrade numpy

RUN mp-list-processors

RUN apt-get update && apt-get install -y git

#### Run example
WORKDIR /work
RUN git clone https://github.com/flatironinstitute/mountainsort_examples

WORKDIR /work/mountainsort_examples/devel/accuracy_test_1
RUN ./run_test.sh

# Allow testing of gui programs
ENV DISPLAY=":0"

