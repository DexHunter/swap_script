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
