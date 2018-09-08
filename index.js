var bitcoin = require('bitcoinjs-lib');
var btcrpc = require('bitcoin')
var regtest = bitcoin.networks.regtest

var keyPair1 = bitcoin.ECPair.fromWIF('cQaGzue6uhNknUxL6is5pbfH4fiEKVQ6mbuA5b1SBmsSbvhzCynA', regtest);
var keyPair2 = bitcoin.ECPair.fromWIF('cPG49GFsvKezrZDko1ZuVDbSa5CHbGjyM82iFrUCHZuT771j1yAf', regtest);

var pubkBuf1 = new Buffer('025E7369F26B275AFDDEF181D4BE0A1DFBABF098380249AA8A033CB240B0F70B75', 'hex');
var pubkBuf2 = new Buffer('02AA275C9054E1342D16EF18CACC34886D23C47C0B2F5D53D1ECEE98B8DD58FAA5', 'hex');
var pubkBuf3 = new Buffer('02C2275371EBAA36F09D0E7B576993896982D42D7C7D05244592BC6ABCE9518999', 'hex');

var pubKeyBufs = [pubkBuf1, pubkBuf2, pubkBuf3];
var redeemScript = bitcoin.script.multisig.output.encode(2, pubKeyBufs);

var txb = new bitcoin.TransactionBuilder(regtest);
txb.addInput('1dad1c8052566e945d0af799f6ce89eb8e2affbf76615eb26f3f8fd814b86262', 1);
txb.addOutput('mi33KHtdWhchxjDxcAqaRJCZAWznMGHKw4', 99600000); // fee 500000 satoshi
txb.sign(0, keyPair1, redeemScript);
txb.sign(0, keyPair2, redeemScript);

var tx = txb.build();
console.log(tx.toHex());

var client = new btcrpc.Client({
    host: 'localhost',
    port: 18444,
    timeout: 30000,
    network: 'regtest',
});

var txhex = tx.toHex();

client.sendRawTransaction(txhex, function(err, resHeaders) {
    if (err)
        console.log(err);
});
