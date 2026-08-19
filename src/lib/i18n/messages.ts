export type Locale = "zh" | "en";

export const DEFAULT_LOCALE: Locale = "zh";

export type MessageKey =
  | "nav.contact"
  | "nav.openIndex"
  | "nav.closeIndex"
  | "nav.language"
  | "nav.title.ga001"
  | "nav.title.ga002"
  | "nav.title.ga003"
  | "nav.title.ga004"
  | "nav.title.ga005"
  | "nav.title.contact"
  | "screen.studio"
  | "screen.ga001"
  | "screen.ga002"
  | "screen.ga003"
  | "screen.ga004"
  | "screen.ga005"
  | "screen.contact"
  | "index.heading"
  | "index.nav"
  | "index.ga001"
  | "index.ga002"
  | "index.ga003"
  | "index.ga004"
  | "index.ga005"
  | "index.ga006"
  | "hero.title"
  | "hero.subtitle"
  | "intro.line1"
  | "intro.line2a"
  | "intro.line2b"
  | "intro.line2c"
  | "intro.bridge"
  | "intro.gravity"
  | "intro.folderAlt"
  | "org.line1a"
  | "org.line1b"
  | "org.founded"
  | "org.enter1"
  | "org.enter2"
  | "org.archive1"
  | "org.archive2"
  | "member.aria"
  | "member.imageAlt"
  | "member.investigator"
  | "member.namePrefix"
  | "member.direction"
  | "member.portfolio"
  | "member.contactMe"
  | "gallery.list"
  | "gallery.detail"
  | "gallery.hintButtons"
  | "gallery.hintFree"
  | "gallery.prev"
  | "gallery.next"
  | "gallery.cardAlt"
  | "ga004.aria"
  | "ga004.detailAria"
  | "survey.categoryNav"
  | "survey.detailAria"
  | "survey.duration"
  | "survey.description"
  | "survey.heroAlt"
  | "survey.billboardAlt"
  | "survey.emptyWork"
  | "ga005.aria"
  | "ga005.imageAlt"
  | "contact.aria"
  | "contact.cta"
  | "contact.button";

type Messages = Record<MessageKey, string>;

const zh: Messages = {
  "nav.contact": "联系我们",
  "nav.openIndex": "打开目录",
  "nav.closeIndex": "关闭目录",
  "nav.language": "语言切换",
  "nav.title.ga001": "《什么是引力？》",
  "nav.title.ga002": "《组织记录》",
  "nav.title.ga003": "《成员记录》",
  "nav.title.ga004": "《视觉调查档案》",
  "nav.title.ga005": "《视觉探索记录》",
  "nav.title.contact": "《开启一份新调查》",
  "screen.studio": "万有引力设计档案室",
  "screen.ga001": "档案 GA_001 什么是引力？",
  "screen.ga002": "档案 GA_002 组织记录",
  "screen.ga003": "档案 GA_003 成员记录",
  "screen.ga004": "档案 GA_004 视觉调查档案",
  "screen.ga005": "档案 GA_005 视觉探索记录",
  "screen.contact": "档案 GA_006 开启一份新调查",
  "index.heading": "档案目录 ARCHIVE INDEX",
  "index.nav": "档案目录",
  "index.ga001": "《什么是引力？》",
  "index.ga002": "《组织记录》",
  "index.ga003": "《成员记录》",
  "index.ga004": "《视觉调查档案》",
  "index.ga005": "《视觉探索记录》",
  "index.ga006": "《开启一份新调查》",
  "hero.title": "万有引力设计档案室",
  "hero.subtitle": "请跟随设计调查记录，完成本次关于“引力”的探索",
  "intro.line1": "我们不断看到同一种现象",
  "intro.line2a": "有些品牌会被记住",
  "intro.line2b": "有些产品会被选择",
  "intro.line2c": "有些设计会被相信",
  "intro.bridge":
    "人与品牌、产品与体验之间，始终存在一种看不见的连接，我们称它为——",
  "intro.gravity": "引力",
  "intro.folderAlt": "档案 GA_001 档案夹",
  "org.line1a": "为了理解这种连接",
  "org.line1b": "为了探索引力",
  "org.founded": "由此成立",
  "org.enter1": "我们进入不同的",
  "org.enter2": "品牌、产品、空间与数字体验",
  "org.archive1": "每一次设计",
  "org.archive2": "都会形成一份“调查档案”",
  "member.aria": "档案 GA_003 成员记录",
  "member.imageAlt": "摆放白色书籍与雕塑半身像的成员档案展柜",
  "member.investigator": "调查员",
  "member.namePrefix": "姓名_",
  "member.direction": "调查方向_产品与用户体验",
  "member.portfolio": "个人作品站",
  "member.contactMe": "联系我",
  "gallery.list": "档案卡片列表",
  "gallery.detail": "查看作品详情",
  "gallery.hintButtons":
    "点击左右按钮切换档案卡片，点击或按 Enter 查看作品详情，下滑切换到下一屏",
  "gallery.hintFree":
    "拖拽或左右方向键旋转浏览档案卡片，点击或按 Enter 查看作品详情，下滑继续旋转，上滑返回上一屏",
  "gallery.prev": "查看上一组作品",
  "gallery.next": "查看下一组作品",
  "gallery.cardAlt": "视觉调查档案卡片",
  "ga004.aria": "档案 GA_004 视觉调查档案",
  "ga004.detailAria": "档案 GA_004 视觉调查档案 作品详情",
  "survey.categoryNav": "调查类型",
  "survey.detailAria": "作品详情，上滑或按 Escape 返回档案长廊",
  "survey.duration": "一个月",
  "survey.description":
    "Design AI Ops 是设计团队围绕 AI 能力建设与设计生产升级建立的长期知识体系，用于统一沉淀团队在 AI 方向上的规划、项目实践与能力资产。该体系以设计业务场景为核心，通过持续积累工具、方法与案例，使 AI 从零散工具使用逐步演进为稳定、可复用的设计生产能力。",
  "survey.heroAlt":
    "Design AI Ops 网站首屏，标题 The Apple Moment，下方为作品缩略图",
  "survey.billboardAlt": "展厅中的大理石数字屏幕，展示 AI Ops 创世纪主题视觉",
  "survey.emptyWork": "该类型暂无作品",
  "ga005.aria": "档案 GA_005 视觉探索记录",
  "ga005.imageAlt": "三张铺在浅色桌面上的空白视觉探索卡片",
  "contact.aria": "联系我们，共同开启一份新调查",
  "contact.cta": "联系我们，共同开启一份新调查",
  "contact.button": "联系我们",
};

