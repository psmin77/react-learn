import { useState } from "react";

export default function Picture() {
  const [isActiveImg, setIsActiveImg] = useState(false);

  let defaultClass = {
    div: "background",
    img: "picture",
  };
  if (isActiveImg) {
    defaultClass.img += " picture--active";
  } else {
    defaultClass.div += " background--active";
  }

  return (
    <div className={defaultClass.div} onClick={() => setIsActiveImg(false)}>
      <img
        className={defaultClass.img}
        alt="Rainbow houses in Kampung Pelangi, Indonesia"
        src="https://i.imgur.com/5qwVYb1.jpeg"
        onClick={(e) => {
          e.stopPropagation();
          setIsActiveImg(true);
        }}
      />
    </div>
  );
}
