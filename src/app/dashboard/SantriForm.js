'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardBody, Form, FormGroup, Label, Input, Button, Col, Row, Spinner } from 'reactstrap';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Select from 'react-select';

const SantriForm = ({ nisn, goToNextForm }) => {
  const [formData, setFormData] = useState({
    provinsi: '',
    kota: '',
    alamat: '',
    tinggal_dengan: '',
    nama_ayah: '',
    nama_ibu: '',
    no_hp: '',
    email_ortu: '',
    alamat_ortu: '',
    golongan_darah: '',
    berat_badan: '',
    tinggi_badan: '',
    penyakit: '',
    alergi: '',
    kebutuhan_khusus: '',
    keinginan_masuk: '',
    masih_mengompol: '',
  });

  const router = useRouter();  // Menambahkan hook router untuk navigasi
  const [isUpdating, setIsUpdating] = useState(false);
  const [provinsiOptions, setProvinsiOptions] = useState([]);
  const [kotaOptions, setKotaOptions] = useState([]);
  const [selectedProvinsi, setSelectedProvinsi] = useState(null);
  const [selectedKota, setSelectedKota] = useState(null);

  // Fetch data provinsi dari API
  useEffect(() => {
    const fetchProvinsi = async () => {
      try {
        const res = await axios.get('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
        const options = res.data.map((prov) => ({
          label: prov.name,
          value: prov.id,
        }));
        setProvinsiOptions(options);

        // Cocokkan dengan formData.provinsi (case insensitive)
        if (formData.provinsi) {
          const match = options.find((opt) =>
            opt.label.toLowerCase() === formData.provinsi.toLowerCase()
          );
          if (match) setSelectedProvinsi(match);
        }
      } catch (error) {
        console.error('Gagal memuat data provinsi:', error);
      }
    };

    fetchProvinsi();
  }, []);

  useEffect(() => {
    const fetchKota = async () => {
      if (!selectedProvinsi) return;
      try {
        const res = await axios.get(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvinsi.value}.json`);
        const options = res.data.map((kota) => ({
          label: kota.name,
          value: kota.id,
        }));
        setKotaOptions(options);
  
        // Set default kota jika formData ada
        if (formData.kota) {
          const match = options.find((opt) =>
            opt.label.toLowerCase() === formData.kota.toLowerCase()
          );
          if (match) setSelectedKota(match);
        }
      } catch (error) {
        console.error('Gagal memuat data kota:', error);
      }
    };
  
    fetchKota();
  }, [selectedProvinsi]);

  const handleProvinsiChange = (selected) => {
    setSelectedProvinsi(selected);
    setFormData({ ...formData, provinsi: selected ? selected.label : '', kota: '' });
    setSelectedKota(null);
  };
  
  const handleKotaChange = (selected) => {
    setSelectedKota(selected);
    setFormData({ ...formData, kota: selected ? selected.label : '' });
  };  

  const fetchData = async () => {
    try {
      const res = await axios.post('https://api-psb.rlagency.id/form/get.php', { nisn });
      if (res.data) {
        setFormData({
          provinsi: res.data.provinsi || '',
          kota: res.data.kota || '',
          alamat: res.data.alamat || '',
          tinggal_dengan: res.data.tinggal_dengan || '',
          nama_ayah: res.data.nama_ayah || '',
          nama_ibu: res.data.nama_ibu || '',
          no_hp: res.data.no_hp || '',
          email_ortu: res.data.email_ortu || '',
          alamat_ortu: res.data.alamat_ortu || '',
          golongan_darah: res.data.golongan_darah || '',
          berat_badan: res.data.berat_badan || '',
          tinggi_badan: res.data.tinggi_badan || '',
          penyakit: res.data.penyakit || '',
          alergi: res.data.alergi || '',
          kebutuhan_khusus: res.data.kebutuhan_khusus || '',
          keinginan_masuk: res.data.keinginan_masuk || '',
          masih_mengompol: res.data.masih_mengompol || '',
        });
      }
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [nisn]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      await axios.post('https://api-psb.rlagency.id/form/update.php', {
        nisn,
        ...formData,
      });
      toast.success('Data berhasil diperbarui');

       // Delay 1.5 detik sebelum pindah ke form selanjutnya
      setTimeout(() => {
        goToNextForm();
      }, 1500);
    } catch (err) {
      console.error('Gagal memperbarui data:', err);
      toast.error('Gagal memperbarui data. Coba lagi nanti atau hubungi admin');
    } finally {
      setIsUpdating(false);
    }
  };

  // Sinkronisasi selectedProvinsi saat formData.provinsi berubah
  useEffect(() => {
    if (provinsiOptions.length && formData.provinsi) {
      const match = provinsiOptions.find(opt =>
        opt.label.toLowerCase() === formData.provinsi.toLowerCase()
      );
      if (match) setSelectedProvinsi(match);
    }
  }, [formData.provinsi, provinsiOptions]);

  // Sinkronisasi selectedKota saat kotaOptions sudah terisi dan formData.kota ada
  useEffect(() => {
    if (kotaOptions.length && formData.kota) {
      const match = kotaOptions.find(opt =>
        opt.label.toLowerCase() === formData.kota.toLowerCase()
      );
      if (match) setSelectedKota(match);
    }
  }, [formData.kota, kotaOptions]);

  return (
    <Form onSubmit={handleSubmit}>
      <div className="mx-auto mt-4" style={{ maxWidth: '720px' }}>
      <Card className="border-0 shadow-sm rounded-4 p-4 mx-auto">
        <CardBody>
          <h5 className="mb-4 fw-semibold">Informasi Identitas Diri</h5>

          <Row className="gy-3">
            <Col md={6}>
              <FormGroup>
                <Label>Provinsi</Label>
                <Select
                  options={provinsiOptions}
                  value={selectedProvinsi}
                  onChange={handleProvinsiChange}
                  placeholder="Pilih Provinsi..."
                  isClearable
                  isSearchable
                  menuIsOpen={undefined} // biarkan react-select handle ini
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Kota/Kabupaten</Label>
                <Select
                  options={kotaOptions}
                  value={selectedKota}
                  onChange={handleKotaChange}
                  placeholder="Pilih Kota/Kabupaten..."
                  isDisabled={!selectedProvinsi}
                  isClearable
                  isSearchable
                />
              </FormGroup>
            </Col>

            <Col md={12}>
              <FormGroup>
                <Label>Detail Alamat</Label>
                <Input type="textarea" rows="2" name="alamat" value={formData.alamat} onChange={handleChange} />
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label>Tinggal dengan</Label>
                <Input type="select" name="tinggal_dengan" value={formData.tinggal_dengan} onChange={handleChange}>
                  <option value="">Pilih</option>
                  <option>Orang Tua</option>
                  <option>Saudara</option>
                  <option>Lainnya</option>
                </Input>
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label>Nama Ayah/Wali</Label>
                <Input name="nama_ayah" value={formData.nama_ayah} onChange={handleChange} />
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label>Nama Ibu/Wali</Label>
                <Input name="nama_ibu" value={formData.nama_ibu} onChange={handleChange} />
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label>No. HP (WhatsApp)</Label>
                <Input name="no_hp" value={formData.no_hp} onChange={handleChange} />
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label>Email Orang Tua/Wali</Label>
                <Input type="email" name="email_ortu" value={formData.email_ortu} onChange={handleChange} />
              </FormGroup>
            </Col>

            <Col md={12}>
              <FormGroup>
                <Label>Alamat Orang Tua</Label>
                <Input type="textarea" rows="2" name="alamat_ortu" value={formData.alamat_ortu} onChange={handleChange} />
              </FormGroup>
            </Col>

            <Col md={4}>
              <FormGroup>
                <Label>Golongan Darah</Label>
                <Input name="golongan_darah" value={formData.golongan_darah} onChange={handleChange} />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label>Berat Badan (kg)</Label>
                <Input type="number" name="berat_badan" value={formData.berat_badan} onChange={handleChange} />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label>Tinggi Badan (cm)</Label>
                <Input type="number" name="tinggi_badan" value={formData.tinggi_badan} onChange={handleChange} />
              </FormGroup>
            </Col>

            <h5 className="mb-4 fw-semibold">Informasi Kesehatan</h5>

            <Col md={6}>
              <FormGroup>
                <Label>Penyakit Pernah Diderita</Label>
                <Input name="penyakit" value={formData.penyakit} onChange={handleChange} placeholder='Isi dengan "-" jika tidak ada' />
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label>Alergi</Label>
                <Input name="alergi" value={formData.alergi} onChange={handleChange} placeholder='Isi dengan "-" jika tidak ada' />
              </FormGroup>
            </Col>

            <Col md={12}>
              <FormGroup>
                <Label>Kebutuhan Khusus Pribadi</Label>
                <Input name="kebutuhan_khusus" value={formData.kebutuhan_khusus} onChange={handleChange} placeholder='Isi dengan "-" jika tidak ada' />
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label>Yang Berkeinginan Masuk ke RLA IIBS</Label>
                <Input type="select" name="keinginan_masuk" value={formData.keinginan_masuk} onChange={handleChange}>
                  <option value="">Pilih</option>
                  <option>Orang Tua</option>
                  <option>Calon Santri</option>
                  <option>Orang Tua dan Calon Santri</option>
                </Input>
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label>Masih Mengompol?</Label>
                <Input type="select" name="masih_mengompol" value={formData.masih_mengompol} onChange={handleChange}>
                  <option value="">Pilih</option>
                  <option>Ya</option>
                  <option>Tidak</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>

          <hr />
          <div className="d-flex justify-content-end gap-2">
            <Button color="primary" size="md" type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Spinner size="sm" className="me-2" /> Memperbarui...
                </>
              ) : (
                'Update & Lanjutkan'
              )}
            </Button>
          </div>
        </CardBody>
      </Card>
      </div>
    </Form>
  );
};

export default SantriForm;
