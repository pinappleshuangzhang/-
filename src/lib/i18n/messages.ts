export type Locale = "zh" | "en";

export const DEFAULT_LOCALE: Locale = "zh";

export type MessageKey =
  | "nav.contact"
  | "nav.openIndex"
  | "nav.closeIndex"
  | "nav.language"
  | "nav.index"
  | "nav.close"
  | "nav.langShort"
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
  | "hero.scrollDown"
  | "hero.skipVideo"
  | "loader.role"
  | "loader.id"
  | "loader.apply"
  | "loader.review"
  | "loader.approved"
  | "loader.cardAlt"
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
  | "orgFounding.aria"
  | "orgFounding.designers"
  | "orgFounding.statuesAlt"
  | "orgFounding.plateAlt"
  | "orgFounding.foundedPrefix"
  | "orgFounding.foundedHighlight"
  | "orgFounding.foundedHighlightMobile"
  | "orgFounding.detail1"
  | "orgFounding.detail1Mobile"
  | "orgFounding.detail2"
  | "member.aria"
  | "member.imageAlt"
  | "member.investigator"
  | "member.namePrefix"
  | "member.direction"
  | "member.role01"
  | "member.role02"
  | "member.role03"
  | "member.role04"
  | "member.direction01"
  | "member.direction02"
  | "member.direction03"
  | "member.direction04"
  | "member.portfolio"
  | "member.contactMe"
  | "gallery.list"
  | "gallery.category.brand"
  | "gallery.category.product"
  | "gallery.category.website"
  | "gallery.category.visual"
  | "gallery.category.motion"
  | "gallery.dragHint"
  | "gallery.view"
  | "gallery.detail"
  | "gallery.cursorDetail"
  | "gallery.hintButtons"
  | "gallery.hintFree"
  | "gallery.prev"
  | "gallery.next"
  | "gallery.cardAlt"
  | "gallery.mobile.heading"
  | "gallery.mobile.viewDetails"
  | "ga004.aria"
  | "ga004.detailAria"
  | "survey.categoryNav"
  | "survey.detailTitle"
  | "survey.detailAria"
  | "survey.duration"
  | "survey.description"
  | "survey.heroAlt"
  | "survey.heroPreview"
  | "survey.videoExpand"
  | "survey.media2Alt"
  | "survey.media3Alt"
  | "survey.media4Alt"
  | "survey.media5Alt"
  | "survey.emptyWork"
  | "ga005.aria"
  | "ga005.imageAlt"
  | "contact.aria"
  | "contact.cta"
  | "contact.addressLabel"
  | "contact.address"
  | "contact.foundedLabel"
  | "contact.founded"
  | "contact.servicesLabel"
  | "contact.services"
  | "contact.button";

type Messages = Record<MessageKey, string>;

