export type OpsImage = {
  kind: "image";
  src: string;
  srcEn: string;
  alt: string;
};

export type OpsProse = {
  kind: "prose";
  kicker?: string;
  title?: string;
  subtitle?: string;
  paragraphs: string[];
};

export type OpsQuestions = {
  kind: "questions";
  intro: string;
  items: string[];
  outro: string;
};

export type OpsShifts = {
  kind: "shifts";
  items: { title: string; body: string }[];
  outro: string[];
};

export type OpsBlock = OpsImage | OpsProse | OpsQuestions | OpsShifts;

const cover = "/archive-ga-004/ops-cover.webp";

export const OPS_ARTICLE_ZH: OpsBlock[] = [
  {
    kind: "image",
    src: cover,
    srcEn: cover,
    alt: "Design AI Ops 实战笔记封面，黑底圆环中央是白色标志与绿苹果",
  },
  {
    kind: "prose",
    kicker: "00 / Prologue",
    title: "苹果时刻",
    subtitle: "The Apple Moment",
    paragraphs: [
      "2026 年上半年，我们在团队内部启动了一轮 Design AI Ops 实践。最初的目标很直接：跟上快速变化的 AI 能力，帮助成员拓展工作边界，也让散落在个人手里的尝试，逐渐转化为团队能够共同使用的能力。",
      "但实践开始后，我们很快发现，真正的问题并不是大家会不会使用 AI。工具每天都在变化，今天需要学习的技巧，明天可能已经成为默认能力。比工具更值得讨论的是：当每个人都可以更快地得到答案，设计师之间的差异会出现在哪里？一个人的效率提升，又怎样才能真正成为团队的能力？",
      "这篇文章不是对这轮实践的完整复盘。我们更想记录它留下的一个问题：当生成不再稀缺，设计还剩下什么？",
      "几年前，设计师面对空白画布时，最难的是把一个想法做出来。",
      "今天，空白正在迅速消失。输入一句话，几十张图、几版界面和一段视频便会同时出现。工具没有让问题消失，它只是把问题推向了另一个地方：我们为什么选择这一张，而不是另外三十九张？",
    ],
  },
  {
    kind: "image",
    src: "/archive-ga-004/ops-02-cn.webp",
    srcEn: "/archive-ga-004/ops-02-en.webp",
    alt: "古典人物与递出绿苹果的天使，对比工具出现前后人的工作方式",
  },
  {
    kind: "prose",
    paragraphs: [
      "当生成不再稀缺，判断开始成为设计真正的重量。",
      "我们把人和工具重新建立关系的那个时刻，叫作「The Apple Moment · 苹果时刻」。它不是某个工具发布的日期，而是设计师意识到：自己的工作正在从完成答案，转向决定什么值得成为答案。",
    ],
  },
  {
    kind: "prose",
    kicker: "01 / A New Scarcity",
    title: "当「做出来」不再稀缺",
    subtitle: "When making is no longer scarce",
    paragraphs: [
      "过去，设计的很多限制来自执行成本。时间不够、资源有限、技术实现困难，一个想法往往在被看见之前，就已经被现实筛掉。",
      "AI 改变了这件事。它让尝试变得便宜，也让放弃一个方案变得容易。可是，当每个人都可以快速得到大量结果，数量本身便不再构成优势。",
      "生成越轻，选择就越重。设计师面对的不再只是空白画布，而是一个不断扩张的候选结果库。真正稀缺的，也从执行速度变成了问题意识、质量判断，以及对最终选择负责的能力。",
      "更快地得到一个答案，并不等于更接近正确的答案。",
    ],
  },
  {
    kind: "prose",
    kicker: "02 / The Gravity of Judgment",
    title: "判断，是设计的引力",
    subtitle: "Judgment gives design gravity",
    paragraphs: [
      "方案越多，越需要一种力把它们拉回同一个方向。它决定哪些问题值得解决，什么样的结果算好，以及什么时候应该停止生成、开始选择。",
    ],
  },
  {
    kind: "image",
    src: "/archive-ga-004/ops-03-cn.webp",
    srcEn: "/archive-ga-004/ops-03-en.webp",
    alt: "Design AI Ops 示意图，人的角色从重复执行转向判断、拆解与整合",
  },
  {
    kind: "questions",
    intro:
      "在一轮团队实践中，我们逐渐留下五个问题。它们最初用于讨论 AI 项目，后来更像是设计师面对生成结果时的五次自问：",
    items: [
      "1. 我们真正要解决什么？",
      "2. 为什么这里需要 AI？",
      "3. 人在哪里做出了判断？",
      "4. 生成的结果如何成为完整设计？",
      "5. 这次经验能否被下一次使用？",
    ],
    outro:
      "其中最重要的始终是第三个问题。工具可以给出选项，却不会替我们承担选择的后果。设计的价值，不只存在于最后留下的结果里，也存在于那些被放弃的可能性，以及放弃它们的理由里。",
  },
  {
    kind: "prose",
    kicker: "03 / After One Designer Gets Faster",
    title: "一个人变快之后",
    subtitle: "After one designer gets faster",
    paragraphs: [
      "一个设计师找到好用的 Prompt、模型或工作流，很容易获得立刻可见的效率提升。但个人变快，并不意味着团队拥有了新的能力。只要方法仍然依赖某个人的记忆，它就会随着工具更新、项目结束或人员变化而消失。",
    ],
  },
  {
    kind: "image",
    src: "/archive-ga-004/ops-04-en.webp",
    srcEn: "/archive-ga-004/ops-04-en.webp",
    alt: "从个人加速到团队共享方法的示意",
  },
  {
    kind: "prose",
    paragraphs: [
      "经验要跨过个人边界，需要被记录、验证和解释。别人不仅要知道「怎样做」，还要知道它适用于什么场景、质量边界在哪里、哪些步骤必须由人判断。",
      "因此，我们把探索放进真实任务里检验，再把有效的方法留下来：实践负责试验，生产负责证明，能力层负责让经验被下一位设计师继续使用。这里的系统不是为了统一每个人的创作，而是为了让值得保留的判断不必每次从头建立。",
      "工具让一个人变快。只有共享的方法，才能让一个团队真正学会。",
    ],
  },
  {
    kind: "prose",
    kicker: "04 / Three Shifts",
    title: "设计工作正在发生的三次转向",
    subtitle: "Three shifts in design work",
    paragraphs: [
      "回看那些在新鲜感过去之后仍被持续使用的方案，真正留下来的通常不是最惊艳的 Demo，而是改变了工作方式的部分。我们看到三种变化正在发生。",
    ],
  },
  {
    kind: "image",
    src: "/archive-ga-004/ops-05-en.webp",
    srcEn: "/archive-ga-004/ops-05-en.webp",
    alt: "设计工作三次转向的图示",
  },
  {
    kind: "shifts",
    items: [
      {
        title: "01 从生成结果，到设计验证机制",
        body: "当 AI 可以快速生成交互稿，设计师的工作开始向前后两端移动：先定义输入和约束，再设计检查机制。生成不再是终点，能否验证生成结果才决定它能不能进入真实生产。",
      },
      {
        title: "02 从凭经验创作，到让反馈回到创作",
        body: "当投放表现、使用数据和失败结果重新进入下一轮创作，设计不再只依赖个人直觉。人的判断并没有被数据替代，而是获得了可以持续校准的依据。",
      },
      {
        title: "03 从亲自完成，到定义「什么是对的」",
        body: "当业务方可以自行生成常规物料，设计师不再完成每一张图，而是提前定义品牌规则、版式边界和质量标准。工作的对象从单个结果，变成了产生结果的条件。",
      },
    ],
    outro: [
      "这三种变化指向同一件事：AI 并没有简单地拿走设计师的工作，而是在迫使我们说清楚，过去那些看似依靠直觉完成的判断，究竟由什么构成。",
      "把判断说清楚，并不意味着把创作变成公式。恰恰相反，当执行和规则逐渐交给系统，设计师才更需要回答：自己真正想表达什么，什么又值得被留下。",
    ],
  },
  {
    kind: "prose",
    kicker: "05 / Afterword",
    title: "苹果落下之后",
    subtitle: "After the apple falls",
    paragraphs: [
      "AI 的能力仍在飞速发展。今天需要反复调试才能完成的事情，明天可能只是一个默认选项。任何围绕具体工具建立的优势，都可能比我们预想中消失得更快。",
      "但执行门槛降低，并没有让人与人之间的差异消失。同样的模型、相近的工具，会因为问题意识、审美经验、业务理解和取舍方式的不同，产生完全不同的结果。AI 没有抹平这些差异，反而把它们放大了。",
      "在热潮中，人们习惯讨论模型、参数、Prompt 和工作流；当热潮退去，技术会逐渐回到背景。那时，「这是用 AI 做的」既不是作品的解释，也不再构成作品的价值。人们最终看到的，仍然是它表达了什么、解决了什么，以及它是否值得被记住。",
      "真正沉淀下来的，不会是我们生成过多少方案，而是那些被认真选择、反复打磨并最终留下的成果。并不是所有成果都需要成为艺术，但那些能够穿越时间的作品，往往已经不再依赖它诞生时的技术标签。",
      "技术拓展了一个时代能够做什么，作品则决定我们会如何记住它。艺术之所以能够穿越时间，不是因为它拒绝技术，而是因为当技术过时以后，它仍然保存着人的感受、判断与立场。苹果终会落地。真正留下来的，不是它下落的瞬间，而是我们因此看见了什么。",
    ],
  },
  {
    kind: "image",
    src: "/archive-ga-004/ops-06-en.webp",
    srcEn: "/archive-ga-004/ops-06-en.webp",
    alt: "苹果落下之后，设计留下判断、问题、结构与方法",
  },
];

