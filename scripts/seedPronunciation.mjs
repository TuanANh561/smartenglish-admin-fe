/**
 * Seed script: Đổ dữ liệu mẫu bài học phát âm IPA chuẩn chỉnh vào content-service DB
 * API: POST http://localhost:8082/admin/pronunciation-lessons
 */

const SEED_LESSONS = [
  {
    title: 'Mastering the Schwa Sound /ə/',
    ipaSymbol: '/ə/',
    category: 'Vowels',
    cefrLevel: 'B1',
    description: 'Âm Schwa /ə/ là âm phổ biến nhất trong tiếng Anh, luôn xuất hiện ở âm tiết không mang trọng âm.',
    mouthShapeGuide: 'Thả lỏng toàn bộ cơ mặt, môi hơi mở tự nhiên, lưỡi nằm ở vị trí trung tâm trong khoang miệng.',
    aiMinScoreThreshold: 85,
    sampleWords: [
      { word: 'About', ipa: '/əˈbaʊt/', meaning: 'Về, khoảng' },
      { word: 'Banana', ipa: '/bəˈnæn.ə/', meaning: 'Quả chuối' },
      { word: 'Doctor', ipa: '/ˈdɒk.tər/', meaning: 'Bác sĩ' },
      { word: 'Support', ipa: '/səˈpɔːt/', meaning: 'Hỗ trợ' },
    ],
    sampleSentences: [
      { text: 'A cup of tea and a banana for breakfast.', ipa: '/ə kʌp əv tiː ənd ə bəˈnænə fə ˈbrekfəst/' },
      { text: 'The teacher explained the problem to the students.', ipa: '/ðə ˈtiːtʃə rɪkˈspleɪnd ðə ˈprɒbləm tə ðə ˈstjuːdənts/' },
    ],
    status: 'published',
    authorName: 'Hoàng Thị Mai',
    authorEmail: 'hoangthimai@smartenglish.vn',
  },
  {
    title: 'Voiced vs Voiceless Consonants: /s/ & /z/',
    ipaSymbol: '/s/ - /z/',
    category: 'Consonants',
    cefrLevel: 'A2',
    description: 'Phân biệt âm vô thanh /s/ (không rung dây thanh quản) và âm hữu thanh /z/ (rung dây thanh quản) trong đuôi -s/-es.',
    mouthShapeGuide: 'Hai hàm răng khép hờ, đầu lưỡi đặt gần chân răng cửa trên, đẩy luồng hơi qua khe hẹp.',
    aiMinScoreThreshold: 80,
    sampleWords: [
      { word: 'Bus', ipa: '/bʌs/', meaning: 'Xe buýt (/s/ vô thanh)' },
      { word: 'Buzz', ipa: '/bʌz/', meaning: 'Tiếng vo ve (/z/ hữu thanh)' },
      { word: 'Peace', ipa: '/piːs/', meaning: 'Hòa bình' },
      { word: 'Peas', ipa: '/piːz/', meaning: 'Hạt đậu' },
    ],
    sampleSentences: [
      { text: 'Sue saw six silly swans swimming slowly.', ipa: '/suː sɔː sɪks ˈsɪli swɒnz ˈswɪmɪŋ ˈsləʊli/' },
    ],
    status: 'published',
    authorName: 'Trần Thị Bích',
    authorEmail: 'tranthib@smartenglish.vn',
  },
  {
    title: 'Vowel Contrast: Short /ɪ/ vs Long /iː/',
    ipaSymbol: '/ɪ/ - /iː/',
    category: 'Vowels',
    cefrLevel: 'A1',
    description: 'Phân biệt cặp âm dễ gây nhầm lẫn nhất: /ɪ/ (ngắn, dứt khoát) và /iː/ (kéo dài, khóe môi kéo sang 2 bên như đang cười).',
    mouthShapeGuide: 'Với /iː/: miệng kéo sang 2 bên, lưỡi đưa cao lên phía trước. Với /ɪ/: miệng thả lỏng hơn, phát âm nhanh.',
    aiMinScoreThreshold: 85,
    sampleWords: [
      { word: 'Ship', ipa: '/ʃɪp/', meaning: 'Con tàu' },
      { word: 'Sheep', ipa: '/ʃiːp/', meaning: 'Con cừu' },
      { word: 'Sit', ipa: '/sɪt/', meaning: 'Ngồi' },
      { word: 'Seat', ipa: '/siːt/', meaning: 'Chỗ ngồi' },
      { word: 'Live', ipa: '/lɪv/', meaning: 'Sống' },
      { word: 'Leave', ipa: '/liːv/', meaning: 'Rời đi' },
    ],
    sampleSentences: [
      { text: 'Please sit on this seat and eat some cheese.', ipa: '/pliːz sɪt ɒn ðɪs siːt ənd iːt səm tʃiːz/' },
    ],
    status: 'published',
    authorName: 'Nguyễn Văn An',
    authorEmail: 'nguyenvana@smartenglish.vn',
  },
  {
    title: 'Dental Fricatives: /θ/ (think) vs /ð/ (this)',
    ipaSymbol: '/θ/ - /ð/',
    category: 'Consonants',
    cefrLevel: 'B1',
    description: 'Luyện âm "th" chuẩn xác, khắc phục lỗi phổ biến của người Việt hay phát âm thành /t/ hoặc /d/.',
    mouthShapeGuide: 'Đưa đầu lưỡi ra giữa hai hàm răng trên và dưới, nhẹ nhàng đẩy hơi ra.',
    aiMinScoreThreshold: 80,
    sampleWords: [
      { word: 'Think', ipa: '/θɪŋk/', meaning: 'Suy nghĩ (/θ/ vô thanh)' },
      { word: 'This', ipa: '/ðɪs/', meaning: 'Cái này (/ð/ hữu thanh)' },
      { word: 'Three', ipa: '/θriː/', meaning: 'Số 3' },
      { word: 'Mother', ipa: '/ˈmʌð.ər/', meaning: 'Mẹ' },
      { word: 'Breathe', ipa: '/briːð/', meaning: 'Thở' },
      { word: 'Breath', ipa: '/breθ/', meaning: 'Hơi thở' },
    ],
    sampleSentences: [
      { text: 'They thought that these three brothers were thirty.', ipa: '/ðeɪ θɔːt ðæt ðiːz θriː ˈbrʌðəz wɜː ˈθɜːti/' },
    ],
    status: 'published',
    authorName: 'Vũ Đức Thắng',
    authorEmail: 'vuducthang@smartenglish.vn',
  },
  {
    title: 'Diphthongs: /aɪ/, /eɪ/, and /ɔɪ/',
    ipaSymbol: '/aɪ/, /eɪ/, /ɔɪ/',
    category: 'Diphthongs',
    cefrLevel: 'A2',
    description: 'Quy tắc lướt âm mượt mà giữa các nguyên âm đôi kết thúc bằng âm /ɪ/.',
    mouthShapeGuide: 'Bắt đầu từ âm thứ nhất với độ mở lớn hơn, sau đó lướt nhẹ nhàng sang vị trí phát âm /ɪ/.',
    aiMinScoreThreshold: 85,
    sampleWords: [
      { word: 'Time', ipa: '/taɪm/', meaning: 'Thời gian (/aɪ/)' },
      { word: 'Face', ipa: '/feɪs/', meaning: 'Khuôn mặt (/eɪ/)' },
      { word: 'Voice', ipa: '/vɔɪs/', meaning: 'Giọng nói (/ɔɪ/)' },
      { word: 'Great', ipa: '/ɡreɪt/', meaning: 'Tuyệt vời' },
    ],
    sampleSentences: [
      { text: 'The boy enjoyed the bright sunshine on the lake.', ipa: '/ðə bɔɪ ɪnˈdʒɔɪd ðə braɪt ˈsʌnʃaɪn ɒn ðə leɪk/' },
    ],
    status: 'published',
    authorName: 'Lexoria Academic Team',
    authorEmail: 'academic@smartenglish.vn',
  },
  {
    title: 'Word Stress Rules in Multi-syllable Words',
    ipaSymbol: 'ˈ (Primary Stress)',
    category: 'Stress',
    cefrLevel: 'B2',
    description: 'Quy tắc xác định trọng âm cho từ 2, 3 và 4 âm tiết dựa trên hậu tố (-tion, -ic, -ity, -ate).',
    mouthShapeGuide: 'Âm tiết mang trọng âm phát âm to hơn, cao hơn và ngân dài hơn các âm tiết còn lại.',
    aiMinScoreThreshold: 88,
    sampleWords: [
      { word: 'Photograph', ipa: '/ˈfəʊ.tə.ɡrɑːf/', meaning: 'Bức ảnh (Trọng âm 1)' },
      { word: 'Photographer', ipa: '/fəˈtɒɡ.rə.fər/', meaning: 'Nhiếp ảnh gia (Trọng âm 2)' },
      { word: 'Photographic', ipa: '/ˌfəʊ.təˈɡræf.ɪk/', meaning: 'Thuộc nhiếp ảnh (Trọng âm 3)' },
      { word: 'Economic', ipa: '/ˌiː.kəˈnɒm.ɪk/', meaning: 'Kinh tế' },
    ],
    sampleSentences: [
      { text: 'The photographer took a remarkable economic photograph.', ipa: '/ðə fəˈtɒɡrəfə tʊk ə rɪˈmɑːkəbl ˌiːkəˈnɒmɪk ˈfəʊtəɡrɑːf/' },
    ],
    status: 'published',
    authorName: 'Hoàng Thị Mai',
    authorEmail: 'hoangthimai@smartenglish.vn',
  },
  {
    title: 'Intonation: Wh- Questions vs Yes/No Questions',
    ipaSymbol: '↘ Falling / ↗ Rising',
    category: 'Intonation',
    cefrLevel: 'B1',
    description: 'Ngữ điệu đi xuống (Falling intonation) trong câu hỏi Wh- và ngữ điệu đi lên (Rising intonation) trong câu hỏi Yes/No.',
    mouthShapeGuide: 'Điều chỉnh cao độ giọng nói: lên giọng ở âm tiết cuối của câu Yes/No, hạ giọng dứt khoát ở cuối câu Wh-.',
    aiMinScoreThreshold: 82,
    sampleWords: [
      { word: 'Are you ready? ↗', ipa: '/ɑː juː ˈredi/', meaning: 'Lên giọng cuối câu Yes/No' },
      { word: 'Where are you going? ↘', ipa: '/weər ɑː juː ˈɡəʊɪŋ/', meaning: 'Xuống giọng cuối câu Wh-' },
    ],
    sampleSentences: [
      { text: 'Do you like coffee? — No, what kind of tea do you have?', ipa: '/duː juː laɪk ˈkɒfi ↗ — nəʊ, wɒt kaɪnd əv tiː duː juː hæv ↘/' },
    ],
    status: 'published',
    authorName: 'Trần Thị Bích',
    authorEmail: 'tranthib@smartenglish.vn',
  },
  {
    title: 'Connected Speech: Consonant-to-Vowel Linking',
    ipaSymbol: '‿ Linking',
    category: 'Connected Speech',
    cefrLevel: 'B2',
    description: 'Nối phụ âm cuối của từ trước với nguyên âm đầu của từ tiếp theo (ví dụ: "turn off" -> "tur-noff").',
    mouthShapeGuide: 'Không ngắt hơi giữa hai từ, phát âm liền mạch như một từ duy nhất.',
    aiMinScoreThreshold: 85,
    sampleWords: [
      { word: 'Hold on', ipa: '/həʊld‿ɒn/', meaning: 'Chờ một chút' },
      { word: 'Pick it up', ipa: '/pɪk‿ɪt‿ʌp/', meaning: 'Nhặt nó lên' },
      { word: 'Not at all', ipa: '/nɒt‿ət‿ɔːl/', meaning: 'Không có chi' },
    ],
    sampleSentences: [
      { text: 'Can I have an apple and an orange, please?', ipa: '/kæn‿aɪ hæv‿ən‿ˈæpl ənd‿ən‿ˈɒrɪndʒ pliːz/' },
    ],
    status: 'published',
    authorName: 'Vũ Đức Thắng',
    authorEmail: 'vuducthang@smartenglish.vn',
  },
  {
    title: 'Vowel Contrast: /æ/ (cat) vs /ʌ/ (cup)',
    ipaSymbol: '/æ/ - /ʌ/',
    category: 'Vowels',
    cefrLevel: 'A2',
    description: 'Phân biệt âm /æ/ (miệng mở rộng hình chữ nhật) và âm /ʌ/ (miệng mở vừa, âm phát ra từ cuống họng ngắn).',
    mouthShapeGuide: 'Với /æ/: cằm hạ sâu, khóe miệng căng sang hai bên. Với /ʌ/: thả lỏng cơ miệng, mở tự nhiên.',
    aiMinScoreThreshold: 85,
    sampleWords: [
      { word: 'Cat', ipa: '/kæt/', meaning: 'Con mèo' },
      { word: 'Cut', ipa: '/kʌt/', meaning: 'Cắt' },
      { word: 'Hat', ipa: '/hæt/', meaning: 'Cái mũ' },
      { word: 'Hut', ipa: '/hʌt/', meaning: 'Túp lều' },
      { word: 'Cap', ipa: '/kæp/', meaning: 'Mũ lưỡi trai' },
      { word: 'Cup', ipa: '/kʌp/', meaning: 'Cái cốc' },
    ],
    sampleSentences: [
      { text: 'The cat in the hat ran after the cup of nuts.', ipa: '/ðə kæt ɪn ðə hæt ræn ˈɑːftə ðə kʌp əv nʌts/' },
    ],
    status: 'published',
    authorName: 'Nguyễn Văn An',
    authorEmail: 'nguyenvana@smartenglish.vn',
  },
  {
    title: 'Flap /t/ & Glottal Stop in American & British English',
    ipaSymbol: '[ɾ] vs [ʔ]',
    category: 'Consonants',
    cefrLevel: 'C1',
    description: 'Phân tích âm Flap /t/ (âm vỗ nhẹ thành /d/ trong tiếng Anh Mỹ như water, butter) và Glottal stop [ʔ] trong tiếng Anh Anh.',
    mouthShapeGuide: 'Đầu lưỡi chạm rất nhanh vào vòm miệng trên rồi nhả ra ngay lập tức mà không chặn hơi hoàn toàn.',
    aiMinScoreThreshold: 85,
    sampleWords: [
      { word: 'Water', ipa: 'US: /ˈwɑː.t̬ɚ/ | UK: /ˈwɔː.tər/', meaning: 'Nước' },
      { word: 'Butter', ipa: 'US: /ˈbʌt̬.ɚ/ | UK: /ˈbʌt.ər/', meaning: 'Bơ' },
      { word: 'City', ipa: 'US: /ˈsɪt̬.i/ | UK: /ˈsɪt.i/', meaning: 'Thành phố' },
      { word: 'Bottle', ipa: 'US: /ˈbɑː.t̬əl/ | UK: /ˈbɒt.əl/', meaning: 'Chai lọ' },
    ],
    sampleSentences: [
      { text: 'A little bottle of water in the city center.', ipa: '/ə ˈlɪt̬l ˈbɑːt̬l əv ˈwɑːt̬ɚ ɪn ðə ˈsɪt̬i ˈsent̬ɚ/' },
    ],
    status: 'published',
    authorName: 'Lexoria Academic Team',
    authorEmail: 'academic@smartenglish.vn',
  },
  {
    title: 'Consonant Pairs: /ʃ/ (shoe) vs /tʃ/ (chair)',
    ipaSymbol: '/ʃ/ - /tʃ/',
    category: 'Consonants',
    cefrLevel: 'A2',
    description: 'Phân biệt âm xát /ʃ/ (kéo dài, chu môi thổi hơi êm) và âm tắc xát /tʃ/ (chặn hơi lại bằng đầu lưỡi rồi bật mạnh ra dứt khoát).',
    mouthShapeGuide: 'Với /ʃ/: chu môi tròn, luồng hơi thoát ra liên tục như tiếng ra hiệu im lặng "suỵt". Với /tʃ/: đầu lưỡi ép chặt vòm họng trên rồi bật mạnh ra.',
    aiMinScoreThreshold: 80,
    sampleWords: [
      { word: 'Share', ipa: '/ʃeər/', meaning: 'Chia sẻ' },
      { word: 'Chair', ipa: '/tʃeər/', meaning: 'Cái ghế' },
      { word: 'Ship', ipa: '/ʃɪp/', meaning: 'Tàu bè' },
      { word: 'Chip', ipa: '/tʃɪp/', meaning: 'Khoai tây chiên / chip' },
      { word: 'Wash', ipa: '/wɒʃ/', meaning: 'Rửa, giặt' },
      { word: 'Watch', ipa: '/wɒtʃ/', meaning: 'Xem, đồng hồ' },
    ],
    sampleSentences: [
      { text: 'She sat on the chair and ate some fish and chips.', ipa: '/ʃi sæt ɒn ðə tʃeər ənd et səm fɪʃ ənd tʃɪps/' },
    ],
    status: 'published',
    authorName: 'Hoàng Thị Mai',
    authorEmail: 'hoangthimai@smartenglish.vn',
  },
  {
    title: 'Ending Sounds: /t/, /d/, and /ɪd/ in Past Tense (-ed)',
    ipaSymbol: '-ed Endings',
    category: 'Connected Speech',
    cefrLevel: 'A2',
    description: 'Quy tắc phát âm đuôi -ed trong quá khứ đơn: bật /t/ sau âm vô thanh, bật /d/ sau âm hữu thanh và bật /ɪd/ sau âm /t/ hoặc /d/.',
    mouthShapeGuide: 'Cần chú ý rung dây thanh quản hay không ở âm cuối cùng của động từ nguyên mẫu trước khi phát âm đuôi -ed.',
    aiMinScoreThreshold: 82,
    sampleWords: [
      { word: 'Looked', ipa: '/lʊkt/', meaning: 'Đã nhìn (Đuôi /t/)' },
      { word: 'Played', ipa: '/pleɪd/', meaning: 'Đã chơi (Đuôi /d/)' },
      { word: 'Wanted', ipa: '/ˈwɒntɪd/', meaning: 'Đã muốn (Đuôi /ɪd/)' },
      { word: 'Decided', ipa: '/dɪˈsaɪdɪd/', meaning: 'Đã quyết định (Đuôi /ɪd/)' },
    ],
    sampleSentences: [
      { text: 'He started the car, looked around, and stopped at the light.', ipa: '/hi ˈstɑːtɪd ðə kɑː, lʊkt əˈraʊnd, ənd stɒpt ət ðə laɪt/' },
    ],
    status: 'published',
    authorName: 'Nguyễn Văn An',
    authorEmail: 'nguyenvana@smartenglish.vn',
  },
]

async function seedData() {
  console.log(`🚀 Bắt đầu đổ ${SEED_LESSONS.length} bài học phát âm mẫu vào content-service...`)
  let successCount = 0

  for (const lesson of SEED_LESSONS) {
    try {
      const response = await fetch('http://localhost:8082/admin/pronunciation-lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lesson),
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`✅ [${result?.data?.id || 'OK'}] Thêm thành công: ${lesson.title}`)
        successCount++
      } else {
        const errorText = await response.text()
        console.error(`❌ [${response.status}] Thất bại bài: ${lesson.title} - ${errorText}`)
      }
    } catch (err) {
      console.error(`❌ Lỗi kết nối khi thêm ${lesson.title}:`, err.message)
    }
  }

  console.log(`\n🎉 Hoàn thành! Đã nạp thành công ${successCount}/${SEED_LESSONS.length} bài học phát âm IPA vào cơ sở dữ liệu.`)
}

seedData()
