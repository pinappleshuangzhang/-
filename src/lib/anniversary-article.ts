import type { OpsBlock } from "@/lib/ops-article";

function image(id: string, alt: string): OpsBlock {
  return {
    kind: "image",
    src: `/archive-ga-004/anniversary-${id}-cn.webp`,
    srcEn: `/archive-ga-004/anniversary-${id}-en.webp`,
    alt,
  };
}

/** 005 Easycash 9 周年视觉系统，正文按提交稿分块。 */
export const ANNIVERSARY_ARTICLE_ZH: OpsBlock[] = [
  image(
    "01",
    "文章封面以笔记本电脑样机展示 Easycash 九周年羽毛球场主题首页，画面中包含“9TH Anniversary”“2026”字样与品牌标识元素。",
  ),
  {
    kind: "prose",
    title: "让“9”成为入口：Easycash 9周年视觉系统设计复盘",
    subtitle:
      "Turning “9” into an Entrance: A Review of Easycash’s 9th Anniversary Visual System",
    paragraphs: [
      "本次视觉设计围绕 Easycash 9 周年主题“Easycash 9 Years Moving Forward Together”（与你一同前行）展开。",
      "视觉以周年标识中的“9”图形为基础，围绕 Sports、Life、Anti-fraud 和 MOJANG 四个内容方向展开，分别承载周年代言合作、日常生活、防诈骗与金融学习内容。既定的周年符号由此转化为赛场入口、生活窗口、安全关口和学习空间的入口。",
      "在这一过程中，AI 参与场景构建、材质与光影探索，以及平面元素生成。设计师通过结构控制、结果筛选与人工合成，让四个主题保留各自的空间氛围，并形成一致的系列识别。",
    ],
  },
  {
    kind: "prose",
    title: "让周年符号拥有空间身份",
    subtitle: "Giving the Anniversary Symbol a Spatial Identity",
    paragraphs: [
      "周年符号的识别来自外轮廓与内部留白的组合。空间化延展保留两者的形态关系，将外轮廓转化为建筑边界，内部留白形成的图形则融入场景，成为具体的构件或图案。",
      "墙体厚度与内壁建立实体感，内部场景提供景深，前景道具补充尺度与遮挡关系。外轮廓与内部图形分布在不同的空间层次中，在同一视角下形成呼应，共同构成周年符号的空间形态。",
      "这一转化需要同时控制符号识别与空间关系。外部开口和内部图形的轮廓、比例与相对位置需要保持协调，室内物件需要被建筑自然遮挡，前景道具则需要具有合理的尺度和落地位置。光线沿墙面、内壁与地面延续，进一步连接内外空间。",
      "四个主题共享这一结构基础，通过场景、材质与道具形成差异。周年符号作为共同入口，串联代言合作、生活、安全与学习内容，让“陪伴与前行”的周年主题获得具体的空间表达。",
    ],
  },
  image(
    "03",
    "周年符号与空间化表达对照图：左侧展示平面周年符号的外轮廓与内部图形，右侧展示其转化为带墙体厚度、内部景深与前景道具的空间开口。",
  ),
  {
    kind: "prose",
    title: "Sports：进入赛场的通道",
    subtitle: "Sports: An Entrance to the Court",
    paragraphs: [
      "Easycash 与印尼羽毛球国家队运动员达成官方合作伙伴关系，由其担任本次 9 周年品牌代言人。Sports 围绕这一合作展开，将周年符号的外轮廓转化为通往羽毛球场的入口。",
      "内部图形通过看台座椅的排列与色块呈现，与绿色球场和地面线条共同建立场馆纵深。前景球拍与羽毛球补充尺度和临场感，让周年符号融入赛场环境，呼应代言人的运动身份。",
    ],
  },
  image(
    "04",
    "Sports 主题主视觉：周年符号外轮廓形成通往绿色羽毛球场的入口，看台座椅排布出内部图形，前景摆放球拍、羽毛球与 RP 硬币。",
  ),
  {
    kind: "prose",
    title: "Life：看见日常生活的窗口",
    subtitle: "Life: A Window into Everyday Living",
    paragraphs: [
      "Life 将周年符号转化为看向日常生活的窗口。内部图形对应室内的异形窗洞，自然光由此进入，照亮木饰面与家具。符号的内部轮廓同时参与采光表现，与外部开口形成呼应。",
      "扶手椅、咖啡机与木质家具构成温暖的生活场景，前景花瓶与花卉将细节延伸至开口之外。熟悉的家居物件、自然材质与柔和光线，共同赋予周年符号贴近日常的空间性格。",
    ],
  },
  image(
    "05",
    "Life 主题主视觉：木饰面空间内设有对应内部图形的异形采光窗，扶手椅与咖啡机沐浴在自然光中，前景摆放绿色花瓶、花卉与散落花瓣。",
  ),
  {
    kind: "prose",
    title: "Anti-fraud：具有防护意味的安全关口",
    subtitle: "Anti-fraud: A Checkpoint Suggesting Protection",
    paragraphs: [
      "Anti-fraud 将周年符号的外轮廓转化为金属门体，内部图形则成为门上的网格开口。两者共同保留符号的形态关系，通过金属材质、网格结构与门框厚度，建立带有防护意味的空间边界。",
      "警示贴纸与落地告示牌补充反诈信息。门体构成主要的空间形象，警示图形突出信息焦点，让防诈骗内容融入具体场景，并保持清楚的视觉主次。",
    ],
  },
  image(
    "06",
    "Anti-fraud 主题主视觉：周年符号外轮廓构成金属门体，内部图形转化为门上的网格开口，搭配警示贴纸、绿色落地告示牌与前景 RP 硬币。",
  ),
  {
    kind: "prose",
    title: "MOJANG：进入金融知识的学习空间",
    subtitle: "MOJANG: An Entrance to Financial Learning",
    paragraphs: [
      "MOJANG 将周年符号转化为金融学习空间的入口。内部图形成为墙面的紫色洞洞板，与书籍、文件夹、便签及办公椅共同构成学习环境，让符号以场景构件的方式参与主题表达。",
      "前景台灯与文具进一步延伸学习线索。纸张、织物与玻璃形成不同的材质层次，贴纸和学习资料补充使用细节，将金融学习内容转化为具体、可感知的空间表达。",
    ],
  },
  image(
    "07",
    "MOJANG 主题主视觉：紫色学习空间内，内部图形转化为墙面紫色洞洞板，搭配书籍、文件夹、便签与办公椅，前景摆放台灯、文具与 RP 硬币。",
  ),
  {
    kind: "prose",
    title: "用四个层次组织视觉系统",
    subtitle: "Organizing the Visual System in Four Layers",
    paragraphs: ["整套画面可以归纳为四个相互配合的层次。"],
    bullets: [
      "建筑载体：以周年符号建立共同识别，定义空间边界。",
      "内部世界：通过场景、材质与光线说明主题。",
      "前景道具：延伸主题线索，连接内部空间与外部环境。",
      "平面图形：通过贴纸、文字、标签与警示信息补充品牌内容。",
    ],
    tail: [
      "各层需要保持明确的主次，局部细节的视觉重量也要与其作用相符。",
      "制作时，以建筑结构为基准，分别处理内部场景、前景道具和平面图形，再将各部分整合到完整画面中。合成后，统一检查物件比例、前后遮挡和光线方向，让各个层次自然衔接。",
    ],
  },
  image(
    "08",
    "四层视觉系统拆解图：将建筑载体、内部世界、前景道具与平面图形分层并列展示，说明各层如何组合为完整主视觉。",
  ),
  {
    kind: "prose",
    paragraphs: [
      "四个主题都沿用这一组织方式。浅色建筑表面、嵌入式符号结构，以及前景道具、贴纸与涂写等细节，构成了共同的视觉特征。在此基础上，通过内部场景、材质和主题色的变化，让每张画面拥有各自的空间氛围，同时保留系列的整体识别。",
    ],
  },
  {
    kind: "prose",
    title: "以结构为基准的 AI 辅助制作",
    subtitle: "AI-Assisted Production Guided by Structure",
    paragraphs: [
      "这套视觉需要同时处理两类要求：周年符号的几何关系必须保持稳定，不同主题的空间、材质与光影又需要具有各自的表现力。",
      "实际制作中，AI 重绘对精确几何的保持并不稳定。材质和光影得到改善时，符号的直边、弧线、尖角与墙体厚度也可能发生变化。因此，结构母版贯穿制作过程，承担生成参考、合成边界与校对依据的作用，最终结构通过人工对齐和修正来控制。",
      "基于这一限制，制作流程被拆分为六个步骤：定母版、做底片、嵌入母版、局部重绘、整图调整与筛选、最终合成与校对。",
    ],
  },
  image(
    "09",
    "六步制作流程示意图依次展示定母版、做底片、嵌入母版、局部重绘、整图调整与筛选，以及最终合成与校对的画面状态变化。",
  ),
  {
    kind: "steps",
    items: [
      {
        title: "1. 定母版：建立结构基准",
        body: "锁定外轮廓、内部图形、墙体厚度及相对位置。",
      },
      {
        title: "2. 做底片：单独生成内部场景",
        body: "制作矩形场景底片，确定视角、物件比例、留白与材质。",
      },
      {
        title: "3. 嵌入母版：衔接内外空间",
        body: "将底片嵌入外部开口，并定位内部图形。",
      },
      {
        title: "4. 局部重绘：逐项修正细节",
        body: "通过蒙版限定修改范围，修正纹理、道具、材质与阴影。",
      },
      {
        title: "5. 整图调整与筛选：协调整体表现",
        body: "尝试协调材质与光影，对照母版筛选可用结果。",
      },
      {
        title: "6. 最终合成与校对：整合平面元素",
        body: "人工合成贴纸、标签与文字，复核结构、边缘和文字内容。",
      },
    ],
  },
  {
    kind: "prose",
    title: "让生成能力服务于设计判断",
    subtitle: "Directing Generation through Design Judgment",
    paragraphs: [
      "在这次实践中，AI 帮助场景、材质、光影和平面元素逐步成形，让设计设想变得可观察、可比较，也为后续调整提供了直观的反馈。",
      "生成结果需要放在完整画面和整组主题中判断。除了单张画面的材质与氛围，还需要将四个主题并置，检查符号比例、空间层次和细节的视觉重量。某个局部即使效果突出，也需要考虑它与其他画面的关系，再决定保留、调整或舍弃，让主题差异与共同识别同时成立。",
      "这次实践的核心，是明确必须保持的结构与可以探索的表现范围。AI 拓展了视觉表达的选择，设计判断决定这些选择如何进入最终画面，让同一个“9”在保持统一识别的同时，成为四种主题空间的入口。",
    ],
  },
];

