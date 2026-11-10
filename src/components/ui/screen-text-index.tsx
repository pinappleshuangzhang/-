"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { screenPath, workSlug } from "@/lib/page-paths";
import { SURVEY_WORKS } from "@/lib/survey-details";

/**
 * 开场期间后几屏的组件还没挂上，图片和视频先不下载。
 * 这里只放已经写在文案里的标题和正文，让抓取能读到各屏内容。
 * 开场结束后卸掉，避免和真正挂上的屏重复。
 */
export function ScreenTextIndex() {
  const { t } = useLocale();

  return (
    <div className="sr-only">
      <section>
        <h2>
          <a href={screenPath("archive-ga-001")} tabIndex={-1}>
            {t("screen.ga001")}
          </a>
        </h2>
        <p>
          {t("intro.line1")}
          {t("intro.line2a")}
          {t("intro.line2b")}
          {t("intro.line2c")}
          {t("intro.bridge")}
          {t("intro.gravity")}
        </p>
      </section>
      <section>
        <h2>
          <a href={screenPath("archive-ga-002")} tabIndex={-1}>
            {t("screen.ga002")}
          </a>
        </h2>
        <p>
          {t("studioIntro.line1")}
          {t("studioIntro.line2")}
          {t("studioIntro.line3")}
          {t("studioIntro.line4")}
        </p>
        <p>
          {t("studioIntro.card1Title")}
          {t("studioIntro.card1Body")}
        </p>
        <p>
          {t("studioIntro.card2Title")}
          {t("studioIntro.card2Body1")}
          {t("studioIntro.card2Body2")}
          {t("studioIntro.card2Body3")}
        </p>
      </section>
      <section>
        <h2>
          <a href={screenPath("archive-ga-003")} tabIndex={-1}>
            {t("screen.ga003")}
          </a>
        </h2>
        <p>
          {t("member.investigator")}_01_{t("member.role01")} {t("member.namePrefix")}
          {t("member.name01")} {t("member.direction01")}
        </p>
        <p>
          {t("member.investigator")}_02_{t("member.role02")} {t("member.namePrefix")}
          {t("member.name02")} {t("member.direction02")}
        </p>
        <p>
          {t("member.investigator")}_03_{t("member.role03")} {t("member.namePrefix")}
          {t("member.name03")} {t("member.direction03")}
        </p>
        <p>
          {t("member.investigator")}_04_{t("member.role04")} {t("member.namePrefix")}
          {t("member.name04")} {t("member.direction04")}
        </p>
      </section>
      <section>
        <h2>
          <a href={screenPath("archive-ga-004")} tabIndex={-1}>
            {t("screen.ga004")}
          </a>
        </h2>
        <ul>
          {SURVEY_WORKS.map((work, index) => {
            const slug = workSlug(index);
            if (!slug) return null;
            return (
              <li key={work.id}>
                <a href={`/${slug}`} tabIndex={-1}>
                  {t(work.titleKey)}
                </a>
                <p>{t(work.descriptionKey)}</p>
              </li>
            );
          })}
        </ul>
      </section>
      <section>
        <h2>
          <a href={screenPath("contact")} tabIndex={-1}>
            {t("screen.contact")}
          </a>
        </h2>
        <p>{t("contactSurvey.headline")}</p>
        <p>
          {t("contactSurvey.line1")}
          {t("contactSurvey.line2")}
          {t("contactSurvey.line3")}
          {t("contactSurvey.line4")}
        </p>
      </section>
    </div>
  );
}
