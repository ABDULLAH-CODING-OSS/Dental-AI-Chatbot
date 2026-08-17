export interface StatMetric {
  title: string;
  value: number;
  displayValue?: string;
  prefix?: string;
  suffix?: string;
  change: number;
  trend: 'up' | 'down';
  timeframe: string;
  description: string;
}

export interface DailyChatData {
  date: string;
  formattedDate: string;
  messages: number;
  activeChats: number;
  escalations: number;
}

export interface DentalTopicData {
  topic: string;
  shortName: string;
  count: number;
  percentage: number;
  urgencyRate: number;
  color: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Patient' | 'Dentist' | 'Clinic Staff' | 'Admin';
  signupDate: string;
  status: 'Active' | 'Suspended' | 'Verified' | 'Pending';
  totalChats: number;
  lastActive: string;
  avatarBg: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  triageTag?: string;
  isFlagged?: boolean;
}

export interface ChatSession {
  id: string;
  sessionId: string;
  userName: string;
  userEmail: string;
  date: string;
  time: string;
  messageCount: number;
  duration: string;
  flagStatus: 'Normal' | 'Urgent' | 'Clinical Review' | 'Safety Flag';
  topic: string;
  outcome: 'Resolved' | 'Escalated to Clinic' | 'Follow-up Needed';
  messages: ChatMessage[];
}

export interface Appointment {
  id: string;
  bookingRef: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  clinicName: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  urgency: 'Routine' | 'High' | 'Emergency';
  notes?: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  status: 'Partner Clinic' | 'Verified' | 'Under Review';
  operatingHours: string;
  emergencyAvailable: boolean;
}

export const MOCK_STATS = {
  totalUsers: {
    title: "Total Users",
    value: 14820,
    change: 12.4,
    trend: 'up' as const,
    timeframe: "vs last month",
    description: "Registered patients & providers",
  },
  activeChatsToday: {
    title: "Active Chats Today",
    value: 1429,
    change: 8.2,
    trend: 'up' as const,
    timeframe: "vs yesterday",
    description: "Real-time AI consultations",
  },
  totalMessages: {
    title: "Total Messages",
    value: 182940,
    change: 19.1,
    trend: 'up' as const,
    timeframe: "vs last month",
    description: "Across all patient dialogues",
  },
  appointmentsPending: {
    title: "Appointments Pending",
    value: 38,
    change: -4.5,
    trend: 'down' as const,
    timeframe: "vs last week",
    description: "Awaiting clinic confirmation",
  },
};