export const ANNIVERSARY_ARTICLE_EN: OpsBlock[] = [
  image(
    "01",
    "Article cover: a laptop mockup of the Easycash 9th anniversary badminton-court homepage, with “9TH Anniversary,” “2026,” and brand marks.",
  ),
  {
    kind: "prose",
    title:
      "Turning “9” into an Entrance: A Review of Easycash’s 9th Anniversary Visual System",
    subtitle:
      "Turning “9” into an Entrance: A Review of Easycash’s 9th Anniversary Visual System",
    paragraphs: [
      "This visual design was developed around Easycash’s 9th anniversary theme, “Easycash 9 Years Moving Forward Together.”",
      "Built around the “9” mark in the anniversary identity, the visual system unfolds across four content directions: Sports, Life, Anti-fraud and MOJANG, corresponding to the anniversary ambassador partnership, everyday living, fraud prevention and financial learning. The established symbol becomes an entrance to the court, a window into everyday life, a security checkpoint and an entrance to a learning space.",
      "Throughout this process, AI participated in scene construction, material and lighting exploration, and the generation of graphic elements. Through structural control, selection of results and manual compositing, the designer preserved each theme’s spatial atmosphere while maintaining a consistent series identity.",
    ],
  },
  {
    kind: "prose",
    title: "Giving the Anniversary Symbol a Spatial Identity",
    subtitle: "Giving the Anniversary Symbol a Spatial Identity",
    paragraphs: [
      "Recognition of the anniversary symbol comes from the combination of its outer contour and internal negative space. The spatial extension preserves the relationship between the two, turning the outer contour into an architectural boundary while integrating the internal shape into the scene as a concrete architectural element or pattern.",
      "Wall thickness and inner reveals establish physical presence, the interior scene creates depth, and foreground props add scale and occlusion relationships. Positioned across different spatial layers, the outer contour and internal shape echo each other from the camera’s viewpoint to form the spatial identity of the anniversary symbol.",
      "This transformation requires control over both symbol recognition and spatial relationships. The contours, proportions and relative positions of the outer opening and internal shape need to remain coordinated, interior objects must be naturally occluded by the architecture, and foreground props require believable scale and ground contact. Light continues across the wall, inner reveals and floor to connect the interior and exterior.",
      "All four themes share this structural foundation while differentiating themselves through scenes, materials and props. Acting as a shared entrance, the anniversary symbol links the ambassador partnership, everyday life, security and financial learning, giving the theme of companionship and moving forward a tangible spatial form.",
    ],
  },
  image(
    "03",
    "Comparison of the flat anniversary symbol and its spatial form: the outer contour and inner shape on the left become an opening with wall thickness, interior depth, and foreground props on the right.",
  ),
  {
    kind: "prose",
    title: "Sports: An Entrance to the Court",
    subtitle: "Sports: An Entrance to the Court",
    paragraphs: [
      "Easycash entered an official partnership with Indonesian national badminton team athletes as the brand ambassadors for its 9th anniversary. Built around this collaboration, Sports turns the outer contour of the anniversary symbol into an entrance to a badminton court.",
      "The internal shape appears through the arrangement and color blocks of the stadium seating, working with the green court and court lines to establish depth. A racket and shuttlecocks in the foreground add scale and immediacy, integrating the anniversary symbol into the arena and echoing the ambassadors’ athletic identity.",
    ],
  },
  image(
    "04",
    "Sports key visual: the anniversary symbol’s outer contour opens onto a green badminton court, stadium seats form the inner shape, and a racket, shuttlecocks, and RP coins sit in the foreground.",
  ),
  {
    kind: "prose",
    title: "Life: A Window into Everyday Living",
    subtitle: "Life: A Window into Everyday Living",
    paragraphs: [
      "Life turns the anniversary symbol into a window onto everyday living. The internal shape corresponds to a custom-shaped interior window through which daylight enters to illuminate the wood finishes and furniture. The inner contour participates directly in the lighting of the room while echoing the outer opening.",
      "An armchair, coffee machine and wooden furniture create a warm domestic scene, while a vase and flowers in the foreground extend the details beyond the opening. Familiar household objects, natural materials and soft light give the anniversary symbol an approachable everyday character.",
    ],
  },
  image(
    "05",
    "Life key visual: a wood-lined room with a custom window matching the inner shape, an armchair and coffee machine in daylight, and a green vase, flowers, and scattered petals in the foreground.",
  ),
  {
    kind: "prose",
    title: "Anti-fraud: A Checkpoint Suggesting Protection",
    subtitle: "Anti-fraud: A Checkpoint Suggesting Protection",
    paragraphs: [
      "Anti-fraud transforms the outer contour of the anniversary symbol into a metal door, while the internal shape becomes a mesh opening set into the door panel. Together they preserve the symbol’s formal relationship, using metal surfaces, mesh structure and frame depth to establish a protective spatial boundary.",
      "Warning stickers and a freestanding sign add anti-fraud reminders. The door carries the primary spatial image while warning graphics highlight the informational focus, integrating fraud-prevention messaging into a concrete scene with a clear visual hierarchy.",
    ],
  },
  image(
    "06",
    "Anti-fraud key visual: the anniversary symbol’s outer contour forms a metal door, the inner shape becomes a mesh opening, with warning stickers, a green floor sign, and RP coins in the foreground.",
  ),
  {
    kind: "prose",
    title: "MOJANG: An Entrance to Financial Learning",
    subtitle: "MOJANG: An Entrance to Financial Learning",
    paragraphs: [
      "MOJANG turns the anniversary symbol into an entrance to a financial learning space. The internal shape becomes a purple pegboard on the wall, combining with books, binders, sticky notes and an office chair to form a study environment where the symbol participates as an interior fixture.",
      "A desk lamp and stationery in the foreground extend the learning cues. Paper, fabric and glass create varied material layers, while stickers and study materials add signs of use, translating financial literacy into a concrete and perceptible spatial expression.",
    ],
  },
  image(
    "07",
    "MOJANG key visual: a purple study space where the inner shape becomes a purple pegboard, with books, binders, notes, and an office chair, plus a lamp, stationery, and RP coins in the foreground.",
  ),
  {
    kind: "prose",
    title: "Organizing the Visual System in Four Layers",
    subtitle: "Organizing the Visual System in Four Layers",
    paragraphs: ["The compositions can be organized into four interrelated layers."],
    bullets: [
      "Architectural carrier: Uses the anniversary symbol to establish shared recognition and define spatial boundaries.",
      "Interior world: Communicates the theme through scenes, materials and light.",
      "Foreground props: Extend thematic cues and connect the interior with the exterior environment.",
      "Graphic elements: Add brand content through stickers, text, labels and warning information.",
    ],
    tail: [
      "Each layer needs a clear place in the visual hierarchy, with the visual weight of individual details matched to their function.",
      "During production, the architectural structure serves as the baseline while the interior scene, foreground props and graphic elements are developed separately and then combined into the full composition. After compositing, object proportions, front-to-back occlusion and light direction are checked together so the layers connect naturally.",
    ],
  },
  image(
    "08",
    "A four-layer breakdown of the visual system, placing the architectural carrier, interior world, foreground props, and graphic elements side by side to show how they combine into the key visual.",
  ),
  {
    kind: "prose",
    paragraphs: [
      "All four themes follow this organization. Light architectural surfaces, the recessed symbol structure, foreground props, stickers and handwritten markings form shared visual traits. Variations in interior scenes, materials and theme colors then give each image its own atmosphere while preserving recognition across the series.",
    ],
  },
  {
    kind: "prose",
    title: "AI-Assisted Production Guided by Structure",
    subtitle: "AI-Assisted Production Guided by Structure",
    paragraphs: [
      "This visual system has to meet two requirements at once: the geometry of the anniversary symbol must remain stable, while the space, materials and lighting of each theme need their own expressive character.",
      "In practice, AI redrawing does not reliably preserve exact geometry. Improvements in materials and lighting can also alter straight edges, curves, sharp corners and wall thickness. The structural master therefore runs through the entire process as a generation reference, compositing boundary and verification standard, with the final geometry controlled through manual alignment and correction.",
      "Based on this constraint, production is divided into six steps: establish the master, create the scene plate, embed into the master, refine locally, adjust and select across the full image, and complete final compositing and verification.",
    ],
  },
  image(
    "09",
    "A six-step production diagram showing the image as the master is set, the plate is made, the master is embedded, details are redrawn, the full image is adjusted and selected, and the final composite is checked.",
  ),
  {
    kind: "steps",
    items: [
      {
        title: "1. Establish the master: set the structural baseline",
        body: "Lock the outer contour, internal shape, wall thickness and relative positions.",
      },
      {
        title: "2. Create the plate: generate the interior scene separately",
        body: "Produce a rectangular scene plate to define camera angle, object scale, negative space and materials.",
      },
      {
        title: "3. Embed into the master: connect interior and exterior spaces",
        body: "Place the plate into the outer opening and position the internal shape.",
      },
      {
        title: "4. Refine locally: correct details item by item",
        body: "Use masks to limit the edit scope and refine textures, props, materials and shadows.",
      },
      {
        title: "5. Adjust and select: harmonize overall expression",
        body: "Explore adjustments to materials and lighting, then select usable results against the master.",
      },
      {
        title: "6. Final compositing and verification: integrate graphic elements",
        body: "Manually composite stickers, labels and text, then check structure, edges and text content.",
      },
    ],
  },
  {
    kind: "prose",
    title: "Directing Generation through Design Judgment",
    subtitle: "Directing Generation through Design Judgment",
    paragraphs: [
      "In this project, AI helped scenes, materials, lighting and graphic elements gradually take shape, making design ideas visible and comparable while providing direct feedback for further refinement.",
      "Generated results need to be judged within both the complete composition and the series as a whole. Beyond the materials and atmosphere of each image, the four themes need to be viewed side by side to assess symbol proportions, spatial layers and the visual weight of details. Even a compelling detail needs to be considered in relation to the other images before it is kept, adjusted or discarded, allowing thematic differences and a shared identity to coexist.",
      "The core of this practice lies in defining which structures must remain fixed and which expressive qualities are open to exploration. AI expands the range of visual choices, while design judgment determines how those choices enter the final image, allowing the same “9” to maintain unified recognition while becoming the entrance to four thematic spaces.",
    ],
  },
];
