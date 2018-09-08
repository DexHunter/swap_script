var bitcoin = require('bitcoinjs-lib')
var ops = bitcoin.opcodes;
var regtest = bitcoin.networks.testnet;
const regtestUtils = require('./_regtest')
const bip65 = require('bip65')

const victor = bitcoin.ECPair.fromWIF('cTSVVXPLSZcvFUSe4fdYnwnihnb2d86THDWCUqafVWwDYt4nyfdU', regtest) //import from private key
const peggy = bitcoin.ECPair.fromWIF('cP2DhdJW3eRu9RGEnRFQXf8GcjbgGTvynbLUEg1Ae3JvCrMpZWBV', regtest) //import from private key

console.log(victor.publicKey)

//const victor_addr = '2MwrYWMvWGuxYDL2HJJWcSWaEVAhgSX1vde' //in case
//const peggy_addr = '2MzQ4mshvqHtdwJ2NRXMakm4rgsxJMQajpp' //in case

//const fromHexString = hexString =>
//  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))
//
//const hash = (secret) => {
//    return bitcoin.crypto.sha256(fromHexString(secret))
//}

function utcNow () {
    return Math.floor(Date.now() / 1000)
}

function main() {

    // 3 hours ago
    const lockTime = bip65.encode({ utc: utcNow() - (3600 * 3)  });
    console.log(lockTime)

    process.exit(1)


    function htlcCheckSigOutput(victor_pubkey_hash, peggy_pubkey_hash, lockTime){
        return bitcoin.script.compile([

            ops.OP_IF,
            ops.OP_HASH160,
            ops.OP_EQUALVERIFY,
            ops.OP_DUP,
            ops.OP_HASH160,
            Buffer.from(peggy_pubkey_hash, 'hex'),

            ops.OP_ELSE,
            bitcoin.script.number.encode(lockTime),
            ops.OP_CHECKLOCKTIMEVERIFY,
            ops.OP_DROP,
            ops.OP_DUP,
            ops.OP_HASH160,
            Buffer.from(victor_pubkey_hash, 'hex'),

            ops.OP_ENDIF,
            ops.OP_EQUALVERIFY,
            ops.OP_CHECKSIG

        ])

    }

}

main()
