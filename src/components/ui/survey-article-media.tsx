import { SurveyEnlargeableImage } from "@/components/ui/survey-enlargeable-image";

type SurveyArticleMediaProps = {
  src: string;
  alt: string;
  revealDelay: string;
  className?: string;
};

/** 文章配图：外层裁切，内层从下方滑入。 */
export function SurveyArticleMedia({
  src,
  alt,
  revealDelay,
  className = "",
}: SurveyArticleMediaProps) {
  return (
    <div
      data-survey-keep=""
      data-sd-media=""
      data-sd-delay={revealDelay}
      className={`overflow-hidden ${className}`}
    >
      <div data-sd-media-inner="" className="translate-y-[105%]">
        <SurveyEnlargeableImage
          src={src}
          alt={alt}
          width={1920}
          height={1080}
          sizes="(max-width: 767px) 94vw, 896px"
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}
