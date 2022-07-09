FROM node:16

# use bash for RUN commands
SHELL ["/bin/bash", "--login", "-c"]

# install rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# install latest circom zk-circuit compiler
# https://docs.circom.io/getting-started/installation/#installing-dependencies
RUN cd /tmp \
    && git clone https://github.com/iden3/circom.git \
    && cd circom \
    && cargo build --release \
    && cargo install --path circom \
    && rm -rf /tmp/circom

WORKDIR /app/
COPY . .
RUN npm install

ENV NODE_ENV=production

CMD npm run build && npm run start
