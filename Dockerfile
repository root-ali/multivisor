FROM node:10-alpine
MAINTAINER Ali Soltani

RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    gcc \
    python \
    python-dev \
    py-pip \
    gcc \
    make \
    g++ \ 
    musl-dev \
    build-base \
    libffi-dev \
    openssl-dev \
    python-dev \
    curl \
    krb5-dev \
    linux-headers \
    zeromq-dev 

ADD . /app
WORKDIR /app

RUN npm install && \
    npm run build && \
    pip install .

ENTRYPOINT ["multivisor" , "-c"]
CMD  ["/app/examples/full_example/multivisor.conf"]
