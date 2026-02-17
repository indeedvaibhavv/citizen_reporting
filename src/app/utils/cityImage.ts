export const getCityImage = (city: string) => {
  return `https://source.unsplash.com/800x500/?${encodeURIComponent(
    city
  )},city,india`;
};
