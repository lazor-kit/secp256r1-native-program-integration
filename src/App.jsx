'use client';
import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import ECDSA from 'ecdsa-secp256r1/browser';
import { createSecp256r1Instruction } from './util';
import { Buffer } from 'buffer';
import { Connection, Keypair, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';

function App() {
  const [message, setMessage] = useState('asdasd');

  const onClick = async (event) => {
    event.preventDefault();

    const wallet = Keypair.fromSecretKey(
      bs58.decode(import.meta.env.VITE_PRIVATE_KEY)
    );

    const privateKey = await ECDSA.generateKey();

    const publicKeyBase64 = await privateKey.toCompressedPublicKey();

    const signatureBase64 = await privateKey.sign(message);

    console.log(message);

    const txn = new Transaction().add(
      createSecp256r1Instruction(
        Buffer.from(message),
        publicKeyBase64,
        Buffer.from(signatureBase64, 'base64')
      )
    );

    const connection = new Connection(
      'https://api.devnet.solana.com',
      'confirmed'
    );

    txn.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    txn.feePayer = wallet.publicKey;

    txn.partialSign(wallet);

    const sig = await connection.sendRawTransaction(txn.serialize(), {
      skipPreflight: true,
    });
    console.log(sig);
  };

  return (
    <>
      <div>
        <a href='https://vite.dev' target='_blank'>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </a>
        <a href='https://react.dev' target='_blank'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className='card'>
        <form>
          <label>
            Message:
            <input
              type='text'
              name='message'
              value={message}
              onChange={(value) => setMessage(value.value)}
            />
          </label>
          <input type='submit' value='Submit' onClick={onClick} />
        </form>
      </div>
      <p className='read-the-docs'>
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
