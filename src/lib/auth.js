import axios from 'axios';

export const register = async (data) => {
  try {
    const res = await axios.post('https://api-psb.rlagency.id/register/register.php', data);
    return res.data;
  } catch (err) {
    // Lempar error agar bisa ditangkap di form
    throw new Error(err.response?.data?.message || 'Gagal menghubungi server');
  }
};
