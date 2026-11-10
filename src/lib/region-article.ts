import type { OpsBlock, OpsPointImage } from "@/lib/ops-article";

function shot(index: number, alt: string): OpsPointImage {
  const file = `/archive-ga-004/region-${String(index).padStart(2, "0")}.webp`;
  return { src: file, srcEn: file, alt };
}

function cover(alt: string): OpsBlock {
  const file = "/archive-ga-004/region-01.webp";
  return { kind: "image", src: file, srcEn: file, alt };
}

/** 006 金融网站跨地区架构，正文对照 Figma 1629:6013。配图备注不进入正文。 */
export const REGION_ARTICLE_ZH: OpsBlock[] = [
  cover(
    "金融网站跨地区架构封面，地面上排列色板、变量、组件列表、笔记本电脑与手机界面。",
  ),
  {
    kind: "prose",
    title: "跨地区金融网站重构：通用架构设计实践",
    paragraphs: [
      "本次重构建立了一套支持多地区业务的网站通用架构，覆盖页面结构、视觉与交互、设计组件、开发模块及文案内容交付规则。各地区基于公共基础完成品牌、业务与本地内容适配。",
    ],
  },
  {
    kind: "prose",
    title: "一、项目背景：多地区，多套体系，重复投入",
    paragraphs: [],
  },
  {
    kind: "points",
    items: [
      {
        title: "多套规范，重复建设与维护",
        paragraphs: [
          "各团队分别维护设计规范、页面与交互，并对接开发、市场及本地内容，重复工作投入较多。",
        ],
        image: shot(
          2,
          "多地区各自维护设计规范、页面与交互的示意，说明重复建设与维护。",
        ),
      },
      {
        title: "内容相似，模块难以复用",
        paragraphs: [
          "相似模块采用不同的布局与展示方式，设计与开发成果难以跨地区共享。",
        ],
        image: shot(3, "相似内容采用不同布局的对照，说明模块难以跨地区复用。"),
      },
      {
        title: "多套规范，重复建设与维护",
        paragraphs: [
          "新增页面、修改内容或进入新市场时，仍需分别沟通、设计与开发，难以沿用已有成果。",
        ],
      },
      {
        title: "本次重构旨在",
        paragraphs: [
          "明确共用与定制的边界，让各地区基于同一套基础流程协作，减少重复建设。",
        ],
      },
    ],
  },
  {
    kind: "prose",
    title: "二、重构策略：明确共用与定制的边界",
    paragraphs: [
      "我们以页面与模块为单位，将复用方式划分为「直接共用、组合适配、地区定制」，并与业务、本地及开发团队确认适用范围。在统一规则下，共性模块直接复用，内容差异通过组合适配，专属业务需求保留定制空间。",
    ],
  },
  {
    kind: "points",
    items: [
      {
        title: "直接共用：规范与组件规则",
        paragraphs: [
          "变量体系、栅格、容器、间距及组件的结构、状态与交互规则统一维护。各地区沿用同一套基础规范，减少底层规则的重复建设。",
        ],
        image: shot(4, "统一维护的变量、栅格、容器、间距与组件规则示意。"),
      },
      {
        title: "组合适配：页面结构与模块",
        paragraphs: [
          "页面根据业务需要，从公共资产中抽取已有结构、模块与组件，调整顺序、数量和组合方式。同一模块可以用于不同页面，各地区无需为相似需求重新设计整套方案。",
        ],
        image: shot(5, "从公共资产中抽取模块并调整顺序与组合的页面结构示意。"),
      },
      {
        title: "地区定制：业务内容与品牌表达",
        paragraphs: [
          "首页前二至三屏重点定制各地区的业务内容与品牌视觉；品牌色、灰度和字体通过地区变量配置。语言、币种、联系方式及披露信息在对应字段中填写，其他内容差异优先使用已有模块承接，确有必要时再补充专属模块。",
        ],
        image: shot(6, "首页前几屏的地区定制，以及品牌色、字体与本地字段的配置示意。"),
      },
      {
        title: "共用、组合与定制的边界定义",
        paragraphs: [
          "这三类边界分别明确了共用的规则、可组合的资产与需要定制的内容，让地区差异在统一架构内得到处理。",
        ],
      },
    ],
  },
  {
    kind: "prose",
    title: "三、复用机制：通过变量、组件与模块实现复用",
    paragraphs: [
      "确定复用边界后，我们通过语义变量管理样式映射，通过组件变体承接业务行为，通过内容配置适配地区信息。不同层面的变化分别处理，减少整页复制与单独修改。",
    ],
  },
  {
    kind: "points",
    items: [
      {
        title: "语义变量：统一用途，映射品牌差异",
        paragraphs: [
          "我们将基础色值与功能用途分层管理：基础变量保存各地区的颜色，语义变量定义品牌、文字、背景与描边等用途，并通过地区模式映射对应色值。组件与页面引用同一套语义变量，切换地区模式即可应用对应配色。当某个品牌需要调整颜色时，也可以集中更新变量，同步到已绑定的组件与页面。",
        ],
        image: shot(7, "基础色值、语义变量与地区模式的映射示意。"),
      },
      {
        title: "组件变体：在共用结构中切换业务行为",
        paragraphs: [
          "对于职责相同、操作方式不同的组件，保留统一结构与信息层级，通过业务变体切换对应行为；文案、联系方式和视觉素材分别配置，避免为每个地区复制一套组件。",
          "例如，反欺诈首屏中的联系入口，Easycash、Credmex 使用电话，MabilisCash 使用邮件。电话与邮件通过两种变体呈现，号码、邮箱和服务时间独立填写，品牌形象与主题视觉分别替换，服务渠道的变化可以在局部完成。",
        ],
        image: shot(8, "反欺诈首屏联系入口的电话与邮件两种变体。"),
      },
      {
        title: "内容配置：在统一模块内更新地区信息",
        paragraphs: [
          "模块通过可替换的子组件与内容字段承载地区信息。在统一的尺寸、间距和排列规则下，配置文字、图标、数量、顺序与链接，减少为每种内容组合建立独立版本。",
          "例如，官方社媒模块共用标题、说明与入口列表，各地区按实际运营渠道选择平台图标，配置数量、顺序和链接。平台变化通过子组件替换与列表配置完成，品牌样式继续由变量管理。",
        ],
        image: shot(9, "官方社媒模块按地区配置平台图标、数量、顺序与链接。"),
      },
      {
        title: "三层承接机制的作用",
        paragraphs: [
          "通过这三个层级，品牌差异由变量承接，服务渠道由业务变体承接，平台与文案差异由内容配置承接。各地区共享稳定的设计基础，同时保留必要的业务灵活性。",
        ],
      },
    ],
  },
  {
    kind: "prose",
    title: "四、页面与体验：让统一规则适应不同场景",
    paragraphs: [
      "共用组件进入实际页面后，还需要面对语言长度、内容数量与屏幕尺寸的变化。我们通过统一的布局与交互规则，让多地区的网站在不同场景下保持清晰、连贯的使用体验。",
    ],
  },
  {
    kind: "points",
    items: [
      {
        title: "文案适配：结构一致，容纳内容变化",
        paragraphs: [
          "不同语言的标题与操作说明长度各异。以借款步骤模块为例，通过统一的内容宽度、换行与间距规则，容纳不同语言的文字变化，保持步骤顺序与信息层级清晰。",
        ],
        image: shot(10, "借款步骤模块在不同语言长度下保持同一结构。"),
      },
      {
        title: "布局适配：根据屏幕重新组织信息",
        paragraphs: [
          "从桌面端到移动端，页面根据可用空间调整图文排列、模块间距与元素尺寸，延续一致的信息优先级。以合规资质模块为例，桌面端并排呈现主图与说明，机构列表横向排列；移动端调整为纵向图文结构与双列机构列表，保持主要合规信息优先展示。",
        ],
        image: shot(11, "合规资质模块在桌面端并排、移动端改为纵向与双列列表。"),
      },
      {
        title: "交互反馈：统一状态表达与操作预期",
        paragraphs: [
          "导航、按钮、链接与展开内容采用统一的交互状态与反馈规则。通过明确的默认、悬停、选中或展开状态，帮助用户识别可操作内容、当前位置及操作结果，让相似操作在各地区网站中具有一致的预期。",
        ],
        image: shot(12, "导航、按钮、链接与展开内容的默认、悬停、选中和展开状态。"),
      },
      {
        title: "适配规则提升模块复用效率",
        paragraphs: [
          "通过这些适配规则，共用模块能够覆盖不同地区的真实内容与设备场景，减少针对单个页面的临时调整。",
        ],
      },
    ],
  },
  {
    kind: "prose",
    title: "五、本地化与信任：统一展示规则，呈现当地信任依据",
    paragraphs: [
      "金融网站的本地化，也体现在监管信息、机构关系与安全指引的表达上。设计团队与本地团队沟通内容需求，梳理需要展示的信息及其优先级，再通过共用的信息框架承载各地区内容，帮助用户了解平台、识别风险并找到官方渠道。",
    ],
  },
  {
    kind: "points",
    items: [
      {
        title: "本地合规：统一层级，突出地区信息",
        paragraphs: [
          "印尼与墨西哥的合规模块采用一致的信息层级：主图与简介突出主要合规信息，下方以机构标识与简短说明补充相关监管、行业组织及认证信息。",
          "不同地区分别配置机构、文字、链接与展示数量，在复用布局的同时，准确呈现当地的主体资质与机构关系。",
        ],
        image: shot(13, "印尼与墨西哥合规模块共用信息层级，并分别配置当地机构。"),
      },
      {
        title: "信任表达：分层呈现资质、媒体与合作信息",
        paragraphs: [
          "合规资质、媒体报道与合作伙伴分别组织为对应模块，通过清晰的标题、标识与简短说明，帮助用户了解平台资质、媒体露出及合作情况，明确不同信息所代表的关系。",
          "监管信息、认证、媒体报道和商业合作分别表达，避免将不同性质的关系笼统呈现为机构背书，让信任建立在具体、可查阅的信息上。",
        ],
      },
      {
        title: "安全教育：从风险提醒到行动指引",
        paragraphs: [
          "反欺诈页面集中呈现常见诈骗场景、个人信息保护提醒与官方联系渠道，帮助用户识别冒名账号和可疑行为，并在遇到问题时找到求助入口。",
          "各地区沿用共用的内容模块，根据当地风险场景、运营渠道与服务方式调整信息，让安全教育能够持续更新。",
        ],
        image: shot(14, "反欺诈页面中的诈骗场景、信息保护提醒与官方联系渠道。"),
      },
    ],
  },
  {
    kind: "prose",
    title: "六、协作与成果：让重构支持多地区持续复用",
    paragraphs: [
      "重构过程中，我们与业务及本地团队沟通需求，将确认后的页面方案、复用边界及内容结构整理为公共资产，并与开发、市场及交付团队对齐使用方式，让统一方案进入实际协作与交付。",
    ],
  },
  {
    kind: "points",
    items: [
      {
        title: "以内容最完整的站点，沉淀公共资产",
        paragraphs: [
          "我们以内容覆盖最完整的印尼网站为基础，梳理现有页面，并补充后续可能使用的组件、模块与页面结构，形成可供各地区设计师调用的公共设计文档。",
          "各团队根据需求抽取和组合已有资产。品牌样式通过变量适配；新增需求先与相关业务及本地团队确认，再判断纳入公共内容还是作为地区专属定制。共用内容更新后，同步到公共文件并告知使用团队。",
        ],
        image: shot(15, "以印尼网站为基础整理出的公共设计文档与可复用模块。"),
      },
      {
        title: "让设计、开发与内容交付共同复用",
        paragraphs: [
          "开发团队将相同内容封装为公共代码模块，供各地区开发调用。市场与交付团队通过已上线页面筛选可复用模块，减少需求沟通中的理解偏差。",
          "本地团队沿用统一的翻译文档格式，按页面与模块填写当地语言内容。设计结构与内容字段相互对应，减少重复整理、解释和核对的工作。",
        ],
      },
      {
        title: "从现有市场扩展到波兰与西班牙",
        paragraphs: [
          "这套网站架构与协作方式已进一步复用于波兰和西班牙业务。设计团队结合当地展业情况，与业务及本地团队沟通需求和政策相关内容，筛选适用页面和模块，再与开发协作，在现有基础上完成品牌配置、内容填充与必要定制，将既有成果延伸到新市场，减少从零建设的投入。",
        ],
        image: shot(16, "波兰与西班牙首页在同一套架构上完成品牌配置与内容填充。"),
      },
      {
        title: "交付效率：以反欺诈页面对照复用前后投入",
        paragraphs: [
          "反欺诈页面复用了页面框架、视觉资产、内容结构与开发模块，减少各环节的重复工作。",
        ],
      },
      {
        title: "持续优化：结合用户行为完善内容与展示",
        paragraphs: [
          "后续优化将结合神策记录的页面浏览、入口点击及点击率等指标，在明确统计周期与流量来源的基础上，分析各地区内容与入口的使用情况，为文字、配图与模块组织的调整提供依据。",
        ],
      },
    ],
  },
];

