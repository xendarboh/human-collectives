#!/bin/bash

# This script downloads a PowersOfTau file, compiles all the circom circuits
# found with the circuit dir (with compile-circuit.sh), and installs their copies
# the circuit assets to # be served through http(s).

# full path of this scripts directory
dir=$(readlink -f $(dirname $0))

# full path of the project root directory
root=$(readlink -f $(dirname $0))/..

# directory of public assets served by https
dir_public="${root}/public"

# directory of circom circuits to build
dir_circuits="${root}/zk/circuits"

# Powers of Tau saved file location
file_ptau="${root}/srv/ptau.ptau"

# According to snarkJS, the circom circuit we are compiling has 4064 constraints,
# so the smallest supporting ptau file is power 13 with 8000 maxConstraints
# https://github.com/iden3/snarkjs#7-prepare-phase-2

# [INFO]  snarkJS: Curve: bn-128
# [INFO]  snarkJS: # of Wires: 4075
# [INFO]  snarkJS: # of Constraints: 4064
# [INFO]  snarkJS: # of Private Inputs: 18
# [INFO]  snarkJS: # of Public Inputs: 0
# [INFO]  snarkJS: # of Labels: 12610
# [INFO]  snarkJS: # of Outputs: 1

# download, and cache into docker host volume, the ptau file
test -f ${file_ptau} \
  || wget -O ${file_ptau} https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_13.ptau

cd ${dir}
for circuit in $(ls ${dir_circuits}/*.circom)
do
  # build the circuit
  ./compile-circuit.sh ${circuit} ${file_ptau}

  # copy the circuit assets to be served through http(s)
  c=$(basename "${circuit}" .circom)
  d="${dir_public}/zk/${c}"
  mkdir -p "${d}"
  cp -av \
    "build/${c}/circuit.wasm" \
    "build/${c}/circuit_final.zkey" \
    "build/${c}/verification_key.json" \
    "build/${c}/verifier.sol" \
    "${d}"
done
