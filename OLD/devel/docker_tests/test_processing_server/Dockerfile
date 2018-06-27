# Set the base image to Ubuntu
FROM ubuntu:xenial
#FROM ubuntu:zesty

MAINTAINER Jeremy Magland

RUN apt-get update

RUN apt-get update && apt-get install -y software-properties-common

## # Do not cache starting from here if using --build_arg build_date="$date"
# ARG build_date=unknown
# RUN build_date=${build_date} && echo "build_date=$build_date"

RUN add-apt-repository -y ppa:magland/mountainlab
RUN apt-get update && apt-get install -y mountainlab
RUN apt-get update && apt-get install -y mountainsort
RUN apt-get update && apt-get install -y mountainlab-mpdock

RUN apt-get update && apt-get install -y python3-pip
##### RUN pip3 install --upgrade numpy

RUN mp-list-processors

RUN apt-get update && apt-get install -y npm nodejs nodejs-legacy

RUN apt-get update && apt-get install -y git

WORKDIR /work
RUN git clone https://github.com/flatironinstitute/mlpipeline

WORKDIR /work/mlpipeline/processing_server/larinet
RUN npm install

