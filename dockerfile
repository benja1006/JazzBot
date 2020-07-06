FROM node:12

WORKDIR /usr/src/app

RUN apt update
RUN apt-get -y install ffmpeg
