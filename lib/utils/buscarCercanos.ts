export const buscarCercanos = async (lat: number, lon: number) => {
  const res = await fetch(`/api/nearby?lat=${lat}&lon=${lon}`);
  const json = await res.json();
  return json.results;
};
