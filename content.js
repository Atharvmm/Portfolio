// Copy is taken from Resume.md. Board marks and a coursework list are not in that file, so they are not invented here.

export const CERTS = [
  { id: 'cert-dsa', title: 'Data Structures', detail: 'University of California San Diego, on Coursera. May 2024.' },
  { id: 'cert-git', title: 'Git and GitHub', detail: 'Google, on Coursera. April 2024.' },
  { id: 'cert-api', title: 'APIs', detail: 'Meta, on Coursera. November 2023.' },
  { id: 'cert-mobile', title: 'Mobile apps', detail: 'Introduction to Mobile App Development, Meta, on Coursera. November 2023.' },
  { id: 'cert-ui', title: 'UI and UX', detail: 'Principles of UI/UX Design, Meta, on Coursera. November 2023.' },
]

export const SKILL_ROWS = [
  { id: 'skill-lang', label: 'Languages', items: [['Go', '#2a9d8f'], ['Java', '#c45c48'], ['C++', '#3d5a80'], ['Py', '#4e7a44'], ['TS', '#3178c6'], ['SQL', '#c9843f']] },
  { id: 'skill-fw', label: 'Frameworks', items: [['Echo', '#00add8'], ['Gin', '#e07a5f'], ['Spring', '#6e9a45'], ['React', '#61dafb']] },
  { id: 'skill-db', label: 'Databases', items: [['MySQL', '#e39b2b'], ['Postgres', '#3d6b8a'], ['BigQuery', '#4e7a9a'], ['Redis', '#c45c48']] },
  { id: 'skill-msg', label: 'Messaging', items: [['Kafka', '#2c2118'], ['Pub/Sub', '#4e7a44'], ['Sockets', '#c9843f']] },
  { id: 'skill-cloud', label: 'Cloud', items: [['GCP', '#4e7a9a'], ['AWS', '#e39b2b'], ['Cloudflare', '#e07a5f'], ['Docker', '#3d7ea6'], ['K8s', '#326ce5'], ['Git', '#c45c48'], ['Jenkins', '#8d5a32'], ['Jira', '#3d5a80']] },
  { id: 'skill-ml', label: 'ML and AI', items: [['TF', '#e39b2b'], ['CNNs', '#8e3d5c'], ['NLP', '#4e7a44'], ['LLMs', '#3d5a80'], ['Unstruct.', '#c9843f']] },
  { id: 'skill-ai', label: 'AI tools', items: [['Cursor', '#2c2118'], ['Agents', '#e07a5f'], ['Flows', '#4e7a44']] },
]

export const SKILL_COPY = {
  'skill-lang': { title: 'Languages', lines: ['Go, Java, C++, Python, TypeScript, and SQL.'] },
  'skill-fw': { title: 'Frameworks', lines: ['Echo, Gin, Spring Boot, and React.'] },
  'skill-db': { title: 'Databases and caching', lines: ['MySQL, PostgreSQL, BigQuery, and Redis.'] },
  'skill-msg': { title: 'Messaging and real time', lines: ['Kafka, GCP Pub/Sub, and WebSockets.'] },
  'skill-cloud': { title: 'Cloud and DevOps', lines: ['Google Cloud Platform, Amazon Web Services, Cloudflare, Docker, Kubernetes, Git, Jenkins, and Jira.'] },
  'skill-ml': { title: 'Machine learning and AI', lines: ['TensorFlow, CNNs, NLP, LLM prompting, and Unstructured IO.'] },
  'skill-ai': { title: 'AI-assisted development', lines: ['Cursor, agentic coding tools, and automated workflows.'] },
}

export const BOOKS = {
  'book-degree': {
    title: 'B.Tech in Computer Engineering',
    lines: [
      'K. J. Somaiya College of Engineering, Mumbai. Somaiya Vidyavihar University.',
      'Bachelor of Technology in Computer Engineering, with Honours in Cyber Security and Forensics.',
      'CGPA 8.67 out of 10. Finished May 2025.',
      'The certificates on the left wall are the short courses from those years.',
    ],
  },
  'book-school': {
    title: 'School and high school',
    lines: [
      'The years before college: school, then higher secondary, then the engineering degree.',
      'This resume lists the degree, the honours, and the CGPA. It does not list class 10 or class 12 board marks, so those scores are not printed here.',
    ],
  },
}

export const DRAMA = {
  title: 'Rhapsody',
  lines: [
    'Drama club at K. J. Somaiya College of Engineering.',
    'Member from July 2022 to July 2023. Creative Head from July 2023 to July 2024.',
    'Led the club’s creative direction and writing, and guided productions across formats.',
    'National-level wins in street play, stage play, and short film.',
    'Wrote, directed, and acted in the computer department’s entry for Shield, the inter-branch cultural drama competition, and won all three years: 2022, 2023, and 2024.',
  ],
}

const fulcrum = {
  name: 'Fulcrum',
  file: 'fulcrum.md',
  body: [
    'Fulcrum · Warehouse automation',
    'Purplle.com, Mumbai. Software Development Engineer Trainee, July 2025 to July 2026, then Software Development Engineer I from July 2026.',
    '',
    'Designed and built inter-warehouse inventory movement from scratch: automated purchase orders, lane management, movement suggestions, event pipelines, and fallback and recovery. Manual purchase-order work fell by about 70%.',
    '',
    'A contract-backed inventory system for Ready-for-Dispatch stock held by vendors. It calculates and distributes inventory from what the warehouse network needs.',
    '',
    'Backend for the warehouse capacity, lane management, and warehouse feeder network panels.',
  ].join('\n'),
}