export const MOCK_DAILY_CHATS_30D: DailyChatData[] = [
  { date: "2026-07-18", formattedDate: "Jul 18", messages: 4200, activeChats: 980, escalations: 42 },
  { date: "2026-07-19", formattedDate: "Jul 19", messages: 4650, activeChats: 1040, escalations: 38 },
  { date: "2026-07-20", formattedDate: "Jul 20", messages: 4900, activeChats: 1110, escalations: 45 },
  { date: "2026-07-21", formattedDate: "Jul 21", messages: 5120, activeChats: 1190, escalations: 52 },
  { date: "2026-07-22", formattedDate: "Jul 22", messages: 5300, activeChats: 1220, escalations: 49 },
  { date: "2026-07-23", formattedDate: "Jul 23", messages: 4800, activeChats: 1090, escalations: 35 },
  { date: "2026-07-24", formattedDate: "Jul 24", messages: 4600, activeChats: 1050, escalations: 39 },
  { date: "2026-07-25", formattedDate: "Jul 25", messages: 5400, activeChats: 1250, escalations: 55 },
  { date: "2026-07-26", formattedDate: "Jul 26", messages: 5750, activeChats: 1310, escalations: 58 },
  { date: "2026-07-27", formattedDate: "Jul 27", messages: 5900, activeChats: 1360, escalations: 61 },
  { date: "2026-07-28", formattedDate: "Jul 28", messages: 6100, activeChats: 1400, escalations: 64 },
  { date: "2026-07-29", formattedDate: "Jul 29", messages: 6250, activeChats: 1420, escalations: 62 },
  { date: "2026-07-30", formattedDate: "Jul 30", messages: 5800, activeChats: 1310, escalations: 48 },
  { date: "2026-07-31", formattedDate: "Jul 31", messages: 5500, activeChats: 1280, escalations: 44 },
  { date: "2026-08-01", formattedDate: "Aug 01", messages: 6300, activeChats: 1440, escalations: 68 },
  { date: "2026-08-02", formattedDate: "Aug 02", messages: 6600, activeChats: 1490, escalations: 71 },
  { date: "2026-08-03", formattedDate: "Aug 03", messages: 6450, activeChats: 1460, escalations: 65 },
  { date: "2026-08-04", formattedDate: "Aug 04", messages: 6700, activeChats: 1510, escalations: 74 },
  { date: "2026-08-05", formattedDate: "Aug 05", messages: 6890, activeChats: 1540, escalations: 79 },
  { date: "2026-08-06", formattedDate: "Aug 06", messages: 6100, activeChats: 1390, escalations: 50 },
  { date: "2026-08-07", formattedDate: "Aug 07", messages: 5950, activeChats: 1350, escalations: 47 },
  { date: "2026-08-08", formattedDate: "Aug 08", messages: 6800, activeChats: 1530, escalations: 75 },
  { date: "2026-08-09", formattedDate: "Aug 09", messages: 7100, activeChats: 1590, escalations: 82 },
  { date: "2026-08-10", formattedDate: "Aug 10", messages: 7350, activeChats: 1640, escalations: 86 },
  { date: "2026-08-11", formattedDate: "Aug 11", messages: 7200, activeChats: 1610, escalations: 80 },
  { date: "2026-08-12", formattedDate: "Aug 12", messages: 7480, activeChats: 1670, escalations: 88 },
  { date: "2026-08-13", formattedDate: "Aug 13", messages: 6900, activeChats: 1520, escalations: 60 },
  { date: "2026-08-14", formattedDate: "Aug 14", messages: 6750, activeChats: 1490, escalations: 56 },
  { date: "2026-08-15", formattedDate: "Aug 15", messages: 7520, activeChats: 1690, escalations: 91 },
  { date: "2026-08-16", formattedDate: "Aug 16", messages: 7820, activeChats: 1740, escalations: 95 },
  { date: "2026-08-17", formattedDate: "Today", messages: 8120, activeChats: 1820, escalations: 99 }
];

export const MOCK_TOPIC_DATA: DentalTopicData[] = [
  { topic: "Cavities & Tooth Decay", shortName: "Cavities", count: 4520, percentage: 28.5, urgencyRate: 14, color: "#8b5cf6" },
  { topic: "Gum Disease & Bleeding", shortName: "Gum Disease", count: 3280, percentage: 20.7, urgencyRate: 18, color: "#a855f7" },
  { topic: "Root Canal Symptoms", shortName: "Root Canal", count: 2640, percentage: 16.6, urgencyRate: 42, color: "#7c3aed" },
  { topic: "Teeth Whitening & Aesthetics", shortName: "Whitening", count: 2150, percentage: 13.5, urgencyRate: 2, color: "#c084fc" },
  { topic: "Wisdom Tooth Pain & Impaction", shortName: "Wisdom Tooth", count: 1890, percentage: 11.9, urgencyRate: 51, color: "#6d28d9" },
  { topic: "Orthodontics & Clear Aligners", shortName: "Orthodontics", count: 1420, percentage: 8.9, urgencyRate: 5, color: "#9333ea" },
  { topic: "Dental Implants & Crowns", shortName: "Implants", count: 1180, percentage: 7.4, urgencyRate: 8, color: "#d8b4fe" },
  { topic: "Pediatric Dental Care", shortName: "Pediatric", count: 960, percentage: 6.0, urgencyRate: 22, color: "#e9d5ff" }
];