export const OPS_ARTICLE_EN: OpsBlock[] = [
  {
    kind: "image",
    src: cover,
    srcEn: cover,
    alt: "Cover of the Design AI Ops field notes, with a white mark and green apple inside a black ring",
  },
  {
    kind: "prose",
    kicker: "00 / Prologue",
    title: "The Apple Moment",
    subtitle: "The Apple Moment",
    paragraphs: [
      "In the first half of 2026, we started a Design AI Ops practice inside the team. The aim was direct: keep up with fast-changing AI capability, help people extend their work, and turn scattered personal experiments into a shared team ability.",
      "Once the practice began, the real question was not whether people could use AI. Tools change every day. A trick worth learning today may be a default tomorrow. The sharper question is where designers still differ when everyone can reach an answer faster, and how one person’s speed becomes a team capability.",
      "This is not a full retrospective. It records the question the practice left behind: when making is no longer scarce, what is left of design?",
      "A few years ago, the hardest part of a blank canvas was getting an idea made.",
      "Today the blank is disappearing. One sentence can return dozens of images, several interfaces, and a video at once. The tool does not remove the problem. It moves it: why this one, and not the other thirty-nine?",
    ],
  },
  {
    kind: "image",
    src: "/archive-ga-004/ops-02-en.webp",
    srcEn: "/archive-ga-004/ops-02-en.webp",
    alt: "A classical figure and an angel offering a green apple, contrasting work before and after the tool",
  },
  {
    kind: "prose",
    paragraphs: [
      "When making is no longer scarce, judgment becomes the real weight of design.",
      "We call the moment people and tools form a new relationship The Apple Moment. It is not a product launch date. It is the moment a designer realizes the work has shifted from finishing an answer to deciding what deserves to become one.",
    ],
  },
  {
    kind: "prose",
    kicker: "01 / A New Scarcity",
    title: "When making is no longer scarce",
    subtitle: "When making is no longer scarce",
    paragraphs: [
      "Many limits in design used to come from the cost of making. Time, resources, and technical difficulty screened an idea out before it could be seen.",
      "AI changed that. Trying became cheap, and abandoning a direction became easy. Once everyone can produce a large number of results quickly, quantity itself stops being an advantage.",
      "The lighter making becomes, the heavier choosing becomes. Designers no longer face only a blank canvas, but an expanding library of candidates. What is scarce shifts from speed of execution to the quality of the question, judgment of quality, and responsibility for the final choice.",
      "Getting an answer faster is not the same as getting closer to the right one.",
    ],
  },
  {
    kind: "prose",
    kicker: "02 / The Gravity of Judgment",
    title: "Judgment gives design gravity",
    subtitle: "Judgment gives design gravity",
    paragraphs: [
      "The more options there are, the more a force is needed to pull them back in one direction. It decides which problems are worth solving, what counts as good, and when to stop generating and start choosing.",
    ],
  },
  {
    kind: "image",
    src: "/archive-ga-004/ops-03-en.webp",
    srcEn: "/archive-ga-004/ops-03-en.webp",
    alt: "Diagram of Design AI Ops, shifting the human role from repetition toward judgment and integration",
  },
  {
    kind: "questions",
    intro:
      "One round of team practice left five questions. They began as a way to discuss AI projects, and became five questions a designer asks of a generated result:",
    items: [
      "1. What are we actually trying to solve?",
      "2. Why does this need AI?",
      "3. Where did a person make a judgment?",
      "4. How does a generated result become a complete design?",
      "5. Can this experience be used again?",
    ],
    outro:
      "The third question matters most. A tool can offer options. It will not carry the consequence of the choice. The value of design lives in the result that remains, and also in the possibilities that were refused, and the reasons for refusing them.",
  },
  {
    kind: "prose",
    kicker: "03 / After One Designer Gets Faster",
    title: "After one designer gets faster",
    subtitle: "After one designer gets faster",
    paragraphs: [
      "A useful prompt, model, or workflow can make one designer visibly faster. Personal speed is not yet a team capability. As long as the method lives in one person’s memory, it disappears when the tool, the project, or the person changes.",
    ],
  },
  {
    kind: "image",
    src: "/archive-ga-004/ops-04-en.webp",
    srcEn: "/archive-ga-004/ops-04-en.webp",
    alt: "From one designer getting faster to a method the team can share",
  },
  {
    kind: "prose",
    paragraphs: [
      "For experience to cross a personal boundary, it has to be recorded, tested, and explained. Others need to know not only how, but where it applies, where the quality boundary is, and which steps still require a person.",
      "So we tested exploration inside real tasks, then kept the methods that held: practice runs the experiment, production proves it, and a capability layer lets the next designer use it. The system is not there to make everyone’s work identical. It keeps a judgment worth saving from having to be rebuilt every time.",
      "A tool makes one person faster. Only a shared method lets a team actually learn.",
    ],
  },
  {
    kind: "prose",
    kicker: "04 / Three Shifts",
    title: "Three shifts in design work",
    subtitle: "Three shifts in design work",
    paragraphs: [
      "Looking back at the work still in use after the novelty faded, what remained was rarely the most dazzling demo. It was the part that changed how the work was done. Three shifts are underway.",
    ],
  },
  {
    kind: "image",
    src: "/archive-ga-004/ops-05-en.webp",
    srcEn: "/archive-ga-004/ops-05-en.webp",
    alt: "Diagram of three shifts in design work",
  },
  {
    kind: "shifts",
    items: [
      {
        title: "01 From generated output to a way of verifying design",
        body: "Once AI can draft interactions quickly, the designer’s work moves to both ends: defining the input and constraints first, then designing the checks. Generation is no longer the end. Whether the result can be verified decides whether it can enter production.",
      },
      {
        title: "02 From working by instinct to letting feedback return to the work",
        body: "When performance, usage, and failure come back into the next round, design no longer depends only on personal instinct. Judgment is not replaced by data. It gains something it can keep calibrating against.",
      },
      {
        title: "03 From making every piece to defining what “right” is",
        body: "When others can generate routine materials themselves, the designer no longer finishes every image. They define brand rules, layout boundaries, and quality standards in advance. The object of the work shifts from a single result to the conditions that produce it.",
      },
    ],
    outro: [
      "These three shifts point to the same thing. AI has not simply taken the designer’s work away. It forces us to say what those judgments, once made by instinct, are actually made of.",
      "Making judgment explicit does not turn creation into a formula. As execution and rules move into the system, the designer has to answer more clearly what they want to express, and what is worth keeping.",
    ],
  },
  {
    kind: "prose",
    kicker: "05 / Afterword",
    title: "After the apple falls",
    subtitle: "After the apple falls",
    paragraphs: [
      "AI is still moving fast. What takes repeated tuning today may be a default tomorrow. Any advantage built around a specific tool can disappear sooner than we expect.",
      "A lower cost of execution does not erase the difference between people. The same model and similar tools still produce different results, because the question, the taste, the understanding of the business, and the way of choosing are different. AI does not flatten those differences. It magnifies them.",
      "In the rush, people talk about models, parameters, prompts, and workflows. When the rush recedes, the technology moves into the background. “Made with AI” will neither explain the work nor be its value. What remains visible is what it expresses, what it solves, and whether it is worth remembering.",
      "What settles is not how many options we generated, but the results that were chosen carefully, refined, and kept. Not every result needs to become art. The work that travels through time often no longer depends on the technical label it was born with.",
      "Technology expands what an era can do. The work decides how we remember it. Art travels through time not because it refuses technology, but because after the technology is outdated it still holds a person’s feeling, judgment, and position. The apple does fall. What remains is not the moment of the fall, but what we were able to see because of it.",
    ],
  },
  {
    kind: "image",
    src: "/archive-ga-004/ops-06-en.webp",
    srcEn: "/archive-ga-004/ops-06-en.webp",
    alt: "After the apple falls, what remains is judgment, questions, structure, and method",
  },
];
