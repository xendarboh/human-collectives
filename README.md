# Human Collectives

Zero-Knowledge Proof of Human Collective with Bio-Authenticated
Sybil-Resistance from [HUMΔNODE](https://humanode.io/).

## Proof-of-Collective

Human collectives are comprised of zero, one, or more unique living humans.

**Inclusion**: Wtih zero-knowledge cryptographic proofs, a human can prove that
they are a member of a particular collective (a group of humans) while
remaining anonymous and not revealing any identifying information.

**Exclusion**: A human can also prove that they are not within a particular
collective, without revealing their identity.

Other humans or automated systems can verify the proofs of collective inclusion
or exclusion. Cryptographic assets are provided to generate and verify proofs
within a browser as a Decentralized Application (dApp). A solidity library is
provided to verify the zero-knowledge proofs on-chain within smart contracts.

Collectives may function as a Decentralized Identifier (DID). In the case of a
collective of only a single human, it may function as a bio-authenticated DID
for that human. A human can create and destroy any number of such identifiers,
which only they have bio-authenticated access to.

Collectives may offer public access for any bio-authenticated human to join and
leave at will or collective access may be protected by a secret code to
selectively grant membership to other humans. In any case, a collective is only
ever comprised of unique humans as verified by the HUMΔNODE system.

## How it works

For each human collective, a Sparse Merkle Tree is created and maintained. When
a human joins a collective, a cryptographic hash of their unique
bio-authenticated identifier (from HUMΔNODE) is added as a node to the
collective's merkle tree. Likewise, when a human leaves a collective, the
corresponding node is removed from the merkle tree. As only a particular human
has access to their own unique HUMΔNODE identifier when authenticating with the
HUMΔNODE network, only that human may join or leave a collective. A collective
access code may be provided to a human enabling them to join a private
collective.

A zero-knowledge proof of collective human identity basically consits of a set
of private inputs, public inputs, and a verifiable output of cryptographic
proof of collective inclusion or exclusion. The cryptographic proofs are built
with zkSNARK circuits and tools provided by [iden3](https://github.com/iden3).

## Project Facilitations

- enable bio-authenticated humans to create, join, or leave collectives
- provide a user interface for generating and verifying proofs
- provide data for other systems to build and/or verify proofs
- provide a libary of utility functions for creating proofs and verifying them
  including within solidity smart contracts

## Disclaimer

This project is a developing work-in-progress, not yet audited for large-scale
or production deployments, expect breaking changes along the way to stable
releases, use at own risk, etc.

## Development

### Requirements

- [iden3/circom](https://github.com/iden3/circom) zkSNARK circuit compiler
  written in Rust
- [Node.js](https://nodejs.org/en/) >= 16

### Run

```sh
cp env.example .env # edit for installation specifics
npm install
```

While a more formal installation should involve some manual attention to
circuit building and cryptographic setup, this script will build the zkSNARK
circuits to get an installation up and going.

```sh
scripts/init-zk.sh
```

```sh
npm run dev
```

Access [http://localhost:3000](http://localhost:3000) in a local browser.

### Test

```sh
npm run test
```

### Lint

```sh
npm run lint
```

### Docker for development

The docker image includes all requirements, like circom, and may also be used
for development. For example:

```sh
cd docker
docker-compose build
docker run --rm -ti -v /srv/host/dir:/app/srv <image> /bin/bash
```

## Production Deployment

```sh
cp env.example .env # edit for installation specifics
scripts/init-zk.sh
npm run build
npm run start
```

The app is powered by [Remix](https://remix.run/) which offers several
deployment methods and templates.

### Docker

See included docker files for an option that can be run with
[nginx-proxy](https://github.com/nginx-proxy/nginx-proxy) and
[acme-companion](https://github.com/nginx-proxy/acme-companion) for automated
SSL certificate generation.

```sh
cp env.example .env # edit for installation specifics
cd docker
docker-compose up -d
```

## API & Proof/Verification Assets

- `/collectives/<id>/data.json`
- `/zk/collective-verifier/circuit.wasm`
- `/zk/collective-verifier/circuit_final.zkey`
- `/zk/collective-verifier/verification_key.json`
- `/zk/collective-verifier/verifier.sol`

## Resources

- [iden3/circomlib](https://github.com/iden3/circomlib): Library of basic
  circuits for circom
- [iden3/circomlibjs](https://github.com/iden3/circomlibjs): Javascript library
  to work with circomlib circuits
- [iden3/snarkjs](https://github.com/iden3/snarkjs#7-prepare-phase-2): zkSNARK
  implementation in JavaScript & WASM, PowersOfTau files
- [iden3/circuits](https://github.com/iden3/circuits): Circom circuits used by
  the iden3 core protocol

## Developing Ideas and WIP

- collectives as sub- or super- sets of other collectives, can faciliate roles
- on-chain merkle tree (root and/or nodes) storage for timestamping memberships
- polls; ask a collective a question
- proof-of-consensus of collective (anonymous voting)
- support developing DID standards, continue to abstract one-and-many identifiers
- protect access to on-chain resources such as bio-authenticated crypto token vault
- [Kwil Decentralized Database](https://kwil.com/) for SQL on blockchain

### What Else

More advanced human-collective verification possibilities and membership
features are vast. A collective could represent DAO membership, a family, a
group of friends, a geographic region, verified qualifications (like age, KYC,
etc). Membership could have automated requirements such as paid subscriptions
and/or expirations.
