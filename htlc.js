var bitcoin = require('bitcoinjs-lib')
var ops = bitcoin.opcodes;
var regtest = bitcoin.networks.testnet;
const rpcUtils = require('./_regtest')
const bip65 = require('bip65')
const Client = require('bitcoin-core');

const client = new Client({
    host: '47.52.22.90',
    port: 18443,
    version: '0.16.2',
    username: 'root',
    password: 'btc'
});


const victor = bitcoin.ECPair.fromWIF('cTSVVXPLSZcvFUSe4fdYnwnihnb2d86THDWCUqafVWwDYt4nyfdU', regtest) //import from private key
const peggy = bitcoin.ECPair.fromWIF('cP2DhdJW3eRu9RGEnRFQXf8GcjbgGTvynbLUEg1Ae3JvCrMpZWBV', regtest) //import from private key

// console.log(victor.publicKey)

//const victor_addr = '2MwrYWMvWGuxYDL2HJJWcSWaEVAhgSX1vde' //in case
//const peggy_addr = '2MzQ4mshvqHtdwJ2NRXMakm4rgsxJMQajpp' //in case

const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))

const hash = (secret) => {
    return bitcoin.crypto.sha256(fromHexString(secret))
}

function utcNow () {
    return Math.floor(Date.now() / 1000)
}

function main() {

    // 3 hours ago
    function htlcCheckSigOutput(aQ, bQ, secretHash, lockTime){
        return bitcoin.script.compile([
            ops.OP_RIPEMD160,
            Buffer.from(secretHash, 'hex'),
            ops.OP_EQUALVERIFY,

            Buffer.from(bQ.publicKey, 'hex'),
            ops.OP_EQUAL,
            ops.OP_IF,

            Buffer.from(bQ.publicKey, 'hex'),
            ops.OP_CHECKSIG,

            ops.OP_ELSE,

            bitcoin.script.number.encode(lockTime),
            ops.OP_CHECKLOCKTIMEVERIFY,
            ops.OP_DROP,
            Buffer.from(aQ.publicKey, 'hex'),
            ops.OP_CHECKSIG,

            ops.OP_ENDIF,

        ])
    }

    function makeTx(){

        const lockTime = bip65.encode({ utc: utcNow() - (3600 * 3)  });

        const secret = '9e7a0c24cb284ed7939e5d37901428fb1b293e56445c571a176fad2b948c0aaa';
        const secretHash = hash(secret);

        const redeemScript = htlcCheckSigOutput(victor, peggy, secretHash, lockTime);
        const { address } = bitcoin.payments.p2sh({ redeem: { output: redeemScript, network: regtest  }, network: regtest  });

    }

}

//main()

function rpc_test() {
    client.listUnspent(0).then((utxos) => {
        const utxo1_txid = utxos[0].txid;
        const utxo1_vout = utxos[0].vout;
        console.log(utxo1_txid);
        console.log(utxo1_vout);
    })

}

rpc_test()
