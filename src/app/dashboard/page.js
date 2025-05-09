'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavbarComponent from '../components/Navbar';
import { jwtDecode } from 'jwt-decode';
import SantriForm from './SantriForm';
import SantriForm2 from './SantriForm2';
import ResumeData from './ResumeData';
import Footer from '../components/Footer';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentForm, setCurrentForm] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [statusUjian, setStatusUjian] = useState(null);
  const router = useRouter();

  const verifyToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) throw new Error('Token expired');
        setUser(decoded.data);
        return decoded.data;
      } catch (error) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    }
  };

  useEffect(() => {
    const checkAuthAndFinish = async () => {
      const userData = await verifyToken();
      if (!userData) return;

      try {
        const res = await fetch('https://api-psb.rlagency.id/form/check-finish-registration.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nisn: userData.nisn }),
        });

        const result = await res.json();
        if (result.status === 'success') {
          const selesai = result.finish_registration === 1;
          setIsFinished(selesai);
        
          // Jika selesai, ambil status ujian
          if (selesai) {
            try {
              const resStatus = await fetch('https://api-psb.rlagency.id/form/get-status-test.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nisn: userData.nisn }),
              });
              const statusResult = await resStatus.json();
              if (statusResult?.status) {
                setStatusUjian(statusResult.message);
              } else {
                setStatusUjian("Status tidak tersedia.");
              }
            } catch (e) {
              console.error("Gagal mengambil status ujian:", e);
              setStatusUjian("Gagal mengambil status.");
            }
          }
        }
        
      } catch (err) {
        console.error('Error checking registration status:', err);
      }

      setLoading(false);
    };

    checkAuthAndFinish();
  }, []);

  const goToNextForm = () => setCurrentForm(2);
  const goToPreviousForm = () => setCurrentForm(1);
  const goToPreviousForm2 = () => setCurrentForm(2);
  const resumeForm = () => setCurrentForm(3);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!user) return null;

  // Fungsi kecil untuk menentukan warna alert berdasarkan isi status
  const getAlertClass = (status) => {
    const lower = status.toLowerCase();
    if (lower.includes('lolos')) return 'alert-success';
    if (lower.includes('tidak') || lower.includes('gagal')) return 'alert-danger';
    if (lower.includes('tunggu') || lower.includes('verifikasi') || lower.includes('review')) return 'alert-warning';
    return 'alert-info';
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <NavbarComponent />

      <div className="container mt-4" style={{ maxWidth: '720px' }}>
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body">
            <h2 className="mb-3" style={{ fontWeight: 500, fontSize: '1.4rem', color: '#333' }}>
              Selamat datang, {user.nama}!
            </h2>
            <hr />

            <div className="row mt-3" style={{ fontSize: '0.9rem', color: '#333' }}>
              <div className="col-12 col-md-4 mb-3 mb-md-0">
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>NISN</span>
                <p className="mb-0" style={{ fontSize: '1rem', fontWeight: 500 }}>{user.nisn}</p>
              </div>
              <div className="col-12 col-md-4">
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Tgl Lahir</span>
                <p className="mb-0" style={{ fontSize: '1rem', fontWeight: 500 }}>
                  {new Date(user.tanggal_lahir).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="col-12 col-md-4 mb-3 mb-md-0">
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Email</span>
                <p className="mb-0" style={{ fontSize: '1rem', fontWeight: 500 }}>{user.email}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Jika sudah selesai daftar */}
        {isFinished ? (
          <div className={`alert ${getAlertClass(statusUjian)} mt-4 shadow-sm rounded-4`}>
          <h5 className="mb-3" style={{ fontWeight: 600 }}>
            {statusUjian}
          </h5>
          <hr />
          <p className="mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
            Data antum telah <strong>berhasil dikirim</strong> dan tidak dapat diubah kembali.<br />
            Silakan pantau informasi selanjutnya melalui dashboard ini secara berkala.
          </p>
        </div>   
        ) : (
          <>
            {/* Progress Bar */}
            <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
              <small style={{ fontSize: '0.85rem', color: '#555' }}>
                Step {currentForm} dari 3
              </small>
              <div className="progress" style={{ height: '6px', width: '200px', backgroundColor: '#e9ecef' }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${(currentForm / 3) * 100}%`,
                    backgroundColor: '#007aff',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>

            {/* Form Components */}
            {currentForm === 1 && (
              <SantriForm nisn={user.nisn} goToNextForm={goToNextForm} />
            )}
            {currentForm === 2 && (
              <SantriForm2 nisn={user.nisn} goToPreviousForm={goToPreviousForm} resumeForm={resumeForm} />
            )}
            {currentForm === 3 && (
              <ResumeData nisn={user.nisn} goToPreviousForm2={goToPreviousForm2} />
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
