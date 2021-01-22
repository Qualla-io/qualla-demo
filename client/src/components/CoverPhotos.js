import Geometry from "../img/CoverPhotos/alexander-schimmeck-ineC_oi7NHs-unsplash.jpg";
import Bitcoin from "../img/CoverPhotos/dmitry-demidko-OG3A-ilG8AY-unsplash.jpg";
import Forest from "../img/CoverPhotos/johannes-plenio-RwHv7LgeC7s-unsplash.jpg";
import StormTrooper from "../img/CoverPhotos/jon-tyson-eIhH7RTlTZA-unsplash.jpg";
import Drone from "../img/CoverPhotos/ligita-borkovska-OuVkyuGAM58-unsplash.jpg";
import Blur from "../img/CoverPhotos/omid-armin-kujLyEjMQTk-unsplash.jpg";
import HardDrive from "../img/CoverPhotos/patrick-lindenberg-1iVKwElWrPA-unsplash.jpg";
import Swirl from "../img/CoverPhotos/wilhelm-gunkel-myT7hdMw9j0-unsplash.jpg";

export default function CoverPhoto(i) {
  const photos = [
    Geometry,
    Bitcoin,
    Forest,
    StormTrooper,
    Drone,
    Blur,
    HardDrive,
    Swirl,
  ];

  return photos[i];
}

export const coverPhotoLength = 7;