const zh: Messages = {
  "nav.contact": "联系我们",
  "nav.openIndex": "打开目录",
  "nav.closeIndex": "关闭目录",
  "nav.language": "语言切换",
  "nav.index": "目录",
  "nav.close": "关闭",
  "nav.langShort": "英",
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
  "hero.subtitle": '跟随设计调查记录，我们一起完成本次关于"引力"的探索',
  "hero.scrollDown": "向下滑动",
  "hero.skipVideo": "跳过视频",
  "loader.role": "临时调查员",
  "loader.id": "G_U0412",
  "loader.apply": "申请临时访问权限",
  "loader.review": "档案连接中",
  "loader.approved": "已批准你的临时申请",
  "loader.cardAlt": "Grava 材质铭牌",
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
  "orgFounding.aria": "档案 GA_002 组织记录 工作室成立",
  "orgFounding.designers": "四位设计师",
  "orgFounding.statuesAlt": "四位设计师围坐圆桌讨论的白色雕塑",
  "orgFounding.plateAlt": "嵌有工作室标识的金属铭牌装置",
  "orgFounding.foundedPrefix": "我们成立了",
  "orgFounding.foundedHighlight": "万有引力设计工作室",
  "orgFounding.foundedHighlightMobile": "万有引力工作室",
  "orgFounding.detail1": "我们进入不同的品牌、产品、空间与数字体验",
  "orgFounding.detail1Mobile": "我们进入不同的品牌、产品、空间与数字体验",
  "orgFounding.detail2": "每一次设计都会形成一份“调查档案”",
  "member.aria": "档案 GA_003 成员记录",
  "member.imageAlt": "摆放白色书籍与雕塑半身像的成员档案展柜",
  "member.investigator": "调查员",
  "member.namePrefix": "姓名_",
  "member.direction": "调查方向_产品与用户体验",
  "member.role01": "定向者",
  "member.role02": "连接者",
  "member.role03": "构建者",
  "member.role04": "探索者",
  "member.direction01": "调查方向_信息判断，找寻探索方向",
  "member.direction02": "调查方向_建立人与产品、人与体验的连接",
  "member.direction03": "调查方向_抽象概念，建立完整系统",
  "member.direction04": "调查方向_不断尝试新的视觉表达与创意可能",
  "member.portfolio": "个人作品站",
  "member.contactMe": "联系我",
  "gallery.list": "档案卡片列表",
  "gallery.category.brand": "品牌设计",
  "gallery.category.product": "产品设计",
  "gallery.category.website": "网站设计",
  "gallery.category.visual": "视觉设计",
  "gallery.category.motion": "动态设计",
  "gallery.dragHint": "拖拽",
  "gallery.view": "查看",
  "gallery.detail": "查看作品详情",
  "gallery.cursorDetail": "点击查看详情",
  "gallery.hintButtons":
    "点击左右按钮切换档案卡片，点击或按 Enter 查看作品详情，下滑切换到下一屏",
  "gallery.hintFree":
    "拖拽或左右方向键旋转浏览档案卡片，点击或按 Enter 查看作品详情，下滑继续旋转，上滑返回上一屏",
  "gallery.prev": "查看上一组作品",
  "gallery.next": "查看下一组作品",
  "gallery.cardAlt": "视觉调查档案卡片",
  "gallery.mobile.heading": "调查记录",
  "gallery.mobile.viewDetails": "查看详情",
  "ga004.aria": "档案 GA_004 视觉调查档案",
  "ga004.detailAria": "档案 GA_004 视觉调查档案 作品详情",
  "survey.categoryNav": "调查类型",
  "survey.detailTitle": "调查详情",
  "survey.detailAria": "作品详情抽屉，按 Escape 或点击空白处关闭",
  "survey.duration": "一个月",
  "survey.description":
    "Design AI Ops 是设计团队围绕 AI 能力建设与设计生产升级建立的长期知识体系，用于统一沉淀团队在 AI 方向上的规划、项目实践与能力资产。该体系以设计业务场景为核心，通过持续积累工具、方法与案例，使 AI 从零散工具使用逐步演进为稳定、可复用的设计生产能力。",
  "survey.heroAlt":
    "Design AI Ops 网站首屏：Brand Creativity、Website Design、Material Collection，中央为 Design AI Ops The Apple Moment，底部为作品缩略图",
  "survey.heroPreview": "悬停或聚焦时播放预览视频",
  "survey.videoExpand": "点击查看视频",
  "survey.media2Alt":
    "亚当与上帝指尖之间悬浮青苹果，左上角为 The Apple Moment",
  "survey.media3Alt":
    "女性侧脸将咬下青苹果，蛇缠绕手腕，左上角写当人咬下苹果关系开始改变",
  "survey.media4Alt":
    "男子面容被青苹果遮住，左上角写当苹果出现在画面中世界的结构被重新观看",
  "survey.media5Alt":
    "身着文艺复兴服饰的男子在笔记本前沉思，电脑上的苹果标志发出绿光",
  "survey.emptyWork": "该类型暂无作品",
  "ga005.aria": "档案 GA_005 视觉探索记录",
  "ga005.imageAlt": "三张铺在浅色桌面上的空白视觉探索卡片",
  "contact.aria": "与我们共同开启一份新调查",
  "contact.cta": "与我们共同开启一份新调查",
  "contact.addressLabel": "地址",
  "contact.address": "中国 · 北京 · 朝阳区",
  "contact.foundedLabel": "成立于",
  "contact.founded": "2021年",
  "contact.servicesLabel": "服务范围",
  "contact.services": "品牌 · 视觉 · 产品 · 网站 · 动态",
  "contact.button": "联系我们",
};

