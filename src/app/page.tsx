import {
  SectionPagerProvider,
  type PagerScreen,
} from "@/components/providers/section-pager-provider";
import { PageChrome } from "@/components/ui/page-chrome";
import { ArchiveGa004 } from "@/sections/archive-ga-004";
import { ArchiveGa005 } from "@/sections/archive-ga-005";
import { ArchiveIntro } from "@/sections/archive-intro";
import { Contact } from "@/sections/contact";
import { Hero } from "@/sections/hero";
import { MemberRecord } from "@/sections/member-record";
import { OrgFounding } from "@/sections/org-founding";
import { OrgRecord } from "@/sections/org-record";

const SCREENS: PagerScreen[] = [
  {
    key: "studio",
    navVariant: "studio",
    background: "studio",
    titleKey: "screen.studio",
    node: <Hero />,
  },
  {
    key: "archive-ga-001",
    navVariant: "archive-ga-001",
    background: "archive",
    titleKey: "screen.ga001",
    node: <ArchiveIntro />,
  },
  {
    key: "archive-ga-002",
    navVariant: "archive-ga-002",
    background: "archive",
    titleKey: "screen.ga002",
    node: <OrgRecord />,
  },
  {
    key: "archive-ga-002-founding",
    navVariant: "archive-ga-002",
    background: "archive",
    titleKey: "screen.ga002",
    node: <OrgFounding />,
  },
  {
    key: "archive-ga-003",
    navVariant: "archive-ga-003",
    background: "archive",
    titleKey: "screen.ga003",
    node: <MemberRecord />,
  },
  {
    key: "archive-ga-004",
    navVariant: "archive-ga-004",
    background: "archive",
    titleKey: "screen.ga004",
    node: <ArchiveGa004 />,
  },
  {
    key: "archive-ga-005",
    navVariant: "archive-ga-005",
    background: "archive",
    titleKey: "screen.ga005",
    node: <ArchiveGa005 />,
  },
  {
    key: "contact",
    navVariant: "contact",
    background: "contact",
    titleKey: "screen.contact",
    node: <Contact />,
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
