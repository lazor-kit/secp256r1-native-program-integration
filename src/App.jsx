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
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');

  const onClick = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSignature('');
    setError('');

    try {
      const wallet = Keypair.fromSecretKey(
        bs58.decode(import.meta.env.VITE_PRIVATE_KEY)
      );

      const privateKey = await ECDSA.generateKey();

      const publicKeyBase64 = await privateKey.toCompressedPublicKey();

      const signatureBase64 = await privateKey.sign(message);

      const txn = new Transaction().add(
        createSecp256r1Instruction(
          Buffer.from(message),
          publicKeyBase64,
          Buffer.from(signatureBase64, 'base64')
        )
      );

      const connection = new Connection(
        import.meta.env.VITE_RPC_URL,
        'confirmed'
      );

      txn.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      txn.feePayer = wallet.publicKey;

      txn.partialSign(wallet);

      const sig = await connection.sendRawTransaction(txn.serialize());

      setSignature(sig);
    } catch (error) {
      console.error('Transaction failed:', error);
      setError(error.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
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
      <h1>Secp256r1 Native Program Integrate</h1>
      <div className='card'>
        <form>
          <label>
            Message:
            <input
              type='text'
              name='message'
              value={message}
              placeholder='Enter a message'
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
          <input
            type='submit'
            value={loading ? 'Loading...' : 'Submit'}
            onClick={onClick}
            disabled={loading}
          />
        </form>
        {signature && (
          <p className='signature'>
            <strong>Signature:</strong>{' '}
            <a
              href={`https://explorer.solana.com/tx/${signature}?cluster=custom&customUrl=https%3A%2F%2Frpc.lazorkit.xyz`}
              target='_blank'
              rel='noopener noreferrer'
            >
              {signature}
            </a>
          </p>
        )}
        {error && (
          <p className='error'>
            <strong>Error:</strong> {error}
          </p>
        )}
      </div>
    </>
  );
}

export default App;
