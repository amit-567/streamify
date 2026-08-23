import { useState, useEffect } from "react";

const Avatar = ({ src, name = "User", className = "w-9 h-9 rounded-full" }) => {
  const getFallback = (userName) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || "User")}&background=6366f1&color=ffffff&bold=true`;

  const [imgSrc, setImgSrc] = useState(src || getFallback(name));

  useEffect(() => {
    setImgSrc(src || getFallback(name));
  }, [src, name]);

  return (
    <img
      src={imgSrc}
      alt=""
      className={`object-cover ${className}`}
      onError={() => {
        const fallback = getFallback(name);
        if (imgSrc !== fallback) {
          setImgSrc(fallback);
        }
      }}
    />
  );
};

export default Avatar;