export const MOCK_USERS: AdminUser[] = [
  { id: "usr_001", name: "Sarah Jenkins", email: "sarah.j@gmail.com", role: "Patient", signupDate: "2026-01-14", status: "Active", totalChats: 14, lastActive: "10 mins ago", avatarBg: "bg-purple-100 text-purple-700" },
  { id: "usr_002", name: "Dr. Alexander Wright", email: "a.wright@denovadental.com", role: "Dentist", signupDate: "2025-11-02", status: "Verified", totalChats: 88, lastActive: "2 hours ago", avatarBg: "bg-indigo-100 text-indigo-700" },
  { id: "usr_003", name: "Michael Chang", email: "mchang99@outlook.com", role: "Patient", signupDate: "2026-03-21", status: "Active", totalChats: 6, lastActive: "Yesterday", avatarBg: "bg-blue-100 text-blue-700" },
  { id: "usr_004", name: "Elena Rostova", email: "elena.rostova@icloud.com", role: "Patient", signupDate: "2026-02-18", status: "Suspended", totalChats: 3, lastActive: "5 days ago", avatarBg: "bg-amber-100 text-amber-700" },
  { id: "usr_005", name: "Dr. Marcus Vance", email: "m.vance@metrodental.org", role: "Dentist", signupDate: "2025-08-19", status: "Verified", totalChats: 142, lastActive: "Just now", avatarBg: "bg-purple-100 text-purple-700" },
  { id: "usr_006", name: "Sophia Martinez", email: "sophia.m@gmail.com", role: "Patient", signupDate: "2026-04-05", status: "Active", totalChats: 19, lastActive: "35 mins ago", avatarBg: "bg-rose-100 text-rose-700" },
  { id: "usr_007", name: "David Kim", email: "david.kim@techcorp.io", role: "Patient", signupDate: "2026-05-12", status: "Active", totalChats: 8, lastActive: "3 hours ago", avatarBg: "bg-emerald-100 text-emerald-700" },
  { id: "usr_008", name: "Rachel Adams", email: "rachel.adams@apexclinic.com", role: "Clinic Staff", signupDate: "2025-12-10", status: "Verified", totalChats: 45, lastActive: "1 hour ago", avatarBg: "bg-cyan-100 text-cyan-700" },
  { id: "usr_009", name: "James Wilson", email: "jwilson_dental@yahoo.com", role: "Patient", signupDate: "2026-06-01", status: "Pending", totalChats: 1, lastActive: "4 days ago", avatarBg: "bg-slate-100 text-slate-700" },
  { id: "usr_010", name: "Dr. Emily Taylor", email: "dr.emily@pediatricsmiles.com", role: "Dentist", signupDate: "2025-09-15", status: "Verified", totalChats: 210, lastActive: "15 mins ago", avatarBg: "bg-violet-100 text-violet-700" },
  { id: "usr_011", name: "Lucas Bennett", email: "lucas.b@proton.me", role: "Patient", signupDate: "2026-06-22", status: "Active", totalChats: 12, lastActive: "6 hours ago", avatarBg: "bg-amber-100 text-amber-700" },
  { id: "usr_012", name: "Amara Okonjo", email: "amara.okonjo@gmail.com", role: "Patient", signupDate: "2026-07-03", status: "Active", totalChats: 5, lastActive: "2 days ago", avatarBg: "bg-purple-100 text-purple-700" },
  { id: "usr_013", name: "Olivia Thompson", email: "olivia.t@denovadental.com", role: "Admin", signupDate: "2025-07-01", status: "Verified", totalChats: 312, lastActive: "Just now", avatarBg: "bg-purple-100 text-purple-800" },
  { id: "usr_014", name: "Carlos Fernandez", email: "carlos.f@outlook.es", role: "Patient", signupDate: "2026-07-15", status: "Active", totalChats: 7, lastActive: "1 day ago", avatarBg: "bg-emerald-100 text-emerald-700" },
  { id: "usr_015", name: "Hannah Patel", email: "hannah.patel@smilecare.org", role: "Clinic Staff", signupDate: "2026-01-20", status: "Verified", totalChats: 67, lastActive: "30 mins ago", avatarBg: "bg-pink-100 text-pink-700" },
  { id: "usr_016", name: "Liam O'Connor", email: "liam.oconnor@ireland.ie", role: "Patient", signupDate: "2026-07-28", status: "Suspended", totalChats: 2, lastActive: "1 week ago", avatarBg: "bg-red-100 text-red-700" },
  { id: "usr_017", name: "Zoe Zimmerman", email: "zoe.zimmerman@gmail.com", role: "Patient", signupDate: "2026-08-01", status: "Active", totalChats: 11, lastActive: "4 hours ago", avatarBg: "bg-indigo-100 text-indigo-700" },
  { id: "usr_018", name: "Dr. Ethan Morris", email: "e.morris@oralsurgerygroup.com", role: "Dentist", signupDate: "2025-10-18", status: "Verified", totalChats: 95, lastActive: "45 mins ago", avatarBg: "bg-purple-100 text-purple-700" },
  { id: "usr_019", name: "Fatima Al-Mansoor", email: "fatima.almansoor@domain.ae", role: "Patient", signupDate: "2026-08-08", status: "Active", totalChats: 4, lastActive: "5 hours ago", avatarBg: "bg-teal-100 text-teal-700" },
  { id: "usr_020", name: "Noah Campbell", email: "campbell.noah@gmail.com", role: "Patient", signupDate: "2026-08-11", status: "Pending", totalChats: 0, lastActive: "Never", avatarBg: "bg-slate-100 text-slate-700" },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "apt_01",
    bookingRef: "APT-1092",
    patientName: "Sarah Jenkins",
    patientEmail: "sarah.j@gmail.com",
    patientPhone: "+1 (555) 345-6789",
    clinicName: "Denova Premier Dental - Downtown",
    service: "Comprehensive Dental Exam & Cleaning",
    date: "2026-08-18",
    time: "10:00 AM",
    status: "confirmed",
    urgency: "Routine",
    notes: "Patient reports minor sensitivity on upper right molar."
  },
  {
    id: "apt_02",
    bookingRef: "APT-1093",
    patientName: "Lucas Bennett",
    patientEmail: "lucas.b@proton.me",
    patientPhone: "+1 (555) 987-6543",
    clinicName: "Apex Emergency Dental Care",
    service: "Emergency Triage & Abscess Drainage",
    date: "2026-08-17",
    time: "02:00 PM",
    status: "pending",
    urgency: "Emergency",
    notes: "Acute throbbing pain and lower right jaw swelling since 3 AM."
  },
  {
    id: "apt_03",
    bookingRef: "APT-1094",
    patientName: "Elena Rostova",
    patientEmail: "elena.rostova@icloud.com",
    patientPhone: "+1 (555) 234-5678",
    clinicName: "Metropolitan Endodontic Institute",
    service: "Dry Socket Dressing & Evaluation",
    date: "2026-08-18",
    time: "11:30 AM",
    status: "confirmed",
    urgency: "High",
    notes: "Post-extraction tooth #19 pain radiating to ear."
  },
  {
    id: "apt_04",
    bookingRef: "APT-1095",
    patientName: "Michael Chang",
    patientEmail: "mchang99@outlook.com",
    patientPhone: "+1 (555) 876-5432",
    clinicName: "BrightSmile Orthodontics",
    service: "Invisalign Routine Tray Progress Check",
    date: "2026-08-20",
    time: "03:30 PM",
    status: "pending",
    urgency: "Routine",
    notes: "Tray #5 tracking check and chewies replenishment."
  },
  {
    id: "apt_05",
    bookingRef: "APT-1096",
    patientName: "Sophia Martinez",
    patientEmail: "sophia.m@gmail.com",
    patientPhone: "+1 (555) 456-7890",
    clinicName: "SmileCare Family Practice",
    service: "Periodontal Scaling & Root Planing",
    date: "2026-08-21",
    time: "09:00 AM",
    status: "confirmed",
    urgency: "Routine",
    notes: "Gingival bleeding upon flossing."
  },
  {
    id: "apt_06",
    bookingRef: "APT-1097",
    patientName: "David Kim",
    patientEmail: "david.kim@techcorp.io",
    patientPhone: "+1 (555) 789-0123",
    clinicName: "PureCosmetic Dental Spa",
    service: "Laser Whitening Consultation",
    date: "2026-08-22",
    time: "01:00 PM",
    status: "pending",
    urgency: "Routine",
    notes: "Patient interested in shade lightening before wedding."
  }
];

