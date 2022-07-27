# Human Collectives

Zero-Knowledge Proof of Human Collective with Bio-Authenticated
Sybil-Resistance from [HUMΔNODE](https://humanode.io/).

## Proof-of-Collective

Human collectives are comprised of zero, one, or more unique humans.

**Inclusion**: (Membership) Wtih zero-knowledge cryptographic proofs, a human
can prove that they are a member of a particular collective (a group of humans)
while remaining anonymous and not revealing any identifying information.

**Exclusion**: (Non-Membership) A human can also prove that they are not within
a particular collective, without revealing their identity.

Other humans or automated systems can verify the proofs of collective inclusion
or exclusion. Cryptographic assets are provided to generate and verify proofs
within a browser as a Decentralized Application (dApp). A solidity library is
provided to verify the zero-knowledge proofs on-chain within smart contracts.

Collectives may function as a Decentralized Identifier (DID). In the case of a
collective of only a single human, it may function as a bio-authenticated DID
for that human. A human can create and destroy any number of such identifiers,
which only they have bio-authenticated access to.

Membership to collectives may be administered in a number of ways. Collectives
may offer public access for any bio-authenticated human to join and leave at
will or collective access may be protected by a secret code to selectively
grant membership to other humans. A collective with managed membership may have
members manually added or removed by the collective creator(s). In any case, a
collective is only ever comprised of unique humans as verified by the HUMΔNODE
system.

## How it works

For each human collective, a Sparse Merkle Tree is created and maintained. When
a human joins or is added to a collective, a cryptographic hash of their unique
bio-authenticated identifier (from HUMΔNODE) is added as a node to the
collective's merkle tree. Likewise, when a human leaves a collective, the
corresponding node is removed from the merkle tree. The merkle tree is used
within the process of generating and verifying ZK-proofs of collective
(non-)membership.

A zero-knowledge proof of collective human identity basically consits of a set
of private inputs, public inputs, and a verifiable output of cryptographic
proof of collective inclusion or exclusion. The cryptographic proofs are built
with zkSNARK circuits and tools provided by [iden3](https://github.com/iden3).

## Project Facilitations

- enable bio-authenticated humans to create, join, and leave collectives
- polls; ask a collective a question, members vote, and see results (sybil-resistant voting)
- membership-managed collectives as biometric black- or white- list databases
- user interface for generating and verifying proofs
- solidity smart contracts and utilities for on-chain proofs
- API for other systems to build and/or verify proofs

## Disclaimer

This project is not yet ready for production deployments.

## Configuration

Copy then edit the example environment file for installation specifics.

```sh
cp env.example .env
```

### Example Configuration

```sh
########################################################################
# Node.js
########################################################################

# Humanode OAuth2 credentials
AUTH_HUMANODE_CLIENT_ID="XXXXXXXXXXXXXXXXXXXXX"
AUTH_HUMANODE_CLIENT_SECRET="XXXXXXXXXXXXXXXXXXXXXXXXXX"
AUTH_HUMANODE_URI_CALLBACK="http://localhost:3000/callback"
AUTH_HUMANODE_URI_ISSUER="https://auth.staging.oauth2.humanode.io/"
AUTH_HUMANODE_URI_JWKS="https://auth.staging.oauth2.humanode.io/.well-known/jwks.json"

# cookie session secret
SESSION_SECRET="XXXXXXXXXXXXXX"

# bypass bio-authentication for local development, set the given UserId
# DEV_HACK_AUTHENTICATED_USER=1


########################################################################
# Docker
########################################################################

# top-level host directory for persisted files
HOST_DIR=/srv

# collectives
HOSTNAME=example.com
REPO=local
TAG=latest

# nginx-proxy
# DEFAULT_EMAIL=admin@example.com
```

## Development

### Requirements

- [iden3/circom](https://github.com/iden3/circom) zkSNARK circuit compiler
  written in Rust
- [Node.js](https://nodejs.org/en/) >= 16

### Run

```sh
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

### Database

#### Migrations

```sh
cd db
npx knex migrate:make <name>
```

## Production Deployment

```sh
scripts/init-zk.sh
npm run build
npm run start
```

The app is powered by [Remix](https://remix.run/) which offers several
deployment methods and templates.

## Docker

### Optional Reverse Proxy with SSL

For automated SSL certificate generation, start
[nginx-proxy](https://github.com/nginx-proxy/nginx-proxy) and
[acme-companion](https://github.com/nginx-proxy/acme-companion) with:

```sh
docker compose --profile proxy up -d
```

### for Production

```sh
docker compose --profile production up -d
```

### for Development

The docker image includes all requirements, like circom, and may also be used
for development. The source files will be mapped into the docker container as a
volume and can be edited real-time from the host (although user/group
permission side-effects could occur).

To run the container(s), watching the logs:

```sh
docker compose --profile development up
```

To enter the running container in a separate terminal, for example:

```sh
docker exec -ti collectives /bin/bash
cd /app
```

## API & Proof/Verification Assets

- `/collectives/<id>/data.json`
- `/zk/collective-verifier/circuit.wasm`
- `/zk/collective-verifier/circuit_final.zkey`
- `/zk/collective-verifier/verification_key.json`
- `/zk/collective-verifier/verifier.sol`

## DX

Elements used by this project include:

- Full Stack
  - [remix-run/remix](https://github.com/remix-run/remix): full stack web framework with React; Create modern, resilient user experiences with web fundamentals
  - [tailwindcss](https://github.com/tailwindlabs/tailwindcss): utility-first CSS framework for rapid UI development
  - [daisyui](https://github.com/saadeghi/daisyui): tailwind CSS component library
  - [eslint](https://github.com/eslint/eslint): pluggable linting utility for JavaScript and JSX
  - [mocha](https://github.com/mochajs/mocha): simple, flexible, fun javascript test framework
  - [chai](https://github.com/chaijs/chai): BDD / TDD assertion framework
  - [prettier](https://github.com/prettier/prettier): opinionated code formatter
  - [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss): prettier plugin for Tailwind CSS
- Database
  - [knex](https://github.com/knex/knex): SQL query builder; flexible, portable, and fun to use
- Solidity
  - [Hardhat](https://github.com/nomiclabs/hardhat): Ethereum development environment to compile, run, and deploy smart contracts
  - [hardhat-waffle](https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-waffle): tooling for smart contract tests
  - [TypeChain](https://github.com/ethereum-ts/TypeChain): TypeScript bindings for Ethereum smart contracts
  - [ethers.js](https://github.com/ethers-io/ethers.js/): Ethereum library and wallet implementation
  - [solhint](https://github.com/protofire/solhint): solidity linting utility
  - [solidity-coverage](https://github.com/sc-forks/solidity-coverage): code coverage for solidity smart-contracts
  - [prettier-plugin-solidity](https://github.com/prettier-solidity/prettier-plugin-solidity): prettier plugin for solidity
- Zero-Knowledge Proof
  - [iden3/circom](https://github.com/iden3/circom): zkSnark circuit compiler, written in Rust
  - [iden3/circomlib](https://github.com/iden3/circomlib): Library of basic circuits for circom
  - [iden3/circomlibjs](https://github.com/iden3/circomlibjs): Javascript library to work with circomlib circuits
  - [iden3/circom_tester](https://github.com/iden3/circom_tester): Tools for testing circom circuits
  - [iden3/snarkjs](https://github.com/iden3/snarkjs#7-prepare-phase-2): zkSNARK implementation in JavaScript & WASM, PowersOfTau files
- Template
  - [xendarboh/remix-stack-minimal-humanode](https://github.com/xendarboh/remix-stack-minimal-humanode): Minimal Remix Stack with Humanode OAuth2, typsescript, tailwind, linting, and formatting

## Developing Ideas and WIP

- collectives as sub- or super- sets of other collectives, can faciliate roles
- on-chain merkle tree root and nodes (in IPFS) for timestamping memberships
- zk-proof-of-consensus of collective (anonymous voting)
- support developing DID standards, continue to abstract one-and-many identifiers
- use ZKP to protect access to on-chain resources with biometric identifier as the key
- [Kwil Decentralized Database](https://kwil.com/) for SQL on blockchain using [kwildb-query-builder](https://github.com/xendarboh/kwildb-query-builder)

### What Else

More advanced human-collective verification possibilities and membership
features are vast. A collective could represent DAO membership, a family, a
group of friends, a geographic region, verified qualifications (like age, KYC,
etc). Membership could have automated requirements such as paid subscriptions
and/or expirations.
