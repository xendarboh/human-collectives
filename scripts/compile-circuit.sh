#!/bin/bash

# This script performs the many steps to compile a circom circuit.
# Requires circom executable to be installed.
# original: 2022-07-09: https://raw.githubusercontent.com/iden3/circuits/master/compile-circuit.sh

set -e

compile_and_ts() {
    CIRCUIT_PATH="$1"
    CIRCUIT=`basename "$CIRCUIT" .circom`

    mkdir -p "$CIRCUIT"
    cd "$CIRCUIT"

#    if command -v git
#    then
#        echo "Built at `date`" > info.txt
#        git show --summary >> info.txt
#    fi


    cp "$CIRCUIT_PATH" circuit.circom

    set -x
    time circom --r1cs --wasm --c --sym "$CIRCUIT_PATH"
    mv "${CIRCUIT}.r1cs" circuit.r1cs
    mv "${CIRCUIT}_js/${CIRCUIT}.wasm" circuit.wasm
    mv "${CIRCUIT}.sym" circuit.sym
    snarkjs r1cs info circuit.r1cs
    #snarkjs r1cs export json circuit.r1cs circuit.r1cs.json

#    time snarkjs setup -r circuit.r1cs --pk proving_key.json --vk verification_key.json
    time snarkjs groth16 setup circuit.r1cs "$PTAU" circuit_0000.zkey

    ENTROPY1=$(head -c 1024 /dev/urandom | LC_CTYPE=C tr -dc 'a-zA-Z0-9' | head -c 128)
    ENTROPY2=$(head -c 1024 /dev/urandom | LC_CTYPE=C tr -dc 'a-zA-Z0-9' | head -c 128)
    ENTROPY3=$(head -c 1024 /dev/urandom | LC_CTYPE=C tr -dc 'a-zA-Z0-9' | head -c 128)

    time snarkjs zkey contribute circuit_0000.zkey circuit_0001.zkey --name="1st Contribution" -v -e="$ENTROPY1"
    time snarkjs zkey contribute circuit_0001.zkey circuit_0002.zkey --name="2nd Contribution" -v -e="$ENTROPY2"
    time snarkjs zkey contribute circuit_0002.zkey circuit_0003.zkey --name="3rd Contribution" -v -e="$ENTROPY3"
    time snarkjs zkey verify circuit.r1cs "$PTAU" circuit_0003.zkey
    time snarkjs zkey beacon circuit_0003.zkey circuit_final.zkey 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon phase2"
    time snarkjs zkey verify circuit.r1cs "$PTAU" circuit_final.zkey
    time snarkjs zkey export verificationkey circuit_final.zkey verification_key.json


    # 2022-07-09: This always fails.. regardless of circuit or ptau file(?)
    #
    # time snarkjs zkey export json circuit_final.zkey circuit_final.zkey.json
    #
    # + snarkjs zkey export json circuit_final.zkey circuit_final.zkey.json
    #   [ERROR] snarkJS: TypeError: a.slice is not a function
    #   at WasmField2.toString (node_modules/ffjavascript/build/main.cjs:4397:38)
    #   at stringifyBigInts$2 (node_modules/ffjavascript/build/main.cjs:3416:18)
    #   at node_modules/ffjavascript/build/main.cjs:3425:22
    #   at Array.forEach (<anonymous>)
    #   at stringifyBigInts$2 (node_modules/ffjavascript/build/main.cjs:3424:14)
    #   at node_modules/ffjavascript/build/main.cjs:3425:22
    #   at Array.forEach (<anonymous>)
    #   at Object.stringifyBigInts$2 [as stringifyBigInts] (ffjavascript/build/main.cjs:3424:14)
    #   at Object.zkeyExportJson [as action] (node_modules/snarkjs/build/cli.cjs:8409:49)
    #   at async clProcessor (node_modules/snarkjs/build/cli.cjs:305:27)


    time snarkjs zkey export solidityverifier circuit_final.zkey verifier.sol
    set +x
}

if [ "$#" -ne 2 ]
then
    echo "Usage:   $0 CIRCUIT_PATH $1 PTAU_PATH">&2
    echo "Example: ./compile-circuit.sh example.circom powersOfTau28_hez_final_15.ptau" >&2
    exit 1
fi

set -u

dir=$(readlink -f $(dirname $0))
CIRCUIT="$1"
PTAU="$2"
PATH="${dir}/../node_modules/.bin:$PATH"

# npm ci
mkdir -p build

cd build
compile_and_ts "$CIRCUIT"