export const MOCK_CHAT_SESSIONS: ChatSession[] = [
  {
    id: "cs_101",
    sessionId: "SES-2026-8941",
    userName: "Sarah Jenkins",
    userEmail: "sarah.j@gmail.com",
    date: "2026-08-17",
    time: "10:45 AM",
    messageCount: 8,
    duration: "4m 12s",
    flagStatus: "Normal",
    topic: "Teeth Whitening Sensitivity",
    outcome: "Resolved",
    messages: [
      { id: "m1", sender: "user", text: "Hi, I did an at-home whitening strip session yesterday and my front teeth are stinging when I drink water. Is this permanent?", time: "10:45 AM" },
      { id: "m2", sender: "bot", text: "Hello Sarah! Mild to moderate sensitivity after using peroxide-based whitening strips is very common and almost always temporary (usually subsides within 24 to 48 hours).", time: "10:45 AM", triageTag: "Clinical Advice" },
      { id: "m3", sender: "user", text: "What can I do right now to ease the sting?", time: "10:46 AM" },
      { id: "m4", sender: "bot", text: "Here are immediate steps: 1) Switch to a potassium nitrate desensitizing toothpaste (like Sensodyne). 2) Avoid ice-cold or piping-hot beverages for 48 hours. 3) Pause whitening treatments for at least 3-4 days.", time: "10:46 AM" },
      { id: "m5", sender: "user", text: "Thank you! If it lasts more than 3 days what should I do?", time: "10:48 AM" },
      { id: "m6", sender: "bot", text: "If sharp pain persists beyond 72 hours, it's recommended to have a dentist check for enamel erosion or pre-existing micro-fractures. Would you like me to book a quick checkup with your nearest clinic?", time: "10:48 AM" },
      { id: "m7", sender: "user", text: "No, it's already feeling better with warm water. Thanks!", time: "10:49 AM" },
      { id: "m8", sender: "bot", text: "You're very welcome! Keep protecting your enamel. Have a wonderful day!", time: "10:49 AM" }
    ]
  },
  {
    id: "cs_102",
    sessionId: "SES-2026-8942",
    userName: "Lucas Bennett",
    userEmail: "lucas.b@proton.me",
    date: "2026-08-17",
    time: "09:30 AM",
    messageCount: 12,
    duration: "7m 45s",
    flagStatus: "Urgent",
    topic: "Severe Throbbing Toothache & Facial Swelling",
    outcome: "Escalated to Clinic",
    messages: [
      { id: "m1", sender: "user", text: "I have excruciating throbbing pain in my lower right molar since 3am. My jaw looks slightly puffy and I feel warm.", time: "09:30 AM", isFlagged: true },
      { id: "m2", sender: "bot", text: "⚠️ Urgent Alert: Severe throbbing pain accompanied by visible facial or jaw swelling and fever indicates a possible dental abscess or spreading infection. This requires prompt professional evaluation.", time: "09:30 AM", triageTag: "Emergency Triage" },
      { id: "m3", sender: "user", text: "Can I just take ibuprofen and wait until next week?", time: "09:32 AM" },
      { id: "m4", sender: "bot", text: "While Ibuprofen (400-600mg with food, if not medically contraindicated) can help manage discomfort temporarily, it will NOT cure the underlying bacterial infection. Waiting could allow the swelling to spread to your airway or bloodstream.", time: "09:32 AM", triageTag: "Safety Warning" },
      { id: "m5", sender: "user", text: "Please help me find an emergency dentist open today in downtown.", time: "09:34 AM" },
      { id: "m6", sender: "bot", text: "I have located 'Apex Emergency Dental Care' (1.2 miles away, open now with walk-in slots). I can initiate an urgent appointment request for you immediately.", time: "09:35 AM" }
    ]
  },
  {
    id: "cs_103",
    sessionId: "SES-2026-8938",
    userName: "Elena Rostova",
    userEmail: "elena.rostova@icloud.com",
    date: "2026-08-16",
    time: "08:15 PM",
    messageCount: 5,
    duration: "2m 50s",
    flagStatus: "Clinical Review",
    topic: "Post-Extraction Dry Socket Suspicions",
    outcome: "Follow-up Needed",
    messages: [
      { id: "m1", sender: "user", text: "I had tooth #19 extracted 4 days ago. Today there is a foul taste and intense aching radiating up to my ear.", time: "08:15 PM" },
      { id: "m2", sender: "bot", text: "Foul odor/taste combined with radiating ear pain 3-5 days post-extraction are textbook indicators of Alveolar Osteitis (Dry Socket), where the protective blood clot has dislodged.", time: "08:16 PM", triageTag: "Clinical Diagnostic" },
      { id: "m3", sender: "user", text: "Is dry socket dangerous?", time: "08:17 PM" },
      { id: "m4", sender: "bot", text: "Dry socket is not life-threatening, but it is extremely painful because the underlying bone and nerves are exposed. Your dentist can place a medicated dressing inside the socket for near-instant pain relief.", time: "08:17 PM" }
    ]
  },
  {
    id: "cs_104",
    sessionId: "SES-2026-8935",
    userName: "David Kim",
    userEmail: "david.kim@techcorp.io",
    date: "2026-08-16",
    time: "03:10 PM",
    messageCount: 6,
    duration: "3m 22s",
    flagStatus: "Normal",
    topic: "Clear Aligner Chewies & Seating",
    outcome: "Resolved",
    messages: [
      { id: "m1", sender: "user", text: "Just switched to Tray #5 and there is a tiny gap at the incisal edge. Should I use chewies?", time: "03:10 PM" },
      { id: "m2", sender: "bot", text: "Yes! Using aligner chewies for 10-15 minutes, particularly when biting down on new trays, helps fully seat the aligner over the attachments for optimal tooth tracking.", time: "03:11 PM" }
    ]
  },
  {
    id: "cs_105",
    sessionId: "SES-2026-8929",
    userName: "Sophia Martinez",
    userEmail: "sophia.m@gmail.com",
    date: "2026-08-16",
    time: "11:05 AM",
    messageCount: 9,
    duration: "5m 14s",
    flagStatus: "Normal",
    topic: "Gingivitis vs Periodontitis",
    outcome: "Resolved",
    messages: [
      { id: "m1", sender: "user", text: "My gums bleed every time I floss. Does that mean I have periodontitis and my teeth will fall out?", time: "11:05 AM" },
      { id: "m2", sender: "bot", text: "Bleeding is most commonly a sign of early gingivitis (inflammation of the superficial gum tissue), which is 100% reversible with consistent flossing and professional cleaning.", time: "11:05 AM" }
    ]
  },
  {
    id: "cs_106",
    sessionId: "SES-2026-8920",
    userName: "James Wilson",
    userEmail: "jwilson_dental@yahoo.com",
    date: "2026-08-15",
    time: "06:40 PM",
    messageCount: 4,
    duration: "1m 58s",
    flagStatus: "Safety Flag",
    topic: "Pediatric Medication Dosage Query",
    outcome: "Escalated to Clinic",
    messages: [
      { id: "m1", sender: "user", text: "My 3-year-old has a sore tooth, can I give him half an adult aspirin tablet?", time: "06:40 PM", isFlagged: true },
      { id: "m2", sender: "bot", text: "⛔ CRITICAL SAFETY WARNING: NEVER give Aspirin to children or teenagers due to the risk of Reye's Syndrome, a rare but life-threatening condition. Use only pediatric weight-based Acetaminophen (Tylenol) or Ibuprofen.", time: "06:40 PM", triageTag: "Safety Guardrail" }
    ]
  }
];

