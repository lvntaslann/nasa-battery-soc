const BASE_URL = 'http://localhost:8000';

// JSON dosya upload
export const uploadBatteryData = async (file) => {
  const formData = new FormData();
  formData.append('file', file); // JSON dosyası

  try {
    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Dosya yükleme sırasında hata oluştu.');
    }

    return await response.json(); // Backend JSON dönecek
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Eğer liste verisiyle direkt predict çağırmak istersen
export const getPrediction = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Tahmin alınamadı.');
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
