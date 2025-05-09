'use client';

import React, { useEffect, useState } from 'react';
import {
  Card, CardBody, Spinner, Alert, Row, Col, Button,
  FormGroup, Input, Label
} from 'reactstrap';
import axios from 'axios';
import { File } from 'lucide-react';

export default function ResumeData({ nisn, goToPreviousForm2 }) {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (!nisn) return;

    (async () => {
      try {
        const res = await axios.get(`https://api-psb.rlagency.id/form/get-resume.php?nisn=${encodeURIComponent(nisn)}`);
        setResumeData(res.data.data);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
        setError("Gagal mengambil data dari server.");
      } finally {
        setLoading(false);
      }
    })();
  }, [nisn]);

  const handleFinish = async () => {
    if (!checkboxChecked) {
      setValidationError("Silakan centang pernyataan bahwa data adalah benar.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`https://api-psb.rlagency.id/form/update-data-finish.php`, {
        nisn,
        checkboxChecked: true
      });

      if (res.data.status === 'success') {
        setUpdateSuccess(true);
        setValidationError(null);
        setError(null);
        setApiError(null);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        setUpdateSuccess(false);
        setApiError({
          message: res.data.message || 'Gagal memperbarui data.',
          fields: res.data.fields || []
        });
      }
    } catch (err) {
      setUpdateSuccess(false);
      setApiError({ message: 'Terjadi kesalahan saat memperbarui data.' });
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !resumeData) {
    return (
      <div className="text-center my-5">
        <Spinner /> Memuat data resume...
      </div>
    );
  }

  if (error) {
    return <Alert color="danger">{error}</Alert>;
  }

  if (!resumeData || !resumeData.santri || !resumeData.form1 || !resumeData.form2) {
    return <Alert color="danger">Data resume tidak lengkap atau bermasalah.</Alert>;
  }

  const { santri, form1, form2 } = resumeData;

  const InfoRow = ({ label, value }) => (
    <Row className="mb-3">
      <Col sm="4" className="fw-semibold text-dark">{label}</Col>
      <Col sm="8" className="text-muted">{value || '-'}</Col>
    </Row>
  );

  const DokumenRow = ({ label, file }) => (
    <div className="mb-2">
      <strong>{label}:</strong>{' '}
      {file ? (
        <a
          href={`https://api-psb.rlagency.id/form/uploads/${file}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary"
        >
          <File size={16} className="me-1" /> Lihat Dokumen
        </a>
      ) : (
        <span className="text-muted">Belum diupload</span>
      )}
    </div>
  );

  return (
    <Card className="border-0 shadow-sm rounded-4 p-4 mt-4 mx-auto" style={{ maxWidth: 760 }}>
      <CardBody>
        <h5 className="fw-semibold mb-4 text-primary">Resume Data Pendaftaran</h5>

        {apiError && (
          <Alert color="danger">
            <div>{apiError.message}</div>
            {apiError.fields && apiError.fields.length > 0 && (
              <ul className="mt-2 mb-0">
                {apiError.fields.map((field, index) => (
                  <li key={index}>{field.replace(/\\\//g, '/')}</li>
                ))}
              </ul>
            )}
          </Alert>
        )}

        {!apiError && (
          <>
            <h6 className="fw-bold mb-3 text-primary">Data Santri</h6>
            <hr/>
            <InfoRow label="Nama Lengkap" value={santri.nama_lengkap} />
            <InfoRow label="NISN" value={santri.nisn} />
            <InfoRow label="Email" value={santri.email} />
            <InfoRow label="No Whatsapp" value={santri.no_wa} />
            <InfoRow label="Jenis Kelamin" value={santri.jenis_kelamin} />
            <InfoRow
              label="Tempat & Tgl Lahir"
              value={`${santri.tempat_lahir || '-'}, ${
                santri.tanggal_lahir
                  ? new Date(santri.tanggal_lahir).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })
                  : '-'
              }`}
            />

            <h6 className="fw-bold mb-3 text-primary mt-4">Data Keluarga & Kesehatan</h6>
            <hr />
            <InfoRow label="Alamat" value={form1.alamat} />
            <InfoRow label="Provinsi" value={form1.provinsi} />
            <InfoRow label="Kota" value={form1.kota} />
            <InfoRow label="Nama Abu" value={form1.nama_ayah} />
            <InfoRow label="Nama Ummu" value={form1.nama_ibu} />
            <InfoRow label="No HP Ortu" value={form1.no_hp} />
            <InfoRow label="Email Ortu" value={form1.email_ortu} />
            <InfoRow label="Alamat Ortu" value={form1.alamat_ortu} />
            <InfoRow label="Golongan Darah" value={form1.golongan_darah} />
            <InfoRow label="Berat / Tinggi Badan" value={`${form1.berat_badan} kg / ${form1.tinggi_badan} cm`} />
            <InfoRow label="Penyakit Pernah Diderita" value={form1.penyakit} />
            <InfoRow label="Alergi" value={form1.alergi} />
            <InfoRow label="Kebutuhan Khusus" value={form1.kebutuhan_khusus} />
            <InfoRow label="Keinginan Masuk" value={form1.keinginan_masuk} />
            <InfoRow label="Masih Mengompol" value={form1.masih_mengompol} />

            <h6 className="fw-bold mb-3 text-primary mt-4">Data Sekolah & Dokumen</h6>
            <hr />
            <InfoRow label="Nama Sekolah" value={form2.nama_sekolah} />
            <InfoRow label="Alamat Sekolah" value={form2.alamat_sekolah} />
            <InfoRow label="Tahun Masuk / Lulus" value={`${form2.tahun_masuk} / ${form2.tahun_lulus}`} />

            <Row className="mb-4">
              <Col sm="4" className="fw-semibold text-dark">Dokumen Upload</Col>
              <Col sm="8">
                <DokumenRow label="Bukti Pembayaran" file={form2.bukti_pembayaran} />
                <DokumenRow label="Pas Photo" file={form2.pas_photo} />
                <DokumenRow label="Kartu Keluarga" file={form2.kartu_keluarga} />
                <DokumenRow label="KTP Ortu" file={form2.ktp_ortu} />
                <DokumenRow label="Screenshot NISN" file={form2.nisn_screenshot} />
                <DokumenRow label="Rapor Akhir" file={form2.rapor_akhir} />
                <DokumenRow label="Piagam" file={form2.piagam} />
              </Col>
            </Row>
          </>
        )}

        {/* Checkbox dan tombol tetap tampil */}
        <FormGroup check className="mb-3 mt-4">
            <Label check>
                <Input
                type="checkbox"
                checked={checkboxChecked}
                onChange={(e) => {
                    setCheckboxChecked(e.target.checked);
                    if (e.target.checked) {
                    setValidationError(null);
                    }
                }}
                />{' '}
                Dengan ini saya menyatakan bahwa seluruh data yang saya isi adalah benar, akurat, dan dapat dipertanggungjawabkan. Saya bersedia menanggung segala konsekuensi hukum dan administratif apabila di kemudian hari ditemukan ketidaksesuaian atau data yang tidak benar.
            </Label>
        </FormGroup>

        {validationError && <Alert color="warning">{validationError}</Alert>}
        {updateSuccess && <Alert color="success">Mohon Tunggu. Sedang mengalihkan ke halaman berikutnya.</Alert>}

        <hr />
        <div className="d-flex justify-content-between mt-4">
            <Button color="secondary" type="button" onClick={goToPreviousForm2}>
                Sebelumnya
            </Button>
            <Button color="primary" type="button" onClick={handleFinish} disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Finish'}
            </Button>
        </div>

      </CardBody>
    </Card>
  );
}
