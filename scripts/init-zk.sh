#!/bin/bash

# This script will:
# - download (and cache for subsequent invocations) a PowersOfTau file
# - compile all circom circuits within the circuit dir (with compile-circuit.sh)
# - install circuit assets to be served through http(s), compiled, or otherwise deployed

# full path of the project root directory
root=$(readlink -f $(dirname $0))/..

# directory of public assets served by https
dir_public="${root}/public"

# directory of circom circuits to build
dir_circuits="${root}/zk/circuits"

# directory of compiled circom circuits
dir_build="${root}/zk/build"

# directory for circuit verifier contract libraries
dir_lib="${root}/contracts/lib"

# Powers of Tau saved file location (in docker host volume)
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

# download and cache the ptau file
test -f ${file_ptau} \
  || wget -O ${file_ptau} https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_13.ptau

# export build directory for circuit compiler script
export dir_build=${dir_build}

# compile all the circuits
for circuit in $(ls ${dir_circuits}/*.circom)
do
  # build the circuit
  ${root}/scripts/compile-circuit.sh ${circuit} ${file_ptau}

  # copy the circuit assets to be served through http(s)
  c=$(basename "${circuit}" .circom)
  d="${dir_public}/zk/${c}"
  mkdir -p "${d}"
  cp -av \
    "${dir_build}/${c}/circuit.wasm" \
    "${dir_build}/${c}/circuit_final.zkey" \
    "${dir_build}/${c}/verification_key.json" \
    "${dir_build}/${c}/verifier.sol" \
    "${d}"
done

# add .sol file(s) as contract library
# - update soldity version
# - assign more specific name
# - disable some solhint rules
# - format with prettier
mkdir -p ${dir_lib}
cat "${dir_build}/collective-verifier/verifier.sol" \
  | sed -e 's/0.6.11/0.8.9/' \
  | sed -e 's/contract Verifier/contract CollectiveVerifier/' \
  | sed -e '1s|^|// solhint-disable no-inline-assembly, func-name-mixedcase, var-name-mixedcase\n|' \
  | npx prettier \
    --parser solidity-parse \
    --stdin-filepath ./x.sol \
  > ${dir_lib}/CollectiveVerifier.sol
