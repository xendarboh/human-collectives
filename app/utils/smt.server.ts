import type { SMTreeIdentifier, SMTree } from "../models/smt.server";
import { SMT, newMemEmptyTrie } from "circomlibjs";
import { createSMTree, getSMTree, updateSMTree } from "../models/smt.server";

type Nodes = {
  [key: string]: Array<string | Uint8Array>;
};

type NodeConversionFunction =
  | ((x: string) => Uint8Array)
  | ((x: Uint8Array) => string);

export const newSMTree = async () => {
  // create a tree to access its hashing functions since not everything is
  // exported from the circomlibjs package
  const tmp = await newMemEmptyTrie();
  const db = new SMTDB(tmp.F);
  return new SMT(db, db.root, tmp.hash0, tmp.hash1, tmp.F);
};

const convert = (from: Nodes, fn: NodeConversionFunction): Nodes => {
  const to: Nodes = {};
  Object.keys(from).forEach((key) => {
    to[key] = [];
    from[key].map((value) => to[key].push(fn(value)));
  });
  return to;
};

/**
 * Restore a Sparse Merkle Tree from the database.
 *
 * @param {SMTreeIdentifier} id identifier of the tree
 */
export const restoreSMTree = async (id: SMTreeIdentifier) => {
  const res = await getSMTree(id);
  if (!res) return null;

  const tmp = await newMemEmptyTrie();
  const db = new SMTDB(tmp.F);
  db.root = hex2arr(res.root);
  db.nodes = convert(JSON.parse(res.nodes), hex2arr);

  return new SMT(db, db.root, tmp.hash0, tmp.hash1, tmp.F);
};

/**
 * Save a Sparse Merkle Tree to the database.
 *
 * @param {Pick<SMTree, "type" | "key">} id identifier of the tree
 * @param {SMTDB} db the in-memory database of the tree
 */
export const saveSMTree = async (
  id: Pick<SMTree, "type" | "key">,
  db: SMTDB
) => {
  const smt = await getSMTree(id);
  if (!smt) await createSMTree(id);

  const nodes = convert(db.nodes, arr2hex);

  await updateSMTree(id, {
    root: arr2hex(db.root),
    nodes: JSON.stringify(nodes),
  });
};

// https://stackoverflow.com/a/55263004
export const arr2hex = (x: Uint8Array): string =>
  Buffer.from(x).toString("hex");

export const hex2arr = (x: string): Uint8Array =>
  Uint8Array.from(Buffer.from(x, "hex"));

/**
 * Convert a string into a number for use as a key or value in the SMT.
 * Otherwise strings may fail with "can't convert to BigInt".
 *
 * 2022-07-05: https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
 *
 * Returns a hash code for a string.
 * (Compatible to Java's String.hashCode())
 *
 * The hash code for a string object is computed as
 *     s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]
 * using number arithmetic, where s[i] is the i th character
 * of the given string, n is the length of the string,
 * and ^ indicates exponentiation.
 * (The hash value of the empty string is zero.)
 *
 * @param {string} str a string
 * @return {number} a hash code value for the given string.
 */
export const hashCode = (str: string) =>
  Array.from(str).reduce((s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0, 0);

// A Sparse Merkle Tree database, as provided to circomlibjs SMT implementation.
// Adapted from
// 2022-07-3: https://github.com/iden3/circomlibjs/blob/main/src/smt_memdb.js
export class SMTDB {
  nodes: Nodes;
  root: any;
  F: any;

  constructor(F: any) {
    this.nodes = {};
    this.root = F.zero;
    this.F = F;
  }

  async getRoot() {
    return this.root;
  }

  _key2str(k: Uint8Array): string {
    // X: const keyS = this.F.toString(k);
    return arr2hex(k);
  }

  _normalize(n: any) {
    for (let i = 0; i < n.length; i++) {
      n[i] = this.F.e(n[i]);
    }
  }

  async get(key: any) {
    const keyS = this._key2str(key);
    // console.log("!!! get", keyS);
    return this.nodes[keyS];
  }

  async multiGet(keys: any) {
    const promises = [];
    for (let i = 0; i < keys.length; i++) {
      promises.push(this.get(keys[i]));
    }
    return await Promise.all(promises);
  }

  async setRoot(rt: any) {
    this.root = rt;
  }

  async multiIns(inserts: any) {
    for (let i = 0; i < inserts.length; i++) {
      const keyS = this._key2str(inserts[i][0]);
      this._normalize(inserts[i][1]);
      this.nodes[keyS] = inserts[i][1];
      // console.log("!!! insert", keyS, inserts[i][1]);
    }
  }

  async multiDel(dels: any) {
    for (let i = 0; i < dels.length; i++) {
      const keyS = this._key2str(dels[i]);
      // console.log("!!! delete", keyS);
      delete this.nodes[keyS];
    }
  }
}
