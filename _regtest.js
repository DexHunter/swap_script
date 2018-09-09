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
function mine (count) {
    if (count > 0) {
        client.generate(count)
            .then((help) => console.log(help))
            .catch((err) => {console.log(err); mine(count-1)});
    }
}

async function listutxo(params) {

    params = params || null;
    return await client.listUnspent(params);
}

function faucet (address, value) {
    client.sendToAddress(address, value)
        .then((help) => console.log(help))
        .catch((err) => mine(1))
}

function getPubKey (address) {
    const info = client.validateAddress(address).then((help) => console.log(help));
    return info['pubkey'];
}


async function broadcast (signed_raw_tx) {
    return await client.sendRawTransaction(signed_raw_tx)
}

async function newAddress () {
    return await client.getNewAddress();
}

async function getTx (txid) {
    return await client.getTransaction(txid);
}



module.exports = {
    mine,
    listutxo,
    faucet,
    getPubKey,
    broadcast,
    newAddress,
    getTx,
    //RANDOM_ADDR: random_addr()
}

