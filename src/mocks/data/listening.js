export const listeningLessons = [
  {
    id: '1',
    title: 'Client Presentation Prep',
    description:
      'Alex and Sarah review quarterly revenue slides and prepare responses for key enterprise clients before the meeting.',
    transcript:
      "Alex: Did you finalize the revenue forecast slides for this afternoon's meeting?\nSarah: Yes, I added the quarterly growth charts and highlighted our top three enterprise clients.\nAlex: Great, let's also prepare quick answers in case they ask about delivery timelines.\nSarah: Don't worry, our deployment schedule is already detailed in the appendix.",
    level: 'B2 Upper Int.',
    accent: 'US Accent',
    topic: 'Kinh doanh',
    status: 'ready',
    duration: '00:35',
    authorName: 'Hoàng Thị Mai',
    authorEmail: 'mai.ht@gmail.com',
    waveform: [6, 14, 10, 20, 16, 22, 12, 18, 9, 24, 14, 8, 17, 11, 20],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    questions: [
      {
        question: 'What did Sarah add to the presentation slides?',
        options: ['Quarterly growth charts', 'New pricing packages', 'Competitor analysis', 'Client contract copies'],
        correctIndex: 0,
        explanation: 'Sarah confirms that she added quarterly growth charts and highlighted top enterprise clients.',
      },
      {
        question: 'Where can the client find information about the delivery schedule?',
        options: ['In the introduction', 'In the appendix', 'On the company website', 'In the email attachment'],
        correctIndex: 1,
        explanation: 'Sarah states that the deployment schedule is already detailed in the appendix.',
      },
    ],
  },
  {
    id: '2',
    title: 'Ordering at a Cafe',
    description:
      'A customer orders an iced caramel macchiato with oat milk and discusses pastry options with the barista.',
    transcript:
      'Barista: Good morning! Welcome to Central Cafe. What can I get for you today?\nCustomer: Hi, could I please have an iced caramel macchiato with oat milk?\nBarista: Sure thing! Would you like a freshly baked croissant or chocolate muffin with that?\nCustomer: Just the coffee for today, thanks! Could I also have a receipt?\nBarista: Absolutely, here is your receipt and number seven. Your drink will be ready at the counter.',
    level: 'A2 Pre-Int.',
    accent: 'UK Accent',
    topic: 'Đời sống',
    status: 'review',
    duration: '00:30',
    authorName: 'Hệ thống SmartEnglish',
    authorEmail: 'system@smartenglish.vn',
    waveform: [8, 16, 9, 12, 20, 7, 15, 10, 6, 13],
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    questions: [
      {
        question: 'What type of milk did the customer request?',
        options: ['Whole milk', 'Almond milk', 'Oat milk', 'Soy milk'],
        correctIndex: 2,
        explanation: 'The customer specifically asked for an iced caramel macchiato with oat milk.',
      },
    ],
  },
  {
    id: '3',
    title: 'Airport Check-in Conversation',
    description:
      'A traveler checks in for a flight to London Heathrow, confirms baggage allowance, and checks gate boarding status.',
    transcript:
      'Agent: Good afternoon. May I please see your passport and flight booking reference?\nPassenger: Here you go. I am flying to London Heathrow on flight BA two hundred.\nAgent: Thank you. Do you have any check-in baggage or only this carry-on bag?\nPassenger: Just this suitcase. Is my flight boarding at gate twelve on time?\nAgent: Yes, on schedule! Boarding begins in forty-five minutes. Have a pleasant flight.',
    level: 'B1 Intermediate',
    accent: 'US Accent',
    topic: 'Du lịch',
    status: 'ready',
    duration: '00:35',
    authorName: 'Hoàng Thị Mai',
    authorEmail: 'mai.ht@gmail.com',
    waveform: [12, 18, 7, 21, 15, 9, 19, 11, 23, 14, 8, 17],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    questions: [
      {
        question: 'Where is the passenger traveling to?',
        options: ['New York', 'London Heathrow', 'Paris Charles de Gaulle', 'Tokyo Haneda'],
        correctIndex: 1,
        explanation: 'The passenger mentions flying to London Heathrow.',
      },
    ],
  },
  {
    id: '4',
    title: 'Job Interview Basics',
    description:
      'A software project manager introduces their professional background, strengths, and experience solving bottlenecks in an interview.',
    transcript:
      'Interviewer: Could you briefly tell me about your background and greatest professional strength?\nCandidate: Certainly. I have four years of experience managing software projects and collaborating across diverse engineering teams.\nInterviewer: How do you handle unexpected delivery delays and team friction?\nCandidate: I thrive under pressure by facilitating open communication and quickly reprioritizing tasks to resolve bottlenecks.',
    level: 'B2 Upper Int.',
    accent: 'Australian Accent',
    topic: 'Kinh doanh',
    status: 'review',
    duration: '00:35',
    authorName: 'Vũ Đức Thắng',
    authorEmail: 'thang.vd@gmail.com',
    waveform: [10, 22, 14, 8, 19, 13, 25, 9, 16, 12, 20, 7, 18],
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    questions: [
      {
        question: 'How many years of software project management experience does the candidate have?',
        options: ['Two years', 'Three years', 'Four years', 'Five years'],
        correctIndex: 2,
        explanation: 'The candidate says: "I have four years of experience managing software projects".',
      },
    ],
  },
  {
    id: '5',
    title: 'Weather Forecast Report',
    description:
      'A meteorologist broadcasts the weekly urban forecast, covering mid-week rain showers and pleasant weekend sunshine.',
    transcript:
      'Narrator: Good morning, this is your local weekly weather update.\nSpeaker: Expect mild temperatures and scattered showers throughout Tuesday and Wednesday morning.\nSpeaker: Pleasant sunshine will return by Thursday afternoon with comfortable highs around twenty-two degrees Celsius.\nNarrator: Remember to carry an umbrella if you are heading downtown today.',
    level: 'A1 Beginner',
    accent: 'UK Accent',
    topic: 'Đời sống',
    status: 'ready',
    duration: '00:25',
    authorName: 'Hệ thống SmartEnglish',
    authorEmail: 'system@smartenglish.vn',
    waveform: [5, 9, 13, 7, 11, 6, 15, 8],
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
    questions: [
      {
        question: 'What will the weather be like on Thursday afternoon?',
        options: ['Heavy thunderstorms', 'Snow flurries', 'Pleasant sunshine', 'Extreme cold wind'],
        correctIndex: 2,
        explanation: 'The report states: "Pleasant sunshine will return by Thursday afternoon".',
      },
    ],
  },
  {
    id: '6',
    title: 'Hotel Reservation & Room Service',
    description:
      'A guest in suite 402 orders late-night dining and drinks from hotel room service with estimated delivery time.',
    transcript:
      'Front Desk: Good evening, Grand Plaza Hotel guest services. How may I assist you tonight?\nGuest: Hello, I would like to order room service for suite four hundred and two, please.\nFront Desk: Certainly, sir. What would you like to have from our night dining menu?\nGuest: Could we get two club sandwiches, a fresh garden salad, and hot green tea?\nFront Desk: Of course. That will be freshly prepared and delivered to your door in twenty minutes.',
    level: 'B1 Intermediate',
    accent: 'US Accent',
    topic: 'Du lịch',
    status: 'ready',
    duration: '00:30',
    authorName: 'Hoàng Thị Mai',
    authorEmail: 'mai.ht@gmail.com',
    waveform: [7, 12, 18, 11, 14, 19, 10, 16, 13, 21, 15, 8],
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    questions: [
      {
        question: 'Which suite did the guest call from?',
        options: ['Suite 204', 'Suite 302', 'Suite 402', 'Suite 501'],
        correctIndex: 2,
        explanation: 'The guest states: "I would like to order room service for suite four hundred and two".',
      },
    ],
  },
]

export const LISTENING_TOPICS = ['Kinh doanh', 'Đời sống', 'Du lịch']
export const LISTENING_ACCENTS = ['US Accent', 'UK Accent', 'Australian Accent']
export const LISTENING_LEVELS = ['A1 Beginner', 'A2 Pre-Int.', 'B1 Intermediate', 'B2 Upper Int.']
