const Client = require('bitcoin-core');

const client = new Client({
    host: '47.52.22.90',
    port: 18443,
    version: '0.16.2',
    username: 'root',
    password: 'btc'
});


/*
 * generate returns txid
 */
function generate (count) {
    client.generate(count).then((help) => console.log(help));
}

function listuxto(params) {

    params = params || undefined;
    return client.listUnspent(params);
}

function faucet (address, value) {
    client.sendToAddress(address, value).then((help) => console.log(help))
}

function getPubKey (address) {
    const info = client.validateAddress(address).then((help) => console.log(help));
    return info['pubkey'];
}

function random_addr () {
    return client.getNewAddress().then((help) => console.log(help))
}

function broadcast (signed_raw_tx) {
    client.sendRawTransaction(signed_raw_tx).then((help)=>console.log(help))
}



module.exports = {
    generate,
    listuxto,
    faucet,
    getPubKey,
    random_addr,
}

