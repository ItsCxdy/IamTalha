import { Experience, Project, SkillGroup, SocialLink, Achievement, Certification } from './types';

// 1. HERO CONTENT
export const HERO_CONTENT = {
  name: "Mohd Talha Ovais",
  title: "AI Engineer · Automation Specialist",
  tagline: "Building reliable AI agents and automation systems that scale business outcomes."
};

// 2. ABOUT CONTENT
// Signal > Story. Focused on Systems, Reliability, and Deployment.
export const ABOUT_CONTENT = `I engineer automated systems that bridge the gap between complex AI models and real-world reliability. With a background integrating AI into high-pressure healthcare operations and managing high-volume lead generation, I focus on deploying deterministic agents and scalable backends. I don't just build models; I build resilient workflows that reduce manual load and drive measurable efficiency.`;

// 3. PROJECTS
// Problem -> System -> Tech -> Outcome
export const PROJECTS: Project[] = [
  {
    id: 'whatsapp-ai',
    title: 'WhatsApp AI Frontdesk',
    subtitle: 'Healthcare Automation System',
    description: 'Designed a production-ready conversational agent for patient triage and scheduling. Implemented an Asynchronous Triple-Fallback System combining LLMs with deterministic state machines to ensure 99% reliability and medical compliance. Reduced administrative workload by 70%.',
    tags: ['Python', 'FastAPI', 'LLMs', 'Twilio API', 'State Machines'],
    githubUrl: 'https://github.com/ItsCxdy',
    highlight: true
  },
  {
    id: 'n8n-marketing',
    title: 'Marketing Content Pipeline',
    subtitle: 'Growth Automation Platform',
    description: 'Built a centralized content automation system that schedules, publishes, and tracks marketing posts across multiple channels. Integrated calendar-based triggers, approval gates, and post-publication notifications to streamline marketing operations.',
    tags: ['n8n', 'Cron Workflows', 'Social Media APIs', 'Webhooks'],
    githubUrl: 'https://github.com/ItsCxdy'
  },
  {
    id: 'sales-outreach',
    title: 'AI Sales Outreach Orchestrator',
    subtitle: 'Revenue Growth Automation',
    description: 'Engineered a multi-step outbound automation that personalizes sales outreach across email and WhatsApp based on lead metadata and engagement signals. Implemented throttling, response detection, and fallback logic to prevent spam behavior while maximizing reply rates.',
    tags: ['n8n', 'LLM Integration', 'Email APIs', 'Rate Limiting'],
    githubUrl: 'https://github.com/ItsCxdy',
    highlight: true
  },
  {
    id: 'homeopathy-llm',
    title: 'Homeopathy-LLM',
    subtitle: 'Explainable AI Medical Assistant',
    description: 'Developed a diagnostic engine grounded in classical medical texts using RAG. Features a custom remedy selection algorithm with high interpretability, prioritizing explainable reasoning for clinical decision support.',
    tags: ['Python', 'Medical NLP', 'RAG', 'Prompt Engineering'],
    githubUrl: 'https://github.com/ItsCxdy'
  },
  {
    id: 'compliance-audit',
    title: 'Compliance Audit Manager',
    subtitle: 'Enterprise Compliance Automation',
    description: 'Designed a compliance-ready automation system to capture audit logs, enforce data retention policies, and generate periodic compliance reports. Implemented immutable logging and alerting for policy violations to support regulatory requirements.',
    tags: ['n8n', 'Audit Logging', 'Data Governance', 'Security Automation'],
    githubUrl: 'https://github.com/ItsCxdy'
  },
  {
    id: 'marketplace-ops',
    title: 'Seller Performance Monitor',
    subtitle: 'Platform Operations Automation',
    description: 'Built a monitoring workflow that tracks seller metrics such as fulfillment delays, cancellations, and customer complaints. Automated performance alerts and remediation actions to help operations teams intervene before SLA violations occur.',
    tags: ['n8n', 'Data Aggregation', 'Marketplace APIs', 'Ops Intelligence'],
    githubUrl: 'https://github.com/ItsCxdy'
  },
  {
    id: 'btc-prediction',
    title: 'BTC Price Prediction',
    subtitle: 'Time Series Forecasting',
    description: 'Built a stacked Bidirectional LSTM model integrated with the Binance API for real-time inference. Engineered a reproducible ML pipeline featuring walk-forward backtesting and RSI indicator feature engineering.',
    tags: ['TensorFlow', 'Keras', 'BiLSTM', 'Binance API'],
    githubUrl: 'https://github.com/ItsCxdy'
  },
  {
    id: 'maps-scraper',
    title: 'Google Maps Scraper',
    subtitle: 'High-Throughput Lead Generation',
    description: 'Engineered a scalable data extraction pipeline to automate lead qualification for local businesses. Powering ad campaigns for 50+ clients by automating CRM entry and targeting analysis.',
    tags: ['Python', 'Automation', 'Data Engineering', 'Selenium'],
    githubUrl: 'https://github.com/ItsCxdy'
  },
  {
    id: 'clothing-store',
    title: 'Clothing Store Manager',
    subtitle: 'Offline-First Android App',
    description: 'Developed a fully offline application for inventory, billing, and vendor tracking. Optimized for low-connectivity environments using local SQLite databases for instant transaction recording.',
    tags: ['Python', 'SQLite', 'Android', 'Offline-First'],
    githubUrl: 'https://github.com/ItsCxdy'
  }
];

