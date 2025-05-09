'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardBody, Form, FormGroup, Label, Input, Button, Col, Row, Alert, Spinner } from 'reactstrap';
import axios from 'axios';
import toast from 'react-hot-toast';
import Select from 'react-select';

const SantriForm2 = ({ nisn, goToPreviousForm, resumeForm }) => {
  const [formData, setFormData] = useState({
    nama_sekolah: '',
    alamat_sekolah: '',
    tahun_masuk: '',
    tahun_lulus: '',
    bukti_pembayaran: null,
    pas_photo: null,
    kartu_keluarga: null,
    ktp_ortu: null,
    nisn_screenshot: null,
    rapor_akhir: null,
    piagam: null,
    pernyataan: false,
  });

  const [fileStatus, setFileStatus] = useState({
    bukti_pembayaran: null,
    pas_photo: null,
    kartu_keluarga: null,
    ktp_ortu: null,
    nisn_screenshot: null,
    rapor_akhir: null,
    piagam: null,
  });

  const [loading, setLoading] = useState(true);
  const [isFetched, setIsFetched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await axios.get(`https://api-psb.rlagency.id/form/get-form2.php?nisn=${nisn}`);
        const data = response.data?.data;
  
        if (data) {
          setFormData((prev) => ({
            ...prev,
            nama_sekolah: data.nama_sekolah || '',
            alamat_sekolah: data.alamat_sekolah || '',
            tahun_masuk: data.tahun_masuk ? parseInt(data.tahun_masuk, 10) : '',
            tahun_lulus: data.tahun_lulus ? parseInt(data.tahun_lulus, 10) : '',
            bukti_pembayaran: data.bukti_pembayaran || null,
            pas_photo: data.pas_photo || null,
            kartu_keluarga: data.kartu_keluarga || null,
            ktp_ortu: data.ktp_ortu || null,
            nisn_screenshot: data.nisn_screenshot || null,
            rapor_akhir: data.rapor_akhir || null,
            piagam: data.piagam || null,
            pernyataan: data.pindahan === 1,
          }));
  
          setFileStatus({
            bukti_pembayaran: data.bukti_pembayaran ? 'Dokumen sudah diupload' : 'Belum ada dokumen yang diupload',
            pas_photo: data.pas_photo ? 'Dokumen sudah diupload' : 'Belum ada dokumen yang diupload',
            kartu_keluarga: data.kartu_keluarga ? 'Dokumen sudah diupload' : 'Belum ada dokumen yang diupload',
            ktp_ortu: data.ktp_ortu ? 'Dokumen sudah diupload' : 'Belum ada dokumen yang diupload',
            nisn_screenshot: data.nisn_screenshot ? 'Dokumen sudah diupload' : 'Belum ada dokumen yang diupload',
            rapor_akhir: data.rapor_akhir ? 'Dokumen sudah diupload' : 'Belum ada dokumen yang diupload',
            piagam: data.piagam ? 'Dokumen sudah diupload' : 'Belum ada dokumen yang diupload',
          });

          setIsFetched(true); // ← tandai bahwa fetch sudah selesai
        } else {
          toast('Silakan lengkapi formulir.', { icon: '📝' });
        }
  
        setLoading(false); // tetap dijalankan baik data ada atau tidak
      } catch (error) {
        toast.error('Gagal memuat data');
        setLoading(false);
      }
    };
  
    fetchFormData();
  }, [nisn, isFetched]);
  
  // Membuat array tahun dengan rentang 10 tahun ke belakang dan 1 tahun ke depan
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10;
    const endYear = currentYear + 1;
    let years = [];

    for (let year = startYear; year <= endYear; year++) {
      years.push({ value: year, label: year.toString() });
    }
    
    return years;
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      if (files[0]) {
        const file = files[0];
        // Validate file size (max 2MB) and type (PDF or image)
        if (file.size > 2 * 1024 * 1024) {
          toast.error('Ukuran file terlalu besar, maksimal 2MB');
          return;
        }
        const fileType = file.type.split('/')[0];
        if (fileType !== 'image' && fileType !== 'application' && !file.type.includes('pdf')) {
          toast.error('File harus berupa gambar atau PDF');
          return;
        }
      }
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
  
    const data = new FormData();
    data.append('nisn', nisn);
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) data.append(key, value);
    });
  
    try {
      await axios.post('https://api-psb.rlagency.id/form/update-form2.php', data);
      toast.success('Data berhasil disimpan');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan data. Silakan coba lagi.');
    }  finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      document.activeElement.blur(); // paksa blur agar onChange dijalankan dulu
      setIsSubmitting(true);
    
      const data = new FormData();
      data.append('nisn', nisn);
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) data.append(key, value);
      });
    
      try {
        await axios.post('https://api-psb.rlagency.id/form/update-form2.php', data);
        toast.success('Data berhasil diperbarui');
        setTimeout(() => resumeForm(nisn), 1500);
      } catch (err) {
        console.error(err);
        toast.error('Gagal menyimpan data. Silakan coba lagi.');
      } finally {
        setIsSubmitting(false);
      }
  };

  const handleFilePreview = (fileName) => {
      const fileUrl = `https://api-psb.rlagency.id/form/uploads/${fileName}`;
      window.open(fileUrl, '_blank');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const years = generateYears();

  return (
    <Form onSubmit={handleSubmit} >
      <div className="mx-auto mt-4" style={{ maxWidth: '720px' }}>
        <Card className="border-0 shadow-sm rounded-4 p-4 mx-auto">
          <CardBody>
            <h5 className="mb-4 fw-semibold">Data Asal Sekolah</h5>

            <Row >
              <Col md={6}>
                <FormGroup>
                  <Label>Nama Sekolah</Label>
                  <Input name="nama_sekolah" value={formData.nama_sekolah} onChange={handleChange} />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Alamat Sekolah</Label>
                  <Input name="alamat_sekolah" value={formData.alamat_sekolah} onChange={handleChange} />
                </FormGroup>
              </Col>
              {/* <Col md={6}>
                <FormGroup>
                  <Label>Tahun Masuk</Label>
                  <Input 
                    type="number" 
                    name="tahun_masuk" 
                    min="1950"
                    max={new Date().getFullYear() + 1}
                    value={formData.tahun_masuk}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label>Tahun Lulus</Label>
                  <Input 
                    type="number" 
                    name="tahun_lulus" 
                    min="1950"
                    max={new Date().getFullYear() + 1}
                    value={formData.tahun_lulus}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col> */}
              <Col md={6}>
  <FormGroup>
    <Label>Tahun Masuk</Label>
    <Select
      name="tahun_masuk"
      options={years}
      value={years.find(year => year.value === formData.tahun_masuk)} // Menentukan nilai yang dipilih
      onChange={(selectedOption) => {
        // Menggunakan handleChange untuk mengubah nilai pada formData
        handleChange({ target: { name: 'tahun_masuk', value: selectedOption.value } });
      }}
    />
  </FormGroup>
</Col>

<Col md={6}>
  <FormGroup>
    <Label>Tahun Lulus</Label>
    <Select
      name="tahun_lulus"
      options={years}
      value={years.find(year => year.value === formData.tahun_lulus)} // Menentukan nilai yang dipilih
      onChange={(selectedOption) => {
        // Menggunakan handleChange untuk mengubah nilai pada formData
        handleChange({ target: { name: 'tahun_lulus', value: selectedOption.value } });
      }}
    />
  </FormGroup>
</Col>
              
              <Col md={12}>
                <FormGroup check>
                  <Label check>
                    <Input type="checkbox" name="pernyataan" checked={formData.pernyataan} onChange={handleChange} />{' '}
                    Centang kotak ini hanya jika calon santri merupakan siswa pindahan di sekolah asal (bukan bersekolah sejak awal hingga lulus di sekolah tersebut).
                  </Label>
                </FormGroup>
              </Col>

              <h5 className="mb-4 fw-semibold" style={{marginTop:'50px'}}>Upload Dokumen</h5>
              {['bukti_pembayaran', 'pas_photo', 'kartu_keluarga', 'ktp_ortu', 'nisn_screenshot', 'rapor_akhir', 'piagam'].map((doc, idx) => (
                <Col md={6} key={idx}>
                  <FormGroup>
                    <Label>{doc.replace('_', ' ').toUpperCase()}</Label>
                    <Input type="file" name={doc} onChange={handleChange} />
                    <div className="mt-1 ms-1 text-muted small">
                      {fileStatus[doc] === 'Dokumen sudah diupload' ? (
                        <>
                          <span>{fileStatus[doc]} - </span>
                          <a href="#" onClick={() => handleFilePreview(formData[doc])}>
                            Lihat Dokumen
                          </a>
                        </>
                      ) : (
                        <span>{fileStatus[doc]}</span>
                      )}
                    </div>
                  </FormGroup>
                </Col>
              ))}
            </Row>

            <hr />
            <div className="d-flex justify-content-between mt-4">
              <Button color="secondary" type="button" onClick={goToPreviousForm}>
                Sebelumnya
              </Button>
              <div className="d-flex justify-content-end gap-2">
                <Button color="secondary" type="button" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Spinner size="sm" /> : 'Simpan'}
                </Button>
                <Button color="primary" type="button" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <Spinner size="sm" /> : 'Selanjutnya'}
                </Button>
              </div>

            </div>

          </CardBody>
        </Card>
      </div>
    </Form>
  );
};

export default SantriForm2;
