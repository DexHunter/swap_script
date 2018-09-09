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

const victor_addr = '2MwrYWMvWGuxYDL2HJJWcSWaEVAhgSX1vde' //in case
const peggy_addr = '2MzQ4mshvqHtdwJ2NRXMakm4rgsxJMQajpp' //in case

const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))

const hash = (secret) => {
    return bitcoin.crypto.sha256(fromHexString(secret))
}


function main() {

    function done() {
        rpcUtils.mine(11)
    }

    const hashType = bitcoin.Transaction.SIGHASH_ALL

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

    function utcNow () {
        return Math.floor(Date.now() / 1000)
    }

    async function makeTx(){

        // 3 hours ago, redeem in the past
        const lockTime = bip65.encode({ utc: utcNow() - (3600 * 3)  });

        const secret = '9e7a0c24cb284ed7939e5d37901428fb1b293e56445c571a176fad2b948c0aaa';
        const secretHash = hash(secret);

        const redeemScript = htlcCheckSigOutput(victor, peggy, secretHash, lockTime);
        const { address } = bitcoin.payments.p2sh({ redeem: { output: redeemScript, network: regtest  }, network: regtest  });

        rpcUtils.faucet (address, 100)

        const txb = new bitcoin.TransactionBuilder(regtest)
        txb.setLockTime(lockTime)

        unspent = await client.listUnspent(0, 9999999, [victor_addr])

        console.log(unspent)
        console.log(unspent[0].txid)
        console.log(unspent[0].vout)

        txb.addInput(unspent[0].txId, unspent[0].vout)
        txb.addOutput(rpcUtils.newAddress(), 10)

		const tx = txb.buildIncomplete()
		const signatureHash = tx.hashForSignature(0, redeemScript, hashType)
		const redeemScriptSig = bitcoin.payments.p2sh({
		redeem: {
		  input: bitcoin.script.compile([
			bitcoin.script.signature.encode(victor.sign(signatureHash), hashType),
			ops.OP_TRUE
		  ]),
		  output: redeemScript
		}
		}).input
		tx.setInputScript(0, redeemScriptSig)

        rpcUtils.broadcast(tx.toHex())
    }

    makeTx().catch((err)=>console.log(err));

}

main()

function rpc_test(addrs) {
    client.listUnspent(0,9999999, addrs).then((utxos) =>
        {
        console.log(utxos);
        console.log(typeof(utxos));
        console.log(utxos.length);
            for (id in utxos) {
                console.log(utxos[id].txid);
            }
})}

//rpc_test(['2N7zWpgzJXb5M7KjeybmhyUJWFk8HqEF1en'])

async function rpc_test2() {
    const acc = await client.getNewAddress()
    console.log(acc)
}

//rpc_test2()