export const REGION_ARTICLE_EN: OpsBlock[] = [
  cover(
    "Cover of the shared website architecture, with color swatches, variables, a component list, a laptop, and a phone arranged on the ground.",
  ),
  {
    kind: "prose",
    title: "Cross-Market Rebuild: Shared Architecture Practice",
    subtitle: "Cross-Market Rebuild: Shared Architecture Practice",
    paragraphs: [
      "This rebuild established a shared website architecture for businesses across markets. It covers page structure, visual design and interaction, design components, development modules, and the rules for delivering copy. Each market adapts brand, business, and local content on that common base.",
    ],
  },
  {
    kind: "prose",
    title: "1. Many Markets, Many Systems, Repeated Effort",
    subtitle: "1. Many Markets, Many Systems, Repeated Effort",
    paragraphs: [],
  },
  {
    kind: "points",
    items: [
      {
        title: "Separate systems, repeated building and maintenance",
        paragraphs: [
          "Each team maintained its own design rules, pages, and interactions, and coordinated separately with development, marketing, and local content. A lot of the work was done more than once.",
        ],
        image: shot(
          2,
          "Diagram of markets maintaining separate design rules, pages, and interactions.",
        ),
      },
      {
        title: "Similar content, modules that were hard to reuse",
        paragraphs: [
          "Similar modules used different layouts and presentations, so design and development work was hard to share across markets.",
        ],
        image: shot(3, "Comparison of similar content laid out in different ways."),
      },
      {
        title: "Separate systems, repeated building and maintenance",
        paragraphs: [
          "Adding a page, changing content, or entering a new market still required separate communication, design, and development. Existing work was hard to carry forward.",
        ],
      },
      {
        title: "What this rebuild set out to do",
        paragraphs: [
          "Draw a clear line between what is shared and what is custom, so each market could collaborate on the same basic process and build less from scratch.",
        ],
      },
    ],
  },
  {
    kind: "prose",
    title: "2. Drawing the Line Between Shared and Custom",
    subtitle: "2. Drawing the Line Between Shared and Custom",
    paragraphs: [
      "We treated pages and modules as the unit, and split reuse into three modes: use directly, assemble and adapt, and customize by market. We confirmed the scope with business, local, and development teams. Under shared rules, common modules are reused directly, content differences are handled by assembly, and market-specific business needs keep room for customization.",
    ],
  },
  {
    kind: "points",
    items: [
      {
        title: "Use directly: rules for the system and components",
        paragraphs: [
          "The variable system, grid, containers, spacing, and the structure, states, and interaction rules of components are maintained once. Every market follows the same foundation, so the base rules are not rebuilt.",
        ],
        image: shot(4, "Shared variables, grid, containers, spacing, and component rules."),
      },
      {
        title: "Assemble and adapt: page structure and modules",
        paragraphs: [
          "A page draws existing structures, modules, and components from the shared library, then changes their order, number, and combination to fit the business. The same module can serve different pages, so markets do not redesign a whole scheme for a similar need.",
        ],
        image: shot(5, "Page structures assembled from shared modules in different orders."),
      },
      {
        title: "Customize by market: business content and brand expression",
        paragraphs: [
          "The first two or three screens of the homepage focus on each market’s business content and brand visuals. Brand color, gray, and type are set through market variables. Language, currency, contact details, and disclosures are filled in their fields. Other differences use existing modules first, and a dedicated module is added only when it is necessary.",
        ],
        image: shot(
          6,
          "Market-specific homepage screens, with brand color, type, and local fields configured.",
        ),
      },
      {
        title: "Defining shared, assembled, and custom",
        paragraphs: [
          "These three boundaries separate shared rules, assets that can be assembled, and content that must be custom, so market differences are handled inside one architecture.",
        ],
      },
    ],
  },
  {
    kind: "prose",
    title: "3. Reuse Through Variables, Components, and Modules",
    subtitle: "3. Reuse Through Variables, Components, and Modules",
    paragraphs: [
      "Once the boundaries were set, semantic variables map styles, component variants carry business behavior, and content settings adapt local information. Each kind of change is handled on its own layer, so whole pages are copied and edited less often.",
    ],
  },
  {
    kind: "points",
    items: [
      {
        title: "Semantic variables: one role, mapped to each brand",
        paragraphs: [
          "Base colors and functional roles are managed in layers. Base variables store each market’s colors. Semantic variables define roles such as brand, text, background, and stroke, and a market mode maps those roles to the right values. Components and pages reference the same semantic variables, so switching the market mode applies the matching palette. When a brand color changes, the variable is updated once and the bound components and pages follow.",
        ],
        image: shot(7, "Base colors, semantic variables, and market modes mapped together."),
      },
      {
        title: "Component variants: switch behavior inside a shared structure",
        paragraphs: [
          "When components share a job but differ in how they act, they keep one structure and information hierarchy and switch behavior through a business variant. Copy, contact details, and visual assets are configured separately, so a component is not duplicated for every market.",
          "On the anti-fraud hero, for example, the contact entry is a phone number for Easycash and Credmex, and email for MabilisCash. Phone and email are two variants. The number, address, and service hours are filled independently, and the brand image and theme visuals are replaced on their own, so a change of channel stays local.",
        ],
        image: shot(8, "Phone and email variants of the contact entry on the anti-fraud hero."),
      },
      {
        title: "Content settings: update local information inside one module",
        paragraphs: [
          "Modules carry local information through swappable child components and content fields. Within shared sizes, spacing, and alignment, text, icons, count, order, and links are configured, so each content combination does not need its own version.",
          "The official social module, for example, shares a title, description, and list of entries. Each market chooses platform icons for the channels it actually runs, and sets the count, order, and links. Platform changes are a child swap and a list setting. Brand styles stay with the variables.",
        ],
        image: shot(
          9,
          "The social module configured per market with platform icons, count, order, and links.",
        ),
      },
      {
        title: "What the three layers carry",
        paragraphs: [
          "Across these three layers, brand differences sit in variables, service channels sit in business variants, and platform and copy differences sit in content settings. Markets share a stable design base and keep the flexibility the business needs.",
        ],
      },
    ],
  },
  {
    kind: "prose",
    title: "4. Letting Shared Rules Fit Different Situations",
    subtitle: "4. Letting Shared Rules Fit Different Situations",
    paragraphs: [
      "Once shared components enter real pages, they still meet changes in language length, amount of content, and screen size. Shared layout and interaction rules keep the sites clear and continuous across those situations.",
    ],
  },
  {
    kind: "points",
    items: [
      {
        title: "Copy fit: one structure, room for the words to change",
        paragraphs: [
          "Titles and instructions differ in length across languages. The loan-steps module uses shared content width, wrapping, and spacing so the words can change while the order of steps and the hierarchy stay clear.",
        ],
        image: shot(10, "The loan-steps module keeping one structure across languages of different lengths."),
      },
      {
        title: "Layout fit: reorganize information for the screen",
        paragraphs: [
          "From desktop to mobile, pages change image-and-text arrangement, module spacing, and element size to the space available, and keep the same priority of information. In the compliance module, desktop places the main image beside the description and lists institutions in a row. Mobile stacks the image and text and uses a two-column list, so the primary compliance information still comes first.",
        ],
        image: shot(
          11,
          "The compliance module side by side on desktop and stacked with a two-column list on mobile.",
        ),
      },
      {
        title: "Interaction feedback: shared states and expected results",
        paragraphs: [
          "Navigation, buttons, links, and expandable content use one set of states and feedback. Clear default, hover, selected, and expanded states help people see what can be used, where they are, and what an action did, so similar actions feel the same across markets.",
        ],
        image: shot(
          12,
          "Default, hover, selected, and expanded states for navigation, buttons, links, and disclosures.",
        ),
      },
      {
        title: "Fit rules extend how far modules can be reused",
        paragraphs: [
          "With these rules, shared modules can hold the real content and devices of different markets, and one-off adjustments to single pages become less necessary.",
        ],
      },
    ],
  },
  {
    kind: "prose",
    title: "5. Shared Display Rules, Local Grounds for Trust",
    subtitle: "5. Shared Display Rules, Local Grounds for Trust",
    paragraphs: [
      "Localization of a financial website also shows up in how regulation, institutional relationships, and safety guidance are expressed. The design team worked with local teams on what to show and in what order, then carried each market’s content in a shared information frame, so people can understand the platform, recognize risk, and find official channels.",
    ],
  },
  {
    kind: "points",
    items: [
      {
        title: "Local compliance: one hierarchy, local information in front",
        paragraphs: [
          "The compliance modules for Indonesia and Mexico share one hierarchy: a main image and introduction carry the primary compliance information, and institution marks with short notes below add the related regulators, industry bodies, and certifications.",
          "Each market configures its own institutions, text, links, and how many are shown, so the layout is reused while the local entity and its relationships stay accurate.",
        ],
        image: shot(
          13,
          "Indonesia and Mexico compliance modules sharing one hierarchy and showing local institutions.",
        ),
      },
      {
        title: "Trust: qualifications, press, and partnerships in separate layers",
        paragraphs: [
          "Compliance credentials, press coverage, and partners are separate modules. Clear titles, marks, and short notes help people understand qualifications, media presence, and partnerships, and see what kind of relationship each piece of information stands for.",
          "Regulation, certification, press, and commercial partnerships are expressed apart from one another, so different relationships are not collapsed into a single institutional endorsement. Trust rests on information that is specific and can be checked.",
        ],
      },
      {
        title: "Safety education: from a warning to a next step",
        paragraphs: [
          "The anti-fraud page gathers common scam situations, reminders about personal information, and official contact channels, so people can recognize impersonation and suspicious behavior and find help when something is wrong.",
          "Markets keep the shared modules and adjust the information to local risks, operating channels, and how service is provided, so the safety guidance can keep being updated.",
        ],
        image: shot(
          14,
          "The anti-fraud page with scam situations, privacy reminders, and official contact channels.",
        ),
      },
    ],
  },
  {
    kind: "prose",
    title: "6. Making the Rebuild Reusable Across Markets",
    subtitle: "6. Making the Rebuild Reusable Across Markets",
    paragraphs: [
      "During the rebuild we confirmed needs with business and local teams, organized the agreed pages, reuse boundaries, and content structure as shared assets, and aligned with development, marketing, and delivery on how to use them, so the shared scheme entered real collaboration and delivery.",
    ],
  },
  {
    kind: "points",
    items: [
      {
        title: "A shared library built from the most complete site",
        paragraphs: [
          "We used the Indonesia site, the one with the most complete content, as the base. Existing pages were sorted, and components, modules, and page structures that later markets might need were added, forming a shared design document designers in each market can draw from.",
          "Teams pull and combine what is already there. Brand styles adapt through variables. A new need is confirmed with the relevant business and local teams first, then judged as shared content or a market-specific custom. When shared content changes, the shared file is updated and the teams using it are told.",
        ],
        image: shot(15, "The shared design document and reusable modules based on the Indonesia site."),
      },
      {
        title: "Design, development, and content delivery reuse the same structure",
        paragraphs: [
          "Development wrapped the same content as shared code modules for each market’s engineers to call. Marketing and delivery pick reusable modules from pages already live, so a request is less likely to be misunderstood.",
          "Local teams use one translation-document format and fill in the local language by page and module. The design structure and the content fields match, so less work is spent reorganizing, explaining, and checking.",
        ],
      },
      {
        title: "From the current markets to Poland and Spain",
        paragraphs: [
          "The architecture and the way of working have since been reused for Poland and Spain. The design team looked at how those markets operate, confirmed needs and policy-related content with business and local teams, selected the pages and modules that apply, and worked with development to configure the brand, fill in content, and customize only where needed. Existing work extends into a new market instead of starting from zero.",
        ],
        image: shot(
          16,
          "Poland and Spain homepages configured and filled in on the same architecture.",
        ),
      },
      {
        title: "Delivery: the anti-fraud page before and after reuse",
        paragraphs: [
          "The anti-fraud page reused the page frame, visual assets, content structure, and development modules, so less of the work was repeated at each step.",
        ],
      },
      {
        title: "Ongoing refinement from how people actually use the site",
        paragraphs: [
          "Later changes will use Sensors Analytics records of page views, entry clicks, and click-through rates. Within a defined period and traffic source, we look at how content and entries are used in each market, and that informs adjustments to words, images, and how modules are organized.",
        ],
      },
    ],
  },
];
