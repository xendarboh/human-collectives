# Human Collectives

Private Collective Identities with Sybil-Resistance from [HUMΔNODE](https://humanode.io/).

## Development

```sh
npm run dev
```

Then access [http://localhost:3000](http://localhost:3000) in a local browser.

## Deployment

Build the app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm run start
```

The app is powered by [Remix](https://remix.run/) which offers several
deployment methods and templates.

See included docker files for an option that can be run with
[nginx-proxy](https://github.com/nginx-proxy/nginx-proxy) and
[nginx-proxy/acme-companion](https://github.com/nginx-proxy/acme-companion) for
automated SSL certificate generation.

```sh
cd docker/
docker-compose up -d
```

### Resources

- [iden3/circomlib](https://github.com/iden3/circomlib): Library of basic
  circuits for circom including Sparse Merkle Tree processor and verifier
- [iden3/circomlibjs](https://github.com/iden3/circomlibjs): Javascript library
  to work with circomlib circuits
- [iden3/snarkjs](https://github.com/iden3/snarkjs#7-prepare-phase-2): zkSNARK
  implementation in JavaScript & WASM, PowersOfTau files
- https://github.com/iden3/circuits/blob/master/compile-circuit.sh