const en: Messages = {
  "nav.contact": "Contact Us",
  "nav.openIndex": "Open Archive Index",
  "nav.closeIndex": "Close Archive Index",
  "nav.language": "Language",
  "nav.index": "Index",
  "nav.close": "Close",
  "nav.langShort": "中",
  "nav.title.ga001": "What Is Gravity?",
  "nav.title.ga002": "Organization Record",
  "nav.title.ga003": "Member Record",
  "nav.title.ga004": "Visual Survey Archive",
  "nav.title.ga005": "Visual Exploration Log",
  "nav.title.contact": "Start A New Survey",
  "screen.studio": "Universal Gravity Design Archive",
  "screen.ga001": "Archive GA_001 What Is Gravity?",
  "screen.ga002": "Archive GA_002 Organization Record",
  "screen.ga003": "Archive GA_003 Member Record",
  "screen.ga004": "Archive GA_004 Visual Survey Archive",
  "screen.ga005": "Archive GA_005 Visual Exploration Log",
  "screen.contact": "Archive GA_006 Start A New Survey",
  "index.heading": "Archive Index",
  "index.nav": "Archive Index",
  "index.ga001": "What Is Gravity?",
  "index.ga002": "Organization Record",
  "index.ga003": "Member Record",
  "index.ga004": "Visual Survey Archive",
  "index.ga005": "Visual Exploration Log",
  "index.ga006": "Start A New Survey",
  "hero.title": "Grava Design Archive",
  "hero.subtitle": "Follow The Design Log As We Explore Gravity Together",
  "hero.scrollDown": "Scroll Down",
  "hero.skipVideo": "Skip Video",
  // 尾随普通空格会被行内折叠掉，用不换行空格才能与编号隔开
  "loader.role": "Temporary Investigator\u00A0",
  "loader.id": "G_U0412",
  "loader.apply": "Requesting Temporary Access",
  "loader.review": "Connecting Archive",
  "loader.approved": "Temporary Application Approved",
  "loader.cardAlt": "Grava material plaque",
  "intro.line1": "One Pattern Repeats",
  "intro.line2a": "Some Brands Stick",
  "intro.line2b": "Some Products Win",
  "intro.line2c": "Some Designs Win\u00A0Trust",
  "intro.bridge":
    "An Unseen Bond Links\nPeople To Brands\nProducts To Experiences\nWe Call It—",
  "intro.gravity": "Gravity",
  "intro.folderAlt": "Archive GA_001 Folder",
  "org.line1a": "To Understand This Connection",
  "org.line1b": "To Explore Gravity",
  "org.founded": "This Is Why We Began",
  "org.enter1": "We Enter Different",
  "org.enter2": "Brands, Products, Spaces, And Digital Experiences",
  "org.archive1": "Every Design",
  "org.archive2": "Becomes A Survey Archive",
  "orgFounding.aria": "Archive GA_002 Organization Record — Studio Founding",
  "orgFounding.designers": "Four Designers",
  "orgFounding.statuesAlt":
    "White Sculpture Of Four Designers In Discussion Around A Table",
  "orgFounding.plateAlt": "Metal Plate Installation With The Studio Logo",
  "orgFounding.foundedPrefix": "We Founded ",
  "orgFounding.foundedHighlight": "Universal Grava Design Studio",
  "orgFounding.foundedHighlightMobile": "Universal Grava Design Studio",
  "orgFounding.detail1":
    "We Enter Different Brands, Products, Spaces, And Digital Experiences",
  "orgFounding.detail1Mobile":
    "We Enter Different Brands, Products, Spaces, And Digital Experiences.",
  "orgFounding.detail2": "Every Design Becomes A Survey Archive",
  "member.aria": "Archive GA_003 Member Record",
  "member.imageAlt":
    "Member Archive Display With White Books And A Sculpted Bust",
  "member.investigator": "Investigator",
  "member.namePrefix": "Name_",
  "member.direction": "Focus_Product & User Experience",
  "member.role01": "Navigator",
  "member.role02": "Connector",
  "member.role03": "Builder",
  "member.role04": "Explorer",
  "member.direction01": "Focus_Assessing Info & Finding Direction",
  "member.direction02": "Focus_People, Products & Experiences",
  "member.direction03": "Focus_Ideas into Complete Systems",
  "member.direction04": "Focus_Testing Visual & Creative Possibilities",
  "member.portfolio": "Portfolio",
  "member.contactMe": "Contact",
  "gallery.list": "Archive Card Gallery",
  "gallery.category.brand": "Brand Design",
  "gallery.category.product": "Product Design",
  "gallery.category.website": "Website Interface",
  "gallery.category.visual": "Visual Design",
  "gallery.category.motion": "Motion Graphics",
  "gallery.dragHint": "Drag",
  "gallery.view": "View",
  "gallery.detail": "View Work Details",
  "gallery.cursorDetail": "Click For Details",
  "gallery.hintButtons":
    "Use The Side Buttons To Switch Cards, Click Or Press Enter For Details, Scroll Down For The Next Screen",
  "gallery.hintFree":
    "Drag Or Use Arrow Keys To Browse Cards, Click Or Press Enter For Details, Scroll Down To Keep Rotating, Scroll Up To Return",
  "gallery.prev": "Previous Works",
  "gallery.next": "Next Works",
  "gallery.cardAlt": "Visual Survey Archive Card",
  "gallery.mobile.heading": "Survey Records",
  "gallery.mobile.viewDetails": "View Details",
  "ga004.aria": "Archive GA_004 Visual Survey Archive",
  "ga004.detailAria": "Archive GA_004 Visual Survey Archive Work Details",
  "survey.categoryNav": "Survey Categories",
  "survey.detailTitle": "Survey Details",
  "survey.detailAria":
    "Work Details Drawer. Press Escape Or Click Empty Space To Close",
  "survey.duration": "One Month",
  "survey.description":
    "Design AI Ops Is A Long-Term Knowledge System Built By The Design Team Around AI Capability And Production Upgrades. It Consolidates Planning, Practice, And Assets So AI Can Evolve From Scattered Tools Into A Stable, Reusable Design Production Capacity Centered On Real Design Scenarios.",
  "survey.heroAlt":
    "Design AI Ops Website Hero With Brand Creativity, Website Design, Material Collection, The Title The Apple Moment, And Work Thumbnails Below",
  "survey.heroPreview": "Hover Or Focus To Play A Preview Video",
  "survey.videoExpand": "Tap To Watch",
  "survey.media2Alt":
    "Adam And God Reach Toward A Green Apple Between Their Fingertips, Titled The Apple Moment",
  "survey.media3Alt":
    "A Woman In Profile About To Bite A Green Apple, A Snake Coiled Around The Wrist",
  "survey.media4Alt":
    "A Man Whose Face Is Hidden By A Green Apple, With Text About Seeing The World Anew",
  "survey.media5Alt":
    "A Man In Renaissance Dress Thinking At A Laptop Whose Apple Logo Glows Green",
  "survey.emptyWork": "No Work In This Category Yet",
  "ga005.aria": "Archive GA_005 Visual Exploration Log",
  "ga005.imageAlt": "Three Blank Visual Exploration Cards On A Light Desk",
  "contact.aria": "Start A New Survey With Us",
  "contact.cta": "Start A New Survey With Us",
  "contact.addressLabel": "Location",
  "contact.address": "Chaoyang District · Beijing · China",
  "contact.foundedLabel": "Founded",
  "contact.founded": "2021",
  "contact.servicesLabel": "Services",
  "contact.services": "Brand · Identity · Product · Web · Motion",
  "contact.button": "Contact Us",
};

export const MESSAGES: Record<Locale, Messages> = { zh, en };
