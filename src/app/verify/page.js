'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container, Form, FormGroup, Label, Input, Button, Alert,
} from 'reactstrap';
import axios from 'axios';

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [timer, setTimer] = useState(10); // 2 menit
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const nisn = searchParams.get('nisn');

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (resendStatus) {
      const timeout = setTimeout(() => setResendStatus(''), 3000);
      return () => clearTimeout(timeout);
    }
  }, [resendStatus]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('https://api-psb.rlagency.id/register/verify-code.php', {
        email,
        nisn,
        code,
      });
      setStatus('success');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await axios.post('https://api-psb.rlagency.id/register/resend-code.php', {
        email,
        nisn,
      });
      setResendStatus('success');
      setTimer(10); // Reset timer
    } catch (err) {
      setResendStatus('error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .apple-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(0, 0, 0, 0.1);
            border-left-color: #0071e3;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
            margin-right: 6px;
          }

          @keyframes fadeOut {
            0% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; display: none; }
          }

          .fade-out {
            animation: fadeOut 3s forwards;
          }
        `}
      </style>

      <div
        style={{
          backgroundColor: '#fff',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
          width: '100%',
          maxWidth: '460px',
        }}
      >
        <h4 className="mb-3 text-center" style={{ fontWeight: 600 }}>Verifikasi Akun</h4>
        <p className="text-center" style={{ fontSize: '15px', color: '#555' }}>
          Masukkan kode verifikasi untuk NISN <strong>{nisn}</strong> yang telah dikirim ke email <strong>{email}</strong>.
        </p>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="code">Kode Verifikasi</Label>
            <Input
              id="code"
              type="text"
              maxLength="6"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              style={{
                fontSize: '18px',
                padding: '12px',
                borderRadius: '12px',
              }}
            />
          </FormGroup>

          <Button
            color="primary"
            block
            disabled={loading}
            style={{ padding: '12px', fontWeight: 500, borderRadius: '12px' }}
          >
            {loading ? 'Memverifikasi...' : 'Verifikasi'}
          </Button>
        </Form>

        <div className="text-center mt-3" style={{ fontSize: '14px' }}>
          {timer > 0 ? (
            <p style={{ color: '#888' }}>
              Kirim ulang dalam <strong>{formatTime(timer)}</strong>
            </p>
          ) : resending ? (
            <p style={{ color: '#888' }}>
              <span className="apple-spinner" /> Mengirim kode...
            </p>
          ) : (
            <p
              onClick={handleResend}
              style={{
                color: '#0071e3',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              Kirim ulang kode
            </p>
          )}
        </div>

        {resendStatus === 'success' && (
          <p className="text-success mt-2 text-center fade-out" style={{ fontSize: '14px' }}>
            Kode baru telah dikirim.
          </p>
        )}
        {resendStatus === 'error' && (
          <p className="text-danger mt-2 text-center fade-out" style={{ fontSize: '14px' }}>
            Gagal mengirim ulang kode. Silakan coba lagi.
          </p>
        )}

        {status === 'success' && (
          <Alert color="success" className="mt-3 text-center" style={{ borderRadius: '10px' }}>
            Verifikasi berhasil! Mengalihkan ke login...
          </Alert>
        )}
        {status === 'error' && (
          <Alert color="danger" className="mt-3 text-center" style={{ borderRadius: '10px' }}>
            Kode salah atau sudah kadaluarsa.
          </Alert>
        )}
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
