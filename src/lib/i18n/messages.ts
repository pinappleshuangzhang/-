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
  | "gallery.category.all"
  | "gallery.category.brand"
  | "gallery.category.product"
  | "gallery.category.website"
  | "gallery.category.visual"
  | "gallery.category.motion"
  | "gallery.mobile.category.all"
  | "gallery.mobile.category.website"
  | "gallery.mobile.category.brand"
  | "gallery.mobile.category.creative"
  | "gallery.mobile.category.motion"
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
  | "survey.tagList"
  | "survey.tag.event"
  | "survey.tag.brand"
  | "survey.tag.website"
  | "survey.tag.visual"
  | "survey.tag.motion"
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
  | "survey.emptyWork"
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
  "nav.title.contact": "《开启一份新调查》",
  "screen.studio": "万有引力设计档案室",
  "screen.ga001": "档案 GA_001 什么是引力？",
  "screen.ga002": "档案 GA_002 组织记录",
  "screen.ga003": "档案 GA_003 成员记录",
  "screen.ga004": "档案 GA_004 视觉调查档案",
  "screen.contact": "档案 GA_006 开启一份新调查",
  "index.heading": "档案目录 ARCHIVE INDEX",
  "index.nav": "档案目录",
  "index.ga000": "《档案室首页》",
  "index.ga001": "《什么是引力？》",
  "index.ga002": "《组织记录》",
  "index.ga003": "《成员记录》",
  "index.ga004": "《视觉调查档案》",
  "index.ga006": "《开启一份新调查》",
  "hero.title": "万有引力设计档案室",
  "hero.subtitle": '跟随设计调查记录，我们一起完成本次关于"引力"的探索',
  "hero.scrollDown": "向下滑动",
  "hero.skipVideo": "跳过视频",
  "loader.role": "临时调查员",
  "loader.id": "G_U0412",
  "loader.apply": "申请临时访问权限",
  "loader.review": "档案连接中",
  "loader.approved": "Temporary Application Approved",
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
  "member.role02": "构建者",
  "member.role03": "探索者",
  "member.role04": "连接者",
  "member.direction01": "调查方向_信息判断，找寻探索方向",
  "member.direction02": "调查方向_抽象概念，建立完整系统",
  "member.direction03": "调查方向_不断尝试新的视觉表达与创意可能",
  "member.direction04": "调查方向_建立人与产品、人与体验的连接",
  "member.portfolio": "个人作品站",
  "member.contactMe": "联系我",
  "gallery.list": "档案卡片列表",
  "gallery.category.all": "所有项目",
  "gallery.category.brand": "苹果时刻：AI 创造力实验计划",
  "gallery.category.product": "未来创意 2026",
  "gallery.category.website": "Easycash 数字品牌视觉重塑",
  "gallery.category.visual": "视觉设计",
  "gallery.category.motion": "动态设计",
  "gallery.mobile.category.all": "全部项目",
  "gallery.mobile.category.website": "网站设计",
  "gallery.mobile.category.brand": "品牌设计",
  "gallery.mobile.category.creative": "创意设计",
  "gallery.mobile.category.motion": "动态设计",
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
  "survey.title": "苹果时刻：AI 创造力实验计划",
  "survey.description":
    "每一次技术转折，都在重新定义创造。《The Apple Moment》是一项围绕 AI 与创造力展开的整合型活动策划。项目以“苹果”为贯穿古典艺术、流行文化与科技史的视觉符号，通过经典图像重构建立关于创造、认知、观看与技术演进的叙事，并延展至品牌视觉、系列海报、互动网站、H5与动态传播，将一次 AI 创新活动转化为具有完整体验与长期资产价值的品牌事件。",
  "survey.heroAlt":
    "The Apple Moment 活动视觉系统，以黑白经典艺术图像、绿色苹果和系列数字页面组成统一视觉叙事。",
  "survey.heroPreview": "悬停或聚焦时播放预览视频",
  "survey.videoExpand": "点击查看视频",
  "survey.tagList": "作品类型",
  "survey.tag.event": "活动策划",
  "survey.tag.brand": "品牌设计",
  "survey.tag.website": "网站设计",
  "survey.tag.visual": "视觉设计",
  "survey.tag.motion": "动态设计",
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
  "survey.media5Title": "新的操作系统",
  "survey.media5Caption":
    "借乔布斯与古典、数字媒介的时代错位，将“工具”退到背景。真正被重新定义的，是思考、制作、验证与协作如何被 AI 重新组织，并最终演变为一套新的创意操作系统。",
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
  "survey.future.title": "未来创意 2026",
  "survey.future.description":
    "《未来创意 2026》是一组围绕数字原生创意文化展开的三维视觉实验，以高饱和色彩、夸张角色和织物质感，呈现年轻创作者在移动设备、时尚、音乐与日常物件之间穿梭的创作状态。项目完成了角色设定、场景搭建、材质灯光及系列版式设计，并通过静态画面与动态片段构成连贯的视觉叙事。",
  "survey.future.heroAlt":
    "蓝粉背景中，戴墨镜和耳机的三维角色手持显示火焰图标的平板电脑",
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
    "Easycash 数字品牌视觉重塑聚焦官网首页与核心产品页两大高频触点，重新建立品牌在数字环境中的视觉识别与产品表达方式。首页以 8 周年为契机构建统一的 Hero Visual System，通过数字“8”、材质、色彩与场景化道具形成可持续扩展的视觉母体；产品页则突破传统金融行业依赖图标、数字与理性信息排布的表达方式，将借款与理财的核心利益点转译为更具触感、情绪与记忆度的 3D 场景，在专业可信与年轻化体验之间建立新的平衡。",
  "survey.easycash.heroAlt":
    "Easycash 数字品牌视觉重塑项目主视觉，以深色品牌空间、金属标识、绿色绳索与立体装置构成视觉核心，呈现官网首页与产品页视觉语言的整体升级。",
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
  "nav.title.contact": "Start A New Survey",
  "screen.studio": "Universal Gravity Design Archive",
  "screen.ga001": "Archive GA_001 What Is Gravity?",
  "screen.ga002": "Archive GA_002 Organization Record",
  "screen.ga003": "Archive GA_003 Member Record",
  "screen.ga004": "Archive GA_004 Visual Survey Archive",
  "screen.contact": "Archive GA_006 Start A New Survey",
  "index.heading": "Archive Index",
  "index.nav": "Archive Index",
  "index.ga000": "Archive Home",
  "index.ga001": "What Is Gravity?",
  "index.ga002": "Organization Record",
  "index.ga003": "Member Record",
  "index.ga004": "Visual Survey Archive",
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
  "member.role02": "Builder",
  "member.role03": "Explorer",
  "member.role04": "Connector",
  "member.direction01": "Focus_Assessing Info & Finding Direction",
  "member.direction02": "Focus_Ideas into Complete Systems",
  "member.direction03": "Focus_Testing Visual & Creative Possibilities",
  "member.direction04": "Focus_People, Products & Experiences",
  "member.portfolio": "Portfolio",
  "member.contactMe": "Contact",
  "gallery.list": "Archive Card Gallery",
  "gallery.category.all": "All",
  "gallery.category.brand": "The Apple Moment — AI Creativity Program",
  "gallery.category.product": "Future Creative 2026",
  "gallery.category.website": "Easycash Digital Visual Reframing",
  "gallery.category.visual": "Visual Design",
  "gallery.category.motion": "Motion Graphics",
  "gallery.mobile.category.all": "All",
  "gallery.mobile.category.website": "Website",
  "gallery.mobile.category.brand": "Brand",
  "gallery.mobile.category.creative": "Creative",
  "gallery.mobile.category.motion": "Motion",
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
  "survey.title": "The Apple Moment — AI Creativity Program",
  "survey.description":
    "Every technological turn redefines creation. The Apple Moment is an integrated program on AI and creativity. Using the apple as a symbol across classical art, pop culture, and the history of technology, it retells creation, cognition, seeing, and technical change, then extends into brand, posters, a website, H5, and motion — turning an AI event into a lasting brand experience.",
  "survey.heroAlt":
    "The Apple Moment visual system: black-and-white classical images, a green apple, and a series of digital pages in one narrative.",
  "survey.heroPreview": "Hover Or Focus To Play A Preview Video",
  "survey.videoExpand": "Tap To Watch",
  "survey.tagList": "Work Types",
  "survey.tag.event": "Event Planning",
  "survey.tag.brand": "Brand Design",
  "survey.tag.website": "Website Design",
  "survey.tag.visual": "Visual Design",
  "survey.tag.motion": "Motion Design",
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
  "survey.media5Title": "A New Operating System",
  "survey.media5Caption":
    "Jobs sits among classical and digital tools so the tool itself recedes. What is rewritten is how thinking, making, testing, and collaborating are organized by AI — until they become a new creative operating system.",
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
  "survey.future.title": "Future Creative 2026",
  "survey.future.description":
    "Future Creative 2026 is a 3D visual experiment centered on digital-native creative culture. Saturated color, exaggerated characters, and textile textures portray young creators moving between mobile devices, fashion, music, and everyday objects. Character design, scene building, materials, lighting, and editorial layouts combine with motion clips to form a continuous visual narrative.",
  "survey.future.heroAlt":
    "A 3D character wearing sunglasses and headphones holds a tablet with a flame icon against a blue and pink background",
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
    "Easycash Digital Visual Reframing focuses on the homepage and key product pages, redefining how the brand communicates in a digital environment. A flexible Hero Visual System was developed around the 8th anniversary, while product benefits were translated into tactile, scenario-based 3D visuals. The result is a more distinctive and memorable financial experience that balances credibility with a fresher, more approachable brand expression.",
  "survey.easycash.heroAlt":
    "Hero visual for the Easycash Digital Visual Reframing project, featuring a dark brand space, metallic identity, green ropes, and dimensional installations that present the upgraded homepage and product-page visual language.",
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
};

export const MESSAGES: Record<Locale, Messages> = { zh, en };
