'use client';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container, Form, FormGroup, Label, Input, Button, Alert, Row, Col,
} from 'reactstrap';
import { register } from '@/lib/auth';
import ReCAPTCHA from 'react-google-recaptcha';
import Footer from '../components/Footer';

const validationSchema = Yup.object({
  fullName: Yup.string().required('Nama lengkap wajib diisi'),
  nisn: Yup.string()
  .matches(/^\d{9,12}$/, 'NISN tidak valid')
  .required('NISN wajib diisi'),
  email: Yup.string().email('Email tidak valid').required('Email wajib diisi'),
  whatsapp: Yup.string()
  .matches(/^(0|\+)[0-9]{10,14}$/, 'No Whatsapp tidak valid')
  .required('No Whatsapp wajib diisi'),
  gender: Yup.string().oneOf(['Laki-laki', 'Perempuan'], 'Pilih jenis kelamin').required(),
  birthPlace: Yup.string().required('Tempat lahir wajib diisi'),
  birthDate: Yup.date()
  .required('Tanggal lahir wajib diisi')
  .max(new Date(), 'Tanggal lahir tidak valid')
  .min(new Date(1950, 0, 1), 'Tanggal lahir tidak valid'),
  password: Yup.string().min(6, 'Minimal 6 karakter').required('Password wajib diisi'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Konfirmasi password tidak cocok')
    .required('Konfirmasi password wajib diisi'),
  recaptcha: Yup.string().required('Verifikasi reCAPTCHA wajib diisi'),
});

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const recaptchaRef = useRef(null);
  const birthDateRef = useRef(null); 

  const formik = useFormik({
    initialValues: {
      fullName: '',
      nisn: '',
      email: '',
      whatsapp: '',
      gender: '',
      birthPlace: '',
      birthDate: '',
      password: '',
      confirmPassword: '',
      recaptcha: '',
    },
    validationSchema,
    validateOnBlur:true,
    validateOnChange:true,

    onSubmit: async (values) => {
      setError('');
      try {
        const res = await register(values);
        setSuccess('Registrasi berhasil! Mengarahkan ke login...');
        setIsSubmitted(true); // ← ini menyembunyikan form
        window.scrollTo({ top: 0, behavior: 'smooth' }); // scroll ke atas
        setTimeout(() => router.push(`/verify?email=${values.email}&nisn=${values.nisn}`), 2000);

      } catch (err) {
        setError(err.message || 'Gagal registrasi');
        window.scrollTo({ top: 0, behavior: 'smooth' }); // scroll ke atas saat error juga
      }
    },
  });

  return (
    <Container className="mt-5" style={{ maxWidth: '600px' }}>
      <h2 className="mb-4">Pendaftaran Santri</h2>

      {error && <Alert color="danger" className="mb-3">{error}</Alert>}
      
      {!isSubmitted ? (
        <Form onSubmit={formik.handleSubmit}>
            <FormGroup>
            <Label>Nama Lengkap</Label>
            <Input
                name="fullName"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.fullName}
            />
            {formik.touched.fullName && formik.errors.fullName && (
                <small className="text-danger">{formik.errors.fullName}</small>
            )}
            <small className="text-muted d-block mt-1">
                <i>Sesuai dengan nama Ijazah terakhir yang resmi</i>
            </small>
            </FormGroup>

            <FormGroup>
            <Label>NISN</Label>
            <Input
                name="nisn"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.nisn}
            />
            {formik.touched.nisn && formik.errors.nisn && (
                <small className="text-danger">{formik.errors.nisn}</small>
            )}

            <small className="text-muted d-block mt-1">
                <i>
                Silakan klik di sini&nbsp;
                <a
                href="https://nisn.data.kemdikbud.go.id/index.php/Cindex/formcaribynama"
                target="_blank"
                rel="noopener noreferrer"
                >
                untuk cek NISN anda
                </a>
                </i>
            </small>
            </FormGroup>

            <FormGroup>
            <Label>Email</Label>
            <Input
                type="email"
                name="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email && (
                <small className="text-danger">{formik.errors.email}</small>
            )}
            </FormGroup>

            <FormGroup>
            <Label>No WhatsApp</Label>
            <Input
                name="whatsapp"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.whatsapp}
            />
            {formik.touched.whatsapp && formik.errors.whatsapp && (
                <small className="text-danger">{formik.errors.whatsapp}</small>
            )}
            </FormGroup>

            <FormGroup>
            <Label>Jenis Kelamin</Label>
            <Input
                type="select"
                name="gender"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.gender}
            >
                <option value="">-- Pilih --</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
            </Input>
            {formik.touched.gender && formik.errors.gender && (
                <small className="text-danger">{formik.errors.gender}</small>
            )}
            </FormGroup>

            <FormGroup>
            <Label>Tempat Lahir</Label>
            <Input
                name="birthPlace"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.birthPlace}
            />
            {formik.touched.birthPlace && formik.errors.birthPlace && (
                <small className="text-danger">{formik.errors.birthPlace}</small>
            )}
            </FormGroup>

            <FormGroup>
                <Label>Tanggal Lahir</Label>
                <div className="position-relative">
                    <Input
                        type="date"
                        name="birthDate"
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 10)).toISOString().split('T')[0]}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.birthDate}
                        style={{ paddingRight: "2.5rem" }}
                        innerRef={(el) => {
                            // simpan referensi ke elemen <input> aslinya
                            if (el && el.tagName === 'INPUT') {
                            birthDateRef.current = el;
                            }
                        }}              
                    />
                    <i
                        className="bi bi-calendar"
                        title="Buka kalender"
                        onMouseDown={(e) => {
                            // Cegah Formik memicu onBlur
                            e.preventDefault(); 
                            birthDateRef.current?.showPicker?.(); // kalau didukung browser modern
                            birthDateRef.current?.click(); // fallback
                        }}
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#6c757d",
                            cursor: "pointer",
                            fontSize: "1.2rem"
                        }}
                    ></i>
                </div>

                {formik.touched.birthDate && formik.errors.birthDate && (
                    <small className="text-danger">{formik.errors.birthDate}</small>
                )}
            </FormGroup>

            <Row>
                <Col md={6}>
                    <FormGroup>
                    <Label>Password</Label>
                    <div className="position-relative">
                        <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                        />
                        <i
                        className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: "absolute",
                            right: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            fontSize: "1.2rem",
                            color: "#6c757d"
                        }}
                        ></i>
                    </div>
                    {formik.touched.password && formik.errors.password && (
                        <small className="text-danger">{formik.errors.password}</small>
                    )}
                    </FormGroup>
                </Col>

                <Col md={6}>
                    <FormGroup>
                    <Label>Konfirmasi Password</Label>
                    <div className="position-relative">
                        <Input
                        type={showConfirm ? "text" : "password"}
                        name="confirmPassword"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.confirmPassword}
                        />
                        <i
                        className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`}
                        onClick={() => setShowConfirm(!showConfirm)}
                        style={{
                            position: "absolute",
                            right: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            fontSize: "1.2rem",
                            color: "#6c757d"
                        }}
                        ></i>
                    </div>
                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                        <small className="text-danger">{formik.errors.confirmPassword}</small>
                    )}
                    </FormGroup>
                </Col>
            </Row>

            <FormGroup>
            <ReCAPTCHA
                sitekey="6Le7nRMrAAAAANetvJqzs9758yE-bHqAziM_Z00y" // ← ganti dengan milikmu
                onChange={(token) => formik.setFieldValue('recaptcha', token)}
                ref={recaptchaRef}
            />
            {formik.touched.recaptcha && formik.errors.recaptcha && (
                <small className="text-danger">{formik.errors.recaptcha}</small>
            )}
            </FormGroup>

            <Button color="primary" block type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? 'Memproses...' : 'Daftar'}
            </Button>

        </Form>

        ) : (

            <Alert color="success" className="text-center mt-5">
                <h5>Pendaftaran berhasil!</h5>
                <hr />
                <p>Jazakallahu Khairan Katsiraan. Kami akan segera menghubungi Abu/Ummu melalui WhatsApp atau email.</p>
                <p>Silakan cek inbox atau tunggu informasi lebih lanjut.</p>
            </Alert>
        
        )}
      <Footer />
    </Container>
  );
}