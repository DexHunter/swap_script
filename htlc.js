var bitcoin = require('bitcoinjs-lib')
var ops = bitcoin.opcodes;
var regtest = bitcoin.networks.testnet;
const regtestUtils = require('./_regtest')


function getAddress (node, network) {
      return bitcoin.payments.p2pkh({ pubkey: node.publicKey, network  }).address
}

function genNode (ch, network) {
    return new bitcoin.ECPair.makeRandom({rng:function(){return new Buffer.from(ch.repeat(32))}, network:network})
}


const A_node = genNode('a', regtest)
const B_node = genNode('b', regtest)

const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))

const hash = (secret) => {
    return bitcoin.crypto.sha256(fromHexString(secret))
}

function utcNow () {
    return Math.floor(Date.now() / 1000)
}

function main() {
    const A_btc_addr = getAddress(A_node, regtest)
    const B_btc_addr = getAddress(B_node, regtest)

    const A_account = new bitcoin.ECPair.fromWIF(A_node.toWIF(), regtest)
    const B_account = new bitcoin.ECPair.fromWIF(B_node.toWIF(), regtest)

    const A_public_key =  A_node.publicKey;
    const B_public_key =  B_node.publicKey;


    const secretHash = hash('74657374'); // 74657374 is hex of `test`

    const lockTime = getLockTime();

    const recipientPublicKey = B_public_key;
    const ownerPublicKey = A_public_key;

    const BTCscript = bitcoin.script.compile([

        ops.OP_RIPEMD160,
        Buffer.from(secretHash, 'hex'),
        ops.OP_EQUALVERIFY,

        Buffer.from(recipientPublicKey, 'hex'),
        ops.OP_EQUAL,
        ops.OP_IF,

        Buffer.from(recipientPublicKey, 'hex'),
        ops.OP_CHECKSIG,

        ops.OP_ELSE,

        bitcoin.script.number.encode(lockTime),
        ops.OP_CHECKLOCKTIMEVERIFY,
        ops.OP_DROP,
        Buffer.from(ownerPublicKey, 'hex'),
        ops.OP_CHECKSIG,

        ops.OP_ENDIF,

    ])

    console.log(BTCscript)

    const BTCscriptPubKey  = bitcoin.crypto.hash160(BTCscript)
    console.log(BTCscriptPubKey)
    //const BTCscriptAddress = bitcoin.address.fromOutputScript(BTCscriptPubKey, network)
    //
    const Client = require('bitcoin-core');
    const client = new Client({
          host: '47.52.22.90',
          port: 18443,
          username: 'root',
          password: 'btc',
          version: '0.16.2'

    });

    //var redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(BTCscriptPubKey)
    //var redeemScriptHash = bitcoin.crypto.hash160(redeemScript)

    //var scriptPubKey = bitcoin.script.scriptHash.output.encode(redeemScriptHash)
    //var P2SHaddress = bitcoin.address.fromOutputScript(scriptPubKey, bitcoin.networks.testnet)
}

main()