const martech = {
  name: 'Martech',
  file: 'martech.md',
  body: [
    'Marketing technology · CRM',
    '',
    'Moved a legacy PHP monolith to Go microservices for data, content, channel configuration, and campaign orchestration across WhatsApp, SMS, and app push.',
    '',
    'Self-healing campaign scheduling that recovers from pod crashes and out-of-memory restarts with no data loss. Campaign failures fell by about 30%.',
    '',
    'Production React panels, built independently. Frontend features landed about twice as fast.',
  ].join('\n'),
}

const pricing = {
  name: 'Smart pricing',
  file: 'pricing.md',
  body: [
    'Smart pricing',
    '',
    'A calendar-based price scheduler for external brands, with observability and coverage panels.',
    '',
    'The Vendor Panel, a self-serve pricing system: margin-bleed calculations, SKU checks, pricing-algorithm adjustments, and a consistent API. Pricing inconsistencies fell by about 40%.',
    '',
    'Fewer redundant queries and calmer goroutine use on the price-retrieval API. Responses about twice as fast, and fewer load-balancer timeouts.',
    '',
    'Security fixes across the pricing services.',
  ].join('\n'),
}

const intern = {
  name: 'Internship',
  file: 'internship.md',
  body: [
    'Internship · Purplle.com, Mumbai',
    'Software Development Engineer Intern, January 2025 to June 2025.',
    '',
    'Go services with error handling, logging, and observability through CI/CD.',
    '',
    'Cron jobs moved into internal microservices, so the team no longer depended on an Airflow DAG. Infrastructure cost came down.',
    '',
    'Hands-on work with Kafka, Redis, and Kubernetes, in a high-scale e-commerce team.',
  ].join('\n'),
}

const kru = {
  name: 'KRU',
  file: 'kru.md',
  body: [
    'KRU · swipe-based team formation',
    'Independent project, August 2026 to October 2026. Team of 2.',
    '',
    'A way for developers and students to find teammates for projects and hackathons. React, TypeScript, Go, MySQL, and Redis.',
    '',
    'Collaborators are ranked with a weighted model: skill overlap and complementarity, role fit, interests, experience, location, availability, and recent activity, plus hard SQL filters. Mutual matching, daily likes, weekly super-likes, one-to-one and group chat over WebSockets, and a team Kanban board.',
    '',
    'The Go API is split into handler, use-case, and repository layers. JWT and Google or GitHub sign-in, an event bus for in-app and email notes, Redis for quotas, deck cache, and chat, report-based flagging, and presigned uploads to Cloudflare R2.',
  ].join('\n'),
}

const breathe = {
  name: 'BreatheAware',
  file: 'breatheaware.md',
  body: [
    'BreatheAware · lung cancer detection from CT scans',
    'Mini project, April 2024 to September 2024. Team of 3. Graded O, the highest in the scheme.',
    '',
    'A TensorFlow model for early-stage lung cancer in CT images. Transfer learning with EfficientNet-B3, pre-trained on ImageNet, plus preprocessing, augmentation, batch normalisation, dropout, and fine-tuning. Evaluated on accuracy, precision, recall, and F1, then served through a web page.',
    '',
    'Atharv led model development and training, and worked on the image preprocessing pipeline.',
    '',
    'The resume does not publish a single accuracy percentage, so none is shown here.',
  ].join('\n'),
}

const simplify = {
  name: 'Simplify.io',
  file: 'simplify.md',
  body: [
    'Simplify.io · a RAG assistant for documents',
    'July 2024. Team of 4. Shortlisted at the Godrej Gen AI Digital Assistant Hackathon.',
    '',
    'Summarises and synthesises PDFs, PowerPoint decks, and Word documents in a conversation. Unstructured IO for ingestion. Meta-Llama-3-8B-Instruct for generation.',
    '',
    'Atharv worked on the architecture and the document RAG pipeline: ingestion, chunking, embeddings, and retrieval with LangChain, Hugging Face, and ChromaDB, and Llama 3 for answers grounded in the documents.',
  ].join('\n'),
}

const room = {
  name: 'This room',
  file: 'portfolio.md',
  body: [
    'This room · the portfolio',
    '',
    'A small bedroom built in three.js, open on one side so the three walls can be read at once. Scroll to come closer. Click a book, the monitor, a shelf, a certificate, the phone, or the masks.',
    '',
    'The monitor is the work at Purplle and the projects beside it. The shelf is the toolkit. The phone is how to reach Atharv.',
  ].join('\n'),
}

export const TREES = {
  experience: {
    prompt: 'experience',
    intro: 'Purplle.com, Mumbai. The folders are the bodies of work.',
    files: [fulcrum, martech, pricing, intern],
  },
  personal: {
    prompt: 'personal',
    intro: 'Projects outside the job, and this room.',
    files: [kru, breathe, simplify, room],
  },
}

export const PHONE = [
  { name: 'LinkedIn', icon: 'icons/linkedin.png', href: 'https://www.linkedin.com/in/atharv-mundhe-38032a214/', kind: 'https' },
  { name: 'Gmail', icon: 'icons/gmail.png', href: 'mailto:atharv.mundhe03@gmail.com', kind: 'mail' },
  { name: 'LeetCode', icon: 'icons/leetcode.png', href: 'https://leetcode.com/u/user9956XA/', kind: 'https' },
  { name: 'GitHub', icon: 'icons/github.png', href: 'https://github.com/Atharvmm', kind: 'https' },
]
