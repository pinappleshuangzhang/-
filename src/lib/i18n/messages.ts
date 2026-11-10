export type Locale = "zh" | "en";

export const DEFAULT_LOCALE: Locale = "en";

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
  | "nav.title.ga004.mobile"
  | "nav.title.contact"
  | "screen.studio"
  | "screen.ga001"
  | "screen.ga002"
  | "screen.ga003"
  | "screen.ga004"
  | "screen.contact"
  | "index.heading"
  | "index.nav"
  | "index.ga000"
  | "index.ga001"
  | "index.ga002"
  | "index.ga003"
  | "index.ga004"
  | "index.ga005"
  | "hero.title"
  | "hero.subtitle"
  | "hero.subtitleHighlight"
  | "hero.scrollDown"
  | "hero.skipVideo"
  | "loader.role"
  | "loader.welcome"
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
  | "studioIntro.aria"
  | "studioIntro.line1"
  | "studioIntro.line2"
  | "studioIntro.line3"
  | "studioIntro.line4"
  | "studioIntro.card1Title"
  | "studioIntro.card1Body"
  | "studioIntro.card2Title"
  | "studioIntro.card2Body1"
  | "studioIntro.card2Body2"
  | "studioIntro.card2Body3"
  | "studioIntro.plateAlt"
  | "member.aria"
  | "member.imageAlt"
  | "member.investigator"
  | "member.namePrefix"
  | "member.name01"
  | "member.name02"
  | "member.name03"
  | "member.name04"
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
  | "gallery.category.all"
  | "gallery.category.brand"
  | "gallery.category.product"
  | "gallery.category.website"
  | "gallery.category.notes"
  | "gallery.category.anniversary"
  | "gallery.category.region"
  | "gallery.category.visual"
  | "gallery.category.motion"
  | "gallery.mobile.category.all"
  | "gallery.mobile.category.website"
  | "gallery.mobile.category.brand"
  | "gallery.mobile.category.creative"
  | "gallery.mobile.category.motion"
  | "gallery.mobile.category.notes"
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
  | "survey.title"
  | "survey.description"
  | "survey.heroAlt"
  | "survey.heroPreview"
  | "survey.videoExpand"
  | "survey.imageExpand"
  | "survey.tagList"
  | "survey.tag.event"
  | "survey.tag.brand"
  | "survey.tag.website"
  | "survey.tag.visual"
  | "survey.tag.motion"
  | "survey.tag.explore"
  | "survey.tag.observe"
  | "survey.tag.aiDesign"
  | "survey.tag.judgment"
  | "survey.tag.practice"
  | "survey.tag.aiAssist"
  | "survey.tag.brandVisual"
  | "survey.tag.visualSystem"
  | "survey.tag.crossMarket"
  | "survey.tag.modular"
  | "survey.tag.multiMarket"
  | "survey.media2Title"
  | "survey.media2Caption"
  | "survey.media2Alt"
  | "survey.media3Title"
  | "survey.media3Caption"
  | "survey.media3Alt"
  | "survey.media4Title"
  | "survey.media4Caption"
  | "survey.media4Alt"
  | "survey.media5Title"
  | "survey.media5Caption"
  | "survey.media5Alt"
  | "survey.media6Title"
  | "survey.media6Caption"
  | "survey.media6Alt"
  | "survey.media7Alt"
  | "survey.media8Alt"
  | "survey.media9Alt"
  | "survey.apple.sceneTitle"
  | "survey.apple.sceneCaption"
  | "survey.apple.stageAlt"
  | "survey.apple.coverAlt"
  | "survey.apple.01Alt"
  | "survey.apple.02Alt"
  | "survey.apple.03Alt"
  | "survey.apple.03bAlt"
  | "survey.apple.04Alt"
  | "survey.apple.05Alt"
  | "survey.apple.06Alt"
  | "survey.apple.07Alt"
  | "survey.apple.08Alt"
  | "survey.apple.09Alt"
  | "survey.apple.10Alt"
  | "survey.apple.11Alt"
  | "survey.apple.12Alt"
  | "survey.apple.13Alt"
  | "survey.apple.14Alt"
  | "survey.apple.15Alt"
  | "survey.apple.16Alt"
  | "survey.apple.17Alt"
  | "survey.apple.18Alt"
  | "survey.apple.19Alt"
  | "survey.apple.20Alt"
  | "survey.future.title"
  | "survey.future.description"
  | "survey.future.heroAlt"
  | "survey.future.media1Title"
  | "survey.future.media1Caption"
  | "survey.future.media1Alt"
  | "survey.future.media2Title"
  | "survey.future.media2Caption"
  | "survey.future.media2Alt"
  | "survey.future.media3Title"
  | "survey.future.media3Caption"
  | "survey.future.media3Alt"
  | "survey.future.media4Title"
  | "survey.future.media4Caption"
  | "survey.future.media4Alt"
  | "survey.future.media5Title"
  | "survey.future.media5Caption"
  | "survey.future.media5Alt"
  | "survey.future.media6Title"
  | "survey.future.media6Caption"
  | "survey.future.media6Alt"
  | "survey.easycash.title"
  | "survey.easycash.description"
  | "survey.easycash.heroAlt"
  | "survey.easycash.media1Title"
  | "survey.easycash.media1Caption"
  | "survey.easycash.media1Alt"
  | "survey.easycash.media2Title"
  | "survey.easycash.media2Caption"
  | "survey.easycash.media2Alt"
  | "survey.easycash.media3Title"
  | "survey.easycash.media3Caption"
  | "survey.easycash.media3Alt"
  | "survey.easycash.media4Title"
  | "survey.easycash.media4Caption"
  | "survey.easycash.media4Alt"
  | "survey.easycash.media5Title"
  | "survey.easycash.media5Caption"
  | "survey.easycash.media5Alt"
  | "survey.easycash.media6Title"
  | "survey.easycash.media6Caption"
  | "survey.easycash.media6Alt"
  | "survey.easycash.home01Alt"
  | "survey.easycash.home02Alt"
  | "survey.easycash.home03Alt"
  | "survey.easycash.home04Alt"
  | "survey.easycash.home05Alt"
  | "survey.easycash.home06Alt"
  | "survey.easycash.homeVideoAlt"
  | "survey.easycash.loanVideoAlt"
  | "survey.easycash.wealthVideoAlt"
  | "survey.easycash.fraudVideoAlt"
  | "survey.easycash.loan08Alt"
  | "survey.easycash.loan09Alt"
  | "survey.easycash.loan10Alt"
  | "survey.easycash.loan12Alt"
  | "survey.easycash.loan13Alt"
  | "survey.easycash.wealth14Alt"
  | "survey.easycash.wealth15Alt"
  | "survey.easycash.wealth16Alt"
  | "survey.easycash.wealth17Alt"
  | "survey.easycash.wealth18Alt"
  | "survey.easycash.homeTitle"
  | "survey.easycash.homeCaption"
  | "survey.easycash.productTitle"
  | "survey.easycash.productCaption"
  | "survey.easycash.fraudTitle"
  | "survey.easycash.fraudCaption"
  | "survey.easycash.fraud01Alt"
  | "survey.easycash.fraud02Alt"
  | "survey.easycash.fraud03Alt"
  | "survey.easycash.fraud04Alt"
  | "survey.easycash.aboutTitle"
  | "survey.easycash.aboutCaption"
  | "survey.easycash.about01Alt"
  | "survey.easycash.about02Alt"
  | "survey.easycash.about03Alt"
  | "survey.easycash.about04Alt"
  | "survey.ops.title"
  | "survey.ops.description"
  | "survey.ops.heroAlt"
  | "survey.ops.media2Alt"
  | "survey.ops.media3Alt"
  | "survey.ops.media4Alt"
  | "survey.ops.media5Alt"
  | "survey.ops.media6Alt"
  | "survey.anniversary.title"
  | "survey.anniversary.description"
  | "survey.anniversary.heroAlt"
  | "survey.region.title"
  | "survey.region.description"
  | "survey.region.heroAlt"
  | "survey.emptyWork"
  | "contact.aria"
  | "contact.cta"
  | "contact.addressLabel"
  | "contact.address"
  | "contact.foundedLabel"
  | "contact.founded"
  | "contact.servicesLabel"
  | "contact.services"
  | "contact.button"
  | "contact.copied"
  | "contact.copyAria"
  | "contactSurvey.aria"
  | "contactSurvey.headline"
  | "contactSurvey.line1"
  | "contactSurvey.line2"
  | "contactSurvey.line3"
  | "contactSurvey.line4"
  | "contactSurvey.emailAria"
  | "contactSurvey.phoneAria"
  | "contactForm.title"
  | "contactForm.name"
  | "contactForm.email"
  | "contactForm.message"
  | "contactForm.send"
  | "contactForm.sending"
  | "contactForm.successTitle"
  | "contactForm.successBody"
  | "contactForm.errorRequired"
  | "contactForm.errorEmail"
  | "contactForm.errorSend";

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
  "nav.title.ga004": "《作品调查记录》",
  "nav.title.ga004.mobile": "《作品调查记录》",
  "nav.title.contact": "《联系我们》",
  "screen.studio": "万有引力设计档案室",
  "screen.ga001": "档案 GA_001 什么是引力？",
  "screen.ga002": "档案 GA_002 组织记录",
  "screen.ga003": "档案 GA_003 成员记录",
  "screen.ga004": "档案 GA_004 视觉调查档案",
  "screen.contact": "档案 GA_005 联系我们",
  "index.heading": "档案目录 ARCHIVE INDEX",
  "index.nav": "档案目录",
  "index.ga000": "《档案室首页》",
  "index.ga001": "《什么是引力？》",
  "index.ga002": "《组织记录》",
  "index.ga003": "《成员记录》",
  "index.ga004": "《作品调查记录》",
  "index.ga005": "《联系我们》",
  "hero.title": "万有引力设计档案室",
  "hero.subtitle": "为品牌、产品与体验，建立被选择的引力",
  "hero.subtitleHighlight": "建立被选择的引力",
  "hero.scrollDown": "向下滑动",
  "hero.skipVideo": "跳过视频",
  "loader.role": "临时调查员",
  "loader.welcome": "",
  "loader.id": "G_U0412",
  "loader.apply": "申请临时访问权限",
  "loader.review": "档案连接中",
  "loader.approved": "已批准你的临时申请",
  "loader.cardAlt": "Grava 材质铭牌",
  "intro.line1": "我们不断看到同一种现象：",
  "intro.line2a": "有些品牌被记住，",
  "intro.line2b": "有些产品被选择，",
  "intro.line2c": "有些体验让人愿意相信。",
  "intro.bridge": "这种连接，我们称之为——",
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
  "studioIntro.aria": "档案 GA_002 工作室简介",
  "studioIntro.line1": "理解连接如何发生",
  "studioIntro.line2": "创造被选择的引力",
  "studioIntro.line3": "",
  "studioIntro.line4": "",
  "studioIntro.card1Title": "我们想做的——",
  "studioIntro.card1Body": "就是把这种看不见的连接变成真实可感的设计",
  "studioIntro.card2Title": "我们的工作方式——",
  "studioIntro.card2Body1": "从策略判断、系统构建，到视觉表达与体验落地",
  "studioIntro.card2Body2": "帮助品牌找到方向并将它转为完整、可持续的设计系统",
  "studioIntro.card2Body3": "",
  "studioIntro.plateAlt": "嵌有工作室标识的金属铭牌装置",
  "member.aria": "档案 GA_003 成员记录",
  "member.imageAlt": "摆放白色书籍与雕塑半身像的成员档案展柜",
  "member.investigator": "调查员",
  "member.namePrefix": "姓名_",
  "member.name01": "Jianan",
  "member.name02": "Yang",
  "member.name03": "陆78",
  "member.name04": "Shuang",
  "member.direction": "调查方向_产品与用户体验",
  "member.role01": "定向者",
  "member.role02": "构建者",
  "member.role03": "探索者",
  "member.role04": "连接者",
  "member.direction01": "调查方向_识别关键问题，确定设计方向",
  "member.direction02": "调查方向_将概念转化为完整、可延展的系统",
  "member.direction03": "调查方向_探索新的视觉语言与创意形式",
  "member.direction04": "调查方向_构建人与产品之间自然、有效的体验连接",
  "member.portfolio": "个人作品站",
  "member.contactMe": "联系我",
  "gallery.list": "档案卡片列表",
  "gallery.category.all": "所有项目",
  "gallery.category.brand": "苹果时刻：AI 创意设计实践",
  "gallery.category.product": "未来创意 2030",
  "gallery.category.website": "Easycash 数字品牌视觉重塑",
  "gallery.category.notes": "Design AI Ops 实战笔记",
  "gallery.category.anniversary": "Easycash 9周年视觉系统",
  "gallery.category.region": "跨地区金融网站重构：通用架构设计实践",
  "gallery.category.visual": "视觉设计",
  "gallery.category.motion": "动态设计",
  "gallery.mobile.category.all": "全部项目",
  "gallery.mobile.category.website": "网站设计",
  "gallery.mobile.category.brand": "品牌设计",
  "gallery.mobile.category.creative": "创意设计",
  "gallery.mobile.category.motion": "动态设计",
  "gallery.mobile.category.notes": "实战笔记",
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
  "survey.title": "苹果时刻：AI 创意设计实践",
  "survey.description":
    "每一次技术转折，都在重新定义创造。《The Apple Moment》是一项围绕 AI 与创造力展开的整合型活动策划。项目以“苹果”为贯穿古典艺术、流行文化与科技史的视觉符号，通过经典图像重构建立关于创造、认知、观看与技术演进的叙事，并延展至品牌视觉、系列海报、互动网站、H5与动态传播，将一次 AI 创新活动转化为具有完整体验与长期资产价值的品牌事件。",
  "survey.heroAlt":
    "The Apple Moment 活动视觉系统，以黑白经典艺术图像、绿色苹果和系列数字页面组成统一视觉叙事。",
  "survey.heroPreview": "悬停或聚焦时播放预览视频",
  "survey.videoExpand": "点击查看视频",
  "survey.imageExpand": "点击放大图片",
  "survey.tagList": "作品类型",
  "survey.tag.event": "活动策划",
  "survey.tag.brand": "品牌设计",
  "survey.tag.website": "网站设计",
  "survey.tag.visual": "视觉设计",
  "survey.tag.motion": "动态设计",
  "survey.tag.explore": "创意探索",
  "survey.tag.observe": "设计观察",
  "survey.tag.aiDesign": "AI与设计",
  "survey.tag.judgment": "判断",
  "survey.tag.practice": "作品与实践",
  "survey.tag.aiAssist": "AI辅助设计",
  "survey.tag.brandVisual": "品牌视觉",
  "survey.tag.visualSystem": "视觉系统",
  "survey.tag.crossMarket": "跨地区网站重构",
  "survey.tag.modular": "模块化架构",
  "survey.tag.multiMarket": "多地区业务复用",
  "survey.media2Title": "苹果时刻",
  "survey.media2Caption":
    "以《创造亚当》重构“创造发生的瞬间”，让绿色苹果成为人与未知能力之间的媒介，将古典神话中的创造关系转译为 AI 时代关于能力、意识与创造权重新分配的隐喻。",
  "survey.media2Alt":
    "The Apple Moment 活动视频以黑白古典视觉和绿色苹果展开，从故障化苹果、手托苹果到《创造亚当》重构画面，串联 AI Value Program 与“觉醒、发现、重塑工具”的主题，呈现 AI 与创造力关系的视觉序章。",
  "survey.media3Title": "认知之果",
  "survey.media3Caption":
    "借用亚当与夏娃“禁果”的文化隐喻，把苹果从诱惑转化为认知变化的触发器；AI 如同新的知识入口，在赋予能力的同时，也重新定义人与工具的关系。",
  "survey.media3Alt":
    "黑白夏娃人物手持绿色苹果，蛇缠绕在苹果与手臂周围；对应视频以“人与 AI 之间”为主题，展示人与 AI 从命令执行走向对话、反馈和协作的关系演变。",
  "survey.media4Title": "重新观看",
  "survey.media4Caption":
    "当 AI 从工具逐渐进入判断、执行与创造过程，人与 AI 的关系不再只是“使用者与工具”。通过人物肖像与苹果的置换，表达身份、能力与创造主体之间不断模糊的边界。",
  "survey.media4Alt":
    "黑白人物肖像被绿色苹果覆盖，画面文字强调“世界的结构被重新观看”；对应视频展示 AI Value Program 项目评审，并围绕提问、生成、判断与整合等维度讨论 AI 创意价值。",
  "survey.media5Title": "创造力的操作系统",
  "survey.media5Caption":
    "工具不再是重点，退到流程的后面。被重新组织的，是思考、制作、验证与协作。苹果落下之后，创造力沿着冲击、共创、重构与进化展开；评审要选出项目，也要把值得留下的方法收进这套新的操作系统。",
  "survey.media5Alt":
    "乔布斯身着古典服饰坐在书桌前，画面同时出现羽毛笔、书籍、电脑与绿色苹果，表现 AI 从单一工具进入思考、制作、验证与协作流程，并逐步成为新的创意工作系统。",
  "survey.media6Title": "新的系统",
  "survey.media6Caption":
    "将夏娃、《创造亚当》、乔布斯与绿色苹果重新并置，回收前序叙事，并提出最终判断：当 AI 进入思考、制作、验证与协作流程后，人的价值不会消失，而会更集中地体现在判断、选择与价值定义上。",
  "survey.media6Alt":
    "黑白网点视觉中，绿色苹果与夏娃、《创造亚当》、乔布斯等元素重新组合；视频围绕 AI 项目评审、方法沉淀与人机协作展开，并以“比赛只是第一幕”总结 AI 从工具走向创作系统的变化。",
  "survey.media7Alt":
    "灰色混凝土空间中陈列黑色与绿色的苹果时刻海报和时钟",
  "survey.media8Alt":
    "两部手机与绿色曲线装置组成的苹果时刻移动端页面展示",
  "survey.media9Alt":
    "绿色档案抽屉和户外海报架中的苹果时刻活动海报展示",
  "survey.apple.sceneTitle": "走进现场",
  "survey.apple.sceneCaption":
    "同一套视觉离开屏幕，进入画框、墙面与手机。时钟把半年评审收成可以被观看的时间，二维码把现场引向 H5，页面则把《创造亚当》与叙事实验放回掌心。一次活动因此不只停在发布，而成为可以走进、扫码、继续查看的品牌现场。",
  "survey.apple.stageAlt":
    "木桌上的笔记本电脑播放托着玻璃苹果的手，旁边放着一只青苹果。",
  "survey.apple.coverAlt":
    "木桌上的笔记本电脑播放 The Apple Moment 画面，旁边放着一只青苹果。",
  "survey.apple.01Alt":
    "圆形古典纹样中的标题 The Apple Moment，副题为 AI 时代的创造力转折点。",
  "survey.apple.02Alt": "古典纹样圆框中，一只手托着苹果。",
  "survey.apple.03Alt":
    "四格画面中的手托苹果，分别是素描、发光的蓝苹果、咬过的红苹果和青苹果。",
  "survey.apple.03bAlt":
    "重构的《创造亚当》，天使把青苹果递给坐着的人。",
  "survey.apple.04Alt":
    "黑白夏娃侧脸咬住青苹果，蛇缠在手臂上，文字写着当人咬下苹果，关系开始改变。",
  "survey.apple.05Alt":
    "暗色风景上的文字「人与 AI 之间」，说明关系从命令执行变为对话与共同生成。",
  "survey.apple.06Alt":
    "戴礼帽的人物面部被青苹果挡住，文字写着世界的结构被重新观看。",
  "survey.apple.07Alt":
    "深色纹样背景上的五个问题，讨论谁负责提问、生成、判断、整合与沉淀。",
  "survey.apple.08Alt":
    "古典装束的人坐在书桌前，桌上有羽毛笔、笔记本电脑和旧电脑。",
  "survey.apple.09Alt":
    "标题「工具不是重点」，射线标出 Cursor、ChatGPT、Claude、Codex 和 Lovart。",
  "survey.apple.10Alt":
    "树下读书的人与河谷风景，标出冲击、共创、重构与进化。",
  "survey.apple.11Alt":
    "青苹果叠在文字上，说明评审要选出项目，也要沉淀方法。",
  "survey.apple.12Alt":
    "黑色网点背景上拼贴夏娃、创造亚当、书桌与青苹果，标题为新的系统。",
  "survey.apple.13Alt":
    "眼睛特写旁写着比赛只是第一幕，并列出案例库、方法论与实验计划。",
  "survey.apple.14Alt":
    "黑色网点背景上的青苹果，文字写未来的创意人比 AI 更会定义价值。",
  "survey.apple.15Alt":
    "金色画框中的 Design AI Ops 时钟海报，指针是一根青苹果的梗。",
  "survey.apple.16Alt":
    "墙上三幅金色画框海报：时钟、创造亚当与二维码入口。",
  "survey.apple.17Alt":
    "石柱旁的金色画框海报，画面是创造亚当与青苹果，下方有二维码。",
  "survey.apple.18Alt":
    "木桌上的手机展示 The Apple Moment 页面，旁边是素描稿和墨水瓶。",
  "survey.apple.19Alt":
    "花纹软垫上的手机，屏幕为 Design AI Ops 页面和二维码。",
  "survey.apple.20Alt":
    "石柱与雕塑旁，手机斜靠着展示 The Apple Moment 页面。",
  "survey.future.title": "未来创意 2030",
  "survey.future.description":
    "《未来创意 2030》是一组围绕数字原生创意文化展开的三维视觉实验，以高饱和色彩、夸张角色和织物质感，呈现年轻创作者在移动设备、时尚、音乐与日常物件之间穿梭的创作状态。项目完成了角色设定、场景搭建、材质灯光及系列版式设计，并通过静态画面与动态片段构成连贯的视觉叙事。",
  "survey.future.heroAlt":
    "粉色背景上的立体字母 L、2 和 B，数字 2 是一个带着手的角色",
  "survey.future.media1Title": "创意图谱",
  "survey.future.media1Caption":
    "以多组角色与场景组成视觉拼贴，集中呈现系列的高饱和配色、织物材质和多元创意方向。",
  "survey.future.media1Alt":
    "白色背景上排列着六组色彩鲜艳的三维角色与创意场景",
  "survey.future.media2Title": "灵感触发",
  "survey.future.media2Caption":
    "角色手持带有火焰符号的设备，以夸张透视和图形爆炸元素表现灵感被瞬间点燃的状态。",
  "survey.future.media2Alt":
    "蓝粉背景中，三维角色手持显示火焰图标的平板电脑",
  "survey.future.media3Title": "移动创作",
  "survey.future.media3Caption":
    "将时尚角色置入地铁车厢，通过随身设备、服饰与材质细节描绘移动场景中的创作日常。",
  "survey.future.media3Alt":
    "粉绿色头发的三维角色站在地铁车厢内，手持音乐播放器并携带彩色包袋",
  "survey.future.media4Title": "创意工具箱",
  "survey.future.media4Caption":
    "以打开的蓝色工具箱收纳多种图形化道具，将抽象的灵感、趣味与行动力转化为可触摸的物件。",
  "survey.future.media4Alt":
    "粉色背景中，戴宽檐帽的角色展示装有多件创意道具的蓝色工具箱",
  "survey.future.media5Title": "视觉档案",
  "survey.future.media5Caption":
    "通过鱼眼镜头呈现手机界面与胶卷、卡片等媒介，构建连接数字内容和实体收藏的视觉档案。",
  "survey.future.media5Alt":
    "鱼眼视角下，一只手展示带有视觉作品和胶卷元素的手机界面",
  "survey.future.media6Title": "灵感陈列",
  "survey.future.media6Caption":
    "透明陈列柜汇集耳机、胶卷、相机和织物等创作线索，以橙色场景为系列叙事收束。",
  "survey.future.media6Alt":
    "橙色背景中，透明柜内陈列耳机、胶卷、相机和多种彩色创意物件",
  "survey.easycash.title": "Easycash 数字品牌视觉重塑",
  "survey.easycash.description":
    "Easycash 官网以一次完整的数字品牌视觉重塑为核心，对首页、产品、安全与品牌信息进行重新定义。项目通过新的 3D 视觉资产、材质语言、色彩系统与场景化构图，建立区别于传统金融行业的品牌气质，让官网从功能型信息载体升级为更具识别度和传播力的数字品牌界面。",
  "survey.easycash.homeTitle": "01 首页视觉系统",
  "survey.easycash.homeCaption":
    "首页以数字“8”建立全新的核心视觉符号，并通过金属、木质、混凝土等不同材质与空间场景持续演绎周年、拉马丹、反欺诈及品牌活动。固定符号与可变材质的组合，让首页形成可持续更新的视觉机制，也建立了 Easycash 更鲜明的第一品牌印象。",
  "survey.easycash.productTitle": "02 产品视觉重构",
  "survey.easycash.productCaption":
    "产品页不再沿用传统金融行业常见的扁平图标与数据化表达，而是通过软质织物、硬币、卡片、锁具等具象物件重新构建产品视觉。不同业务以独立色彩与物件组合表达额度、效率、收益和安全，让产品卖点从抽象信息转变为可感知、可记忆的品牌场景。",
  "survey.easycash.heroAlt":
    "白底海报 Digital Brand Refresh，笔记本电脑放在绿色绒布台面上，屏幕展示开斋节主题首页和绿色数字 8。",
  "survey.easycash.media1Title": "首页视觉系统",
  "survey.easycash.media1Caption":
    "以品牌 8 周年为视觉升级节点，我们重新定义官网首页的第一视觉触点。数字“8”被确立为阶段性的核心识别符号，并通过统一构图、3D 装置、材质语言和品牌色建立可持续延展的 Hero Visual System，使首页从单一活动 Banner 升级为具备品牌识别、主题承载和长期扩展能力的视觉入口。",
  "survey.easycash.media1Alt":
    "Easycash 官网首页视觉系统展示，笔记本电脑中呈现拉马丹主题 Hero Banner，以品牌绿色、3D 数字 8 和立体场景构成核心视觉，体现官网首页的整体视觉升级。",
  "survey.easycash.media2Title": "视觉符号延展",
  "survey.easycash.media2Caption":
    "围绕统一的数字“8”视觉母体，我们为不同业务和传播主题建立模块化延展机制。通过材质、色彩、空间、道具和表面细节的变化，数字“8”可以在品牌周年、金融生活、反欺诈、拉马丹与线下活动等不同语境中持续演化，在保持统一品牌识别的同时，为每个主题建立独立而清晰的视觉记忆点。",
  "survey.easycash.media2Alt":
    "Easycash 多组首页 Banner 视觉纵向排列，统一以数字 8 为核心符号，并通过金属、木质、混凝土和彩色材质表达周年、反欺诈、拉马丹与金融教育等不同主题。",
  "survey.easycash.media3Title": "借款体验视觉重塑",
  "survey.easycash.media3Caption":
    "传统借贷页面往往依赖金额、利率、图标和数据完成信息传达。我们将快速申请、高额度、快速拨付和透明息费等抽象产品优势重新转译为具有体积、材质与生活语义的 3D 场景，使产品价值不再只是被“阅读”，而能够被更直观地感知与记忆，同时降低金融信息本身带来的理解压力。",
  "survey.easycash.media3Alt":
    "Easycash 借款产品页以绿色视觉体系呈现快速申请、高额度、快速拨付和透明息费四项核心优势，并使用四组生活化 3D 场景替代传统金融图标表达。",
  "survey.easycash.media4Title": "借款视觉语言",
  "survey.easycash.media4Caption":
    "以钱包、现金、银行卡、硬币与织物等日常金融物件为基础，我们重新组合出更具触觉感和个性的产品视觉单元。柔软材质、品牌贴纸与高饱和细节削弱传统金融视觉的距离感，让借贷服务从冷静、工具化的表达转向更具生活感和亲和力的品牌体验，同时保持对现金、额度和效率等核心信息的明确指向。",
  "survey.easycash.media4Alt":
    "绿色 Easycash 品牌背景中展示四组借款产品 3D 视觉，包括钱包、银行卡、硬币、现金与织物元素，用于表达申请、额度、放款速度和透明息费等产品特点。",
  "survey.easycash.media5Title": "理财体验视觉重塑",
  "survey.easycash.media5Caption":
    "针对理财业务，我们建立与借款端相互关联但具备独立识别的蓝紫色视觉体系。高回报、安全理财、优质服务与稳定资金支持等偏理性的业务价值，被转化为具象的物件组合与场景隐喻，使复杂的金融信息获得更明确的视觉层级，也帮助不同用户角色快速建立对产品价值的认知。",
  "survey.easycash.media5Alt":
    "Easycash 理财产品页以蓝紫色视觉体系展示高回报、安全理财、优质服务和稳定资金支持四项核心优势，并通过 3D 场景强化信息理解和产品识别。",
  "survey.easycash.media6Title": "理财视觉语言",
  "survey.easycash.media6Caption":
    "理财端延续整体品牌的拼贴、软质材质、贴纸与立体构成，同时通过蓝紫色主色和更偏安全、收益、稳定语义的物件组合形成独立识别。两套产品视觉在统一品牌框架下保持差异，让 Borrow 与 Wealth 不再只是功能不同，而拥有各自清晰的视觉性格与业务表达方式。",
  "survey.easycash.media6Alt":
    "蓝紫色 Easycash 品牌背景中展示四组理财业务 3D 视觉，由布料、金币、锁、卡片和品牌贴纸组成，用于表达安全、收益、服务和稳定资金支持。",
  "survey.easycash.home01Alt":
    "沙发上的笔记本电脑展示 Easycash 八周年首页，绿色球场中央是金属数字 8。",
  "survey.easycash.home02Alt":
    "官网首页首屏，木纹数字 8 立在纸箱上，标题为 Simplify your finances with Easycash。",
  "survey.easycash.home03Alt":
    "官网首页反欺诈首屏，混凝土数字 8 缠着警戒胶带，标题为 Beware of Scams。",
  "survey.easycash.home04Alt":
    "官网首页开斋节首屏，绿色数字 8 立在圆形底座上，标题为 Celebrate the spirit of Ramadan。",
  "survey.easycash.home05Alt":
    "官网首页金融教育首屏，紫色金属数字 8 立在 MOJANG 书本上。",
  "survey.easycash.home06Alt":
    "官网首页 Who are we 板块，右侧是金属数字 8、手机与图表装置，下方列出贷款与出借数据。",
  "survey.easycash.homeVideoAlt":
    "封面海报上播放官网首页，绿色球场上是金属数字 8，标题为 Easycash: Over 8 Years of Simplicity。",
  "survey.easycash.loanVideoAlt":
    "封面海报上播放借款页，画面是 Fast Fund Disbursement，灰色织物容器中堆着印有 Rp 的硬币。",
  "survey.easycash.wealthVideoAlt":
    "封面海报上播放理财页，画面是 Secure and Guaranteed Funding，蓝色钱袋系着麻绳，旁边是 SAFE 盾牌。",
  "survey.easycash.fraudVideoAlt":
    "封面海报上播放反欺诈页，画面是 Waspada Penipuan，绿色仪表旁有红色警示标记和客服电话。",
  "survey.easycash.loan08Alt":
    "借款页 Easy Application Process，棕色织物钱包叠着银行卡、硬币和绿色挂件。",
  "survey.easycash.loan09Alt":
    "借款页 Fast Fund Disbursement，灰色织物容器中堆着印有 Rp 的硬币。",
  "survey.easycash.loan10Alt":
    "借款页 High Loan Limit，灰色金属盒配有笑脸气泡、硬币和 Fast 标签。",
  "survey.easycash.loan12Alt":
    "借款页 Transparent Fees，米色软包中放着扩音器、硬币和费用说明。",
  "survey.easycash.loan13Alt":
    "借款申请三步流程：信用评估、审批与还款，旁边是三台手机界面。",
  "survey.easycash.wealth14Alt":
    "理财页 High Return，蓝色数字 20 旁有金币、麻绳圈和 High 标签。",
  "survey.easycash.wealth15Alt":
    "理财页 Secure and Guaranteed Funding，蓝色钱袋系着麻绳，旁边是 SAFE 盾牌。",
  "survey.easycash.wealth16Alt":
    "理财页 Safe Lending，蓝色软垫旁有银色挂锁和百分比标签。",
  "survey.easycash.wealth17Alt":
    "理财页 High-Quality Services，蓝色布偶、条纹抱枕和心形玩偶组成一组。",
  "survey.easycash.wealth18Alt":
    "理财三步流程：选择产品、充值与获得收益，旁边是三台手机界面。",
  "survey.easycash.fraudTitle": "03 反欺诈视觉重塑",
  "survey.easycash.fraudCaption":
    "反欺诈模块以更具冲击力的警示视觉替代传统的文字型安全提示，通过盾牌、验证码、手机、账户与风险符号构建系列化 3D 场景，使诈骗类型拥有明确的视觉识别。安全教育因此不再只是说明信息，而成为具有品牌特征的独立内容视觉体系。",
  "survey.easycash.fraud01Alt":
    "沙发上的笔记本电脑展示反欺诈页首屏，标题为 Beware of Scams!，旁边是绿色 Rp 仪表和警示标记。",
  "survey.easycash.fraud02Alt":
    "反欺诈页 Protect Your Personal Data，黄色软包系着绿色安全带，旁边有盾牌、百分比和 Rp 硬币。",
  "survey.easycash.fraud03Alt":
    "反欺诈页 Never Share Your OTP Code with Anyone，绿色笑脸软垫放在一排社媒和 Easycash 按键中间。",
  "survey.easycash.fraud04Alt":
    "反欺诈页 Check the virtual account number before repayment，绿色 Easy cash 钱包周围是 Rp 纸币和还款标签。",
  "survey.easycash.aboutTitle": "04 品牌信任视觉",
  "survey.easycash.aboutCaption":
    "About Us 模块将原本偏企业资料式的呈现重新转化为品牌化视觉叙事，通过人物、技术、安全、资质等主题建立不同的场景构图，并统一到同一套 3D 材质和视觉语言中，让企业能力与品牌价值从抽象描述转化为更具形象感的信任表达。",
  "survey.easycash.about01Alt":
    "沙发上的笔记本电脑展示关于我们页 Easycash Product Features，橙色软包写着 Team，旁边是百分号圆环和印有 AI 的黄色钱袋。",
  "survey.easycash.about02Alt":
    "关于我们页 A Reliable Financial Solution，绿色 SAFE 盾牌旁有橙色软包、百分比徽章和 Rp 硬币。",
  "survey.easycash.about03Alt":
    "关于我们页 Our Vision，橙色钱袋、绿色点赞徽章、SAFE 盾牌和印有 E 的挂坠组成一组。",
  "survey.easycash.about04Alt":
    "关于我们页 Product Advantages，左侧是 AI Risk Management 的蓝色电脑，右侧是 Reliable Processes 与 Integrated Advanced Solutions。",
  "survey.ops.title": "Design AI Ops 实战笔记",
  "survey.ops.description":
    "2026 年上半年，我们在团队内部启动了一轮 Design AI Ops 实践。最初的目标很直接：跟上快速变化的 AI 能力，帮助成员拓展工作边界，也让散落在个人手里的尝试，逐渐转化为团队能够共同使用的能力。",
  "survey.ops.heroAlt":
    "Design AI Ops 实战笔记封面，黑底圆环中央是白色标志、绿苹果，以及“当生成不再稀缺，设计还剩下什么”。",
  "survey.ops.media2Alt":
    "古典人物与递出绿苹果的天使，对比工具出现前后：人从提出需求、负责执行，转向提问、判断、选择和整合。",
  "survey.ops.media3Alt":
    "Design AI Ops 示意图，人的角色从重复执行者转为方向判断者、任务拆解者、质量判断者与最终整合者。",
  "survey.ops.media4Alt":
    "设计工作三处转向：从制作页面到定义任务，从堆叠参考到建立判断，从交付文件到沉淀方法。",
  "survey.ops.media5Alt":
    "从重复执行系统转向判断与编排系统，呈现输入、任务、判断、执行、审查与沉淀的工作流。",
  "survey.ops.media6Alt":
    "苹果落下之后的笔记收束：设计留下的是判断、问题、结构、标准与方法。",
  "survey.anniversary.title": "Easycash 9周年视觉系统",
  "survey.anniversary.description":
    "本次视觉设计围绕 Easycash 9 周年主题“Easycash 9 Years Moving Forward Together”（与你一同前行）展开。",
  "survey.anniversary.heroAlt":
    "文章封面以笔记本电脑样机展示 Easycash 九周年羽毛球场主题首页，画面中包含“9TH Anniversary”“2026”字样与品牌标识元素。",
  "survey.region.title": "跨地区金融网站重构：通用架构设计实践",
  "survey.region.description":
    "本次重构建立了一套支持多地区业务的网站通用架构，覆盖页面结构、视觉与交互、设计组件、开发模块及文案内容交付规则。各地区基于公共基础完成品牌、业务与本地内容适配。",
  "survey.region.heroAlt":
    "金融网站跨地区架构封面，地面上排列色板、变量、组件列表、笔记本电脑与手机界面。",
  "survey.emptyWork": "该类型暂无作品",
  "contact.aria": "与我们共同开启一份新调查",
  "contact.cta": "与我们共同开启一份新调查",
  "contact.addressLabel": "地址",
  "contact.address": "中国 · 北京 · 朝阳区",
  "contact.foundedLabel": "成立于",
  "contact.founded": "2021年",
  "contact.servicesLabel": "服务范围",
  "contact.services": "品牌 · 视觉 · 产品 · 网站 · 动态",
  "contact.button": "联系我们",
  "contact.copied": "已复制",
  "contact.copyAria": "复制邮箱",
  "contactSurvey.aria": "联系我们",
  "contactSurvey.headline": "每个项目，都始于一次关于“引力”的调查",
  "contactSurvey.line1": "如果你正在创建新品牌",
  "contactSurvey.line2": "推进品牌升级",
  "contactSurvey.line3": "重塑产品与数字体验",
  "contactSurvey.line4": "欢迎与我们联系",
  "contactSurvey.emailAria": "复制邮箱",
  "contactSurvey.phoneAria": "复制电话",
  "contactForm.title": "填写以下信息，与万有引力共同开启下一份调查",
  "contactForm.name": "调查发起人 / NAME",
  "contactForm.email": "你的邮箱 / EMAIL",
  "contactForm.message": "调查内容 / INQUIRY",
  "contactForm.send": "发送",
  "contactForm.sending": "发送中",
  "contactForm.successTitle": "已收到你的调查申请",
  "contactForm.successBody": "我们会尽快通过邮件与你联系。",
  "contactForm.errorRequired": "请填写此项",
  "contactForm.errorEmail": "请输入有效的邮箱地址",
  "contactForm.errorSend": "发送失败，请稍后再试，或直接发送邮件至",
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
  "nav.title.ga004": "Work Investigation Record",
  "nav.title.ga004.mobile": "Work Investigation Record",
  "nav.title.contact": "Contact Us",
  "screen.studio": "Universal Gravity Design Archive",
  "screen.ga001": "Archive GA_001 What Is Gravity?",
  "screen.ga002": "Archive GA_002 Organization Record",
  "screen.ga003": "Archive GA_003 Member Record",
  "screen.ga004": "Archive GA_004 Visual Investigation Archive",
  "screen.contact": "Archive GA_005 Contact Us",
  "index.heading": "Archive Index",
  "index.nav": "Archive Index",
  "index.ga000": "Archive Home",
  "index.ga001": "What Is Gravity?",
  "index.ga002": "Organization Record",
  "index.ga003": "Member Record",
  "index.ga004": "Work Investigation Record",
  "index.ga005": "Contact Us",
  "hero.title": "Grava Design Archive",
  "hero.subtitle":
    "We help brands, products, and experiences. Earn attention, preference, and trust",
  "hero.subtitleHighlight": "Earn attention, preference, and trust",
  "hero.scrollDown": "Scroll Down",
  "hero.skipVideo": "Skip Video",
  // 尾随普通空格会被行内折叠掉，用不换行空格才能与编号隔开
  "loader.role": "Temporary investigator\u00A0",
  // 手机英文加载行：句末不换行空格用来隔开编号
  "loader.welcome": "Welcome, Temporary Investigator\u00A0",
  "loader.id": "G_U0412",
  "loader.apply": "Requesting temporary access",
  "loader.review": "Connecting archive",
  "loader.approved": "Temporary application approved",
  "loader.cardAlt": "Grava material plaque",
  "intro.line1": "We keep seeing the same thing:",
  "intro.line2a": "Some brands stick,",
  "intro.line2b": "Some products get chosen,",
  "intro.line2c": "And some experiences earn trust.",
  "intro.bridge": "That quiet pull is what we call ——",
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
  "studioIntro.aria": "Archive GA_002 Studio Introduction",
  "studioIntro.line1": "Understand what",
  "studioIntro.line2": "creates connection",
  "studioIntro.line3": "Create a pull",
  "studioIntro.line4": "people can feel",
  "studioIntro.card1Title": "We want to——",
  "studioIntro.card1Body":
    "Turn this invisible connection into design people can truly feel",
  "studioIntro.card2Title": "How we work——",
  "studioIntro.card2Body1":
    "From finding direction and building systems to shaping visuals and experiences",
  "studioIntro.card2Body2":
    "We help brands turn unclear ideas into a design system that lasts",
  "studioIntro.card2Body3": "",
  "studioIntro.plateAlt": "Metal Plate Installation With The Studio Logo",
  "member.aria": "Archive GA_003 Member Record",
  "member.imageAlt":
    "Member Archive Display With White Books And A Sculpted Bust",
  "member.investigator": "Investigator",
  "member.namePrefix": "Name _ ",
  "member.name01": "Jianan",
  "member.name02": "Yang",
  "member.name03": "Joe",
  "member.name04": "Shuang",
  "member.direction": "Focus_Product & User Experience",
  "member.role01": "Navigator",
  "member.role02": "Builder",
  "member.role03": "Explorer",
  "member.role04": "Connector",
  "member.direction01": "Focus _ Spots the real problem and sets direction",
  "member.direction02": "Focus _ Turns ideas into clear, scalable systems",
  "member.direction03": "Focus _ Keeps testing new visual and creative moves",
  "member.direction04":
    "Focus _ Brings people, products, and\nexperiences together",
  "member.portfolio": "Portfolio",
  "member.contactMe": "Contact",
  "gallery.list": "Archive Card Gallery",
  "gallery.category.all": "All",
  "gallery.category.brand": "The Apple Moment: AI Creative Design Practice",
  "gallery.category.product": "Future Creative 2030",
  "gallery.category.website": "Easycash Digital Visual Reframing",
  "gallery.category.notes": "Design AI Ops Field Notes",
  "gallery.category.anniversary": "Easycash 9th Anniversary Visual System",
  "gallery.category.region": "Cross-Market Rebuild: Shared Architecture Practice",
  "gallery.category.visual": "Visual Design",
  "gallery.category.motion": "Motion Graphics",
  "gallery.mobile.category.all": "All",
  "gallery.mobile.category.website": "Website",
  "gallery.mobile.category.brand": "Brand",
  "gallery.mobile.category.creative": "Creative",
  "gallery.mobile.category.motion": "Motion",
  "gallery.mobile.category.notes": "Notes",
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
  "gallery.cardAlt": "Visual Investigation Archive Card",
  "gallery.mobile.heading": "Investigation Records",
  "gallery.mobile.viewDetails": "View Details",
  "ga004.aria": "Archive GA_004 Visual Investigation Archive",
  "ga004.detailAria": "Archive GA_004 Visual Investigation Archive Work Details",
  "survey.categoryNav": "Investigation Categories",
  "survey.detailTitle": "Investigation Details",
  "survey.detailAria":
    "Work Details Drawer. Press Escape Or Click Empty Space To Close",
  "survey.duration": "One Month",
  "survey.title": "The Apple Moment: AI Creative Design Practice",
  "survey.description":
    "Every technological turn redefines creation. The Apple Moment is an integrated program on AI and creativity. Using the apple as a symbol across classical art, pop culture, and the history of technology, it retells creation, cognition, seeing, and technical change, then extends into brand, posters, a website, H5, and motion — turning an AI event into a lasting brand experience.",
  "survey.heroAlt":
    "The Apple Moment visual system: black-and-white classical images, a green apple, and a series of digital pages in one narrative.",
  "survey.heroPreview": "Hover Or Focus To Play A Preview Video",
  "survey.videoExpand": "Tap To Watch",
  "survey.imageExpand": "Click To Enlarge",
  "survey.tagList": "Work Types",
  "survey.tag.event": "Event Planning",
  "survey.tag.brand": "Brand Design",
  "survey.tag.website": "Website Design",
  "survey.tag.visual": "Visual Design",
  "survey.tag.motion": "Motion Design",
  "survey.tag.explore": "Creative Exploration",
  "survey.tag.observe": "Design Observation",
  "survey.tag.aiDesign": "AI and Design",
  "survey.tag.judgment": "Judgment",
  "survey.tag.practice": "Work and Practice",
  "survey.tag.aiAssist": "AI-Assisted Design",
  "survey.tag.brandVisual": "Brand Visual Design",
  "survey.tag.visualSystem": "Visual Systems",
  "survey.tag.crossMarket": "Cross-Market Website Rebuild",
  "survey.tag.modular": "Modular Architecture",
  "survey.tag.multiMarket": "Multi-Market Reuse",
  "survey.media2Title": "The Apple Moment",
  "survey.media2Caption":
    "The Creation of Adam is recast as the instant of making. The green apple sits between the human and an unknown capability, turning a classical myth of creation into a metaphor for how AI redistributes ability, awareness, and the right to create.",
  "survey.media2Alt":
    "A black-and-white classical scene with a green apple, from a glitched apple and a hand holding fruit to a remade Creation of Adam, introducing AI Value Program and the themes of awakening, discovery, and remaking the tool.",
  "survey.media3Title": "The Fruit of Knowledge",
  "survey.media3Caption":
    "The forbidden-fruit story is turned from temptation into a trigger for knowing. AI becomes a new gate of knowledge: it grants capability, and it rewrites the relation between people and tools.",
  "survey.media3Alt":
    "A black-and-white Eve holds a green apple with a snake around the fruit and her arm. The video follows people and AI moving from command-and-execute to dialogue, feedback, and collaboration.",
  "survey.media4Title": "Reframing the World",
  "survey.media4Caption":
    "As AI enters judgment, execution, and making, the relation is no longer only user and tool. A portrait swapped with an apple shows how identity, capability, and who creates keep blurring.",
  "survey.media4Alt":
    "A black-and-white portrait covered by a green apple, with text about seeing the structure of the world anew. The video shows an AI Value Program review around asking, generating, judging, and integrating.",
  "survey.media5Title": "A Creative Operating System",
  "survey.media5Caption":
    "The tool is no longer the point. It steps back behind the process. What gets reorganized is thinking, making, testing, and collaboration. After the apple falls, creativity moves through impact, co-creation, reframing, and evolution. A review chooses projects, and it also keeps the methods that belong in this new operating system.",
  "survey.media5Alt":
    "Jobs in classical dress at a desk with a quill, books, a computer, and a green apple, showing AI moving from a single tool into thinking, making, testing, and collaboration as a new creative system.",
  "survey.media6Title": "The New System",
  "survey.media6Caption":
    "Eve, The Creation of Adam, Jobs, and the green apple return together. The closing claim: once AI enters thinking, making, testing, and collaboration, human value does not vanish — it concentrates in judgment, choice, and defining what matters.",
  "survey.media6Alt":
    "A halftone collage of the green apple with Eve, The Creation of Adam, and Jobs. The video covers project review, method, and human-AI collaboration, closing with the line that the contest is only the first act.",
  "survey.media7Alt":
    "Black-and-green Apple Moment posters and a clock displayed in a gray concrete setting",
  "survey.media8Alt":
    "Two phones and green curved structures present the Apple Moment mobile pages",
  "survey.media9Alt":
    "Apple Moment event posters displayed in a green archive drawer and an outdoor poster frame",
  "survey.apple.sceneTitle": "Into the Room",
  "survey.apple.sceneCaption":
    "The same visual language leaves the screen and enters frames, walls, and phones. A clock turns half a year of review into time you can look at, a QR code leads from the room into the H5, and the page puts The Creation of Adam and the narrative experiments back in the hand. The event does not stop at a launch. It becomes a brand setting you can walk into, scan, and keep reading.",
  "survey.apple.stageAlt":
    "A laptop on a wooden desk plays a hand holding a glass apple, with a green apple beside it.",
  "survey.apple.coverAlt":
    "A laptop on a wooden desk plays The Apple Moment, with a green apple beside it.",
  "survey.apple.01Alt":
    "The title The Apple Moment inside a classical roundel, with the line about a turning point for creativity.",
  "survey.apple.02Alt": "A hand holds an apple inside a classical roundel.",
  "survey.apple.03Alt":
    "Four frames of a hand holding an apple: a drawing, a glowing blue apple, a bitten red apple, and a green apple.",
  "survey.apple.03bAlt":
    "A remade Creation of Adam in which an angel offers a green apple.",
  "survey.apple.04Alt":
    "A black-and-white Eve bites a green apple while a snake coils around her arm.",
  "survey.apple.05Alt":
    "Text over a dark landscape about the relation between people and AI shifting from commands to dialogue.",
  "survey.apple.06Alt":
    "A figure in a bowler hat has a green apple in place of a face, with text about seeing the world again.",
  "survey.apple.07Alt":
    "Five numbered questions on a dark pattern, asking who questions, generates, judges, integrates, and records.",
  "survey.apple.08Alt":
    "A classically dressed figure sits at a desk with a quill, a laptop, and an early computer.",
  "survey.apple.09Alt":
    "A diagram titled that the tool is not the point, with rays toward Cursor, ChatGPT, Claude, Codex, and Lovart.",
  "survey.apple.10Alt":
    "A reader under a tree in a valley, marked with impact, co-creation, reframing, and evolution.",
  "survey.apple.11Alt":
    "A green apple over text about choosing projects and keeping the methods worth keeping.",
  "survey.apple.12Alt":
    "A halftone collage of Eve, the Creation of Adam, a desk, and a green apple, titled the new system.",
  "survey.apple.13Alt":
    "An eye beside the line that the contest is only the first act, with a list of methods and plans.",
  "survey.apple.14Alt":
    "A green apple on a black halftone field, with text about defining value beyond output.",
  "survey.apple.15Alt":
    "A gold-framed Design AI Ops clock poster whose hand is a green apple stem.",
  "survey.apple.16Alt":
    "Three gold-framed posters on a wall: a clock, the Creation of Adam, and a QR entry.",
  "survey.apple.17Alt":
    "A gold-framed poster by a stone column, showing the Creation of Adam, a green apple, and a QR code.",
  "survey.apple.18Alt":
    "A phone on a wooden desk shows The Apple Moment beside a sketch and an inkwell.",
  "survey.apple.19Alt":
    "A phone on a patterned cushion shows a Design AI Ops page and a QR code.",
  "survey.apple.20Alt":
    "A phone leans against a stone column beside a sculpture, showing The Apple Moment.",
  "survey.future.title": "Future Creative 2030",
  "survey.future.description":
    "Future Creative 2030 is a 3D visual experiment centered on digital-native creative culture. Saturated color, exaggerated characters, and textile textures portray young creators moving between mobile devices, fashion, music, and everyday objects. Character design, scene building, materials, lighting, and editorial layouts combine with motion clips to form a continuous visual narrative.",
  "survey.future.heroAlt":
    "Glossy pink 3D letters L, 2, and B on a pink background, the 2 shaped as a character with hands",
  "survey.future.media1Title": "Creative Spectrum",
  "survey.future.media1Caption":
    "A collage of characters and scenes brings together the series’ saturated palette, textile materials, and varied creative directions.",
  "survey.future.media1Alt":
    "Six colorful 3D characters and creative scenes arranged on a white background",
  "survey.future.media2Title": "Spark of Inspiration",
  "survey.future.media2Caption":
    "A character holds a device marked with a flame, using exaggerated perspective and graphic bursts to show inspiration igniting in an instant.",
  "survey.future.media2Alt":
    "A 3D character holds a tablet displaying a flame icon against a blue and pink background",
  "survey.future.media3Title": "Creativity in Motion",
  "survey.future.media3Caption":
    "A fashion-forward character is placed inside a subway car, where devices, clothing, and materials describe creative life in motion.",
  "survey.future.media3Alt":
    "A pink-and-green-haired 3D character stands in a subway car with a music player and colorful bags",
  "survey.future.media4Title": "Creative Toolkit",
  "survey.future.media4Caption":
    "An open blue toolbox holds graphic props, translating abstract inspiration, play, and momentum into tangible objects.",
  "survey.future.media4Alt":
    "A wide-brimmed character presents a blue toolbox full of creative objects against a pink background",
  "survey.future.media5Title": "Visual Archive",
  "survey.future.media5Caption":
    "A fisheye view combines a phone interface with film and cards, connecting digital content with physical collecting.",
  "survey.future.media5Alt":
    "A hand presents a phone interface with visual artworks and film elements through a fisheye lens",
  "survey.future.media6Title": "Cabinet of Ideas",
  "survey.future.media6Caption":
    "A transparent cabinet gathers headphones, film, cameras, and textiles, closing the series in an orange scene.",
  "survey.future.media6Alt":
    "Headphones, film, a camera, and colorful creative objects displayed inside a transparent cabinet on orange",
  "survey.easycash.title": "Easycash Digital Visual Reframing",
  "survey.easycash.description":
    "The Easycash website is rebuilt around a complete digital brand refresh, redefining the homepage, products, safety, and brand information. New 3D assets, material language, color, and staged composition give the brand a character distinct from traditional finance, and turn the site from a functional information carrier into a more recognizable digital brand interface.",
  "survey.easycash.homeTitle": "01 Hero Visual System",
  "survey.easycash.homeCaption":
    "The homepage establishes the numeral “8” as a new core symbol, and keeps restaging anniversaries, Ramadan, anti-fraud, and brand campaigns through metal, wood, concrete, and other materials and spaces. A fixed symbol with changeable materials gives the homepage a visual system that can keep updating, and a sharper first impression of Easycash.",
  "survey.easycash.productTitle": "02 Product Visual Reframing",
  "survey.easycash.productCaption":
    "Product pages no longer use the flat icons and data-led layouts common in traditional finance. Soft textiles, coins, cards, locks, and other concrete objects rebuild the product visuals. Each business uses its own color and object set to express limits, efficiency, returns, and safety, so selling points become brand scenes that can be felt and remembered.",
  "survey.easycash.heroAlt":
    "A Digital Brand Refresh poster: a laptop on a green fabric plinth shows the Ramadan homepage and a green number 8.",
  "survey.easycash.media1Title": "Hero Visual System",
  "survey.easycash.media1Caption":
    "Using the brand’s 8th anniversary as a visual upgrade point, we redefined the homepage’s first impression. The number “8” became a core identity symbol, and a unified composition, 3D installations, material language, and brand color formed an expandable Hero Visual System—turning a single campaign banner into a lasting brand entry.",
  "survey.easycash.media1Alt":
    "Easycash homepage visual system shown on a laptop, presenting a Ramadan-themed hero banner with brand green, a 3D number 8, and dimensional scenes.",
  "survey.easycash.media2Title": "Visual Symbol Extensions",
  "survey.easycash.media2Caption":
    "Around the shared “8” visual matrix, we built modular extensions for different business and campaign themes. By shifting materials, color, space, props, and surface detail, the number can evolve across anniversary, financial lifestyle, anti-fraud, Ramadan, and offline events while keeping brand recognition intact.",
  "survey.easycash.media2Alt":
    "Multiple Easycash homepage banners arranged vertically, unified by the number 8 and expressed through metal, wood, concrete, and colorful materials for anniversary, anti-fraud, Ramadan, and financial education themes.",
  "survey.easycash.media3Title": "Borrowing Experience Reframed",
  "survey.easycash.media3Caption":
    "Traditional lending pages often rely on amounts, rates, icons, and data. We translated fast application, high limits, rapid disbursement, and transparent fees into volumetric, material, and lifestyle-driven 3D scenes so product value can be sensed and remembered—not only read.",
  "survey.easycash.media3Alt":
    "Easycash borrowing product page in a green visual system presenting four core benefits—fast application, high limits, rapid disbursement, and transparent fees—through lifestyle 3D scenes instead of traditional finance icons.",
  "survey.easycash.media4Title": "Borrowing Visual Language",
  "survey.easycash.media4Caption":
    "Built from wallets, cash, cards, coins, and textiles, we recomposed tactile product visual units. Soft materials, brand stickers, and saturated details soften traditional finance distance while keeping cash, limits, and efficiency clearly directed.",
  "survey.easycash.media4Alt":
    "Four borrowing-product 3D visuals on a green Easycash brand background, including wallets, cards, coins, cash, and textile elements that express application, limits, payout speed, and transparent fees.",
  "survey.easycash.media5Title": "Wealth Management Experience Reframed",
  "survey.easycash.media5Caption":
    "For wealth management, we built a blue-purple system that relates to borrowing yet stays independently recognizable. Rational values such as high returns, secure investing, quality service, and stable funding become concrete object combinations and scene metaphors, clarifying hierarchy for different user roles.",
  "survey.easycash.media5Alt":
    "Easycash wealth management product page in a blue-purple visual system presenting high returns, secure investing, quality service, and stable funding through 3D scenes that strengthen comprehension and product recognition.",
  "survey.easycash.media6Title": "Wealth Management Visual Language",
  "survey.easycash.media6Caption":
    "The wealth management side continues collage, soft materials, stickers, and dimensional composition, while a blue-purple palette and safety-, return-, and stability-oriented objects form a distinct identity. Borrow and Wealth stay under one brand frame yet carry clear visual personalities.",
  "survey.easycash.media6Alt":
    "Four wealth-management 3D visuals on a blue-purple Easycash brand background, composed of fabric, coins, locks, cards, and brand stickers expressing safety, returns, service, and stable funding.",
  "survey.easycash.home01Alt":
    "A laptop on a sofa shows the Easycash 8th-anniversary homepage, with a metallic number 8 on a green pitch.",
  "survey.easycash.home02Alt":
    "Homepage hero with a wood-grain number 8 on a carton, titled Simplify your finances with Easycash.",
  "survey.easycash.home03Alt":
    "Anti-fraud homepage hero with a concrete number 8 wrapped in caution tape, titled Beware of Scams.",
  "survey.easycash.home04Alt":
    "Ramadan homepage hero with a green number 8 on a round plinth, titled Celebrate the spirit of Ramadan.",
  "survey.easycash.home05Alt":
    "Financial-education homepage hero with a purple metal number 8 standing on a MOJANG book.",
  "survey.easycash.home06Alt":
    "Who are we section with a metal number 8, a phone, and chart props beside loan and lender figures.",
  "survey.easycash.homeVideoAlt":
    "The cover poster plays the homepage, with a metal number 8 on a green pitch and the title Easycash: Over 8 Years of Simplicity.",
  "survey.easycash.loanVideoAlt":
    "The cover poster plays the borrow page, showing Fast Fund Disbursement with Rp coins in a grey textile container.",
  "survey.easycash.wealthVideoAlt":
    "The cover poster plays the wealth page, showing Secure and Guaranteed Funding with a blue money bag tied in rope beside a SAFE shield.",
  "survey.easycash.fraudVideoAlt":
    "The cover poster plays the anti-fraud page, showing Waspada Penipuan with a green gauge, a red warning mark, and the customer-service number.",
  "survey.easycash.loan08Alt":
    "Borrow page for Easy Application Process, with a brown textile wallet, card, coins, and a green charm.",
  "survey.easycash.loan09Alt":
    "Borrow page for Fast Fund Disbursement, with Rp coins stacked in a grey textile container.",
  "survey.easycash.loan10Alt":
    "Borrow page for High Loan Limit, with a grey metal case, a smile bubble, coins, and a Fast label.",
  "survey.easycash.loan12Alt":
    "Borrow page for Transparent Fees, with a speaker, coins, and fee labels inside a beige soft case.",
  "survey.easycash.loan13Alt":
    "Three-step borrow flow: credit assessment, approval, and repayment, shown beside three phone screens.",
  "survey.easycash.wealth14Alt":
    "Wealth page for High Return, with a blue number 20, coins, a rope ring, and a High label.",
  "survey.easycash.wealth15Alt":
    "Wealth page for Secure and Guaranteed Funding, with a blue money bag tied in rope beside a SAFE shield.",
  "survey.easycash.wealth16Alt":
    "Wealth page for Safe Lending, with a blue cushion beside a silver padlock and a percent label.",
  "survey.easycash.wealth17Alt":
    "Wealth page for High-Quality Services, grouping a blue figure, a striped cushion, and a heart toy.",
  "survey.easycash.wealth18Alt":
    "Three-step wealth flow: choose a product, top up, and get a return, shown beside three phone screens.",
  "survey.easycash.fraudTitle": "03 Anti-Fraud Visual Reframing",
  "survey.easycash.fraudCaption":
    "The anti-fraud module replaces text-heavy safety notices with sharper warning visuals. Shields, verification codes, phones, accounts, and risk symbols build a series of 3D scenes, so each type of scam has a clear visual identity. Safety education becomes its own branded content system, rather than only explanatory copy.",
  "survey.easycash.fraud01Alt":
    "A laptop on a sofa shows the anti-fraud hero, titled Beware of Scams!, beside a green Rp gauge and warning marks.",
  "survey.easycash.fraud02Alt":
    "Anti-fraud page for Protect Your Personal Data, with a yellow cushion in a green strap beside a shield, a percent mark, and an Rp coin.",
  "survey.easycash.fraud03Alt":
    "Anti-fraud page for Never Share Your OTP Code with Anyone, with a green smile cushion among social and Easycash keys.",
  "survey.easycash.fraud04Alt":
    "Anti-fraud page for Check the virtual account number before repayment, with an Easy cash wallet surrounded by Rp notes and a repayment label.",
  "survey.easycash.aboutTitle": "04 Brand Trust Visual",
  "survey.easycash.aboutCaption":
    "The About Us module turns a company-profile layout into a branded visual narrative. People, technology, safety, and credentials each receive their own scene, held in one 3D material and visual language, so capability and brand value become a more tangible expression of trust.",
  "survey.easycash.about01Alt":
    "A laptop on a sofa shows the About page for Easycash Product Features, with an orange Team cushion, a percent ring, and a yellow AI money bag.",
  "survey.easycash.about02Alt":
    "About page for A Reliable Financial Solution, with a green SAFE shield beside an orange cushion, a percent badge, and an Rp coin.",
  "survey.easycash.about03Alt":
    "About page for Our Vision, grouping an orange money bag, a green thumbs-up badge, a SAFE shield, and an E pendant.",
  "survey.easycash.about04Alt":
    "About page for Product Advantages, with an AI Risk Management computer beside Reliable Processes and Integrated Advanced Solutions.",
  "survey.ops.title": "Design AI Ops Field Notes",
  "survey.ops.description":
    "In the first half of 2026, we started a Design AI Ops practice inside the team. The aim was direct: keep up with fast-changing AI capability, help people extend their work, and turn scattered personal experiments into a shared team ability.",
  "survey.ops.heroAlt":
    "Cover of the Design AI Ops field notes: a white mark and green apple inside a black ring, with the line “When making becomes weightless.”",
  "survey.ops.media2Alt":
    "A classical figure and an angel offering a green apple, contrasting work before and after the tool: from requesting and executing to questioning, judging, choosing, and integrating.",
  "survey.ops.media3Alt":
    "Diagram of Design AI Ops, shifting the human role from repetitive executor to director, task breaker, quality judge, and final integrator.",
  "survey.ops.media4Alt":
    "Three shifts in design work: from making pages to defining tasks, from stacking references to building judgment, and from delivering files to leaving methods.",
  "survey.ops.media5Alt":
    "A workflow moving from a system of repetition to a system of judgment and orchestration: input, tasks, judgment, execution, review, and residue.",
  "survey.ops.media6Alt":
    "Closing note after the apple falls: what remains of design is judgment, questions, structure, standards, and methods.",
  "survey.anniversary.title": "Easycash 9th Anniversary Visual System",
  "survey.anniversary.description":
    "This visual design was developed around Easycash’s 9th anniversary theme, “Easycash 9 Years Moving Forward Together.”",
  "survey.anniversary.heroAlt":
    "Article cover: a laptop mockup of the Easycash 9th anniversary badminton-court homepage, with “9TH Anniversary,” “2026,” and brand marks.",
  "survey.region.title": "Cross-Market Rebuild: Shared Architecture Practice",
  "survey.region.description":
    "This rebuild established a shared website architecture for businesses across markets. It covers page structure, visual design and interaction, design components, development modules, and the rules for delivering copy. Each market adapts brand, business, and local content on that common base.",
  "survey.region.heroAlt":
    "Cover of the shared website architecture, with color swatches, variables, a component list, a laptop, and a phone arranged on the ground.",
  "survey.emptyWork": "No Work In This Category Yet",
  "contact.aria": "Start A New Survey With Us",
  "contact.cta": "Start A New Survey With Us",
  "contact.addressLabel": "Location",
  "contact.address": "Chaoyang District · Beijing · China",
  "contact.foundedLabel": "Founded",
  "contact.founded": "2021",
  "contact.servicesLabel": "Services",
  "contact.services": "Brand · Identity · Product · Web · Motion",
  "contact.button": "Contact Us",
  "contact.copied": "Copied",
  "contact.copyAria": "Copy email",
  "contactSurvey.aria": "Contact Us",
  "contactSurvey.headline": "Every project begins with a survey of gravity",
  "contactSurvey.line1": "If you are building a new brand",
  "contactSurvey.line2": "Advancing a brand upgrade",
  "contactSurvey.line3": "Reshaping products and digital experience",
  "contactSurvey.line4": "Get in touch with us",
  "contactSurvey.emailAria": "Copy email",
  "contactSurvey.phoneAria": "Copy phone number",
  "contactForm.title": "Fill in the details below to start the next survey with Grava",
  "contactForm.name": "Initiator / NAME",
  "contactForm.email": "Your Email / EMAIL",
  "contactForm.message": "Survey Brief / INQUIRY",
  "contactForm.send": "Send",
  "contactForm.sending": "Sending",
  "contactForm.successTitle": "Your survey request has been received",
  "contactForm.successBody": "We will get back to you by email shortly.",
  "contactForm.errorRequired": "This field is required",
  "contactForm.errorEmail": "Please enter a valid email address",
  "contactForm.errorSend": "Sending failed. Please try again later or email us at",
};

export const MESSAGES: Record<Locale, Messages> = { zh, en };