export const MOCK_CLINICS: Clinic[] = [
  {
    id: "cln_01",
    name: "Denova Premier Dental - Downtown",
    address: "742 Evergreen Terrace, Suite 400",
    city: "Downtown Medical District",
    phone: "+1 (555) 800-3366",
    email: "downtown@denovadental.com",
    specialties: ["General Dentistry", "Cosmetic Dentistry", "Preventive Care", "Invisalign"],
    rating: 4.9,
    reviewCount: 342,
    status: "Partner Clinic",
    operatingHours: "Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM",
    emergencyAvailable: true
  },
  {
    id: "cln_02",
    name: "Apex Emergency Dental Care",
    address: "1250 Broadway Avenue, Floor 1",
    city: "Midtown West",
    phone: "+1 (555) 911-DENT",
    email: "urgent@apexdental.com",
    specialties: ["Emergency Triage", "Oral Surgery", "Pain Management", "Extractions"],
    rating: 4.8,
    reviewCount: 512,
    status: "Partner Clinic",
    operatingHours: "24/7 Walk-in & Emergency On-Call",
    emergencyAvailable: true
  },
  {
    id: "cln_03",
    name: "Metropolitan Endodontic Institute",
    address: "500 Grand Concourse, Suite 210",
    city: "Financial District",
    phone: "+1 (555) 432-7668",
    email: "referrals@metrorootcanal.org",
    specialties: ["Endodontics", "Microscopic Root Canals", "Apicoectomy", "Trauma"],
    rating: 4.9,
    reviewCount: 188,
    status: "Partner Clinic",
    operatingHours: "Mon-Thu: 7:30 AM - 5:00 PM",
    emergencyAvailable: true
  },
  {
    id: "cln_04",
    name: "BrightSmile Orthodontics",
    address: "320 Lexington Ave, Suite 8B",
    city: "Uptown East",
    phone: "+1 (555) 777-BRACE",
    email: "care@brightsmileny.com",
    specialties: ["Orthodontics", "Invisalign Diamond Provider", "Surgical Ortho"],
    rating: 4.7,
    reviewCount: 275,
    status: "Partner Clinic",
    operatingHours: "Mon-Sat: 9:00 AM - 6:00 PM",
    emergencyAvailable: false
  },
  {
    id: "cln_05",
    name: "SmileCare Family Practice",
    address: "88 Ocean Parkway, Suite 101",
    city: "South Bay",
    phone: "+1 (555) 321-4455",
    email: "info@smilecarefamily.com",
    specialties: ["Pediatric Dentistry", "Family Care", "Crowns & Bridges"],
    rating: 4.6,
    reviewCount: 140,
    status: "Verified",
    operatingHours: "Mon-Fri: 8:30 AM - 5:30 PM",
    emergencyAvailable: false
  },
  {
    id: "cln_06",
    name: "PureCosmetic Dental Spa",
    address: "101 Fifth Avenue, Penthouse B",
    city: "Midtown Luxury Suites",
    phone: "+1 (555) 999-GLOW",
    email: "concierge@purecosmeticdental.com",
    specialties: ["Porcelain Veneers", "Laser Whitening", "Full Mouth Rejuvenation"],
    rating: 5.0,
    reviewCount: 94,
    status: "Partner Clinic",
    operatingHours: "Tue-Sat: 10:00 AM - 7:00 PM",
    emergencyAvailable: false
  },
  {
    id: "cln_07",
    name: "Metro Dental & Implant Center",
    address: "410 Columbus Circle",
    city: "West End",
    phone: "+1 (555) 654-3210",
    email: "implants@metrodentalcenter.com",
    specialties: ["Implantology", "All-on-4 Restoration", "Bone Grafting", "Sedation"],
    rating: 4.8,
    reviewCount: 215,
    status: "Partner Clinic",
    operatingHours: "Mon-Fri: 8:00 AM - 5:00 PM",
    emergencyAvailable: true
  }
];

export const MOCK_ADMIN_SETTINGS = {
  inferenceProvider: "Denova Clinical AI (Medical-Grade)",
  knowledgeBase: "Curated Dental Health Literature",
  ragArchitecture: "Evidence-Based Clinical Retrieval & Source Verification",
  maxMessagesPerUserPerDay: 40,
  maxChatbotSessionsPerHour: 10,
  maxTokenLimitPerResponse: 1024,
  clinicalDisclaimerEnforced: true,
  emergencyTriageAutoEscalate: true,
  routingRadiusMiles: 15,
  emailAlertsUrgent: true,
  smsAlertsUrgent: true,
  maintenanceMode: false,
  retentionDays: 90
};
