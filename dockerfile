FROM node:12

WORKDIR /usr/src/app

RUN apt update
RUN apt-get -y install ffmpeg
ENV WAIT_VERSION 2.7.2
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/$WAIT_VERSION/wait /wait
RUN chmod +x /wait