// 4. SKILLS
export const SKILLS: SkillGroup[] = [
  {
    category: "AI & LLM Systems",
    skills: ["AI Agents", "RAG Pipelines", "Prompt Engineering", "NLP", "Time Series (BiLSTM)", "Model Deployment"]
  },
  {
    category: "Backend & Python",
    skills: ["Python (Advanced)", "FastAPI", "SQL / SQLite", "Pandas & NumPy", "Docker", "Git/Linux"]
  },
  {
    category: "Automation & APIs",
    skills: ["n8n", "WhatsApp Business API", "Twilio", "Workflow Automation", "State Machines", "Web Scraping"]
  },
  {
    category: "Growth & Analytics",
    skills: ["Conversion Funnels", "ROI Optimization", "A/B Testing", "Programmatic Ads", "Analytics Dashboards"]
  }
];

// 5. EXPERIENCE
export const EXPERIENCE: Experience[] = [
  {
    id: 'hospital-ai',
    role: 'AI Integration Lead & Hospital Manager',
    company: 'Al Hind Multispeciality Hospital',
    period: 'May 2022 – Present',
    description: [
      'Led operations for a facility serving 100+ daily patients, managing compliance and resource allocation.',
      'Spearheaded the integration of AI-driven front-desk automation, reducing manual administrative workload by nearly 80%.',
      'Developed data-backed operational policies that improved reporting accuracy and patient turnaround times.'
    ]
  },
  {
    id: 'freelance-ads',
    role: 'Social Media Advertising Specialist',
    company: 'Freelance (International)',
    period: 'Jan 2020 – Present',
    description: [
      'Managed end-to-end ad campaigns for 50+ clients, optimizing budgets up to $50k/mo.',
      'Achieved 80% efficiency improvements via algorithmic bid strategies and automated reporting dashboards.',
      'Built automated lead-generation funnels for D2C brands and local enterprises.'
    ]
  },
  {
    id: 'visual-editor',
    role: 'Graphic Designer & AI-Visual Editor',
    company: 'Freelance',
    period: 'Jan 2018 – Present',
    description: [
      'Integrated AI tools for background removal and batch automation, reducing production time by 60%.',
      'Delivered visual content for 100+ brands using Adobe Creative Suite and AI-assisted workflows.'
    ]
  }
];

// 6. ACHIEVEMENTS
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'healthcare-award',
    title: 'Healthcare AI Automation Impact Award',
    date: 'Mar 2025',
    description: 'Recognized internally for leading the design and deployment of AI-driven front-desk and patient flow automation at a multispecialty hospital, reducing manual administrative workload by ~70% while maintaining regulatory compliance.'
  },
  {
    id: 'llm-deployment',
    title: 'Production LLM System Deployment',
    date: 'Jan 2025',
    description: 'Successfully deployed a production-grade multilingual WhatsApp AI front-desk system for healthcare operations using Python, FastAPI, LLMs, and Twilio API, achieving 99% system reliability through deterministic state machines and fallback logic.'
  },
  {
    id: 'agent-arch',
    title: 'AI Agent Architecture Excellence',
    date: 'Dec 2024',
    description: 'Designed and implemented a deterministic-LLM hybrid AI agent architecture combining state machines with controlled natural language responses, ensuring safe automation for healthcare and operations-critical workflows.'
  },
  {
    id: 'ops-leadership',
    title: 'Operational Efficiency Leadership',
    date: 'Oct 2024',
    description: 'Led cross-functional clinical, administrative, and technical teams to optimize hospital operations using data-driven decision making, improving reporting accuracy, turnaround time, and daily operational efficiency across 100+ patient workflows.'
  },
  {
    id: 'creative-automation',
    title: 'AI-Enhanced Creative Automation',
    date: 'Feb 2024',
    description: 'Integrated AI-assisted workflows into professional design pipelines, reducing content production time by ~60% through batch automation, upscaling, background removal, and motion-tracking tools.'
  }
];

// 7. CERTIFICATIONS
export const CERTIFICATIONS: Certification[] = [
  {
    id: 'ai-agents',
    title: 'AI Agents & Autonomous Systems',
    issuer: 'Hugging Face',
    date: 'May 2025',
    description: 'Advanced training in building autonomous AI agents, tool-calling workflows, multi-agent coordination, and production-oriented agent design.'
  },
  {
    id: 'llm-production',
    title: 'Building LLM Applications for Production',
    issuer: 'DeepLearning.ai',
    date: 'Mar 2025',
    description: 'Focused on deploying LLM-powered systems with prompt engineering, evaluation strategies, retrieval-augmented generation, and reliability safeguards.'
  },
  {
    id: 'mlops',
    title: 'MLOps Fundamentals',
    issuer: 'Coursera',
    date: 'Dec 2024',
    description: 'Covered model lifecycle management, experiment tracking, CI/CD pipelines for ML, and production monitoring best practices.'
  },
  {
    id: 'nlp-transformers',
    title: 'Natural Language Processing with Transformers',
    issuer: 'Hugging Face',
    date: 'Aug 2024',
    description: 'Hands-on course covering transformer architectures, fine-tuning, tokenization strategies, and NLP evaluation techniques.'
  }
];

// 8. CONTACT & FOOTER
export const SOCIAL_LINKS: SocialLink[] = [
  { platform: 'Email', url: 'mailto:talhaovaisq@gmail.com', icon: 'Mail' },
  { platform: 'LinkedIn', url: 'https://linkedin.com/in/talha-ovais', icon: 'Linkedin' },
  { platform: 'GitHub', url: 'https://github.com/ItsCxdy', icon: 'Github' },
  { platform: 'Fiverr', url: 'https://fiverr.com/talhaovais', icon: 'ExternalLink' }
];

export const CTA_COPY = "Ready to build reliable systems? Let's talk.";