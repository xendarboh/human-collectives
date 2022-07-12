/*
CollectiveVerifier is a component to verify inclusion/exclusion of an
identifier within a Collective. A collective is represented by a Sparse Merkle
Tree. This component utlizes the smtverifier circuit within the circom library.

fnc:  0 -> VERIFY INCLUSION
      1 -> VERIFY EXCLUSION (NOT INCLUSION)
*/

pragma circom 2.0.5;

include "../../node_modules/circomlib/circuits/smt/smtverifier.circom";

template CollectiveVerifier(nLevels) {
    signal input enabled;
    signal input root;
    signal input siblings[nLevels];
    signal input oldKey;
    signal input oldValue;
    signal input isOld0;
    signal input key;
    signal input value;
    signal input fnc;

    // An output is necessary for proof verification
    // 2022-07-11: https://github.com/iden3/snarkjs/issues/116
    // Fixes:
    //   Error: Scalar size does not match
    //     at _multiExp (node_modules/ffjavascript/build/main.cjs:5746:19)
    //     at WasmCurve.multiExpAffine (node_modules/ffjavascript/build/main.cjs:5783:22)
    //     at Object.groth16Verify [as verify] (node_modules/snarkjs/build/main.cjs:1204:31)
    //     at Context.<anonymous> (test/proof-verification.ts:91:19)
    signal output o;
    o <== 1;

    var i;

    component smtVerif = SMTVerifier(nLevels);
    for (i=0; i<nLevels; i++) smtVerif.siblings[i] <== siblings[i];
    smtVerif.enabled <== enabled;
    smtVerif.root <== root;
    smtVerif.oldKey <== oldKey;
    smtVerif.oldValue <== oldValue;
    smtVerif.isOld0 <== isOld0;
    smtVerif.key <== key;
    smtVerif.value <== value;
    smtVerif.fnc <== fnc;
}

component main = CollectiveVerifier(10);
