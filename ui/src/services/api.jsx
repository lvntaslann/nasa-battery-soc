const BASE_URL = "http://localhost:8000";

export const uploadBatteryData = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Dosya yüklenemedi");
  }

  return await response.json();
};

export const getBatteryData = async () => {
  const response = await fetch(`${BASE_URL}/data`);
  if (!response.ok) {
    throw new Error("Veriler alınamadı");
  }
  return await response.json();
};