const en: Messages = {
  "nav.contact": "Contact Us",
  "nav.openIndex": "Open archive index",
  "nav.closeIndex": "Close archive index",
  "nav.language": "Language",
  "nav.title.ga001": "What Is Gravity?",
  "nav.title.ga002": "Organization Record",
  "nav.title.ga003": "Member Record",
  "nav.title.ga004": "Visual Survey Archive",
  "nav.title.ga005": "Visual Exploration Record",
  "nav.title.contact": "Start a New Survey",
  "screen.studio": "Universal Gravity Design Archive",
  "screen.ga001": "Archive GA_001 What Is Gravity?",
  "screen.ga002": "Archive GA_002 Organization Record",
  "screen.ga003": "Archive GA_003 Member Record",
  "screen.ga004": "Archive GA_004 Visual Survey Archive",
  "screen.ga005": "Archive GA_005 Visual Exploration Record",
  "screen.contact": "Archive GA_006 Start a New Survey",
  "index.heading": "Archive Index",
  "index.nav": "Archive index",
  "index.ga001": "What Is Gravity?",
  "index.ga002": "Organization Record",
  "index.ga003": "Member Record",
  "index.ga004": "Visual Survey Archive",
  "index.ga005": "Visual Exploration Record",
  "index.ga006": "Start a New Survey",
  "hero.title": "Universal Gravity Design Archive",
  "hero.subtitle":
    "Follow the design survey records to complete this exploration of gravity",
  "intro.line1": "We keep seeing the same pattern",
  "intro.line2a": "Some brands are remembered",
  "intro.line2b": "Some products are chosen",
  "intro.line2c": "Some designs are trusted",
  "intro.bridge":
    "Between people and brands, products and experience, an invisible connection remains — we call it",
  "intro.gravity": "Gravity",
  "intro.folderAlt": "Archive GA_001 folder",
  "org.line1a": "To understand this connection",
  "org.line1b": "To explore gravity",
  "org.founded": "This is why we began",
  "org.enter1": "We enter different",
  "org.enter2": "brands, products, spaces, and digital experiences",
  "org.archive1": "Every design",
  "org.archive2": "becomes a survey archive",
  "member.aria": "Archive GA_003 Member Record",
  "member.imageAlt":
    "Member archive display with white books and a sculpted bust",
  "member.investigator": "Investigator",
  "member.namePrefix": "Name_",
  "member.direction": "Focus_Product & User Experience",
  "member.portfolio": "Portfolio",
  "member.contactMe": "Contact",
  "gallery.list": "Archive card gallery",
  "gallery.detail": "View work details",
  "gallery.hintButtons":
    "Use the side buttons to switch cards, click or press Enter for details, scroll down for the next screen",
  "gallery.hintFree":
    "Drag or use arrow keys to browse cards, click or press Enter for details, scroll down to keep rotating, scroll up to return",
  "gallery.prev": "Previous works",
  "gallery.next": "Next works",
  "gallery.cardAlt": "Visual survey archive card",
  "ga004.aria": "Archive GA_004 Visual Survey Archive",
  "ga004.detailAria": "Archive GA_004 Visual Survey Archive work details",
  "survey.categoryNav": "Survey categories",
  "survey.detailAria":
    "Work details. Scroll up or press Escape to return to the gallery",
  "survey.duration": "One month",
  "survey.description":
    "Design AI Ops is a long-term knowledge system built by the design team around AI capability and production upgrades. It consolidates planning, practice, and assets so AI can evolve from scattered tools into a stable, reusable design production capacity centered on real design scenarios.",
  "survey.heroAlt":
    "Design AI Ops website hero with the title The Apple Moment and work thumbnails below",
  "survey.billboardAlt":
    "A marble digital screen in a gallery showing the AI Ops Genesis visual",
  "survey.emptyWork": "No work in this category yet",
  "ga005.aria": "Archive GA_005 Visual Exploration Record",
  "ga005.imageAlt": "Three blank visual exploration cards on a light desk",
  "contact.aria": "Contact us to start a new survey together",
  "contact.cta": "Contact us to start a new survey together",
  "contact.button": "Contact Us",
};

export const MESSAGES: Record<Locale, Messages> = { zh, en };
