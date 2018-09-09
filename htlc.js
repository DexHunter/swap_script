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

        done()

        // 3 hours ago, redeem in the past
        const lockTime = bip65.encode({ utc: utcNow() - (3600 * 3)  });

        const secret = '9e7a0c24cb284ed7939e5d37901428fb1b293e56445c571a176fad2b948c0aaa';
        const secretHash = hash(secret);

        const redeemScript = htlcCheckSigOutput(victor, peggy, secretHash, lockTime);
        const { address } = bitcoin.payments.p2sh({ redeem: { output: redeemScript, network: regtest  }, network: regtest  });

        const tx1 = await client.sendToAddress(address, 50)
        console.log('SEND TX ' + tx1)

        const txb = new bitcoin.TransactionBuilder(regtest)
        txb.setLockTime(lockTime)

        unspent = await client.listUnspent(0, 9999999, [victor_addr])

        console.log(unspent)

        txb.addInput(unspent[0].txid, unspent[0].vout)

        const newaddr = await client.getNewAddress()
        txb.addOutput(newaddr, 40000)

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

        const txid = await client.sendRawTransaction(tx.toHex())
        console.log('TXID ' + txid)

        console.log(rpcUtils.getTx(txid))

    }

    makeTx().catch((err)=> {console.log(err)});
    //makeTx().catch((err)=> {console.log(err); done()});

}

//main()

async function rpc_test(addrs) {
    const tx1 = await client.sendToAddress(addrs[0], 5)
    console.log(tx1)
    const utxos = await client.listUnspent(0,9999999, addrs)
    console.log('<<<<<<UXTOS<<<<<<<<')
    console.log(utxos)
    const utxo1_id = utxos[0].txid
    const utxo1_vout = utxos[0].vout
    const acc = await client.getNewAddress()
    console.log('>>>>>>GETTING NEW ADDRESS>>>>>>>>')
    console.log(acc)
    console.log(typeof(acc))
    const tx2 = await client.createRawTransaction([{'txid': utxo1_id, 'vout': utxo1_vout}], { "2MwdJpShMbxZe4FFJTzN2WbxRCsem15LVJD": 5}, 50)
    console.log('<<<<<<CREATING RAW TRANSACTION<<<<<<<<')

    const tx_raw = await client.decodeRawTransaction(tx2)
    console.log('>>>>>>DECODING RAW TRANSACTION>>>>>>>>')
    console.log(tx_raw)

    const signed_tx = await client.signRawTransaction(tx2)
    console.log('<<<<<<SIGNING RAW TRANSACTION<<<<<<<<')
    console.log(signed_tx)

    const utxos2 = await client.listUnspent(0,9999999)
    console.log('>>>>>>>UTXOS>>>>>>>>>>>')

    const privKey1 = await client.dumpPrivKey(utxos2[0].address)
    const privKey2 = await client.dumpPrivKey(utxos2[1].address)
    console.log('<<<<<<DUMPING PRIVATE KEYS<<<<<<<<')
    console.log(privKey1)
    console.log(privKey2)
}

rpc_test(['2N7zWpgzJXb5M7KjeybmhyUJWFk8HqEF1en']).catch((err)=>{console.log(err)})

async function rpc_test2() {
    const acc = await client.getNewAddress()
    console.log(acc)
}

//rpc_test2()
