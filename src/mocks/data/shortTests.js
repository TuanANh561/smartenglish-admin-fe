export const SHORT_TEST_TYPE_META = {
  toeic_part_6: { label: 'TOEIC Part 6 (Điền đoạn văn)', tone: 'info', color: '#0284c7' },
  toeic_part_7: { label: 'TOEIC Part 7 (Đọc hiểu ngắn)', tone: 'success', color: '#16a34a' },
  reading_short: { label: 'Đọc hiểu đoạn văn ngắn', tone: 'purple', color: '#7c3aed' },
  cloze_paragraph: { label: 'Điền khuyết văn bản', tone: 'warning', color: '#ea580c' },
}

export const mockShortTests = [
  {
    id: 'ST-2001',
    title: 'Office - TOEIC Part 6',
    testType: 'toeic_part_6',
    testTypeLabel: 'TOEIC Part 6 (Điền đoạn văn)',
    level: 'B2',
    durationMinutes: 6,
    authorName: 'Hoàng Thị Mai',
    authorEmail: 'mai.ht@gmail.com',
    status: 'approved',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    passage: `To all staff members,

As you may already know, our headquarters will officially relocate to the downtown business district next month. To ensure a smooth transition, management has prepared several guidelines for all departments.

[131] _____ boxes and packing materials will be distributed to each employee by the end of this week. Please make sure that you label all personal items clearly before packing them. [132] _____ the move may cause temporary disruptions, we are confident that the new facility will greatly enhance our daily operations.

Furthermore, parking permits for the new garage are now [133] _____ at the reception desk. If you have any questions regarding your new workstation, please [134] _____ your supervisor as soon as possible. Thank you for your cooperation and [135] _____ during this exciting period of growth.`,
    questions: [
      {
        id: '131',
        questionNumber: '131',
        questionText: 'Chọn từ thích hợp điền vào vị trí [131]:',
        options: ['Free', 'Heavy', 'Excess', 'Storage'],
        correctAnswer: 'Storage',
        explanationVi: "'Storage boxes' (thùng carton đựng đồ) là cụm danh từ phù hợp nhất trong bối cảnh đóng gói đồ đạc chuyển văn phòng.",
      },
      {
        id: '132',
        questionNumber: '132',
        questionText: 'Chọn liên từ thích hợp điền vào vị trí [132]:',
        options: ['Although', 'Because', 'Therefore', 'In spite of'],
        correctAnswer: 'Although',
        explanationVi: "'Although' (Mặc dù) đứng đầu mệnh đề chỉ sự tương phản: Mặc dù việc chuyển văn phòng có thể gây gián đoạn tạm thời, nhưng tòa nhà mới sẽ nâng cao hiệu suất làm việc.",
      },
      {
        id: '133',
        questionNumber: '133',
        questionText: 'Chọn dạng từ thích hợp điền vào vị trí [133]:',
        options: ['available', 'avail', 'availability', 'availably'],
        correctAnswer: 'available',
        explanationVi: "Sau động từ to-be 'are now', cần một tính từ vị ngữ 'available' (có sẵn / sẵn sàng được nhận).",
      },
      {
        id: '134',
        questionNumber: '134',
        questionText: 'Chọn động từ thích hợp điền vào vị trí [134]:',
        options: ['contact', 'contacted', 'contacting', 'contacts'],
        correctAnswer: 'contact',
        explanationVi: "Sau từ cầu khiến 'please', ta dùng động từ nguyên thể không 'to' (bare infinitive): 'please contact'.",
      },
      {
        id: '135',
        questionNumber: '135',
        questionText: 'Chọn danh từ thích hợp điền vào vị trí [135]:',
        options: ['patience', 'patient', 'patiently', 'patients'],
        correctAnswer: 'patience',
        explanationVi: "Sau liên từ 'and' kết nối với danh từ 'cooperation', ta cần danh từ 'patience' (sự kiên nhẫn).",
      },
    ],
  },
  {
    id: 'ST-2002',
    title: 'Contract - TOEIC Part 6',
    testType: 'toeic_part_6',
    testTypeLabel: 'TOEIC Part 6 (Điền đoạn văn)',
    level: 'B2',
    durationMinutes: 5,
    authorName: 'Hoàng Thị Mai',
    authorEmail: 'mai.ht@gmail.com',
    status: 'approved',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    passage: `Dear Mr. Anderson,

Thank you for agreeing to review the proposed consultancy agreement between NovaTech Solutions and Vertex Logistics.

As discussed in our previous conference call, the contract [131] _____ the scope of advisory services to be rendered over the next six months. Please review the attached draft and [132] _____ any necessary adjustments. Our legal team has already ensured that all compliance regulations are [133] _____ followed.

If all terms meet your satisfaction, kindly sign and return the document by Friday. We look forward to a [134] _____ and mutually beneficial partnership.

Sincerely,
Sarah Jenkins, Legal Counsel`,
    questions: [
      {
        id: '131',
        questionNumber: '131',
        questionText: 'Chọn động từ thích hợp điền vào vị trí [131]:',
        options: ['outlines', 'outlined', 'outlining', 'outline'],
        correctAnswer: 'outlines',
        explanationVi: "Chủ ngữ số ít 'the contract' đi với động từ hiện tại đơn chia ngôi thứ 3 số ít 'outlines' (nêu rõ/phác thảo).",
      },
      {
        id: '132',
        questionNumber: '132',
        questionText: 'Chọn động từ thích hợp điền vào vị trí [132]:',
        options: ['propose', 'proposed', 'proposing', 'proposal'],
        correctAnswer: 'propose',
        explanationVi: "Cấu trúc song song sau 'Please review... and [propose]...': dùng động từ nguyên thể thức mệnh lệnh.",
      },
      {
        id: '133',
        questionNumber: '133',
        questionText: 'Chọn trạng từ thích hợp điền vào vị trí [133]:',
        options: ['strictly', 'strictness', 'strict', 'strictest'],
        correctAnswer: 'strictly',
        explanationVi: "Cần một trạng từ 'strictly' (nghiêm ngặt) để bổ nghĩa cho phân từ hai 'followed' trong cấu trúc bị động.",
      },
      {
        id: '134',
        questionNumber: '134',
        questionText: 'Chọn tính từ thích hợp điền vào vị trí [134]:',
        options: ['productive', 'productively', 'produce', 'productivity'],
        correctAnswer: 'productive',
        explanationVi: "Đứng trước danh từ 'partnership' và song song với tính từ 'mutually beneficial', ta cần tính từ 'productive'.",
      },
    ],
  },
  {
    id: 'ST-2003',
    title: 'Customer Service Feedback - TOEIC Part 7',
    testType: 'toeic_part_7',
    testTypeLabel: 'TOEIC Part 7 (Đọc hiểu ngắn)',
    level: 'B1',
    durationMinutes: 4,
    authorName: 'Hệ thống SmartEnglish',
    authorEmail: 'system@smartenglish.vn',
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    passage: `Customer Survey Response
Customer Name: Kevin Ramirez
Order Number: #KR-9824
Date of Purchase: March 12
Product: Ergonomic Mesh Office Chair

Rating: 4 out of 5 stars
Comments:
"The chair itself is remarkably comfortable and has made a noticeable difference in reducing lower back strain during long work shifts. Delivery was prompt, arriving two business days ahead of schedule. My only grievance is regarding the assembly instructions, which contained low-resolution diagrams that made attaching the armrests confusing. Better illustrations or a QR link to an instructional video would be a welcome improvement."`,
    questions: [
      {
        id: '1',
        questionNumber: '1',
        questionText: 'What did Mr. Ramirez appreciate most about the product?',
        options: [
          'Its affordable price',
          'Its ergonomic comfort during work',
          'Its colorful appearance',
          'Its simple assembly process',
        ],
        correctAnswer: 'Its ergonomic comfort during work',
        explanationVi: "Khách hàng nhận xét: 'The chair itself is remarkably comfortable and has made a noticeable difference in reducing lower back strain'.",
      },
      {
        id: '2',
        questionNumber: '2',
        questionText: 'What criticism did the customer express?',
        options: [
          'Delivery arrived significantly late',
          'The armrests were missing from the package',
          'The assembly manual was unclear and poorly illustrated',
          'The chair broke shortly after setup',
        ],
        correctAnswer: 'The assembly manual was unclear and poorly illustrated',
        explanationVi: "Khách hàng phàn nàn về 'assembly instructions, which contained low-resolution diagrams that made attaching the armrests confusing'.",
      },
      {
        id: '3',
        questionNumber: '3',
        questionText: 'What suggestion does Mr. Ramirez provide?',
        options: [
          'Lowering the delivery charges',
          'Providing a QR link to a video tutorial',
          'Offering a replacement chair',
          'Extending the warranty duration',
        ],
        correctAnswer: 'Providing a QR link to a video tutorial',
        explanationVi: "Khách hàng gợi ý: 'Better illustrations or a QR link to an instructional video would be a welcome improvement.'",
      },
    ],
  },
  {
    id: 'ST-2004',
    title: 'Remote Work Security Policy - Internal Memo',
    testType: 'reading_short',
    testTypeLabel: 'Đọc hiểu đoạn văn ngắn',
    level: 'B2',
    durationMinutes: 5,
    authorName: 'Vũ Đức Thắng',
    authorEmail: 'thang.vd@gmail.com',
    status: 'approved',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    passage: `MEMORANDUM
To: All Telecommuting Employees
From: IT Cybersecurity Division
Date: August 14
Subject: Mandatory Two-Factor Authentication (2FA) Protocol

Effective September 1st, all personnel accessing the corporate VPN and internal customer databases from remote locations must activate multi-factor authentication via the Duo Mobile application.

Employees using public Wi-Fi networks in airports, cafes, or hotels are strictly required to keep the enterprise VPN engaged continuously. Failure to comply with these security precautions may lead to temporary credential suspension pending security audit review. IT representatives will host live orientation sessions every Wednesday at 10:00 AM to assist with device configuration.`,
    questions: [
      {
        id: '1',
        questionNumber: '1',
        questionText: 'What is the primary requirement stated in the memo?',
        options: [
          'Purchasing new corporate laptop hardware',
          'Enabling two-factor authentication for remote access',
          'Stopping all telecommuting immediately',
          'Changing corporate passwords every Monday',
        ],
        correctAnswer: 'Enabling two-factor authentication for remote access',
        explanationVi: "Bản ghi nhớ yêu cầu bắt buộc: 'must activate multi-factor authentication via the Duo Mobile application'.",
      },
      {
        id: '2',
        questionNumber: '2',
        questionText: 'When will the mandatory policy take effect?',
        options: ['Immediately on August 14', 'On September 1st', 'By the end of the year', 'After attending an IT session'],
        correctAnswer: 'On September 1st',
        explanationVi: "Văn bản nêu rõ: 'Effective September 1st, all personnel...'",
      },
      {
        id: '3',
        questionNumber: '3',
        questionText: 'What consequence is mentioned for non-compliance?',
        options: [
          'Immediate termination of employment',
          'Temporary suspension of login credentials',
          'Financial deduction from monthly bonus',
          'Requirement to buy a hardware token',
        ],
        correctAnswer: 'Temporary suspension of login credentials',
        explanationVi: "Câu cuối đoạn 2 nêu: 'may lead to temporary credential suspension pending security audit review.'",
      },
    ],
  },
  {
    id: 'ST-2005',
    title: 'Green Tech Innovation - Cloze Paragraph',
    testType: 'cloze_paragraph',
    testTypeLabel: 'Điền khuyết văn bản',
    level: 'C1',
    durationMinutes: 5,
    authorName: 'Hoàng Thị Mai',
    authorEmail: 'mai.ht@gmail.com',
    status: 'approved',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    passage: `Solar power technology has undergone remarkable advancements over the past decade. Modern photovoltaic panels now [1] _____ energy at higher efficiencies while costing significantly less to manufacture. Consequently, municipal governments are [2] _____ integrating solar arrays into metropolitan infrastructure. Experts anticipate that sustained investment in renewable storage systems will [3] _____ stabilize power grids against extreme weather disruptions in the coming years.`,
    questions: [
      {
        id: '1',
        questionNumber: '1',
        questionText: 'Chọn động từ thích hợp cho vị trí [1]:',
        options: ['convert', 'converting', 'converted', 'converter'],
        correctAnswer: 'convert',
        explanationVi: "Chủ ngữ số nhiều 'photovoltaic panels' đi với động từ nguyên thể 'convert' (chuyển đổi).",
      },
      {
        id: '2',
        questionNumber: '2',
        questionText: 'Chọn trạng từ thích hợp cho vị trí [2]:',
        options: ['progressively', 'progressive', 'progression', 'progress'],
        correctAnswer: 'progressively',
        explanationVi: "Vị trí nằm giữa trợ động từ 'are' và hiện tại phân từ 'integrating' cần một phó từ: 'progressively' (từng bước, ngày càng).",
      },
      {
        id: '3',
        questionNumber: '3',
        questionText: 'Chọn động từ thích hợp cho vị trí [3]:',
        options: ['effectively', 'substantially', 'substance', 'substantial'],
        correctAnswer: 'substantially',
        explanationVi: "Cần phó từ 'substantially' (đáng kể) đứng trước động từ 'stabilize' để bổ nghĩa.",
      },
    ],
  },
]
