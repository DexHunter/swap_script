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

function listuxto() {
    client.listUnspent().then((help) => console.log(help));

}


module.exports = {
    generate,
    listuxto
}
