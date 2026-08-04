import {
  SectionPagerProvider,
  type PagerScreen,
} from "@/components/providers/section-pager-provider";
import { PageChrome } from "@/components/ui/page-chrome";
import { ArchiveIntro } from "@/sections/archive-intro";
import { Hero } from "@/sections/hero";

const SCREENS: PagerScreen[] = [
  {
    key: "studio",
    navVariant: "studio",
    title: "万有引力设计档案室",
    node: <Hero />,
  },
  {
    key: "archive-ga-001",
    navVariant: "archive-ga-001",
    title: "档案 GA_001 什么是引力？",
    node: <ArchiveIntro />,
  },
];

export default function Home() {
  return (
    <main>
      <SectionPagerProvider screens={SCREENS}>
        <PageChrome />
      </SectionPagerProvider>
    </main>
  );
}
