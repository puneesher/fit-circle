import Image from "next/image";

function isLocalImage(src) {
  return src.startsWith("/");
}

export default function ExerciseImage({ src, alt, className, sizes, fill }) {
  const unoptimized = isLocalImage(src);

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        unoptimized={unoptimized}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      sizes={sizes}
      unoptimized={unoptimized}
      width={800}
      height={450}
    />
  );
}
