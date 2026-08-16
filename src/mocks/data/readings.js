export const readings = [
  {
    id: '1',
    title: 'The Impact of Micro-Plastics on Marine Ecosystems',
    level: 'B2',
    topic: 'Môi trường',
    description:
      'An in-depth analysis of how micro-plastics enter the food chain and affect diverse marine life across the globe, from plankton to apex predators.',
    content:
      'Micro-plastics — tiny plastic fragments smaller than five millimetres — have become one of the most pervasive pollutants in the ocean. They originate from the breakdown of larger plastic debris, synthetic textiles, and personal care products. Once in the water, these particles are ingested by plankton, the base of the marine food chain, and gradually accumulate in the tissues of fish, seabirds, and marine mammals. Scientists warn that this bioaccumulation not only threatens marine biodiversity but may also pose long-term risks to human health through seafood consumption.',
    wordCount: 850,
    minutes: 10,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    questions: [
      {
        id: 'q1',
        question: 'Where do micro-plastics mainly come from?',
        options: [
          'The breakdown of larger plastic debris, synthetic textiles, and personal care products',
          'Underwater volcanic activity',
          'Untreated industrial wastewater',
          'Storms and tsunamis',
        ],
        correctIndex: 0,
        explanation:
          'Bài đọc nêu rõ micro-plastics hình thành từ sự phân rã của rác nhựa lớn, vải sợi tổng hợp và sản phẩm chăm sóc cá nhân.',
      },
      {
        id: 'q2',
        question: 'Which organism is mentioned as the first to ingest micro-plastics?',
        options: ['Sharks', 'Seabirds', 'Plankton', 'Sea turtles'],
        correctIndex: 2,
        explanation: 'Plankton là mắt xích đầu tiên của chuỗi thức ăn hấp thụ micro-plastics.',
      },
    ],
  },
  {
    id: '2',
    title: 'A Day in the Life of a Tokyo Chef',
    level: 'A2',
    topic: 'Đời sống',
    description:
      'Follow Kenji as he starts his morning at the fish market and prepares for a busy night at his small restaurant in downtown Tokyo.',
    content:
      'Kenji wakes up at four in the morning, long before the sun rises over Tokyo. His first stop is the Toyosu fish market, where he carefully selects the freshest tuna and seasonal vegetables for the day. Back at his small restaurant, he spends hours preparing sauces and slicing fish with precision. By evening, the restaurant is full of regular customers who come not only for the food, but for Kenji himself — his warm smile and quiet dedication to his craft.',
    wordCount: 320,
    minutes: 4,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    questions: [
      {
        id: 'q1',
        question: 'What time does Kenji wake up?',
        options: ['4 a.m.', '6 a.m.', '8 a.m.', '10 p.m.'],
        correctIndex: 0,
        explanation: 'Đoạn văn nêu rõ Kenji thức dậy lúc bốn giờ sáng.',
      },
      {
        id: 'q2',
        question: "What is the first stop in Kenji's day?",
        options: ['His restaurant', 'The Toyosu fish market', 'A supermarket', 'A coffee shop'],
        correctIndex: 1,
        explanation: 'Kenji ghé chợ cá Toyosu để chọn nguyên liệu tươi trước tiên.',
      },
    ],
  },
  {
    id: '3',
    title: "Quantum Computing: A Post-Moore's Law Paradigm",
    level: 'C1',
    topic: 'Công nghệ',
    description:
      'Exploring the theoretical foundations and practical challenges of scaling quantum bits in modern architectural designs.',
    content:
      "As classical transistor scaling approaches its physical limits, quantum computing has emerged as a promising paradigm for future computation. Unlike classical bits, qubits can exist in superposition, allowing quantum processors to explore multiple computational paths simultaneously. However, maintaining qubit coherence remains a formidable engineering challenge, requiring extreme cooling and error-correction techniques. Researchers continue to debate whether quantum advantage will be achieved for practical, real-world problems within the next decade.",
    wordCount: 1200,
    minutes: 15,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    questions: [
      {
        id: 'q1',
        question: 'What makes a qubit different from a classical bit?',
        options: [
          'A qubit can only exist in state 0',
          'A qubit can exist in a state of superposition',
          'A qubit cannot be measured',
          'A qubit runs slower than a classical bit',
        ],
        correctIndex: 1,
        explanation: 'Bài đọc giải thích qubit có thể tồn tại ở trạng thái chồng chập, khác với bit cổ điển.',
      },
      {
        id: 'q2',
        question: 'What is described as the biggest engineering challenge?',
        options: [
          'The cost of components',
          'Maintaining qubit coherence',
          'A shortage of programmers',
          'The lack of real-world applications',
        ],
        correctIndex: 1,
        explanation: 'Duy trì độ kết hợp của qubit là thách thức kỹ thuật lớn được nêu trong bài.',
      },
    ],
  },
  {
    id: '4',
    title: 'Remote Work: A New Global Norm',
    level: 'B1',
    topic: 'Kinh doanh',
    description:
      'How the shift to remote work has changed company culture, productivity metrics, and the way teams communicate across time zones.',
    content:
      'Since the global pandemic, remote work has shifted from a temporary measure to a lasting norm for many companies. Employees now value flexibility as much as salary, prompting organizations to redesign their office spaces and communication tools. While some worry about weakened team culture, others argue that asynchronous collaboration has actually improved focus and reduced burnout among distributed teams.',
    wordCount: 410,
    minutes: 5,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    questions: [
      {
        id: 'q1',
        question: 'What do employees now value as much as salary?',
        options: ['Flexibility', 'Year-end bonuses', 'Job titles', 'Colleagues'],
        correctIndex: 0,
        explanation: 'Bài đọc nêu nhân viên coi trọng sự linh hoạt ngang với mức lương.',
      },
    ],
  },
  {
    id: '5',
    title: 'The Basics of Healthy Sleep',
    level: 'A1',
    topic: 'Sức khỏe',
    description:
      'Simple tips about how many hours of sleep people need and why a consistent bedtime routine matters for your health.',
    content:
      'Most adults need between seven and nine hours of sleep every night. Going to bed at the same time each day helps the body build a healthy rhythm. Avoiding phones and bright lights before bedtime can also make it easier to fall asleep quickly.',
    wordCount: 180,
    minutes: 3,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    questions: [
      {
        id: 'q1',
        question: 'How many hours of sleep do adults need each night?',
        options: ['3-4 hours', '5-6 hours', '7-9 hours', '10-12 hours'],
        correctIndex: 2,
        explanation: 'Bài đọc nêu người lớn cần ngủ từ bảy đến chín giờ mỗi đêm.',
      },
    ],
  },
  {
    id: '6',
    title: 'Understanding Behavioural Economics',
    level: 'B2',
    topic: 'Kinh tế',
    description:
      'An overview of how cognitive biases influence financial decisions and why traditional economic models often fail to predict real behaviour.',
    content:
      'Traditional economic theory assumes that individuals act rationally to maximise their own utility. However, behavioural economics reveals that cognitive biases — such as loss aversion and anchoring — often lead people to make decisions that deviate from pure rationality. Understanding these biases has become essential for policymakers designing effective public interventions.',
    wordCount: 560,
    minutes: 7,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    questions: [
      {
        id: 'q1',
        question: 'What does behavioural economics study?',
        options: [
          'How cognitive biases influence decisions',
          'How central banks print money',
          'The history of the stock market',
          'The manufacturing process of goods',
        ],
        correctIndex: 0,
        explanation: 'Bài đọc tập trung vào ảnh hưởng của thiên kiến nhận thức lên quyết định tài chính.',
      },
    ],
  },
  {
    id: '7',
    title: 'Climate Migration in the 21st Century',
    level: 'C2',
    topic: 'Xã hội',
    description:
      'Examining the socio-political ramifications of mass displacement caused by rising sea levels and increasingly erratic weather patterns.',
    content:
      'Climate migration, once a marginal concern in policy discussions, has become a central issue as rising sea levels and extreme weather events displace millions. Coastal nations face existential questions about sovereignty and resettlement, while receiving countries grapple with the legal ambiguity surrounding "climate refugees" — a term not yet recognised under international law.',
    wordCount: 980,
    minutes: 12,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    questions: [
      {
        id: 'q1',
        question: 'What is the legal status of the term "climate refugees"?',
        options: [
          'Fully recognised under international law',
          'Not yet officially recognised under international law',
          'Recognised only in Europe',
          'Banned worldwide',
        ],
        correctIndex: 1,
        explanation: 'Bài đọc nêu rõ "climate refugees" chưa được công nhận chính thức trong luật quốc tế.',
      },
    ],
  },
  {
    id: '8',
    title: 'My Favourite Weekend Hobby',
    level: 'A1',
    topic: 'Đời sống',
    description:
      'A short personal story about gardening on weekends and the simple joy of watching plants grow over time.',
    content:
      'Every Saturday morning, I water my small garden on the balcony. I grow tomatoes, basil, and a few flowers. It is not a big garden, but I love watching the plants grow week by week. Gardening helps me relax after a busy week at work.',
    wordCount: 150,
    minutes: 2,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    questions: [
      {
        id: 'q1',
        question: 'What does the writer grow in the garden?',
        options: ['Tomatoes, basil, and flowers', 'Only roses', 'Water spinach', 'Large fruit trees'],
        correctIndex: 0,
        explanation: 'Bài đọc nhắc đến cà chua, húng quế (basil) và một vài loại hoa.',
      },
    ],
  },
  {
    id: '9',
    title: 'The Rise of Electric Vehicles',
    level: 'B1',
    topic: 'Công nghệ',
    description:
      'A look at how battery costs, government incentives, and charging infrastructure are accelerating the shift towards electric cars.',
    content:
      'Electric vehicles were once seen as a niche product for environmentally conscious consumers. Today, falling battery costs and expanding charging networks have made them a practical choice for millions of drivers. Government incentives, ranging from tax credits to free parking, have further accelerated adoption in many countries.',
    wordCount: 430,
    minutes: 5,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    questions: [
      {
        id: 'q1',
        question: 'Which factor is NOT mentioned as a driver of EV adoption?',
        options: [
          'Falling battery costs',
          'Expanding charging networks',
          'Government tax incentives',
          'A sudden spike in fuel prices',
        ],
        correctIndex: 3,
        explanation: 'Bài đọc không đề cập đến giá xăng dầu, chỉ nói về chi phí pin, hạ tầng sạc và ưu đãi thuế.',
      },
    ],
  },
]
