'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form, FormGroup, Label, Input, Button, Alert, InputGroup, InputGroupText, Spinner
} from 'reactstrap';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [nisn, setNisn] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setStatus('');
//     setMessage('');

//     try {
//       const res = await axios.post('https://api-psb.rlagency.id/login/index.php', {
//         nisn,
//         password
//       });

//       const data = res.data;

//       if (data.success) {
//         if (data.is_verified === 0) {
//           setStatus('warning');
//           setMessage('Akun Anda belum diverifikasi. Mengarahkan ke halaman verifikasi...');
//           setTimeout(() => {
//             router.push(`/verify?email=${data.email}&nisn=${nisn}`);
//           }, 2500);
//         } else {
//           setStatus('success');
//           setMessage('Login berhasil! Mengalihkan ke dashboard...');
//           setTimeout(() => router.push('/dashboard'), 2000);
//         }
//       } else {
//         setStatus('danger');
//         setMessage(data.message || 'NISN atau password salah.');
//       }
//     } catch (err) {
//       setStatus('danger');
//       setMessage('Terjadi kesalahan saat menghubungi server. Silakan coba lagi.');
//     } finally {
//       setLoading(false);
//     }
//   };
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    setMessage('');
  
    try {
      const res = await axios.post('https://api-psb.rlagency.id/login/index.php', {
        nisn,
        password
      });
  
      const data = res.data;
  
      if (data.success) {
        if (data.is_verified === 0) {
          setStatus('warning');
          setMessage('Akun Anda belum diverifikasi. Mengarahkan ke halaman verifikasi...');
          setTimeout(() => {
            router.push(`/verify?email=${data.email}&nisn=${nisn}`);
          }, 2500);
        } else {
          setStatus('success');
          setMessage('Login berhasil! Mengalihkan ke dashboard...');
          // Simpan JWT token di localStorage
          localStorage.setItem('token', data.token);
          setTimeout(() => router.push('/dashboard'), 2000);
        }
      } else {
        setStatus('danger');
        setMessage(data.message || 'NISN atau password salah.');
      }
    } catch (err) {
      setStatus('danger');
      setMessage('Terjadi kesalahan saat menghubungi server. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f2f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        padding: '20px'
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
          width: '100%',
          maxWidth: '440px',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <div className="text-center mb-4">
          <h4 style={{ fontWeight: 700 }}>Login</h4>
          <p style={{ fontSize: '15px', color: '#666' }}>Silakan masuk ke akun Anda</p>
        </div>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="nisn">NISN</Label>
            <Input
              id="nisn"
              type="text"
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
              required
              disabled={loading}
              style={{
                fontSize: '16px',
                padding: '12px',
                borderRadius: '10px',
                borderColor: '#ddd'
              }}
            />
          </FormGroup>

          <FormGroup>
            <Label for="password">Password</Label>
            <InputGroup>
              <Input
                id="password"
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                style={{
                  fontSize: '16px',
                  padding: '12px',
                  borderRadius: '10px',
                  borderColor: '#ddd'
                }}
              />
              <InputGroupText
                onClick={() => setPasswordVisible(!passwordVisible)}
                style={{
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  marginLeft: '4px'
                }}
              >
                {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </InputGroupText>
            </InputGroup>
          </FormGroup>

          <Button
            color="primary"
            block
            disabled={loading}
            style={{ padding: '12px', fontWeight: 600, borderRadius: '12px' }}
          >
            {loading ? <Spinner size="sm" /> : 'Login'}
          </Button>
        </Form>

        {message && (
          <Alert color={status} className="mt-3 text-center" style={{ borderRadius: '10px' }}>
            {message}
          </Alert>
        )}
      </div>
    </div>
  );
}
