var bitcoin = require('bitcoinjs-lib')
var ops = bitcoin.opcodes;
var network = bitcoin.networks.testnet;

// deterministic RNG for testing only
function rng_a () { return new Buffer.from('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')  }
function rng_b () { return new Buffer.from('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')  }

const A_keypair = bitcoin.ECPair.makeRandom({rng:rng_a, network:network});
const B_keypair = bitcoin.ECPair.makeRandom({rng:rng_b, network:network});

const A_btc_addr = bitcoin.payments.p2pkh({ pubkey: A_keypair.publicKey  })
const B_btc_addr = bitcoin.payments.p2pkh({ pubkey: B_keypair.publicKey  })

console.log(A_btc_addr.address)
console.log(B_btc_addr.address)



const A_account = new bitcoin.ECPair.fromWIF(A_keypair.toWIF(), network)
const B_account = new bitcoin.ECPair.fromWIF(B_keypair.toWIF(), network)


const A_public_key =  A_keypair.publicKey;
const B_public_key =  B_keypair.publicKey;

console.log(typeof(A_public_key))
console.log(typeof(B_public_key))
//console.log(A_public_key.toString('hex'))
//console.log(B_public_key.toString('hex'))


//const A_qtum_addr = 'qHrZn3GHp9spToTFkjZ4cfbzdDThw3pLce'
//const A_qtum_public_key = ''


//const B_qtum_addr = 'qS2iorv44FbopcxVB36gmyiEBeU4SwwyBn'
//const B_qtum_public_key = 'tpubDDo6WdFnprrxs81tF2d1o8YkaTAuEaabCQons2rYEFLJbf6MHcXYuTGfBRLww3jXFF5n2Z3e4Z2DQSkMHCa2JeFqf99bXrEPsUJqqLioEEH'


const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))

const hash = (secret) => {
    return bitcoin.crypto.sha256(fromHexString(secret))
}

const secretHash = hash('74657374'); // 74657374 is hex of `test`

const utcNow = () => Math.floor(Date.now() / 1000)
const getLockTime = () => utcNow() + 3600 * 3 // 3 hours from now

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
