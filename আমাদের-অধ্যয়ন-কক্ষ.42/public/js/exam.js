/**
 * @license
 * Dynamic Exam Management System for Our Reading Room (আমাদের স্টাডি রুম)
 * Bengali Medical & Engineering Prep Exam Portal
 */

(function () {
  'use strict';

  // 1. Predefined Subjects matching reference image gradients & titles
  const DEFAULT_SUBJECTS = [
    {
      id: 'phy1',
      titleBn: 'পদার্থবিজ্ঞান ১ম পত্র',
      titleEn: 'Physics 1st Paper',
      tag: 'এইচএসসি ও ভর্তি পরীক্ষা',
      gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)',
      chapters: [
        { id: 'phy1_ch1', num: 1, name: 'ভৌত জগৎ ও পরিমাপ' },
        { id: 'phy1_ch2', num: 2, name: 'ভেক্টর' },
        { id: 'phy1_ch3', num: 3, name: 'গতিবিদ্যা' },
        { id: 'phy1_ch4', num: 4, name: 'নিউটনীয় বলবিদ্যা' },
        { id: 'phy1_ch5', num: 5, name: 'কাজ, শক্তি ও ক্ষমতা' },
        { id: 'phy1_ch8', num: 8, name: 'পর্যায়বৃত্ত গতি' }
      ]
    },
    {
      id: 'phy2',
      titleBn: 'পদার্থবিজ্ঞান ২য় পত্র',
      titleEn: 'Physics 2nd Paper',
      tag: 'এইচএসসি ও ভর্তি পরীক্ষা',
      gradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #115e59 100%)',
      chapters: [
        { id: 'phy2_ch1', num: 1, name: 'তাপগতিবিদ্যা' },
        { id: 'phy2_ch2', num: 2, name: 'স্থির তড়িৎ' },
        { id: 'phy2_ch3', num: 3, name: 'চল তড়িৎ' },
        { id: 'phy2_ch7', num: 7, name: 'ভৌত আলোকবিজ্ঞান' },
        { id: 'phy2_ch8', num: 8, name: 'আধুনিক পদার্থবিজ্ঞান' }
      ]
    },
    {
      id: 'chem1',
      titleBn: 'রসায়ন ১ম পত্র',
      titleEn: 'Chemistry 1st Paper',
      tag: 'মেডিকেল ও ভার্সিটি',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
      chapters: [
        { id: 'chem1_ch1', num: 1, name: 'ল্যাবরেটরির নিরাপদ ব্যবহার' },
        { id: 'chem1_ch2', num: 2, name: 'গুণগত রসায়ন' },
        { id: 'chem1_ch3', num: 3, name: 'মৌলের পর্যায়বৃত্ত ধর্ম' },
        { id: 'chem1_ch4', num: 4, name: 'রাসায়নিক পরিবর্তন' }
      ]
    },
    {
      id: 'chem2',
      titleBn: 'রসায়ন ২য় পত্র',
      titleEn: 'Chemistry 2nd Paper',
      tag: 'মেডিকেল ও ভার্সিটি',
      gradient: 'linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #1d4ed8 100%)',
      chapters: [
        { id: 'chem2_ch1', num: 1, name: 'পরিবেশ রসায়ন' },
        { id: 'chem2_ch2', num: 2, name: 'জৈব রসায়ন' },
        { id: 'chem2_ch3', num: 3, name: 'পরিমাণগত রসায়ন' },
        { id: 'chem2_ch4', num: 4, name: 'তড়িৎ রসায়ন' },
        { id: 'chem2_ch5', num: 5, name: 'অর্থনৈতিক রসায়ন' }
      ]
    },
    {
      id: 'math1',
      titleBn: 'উচ্চতর গণিত ১ম পত্র',
      titleEn: 'Higher Math 1st Paper',
      tag: 'ইঞ্জিনিয়ারিং ও প্রযুক্তি',
      gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #92400e 100%)',
      chapters: [
        { id: 'math1_ch1', num: 1, name: 'ম্যাট্রিক্স ও নির্ণায়ক' },
        { id: 'math1_ch3', num: 3, name: 'সরলরেখা' },
        { id: 'math1_ch4', num: 4, name: 'বৃত্ত' },
        { id: 'math1_ch7', num: 7, name: 'সংযুক্ত কোণের ত্রিকোণমিতি' },
        { id: 'math1_ch9', num: 9, name: 'অন্তরীকরণ' }
      ]
    },
    {
      id: 'math2',
      titleBn: 'উচ্চতর গণিত ২য় পত্র',
      titleEn: 'Higher Math 2nd Paper',
      tag: 'ইঞ্জিনিয়ারিং ও প্রযুক্তি',
      gradient: 'linear-gradient(135deg, #ca8a04 0%, #a16207 50%, #854d0e 100%)',
      chapters: [
        { id: 'math2_ch1', num: 1, name: 'বাস্তব সংখ্যা ও অসমতা' },
        { id: 'math2_ch3', num: 3, name: 'জটিল সংখ্যা' },
        { id: 'math2_ch4', num: 4, name: 'বহুপদী ও বহুপদী সমীকরণ' },
        { id: 'math2_ch6', num: 6, name: 'কনিক্স' },
        { id: 'math2_ch7', num: 7, name: 'বিপরীত ত্রিকোণমিতিক ফাংশন' }
      ]
    },
    {
      id: 'bio1',
      titleBn: 'জীববিজ্ঞান ১ম পত্র (উদ্ভিদবিজ্ঞান)',
      titleEn: 'Biology 1st Paper',
      tag: 'মেডিকেল ড্রিমার্স',
      gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
      chapters: [
        { id: 'bio1_ch1', num: 1, name: 'কোষ ও এর গঠন' },
        { id: 'bio1_ch2', num: 2, name: 'কোষ বিভাজন' },
        { id: 'bio1_ch4', num: 4, name: 'অণুজীব' },
        { id: 'bio1_ch9', num: 9, name: 'উদ্ভিদ শারীরতত্ত্ব' },
        { id: 'bio1_ch11', num: 11, name: 'জীবপ্রযুক্তি' }
      ]
    },
    {
      id: 'bio2',
      titleBn: 'জীববিজ্ঞান ২য় পত্র (প্রাণিবিজ্ঞান)',
      titleEn: 'Biology 2nd Paper',
      tag: 'মেডিকেল ড্রিমার্স',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
      chapters: [
        { id: 'bio2_ch1', num: 1, name: 'প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস' },
        { id: 'bio2_ch2', num: 2, name: 'প্রাণীর পরিচিতি (হাইড্রা, ঘাসফড়িং, রুই মাছ)' },
        { id: 'bio2_ch3', num: 3, name: 'পরিপাক ও শোষণ' },
        { id: 'bio2_ch4', num: 4, name: 'রক্ত ও সংবহন' },
        { id: 'bio2_ch5', num: 5, name: 'শ্বসন ও শ্বাসক্রিয়া' },
        { id: 'bio2_ch11', num: 11, name: 'জিনতত্ত্ব ও বিবর্তন' }
      ]
    },
    {
      id: 'eng',
      titleBn: 'ইংরেজি (English)',
      titleEn: 'English',
      tag: 'সকল শাখা ও ভর্তি পরীক্ষা',
      gradient: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 50%, #3730a3 100%)',
      chapters: [
        { id: 'eng_ch1', num: 1, name: 'Parts of Speech & Identification' },
        { id: 'eng_ch2', num: 2, name: 'Right Form of Verbs & Subject-Verb Agreement' },
        { id: 'eng_ch3', num: 3, name: 'Preposition & Idioms' },
        { id: 'eng_ch4', num: 4, name: 'Vocabulary & Synonyms/Antonyms' }
      ]
    },
    {
      id: 'gk',
      titleBn: 'সাধারণ জ্ঞান (General Knowledge)',
      titleEn: 'General Knowledge',
      tag: 'বাংলাদেশ ও আন্তর্জাতিক',
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%)',
      chapters: [
        { id: 'gk_ch1', num: 1, name: 'প্রাচীন বাংলা ও স্বাধীনতা সংগ্রাম' },
        { id: 'gk_ch2', num: 2, name: '১৯৭১ এর মুক্তিযুদ্ধ ও সেক্টর' },
        { id: 'gk_ch3', num: 3, name: 'বাংলাদেশের সংবিধান ও সরকার ব্যবস্থা' },
        { id: 'gk_ch4', num: 4, name: 'সাম্প্রতিক বাংলাদেশ ও বিশ্ব' }
      ]
    },
    {
      id: 'ict',
      titleBn: 'তথ্য ও যোগাযোগ প্রযুক্তি',
      titleEn: 'ICT',
      tag: 'এইচএসসি ও ভর্তি প্রস্তুতি',
      gradient: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 40%, #1e1b4b 100%)',
      chapters: [
        { id: 'ict_ch1', num: 1, name: 'তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত' },
        { id: 'ict_ch2', num: 2, name: 'কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং' },
        { id: 'ict_ch3', num: 3, name: 'সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস' },
        { id: 'ict_ch4', num: 4, name: 'ওয়েব ডিজাইন পরিচিতি ও HTML' },
        { id: 'ict_ch5', num: 5, name: 'প্রোগ্রামিং ভাষা (C Programming)' }
      ]
    },
    {
      id: 'bangla1',
      titleBn: 'বাংলা ১ম পত্র',
      titleEn: 'Bangla 1st Paper',
      tag: 'এইচএসসি ও ভর্তি প্রস্তুতি',
      gradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 45%, #4c0519 100%)',
      chapters: [
        { id: 'ban1_ch1', num: 1, name: 'অপরিচিতা (গল্প)' },
        { id: 'ban1_ch2', num: 2, name: 'বিলাসী (গল্প)' },
        { id: 'ban1_ch3', num: 3, name: 'সোনার তরী (কবিতা)' },
        { id: 'ban1_ch4', num: 4, name: 'বিদ্রোহী (কবিতা)' }
      ]
    },
    {
      id: 'bangla2',
      titleBn: 'বাংলা ২য় পত্র',
      titleEn: 'Bangla 2nd Paper',
      tag: 'এইচএসসি ও ভর্তি প্রস্তুতি',
      gradient: 'linear-gradient(135deg, #e11d48 0%, #9f1239 45%, #4c0519 100%)',
      chapters: [
        { id: 'ban2_ch1', num: 1, name: 'বাংলা উচ্চারণের নিয়ম' },
        { id: 'ban2_ch2', num: 2, name: 'বাংলা বানানের নিয়ম' },
        { id: 'ban2_ch3', num: 3, name: 'ব্যাকরণিক শব্দশ্রেণি' }
      ]
    }
  ];

  // Default Question Bank sample
  const BUILTIN_QUESTION_BANKS = {
    chem2_ch1: [
      {
        question: 'বায়ুমণ্ডলের কোন স্তরে ওজোন গ্যাসের স্তর অবস্থিত?',
        options: ['ট্রপোস্ফিয়ার', 'স্ট্র্যাটোস্ফিয়ার', 'মেসোস্ফিয়ার', 'থার্মোস্ফিয়ার'],
        correct: 1,
        explanation: 'স্ট্র্যাটোস্ফিয়ার স্তরে ওজোন স্তর (Ozone Layer) অবস্থিত, যা সূর্যের ক্ষতিকর অতিবেগুনি রশ্মি শোষণ করে।'
      },
      {
        question: 'STP-তে ১ মোল যেকোনো আদর্শ গ্যাসের আয়তন কত লিটার?',
        options: ['২২.৪ লিটার', '২৪.৭৮৯ লিটার', '২০.০ লিটার', '২২.৭ লিটার'],
        correct: 0,
        explanation: 'Standard Temperature and Pressure (STP, 0°C ও 1 atm) এ ১ মোল আদর্শ গ্যাসের মোলার আয়তন ২২.৪১৪ লিটার।'
      },
      {
        question: 'গ্রিনহাউস গ্যাসের মধ্যে বৈশ্বিক উষ্ণায়নে সর্বাধিক অবদান রাখে কোনটি?',
        options: ['মিথেন (CH4)', 'কার্বন ডাই অক্সাইড (CO2)', 'নাইট্রাস অক্সাইড (N2O)', 'সিএফসি (CFC)'],
        correct: 1,
        explanation: 'বায়ুমণ্ডলে পরিমাণের দিক থেকে কার্বন ডাই অক্সাইড সর্বাধিক পরিমাণে নির্গত হওয়ায় গ্রিনহাউস প্রভাবে এর অবদান সর্বোচ্চ (প্রায় ৫০-৬০%)।'
      },
      {
        question: 'বয়েলের সূত্রে কোন দুটি রাশি ধ্রুবক থাকে?',
        options: ['তাপমাত্রা ও গ্যাসের ভর', 'চাপ ও গ্যাসের ভর', 'আয়তন ও তাপমাত্রা', 'চাপ ও তাপমাত্রা'],
        correct: 0,
        explanation: 'বয়েলের সূত্র অনুসারে নির্দিষ্ট ভরের গ্যাসের ক্ষেত্রে স্থির তাপমাত্রায় গ্যাসের আয়তন প্রযুক্ত চাপের ব্যস্তানুপাতিক।'
      },
      {
        question: 'এসিড বৃষ্টির জন্য মূলত কোন গ্যাসগুলো দায়ী?',
        options: ['SO2 ও NO2', 'CO ও CH4', 'O2 ও N2', 'He ও Ar'],
        correct: 0,
        explanation: 'SO2 এবং NO2 বৃষ্টির পানির সাথে বিক্রিয়া করে সালফিউরিক ও নাইট্রিক এসিড উৎপন্ন করে, যা এসিড বৃষ্টির মূল কারণ।'
      }
    ],
    chem2_ch2: [
      {
        question: 'জৈব যৌগের সমগোত্রীয় শ্রেণীর সদস্যদের মধ্যে কিসের ব্যবধান থাকে?',
        options: ['-CH2- (মিথিলিন মূলক)', '-CH3 (মিথাইল মূলক)', '-OH মূলক', '-COOH মূলক'],
        correct: 0,
        explanation: 'সমগোত্রীয় শ্রেণীর পরপর দুটি সদস্যের আণবিক সংকেতের মধ্যে একটি মিথিলিন (-CH2-) মূলকের পার্থক্য থাকে।'
      },
      {
        question: 'মার্শ গ্যাস নামে কোনটি পরিচিত?',
        options: ['ইথেন', 'মিথেন', 'প্রোপেন', 'বিউটেন'],
        correct: 1,
        explanation: 'জলাভূমি বা ধানক্ষেতের পচা জৈব পদার্থ থেকে মিথেন গ্যাস উৎপন্ন হয় বলে একে মার্শ গ্যাস বলা হয়।'
      },
      {
        question: 'বেনজিনে কয়টি সিগমা (σ) এবং কয়টি পাই (π) বন্ধন থাকে?',
        options: ['১২টি σ এবং ৩টি π', '৬টি σ এবং ৩টি π', '৩টি σ এবং ৩টি π', '৯টি σ এবং ৩টি π'],
        correct: 0,
        explanation: 'বেনজিনে ৬টি C-C এবং ৬টি C-H বন্ধন মিলিয়ে মোট ১২টি সিগমা বন্ধন এবং ৩টি সঞ্চারণশীল পাই বন্ধন থাকে।'
      }
    ],
    bio2_ch4: [
      {
        question: 'মানবদেহে সার্বজনীন রক্ত গ্রহীতা (Universal Recipient) কোন গ্রুপ?',
        options: ['O পজিটিভ', 'AB পজিটিভ', 'A নেগেটিভ', 'B পজিটিভ'],
        correct: 1,
        explanation: 'AB পজিটিভ গ্রুপের রক্তের রক্তরসে কোনো অ্যান্টিবডি না থাকায় এটি যেকোনো গ্রুপের রক্ত গ্রহণ করতে পারে।'
      },
      {
        question: 'হৃদপিণ্ডের প্রাকৃতিক পেসমেকার (Natural Pacemaker) কোনটি?',
        options: ['SAN (সাইনোট্রিয়াল নোড)', 'AVN', 'পারকিঞ্জি তন্তু', 'বান্ডল অব হিজ'],
        correct: 0,
        explanation: 'সাইনোট্রিয়াল নোড (SAN) স্বয়ংক্রিয়ভাবে বিদ্যুৎ তরঙ্গ সৃষ্টি করে হৃদস্পন্দন শুরু করায় একে প্রাকৃতিক পেসমেকার বলা হয়।'
      },
      {
        question: 'রক্ত জমাট বাঁধতে সাহায্য করে কোন রক্তকণিকা?',
        options: ['অণুচক্রিকা (Platelet)', 'লোহিত রক্তকণিকা', 'শ্বেত রক্তকণিকা', 'লিম্ফোসাইট'],
        correct: 0,
        explanation: 'অণুচক্রিকা বা থ্রম্বোসাইট থ্রম্বোপ্লাস্টিন নিঃসরণের মাধ্যমে রক্ত তঞ্চন বা ক্লটিংয়ে প্রধান ভূমিকা পালন করে।'
      }
    ],
    gk_ch2: [
      {
        question: '১৯৭১ সালের মহান মুক্তিযুদ্ধে বাংলাদেশকে কয়টি সেক্টরে ভাগ করা হয়েছিল?',
        options: ['৭টি', '৯টি', '১১টি', '১৪টি'],
        correct: 2,
        explanation: 'যুদ্ধ পরিচালনার সুবিধার জন্য সমগ্র বাংলাদেশকে ১১টি সেক্টরে এবং ৬৪টি সাব-সেক্টরে বিভক্ত করা হয়েছিল।'
      },
      {
        question: 'কোন সেক্টরে কোনো নিয়মিত সেক্টর কমান্ডার ছিলেন না?',
        options: ['১০ নম্বর সেক্টর', '১ নম্বর সেক্টর', '২ নম্বর সেক্টর', '৮ নম্বর সেক্টর'],
        correct: 0,
        explanation: '১০ নম্বর নৌ-সেক্টর ছিল একটি ব্যতিক্রমী সেক্টর, যেখানে কোনো নির্দিষ্ট সেক্টর কমান্ডার ছিলেন না। নৌ কমান্ডোরা সদর দপ্তর থেকে পরিচালিত হতো।'
      },
      {
        question: 'স্বাধীন বাংলা বেতার কেন্দ্র থেকে প্রচারিত "চরমপত্র" কে পাঠ করতেন?',
        options: ['এম আর আখতার মুকুল', 'কামাল লোহানী', 'বেলাল মোহাম্মদ', 'আব্দুল গাফফার চৌধুরী'],
        correct: 0,
        explanation: 'জনপ্রিয় ব্যঙ্গাত্মক অনুষ্ঠান "চরমপত্র" রচনা ও স্বকণ্ঠে পাঠ করতেন বিশিষ্ট সাংবাদিক এম আর আখতার মুকুল।'
      }
    ]
  };

  // State Management
  const State = {
    subjects: DEFAULT_SUBJECTS,
    currentTab: 'assigned', // 'assigned' | 'subjects' | 'leaderboard'
    currentSubject: null,
    currentChapter: null,
    activeExam: null, // exam configuration
    activeQuestions: [],
    currentQIndex: 0,
    userAnswers: {}, // { [qIdx]: selectedOptionIdx }
    flaggedQuestions: new Set(),
    timerInterval: null,
    timeRemainingSeconds: 0,
    totalDurationSeconds: 0,
    tabSwitchCount: 0,
    isExamRunning: false,
    leaveCountdownInterval: null,
    leaveCountdownSeconds: 20,
    penaltyApplied: false,
    startTime: null,
    soundMuted: false
  };

  // DOM Elements cache
  let elements = {};
  let activePortalClass = localStorage.getItem('sr_class') || 'HSC';

  function init() {
    renderButtonsUnderInspiration();
    renderExamPortalModalMarkup();
    cacheDOMElements();
    bindGlobalListeners();
    loadSubjectsFromDB();
    loadAssignedExamsFromDB();
    loadLeaderboardFromDB();
  }

  // 2. Insert Action Buttons Below Inspiration
  function renderButtonsUnderInspiration() {
    let row = document.getElementById('examActionRow');
    if (!row) {
      const qt = document.getElementById('qt');
      const inspCard = qt ? qt.closest('.card') : null;
      if (!inspCard) return;

      row = document.createElement('div');
      row.id = 'examActionRow';
      row.className = 'exam-action-buttons';
      row.innerHTML = `
        <button class="exam-btn-primary" id="btnOpenExamPortal" type="button" aria-label="অনলাইন এক্সাম পোর্টাল খুলুন">
          <span class="exam-btn-icon">📝</span>
          <div class="exam-btn-text">
            <span class="exam-btn-title">Exams</span>
            <span class="exam-btn-sub">লাইভ এক্সাম, চ্যাপ্টার প্র্যাকটিস ও লিডারবোর্ড</span>
          </div>
        </button>
        <button class="exam-btn-secondary" id="btnJumpShortcut" type="button" aria-label="পড়ার শর্টকাটে যান">
          <span class="exam-btn-icon">🔗</span>
          <div class="exam-btn-text">
            <span class="exam-btn-title">পড়ার শর্টকাট</span>
            <span class="exam-btn-sub">প্রয়োজনীয় ক্লাস লিঙ্ক ও স্টাডি ফাইলস</span>
          </div>
        </button>
      `;
      inspCard.parentNode.insertBefore(row, inspCard.nextSibling);
    }

    const openBtn = document.getElementById('btnOpenExamPortal');
    if (openBtn) {
      openBtn.onclick = () => {
        openPortal();
      };
    }

    const jumpBtn = document.getElementById('btnJumpShortcut');
    if (jumpBtn) {
      jumpBtn.onclick = () => {
        openInPageShortcutModal();
      };
    }
  }

  // 3. Render Modal Shell in Document
  function renderExamPortalModalMarkup() {
    if (document.getElementById('examPortalOverlay')) return;

    const modalMarkup = `
      <!-- Main Exam Portal Modal -->
      <div id="examPortalOverlay" class="exam-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="examPortalTitle">
        <div class="exam-modal-container">
          
          <!-- Top Navigation Header -->
          <header class="exam-portal-header">
            <div class="exam-brand-wrapper">
              <div class="exam-brand-icon">🎓</div>
              <div>
                <h3 class="exam-portal-title" id="examPortalTitle">ডিজিটাল এক্সাম পোর্টাল</h3>
                <p class="exam-portal-sub">আমাদের অধ্যয়ন কক্ষ - মূল্যায়ন ও অনুশীলন কেন্দ্র</p>
              </div>
            </div>

            <!-- Portal Tabs -->
            <nav class="exam-nav-tabs" id="portalNavTabs">
              <button class="exam-tab-btn active" data-tab="assigned" type="button">📋 নির্ধারিত পরীক্ষা</button>
              <button class="exam-tab-btn" data-tab="subjects" type="button">📚 বিষয় ও চ্যাপ্টার</button>
              <button class="exam-tab-btn" data-tab="leaderboard" type="button">🏆 লিডারবোর্ড</button>
              <button class="exam-tab-btn" data-tab="history" type="button">🕒 আমার বিগত পরীক্ষা</button>
            </nav>

            <button class="exam-close-btn" id="btnExamClose" type="button" title="বন্ধ করুন" aria-label="Close">✕</button>
          </header>

          <!-- Scrollable Body Content -->
          <div class="exam-portal-body" id="portalBodyContent">
            
            <!-- Student Profile Class Display (Only User Selected Class) -->
            <div id="examPortalClassRow" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.08);flex-wrap:wrap;gap:10px">
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:13px;color:#94a3b8;font-weight:600">আপনার কোর্স / ক্লাস:</span>
                <span id="userPortalClassBadge" style="display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:10px;border:1.5px solid #10b981;background:rgba(16,185,129,0.15);color:#34d399;font-weight:700;font-size:13.5px">
                  🎓 এইচএসসি (HSC)
                </span>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:12.5px;color:#94a3b8">ক্লাস পরিবর্তনের জন্য প্রোফাইল সেটিংস থেকে আবেদন করুন</span>
              </div>
            </div>

            <!-- View 1: Assigned Exams -->
            <div class="exam-view-panel active" id="viewAssigned">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:10px">
                <h4 style="margin:0;font-size:18px;font-weight:700;color:#f8fafc">📅 আজকের ও নির্ধারিত পরীক্ষা সমূহ</h4>
                <span style="font-size:12.5px;color:#94a3b8">রুম কোড ও রোল অনুযায়ী স্বয়ংক্রিয় ফিল্টার</span>
              </div>
              <div class="assigned-exams-list" id="assignedExamsListContainer">
                <div style="text-align:center;padding:40px;color:#94a3b8">পরীক্ষা তালিকা লোড হচ্ছে...</div>
              </div>
            </div>

            <!-- View 2: Subjects & Chapters -->
            <div class="exam-view-panel" id="viewSubjects">
              <!-- Subjects Listing (Step 1) -->
              <div id="subjectsListingContainer">
                <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
                  <div>
                    <h4 style="margin:0 0 4px 0;font-size:18px;font-weight:700;color:#f8fafc">১. বিষয় নির্বাচন করুন (Subject Hierarchy) — <span id="subjectCategoryTitleBadge">HSC</span></h4>
                    <p style="margin:0;font-size:12.5px;color:#94a3b8">যেকোনো বিষয়ে ক্লিক করে চ্যাপ্টার ভিত্তিক এমসিকিউ অনুশীলন শুরু করুন</p>
                  </div>
                </div>
                <div class="subject-grid" id="subjectGridContainer"></div>
              </div>

              <!-- Chapters Listing (Step 2) -->
              <div id="chaptersListingContainer" style="display:none">
                <div class="chapter-header-bar" style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
                  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                    <button class="btn-back-subjects" id="btnBackToSubjects" type="button">← সব বিষয়ে ফিরে যান</button>
                    <h4 id="selectedSubjectTitle" style="margin:0;font-size:17px;font-weight:700;color:#93c5fd"></h4>
                  </div>
                </div>
                <div class="chapters-grid" id="chaptersGridContainer"></div>
              </div>

              <!-- Chapter Exams Listing (Step 3: New 4-Step Hierarchy) -->
              <div id="chapterExamsListingContainer" style="display:none">
                <div class="chapter-header-bar" style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
                  <button class="btn-back-subjects" id="btnBackToChapters" type="button">← অধ্যায়সমূহে ফিরে যান</button>
                  <h4 id="selectedChapterExamTitle" style="margin:0;font-size:17px;font-weight:700;color:#93c5fd"></h4>
                </div>

                <!-- Previous Score Preview Card -->
                <div id="chapterPrevScoreCard" style="background:rgba(30,41,59,0.7);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
                  <div style="display:flex;align-items:center;gap:10px">
                    <span style="font-size:24px">📊</span>
                    <div>
                      <div style="font-size:12.5px;color:#94a3b8;font-weight:600">পূর্ববর্তী সেরা ফলাফল:</div>
                      <div id="chapterPrevScoreText" style="font-size:15px;font-weight:700;color:#38bdf8">কোনো পূর্ববর্তী রেকর্ড নেই (প্রথম প্রচেষ্টা)</div>
                    </div>
                  </div>
                  <span id="chapterPrevScoreBadge" style="font-size:12px;padding:4px 12px;border-radius:20px;background:rgba(56,189,248,0.15);color:#38bdf8;font-weight:700">নতুন প্রস্তুতি</span>
                </div>

                <!-- List of Exams for this chapter -->
                <div class="chapter-exams-grid" id="chapterExamsGridContainer" style="display:grid;gap:12px"></div>
              </div>
            </div>

            <!-- View 3: Leaderboard -->
            <div class="exam-view-panel" id="viewLeaderboard">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
                <h4 style="margin:0;font-size:18px;font-weight:700;color:#f8fafc">🏆 অনলাইন এক্সাম লিডারবোর্ড</h4>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  <button id="btnOpenLeaderboardFilterModal" onclick="window.openLeaderboardFilterModal && window.openLeaderboardFilterModal()" class="btn-back-subjects" style="padding:5px 12px;font-size:12.5px;background:rgba(59,130,246,0.15);border:1.5px solid #3b82f6;color:#60a5fa;display:inline-flex;align-items:center;gap:6px;border-radius:10px;cursor:pointer" type="button">🔍 ফিল্টার</button>
                  <span id="activeFilterBadge" style="display:none;font-size:12px;padding:4px 10px;border-radius:8px;background:rgba(16,185,129,0.2);color:#34d399;font-weight:600"></span>
                  <button id="btnClearFilter" class="btn-back-subjects" style="display:none;padding:4px 8px;font-size:11.5px;color:#f87171;border:1px solid #f87171;border-radius:8px" type="button">✕ রিসেট</button>
                  <select id="examFilterSelect" style="display:none"><option value="all">সকল পরীক্ষা</option></select>
                  <button id="btnRefreshLeaderboard" class="btn-back-subjects" style="padding:5px 12px;font-size:12px;border-radius:10px" type="button">🔄 রিফ্রেশ</button>
                </div>
              </div>
              <div class="leaderboard-table-wrapper">
                <table class="leaderboard-table">
                  <thead>
                    <tr>
                      <th style="width:60px">র‍্যাংক</th>
                      <th>শিক্ষার্থী (রুম)</th>
                      <th>বিষয় / পরীক্ষা</th>
                      <th>নম্বর</th>
                      <th>শতাংশ</th>
                      <th>সময়</th>
                      <th>তারিখ</th>
                    </tr>
                  </thead>
                  <tbody id="examLeaderboardTableBody">
                    <tr><td colspan="7" style="text-align:center;padding:30px;color:#94a3b8">লিডারবোর্ড ডেটা লোড হচ্ছে...</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- View 6: Recent Exams Personal History -->
            <div class="exam-view-panel" id="viewHistory">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
                <div>
                  <h4 style="margin:0 0 4px 0;font-size:18px;font-weight:700;color:#f8fafc">🕒 আমার বিগত পরীক্ষার রেকর্ড (Recent Exams)</h4>
                  <p style="margin:0;font-size:12.5px;color:#94a3b8">আপনার দেওয়া সর্বশেষ ২৫টি পরীক্ষার ফলাফল ও সমাধান পর্যালোচনা</p>
                </div>
                <button id="btnRefreshHistory" class="btn-back-subjects" style="padding:4px 10px;font-size:12px" type="button">🔄 রিফ্রেশ</button>
              </div>

              <div class="leaderboard-table-wrapper">
                <table class="leaderboard-table">
                  <thead>
                    <tr>
                      <th>পরীক্ষার নাম</th>
                      <th>প্রাপ্ত নম্বর</th>
                      <th>শতকরা হার</th>
                      <th>ব্যয়িত সময়</th>
                      <th>তারিখ</th>
                      <th style="width:110px;text-align:center">উত্তরপত্র</th>
                    </tr>
                  </thead>
                  <tbody id="examHistoryTableBody">
                    <tr><td colspan="6" style="text-align:center;padding:30px;color:#94a3b8">বিগত পরীক্ষার রেকর্ড লোড হচ্ছে...</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- View 4: Active Exam Arena (Hidden by default) -->
            <div class="exam-view-panel" id="viewActiveExam">
              <div class="active-exam-container">
                
                <!-- Main Question Area -->
                <div class="exam-main-panel">
                  
                  <!-- Top Status Bar -->
                  <div class="exam-top-status-bar">
                    <div>
                      <span id="activeExamBadge" style="background:#1d4ed8;color:#dbeafe;font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;display:inline-block;margin-bottom:4px"></span>
                      <h4 id="activeExamSubjectTitle" style="margin:0;font-size:17px;font-weight:700;color:#f8fafc"></h4>
                    </div>

                    <!-- PDF Question Link Toggle if available -->
                    <div id="examPdfToggleWrapper" style="display:none">
                      <a id="examPdfLink" href="#" target="_blank" class="btn-view-pdf">
                        📄 প্রশ্নপত্র PDF ভিউ
                      </a>
                    </div>

                    <!-- Circular Countdown Timer & Sound Toggle -->
                    <div class="exam-timer-wrapper">
                      <button id="btnExamSoundToggle" class="btn-sound-toggle" type="button" title="শব্দ চালু (মিউট করতে চাপুন)">🔔</button>
                      <div class="circular-timer-container" id="circularTimerContainer">
                        <svg class="circular-timer-svg" viewBox="0 0 100 100">
                          <circle class="circular-timer-bg" cx="50" cy="50" r="42" />
                          <circle class="circular-timer-bar" id="circularTimerProgress" cx="50" cy="50" r="42" stroke-dasharray="263.89" stroke-dashoffset="0" />
                        </svg>
                        <div class="circular-timer-center">
                          <span class="circular-timer-digits" id="examTimerDisplay">00:00</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Question Card -->
                  <div class="exam-question-card">
                    <div class="exam-q-header">
                      <div class="exam-q-index">
                        প্রশ্ন <strong id="currentQNum">1</strong> / <span id="totalQNum">10</span>
                      </div>
                      <button class="btn-flag-toggle" id="btnFlagQuestion" type="button">
                        <span id="flagIcon">🔖</span>
                        <span id="flagText">পরে দেখার জন্য চিহ্নিত করুন</span>
                      </button>
                    </div>

                    <div class="exam-question-title" id="activeQuestionText">প্রশ্ন লোড হচ্ছে...</div>

                    <!-- MCQ Options (ক, খ, গ, ঘ) -->
                    <div class="exam-options-list" id="activeOptionsContainer"></div>

                    <!-- Bottom Prev / Next Nav -->
                    <div class="exam-nav-actions">
                      <button class="btn-exam-nav prev" id="btnPrevQuestion" type="button">← পূর্ববর্তী</button>
                      <button class="btn-exam-nav next" id="btnNextQuestion" type="button">পরবর্তী →</button>
                    </div>
                  </div>

                </div>

                <!-- Right Question Tracker Palette -->
                <div class="exam-sidebar-card">
                  <h4 style="margin:0 0 12px 0;font-size:15px;font-weight:700;color:#f8fafc;display:flex;align-items:center;gap:6px">
                    <span>📑</span> প্রশ্ন প্যালেট
                  </h4>

                  <div class="palette-status-legend">
                    <div class="palette-legend-item"><span class="legend-dot answered"></span><span>উত্তর দেওয়া</span></div>
                    <div class="palette-legend-item"><span class="legend-dot unanswered"></span><span>বাকি</span></div>
                    <div class="palette-legend-item"><span class="legend-dot flagged"></span><span>চিহ্নিত</span></div>
                    <div class="palette-legend-item"><span class="legend-dot current"></span><span>বর্তমান</span></div>
                  </div>

                  <div class="question-palette-grid" id="questionPaletteGrid"></div>

                  <button class="btn-submit-exam-finish" id="btnConfirmSubmitExam" type="button">
                    <span>📤</span> পরীক্ষা জমা দিন
                  </button>
                </div>

              </div>
            </div>

            <!-- View 5: Result & Solutions -->
            <div class="exam-view-panel" id="viewResult">
              <div class="result-container">
                <div class="result-hero-card success" id="resultHeroCard">
                  <div style="font-size:42px;line-height:1;margin-bottom:8px" id="resultHeroIcon">🏆</div>
                  <h3 style="margin:0 0 6px 0;font-size:24px;font-weight:800" id="resultHeroTitle">পরীক্ষা সম্পন্ন হয়েছে!</h3>
                  <p style="margin:0;font-size:14px;opacity:0.9" id="resultHeroSub">আপনার উত্তরপত্র স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়েছে।</p>

                  <div class="result-stat-grid">
                    <div class="result-stat-card">
                      <div class="result-stat-val" id="resScore">0/0</div>
                      <div class="result-stat-lbl">প্রাপ্ত নম্বর</div>
                    </div>
                    <div class="result-stat-card">
                      <div class="result-stat-val" id="resPercentage">0%</div>
                      <div class="result-stat-lbl">শতকরা হার</div>
                    </div>
                    <div class="result-stat-card">
                      <div class="result-stat-val" id="resCorrect">0</div>
                      <div class="result-stat-lbl">সঠিক উত্তর</div>
                    </div>
                    <div class="result-stat-card">
                      <div class="result-stat-val" id="resWrong">0</div>
                      <div class="result-stat-lbl">ভুল / অনুত্তর</div>
                    </div>
                    <div class="result-stat-card">
                      <div class="result-stat-val" id="resTime">00:00</div>
                      <div class="result-stat-lbl">ব্যয়িত সময়</div>
                    </div>
                  </div>
                </div>

                <div style="display:flex;justify-content:center;gap:12px;margin:8px 0">
                  <button class="btn-back-subjects" id="btnResultBackPortal" type="button" style="background:#3b82f6;color:#fff;border:none">
                    ← এক্সাম পোর্টালে ফিরে যান
                  </button>
                  <button class="btn-back-subjects" id="btnResultRetake" type="button">
                    🔄 পুনরায় পরীক্ষা দিন
                  </button>
                </div>

                <!-- Detailed Question Review & Solutions -->
                <div style="margin-top:14px">
                  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px">
                    <h4 style="margin:0;font-size:18px;font-weight:700;color:#f8fafc;display:flex;align-items:center;gap:8px">
                      <span>📝</span> উত্তরপত্র ও বিস্তারিত বিশ্লেষণ
                    </h4>
                    <!-- Result solution filtering buttons -->
                    <div class="solution-filter-bar" style="display:flex;gap:6px;flex-wrap:wrap">
                      <button type="button" class="sol-filter-btn active" data-filter="all" id="btnFilterAllQ" style="padding:5px 12px;border-radius:18px;font-size:12.5px;font-weight:600;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.12);color:#f8fafc;cursor:pointer">
                        📋 সকল প্রশ্ন (<span id="countAllQ">0</span>)
                      </button>
                      <button type="button" class="sol-filter-btn" data-filter="correct" id="btnFilterCorrectQ" style="padding:5px 12px;border-radius:18px;font-size:12.5px;font-weight:600;border:1px solid rgba(52,211,153,0.4);background:rgba(52,211,153,0.12);color:#34d399;cursor:pointer">
                        ✅ সঠিক উত্তর (<span id="countCorrectQ">0</span>)
                      </button>
                      <button type="button" class="sol-filter-btn" data-filter="wrong" id="btnFilterWrongQ" style="padding:5px 12px;border-radius:18px;font-size:12.5px;font-weight:600;border:1px solid rgba(248,113,113,0.4);background:rgba(248,113,113,0.12);color:#f87171;cursor:pointer">
                        ❌ ভুল / অনুত্তর (<span id="countWrongQ">0</span>)
                      </button>
                    </div>
                  </div>
                  <div id="solutionReviewContainer"></div>
                </div>
              </div>
            </div>

          </div>
          <!-- Persistent Bottom-Left Floating Back Button -->
          <button class="exam-portal-back-btn" id="btnExamBottomLeftBack" type="button" style="position:fixed;bottom:20px;left:20px;z-index:999;background:#1e293b;border:1.5px solid #10b981;color:#34d399;padding:9px 18px;border-radius:999px;font-weight:700;font-size:14px;box-shadow:0 8px 24px rgba(0,0,0,0.4);cursor:pointer;display:inline-flex;align-items:center;gap:6px">
            ← ফিরে যান
          </button>
        </div>
      </div>

      <!-- Strict Proctoring Warning Overlay with 20s Return Timer -->
      <div id="strictWarningOverlay" class="strict-warning-overlay" role="alertdialog">
        <div class="strict-warning-box">
          <div class="warning-alert-icon">⚠️</div>
          <h3 style="margin:0 0 8px 0;font-size:21px;font-weight:800;color:#f87171">ট্যাব পরিবর্তন বা স্ক্রিন ছাড়ার চেষ্টা সনাক্ত হয়েছে!</h3>
          <p style="margin:0 0 14px 0;font-size:13.5px;color:#fca5a5;line-height:1.5">
            পরীক্ষার গোপনীয়তা ও নিয়ম বজায় রাখতে স্ক্রিন বা ট্যাব পরিবর্তন কঠোরভাবে নিষিদ্ধ। 
            <strong>২০ সেকেন্ডের</strong> মধ্যে পরীক্ষায় ফিরে না এলে আপনার পরীক্ষা ০ নম্বরে বাতিল হয়ে যাবে!
          </p>
          
          <div>
            <span style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#f87171;font-weight:700">ফিরে আসার জরুরি সময়:</span>
            <br>
            <div class="warning-countdown-badge" id="warningCountdownDisplay">20 সেকেন্ড</div>
          </div>

          <button class="btn-return-exam" id="btnReturnToExamPrompt" type="button">
            🚨 আমি অবিলম্বে পরীক্ষায় ফিরে যাচ্ছি
          </button>
        </div>
      </div>

      <!-- Submission Confirmation Dialog -->
      <div id="confirmSubmitOverlay" class="strict-warning-overlay" style="background:rgba(15,23,42,0.82)">
        <div class="strict-warning-box" style="background:#0f172a;border-color:rgba(59,130,246,0.5);box-shadow:0 0 40px rgba(59,130,246,0.3);color:#f8fafc">
          <div class="warning-alert-icon" style="background:rgba(59,130,246,0.15);border-color:#3b82f6;color:#60a5fa">❓</div>
          <h3 style="margin:0 0 8px 0;font-size:20px;font-weight:800;color:#f8fafc">পরীক্ষা জমা দিতে চান?</h3>
          <p id="confirmSubmitMessage" style="margin:0 0 18px 0;font-size:14px;color:#cbd5e1;line-height:1.5">
            আপনি কি নিশ্চিত যে আপনার উত্তরপত্র জমা দিতে চান?
          </p>
          <div style="display:flex;gap:12px">
            <button id="btnCancelSubmitModal" type="button" class="btn-back-subjects" style="flex:1;justify-content:center;padding:10px">না, চালিয়ে যাই</button>
            <button id="btnFinalSubmitModal" type="button" class="btn-submit-exam-finish" style="flex:1;margin:0;padding:10px">হ্যাঁ, জমা দিন</button>
          </div>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = modalMarkup;
    document.body.appendChild(wrapper);
  }

  // 4. Cache DOM references
  function cacheDOMElements() {
    elements = {
      portalOverlay: document.getElementById('examPortalOverlay'),
      btnClose: document.getElementById('btnExamClose'),
      navTabs: document.getElementById('portalNavTabs'),
      tabBtns: document.querySelectorAll('.exam-tab-btn'),
      panels: {
        assigned: document.getElementById('viewAssigned'),
        subjects: document.getElementById('viewSubjects'),
        leaderboard: document.getElementById('viewLeaderboard'),
        history: document.getElementById('viewHistory'),
        activeExam: document.getElementById('viewActiveExam'),
        result: document.getElementById('viewResult')
      },
      assignedList: document.getElementById('assignedExamsListContainer'),
      subjectsListing: document.getElementById('subjectsListingContainer'),
      subjectGrid: document.getElementById('subjectGridContainer'),
      chaptersListing: document.getElementById('chaptersListingContainer'),
      chaptersGrid: document.getElementById('chaptersGridContainer'),
      btnBackToSubjects: document.getElementById('btnBackToSubjects'),
      selectedSubjectTitle: document.getElementById('selectedSubjectTitle'),
      // Step 3: Chapter Exams
      chapterExamsListing: document.getElementById('chapterExamsListingContainer'),
      chapterExamsGrid: document.getElementById('chapterExamsGridContainer'),
      btnBackToChapters: document.getElementById('btnBackToChapters'),
      selectedChapterExamTitle: document.getElementById('selectedChapterExamTitle'),
      chapterPrevScoreText: document.getElementById('chapterPrevScoreText'),
      chapterPrevScoreBadge: document.getElementById('chapterPrevScoreBadge'),
      // Active exam
      activeBadge: document.getElementById('activeExamBadge'),
      activeSubTitle: document.getElementById('activeExamSubjectTitle'),
      pdfToggle: document.getElementById('examPdfToggleWrapper'),
      pdfLink: document.getElementById('examPdfLink'),
      timerDisplay: document.getElementById('examTimerDisplay'),
      circularTimerProgress: document.getElementById('circularTimerProgress'),
      circularTimerContainer: document.getElementById('circularTimerContainer'),
      btnExamSoundToggle: document.getElementById('btnExamSoundToggle'),
      timerBox: document.getElementById('examTimerBox'),
      currentQNum: document.getElementById('currentQNum'),
      totalQNum: document.getElementById('totalQNum'),
      flagBtn: document.getElementById('btnFlagQuestion'),
      flagText: document.getElementById('flagText'),
      qText: document.getElementById('activeQuestionText'),
      optionsContainer: document.getElementById('activeOptionsContainer'),
      prevBtn: document.getElementById('btnPrevQuestion'),
      nextBtn: document.getElementById('btnNextQuestion'),
      paletteGrid: document.getElementById('questionPaletteGrid'),
      btnConfirmSubmit: document.getElementById('btnConfirmSubmitExam'),
      // Proctoring
      strictOverlay: document.getElementById('strictWarningOverlay'),
      countdownDisplay: document.getElementById('warningCountdownDisplay'),
      btnReturnExam: document.getElementById('btnReturnToExamPrompt'),
      // Submission
      confirmOverlay: document.getElementById('confirmSubmitOverlay'),
      confirmMsg: document.getElementById('confirmSubmitMessage'),
      btnCancelSubmit: document.getElementById('btnCancelSubmitModal'),
      btnFinalSubmit: document.getElementById('btnFinalSubmitModal'),
      // Result
      resultHeroCard: document.getElementById('resultHeroCard'),
      resultHeroIcon: document.getElementById('resultHeroIcon'),
      resultHeroTitle: document.getElementById('resultHeroTitle'),
      resultHeroSub: document.getElementById('resultHeroSub'),
      resScore: document.getElementById('resScore'),
      resPercentage: document.getElementById('resPercentage'),
      resCorrect: document.getElementById('resCorrect'),
      resWrong: document.getElementById('resWrong'),
      resTime: document.getElementById('resTime'),
      btnResultBack: document.getElementById('btnResultBackPortal'),
      btnResultRetake: document.getElementById('btnResultRetake'),
      solutionContainer: document.getElementById('solutionReviewContainer'),
      // Leaderboard
      leaderboardBody: document.getElementById('examLeaderboardTableBody'),
      btnRefreshLeaderboard: document.getElementById('btnRefreshLeaderboard'),
      // History
      historyBody: document.getElementById('examHistoryTableBody'),
      btnRefreshHistory: document.getElementById('btnRefreshHistory'),
      btnRequestClassChange: document.getElementById('btnRequestClassChange'),
      btnExamBottomLeftBack: document.getElementById('btnExamBottomLeftBack')
    };
  }

  // 5. Global Event Listeners
  function bindGlobalListeners() {
    elements.btnClose.addEventListener('click', closePortal);

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && elements.portalOverlay.classList.contains('active')) {
        if (!State.isExamRunning) {
          closePortal();
        }
      }
    });

    // Tab buttons
    elements.tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        switchTab(tab);
      });
    });

    // Subjects Back Button
    elements.btnBackToSubjects.addEventListener('click', () => {
      elements.chaptersListing.style.display = 'none';
      if (elements.chapterExamsListing) elements.chapterExamsListing.style.display = 'none';
      elements.subjectsListing.style.display = 'block';
      State.currentSubject = null;
    });

    // Step 3 Back to Chapters Button
    if (elements.btnBackToChapters) {
      elements.btnBackToChapters.addEventListener('click', () => {
        if (elements.chapterExamsListing) elements.chapterExamsListing.style.display = 'none';
        elements.chaptersListing.style.display = 'block';
      });
    }

    // Active Exam Navigation
    elements.prevBtn.addEventListener('click', () => navigateQuestion(-1));
    elements.nextBtn.addEventListener('click', () => navigateQuestion(1));
    elements.flagBtn.addEventListener('click', toggleFlag);
    elements.btnConfirmSubmit.addEventListener('click', showConfirmSubmitModal);

    // Proctoring Return
    elements.btnReturnExam.addEventListener('click', closeStrictWarning);

    // Confirm Submission
    elements.btnCancelSubmit.addEventListener('click', () => {
      elements.confirmOverlay.classList.remove('active');
    });
    elements.btnFinalSubmit.addEventListener('click', () => {
      elements.confirmOverlay.classList.remove('active');
      finalizeExam(false);
    });

    // Result actions
    elements.btnResultBack.addEventListener('click', () => {
      switchTab('subjects');
    });
    elements.btnResultRetake.addEventListener('click', () => {
      if (State.activeExam) {
        startExam(State.activeExam);
      }
    });

    // Leaderboard refresh
    elements.btnRefreshLeaderboard.addEventListener('click', loadLeaderboardFromDB);

    // History refresh
    if (elements.btnRefreshHistory) {
      elements.btnRefreshHistory.addEventListener('click', loadUserHistoryFromDB);
    }

    // Add Subject and Chapter buttons
    const btnAddSub = document.getElementById('btnAddNewSubjectModal');
    if (btnAddSub) {
      btnAddSub.addEventListener('click', promptAddNewSubject);
    }
    const btnAddCh = document.getElementById('btnAddNewChapterModal');
    if (btnAddCh) {
      btnAddCh.addEventListener('click', promptAddNewChapter);
    }

    // Class change request button
    if (elements.btnRequestClassChange) {
      elements.btnRequestClassChange.addEventListener('click', promptClassChangeRequest);
    }

    // Solution Review Filters
    document.querySelectorAll('.sol-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sol-filter-btn').forEach(b => {
          b.classList.remove('active');
          b.style.borderColor = 'rgba(255,255,255,0.2)';
        });
        btn.classList.add('active');
        btn.style.borderColor = '#38bdf8';
        renderSolutionReview(false, btn.dataset.filter);
      });
    });

    // Persistent Bottom-Left Back Button
    if (elements.btnExamBottomLeftBack) {
      elements.btnExamBottomLeftBack.addEventListener('click', () => {
        if (elements.chapterExamsListing && elements.chapterExamsListing.style.display !== 'none') {
          elements.chapterExamsListing.style.display = 'none';
          elements.chaptersListing.style.display = 'block';
        } else if (elements.chaptersListing && elements.chaptersListing.style.display !== 'none') {
          elements.chaptersListing.style.display = 'none';
          elements.subjectsListing.style.display = 'block';
          State.currentSubject = null;
        } else {
          closePortal();
        }
      });
    }

    // Sound Mute / Unmute Toggle Button
    if (elements.btnExamSoundToggle) {
      elements.btnExamSoundToggle.addEventListener('click', () => {
        State.soundMuted = !State.soundMuted;
        elements.btnExamSoundToggle.innerText = State.soundMuted ? '🔕' : '🔔';
        elements.btnExamSoundToggle.title = State.soundMuted ? 'শব্দ বন্ধ (আনমিউট করতে চাপুন)' : 'শব্দ চালু (মিউট করতে চাপুন)';
      });
    }

    // Leaderboard filter button & modal (Requirement 5)
    const btnOpenLbFilter = document.getElementById('btnOpenLeaderboardFilterModal');
    if (btnOpenLbFilter) {
      btnOpenLbFilter.addEventListener('click', (e) => {
        e.preventDefault();
        openLeaderboardFilterModal();
      });
    }
    document.addEventListener('click', (e) => {
      if (e.target && e.target.closest('#btnOpenLeaderboardFilterModal')) {
        e.preventDefault();
        openLeaderboardFilterModal();
      }
    });

    const btnClearFilter = document.getElementById('btnClearFilter');
    if (btnClearFilter) {
      btnClearFilter.addEventListener('click', () => {
        filterAndRenderLeaderboard('all');
      });
    }

    // Leaderboard filter change
    const filterSel = document.getElementById('examFilterSelect');
    if (filterSel) {
      filterSel.addEventListener('change', () => {
        filterAndRenderLeaderboard(filterSel.value);
      });
    }

    // Strict tab switch listeners
    document.addEventListener('visibilitychange', handleVisibilityOrBlur);
    window.addEventListener('blur', handleVisibilityOrBlur);
  }

  function getStudentClass() {
    let sCls = localStorage.getItem('sr_class');
    if (!sCls && window.P && window.me && window.P[window.me]) {
      const raw = window.P[window.me].cls || window.P[window.me].classBase || '';
      if (raw.includes('SSC')) sCls = 'SSC';
      else if (raw.includes('Admission')) sCls = 'Admission';
      else if (raw.includes('HSC')) sCls = 'HSC';
    }
    return sCls || 'HSC';
  }

  // 6. Navigation & Tab Switcher
  function openPortal(initialTab = 'assigned') {
    elements.portalOverlay.classList.add('active');
    activePortalClass = getStudentClass();
    const badge = document.getElementById('userPortalClassBadge');
    if (badge) {
      let label = '🎓 এইচএসসি (HSC)';
      if (activePortalClass === 'SSC') label = '📖 এসএসসি (SSC)';
      else if (activePortalClass === 'Admission') label = '🎯 ভর্তি পরীক্ষা (Admission)';
      badge.textContent = label;
    }
    renderSubjectsGrid();
    loadAssignedExamsFromDB();
    switchTab(initialTab);
  }

  function closePortal() {
    if (State.isExamRunning) {
      if (!confirm('পরীক্ষা চলাকালীন পোর্টাল বন্ধ করলে আপনার পরীক্ষা জমা হয়ে যাবে। আপনি কি নিশ্চিত?')) {
        return;
      }
      finalizeExam(false);
    }
    elements.portalOverlay.classList.remove('active');
  }

  function switchTab(tabKey) {
    State.currentTab = tabKey;
    elements.tabBtns.forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === tabKey);
    });

    Object.keys(elements.panels).forEach((k) => {
      if (elements.panels[k]) elements.panels[k].classList.remove('active');
    });

    if (elements.panels[tabKey]) {
      elements.panels[tabKey].classList.add('active');
    }

    if (tabKey === 'subjects') {
      renderSubjectsGrid();
    } else if (tabKey === 'assigned') {
      loadAssignedExamsFromDB();
    } else if (tabKey === 'leaderboard') {
      loadLeaderboardFromDB();
    } else if (tabKey === 'history') {
      loadUserHistoryFromDB();
    }
  }

  // 7. Load Data from Firebase Realtime Database
  function getDB() {
    try {
      if (window.firebase && window.firebase.database) {
        return window.firebase.database();
      }
    } catch (e) {
      console.warn('Firebase DB not ready', e);
    }
    return null;
  }

  function loadSubjectsFromDB() {
    const db = getDB();
    if (!db) {
      State.subjects = DEFAULT_SUBJECTS;
      renderSubjectsGrid();
      return;
    }

    db.ref('exam_subjects').once('value', (snap) => {
      const val = snap.val();
      if (val && typeof val === 'object') {
        const loaded = Object.keys(val).map((k) => ({
          id: k,
          ...val[k]
        }));
        if (loaded.length > 0) {
          State.subjects = loaded;
        }
      }
      renderSubjectsGrid();
    }).catch(() => {
      State.subjects = DEFAULT_SUBJECTS;
      renderSubjectsGrid();
    });
  }

  // 3D Vector SVG Icons and Dynamic Palette Themes for Subjects & Chapters
  const SUBJECT_THEME_MAP = {
    chem: {
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 45%, #4c1d95 100%)',
      borderGlow: 'rgba(168, 85, 247, 0.65)',
      neonGlow: 'rgba(147, 51, 234, 0.45)',
      icon: `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="chemGrad" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
            <stop stop-color="#c084fc"/>
            <stop offset="0.6" stop-color="#9333ea"/>
            <stop offset="1" stop-color="#581c87"/>
          </linearGradient>
          <filter id="chemGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#a855f7" flood-opacity="0.5"/>
          </filter>
        </defs>
        <path d="M26 10h12v10l12 28a4 4 0 0 1-3.7 5.6H17.7A4 4 0 0 1 14 48l12-28V10z" fill="url(#chemGrad)" stroke="#f3e8ff" stroke-width="2.5" filter="url(#chemGlow)"/>
        <line x1="22" y1="10" x2="42" y2="10" stroke="#f3e8ff" stroke-width="3" stroke-linecap="round"/>
        <path d="M19 44c4-3 10-3 14 0s10 3 14 0v4a4 4 0 0 1-3.7 5.6H17.7A4 4 0 0 1 14 48v-4z" fill="#f43f5e" opacity="0.85"/>
        <circle cx="28" cy="38" r="3" fill="#ffffff" opacity="0.9"/>
        <circle cx="36" cy="32" r="2" fill="#ffffff" opacity="0.75"/>
        <circle cx="25" cy="27" r="1.5" fill="#ffffff" opacity="0.6"/>
      </svg>`
    },
    math: {
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 45%, #9a3412 100%)',
      borderGlow: 'rgba(251, 191, 36, 0.75)',
      neonGlow: 'rgba(245, 158, 11, 0.45)',
      icon: `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mathGrad" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
            <stop stop-color="#fde047"/>
            <stop offset="0.5" stop-color="#f59e0b"/>
            <stop offset="1" stop-color="#b45309"/>
          </linearGradient>
        </defs>
        <rect x="10" y="10" width="44" height="44" rx="12" fill="url(#mathGrad)" stroke="#fef3c7" stroke-width="2.5"/>
        <path d="M22 24h6M25 21v6M36 24h8M22 40h20M22 45h20" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/>
        <circle cx="32" cy="32" r="3" fill="#ffffff"/>
      </svg>`
    },
    bio: {
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 45%, #064e3b 100%)',
      borderGlow: 'rgba(52, 211, 153, 0.7)',
      neonGlow: 'rgba(16, 185, 129, 0.45)',
      icon: `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bioGrad" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6ee7b7"/>
            <stop offset="0.6" stop-color="#059669"/>
            <stop offset="1" stop-color="#064e3b"/>
          </linearGradient>
        </defs>
        <path d="M32 10c14 4 22 18 16 32-4 10-16 12-16 12s-12-2-16-12c-6-14 2-28 16-32z" fill="url(#bioGrad)" stroke="#ecfdf5" stroke-width="2.5"/>
        <path d="M32 12v38M24 24c4 4 8 4 8 4M40 28c-4 3-8 3-8 3M24 38c4 3 8 3 8 3" stroke="#a7f3d0" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`
    },
    phy: {
      gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 45%, #1e40af 100%)',
      borderGlow: 'rgba(56, 189, 248, 0.75)',
      neonGlow: 'rgba(14, 165, 233, 0.45)',
      icon: `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="phyGrad" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
            <stop stop-color="#7dd3fc"/>
            <stop offset="0.5" stop-color="#0284c7"/>
            <stop offset="1" stop-color="#1e3a8a"/>
          </linearGradient>
        </defs>
        <ellipse cx="32" cy="32" rx="22" ry="9" stroke="#38bdf8" stroke-width="2.5" transform="rotate(-30 32 32)"/>
        <ellipse cx="32" cy="32" rx="22" ry="9" stroke="#38bdf8" stroke-width="2.5" transform="rotate(30 32 32)"/>
        <circle cx="32" cy="32" r="6" fill="#facc15" stroke="#ffffff" stroke-width="2"/>
        <circle cx="48" cy="22" r="3" fill="#38bdf8"/>
        <circle cx="16" cy="42" r="3" fill="#38bdf8"/>
      </svg>`
    },
    eng: {
      gradient: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 45%, #312e81 100%)',
      borderGlow: 'rgba(129, 140, 248, 0.75)',
      neonGlow: 'rgba(99, 102, 241, 0.45)',
      icon: `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="engGrad" x1="10" y1="12" x2="54" y2="52" gradientUnits="userSpaceOnUse">
            <stop stop-color="#a5b4fc"/>
            <stop offset="0.5" stop-color="#6366f1"/>
            <stop offset="1" stop-color="#312e81"/>
          </linearGradient>
        </defs>
        <path d="M12 18a4 4 0 0 1 4-4h14v36H16a4 4 0 0 0-4 4V18z" fill="url(#engGrad)" stroke="#e0e7ff" stroke-width="2"/>
        <path d="M52 18a4 4 0 0 0-4-4H34v36h14a4 4 0 0 1 4 4V18z" fill="url(#engGrad)" stroke="#e0e7ff" stroke-width="2"/>
        <path d="M18 22h8M18 28h8M18 34h8M38 22h8M38 28h8M38 34h8" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    },
    gk: {
      gradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 45%, #134e4a 100%)',
      borderGlow: 'rgba(45, 212, 191, 0.75)',
      neonGlow: 'rgba(20, 184, 166, 0.45)',
      icon: `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gkGrad" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5eead4"/>
            <stop offset="0.6" stop-color="#0d9488"/>
            <stop offset="1" stop-color="#134e4a"/>
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="20" fill="url(#gkGrad)" stroke="#ccfbf1" stroke-width="2.5"/>
        <ellipse cx="32" cy="32" rx="10" ry="20" stroke="#ccfbf1" stroke-width="1.8"/>
        <line x1="12" y1="32" x2="52" y2="32" stroke="#ccfbf1" stroke-width="1.8"/>
        <path d="M16 22c5 4 11 4 16 0s11-4 16 0M16 42c5-4 11-4 16 0s11 4 16 0" stroke="#ccfbf1" stroke-width="1.8"/>
      </svg>`
    },
    ict: {
      gradient: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 40%, #0369a1 70%, #0f172a 100%)',
      borderGlow: 'rgba(56, 189, 248, 0.9)',
      neonGlow: 'rgba(14, 165, 233, 0.55)',
      icon: `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="laptopLid" x1="12" y1="8" x2="52" y2="40" gradientUnits="userSpaceOnUse">
            <stop stop-color="#38bdf8"/>
            <stop offset="0.5" stop-color="#0284c7"/>
            <stop offset="1" stop-color="#0f172a"/>
          </linearGradient>
          <linearGradient id="chipGrad" x1="24" y1="18" x2="40" y2="34" gradientUnits="userSpaceOnUse">
            <stop stop-color="#facc15"/>
            <stop offset="0.6" stop-color="#eab308"/>
            <stop offset="1" stop-color="#854d0e"/>
          </linearGradient>
          <filter id="techGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#0ea5e9" flood-opacity="0.7"/>
          </filter>
        </defs>
        <!-- 3D Laptop Screen Lid -->
        <rect x="11" y="8" width="42" height="30" rx="5" fill="url(#laptopLid)" stroke="#bae6fd" stroke-width="2" filter="url(#techGlow)"/>
        <!-- Inner Glow Display Screen -->
        <rect x="14" y="11" width="36" height="24" rx="3" fill="#030712"/>
        
        <!-- Glowing CPU Microchip in center of screen -->
        <rect x="25" y="16" width="14" height="14" rx="3" fill="url(#chipGrad)" stroke="#fef08a" stroke-width="1.2"/>
        <!-- CPU Pin Leads -->
        <line x1="28" y1="13" x2="28" y2="16" stroke="#facc15" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="32" y1="13" x2="32" y2="16" stroke="#facc15" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="36" y1="13" x2="36" y2="16" stroke="#facc15" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="28" y1="30" x2="28" y2="33" stroke="#facc15" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="32" y1="30" x2="32" y2="33" stroke="#facc15" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="36" y1="30" x2="36" y2="33" stroke="#facc15" stroke-width="1.5" stroke-linecap="round"/>
        
        <!-- Binary Code Elements 0 1 0 1 & Code Brackets -->
        <text x="16" y="21" fill="#38bdf8" font-size="6" font-family="monospace" font-weight="bold">01</text>
        <text x="16" y="29" fill="#34d399" font-size="6" font-family="monospace" font-weight="bold">&lt;/&gt;</text>
        <text x="41" y="21" fill="#38bdf8" font-size="6" font-family="monospace" font-weight="bold">10</text>
        <text x="41" y="29" fill="#a78bfa" font-size="6" font-family="monospace" font-weight="bold">01</text>
        
        <!-- 3D Laptop Keyboard Base & Trackpad -->
        <path d="M5 40h54l-5 9a3 3 0 0 1-2.6 1.5H12.6A3 3 0 0 1 10 49l-5-9z" fill="#1e293b" stroke="#38bdf8" stroke-width="1.8"/>
        <!-- Notch & Trackpad -->
        <path d="M28 41h8v1.5a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V41z" fill="#0284c7"/>
        <rect x="26" y="44" width="12" height="4" rx="1" fill="#334155" stroke="#475569" stroke-width="0.8"/>
      </svg>`
    },
    bangla: {
      gradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 45%, #9f1239 70%, #4c0519 100%)',
      borderGlow: 'rgba(251, 113, 133, 0.85)',
      neonGlow: 'rgba(225, 29, 72, 0.55)',
      icon: `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bookCoverGrad" x1="10" y1="12" x2="54" y2="52" gradientUnits="userSpaceOnUse">
            <stop stop-color="#fda4af"/>
            <stop offset="0.4" stop-color="#e11d48"/>
            <stop offset="1" stop-color="#881337"/>
          </linearGradient>
          <linearGradient id="quillFeatherGrad" x1="42" y1="10" x2="58" y2="44" gradientUnits="userSpaceOnUse">
            <stop stop-color="#fde047"/>
            <stop offset="0.5" stop-color="#f59e0b"/>
            <stop offset="1" stop-color="#d97706"/>
          </linearGradient>
          <filter id="banglaGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#f43f5e" flood-opacity="0.6"/>
          </filter>
        </defs>
        <!-- 3D Open Manuscript / Book -->
        <path d="M8 20c7-4 15-4 24 2 9-6 17-6 24-2v28c-7-4-15-4-24 2-9-6-17-6-24-2V20z" fill="url(#bookCoverGrad)" stroke="#ffe4e6" stroke-width="2.2" filter="url(#banglaGlow)"/>
        <!-- Inner Book Pages Spine -->
        <path d="M32 22v28" stroke="#ffe4e6" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Book Bookmark Ribbon -->
        <path d="M30 46l2 5 2-5v-16h-4v16z" fill="#facc15"/>
        
        <!-- Clean Open Book with Neat Ruled Straight Text Lines (No Bengali characters inside book) -->
        <line x1="14" y1="26" x2="28" y2="26" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.95"/>
        <line x1="14" y1="31" x2="28" y2="31" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.95"/>
        <line x1="14" y1="36" x2="28" y2="36" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.95"/>
        <line x1="14" y1="41" x2="24" y2="41" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.95"/>
        
        <!-- Traditional Colorful Golden Feather Quill Pen (পালকের কলম) -->
        <!-- Feather vane -->
        <path d="M47 10c-7 8-9 17-10 27 3-2 7-3 10-3 0-8 3-16 8-21-2.5-1.2-5.5-2.2-8-3z" fill="url(#quillFeatherGrad)" stroke="#ffffff" stroke-width="1.8"/>
        <!-- Feather spine shaft -->
        <path d="M48 11L35 41" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Metallic Pen Nib & Ink Point -->
        <path d="M36 39l-4 8 7-3-3-5z" fill="#facc15" stroke="#b45309" stroke-width="1.2"/>
        <circle cx="33" cy="46" r="1.5" fill="#1e1b4b"/>
      </svg>`
    },
    general: {
      gradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 40%, #059669 75%, #10b981 100%)',
      borderGlow: 'rgba(52, 211, 153, 0.85)',
      neonGlow: 'rgba(16, 185, 129, 0.55)',
      icon: `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="glossyGreenGrad" x1="12" y1="10" x2="52" y2="54" gradientUnits="userSpaceOnUse">
            <stop stop-color="#34d399"/>
            <stop offset="0.45" stop-color="#059669"/>
            <stop offset="1" stop-color="#022c22"/>
          </linearGradient>
          <filter id="glossyNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#10b981" flood-opacity="0.6"/>
          </filter>
        </defs>
        <!-- Glossy Open Knowledge Book in Emerald & Neon Green -->
        <path d="M10 24a4 4 0 0 1 4-4h16v32H14a4 4 0 0 0-4 4V24z" fill="url(#glossyGreenGrad)" stroke="#a7f3d0" stroke-width="2.2" filter="url(#glossyNeonGlow)"/>
        <path d="M54 24a4 4 0 0 0-4-4H34v32h16a4 4 0 0 1 4 4V24z" fill="url(#glossyGreenGrad)" stroke="#a7f3d0" stroke-width="2.2" filter="url(#glossyNeonGlow)"/>
        <line x1="16" y1="28" x2="26" y2="28" stroke="#ecfdf5" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="16" y1="33" x2="26" y2="33" stroke="#ecfdf5" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="16" y1="38" x2="22" y2="38" stroke="#ecfdf5" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="38" y1="28" x2="48" y2="28" stroke="#ecfdf5" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="38" y1="33" x2="48" y2="33" stroke="#ecfdf5" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="38" y1="38" x2="44" y2="38" stroke="#ecfdf5" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M32 16l3 5 6 .9-4.3 4.2 1 6-5.7-3-5.7 3 1-6L23 21.9l6-.9 3-5z" fill="#facc15" stroke="#ffffff" stroke-width="1.2"/>
      </svg>`
    }
  };

  function getSubjectTheme(subj) {
    if (!subj) return SUBJECT_THEME_MAP.general;
    const sId = (subj.id || '').toLowerCase();
    const sName = [
      subj.titleBn || '',
      subj.titleEn || '',
      subj.name || '',
      subj.tag || '',
      subj.category || ''
    ].join(' ').toLowerCase();

    // 1. ICT (তথ্য ও যোগাযোগ প্রযুক্তি, Computer, Laptop, Programming)
    if (
      sId.includes('ict') ||
      sId.includes('comp') ||
      sId.includes('tech') ||
      sName.includes('তথ্য') ||
      sName.includes('যোগাযোগ') ||
      sName.includes('প্রযুক্তি') ||
      sName.includes('আইসিটি') ||
      sName.includes('ict') ||
      sName.includes('comp') ||
      sName.includes('comput') ||
      sName.includes('laptop') ||
      sName.includes('tech')
    ) {
      return SUBJECT_THEME_MAP.ict;
    }

    // 2. Bangla (বাংলা ১ম ও ২য় পত্র, সাহিত্য, ব্যাকরণ)
    if (
      sId.includes('ban') ||
      sId.includes('beng') ||
      sName.includes('বাংলা') ||
      sName.includes('বাং') ||
      sName.includes('বাঙলা') ||
      sName.includes('bangla') ||
      sName.includes('bengali') ||
      sName.includes('sahitya') ||
      sName.includes('সাহিত্য') ||
      sName.includes('ব্যাকরণ')
    ) {
      return SUBJECT_THEME_MAP.bangla;
    }

    // 3. Chemistry (রসায়ন / রসায়ন)
    if (
      sId.includes('chem') ||
      sName.includes('রসায়ন') ||
      sName.includes('রসায়ন') ||
      sName.includes('chemistry') ||
      sName.includes('chem')
    ) {
      return SUBJECT_THEME_MAP.chem;
    }

    // 4. Mathematics / Higher Math (উচ্চতর গণিত / সাধারণ গণিত)
    if (
      sId.includes('math') ||
      sName.includes('গণিত') ||
      sName.includes('উচ্চতর') ||
      sName.includes('ম্যাথ') ||
      sName.includes('math')
    ) {
      return SUBJECT_THEME_MAP.math;
    }

    // 5. Biology (জীববিজ্ঞান, উদ্ভিদবিজ্ঞান, প্রাণিবিজ্ঞান)
    if (
      sId.includes('bio') ||
      sName.includes('জীব') ||
      sName.includes('উদ্ভিদ') ||
      sName.includes('প্রাণী') ||
      sName.includes('প্রাণি') ||
      sName.includes('bio') ||
      sName.includes('biology')
    ) {
      return SUBJECT_THEME_MAP.bio;
    }

    // 6. Physics (পদার্থবিজ্ঞান)
    if (
      sId.includes('phy') ||
      sName.includes('পদার্থ') ||
      sName.includes('physics')
    ) {
      return SUBJECT_THEME_MAP.phy;
    }

    // 7. English (ইংরেজি)
    if (
      sId.includes('eng') ||
      sName.includes('ইংরেজি') ||
      sName.includes('english')
    ) {
      return SUBJECT_THEME_MAP.eng;
    }

    // 8. General Knowledge (সাধারণ জ্ঞান / জিকে)
    if (
      sId.includes('gk') ||
      sName.includes('সাধারণ জ্ঞান') ||
      sName.includes('জ্ঞান') ||
      sName.includes('জিকে') ||
      sName.includes('gk')
    ) {
      return SUBJECT_THEME_MAP.gk;
    }

    return SUBJECT_THEME_MAP.general;
  }

  function getSubjectExamProgress(subj) {
    try {
      const hist = JSON.parse(localStorage.getItem('sr_exam_history') || '[]');
      if (!hist.length || !subj.chapters || !subj.chapters.length) return 0;
      const chNames = subj.chapters.map(c => c.name);
      let completedChs = 0;
      subj.chapters.forEach(ch => {
        const participated = hist.some(h => (h.examTitle || '').includes(ch.name));
        if (participated) completedChs++;
      });
      return Math.round((completedChs / subj.chapters.length) * 100);
    } catch(e) {
      return 0;
    }
  }

  function renderSubjectsGrid() {
    elements.subjectGrid.innerHTML = '';
    const catBadge = document.getElementById('subjectCategoryTitleBadge');
    if (catBadge) {
      catBadge.textContent = activePortalClass;
    }

    const filtered = State.subjects.filter((subj) => {
      if (!subj.category) return activePortalClass === 'HSC';
      return subj.category === activePortalClass;
    });
    const displayList = filtered.length > 0 ? filtered : State.subjects;
    displayList.forEach((subj) => {
      const theme = getSubjectTheme(subj);
      const card = document.createElement('div');
      card.className = 'subject-card';
      card.style.setProperty('--card-border-glow', theme.borderGlow);
      card.style.setProperty('--card-neon-glow', theme.neonGlow);

      const chCount = subj.chapters ? subj.chapters.length : 0;
      const prog = getSubjectExamProgress(subj);

      card.innerHTML = `
        <div class="subject-card-banner" style="background:${theme.gradient}">
          <div class="subject-3d-icon-wrap">${theme.icon}</div>
          <div class="subject-banner-title">${subj.titleBn}</div>
          <div class="subject-banner-tag">${subj.tag || 'পরীক্ষা ও অনুশীলন'}</div>
        </div>
        <div class="subject-card-footer">
          <div class="subject-footer-top">
            <span class="subject-english-name">${subj.titleEn || subj.titleBn}</span>
            <span class="subject-count-pill">📚 ${chCount}টি অধ্যায়</span>
          </div>
          <div class="subject-progress-wrap">
            <div class="subject-progress-track">
              <div class="subject-progress-bar" style="width:${prog}%;background:${theme.borderGlow}"></div>
            </div>
            <div class="subject-progress-info">
              <span>অগ্রগতি</span>
              <span>${prog}% সম্পন্ন</span>
            </div>
          </div>
        </div>
      `;

      // Subject click -> opens chapters
      card.addEventListener('click', () => {
        openSubjectChapters(subj);
      });

      elements.subjectGrid.appendChild(card);
    });
  }

  function verifyNotBlocked(onProceed) {
    const db = getDB();
    if (!db) { onProceed(); return; }
    const myUid = localStorage.getItem('sr_uid') || '';
    const myRoom = localStorage.getItem('sr-code') || '';

    db.ref('exam_blocked_targets').once('value').then((snap) => {
      const blockedData = snap.val() || {};
      const isUidBlocked = myUid && blockedData[myUid] && blockedData[myUid].blocked;
      const isRoomBlocked = myRoom && blockedData[myRoom] && blockedData[myRoom].blocked;

      if (isUidBlocked || isRoomBlocked) {
        const rsn = (isUidBlocked ? blockedData[myUid].reason : blockedData[myRoom].reason) || 'অ্যাডমিন কর্তৃক পরীক্ষা সাময়িক স্থগিত';
        alert(`🚫 আপনার পরীক্ষা দেওয়ার সুবিধা সাময়িকভাবে স্থগিত করা হয়েছে।\nকারণ: ${rsn}\nঅনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।`);
        return;
      }
      onProceed();
    }).catch(() => {
      onProceed();
    });
  }

  function promptClassChangeRequest() {
    const db = getDB();
    const myUid = localStorage.getItem('sr_uid') || '';
    const myName = localStorage.getItem('sr-name') || 'শিক্ষার্থী';
    const myRoom = localStorage.getItem('sr-code') || '';
    const mySlot = localStorage.getItem('sr-me') || 'p1';
    const curCls = getStudentClass();

    const newCls = prompt(`বর্তমান ক্লাস: ${curCls}\nকোন ক্লাসে পরিবর্তন করতে চান? লিখুন (HSC, SSC বা Admission):`, curCls === 'HSC' ? 'SSC' : 'HSC');
    if (!newCls) return;
    const cleanCls = newCls.trim().toUpperCase();
    if (!['HSC', 'SSC', 'ADMISSION'].includes(cleanCls)) {
      alert('সঠিক ক্লাস নির্বাচন করুন: HSC, SSC অথবা Admission');
      return;
    }

    const year = prompt('পাসের সাল লিখুন (যেমন: 2026):', '2026') || '2026';
    const reason = prompt('ক্লাস পরিবর্তনের কারণ (ঐচ্ছিক):', '') || 'কোর্স পরিবর্তন';

    if (db) {
      db.ref('class_change_requests').push({
        uid: myUid,
        name: myName,
        room: myRoom,
        memberId: mySlot,
        currentClass: curCls,
        requestedClass: cleanCls === 'ADMISSION' ? 'Admission' : cleanCls,
        passingYear: year,
        reason: reason,
        status: 'pending',
        createdAt: Date.now()
      }).then(() => {
        alert('✓ আপনার ক্লাস পরিবর্তনের আবেদন অ্যাডমিনের নিকট সফলভাবে পাঠানো হয়েছে। অ্যাডমিন অনুমোদন দিলে ক্লাস পরিবর্তিত হবে।');
      }).catch((err) => {
        alert('আবেদন পাঠাতে সমস্যা হয়েছে: ' + err.message);
      });
    } else {
      localStorage.setItem('sr_class', cleanCls === 'ADMISSION' ? 'Admission' : cleanCls);
      alert('ক্লাস সফলভাবে পরিবর্তন করা হয়েছে ✓');
      openPortal('subjects');
    }
  }

  function openSubjectChapters(subject) {
    State.currentSubject = subject;
    const theme = getSubjectTheme(subject);
    elements.selectedSubjectTitle.innerText = `${subject.titleBn} (${subject.titleEn || ''})`;
    elements.subjectsListing.style.display = 'none';
    if (elements.chapterExamsListing) elements.chapterExamsListing.style.display = 'none';
    elements.chaptersListing.style.display = 'block';

    elements.chaptersGrid.innerHTML = '';
    elements.chaptersGrid.className = 'chapters-grid-container';
    const chapters = subject.chapters || [];

    if (chapters.length === 0) {
      elements.chaptersGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:30px;color:#94a3b8">
          এই বিষয়ের অধীনে এখনও কোনো চ্যাপ্টার যোগ করা হয়নি।
        </div>
      `;
      return;
    }

    chapters.forEach((ch) => {
      const card = document.createElement('div');
      card.className = 'chapter-graphical-card';
      card.style.setProperty('--card-neon-glow', theme.neonGlow);
      card.innerHTML = `
        <div class="chapter-graphical-banner" style="background:${theme.gradient}">
          <div class="chapter-banner-title">
            <span style="display:inline-flex;align-items:center;margin-right:4px">${theme.icon.replace('width="48" height="48"', 'width="28" height="28"')}</span>
            <span>অধ্যায় ${ch.num}</span>
          </div>
          <span class="chapter-banner-tag">${subject.titleEn || subject.tag || 'HSC'}</span>
        </div>
        <div class="chapter-graphical-body">
          <div class="chapter-graphical-name">${ch.name}</div>
          <div class="chapter-graphical-footer">
            <span style="font-size:12px;color:#94a3b8">মক ও অধ্যায় টেস্ট</span>
            <span class="chapter-graphical-action">
              পরীক্ষা সমূহ ›
            </span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        openChapterExamsList(subject, ch);
      });

      elements.chaptersGrid.appendChild(card);
    });
  }

  // Step 3: Chapter Exams List with Dynamic Test Sets Sync
  function openChapterExamsList(subject, chapter) {
    State.currentSubject = subject;
    State.currentChapter = chapter;

    elements.chaptersListing.style.display = 'none';
    elements.chapterExamsListing.style.display = 'block';
    elements.selectedChapterExamTitle.innerText = `${subject.titleBn} — অধ্যায় ${chapter.num}: ${chapter.name}`;

    // Load previous score preview from history
    let prevBest = null;
    try {
      const hist = JSON.parse(localStorage.getItem('sr_exam_history') || '[]');
      const match = hist.find(h => (h.examTitle || '').includes(chapter.name));
      if (match) prevBest = match;
    } catch(e) {}

    if (prevBest) {
      elements.chapterPrevScoreText.innerText = `প্রাপ্ত স্কোর: ${prevBest.score}/${prevBest.total} (${prevBest.percentage}%)`;
      elements.chapterPrevScoreBadge.innerText = prevBest.percentage >= 80 ? '🌟 চমৎকার প্রস্তুতি' : '🔄 স্কোর উন্নয়নের সুযোগ';
      elements.chapterPrevScoreBadge.style.color = prevBest.percentage >= 80 ? '#34d399' : '#38bdf8';
    } else {
      elements.chapterPrevScoreText.innerText = 'কোনো পূর্ববর্তী রেকর্ড নেই (প্রথম প্রচেষ্টা)';
      elements.chapterPrevScoreBadge.innerText = '✨ নতুন প্রস্তুতি';
      elements.chapterPrevScoreBadge.style.color = '#38bdf8';
    }

    elements.chapterExamsGrid.innerHTML = '<div style="text-align:center;padding:24px;color:#94a3b8">টেস্ট সেটসমূহ লোড হচ্ছে...</div>';

    const db = getDB();
    if (!db) {
      renderDefaultChapterPresets(subject, chapter, 15, []);
      return;
    }

    // Read both exam_chapter_tests, examSets, duration and questions
    Promise.all([
      db.ref('exam_chapter_tests/' + chapter.id).once('value').catch(() => ({ val: () => null })),
      db.ref('examSets/' + chapter.id).once('value').catch(() => ({ val: () => null })),
      db.ref('exam_chapter_durations/' + chapter.id).once('value').catch(() => ({ val: () => 15 })),
      db.ref('exam_questions/' + chapter.id).once('value').catch(() => ({ val: () => [] }))
    ]).then(([testsSnap, setsSnap, durSnap, qSnap]) => {
      elements.chapterExamsGrid.innerHTML = '';
      const customTests = testsSnap.val() || {};
      const customSets = setsSnap.val() || {};
      const mergedTests = Object.assign({}, customTests, customSets);
      const customDur = Number(durSnap.val()) || 15;
      const chapterQuestions = qSnap.val() || [];
      const qArr = Array.isArray(chapterQuestions) ? chapterQuestions : Object.values(chapterQuestions);

      let testList = [];
      if (mergedTests && typeof mergedTests === 'object') {
        testList = Object.keys(mergedTests).map(k => ({ id: k, ...mergedTests[k] }));
      }

      if (testList.length > 0) {
        testList.forEach((testSet) => {
          renderTestSetCard(subject, chapter, testSet);
        });
      } else {
        renderDefaultChapterPresets(subject, chapter, customDur, qArr);
      }
    }).catch(() => {
      elements.chapterExamsGrid.innerHTML = '';
      renderDefaultChapterPresets(subject, chapter, 15, []);
    });
  }

  function renderTestSetCard(subject, chapter, testSet) {
    const qCount = (testSet.questions && testSet.questions.length) || testSet.qCount || 10;
    const dur = testSet.durationMinutes || testSet.timeLimit || 15;
    const card = document.createElement('div');
    card.className = 'q-glass-card student-exam-set-card';
    card.style.cssText = 'background:rgba(15,23,42,0.75);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1.5px solid rgba(255,255,255,0.1);border-radius:14px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;box-shadow:0 8px 32px rgba(0,0,0,0.35);transition:all 0.25s ease;';
    card.innerHTML = `
      <div style="flex:1;min-width:220px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span style="font-size:11px;padding:2px 8px;border-radius:20px;background:rgba(16,185,129,0.18);color:#34d399;font-weight:700">${testSet.tag || 'মক টেস্ট'}</span>
          <span style="font-size:12.5px;color:#94a3b8">⏱ ${dur} মিনিট · 📝 ${qCount}টি প্রশ্ন</span>
        </div>
        <h4 style="margin:0 0 4px;font-size:16px;font-weight:700;color:#f8fafc">${testSet.title}</h4>
        <p style="margin:0;font-size:12.5px;color:#94a3b8">${testSet.desc || 'স্ট্যান্ডার্ড টাইমিং ও পূর্ণাঙ্গ চ্যাপ্টার টেস্ট'}</p>
      </div>
      <button class="btn btn-start-chapter-exam" type="button" style="background:#059669;color:#fff;border:none;padding:10px 18px;border-radius:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px">
        পরীক্ষা শুরু (Exam Start)
      </button>
    `;

    card.querySelector('.btn-start-chapter-exam').addEventListener('click', () => {
      verifyNotBlocked(() => {
        startChapterPracticeExam(subject, chapter, testSet);
      });
    });

    elements.chapterExamsGrid.appendChild(card);
  }

  function renderDefaultChapterPresets(subject, chapter, customDur, chapterQuestions) {
    const hasRealQ = chapterQuestions && chapterQuestions.length > 0;
    const presets = [
      {
        type: 'basic',
        title: `অধ্যায়ভিত্তিক বেসিক টেস্ট — ${chapter.name}`,
        desc: 'পাঠ্যবই ও মূল ধারণার ওপর ভিত্তি করে তৈরি মৌলিক এমসিকিউ সেট',
        qCount: hasRealQ ? Math.min(chapterQuestions.length, 10) : 10,
        durationMinutes: customDur || 10,
        badge: 'মৌলিক ধারণা',
        customQuestions: hasRealQ ? chapterQuestions : null
      },
      {
        type: 'special',
        title: `চ্যাপ্টার স্পেশাল মডেল টেস্ট — ${chapter.name}`,
        desc: 'স্ট্যান্ডার্ড টাইমিং ও পূর্ণাঙ্গ চ্যাপ্টার রিভিশন টেস্ট',
        qCount: hasRealQ ? chapterQuestions.length : 20,
        durationMinutes: customDur ? Math.round(customDur * 1.3) : 20,
        badge: 'মক টেস্ট',
        customQuestions: hasRealQ ? chapterQuestions : null
      },
      {
        type: 'board',
        title: `বিগত বছরের বোর্ড ও ভর্তি প্রশ্ন — ${chapter.name}`,
        desc: 'বিগত বিভিন্ন বোর্ড ও ভর্তি পরীক্ষায় আসা শীর্ষ প্রশ্নাবলী',
        qCount: hasRealQ ? Math.min(chapterQuestions.length, 15) : 15,
        durationMinutes: customDur || 15,
        badge: 'প্রিভিয়াস ইয়ার্স',
        customQuestions: hasRealQ ? chapterQuestions : null
      }
    ];

    presets.forEach(p => renderTestSetCard(subject, chapter, p));
  }

  // 8. Start Practice Exam by Chapter with Preset
  function startChapterPracticeExam(subject, chapter, preset) {
    preset = preset || {
      title: `${subject.titleBn} - অধ্যায় ${chapter.num}: ${chapter.name}`,
      durationMinutes: 15,
      qCount: 10
    };

    const examConfig = {
      id: preset.id || `practice_${chapter.id}_${Date.now()}`,
      title: preset.title,
      subjectId: subject.id,
      chapterId: chapter.id,
      durationMinutes: preset.durationMinutes || preset.timeLimit || 15,
      pdfUrl: preset.pdfUrl || null
    };

    // If preset already has questions (from Admin Test Sets or presets), use immediately!
    if (preset.questions && Array.isArray(preset.questions) && preset.questions.length > 0) {
      examConfig.questions = preset.questions;
      startExam(examConfig);
      return;
    }
    if (preset.customQuestions && Array.isArray(preset.customQuestions) && preset.customQuestions.length > 0) {
      examConfig.questions = preset.customQuestions;
      startExam(examConfig);
      return;
    }

    // Otherwise load questions from DB or built-in bank
    const db = getDB();
    if (db) {
      db.ref(`exam_questions/${chapter.id}`).once('value', (snap) => {
        let qList = snap.val();
        if (qList && Array.isArray(qList) && qList.length > 0) {
          examConfig.questions = qList;
          startExam(examConfig);
        } else if (BUILTIN_QUESTION_BANKS[chapter.id]) {
          examConfig.questions = BUILTIN_QUESTION_BANKS[chapter.id];
          startExam(examConfig);
        } else {
          examConfig.questions = generateFallbackQuestions(chapter.name);
          startExam(examConfig);
        }
      }).catch(() => {
        examConfig.questions = BUILTIN_QUESTION_BANKS[chapter.id] || generateFallbackQuestions(chapter.name);
        startExam(examConfig);
      });
    } else {
      examConfig.questions = BUILTIN_QUESTION_BANKS[chapter.id] || generateFallbackQuestions(chapter.name);
      startExam(examConfig);
    }
  }

  function generateFallbackQuestions(chapterName) {
    return [
      {
        question: `${chapterName} সম্পর্কিত নিচের কোন তথ্যটি সঠিক?`,
        options: [
          'এটি প্রাকৃতিক নিয়মের অপরিবর্তনীয় রূপ',
          'এটি পরীক্ষামূলক প্রমাণের উপর নির্ভরশীল',
          'এটি কেবল তাত্ত্বিক ধারণার সমষ্টি',
          'এর কোনো প্রায়োগিক দিক নেই'
        ],
        correct: 1,
        explanation: `${chapterName} বিষয়ের মৌলিক নিয়মাবলী পরীক্ষামূলক প্রমাণ ও বৈজ্ঞানিক পর্যবেক্ষণের ওপর প্রতিষ্ঠিত।`
      },
      {
        question: `${chapterName}-এর গাণিতিক ও বাস্তব প্রয়োগে কোনটি সর্বাধিক গুরুত্বপূর্ণ?`,
        options: [
          'এককের সঠিক রূপান্তর ও মাত্রা যাচাই',
          'কেবল সূত্রের মুখস্থ উপস্থাপন',
          'গ্রাফের অপ্রাসঙ্গিক অঙ্কন',
          'হিসাব পরিহার করা'
        ],
        correct: 0,
        explanation: 'যেকোনো বৈজ্ঞানিক ও প্রকৌশল গণনায় এসআই (SI) এককের সঠিক রূপান্তর এবং নির্ভুল হিসাব সর্বাধিক গুরুত্বপূর্ণ।'
      },
      {
        question: 'ভর্তি ও বোর্ড পরীক্ষায় ভালো ফলাফলের মূল চাবিকাঠি কোনটি?',
        options: [
          'নিয়মিত মডেল টেস্ট ও ভুল থেকে শিক্ষা নেওয়া',
          'পরীক্ষার আগের রাতে না ঘুমানো',
          'কোনো প্রশ্ন অনুশীলন না করা',
          'কেবল শর্টকাটের ওপর নির্ভর করা'
        ],
        correct: 0,
        explanation: 'নিয়মিত সময় মেনে অনুশীলন ও পরীক্ষা দিয়ে ভুল বিশ্লেষণ করা সাফল্য নিশ্চিত করে।'
      }
    ];
  }

  // 9. Load Assigned Exams
  function loadAssignedExamsFromDB() {
    const db = getDB();

    if (!db) {
      renderEmptyAssignedState();
      return;
    }

    db.ref('assigned_exams').once('value', (snap) => {
      const val = snap.val();
      if (!val || typeof val !== 'object') {
        renderEmptyAssignedState();
        return;
      }

      const list = Object.keys(val).map((k) => ({
        id: k,
        ...val[k]
      }));

      // Filter for this class category
      const filtered = list.filter((ex) => {
        if (ex.category && ex.category !== 'all' && ex.category !== activePortalClass) {
          return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        renderEmptyAssignedState();
      } else {
        renderAssignedExamsList(filtered);
      }
    }).catch(() => {
      renderEmptyAssignedState();
    });
  }

  function checkExamAccess(ex) {
    if (!ex.target || ex.target === 'all') return true;
    const myUid = localStorage.getItem('sr_uid') || '';
    const myRoom = localStorage.getItem('sr-code') || '';
    if (ex.target === 'room') {
      return !ex.targetValue || ex.targetValue === 'all' || ex.targetValue === myRoom;
    }
    if (ex.target === 'uid') {
      return !ex.targetValue || ex.targetValue === 'all' || ex.targetValue === myUid;
    }
    return true;
  }

  function renderEmptyAssignedState() {
    elements.assignedList.innerHTML = `
      <div style="text-align:center;padding:48px 20px;color:#94a3b8;background:rgba(255,255,255,0.02);border:1.5px dashed rgba(255,255,255,0.08);border-radius:16px">
        <div style="font-size:36px;margin-bottom:10px">📅</div>
        <h4 style="margin:0 0 6px 0;font-size:17px;color:#f8fafc;font-weight:600">বর্তমানে কোনো নির্ধারিত পরীক্ষা নেই</h4>
        <p style="margin:0;font-size:13px;color:#64748b">অ্যাডমিন প্যানেল থেকে নতুন পরীক্ষা শিডিউল বা অ্যাসাইন করা হলে এখানে প্রদর্শিত হবে।</p>
      </div>
    `;
  }

  function renderAssignedExamsList(exams) {
    elements.assignedList.innerHTML = '';
    exams.forEach((ex) => {
      const card = document.createElement('div');
      card.className = 'assigned-exam-card';
      const qCount = ex.questions ? ex.questions.length : (ex.totalQuestions || 10);
      const isAllowed = checkExamAccess(ex);

      card.innerHTML = `
        <div class="assigned-exam-info">
          <h4>${ex.title}</h4>
          <div class="assigned-exam-meta">
            <span>📚 ${ex.subjectName || 'পূর্ণাঙ্গ পরীক্ষা'}</span>
            <span>⏱ ${ex.durationMinutes} মিনিট</span>
            <span>📝 ${qCount}টি প্রশ্ন</span>
            <span>📅 ${ex.scheduledDate || 'আজকে'}</span>
          </div>
          ${!isAllowed ? `
            <div style="background:rgba(239,68,68,0.12);border:1px dashed #ef4444;border-radius:8px;padding:6px 10px;margin-top:8px;display:inline-flex;align-items:center;gap:6px">
              <span style="font-size:14px">🔒</span>
              <span style="font-size:12px;color:#fca5a5;font-weight:600">অ্যাডমিন এখনও এই পরীক্ষার অ্যাক্সেস দেননি</span>
            </div>
          ` : ''}
        </div>
        <div class="assigned-exam-actions">
          ${ex.pdfUrl ? `<a href="${ex.pdfUrl}" target="_blank" class="btn-view-pdf">📄 প্রশ্ন PDF</a>` : ''}
          ${isAllowed ? `
            <button class="btn-start-assigned" type="button">
              <span>▶</span> পরীক্ষা শুরু করুন
            </button>
          ` : `
            <button class="btn-start-assigned" type="button" disabled style="background:#334155;color:#94a3b8;cursor:not-allowed;opacity:0.8">
              <span>🔒</span> লক করা
            </button>
          `}
        </div>
      `;

      if (isAllowed) {
        card.querySelector('.btn-start-assigned').addEventListener('click', () => {
          if (!ex.questions || ex.questions.length === 0) {
            ex.questions = BUILTIN_QUESTION_BANKS.chem2_ch1;
          }
          startExam(ex);
        });
      }

      elements.assignedList.appendChild(card);
    });
  }

  // 10. Start Exam Session
  function startExam(exam) {
    State.activeExam = exam;
    State.activeQuestions = exam.questions || [];
    State.currentQIndex = 0;
    State.userAnswers = {};
    State.flaggedQuestions.clear();
    State.tabSwitchCount = 0;
    State.isExamRunning = true;
    State.penaltyApplied = false;
    State.startTime = Date.now();

    const durationMin = Number(exam.durationMinutes) || 15;
    State.totalDurationSeconds = durationMin * 60;
    State.timeRemainingSeconds = State.totalDurationSeconds;

    // Header info
    elements.activeBadge.innerText = `সময়: ${durationMin} মিনিট | মোট প্রশ্ন: ${State.activeQuestions.length}`;
    elements.activeSubTitle.innerText = exam.title;

    if (exam.pdfUrl) {
      elements.pdfToggle.style.display = 'block';
      elements.pdfLink.href = exam.pdfUrl;
    } else {
      elements.pdfToggle.style.display = 'none';
    }

    elements.totalQNum.innerText = State.activeQuestions.length;

    // Show active exam panel
    Object.keys(elements.panels).forEach((k) => elements.panels[k].classList.remove('active'));
    elements.panels.activeExam.classList.add('active');

    // Reset interaction states
    if (elements.optionsContainer) {
      elements.optionsContainer.style.pointerEvents = 'auto';
      elements.optionsContainer.style.opacity = '1';
    }
    if (elements.prevBtn) elements.prevBtn.disabled = false;
    if (elements.nextBtn) elements.nextBtn.disabled = false;
    if (elements.btnConfirmSubmit) elements.btnConfirmSubmit.disabled = false;

    // Load first question & timer
    loadQuestion(0);
    renderQuestionPalette();
    startCountdownTimer();
  }

  // 11. Load & Render Individual Question
  function loadQuestion(index) {
    if (index < 0 || index >= State.activeQuestions.length) return;
    State.currentQIndex = index;
    const q = State.activeQuestions[index];

    elements.currentQNum.innerText = index + 1;
    elements.qText.innerText = `${index + 1}. ${q.question}`;

    // Options rendering
    elements.optionsContainer.innerHTML = '';
    const letters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];
    (q.options || []).forEach((opt, optIdx) => {
      const isSelected = State.userAnswers[index] === optIdx;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `exam-option-item ${isSelected ? 'selected' : ''}`;
      btn.innerHTML = `
        <span class="exam-option-letter">${letters[optIdx] || optIdx + 1}</span>
        <span style="flex-grow:1">${opt}</span>
      `;
      btn.addEventListener('click', () => {
        selectOption(optIdx);
      });
      elements.optionsContainer.appendChild(btn);
    });

    // Flag status
    const isFlagged = State.flaggedQuestions.has(index);
    elements.flagBtn.classList.toggle('flagged', isFlagged);
    elements.flagText.innerText = isFlagged ? 'চিহ্নিত করা হয়েছে' : 'পরে দেখার জন্য চিহ্নিত করুন';

    // Prev / Next button states
    elements.prevBtn.disabled = index === 0;
    if (index === State.activeQuestions.length - 1) {
      elements.nextBtn.innerText = 'শেষ প্রশ্ন ✓';
    } else {
      elements.nextBtn.innerText = 'পরবর্তী →';
    }

    renderQuestionPalette();
  }

  function selectOption(optIdx) {
    State.userAnswers[State.currentQIndex] = optIdx;
    loadQuestion(State.currentQIndex);
  }

  function navigateQuestion(step) {
    const nextIdx = State.currentQIndex + step;
    if (nextIdx >= 0 && nextIdx < State.activeQuestions.length) {
      loadQuestion(nextIdx);
    }
  }

  function toggleFlag() {
    const idx = State.currentQIndex;
    if (State.flaggedQuestions.has(idx)) {
      State.flaggedQuestions.delete(idx);
    } else {
      State.flaggedQuestions.add(idx);
    }
    loadQuestion(idx);
  }

  function renderQuestionPalette() {
    elements.paletteGrid.innerHTML = '';
    State.activeQuestions.forEach((_, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isAnswered = State.userAnswers.hasOwnProperty(idx);
      const isFlagged = State.flaggedQuestions.has(idx);
      const isCurrent = idx === State.currentQIndex;

      let cls = 'palette-num-btn';
      if (isFlagged) cls += ' flagged';
      else if (isAnswered) cls += ' answered';

      if (isCurrent) cls += ' current';

      btn.className = cls;
      btn.innerText = idx + 1;
      btn.addEventListener('click', () => {
        loadQuestion(idx);
      });
      elements.paletteGrid.appendChild(btn);
    });
  }

  // 12. Traditional School Bell Audio Synthesizer (Web Audio API)
  function playSchoolBellSound() {
    if (State.soundMuted) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      // Traditional 4-strike school bell chime
      [0.0, 0.45, 0.9, 1.35].forEach((t) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(830, now + t); // Resonant chime frequency
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1660, now + t); // Octave harmonic

        gain.gain.setValueAtTime(0.35, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.42);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now + t);
        osc2.start(now + t);
        osc1.stop(now + t + 0.45);
        osc2.stop(now + t + 0.45);
      });
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // 12. Live Countdown Timer with Dynamic Circular Progress & Heartbeat Alert
  function startCountdownTimer() {
    clearInterval(State.timerInterval);
    updateTimerDisplay();

    State.timerInterval = setInterval(() => {
      State.timeRemainingSeconds--;
      updateTimerDisplay();

      if (State.timeRemainingSeconds <= 0) {
        clearInterval(State.timerInterval);
        State.timeRemainingSeconds = 0;
        updateTimerDisplay();

        // 1. Play school bell sound
        playSchoolBellSound();

        // 2. Lock option clicks and actions immediately
        if (elements.optionsContainer) {
          elements.optionsContainer.style.pointerEvents = 'none';
          elements.optionsContainer.style.opacity = '0.65';
        }
        if (elements.prevBtn) elements.prevBtn.disabled = true;
        if (elements.nextBtn) elements.nextBtn.disabled = true;
        if (elements.btnConfirmSubmit) elements.btnConfirmSubmit.disabled = true;

        // 3. Wait 2.5 seconds before showing final result
        setTimeout(() => {
          finalizeExam(false, 'সময় শেষ হয়ে গেছে! উত্তরপত্র স্বয়ংক্রিয়ভাবে জমা নেওয়া হলো।');
        }, 2500);
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const rem = Math.max(0, State.timeRemainingSeconds);
    const mins = Math.floor(rem / 60);
    const secs = rem % 60;
    const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    if (elements.timerDisplay) {
      elements.timerDisplay.innerText = timeFormatted;
    }

    // Circular progress calculation
    const totalSecs = State.totalDurationSeconds || 900;
    const circumference = 263.89; // 2 * PI * 42
    const progressRatio = Math.max(0, Math.min(1, rem / totalSecs));
    const strokeOffset = circumference * (1 - progressRatio);

    if (elements.circularTimerProgress) {
      elements.circularTimerProgress.style.strokeDashoffset = strokeOffset;
    }

    // Red color and Heartbeat animation when <= 60 seconds (1 minute remaining)
    const isCritical = (rem <= 60 && rem > 0);
    if (elements.circularTimerProgress) {
      elements.circularTimerProgress.classList.toggle('timer-critical', isCritical);
    }
    if (elements.timerDisplay) {
      elements.timerDisplay.classList.toggle('timer-critical', isCritical);
    }
    if (elements.circularTimerContainer) {
      elements.circularTimerContainer.classList.toggle('timer-heartbeat-anim', isCritical);
    }

    // Fallback timer box if visible
    if (elements.timerBox) {
      if (isCritical) {
        elements.timerBox.style.background = 'rgba(239, 68, 68, 0.25)';
        elements.timerBox.style.borderColor = '#ef4444';
      } else {
        elements.timerBox.style.background = 'rgba(239, 68, 68, 0.12)';
        elements.timerBox.style.borderColor = 'rgba(239, 68, 68, 0.35)';
      }
    }
  }

  // 13. Strict Proctoring / Leave Warning (20s Return Penalty System)
  function handleVisibilityOrBlur() {
    if (!State.isExamRunning) return;

    if (document.hidden) {
      triggerStrictLeaveWarning();
    }
  }

  function triggerStrictLeaveWarning() {
    if (!State.isExamRunning) return;
    State.tabSwitchCount++;

    // Max 1 leave allowed! If 2nd violation occurs, immediate Zero Marks!
    if (State.tabSwitchCount >= 2) {
      clearInterval(State.leaveCountdownInterval);
      elements.strictOverlay.classList.remove('active');
      finalizeExam(true, 'বারবার নিয়ম লঙ্ঘন করায় আপনার পরীক্ষা ০ নম্বরে বাতিল করা হয়েছে!');
      return;
    }

    // 1st leave: Show overlay and run emergency 20s timer
    State.leaveCountdownSeconds = 20;
    elements.countdownDisplay.innerText = `${State.leaveCountdownSeconds} সেকেন্ড`;
    elements.strictOverlay.classList.add('active');

    clearInterval(State.leaveCountdownInterval);
    State.leaveCountdownInterval = setInterval(() => {
      State.leaveCountdownSeconds--;
      elements.countdownDisplay.innerText = `${State.leaveCountdownSeconds} সেকেন্ড`;

      if (State.leaveCountdownSeconds <= 0) {
        clearInterval(State.leaveCountdownInterval);
        elements.strictOverlay.classList.remove('active');
        // Failed to return within 20 seconds -> 0 marks penalty!
        finalizeExam(true, '২০ সেকেন্ডের মধ্যে পরীক্ষায় ফিরে না আসায় ০ নম্বরে পরীক্ষা বাতিল হলো!');
      }
    }, 1000);
  }

  function closeStrictWarning() {
    clearInterval(State.leaveCountdownInterval);
    elements.strictOverlay.classList.remove('active');
  }

  // 14. Exam Submission Modal & Calculation
  function showConfirmSubmitModal() {
    const total = State.activeQuestions.length;
    const answered = Object.keys(State.userAnswers).length;
    const remaining = total - answered;

    elements.confirmMsg.innerHTML = `
      আপনি মোট <strong>${total}টি</strong> প্রশ্নের মধ্যে <strong>${answered}টি</strong> উত্তর দিয়েছেন।
      ${remaining > 0 ? `<br><span style="color:#f87171">এখনও <strong>${remaining}টি</strong> প্রশ্নের উত্তর দেওয়া বাকি রয়েছে!</span>` : ''}
    `;
    elements.confirmOverlay.classList.add('active');
  }

  function finalizeExam(isPenaltyZero = false, customReason = null) {
    State.isExamRunning = false;
    clearInterval(State.timerInterval);
    clearInterval(State.leaveCountdownInterval);
    elements.strictOverlay.classList.remove('active');
    elements.confirmOverlay.classList.remove('active');

    const total = State.activeQuestions.length;
    let correctCount = 0;

    State.activeQuestions.forEach((q, idx) => {
      if (State.userAnswers[idx] === q.correct) {
        correctCount++;
      }
    });

    const timeSpentSeconds = Math.max(1, State.totalDurationSeconds - State.timeRemainingSeconds);
    const timeSpentFormatted = `${Math.floor(timeSpentSeconds / 60)} মি. ${timeSpentSeconds % 60} সে.`;

    let finalScore = correctCount;
    let finalPercentage = Math.round((correctCount / total) * 100);

    if (isPenaltyZero) {
      State.penaltyApplied = true;
      finalScore = 0;
      finalPercentage = 0;
    }

    // Render Result Screen
    elements.resScore.innerText = `${finalScore}/${total}`;
    elements.resPercentage.innerText = `${finalPercentage}%`;
    elements.resCorrect.innerText = isPenaltyZero ? 0 : correctCount;
    elements.resWrong.innerText = isPenaltyZero ? total : total - correctCount;
    elements.resTime.innerText = timeSpentFormatted;

    if (isPenaltyZero) {
      elements.resultHeroCard.className = 'result-hero-card failed';
      elements.resultHeroIcon.innerText = '⚠️';
      elements.resultHeroTitle.innerText = 'নিয়ম লঙ্ঘনের কারণে বাতিল (০ নম্বর)';
      elements.resultHeroSub.innerText = customReason || 'ট্যাব পরিবর্তন বা ২০ সেকেন্ডের মধ্যে না ফেরায় পরীক্ষা ০ হিসেবে ধার্য করা হয়েছে।';
    } else if (finalPercentage >= 50) {
      elements.resultHeroCard.className = 'result-hero-card success';
      elements.resultHeroIcon.innerText = '🏆';
      elements.resultHeroTitle.innerText = 'অভিনন্দন! পরীক্ষা সফলভাবে সম্পন্ন!';
      elements.resultHeroSub.innerText = customReason || 'আপনার ফলাফল এবং উত্তরপত্র বিশ্লেষণ নিচে দেওয়া হলো।';
    } else {
      elements.resultHeroCard.className = 'result-hero-card failed';
      elements.resultHeroIcon.innerText = '📊';
      elements.resultHeroTitle.innerText = 'পরীক্ষা সম্পন্ন (আরও অনুশীলন প্রয়োজন)';
      elements.resultHeroSub.innerText = customReason || 'নিচের ব্যাখ্যাগুলো পড়ে ভুলগুলো সংশোধন করে নিন।';
    }

    // Render Detailed Solutions
    renderSolutionReview(isPenaltyZero);

    // Save to Firebase RTDB Leaderboard
    saveSubmissionToLeaderboard({
      score: finalScore,
      total: total,
      percentage: finalPercentage,
      timeSpentSeconds: timeSpentSeconds,
      penalty: isPenaltyZero,
      examTitle: State.activeExam ? State.activeExam.title : 'অনুশীলন পরীক্ষা'
    });

    // Switch view to result
    Object.keys(elements.panels).forEach((k) => elements.panels[k].classList.remove('active'));
    elements.panels.result.classList.add('active');
  }

  function renderSolutionReview(isPenaltyZero = false, filter = 'all') {
    elements.solutionContainer.innerHTML = '';
    const letters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];

    // Update count badges
    const countAllEl = document.getElementById('countAllQ');
    const countCorrectEl = document.getElementById('countCorrectQ');
    const countWrongEl = document.getElementById('countWrongQ');

    let countCorrect = 0;
    let countWrong = 0;
    State.activeQuestions.forEach((q, idx) => {
      const userAnsIdx = State.userAnswers[idx];
      if (userAnsIdx === q.correct) {
        countCorrect++;
      } else {
        countWrong++;
      }
    });

    if (countAllEl) countAllEl.innerText = State.activeQuestions.length;
    if (countCorrectEl) countCorrectEl.innerText = countCorrect;
    if (countWrongEl) countWrongEl.innerText = countWrong;

    let itemsToShow = [];
    State.activeQuestions.forEach((q, idx) => {
      const userAnsIdx = State.userAnswers[idx];
      const isCorrect = userAnsIdx === q.correct;
      const isAnswered = State.userAnswers.hasOwnProperty(idx);

      if (filter === 'correct' && !isCorrect) return;
      if (filter === 'wrong' && isCorrect) return;

      itemsToShow.push({ q, idx, userAnsIdx, isCorrect, isAnswered });
    });

    if (itemsToShow.length === 0) {
      elements.solutionContainer.innerHTML = `
        <div style="text-align:center;padding:28px 18px;background:#1e293b;border-radius:12px;border:1px dashed rgba(255,255,255,0.15);color:#94a3b8">
          ${filter === 'wrong' ? '🎉 দারুণ! কোনো ভুল উত্তর নেই। সকল প্রশ্নের উত্তর সঠিক হয়েছে!' : 'এই ফিল্টারে কোনো প্রশ্ন খুঁজে পাওয়া যায়নি।'}
        </div>
      `;
      return;
    }

    itemsToShow.forEach(({ q, idx, userAnsIdx, isCorrect, isAnswered }) => {
      const item = document.createElement('div');
      item.className = 'review-item-card';

      let statusBadge = '';
      if (!isAnswered) {
        statusBadge = `<span class="review-status-pill skipped">অনুত্তর</span>`;
      } else if (isCorrect) {
        statusBadge = `<span class="review-status-pill correct">✓ সঠিক উত্তর</span>`;
      } else {
        statusBadge = `<span class="review-status-pill wrong">✕ ভুল উত্তর</span>`;
      }

      const userChoiceText = isAnswered && q.options[userAnsIdx] ? `${letters[userAnsIdx]}. ${q.options[userAnsIdx]}` : 'কোনো উত্তর দেওয়া হয়নি';
      const correctChoiceText = q.options[q.correct] ? `${letters[q.correct]}. ${q.options[q.correct]}` : '';

      item.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:13px;font-weight:700;color:#94a3b8">প্রশ্ন #${idx + 1}</span>
          ${statusBadge}
        </div>
        <h5 style="margin:8px 0 12px 0;font-size:16px;font-weight:700;color:#f8fafc">${q.question}</h5>
        <div style="display:grid;grid-template-columns:1fr;gap:6px;font-size:13.5px">
          <div style="color:${isCorrect ? '#34d399' : '#f87171'}"><strong>আপনার নির্বাচন:</strong> ${userChoiceText}</div>
          <div style="color:#38bdf8"><strong>সঠিক উত্তর:</strong> ${correctChoiceText}</div>
        </div>
        ${q.explanation ? `<div class="review-explanation-box"><strong>ব্যাখ্যা:</strong> ${q.explanation}</div>` : ''}
      `;

      elements.solutionContainer.appendChild(item);
    });
  }

  // 15. Save to Firebase RTDB & Load Leaderboard
  let cachedLeaderboardRows = [];

  function saveSubmissionToLeaderboard(subData) {
    const db = getDB();

    let studentName = (localStorage.getItem('sr-name') || '').trim();
    const meSlot = localStorage.getItem('sr-me');
    const roomCode = localStorage.getItem('sr-code') || '14320';

    if (!studentName || studentName === 'শিক্ষার্থী' || studentName === 'সদস্য') {
      if (roomCode === '1432014310' || meSlot === 'p1' || meSlot === 'p2') {
        studentName = (meSlot === 'p2') ? (localStorage.getItem('vip_p2_name') || 'রহমান') : (localStorage.getItem('vip_p1_name') || 'তাসফিয়া হাসান');
      } else if (window.P && window.me && window.P[window.me] && window.P[window.me].name) {
        studentName = window.P[window.me].name;
      }
    }
    if (!studentName || studentName === 'শিক্ষার্থী' || studentName === 'সদস্য') {
      studentName = (meSlot === 'p2') ? 'রহমান' : 'তাসফিয়া হাসান';
    }

    const myUid = localStorage.getItem('sr_uid') || '';
    const myClass = localStorage.getItem('sr_class') || 'HSC';

    let roomName = localStorage.getItem('sr_room_name');
    if (!roomName || roomName === roomCode || /^\d{4,}$/.test(roomName)) {
      roomName = (roomCode === '1432014310') ? 'Queen Room' : 'অধ্যয়ন কক্ষ';
    }

    const submission = {
      name: studentName,
      uid: myUid,
      room: roomCode,
      roomName: roomName,
      examTitle: subData.examTitle,
      score: subData.score,
      total: subData.total,
      percentage: subData.percentage,
      timeSpentSeconds: subData.timeSpentSeconds,
      penalty: subData.penalty,
      classCategory: myClass,
      timestamp: Date.now()
    };

    if (db) {
      db.ref('exam_leaderboard').push(submission).catch((err) => {
        console.warn('Leaderboard save failed:', err);
      });
      if (myUid && studentName && studentName !== 'শিক্ষার্থী' && studentName !== 'সদস্য') {
        db.ref('numeric_uids/' + myUid).update({ name: studentName, roomId: roomCode }).catch(() => {});
      }
    }

    // Save to user_exam_history for personal history
    const histRecord = {
      examTitle: subData.examTitle,
      score: subData.score,
      total: subData.total,
      percentage: subData.percentage,
      timeSpentSeconds: subData.timeSpentSeconds,
      penalty: subData.penalty,
      timestamp: Date.now(),
      questions: State.activeQuestions,
      userAnswers: State.userAnswers
    };

    if (db && myUid) {
      db.ref(`user_exam_history/${myUid}`).push(histRecord).catch((err) => {
        console.warn('History save to db failed:', err);
      });
    }

    try {
      const localHist = JSON.parse(localStorage.getItem('sr_exam_history') || '[]');
      localHist.unshift(histRecord);
      localStorage.setItem('sr_exam_history', JSON.stringify(localHist.slice(0, 30)));
    } catch(e) {}
  }

  let activeLeaderboardFilter = null;

  function filterAndRenderLeaderboard(filterVal, displayLabel) {
    activeLeaderboardFilter = filterVal;
    const badge = document.getElementById('activeFilterBadge');
    const clearBtn = document.getElementById('btnClearFilter');

    if (!filterVal || filterVal === 'all') {
      if (badge) badge.style.display = 'none';
      if (clearBtn) clearBtn.style.display = 'none';
      renderLeaderboardRows(cachedLeaderboardRows);
    } else {
      if (badge) {
        badge.textContent = `ফিল্টার: ${displayLabel || filterVal}`;
        badge.style.display = 'inline-block';
      }
      if (clearBtn) clearBtn.style.display = 'inline-block';
      const term = filterVal.toLowerCase().trim();
      const filtered = cachedLeaderboardRows.filter(r => {
        const t = (r.examTitle || '').toLowerCase();
        return t === term || t.includes(term);
      });
      renderLeaderboardRows(filtered);
    }
  }

  function openLeaderboardFilterModal() {
    window.openLeaderboardFilterModal = openLeaderboardFilterModal;
    let existing = document.getElementById('lbFilterModalOverlay');
    if (existing) {
      existing.style.display = 'none';
      existing.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'lbFilterModalOverlay';
    overlay.className = 'exam-modal-overlay active';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:100005;padding:16px;opacity:1;pointer-events:auto;';
    overlay.innerHTML = `
      <div class="exam-modal-container" style="max-width:540px;width:100%;background:#0f172a;border:1.5px solid rgba(255,255,255,0.15);border-radius:18px;padding:24px;box-shadow:0 24px 60px rgba(0,0,0,0.8);position:relative;z-index:100010">
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:14px;margin-bottom:16px">
          <h3 style="margin:0;font-size:18px;font-weight:700;color:#f8fafc;display:flex;align-items:center;gap:8px">
            <span>🔍</span> লিডারবোর্ড ফিল্টার
          </h3>
          <button type="button" id="btnCloseLbFilter" style="background:transparent;border:none;color:#94a3b8;font-size:24px;cursor:pointer;line-height:1;padding:0 6px">×</button>
        </div>
        <div id="lbFilterStepsContainer"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    const close = () => {
      overlay.classList.remove('active');
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';
      overlay.remove();
      window.removeEventListener('keydown', escHandler);
    };

    const escHandler = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', escHandler);

    document.getElementById('btnCloseLbFilter').onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };

    const container = document.getElementById('lbFilterStepsContainer');

    function renderSubjectStep() {
      container.innerHTML = `
        <p style="font-size:14px;color:#94a3b8;margin:0 0 12px 0">১. বিষয় নির্বাচন করুন:</p>
        <div style="display:grid;grid-template-columns:1fr;gap:8px;max-height:280px;overflow-y:auto;padding-right:4px">
          <button type="button" class="btn lb-step-btn" data-type="all" style="text-align:left;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#34d399;font-weight:700;padding:12px 14px;border-radius:10px">
            ✨ সকল পরীক্ষা ও বিষয় (সব দেখুন)
          </button>
          ${State.subjects.map(s => `
            <button type="button" class="btn lb-step-btn" data-type="subject" data-subjid="${s.id}" style="text-align:left;background:#1e293b;border:1px solid rgba(255,255,255,0.08);color:#f8fafc;font-weight:600;padding:12px 14px;border-radius:10px;display:flex;align-items:center;justify-content:space-between">
              <span>${s.titleBn}</span>
              <span style="font-size:12px;color:#38bdf8">${(s.chapters || []).length}টি অধ্যায় ›</span>
            </button>
          `).join('')}
        </div>
      `;

      container.querySelectorAll('.lb-step-btn').forEach(btn => {
        btn.onclick = () => {
          const type = btn.getAttribute('data-type');
          if (type === 'all') {
            filterAndRenderLeaderboard('all');
            close();
          } else {
            const sid = btn.getAttribute('data-subjid');
            const subj = State.subjects.find(x => x.id === sid);
            if (subj) renderChapterStep(subj);
          }
        };
      });
    }

    function renderChapterStep(subj) {
      const chapters = subj.chapters || [];
      container.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <button type="button" id="btnBackToSubjStep" style="background:transparent;border:none;color:#60a5fa;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:4px">← বিষয় পরিবর্তনে ফিরুন</button>
          <span style="font-size:13px;color:#94a3b8;font-weight:600">${subj.titleBn}</span>
        </div>
        <p style="font-size:14px;color:#94a3b8;margin:0 0 12px 0">২. অধ্যায় বা ফিল্টার লেভেল নির্বাচন করুন:</p>
        <div style="display:grid;grid-template-columns:1fr;gap:8px;max-height:280px;overflow-y:auto;padding-right:4px">
          <button type="button" class="btn lb-sub-all-btn" style="text-align:left;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.4);color:#93c5fd;font-weight:700;padding:12px 14px;border-radius:10px">
            🎯 "${subj.titleBn}"-এর সকল পরীক্ষা
          </button>
          ${chapters.map((ch, idx) => `
            <button type="button" class="btn lb-chap-btn" data-idx="${idx}" style="text-align:left;background:#1e293b;border:1px solid rgba(255,255,255,0.08);color:#f8fafc;font-weight:600;padding:12px 14px;border-radius:10px;display:flex;align-items:center;justify-content:space-between">
              <span>অধ্যায় ${ch.num}: ${ch.name}</span>
              <span style="font-size:12px;color:#38bdf8">পরীক্ষা তালিকা ›</span>
            </button>
          `).join('')}
        </div>
      `;

      document.getElementById('btnBackToSubjStep').onclick = renderSubjectStep;
      container.querySelector('.lb-sub-all-btn').onclick = () => {
        filterAndRenderLeaderboard(subj.titleBn, subj.titleBn);
        close();
      };

      container.querySelectorAll('.lb-chap-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          const ch = chapters[idx];
          if (ch) renderExamStep(subj, ch);
        };
      });
    }

    function renderExamStep(subj, ch) {
      container.innerHTML = `<p style="text-align:center;padding:24px;color:#94a3b8">পরীক্ষা তালিকা লোড হচ্ছে...</p>`;
      const db = getDB();

      Promise.all([
        db ? db.ref('exam_chapter_tests/' + ch.id).once('value').catch(() => ({ val: () => null })) : Promise.resolve({ val: () => null }),
        db ? db.ref('examSets/' + ch.id).once('value').catch(() => ({ val: () => null })) : Promise.resolve({ val: () => null })
      ]).then(([s1, s2]) => {
        const tests1 = s1.val() || {};
        const tests2 = s2.val() || {};
        const allSets = Object.assign({}, tests1, tests2);
        const setTitles = Object.values(allSets).map(s => s && s.title).filter(Boolean);

        // Find matching exam titles from cached rows or default presets
        const searchKey = ch.name;
        const matchingRows = cachedLeaderboardRows.filter(r => (r.examTitle || '').includes(searchKey));
        const historyTitles = matchingRows.map(r => r.examTitle).filter(Boolean);

        const examTitles = Array.from(new Set([...setTitles, ...historyTitles]));
        if (examTitles.length === 0) {
          examTitles.push(`${subj.titleBn} - অধ্যায় ${ch.num}: ${ch.name}`);
          examTitles.push(`অধ্যায়ভিত্তিক বেসিক টেস্ট — ${ch.name}`);
          examTitles.push(`চ্যাপ্টার স্পেশাল মডেল টেস্ট — ${ch.name}`);
        }

        container.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <button type="button" id="btnBackToChapStep" style="background:transparent;border:none;color:#60a5fa;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:4px">← অধ্যায় তালিকায় ফিরুন</button>
            <span style="font-size:13px;color:#94a3b8;font-weight:600">অধ্যায় ${ch.num}</span>
          </div>
          <p style="font-size:14px;color:#94a3b8;margin:0 0 12px 0">৩. নির্দিষ্ট পরীক্ষা নির্বাচন করুন:</p>
          <div style="display:grid;grid-template-columns:1fr;gap:8px;max-height:280px;overflow-y:auto;padding-right:4px">
            <button type="button" class="btn lb-all-ch-btn" style="text-align:left;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);color:#34d399;font-weight:700;padding:12px 14px;border-radius:10px">
              ⭐ এই অধ্যায়ের সকল পরীক্ষা
            </button>
            ${examTitles.map(t => `
              <button type="button" class="btn lb-spec-exam-btn" data-title="${t}" style="text-align:left;background:#1e293b;border:1px solid rgba(255,255,255,0.08);color:#f8fafc;font-weight:600;padding:12px 14px;border-radius:10px">
                📝 ${t}
              </button>
            `).join('')}
          </div>
        `;

        document.getElementById('btnBackToChapStep').onclick = () => renderChapterStep(subj);
        container.querySelector('.lb-all-ch-btn').onclick = () => {
          filterAndRenderLeaderboard(ch.name, `অধ্যায় ${ch.num}: ${ch.name}`);
          close();
        };

        container.querySelectorAll('.lb-spec-exam-btn').forEach(btn => {
          btn.onclick = () => {
            const t = btn.getAttribute('data-title');
            filterAndRenderLeaderboard(t, t);
            close();
          };
        });
      }).catch(() => {
        container.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <button type="button" id="btnBackToChapStep" style="background:transparent;border:none;color:#60a5fa;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:4px">← অধ্যায় তালিকায় ফিরুন</button>
            <span style="font-size:13px;color:#94a3b8;font-weight:600">অধ্যায় ${ch.num}</span>
          </div>
          <button type="button" class="btn lb-all-ch-btn" style="width:100%;text-align:left;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);color:#34d399;font-weight:700;padding:12px 14px;border-radius:10px">
            ⭐ এই অধ্যায়ের সকল পরীক্ষা
          </button>
        `;
        document.getElementById('btnBackToChapStep').onclick = () => renderChapterStep(subj);
        container.querySelector('.lb-all-ch-btn').onclick = () => {
          filterAndRenderLeaderboard(ch.name, `অধ্যায় ${ch.num}: ${ch.name}`);
          close();
        };
      });
    }

    renderSubjectStep();
  }

  function loadLeaderboardFromDB() {
    const db = getDB();
    if (!db) {
      renderFallbackLeaderboard();
      return;
    }

    elements.leaderboardBody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:#94a3b8">ডেটা রিফ্রেশ হচ্ছে...</td></tr>`;

    Promise.all([
      db.ref('exam_leaderboard').limitToLast(100).once('value'),
      db.ref('numeric_uids').once('value').catch(() => ({ val: () => ({}) })),
      db.ref('vip_users').once('value').catch(() => ({ val: () => ({}) }))
    ]).then(([snap, uidsSnap, vipSnap]) => {
      const val = snap.val();
      const uidsMap = uidsSnap.val() || {};
      const vipMap = vipSnap.val() || {};
      if (!val || typeof val !== 'object') {
        renderFallbackLeaderboard();
        return;
      }

      const rows = Object.keys(val).map((k) => {
        const item = { id: k, ...val[k] };
        // Heal student name if missing, undefined, or generic placeholder
        if (!item.name || item.name === 'undefined' || item.name === 'null' || item.name === 'শিক্ষার্থী' || item.name === 'সদস্য' || item.name === 'মেধা শিক্ষার্থী') {
          if (item.uid && uidsMap[item.uid] && uidsMap[item.uid].name) {
            item.name = uidsMap[item.uid].name;
          } else if (item.userName) {
            item.name = item.userName;
          } else if (item.studentName) {
            item.name = item.studentName;
          } else if (item.room === '1432014310' || item.roomName === 'Queen Room') {
            item.name = (item.slot === 'p2') ? ((vipMap.p2 && vipMap.p2.name) || 'রহমান') : ((vipMap.p1 && vipMap.p1.name) || 'তাসফিয়া হাসান');
          }
        }
        return item;
      });

      // Sort by score desc, then timeSpentSeconds asc
      rows.sort((a, b) => {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        return (a.timeSpentSeconds || 0) - (b.timeSpentSeconds || 0);
      });

      cachedLeaderboardRows = rows;
      filterAndRenderLeaderboard(activeLeaderboardFilter || 'all');
    }).catch(() => {
      renderFallbackLeaderboard();
    });
  }

  function renderLeaderboardRows(rows) {
    elements.leaderboardBody.innerHTML = '';
    if (rows.length === 0) {
      elements.leaderboardBody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:#94a3b8">এখনও কোনো পরীক্ষা জমা হয়নি। প্রথম পরীক্ষা দিয়ে শীর্ষে আসুন!</td></tr>`;
      return;
    }

    const curUid = localStorage.getItem('sr_uid');
    const curName = localStorage.getItem('sr-name');
    const curSlot = localStorage.getItem('sr-me');

    rows.forEach((r, idx) => {
      const rank = idx + 1;
      let badgeCls = '';
      if (rank === 1) badgeCls = 'top-1';
      else if (rank === 2) badgeCls = 'top-2';
      else if (rank === 3) badgeCls = 'top-3';

      const tr = document.createElement('tr');
      const timeStr = r.timeSpentSeconds ? `${Math.floor(r.timeSpentSeconds / 60)} মি. ${r.timeSpentSeconds % 60} সে.` : '--';
      const dateStr = r.timestamp ? new Date(r.timestamp).toLocaleDateString('bn-BD') : 'আজকে';
      
      // Strict Room Name masking: Never expose raw room passcodes or PINs!
      let safeRoomName = r.roomName;
      if (!safeRoomName || safeRoomName === r.room || /^\d{4,}$/.test(safeRoomName)) {
        safeRoomName = (r.room === '1432014310') ? 'Queen Room' : 'অধ্যয়ন কক্ষ';
      }

      // Healing student name if missing or saved as 'শিক্ষার্থী'
      let displayName = r.name;
      if (!displayName || displayName === 'শিক্ষার্থী' || displayName === 'সদস্য') {
        if (r.uid && curUid && r.uid === curUid && curName && curName !== 'শিক্ষার্থী' && curName !== 'সদস্য') {
          displayName = curName;
        } else if (r.room === '1432014310' || r.roomName === 'Queen Room' || (r.room && r.room.includes('1432014310'))) {
          displayName = (curSlot === 'p2' || r.slot === 'p2') ? (localStorage.getItem('vip_p2_name') || 'রহমান') : (localStorage.getItem('vip_p1_name') || 'তাসফিয়া হাসান');
        } else if (window.P && r.uid && window.P[r.uid] && window.P[r.uid].name) {
          displayName = window.P[r.uid].name;
        } else if (curName && curName !== 'শিক্ষার্থী' && curName !== 'সদস্য') {
          displayName = curName;
        } else {
          displayName = (r.room === '1432014310' || r.roomName === 'Queen Room') ? 'তাসফিয়া হাসান' : 'মেধা শিক্ষার্থী';
        }
      }

      tr.innerHTML = `
        <td><span class="rank-badge ${badgeCls}">${rank}</span></td>
        <td>
          <strong style="color:#f8fafc">${displayName}</strong>
          <div style="font-size:11.5px;color:#38bdf8">${safeRoomName}</div>
        </td>
        <td>${r.examTitle || 'মডেল টেস্ট'}</td>
        <td style="font-weight:700;color:${r.penalty ? '#f87171' : '#34d399'}">${r.score}/${r.total} ${r.penalty ? '(শাস্তি: ০)' : ''}</td>
        <td style="font-weight:800;color:#60a5fa">${r.percentage}%</td>
        <td>${timeStr}</td>
        <td style="font-size:12px;color:#94a3b8">${dateStr}</td>
      `;
      elements.leaderboardBody.appendChild(tr);
    });
  }

  function renderFallbackLeaderboard() {
    const samples = [
      { name: 'আরিফুল ইসলাম', roomName: 'Queen Room', examTitle: 'রসায়ন ২য় পত্র - পরিবেশ রসায়ন', score: 5, total: 5, percentage: 100, timeSpentSeconds: 145, timestamp: Date.now() - 3600000 },
      { name: 'সাদিয়া তাসনিম', roomName: 'Queen Room', examTitle: 'মেডিকেল স্পেশাল মডেল টেস্ট', score: 14, total: 15, percentage: 93, timeSpentSeconds: 490, timestamp: Date.now() - 7200000 },
      { name: 'তানভীর আহমেদ', roomName: 'মিশন মেডিকেল', examTitle: 'রসায়ন ১ম পত্র - গুণগত রসায়ন', score: 4, total: 5, percentage: 80, timeSpentSeconds: 190, timestamp: Date.now() - 14400000 }
    ];
    cachedLeaderboardRows = samples;
    renderLeaderboardRows(samples);
  }

  // 16. Recent Exams Personal History View
  function loadUserHistoryFromDB() {
    const db = getDB();
    const myUid = localStorage.getItem('sr_uid') || '';
    if (!elements.historyBody) return;

    elements.historyBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:#94a3b8">লোড হচ্ছে...</td></tr>`;

    const renderHistory = (list) => {
      if (!list || list.length === 0) {
        elements.historyBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#94a3b8">এখনও কোনো বিগত পরীক্ষা দেওয়া হয়নি। পরীক্ষা সম্পন্ন করলে এখানে রেকর্ড সংরক্ষিত হবে।</td></tr>`;
        return;
      }
      elements.historyBody.innerHTML = '';
      list.slice(0, 25).forEach((h) => {
        const tr = document.createElement('tr');
        const timeStr = h.timeSpentSeconds ? `${Math.floor(h.timeSpentSeconds / 60)} মি. ${h.timeSpentSeconds % 60} সে.` : '--';
        const dateStr = h.timestamp ? new Date(h.timestamp).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'সম্প্রতি';
        const scoreColor = h.penalty ? '#f87171' : (h.percentage >= 50 ? '#34d399' : '#f87171');

        tr.innerHTML = `
          <td style="font-weight:600;color:#f8fafc">${h.examTitle || 'মডেল টেস্ট'}</td>
          <td style="font-weight:700;color:${scoreColor}">${h.score}/${h.total} ${h.penalty ? '(শাস্তি: ০)' : ''}</td>
          <td style="font-weight:700;color:#60a5fa">${h.percentage}%</td>
          <td>${timeStr}</td>
          <td style="font-size:12px;color:#94a3b8">${dateStr}</td>
          <td style="text-align:center">
            <button type="button" class="btn-review-history" style="background:#0284c7;color:#fff;border:none;border-radius:8px;padding:4px 10px;font-size:12px;font-weight:600;cursor:pointer">🔍 রিভিউ</button>
          </td>
        `;

        const reviewBtn = tr.querySelector('.btn-review-history');
        if (reviewBtn) {
          reviewBtn.onclick = () => {
            if (h.questions && h.questions.length > 0) {
              State.activeQuestions = h.questions;
              State.userAnswers = h.userAnswers || {};
              elements.resScore.innerText = `${h.score}/${h.total}`;
              elements.resPercentage.innerText = `${h.percentage}%`;
              elements.resCorrect.innerText = h.score;
              elements.resWrong.innerText = h.total - h.score;
              elements.resTime.innerText = timeStr;
              renderSolutionReview(h.penalty || false, 'all');
              Object.keys(elements.panels).forEach(k => elements.panels[k] && elements.panels[k].classList.remove('active'));
              elements.panels.result.classList.add('active');
            } else {
              alert('এই পরীক্ষার উত্তরপত্র বা প্রশ্নপত্র সংরক্ষিত নেই।');
            }
          };
        }
        elements.historyBody.appendChild(tr);
      });
    };

    let localList = [];
    try {
      localList = JSON.parse(localStorage.getItem('sr_exam_history') || '[]');
    } catch(e) {}

    if (db && myUid) {
      db.ref(`user_exam_history/${myUid}`).limitToLast(25).once('value', (snap) => {
        const val = snap.val();
        if (val && typeof val === 'object') {
          const dbList = Object.keys(val).map(k => ({ id: k, ...val[k] })).reverse();
          renderHistory(dbList);
        } else {
          renderHistory(localList);
        }
      }).catch(() => {
        renderHistory(localList);
      });
    } else {
      renderHistory(localList);
    }
  }

  // 17. Prompt helpers for Add Subject & Add Chapter
  function promptAddNewSubject() {
    const titleBn = prompt('নতুন বিষয়ের নাম লিখুন (বাংলায়, যেমন: পদার্থবিজ্ঞান ১ম পত্র):');
    if (!titleBn || !titleBn.trim()) return;
    const titleEn = prompt('ইংরেজি নাম (ঐচ্ছিক, যেমন: Physics 1st Paper):', '') || titleBn;
    const category = getStudentClass();
    const newSubj = {
      id: 'subj_' + Date.now().toString(36),
      titleBn: titleBn.trim(),
      titleEn: titleEn.trim(),
      category: category,
      tag: `${category} প্রস্তুতি`,
      gradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 40%, #059669 75%, #10b981 100%)',
      chapters: [
        { id: 'ch_1', num: 1, name: 'মৌলিক ধারণা ও সূচনা' }
      ]
    };

    const db = getDB();
    if (db) {
      db.ref(`exam_subjects/${newSubj.id}`).set(newSubj).then(() => {
        alert('✓ নতুন বিষয় সফলভাবে যোগ করা হয়েছে!');
        loadSubjectsFromDB();
      }).catch(err => {
        alert('ত্রুটি: ' + err.message);
      });
    } else {
      State.subjects.push(newSubj);
      renderSubjectsGrid();
      alert('✓ নতুন বিষয় যোগ করা হয়েছে!');
    }
  }

  function promptAddNewChapter() {
    if (!State.currentSubject) return;
    const num = prompt('অধ্যায় নম্বর লিখুন (যেমন: 1, 2, 3...):', (State.currentSubject.chapters ? State.currentSubject.chapters.length + 1 : 1));
    if (!num) return;
    const name = prompt('অধ্যায়ের নাম লিখুন (যেমন: ভেক্টর বা গতিবিদ্যা):');
    if (!name || !name.trim()) return;

    const newCh = {
      id: `ch_${Date.now().toString(36)}`,
      num: parseInt(num, 10) || (State.currentSubject.chapters ? State.currentSubject.chapters.length + 1 : 1),
      name: name.trim()
    };

    if (!State.currentSubject.chapters) State.currentSubject.chapters = [];
    State.currentSubject.chapters.push(newCh);

    const db = getDB();
    if (db && State.currentSubject.id) {
      db.ref(`exam_subjects/${State.currentSubject.id}/chapters`).set(State.currentSubject.chapters).then(() => {
        alert('✓ নতুন চ্যাপ্টার যোগ হয়েছে!');
        openSubjectChapters(State.currentSubject);
      }).catch(err => alert('ত্রুটি: ' + err.message));
    } else {
      openSubjectChapters(State.currentSubject);
      alert('✓ নতুন চ্যাপ্টার যোগ হয়েছে!');
    }
  }

  // 18. In-Page Shortcuts Modal (Pop-up Modal instead of shortcuts.html redirect)
  let inPageShortcuts = [];
  let inPageEditingId = null;

  function getShortcutDBPath() {
    const code = localStorage.getItem('sr-code') || '14320';
    const me = localStorage.getItem('sr-me') || 'p1';
    return code === '1432014310'
      ? `rooms/${code}/${me}/sc`
      : `rooms_v2/${code}/members/${me}/sc`;
  }

  function renderInPageShortcutModalMarkup() {
    if (document.getElementById('inPageShortcutModalOverlay')) return;

    const shortcutModalHtml = `
      <div id="inPageShortcutModalOverlay" class="exam-modal-overlay" role="dialog" aria-modal="true" style="z-index:9999">
        <div class="exam-modal-container" style="max-width:880px">
          
          <header class="exam-portal-header">
            <div class="exam-brand-wrapper">
              <div class="exam-brand-icon" style="background:linear-gradient(135deg,#059669,#10b981)">🔗</div>
              <div>
                <h3 class="exam-portal-title">পড়ার শর্টকাট ও ক্লাস রিসোর্স</h3>
                <p class="exam-portal-sub">আমাদের অধ্যয়ন কক্ষ - দ্রুত অ্যাক্সেস হাব</p>
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:8px">
              <button type="button" id="btnInPageScAdd" style="background:#059669;color:#fff;border:none;padding:7px 14px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:6px">
                ➕ নতুন শর্টকাট
              </button>
              <button class="exam-close-btn" id="btnInPageScClose" type="button" title="বন্ধ করুন">✕</button>
            </div>
          </header>

          <div style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.06)">
            <input type="search" id="inPageScSearchInput" placeholder="🔍 শর্টকাটের নাম বা লিংক দিয়ে খুঁজুন..." style="width:100%;box-sizing:border-box;background:#1e293b;border:1.5px solid rgba(255,255,255,0.12);color:#f8fafc;padding:10px 16px;border-radius:12px;font:inherit;font-size:14px;outline:none">
          </div>

          <div class="exam-portal-body" style="padding:20px;max-height:calc(85vh - 170px);overflow-y:auto">
            <div id="inPageScGridContainer" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(270px, 1fr));gap:14px">
              <div style="grid-column:1/-1;text-align:center;padding:30px;color:#94a3b8">শর্টকাট লোড হচ্ছে...</div>
            </div>
          </div>

          <!-- Bottom Left Back Button -->
          <button id="btnInPageScBottomBack" type="button" style="position:fixed;bottom:20px;left:20px;z-index:10000;background:#1e293b;border:1.5px solid #10b981;color:#34d399;padding:9px 18px;border-radius:999px;font-weight:700;font-size:14px;box-shadow:0 8px 24px rgba(0,0,0,0.4);cursor:pointer;display:inline-flex;align-items:center;gap:6px">
            ← রুমে ফিরে যান
          </button>
        </div>
      </div>

      <!-- In-Page Shortcut Add/Edit Modal -->
      <div id="inPageScEditorModal" class="strict-warning-overlay" style="z-index:10001;display:none;background:rgba(15,23,42,0.85)">
        <div class="strict-warning-box" style="background:#0f172a;border-color:rgba(16,185,129,0.5);box-shadow:0 0 40px rgba(16,185,129,0.25);color:#f8fafc;max-width:460px;width:90%">
          <div class="warning-alert-icon" style="background:rgba(16,185,129,0.15);border-color:#10b981;color:#34d399">🔗</div>
          <h3 id="inPageScEditorTitle" style="margin:0 0 12px 0;font-size:19px;font-weight:800;color:#f8fafc">➕ নতুন শর্টকাট যোগ করুন</h3>
          
          <div style="text-align:left;margin-bottom:12px">
            <label style="font-size:12.5px;color:#94a3b8;font-weight:600;display:block;margin-bottom:4px">শর্টকাটের নাম:</label>
            <input type="text" id="inPageScNameInput" placeholder="যেমন: Physics Master Class বা 10 Minute School" maxlength="60" style="width:100%;box-sizing:border-box;padding:9px 12px;border-radius:10px;border:1.5px solid #334155;background:#1e293b;color:#f8fafc;font:inherit;outline:none">
          </div>

          <div style="text-align:left;margin-bottom:14px">
            <label style="font-size:12.5px;color:#94a3b8;font-weight:600;display:block;margin-bottom:4px">ওয়েবসাইট বা রিসোর্স লিঙ্ক (URL):</label>
            <input type="url" id="inPageScUrlInput" placeholder="https://..." style="width:100%;box-sizing:border-box;padding:9px 12px;border-radius:10px;border:1.5px solid #334155;background:#1e293b;color:#f8fafc;font:inherit;outline:none">
          </div>

          <div id="inPageScModalErr" style="color:#f87171;font-size:12.5px;margin-bottom:12px;min-height:16px;text-align:left"></div>

          <div style="display:flex;gap:10px">
            <button id="btnInPageScCancel" type="button" class="btn-back-subjects" style="flex:1;justify-content:center;padding:9px">বাতিল</button>
            <button id="btnInPageScSave" type="button" style="flex:1;background:#059669;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;padding:9px">সংরক্ষণ করুন</button>
          </div>
        </div>
      </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = shortcutModalHtml;
    document.body.appendChild(div);

    // Bind In-Page shortcut modal listeners
    document.getElementById('btnInPageScClose').onclick = closeInPageShortcutModal;
    document.getElementById('btnInPageScBottomBack').onclick = closeInPageShortcutModal;
    document.getElementById('btnInPageScAdd').onclick = () => openInPageScEditor(null);
    document.getElementById('inPageScSearchInput').oninput = renderInPageShortcutsGrid;
    document.getElementById('btnInPageScCancel').onclick = closeInPageScEditor;
    document.getElementById('btnInPageScSave').onclick = saveInPageScItem;
  }

  function loadInPageShortcuts() {
    const db = getDB();
    const path = getShortcutDBPath();

    let localBackup = [];
    try {
      localBackup = JSON.parse(localStorage.getItem('sr_shortcuts_backup') || '[]');
    } catch(e) {}

    if (db) {
      db.ref(path).once('value').then(snap => {
        const val = snap.val();
        if (Array.isArray(val)) {
          inPageShortcuts = val;
        } else if (val && typeof val === 'object') {
          inPageShortcuts = Object.keys(val).map(k => ({ i: k, ...val[k] }));
        } else {
          inPageShortcuts = localBackup;
        }
        renderInPageShortcutsGrid();
      }).catch(() => {
        inPageShortcuts = localBackup;
        renderInPageShortcutsGrid();
      });
    } else {
      inPageShortcuts = localBackup;
      renderInPageShortcutsGrid();
    }
  }

  function saveInPageShortcutsDB() {
    try {
      localStorage.setItem('sr_shortcuts_backup', JSON.stringify(inPageShortcuts));
    } catch(e) {}

    const db = getDB();
    if (!db) return Promise.resolve();
    const path = getShortcutDBPath();
    return db.ref(path).set(inPageShortcuts);
  }

  function renderInPageShortcutsGrid() {
    const container = document.getElementById('inPageScGridContainer');
    if (!container) return;
    const searchInput = document.getElementById('inPageScSearchInput');
    const q = searchInput ? searchInput.value.trim().toLowerCase() : '';

    const filtered = inPageShortcuts.filter(s => {
      return !q || (s.n && s.n.toLowerCase().includes(q)) || (s.u && s.u.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px 20px;background:#1e293b;border-radius:16px;border:1px dashed rgba(255,255,255,0.15)">
          <div style="font-size:38px;margin-bottom:12px">🔗</div>
          <h3 style="margin:0 0 8px;color:#f8fafc;font-size:18px">কোনো শর্টকাট পাওয়া যায়নি</h3>
          <p style="margin:0 0 16px;color:#94a3b8;font-size:13.5px">প্রয়োজনীয় ক্লাস, লেকচার শিট ও ওয়েবসাইটের লিঙ্ক সহজে পেতে শর্টকাট যোগ করুন।</p>
          <button id="btnEmptyAddSc" type="button" style="background:#059669;color:#fff;border:none;border-radius:10px;padding:9px 20px;font-weight:700;cursor:pointer">➕ নতুন শর্টকাট যোগ করুন</button>
        </div>
      `;
      const emptyBtn = document.getElementById('btnEmptyAddSc');
      if (emptyBtn) emptyBtn.onclick = () => openInPageScEditor(null);
      return;
    }

    container.innerHTML = '';
    filtered.forEach(s => {
      const card = document.createElement('div');
      card.className = 'sc-inpage-card';
      card.style.cssText = 'background:#1e293b;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;transition:all 0.2s';

      const initial = (s.n || '?').trim().charAt(0).toUpperCase();
      const displayUrl = (s.u || '').replace(/^https?:\/\//i, '').replace(/\/$/, '');

      card.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0">
          <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:17px;flex-shrink:0">
            ${initial}
          </div>
          <div style="min-width:0;flex:1">
            <a href="${s.u}" target="_blank" rel="noopener noreferrer" style="color:#f8fafc;font-weight:700;font-size:14.5px;text-decoration:none;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${s.n}">
              ${s.n} ↗
            </a>
            <div style="color:#38bdf8;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              ${displayUrl}
            </div>
          </div>
        </div>
        <div style="display:flex;gap:5px;align-items:center;flex-shrink:0">
          <button type="button" class="btn-sc-copy" title="লিঙ্ক কপি করুন" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);color:#e2e8f0;padding:5px 8px;border-radius:8px;font-size:12px;cursor:pointer">📋</button>
          <button type="button" class="btn-sc-edit" title="এডিট করুন" style="background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;padding:5px 8px;border-radius:8px;font-size:12px;cursor:pointer">✏️</button>
          <button type="button" class="btn-sc-del" title="মুছে ফেলুন" style="background:rgba(248,113,113,0.15);border:1px solid rgba(248,113,113,0.3);color:#f87171;padding:5px 8px;border-radius:8px;font-size:12px;cursor:pointer">🗑</button>
        </div>
      `;

      // Copy link
      card.querySelector('.btn-sc-copy').onclick = () => {
        navigator.clipboard.writeText(s.u).then(() => {
          alert('✓ লিঙ্ক কপি করা হয়েছে: ' + s.u);
        }).catch(() => {
          prompt('লিঙ্ক কপি করুন:', s.u);
        });
      };

      // Edit
      card.querySelector('.btn-sc-edit').onclick = () => {
        openInPageScEditor(s);
      };

      // Delete
      card.querySelector('.btn-sc-del').onclick = () => {
        if (!confirm(`"${s.n}" শর্টকাটটি মুছে ফেলতে চান?`)) return;
        inPageShortcuts = inPageShortcuts.filter(x => x.i !== s.i);
        saveInPageShortcutsDB().then(() => {
          renderInPageShortcutsGrid();
        });
      };

      container.appendChild(card);
    });
  }

  function openInPageScEditor(s = null) {
    const modal = document.getElementById('inPageScEditorModal');
    const title = document.getElementById('inPageScEditorTitle');
    const nameInput = document.getElementById('inPageScNameInput');
    const urlInput = document.getElementById('inPageScUrlInput');
    const errEl = document.getElementById('inPageScModalErr');

    if (!modal) return;
    if (s && s.i) {
      inPageEditingId = s.i;
      title.innerText = '✏️ শর্টকাট পরিবর্তন করুন';
      nameInput.value = s.n || '';
      urlInput.value = s.u || '';
    } else {
      inPageEditingId = null;
      title.innerText = '➕ নতুন শর্টকাট যোগ করুন';
      nameInput.value = '';
      urlInput.value = '';
    }
    if (errEl) errEl.innerText = '';
    modal.style.display = 'flex';
    setTimeout(() => nameInput.focus(), 60);
  }

  function closeInPageScEditor() {
    const modal = document.getElementById('inPageScEditorModal');
    if (modal) modal.style.display = 'none';
    inPageEditingId = null;
  }

  function saveInPageScItem() {
    const nameInput = document.getElementById('inPageScNameInput');
    const urlInput = document.getElementById('inPageScUrlInput');
    const errEl = document.getElementById('inPageScModalErr');

    const name = nameInput.value.trim();
    let url = urlInput.value.trim();

    if (!name) {
      if (errEl) errEl.innerText = 'শর্টকাটের একটি নাম লিখুন।';
      return;
    }
    if (!url) {
      if (errEl) errEl.innerText = 'সঠিক লিঙ্ক দিন।';
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    if (inPageEditingId) {
      inPageShortcuts = inPageShortcuts.map(item => {
        if (item.i === inPageEditingId) {
          return { ...item, n: name, u: url };
        }
        return item;
      });
    } else {
      const newId = 'sc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      inPageShortcuts.push({ i: newId, n: name, u: url });
    }

    closeInPageScEditor();
    renderInPageShortcutsGrid();
    saveInPageShortcutsDB();
  }

  function openInPageShortcutModal() {
    renderInPageShortcutModalMarkup();
    const overlay = document.getElementById('inPageShortcutModalOverlay');
    if (overlay) {
      overlay.classList.add('active');
      loadInPageShortcuts();
    }
  }

  function closeInPageShortcutModal() {
    const overlay = document.getElementById('inPageShortcutModalOverlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  }

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose global controller
  window.ExamPortal = {
    open: openPortal,
    close: closePortal,
    switchTab: switchTab
  };

})();
