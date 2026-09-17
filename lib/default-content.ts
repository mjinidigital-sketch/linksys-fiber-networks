import { WebsiteContent, PageConfig } from './types/content'

export const defaultPageLayouts: Record<string, PageConfig> = {
  '/': {
    id: 'page-home',
    name: 'Home Page',
    path: '/',
    description: 'Main landing page of Linksys Fiber Networks Molo',
    enabled: true,
    blocks: [
      { id: 'blk-home-hero', type: 'hero', title: 'Hero Section', enabled: true },
      { id: 'blk-home-stats', type: 'stats', title: 'Company Statistics', enabled: true },
      { id: 'blk-home-packages', type: 'pricing', title: 'Internet Packages', enabled: true },
      { id: 'blk-home-services', type: 'services', title: 'Our Services', enabled: true },
      { id: 'blk-home-tech', type: 'techStack', title: 'Network Infrastructure & Equipment', enabled: true },
      { id: 'blk-home-logos', type: 'logos', title: 'Partners & Hardware Brands', enabled: true },
      { id: 'blk-home-process', type: 'process', title: 'How to Get Connected', enabled: true },
      { id: 'blk-home-projects', type: 'projects', title: 'Featured Deployments & Case Studies', enabled: true },
      { id: 'blk-home-blog', type: 'blog', title: 'Latest Articles & Tips', enabled: true },
      { id: 'blk-home-faq', type: 'faq', title: 'FAQ Section', enabled: true },
      { id: 'blk-home-contact', type: 'contact', title: 'Contact Section', enabled: true },
    ]
  },
  '/packages': {
    id: 'page-packages',
    name: 'Internet Packages Page',
    path: '/packages',
    description: 'Affordable high-speed fiber and WiFi packages in Molo',
    enabled: true,
    blocks: [
      { id: 'blk-pkg-pricing', type: 'pricing', title: 'All Internet Packages', enabled: true },
      { id: 'blk-pkg-faq', type: 'faq', title: 'Packages FAQ', enabled: true },
      {
        id: 'blk-pkg-cta',
        type: 'ctaBanner',
        title: 'Ready to Get Connected?',
        description: 'Contact our local Molo team today and get installed in no time.',
        enabled: true,
        data: {
          title: 'Looking for Fast, Reliable Internet?',
          description: 'Linksys Fiber Networks is here to keep your home or business online with high-speed, uninterrupted connectivity across Molo and its environs.',
          ctaText: 'Get Connected Now',
          ctaLink: '/contact',
        },
      }
    ]
  },
  '/services': {
    id: 'page-services',
    name: 'Services Page',
    path: '/services',
    description: 'Fiber internet, hotspot broadcasting, CCTV security, cabling & IT support in Molo',
    enabled: true,
    blocks: [
      { id: 'blk-serv-grid', type: 'services', title: 'Our Core Services', enabled: true },
      { id: 'blk-serv-process', type: 'process', title: 'Installation & Support Process', enabled: true },
      { id: 'blk-serv-faq', type: 'faq', title: 'Services FAQ', enabled: true }
    ]
  },
  '/templates': {
    id: 'page-templates',
    name: 'Equipment & Hardware Bundles',
    path: '/templates',
    description: 'Pre-configured networking, router kits & security hardware systems',
    enabled: true,
    blocks: [
      { id: 'blk-tmpl-grid', type: 'templates', title: 'Networking Equipment & Kits', enabled: true },
      {
        id: 'blk-tmpl-cta',
        type: 'ctaBanner',
        title: 'Need a Custom Enterprise Setup?',
        description: 'Looking for dedicated leased lines, campus networking, or bespoke CCTV installation in Molo?',
        enabled: true,
        data: {
          title: 'Need a Custom Enterprise Network?',
          description: 'Our certified network engineers design custom setups for schools, hospitals, hotels, and business estates.',
          ctaText: 'Consult Our Engineers',
          ctaLink: '/contact',
        },
      }
    ]
  },
  '/blog': {
    id: 'page-blog',
    name: 'Blog Page',
    path: '/blog',
    description: 'Internet guides, technology insights, and connectivity tips for Molo',
    enabled: true,
    blocks: [
      { id: 'blk-blog-posts', type: 'blog', title: 'Read Our Blog Posts', enabled: true }
    ]
  },
  '/contact': {
    id: 'page-contact',
    name: 'Contact Page',
    path: '/contact',
    description: 'Contact Linksys Fiber Networks Molo office, customer care, and WhatsApp support',
    enabled: true,
    blocks: [
      { id: 'blk-contact-main', type: 'contact', title: 'Get in Touch with Linksys Fiber', enabled: true },
      { id: 'blk-contact-faq', type: 'faq', title: 'Quick Answers FAQ', enabled: true }
    ]
  },
  '/careers': {
    id: 'page-careers',
    name: 'Careers Page',
    path: '/careers',
    description: 'Explore job opportunities and join our team in Molo',
    enabled: true,
    blocks: [
      {
        id: 'blk-careers-hero',
        type: 'hero2',
        title: 'Join Our Team',
        enabled: true,
        data: {
          badge: "We're Hiring",
          titleLine1: 'Explore & Apply for',
          titleHighlight1: 'Job Opportunities',
          bio: 'Stay connected and help build reliable fiber & WiFi networks across Molo. Explore open positions and launch your career with Linksys Fiber Networks.',
          primaryCtaText: 'View Open Roles',
          primaryCtaLink: '#open-positions',
          secondaryCtaText: 'Contact Us',
          secondaryCtaLink: '/contact',
        },
      },
      { id: 'blk-careers-jobs', type: 'careers', title: 'Open Positions', enabled: true },
      { id: 'blk-careers-faq', type: 'faq', title: 'Careers FAQ', enabled: true },
    ],
  }
}

export const defaultContent: WebsiteContent = {
  general: {
    siteName: 'Linksys Fiber Networks',
    siteTagline: 'Fast, Affordable & Reliable Internet Provider in Molo & Environs',
    displayName: 'Linksys Fiber Networks',
    role: 'Internet Service Provider & Tech Solutions',
    shortBio: 'Linksys is a trusted internet service provider in Molo offering fast, reliable, and affordable fiber and Wi-Fi for homes and businesses. Delivering uninterrupted connectivity, CCTV, and IT solutions across Molo and its environs.',
    avatarUrl: '/linksys-logo-final.webp',
    location: 'Generis Hotel Building, Ground Floor, Molo, Nakuru County',
    primaryLocation: 'Molo, Nakuru County, Kenya',
    areasServed: [
      'Molo CBD (Generis Hotel Building)',
      'Tayari',
      'Moto',
      'Turi',
      'Kibunja',
      'Promise',
      '20 Acres',
      'Kenyatta 123',
      'Treasure',
      'Upperhill Estate',
      'Mwangaza',
      'Kasino',
      'Keepleft',
      'Mutirithia',
      'Millimani',
      'Elburgon & Greater Nakuru County',
    ],
    email: 'info@linksysfiber.ke',
    phone: '+254 713 366 366',
    resumeUrl: '/packages',
    availableForWork: true,
    statusBadge: 'Fast Installation & 24/7 Support Available'
  },
  navigation: {
    brandName: 'Linksys',
    brandAccent: 'Fiber',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Packages', href: '/packages' },
      { label: 'Services', href: '/services' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' }
    ]
  },
  hero: {
    badge: 'Trusted Internet Service Provider in Molo',
    titleLine1: 'Affordable, Fast &',
    titleHighlight1: 'Reliable Internet',
    titleLine2: 'for Homes &',
    titleHighlight2: 'Businesses in Molo.',
    bio: 'Are you in Molo and in need of reliable and fast fiber or WiFi internet? Stay connected with high-speed fiber and WiFi packages designed for uninterrupted streaming, working, and gaming.',
    primaryCtaText: 'View Packages',
    primaryCtaLink: '/packages',
    secondaryCtaText: 'Get Connected',
    secondaryCtaLink: '/contact',
    locationText: 'Molo, Nakuru County, Kenya',
    avatarUrl: '/linksys-logo-final.webp',
    statusCardLabel: 'Network Status',
    statusCardText: '99.9% Uptime Active',
    statusCardHighlight: ' 24/7',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551808525-51a94da548ce?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520869562399-e772f042f422?q=80&w=1200&auto=format&fit=crop',
    ]
  },
  techStack: {
    sectionLabel: 'Network Infrastructure',
    subtitle: 'Enterprise-grade technology powering our high-speed network',
    items: [
      'Fiber Optic Backbones',
      'GPON / EPON Technology',
      'MikroTik Core Routers',
      'Ubiquiti UniFi & AirMax',
      'Cisco Enterprise Routing',
      'Cambium Wireless Links',
      'Structured Cat6/Cat7 LAN',
      'Hikvision & Dahua CCTV'
    ]
  },
  logos: {
    sectionLabel: 'Hardware & Carrier Partners',
    title: 'Powered by world-class telecommunications hardware.',
    subtitle: 'We deploy robust, industry-standard equipment to guarantee minimal packet loss and maximum uptime.',
    items: [
      'MikroTik',
      'Ubiquiti',
      'Cisco',
      'Cambium Networks',
      'Hikvision',
      'Dahua',
      'TP-Link',
      'Huawei Enterprise'
    ]
  },
  projects: {
    sectionLabel: 'Network Deployments',
    title: 'Featured Installations & Case Studies',
    ctaText: 'Request Site Survey',
    ctaLink: '/contact',
    items: [
      {
        id: 'proj-1',
        title: 'Molo CBD Commercial Fiber Backbone',
        type: 'Enterprise Fiber Rollout',
        description: 'Deployment of dedicated high-speed fiber optic ring supplying uninterrupted connectivity to hotels, banks, and retail centers in Molo town.',
        summary: 'Underground fiber distribution network supporting over 120 commercial premises with zero daytime latency spikes.',
        content: `### Commercial Fiber Infrastructure in Molo CBD

To support the growing digital economy in Molo, Linksys engineered and deployed a dedicated fiber optic ring connecting prime commercial buildings around Generis Hotel, Kenyatta Road, and surrounding trading centers.

#### Key Deployment Highlights:
- **Redundant Fiber Rings**: Automatic failover link preventing commercial downtime.
- **Dedicated Bandwidth**: Symmetrical upload and download speeds for point-of-sale systems and office servers.
- **24/7 Network Monitoring**: Real-time packet inspection and proactive link maintenance.

:::callout[tip]
Achieved 99.95% measured uptime across commercial tenants with average response times under 15 minutes for local support calls.
:::`,
        tags: ['Fiber Optics', 'GPON', 'MikroTik', 'Molo CBD'],
        accent: 'bg-[#02659C]',
        link: '/packages',
        featured: true,
        category: 'Commercial Network',
        liveUrl: 'https://linksysfiber.ke/packages',
        githubUrl: 'https://linksysfiber.ke/contact',
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop'
      },
      {
        id: 'proj-2',
        title: 'Tayari & Upperhill Residential WiFi Coverage',
        type: 'Residential Hotspot & Fiber',
        description: 'Comprehensive high-speed home fiber and localized outdoor Wi-Fi broadcasting for residential estates in Tayari and Upperhill.',
        summary: 'High-density wireless access points and fiber distribution boxes serving hundreds of households and remote workers.',
        content: `### High-Speed Residential Expansion

Expanded high-speed home fiber and neighborhood Wi-Fi broadcasting across Tayari, Upperhill Estate, and Promise.

#### Project Milestones:
- **Zero Buffering**: Seamless 4K video streaming and Zoom conferencing for families.
- **Flexible Subscription Plans**: From 6 Mbps Base to 25 Mbps Home Pro.
- **Fast Same-Day Installation**: Professional cable routing and in-home optical network terminal (ONT) setup.`,
        tags: ['Home Fiber', 'Residential WiFi', 'Ubiquiti', 'Tayari'],
        accent: 'bg-[#77BC43]',
        link: '/packages',
        featured: true,
        category: 'Residential Fiber',
        liveUrl: 'https://linksysfiber.ke/packages',
        githubUrl: 'https://linksysfiber.ke/contact',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop'
      },
      {
        id: 'proj-3',
        title: 'Campus LAN & Integrated CCTV Security Setup',
        type: 'Structured Cabling & Surveillance',
        description: 'Turnkey campus networking with structured Cat6 cabling, high-definition IP cameras, and centralized network management.',
        summary: 'Complete integration of fast administrative WiFi, computer lab cabling, and perimeter security surveillance.',
        tags: ['Structured Cabling', 'CCTV Security', 'Hikvision', 'LAN'],
        accent: 'bg-[#002b40]',
        link: '/services',
        featured: true,
        category: 'Security & Cabling',
        liveUrl: 'https://linksysfiber.ke/services',
        githubUrl: 'https://linksysfiber.ke/contact',
        image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1000&auto=format&fit=crop'
      },
      {
        id: 'proj-4',
        title: 'Turi & Kibunja Long-Range Wireless Link',
        type: 'Point-to-Multipoint Wireless',
        description: 'High-throughput wireless bridge connecting rural schools, farms, and agribusinesses in Turi and Kibunja back to the core Molo fiber ring.',
        tags: ['Wireless Link', 'Cambium', 'AirMax', 'Rural Internet'],
        accent: 'bg-emerald-600',
        link: '/packages',
        featured: false,
        category: 'Wireless Bridge',
        liveUrl: 'https://linksysfiber.ke/packages',
        githubUrl: 'https://linksysfiber.ke/contact',
        image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1000&auto=format&fit=crop'
      }
    ]
  },
  process: {
    sectionLabel: 'How to Get Connected',
    title: 'Fast, simple setup in 3 easy steps.',
    steps: [
      {
        id: 'proc-1',
        stepNumber: '01',
        title: 'Select Your Package',
        description: 'Choose the ideal speed plan for your home, online study, or business needs — from 6 Mbps up to 40 Mbps.'
      },
      {
        id: 'proc-2',
        stepNumber: '02',
        title: 'Fast Site Survey & Setup',
        description: 'Our Molo technicians visit your premises, lay the fiber/wireless cable, configure your Wi-Fi router, and test latency.'
      },
      {
        id: 'proc-3',
        stepNumber: '03',
        title: 'Enjoy 24/7 Unlimited Internet',
        description: 'Stream, work, game, and browse with zero data caps, backed by our friendly 24/7 local technical support.'
      }
    ]
  },
  services: {
    sectionLabel: 'Our Services',
    title: 'Comprehensive Internet & Tech Solutions in Molo',
    subtitle: 'Explore our range of reliable connectivity and IT services tailored for both homes and businesses in Molo and environs.',
    items: [
      {
        id: 'serv-1',
        title: 'High-Speed Fiber & Home Internet',
        description: 'Fast, unlimited fiber and wireless internet connections directly to your home or apartment in Molo with zero buffering and low ping.',
        icon: 'Wifi',
        price: 'From KSh 1,500/mo',
        popular: true,
        features: [
          'Unlimited monthly data with zero throttling',
          'Speeds from 6 Mbps to 40 Mbps',
          'Free dual-band Wi-Fi router configuration',
          'Dedicated 24/7 local customer support'
        ],
        summary: 'Stable high-speed home connectivity for streaming, work-from-home, online learning, and gaming.',
        content: `### High-Speed Fiber & Home Internet in Molo

Enjoy seamless streaming, crystal-clear video calls, and instant downloads with Linksys Fiber Networks.

#### Key Features:
- **Truly Unlimited**: No fair usage policy limits or hidden caps.
- **Low Latency**: Optimized routing for Zoom calls, Netflix, YouTube 4K, and online gaming.
- **Fast Installation**: Professional cabling and router setup within hours of booking.`
      },
      {
        id: 'serv-2',
        title: 'Hotspot & Public Wi-Fi Broadcasting in Molo',
        description: 'Fast and reliable hotspot and public Wi-Fi broadcasting for businesses, hotels, estates, cafes, and public spaces in Molo.',
        icon: 'Radio',
        price: 'Custom scope',
        popular: false,
        features: [
          'Captive portal login & customized billing vouchers',
          'High-density outdoor & indoor access points',
          'User bandwidth management & traffic isolation',
          'Monetization options for venue owners'
        ],
        summary: 'Turnkey public Wi-Fi deployment with automated voucher systems and secure guest isolation.',
        content: `### Public Wi-Fi & Hotspot Solutions

Empower your business or commercial venue with branded guest Wi-Fi or monetize bandwidth with automated M-Pesa voucher systems.`
      },
      {
        id: 'serv-3',
        title: 'Wireless & Structured Cabling Networking',
        description: 'Professional wireless links and structured Cat6/Cat7 LAN cabling for offices, schools, and multi-story commercial buildings.',
        icon: 'Network',
        price: 'Custom quote',
        popular: false,
        features: [
          'Clean structured patch panel & rack installation',
          'Long-range point-to-point wireless links',
          'Fiber optic splicing & testing',
          'Enterprise VLAN & firewall configuration'
        ],
        summary: 'Neat, high-capacity local area networks engineered for maximum reliability and future expansion.',
        content: `### Structured Cabling & Wireless Networks

Build a durable IT network foundation with certified cabling standards, cable management, and enterprise-grade switches.`
      },
      {
        id: 'serv-4',
        title: 'CCTV & Security Solutions in Molo',
        description: 'Expert CCTV installation in Molo with complete security solutions including HD/IP cameras, mobile viewing, and security lighting.',
        icon: 'ShieldCheck',
        price: 'From KSh 15,000',
        popular: false,
        features: [
          'High-definition day/night vision IP cameras',
          'Real-time remote mobile app viewing anywhere',
          'DVR / NVR recording with motion detection',
          'Electric fencing & security lighting integration'
        ],
        summary: 'Protect your home, business, or farm in Molo with modern 24/7 video surveillance systems.',
        content: `### Complete CCTV & Security Installations

Keep an eye on what matters most. We install high-definition security cameras with night vision and remote live streaming on your smartphone.`
      },
      {
        id: 'serv-5',
        title: 'IT Support & Managed IT Services in Molo',
        description: 'Reliable IT support and managed computer/server services in Molo for businesses, schools, and offices.',
        icon: 'Cpu',
        price: 'Monthly retainers available',
        popular: false,
        features: [
          'Hardware repair, computer maintenance & upgrades',
          'Automated data backup & recovery systems',
          'Antivirus, firewall & cybersecurity protection',
          'Prompt on-site and remote technical assistance'
        ],
        summary: 'Comprehensive IT troubleshooting, preventive maintenance, and computer systems management.',
        content: `### Managed IT Services for Molo Businesses

Let our IT specialists handle your computer systems, backups, and network troubleshooting so you can focus on your business.`
      }
    ]
  },
  pricing: {
    sectionLabel: 'Affordable Plans',
    title: 'Our Internet Packages in Molo',
    subtitle: 'Unlimited high-speed internet designed for households, students, and businesses across Molo.',
    plans: [
      {
        id: 'plan-base',
        name: 'BASE',
        description: 'Ideal for light browsing, social media, WhatsApp, and email on 1-2 devices.',
        price: 1500,
        isRecommended: false,
        icon: 'Wifi',
        features: [
          '6 Mbps High-Speed Internet',
          'Ideal for browsing & social media',
          'Stable connection for small households',
          'Email & basic streaming support',
          '24/7 customer support'
        ]
      },
      {
        id: 'plan-student',
        name: 'STUDENT',
        description: 'Perfect for online classes, research, Zoom calls, and smooth HD video playback.',
        price: 1700,
        isRecommended: false,
        icon: 'GraduationCap',
        features: [
          '10 Mbps High-Speed Internet',
          'Perfect for online classes & Zoom',
          'Smooth HD video streaming',
          'Reliable for assignments & research',
          '24/7 customer support'
        ]
      },
      {
        id: 'plan-home-basic',
        name: 'DS-HOME BASIC',
        description: 'Our most popular plan for families. Smooth streaming, gaming, and multiple connected phones.',
        price: 2000,
        isRecommended: true,
        icon: 'Home',
        features: [
          '20 Mbps High-Speed Internet',
          'Multiple device connectivity (4-6 devices)',
          'HD streaming & gaming support',
          'Fast downloads & uploads',
          '24/7 customer support'
        ]
      },
      {
        id: 'plan-home-pro',
        name: 'DS-HOME PRO',
        description: 'High-throughput connectivity for heavy households, 4K streaming, and remote professionals.',
        price: 2500,
        isRecommended: false,
        icon: 'Zap',
        features: [
          '25 Mbps High-Speed Internet',
          'Seamless streaming on multiple screens',
          'Online gaming ready with low latency',
          'Work-from-home optimized',
          'Priority customer support'
        ]
      },
      {
        id: 'plan-business',
        name: 'BUSINESS',
        description: 'Reliable commercial internet for shops, pharmacies, cybercafes, and small offices.',
        price: 3000,
        isRecommended: false,
        icon: 'Briefcase',
        features: [
          '30 Mbps High-Speed Internet',
          'Reliable for offices & SMEs',
          'Fast cloud access & file uploads',
          'Multi-user simultaneous browsing',
          'Priority business support'
        ]
      },
      {
        id: 'plan-business-pro',
        name: 'BUSINESS PRO',
        description: 'Heavy usage business connectivity for hotels, institutions, and growing corporate teams.',
        price: 3500,
        isRecommended: false,
        icon: 'Building',
        features: [
          '35 Mbps High-Speed Internet',
          'High-performance business connectivity',
          'Heavy usage & multitasking ready',
          'Video conferencing without lag',
          'Dedicated support & uptime focus'
        ]
      },
      {
        id: 'plan-business-premium',
        name: 'BUSINESS PREMIUM',
        description: 'Maximum speed package for enterprise networks, schools, and large commercial operations.',
        price: 4000,
        isRecommended: false,
        icon: 'Shield',
        features: [
          '40 Mbps High-Speed Internet',
          'Ultra-fast speeds for large teams',
          'Enterprise-grade performance',
          'Heavy downloads & cloud operations',
          'Top-tier priority support'
        ]
      }
    ]
  },
  stats: {
    sectionLabel: 'Our Proven Track Record',
    title: 'Connecting Molo and Its Environs with Pride',
    subtitle: 'Over a decade of dependable internet service, robust fiber infrastructure, and happy clients.',
    items: [
      {
        id: 'stat-1',
        value: '10+',
        label: 'Years of Experience',
        description: 'Serving Molo and surrounding towns with trusted telecommunication solutions since our founding.'
      },
      {
        id: 'stat-2',
        value: '1000+',
        label: 'Homes Connected',
        description: 'Reliable fiber and Wi-Fi powering everyday family entertainment, study, and communication.'
      },
      {
        id: 'stat-3',
        value: '250+',
        label: 'Businesses Connected',
        description: 'Powering Molo CBD hotels, banks, cybercafes, schools, and enterprises daily.'
      },
      {
        id: 'stat-4',
        value: '99.9%',
        label: 'Network Uptime',
        description: 'Redundant fiber backbone ensuring minimal downtime and instant local technical support.'
      }
    ]
  },
  templates: {
    sectionLabel: 'Hardware & Kits',
    title: 'Pre-configured Networking & Hardware Bundles',
    subtitle: 'Tested routers, wireless boosters, and security packages ready for rapid on-site installation in Molo.',
    items: [
      {
        id: 'tmpl-1',
        title: 'Dual-Band Gigabit Fiber Home Router Kit',
        slug: 'home-router-bundle',
        category: 'Home Wi-Fi Hardware',
        description: 'Pre-configured high-gain dual-band AC1200 router optimized for optical fiber terminals and wide home coverage.',
        summary: 'Plug-and-play Wi-Fi router bundle with surge protector, pre-spliced patch cord, and setup guide.',
        tags: ['Wi-Fi 5/6', 'Dual-Band', 'Gigabit Ports', 'Molo Fiber'],
        price: 'Included with Setup',
        liveDemoUrl: 'https://linksysfiber.ke/packages',
        githubUrl: 'https://linksysfiber.ke/contact',
        previewImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop',
        features: [
          'Dual-band 2.4GHz & 5GHz concurrent transmission',
          '4 high-gain 5dBi omnidirectional antennas',
          'Gigabit WAN and LAN Ethernet ports',
          'Parental controls & guest network isolation',
          '1-year manufacturer replacement warranty'
        ],
        featured: true,
        content: `### Gigabit Home Wi-Fi Router Bundle

Get maximum speed from your fiber connection with our tested dual-band routers configured specifically for the Linksys Fiber network.

#### What is Included:
- **Dual-Band Wireless Router**: Supports 30+ simultaneous smart devices without dropping packets.
- **Pre-spliced Fiber Drop Cable & Connectors**: Low-loss optical fiber installation.
- **On-Site Installation**: Professional testing by our field technicians.`
      },
      {
        id: 'tmpl-2',
        title: 'Commercial Hotspot & Voucher Gateway Kit',
        slug: 'commercial-hotspot-kit',
        category: 'Hotspot Hardware',
        description: 'Complete outdoor long-range Wi-Fi broadcasting kit with integrated MikroTik captive portal and M-Pesa voucher engine.',
        summary: 'Turnkey public Wi-Fi solution covering up to 300 meters radius for business venues, estates, and centers.',
        tags: ['Outdoor Wi-Fi', 'MikroTik', 'Voucher Billing', 'Hotspot'],
        price: 'Custom Quote',
        liveDemoUrl: 'https://linksysfiber.ke/services',
        githubUrl: 'https://linksysfiber.ke/contact',
        previewImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
        features: [
          'High-power outdoor weatherproof access points (IP67)',
          'MikroTik routerboard with automated voucher script',
          'Instant M-Pesa automated billing integration',
          'Bandwidth rate limiting per connected client'
        ],
        featured: true,
        content: `### Turnkey Hotspot & Voucher System

Monetize internet access or provide branded Wi-Fi for your guests in Molo with automated M-Pesa voucher generation and revenue tracking.`
      }
    ]
  },
  blog: {
    sectionLabel: 'Articles & Insights',
    title: 'Tips & Tech Guides from Molo’s Top ISP',
    subtitle: 'Helpful advice on optimizing your Wi-Fi, understanding fiber technology, and getting the fastest internet speeds in Kenya.',
    posts: [
      {
        id: 'post-1',
        slug: 'why-your-internet-is-slow-and-how-to-fix-it',
        title: 'Why Your Internet is Slow and How to Fix It',
        excerpt: 'Find out why your internet is slow and learn simple, effective ways to fix it for better speed, stability, and performance at home or office.',
        date: 'Mar 10, 2026',
        readTime: '5 min read',
        category: 'Internet Tips',
        coverImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop',
        published: true,
        content: `Having slow internet can be frustrating whether you are attending an online class, working remotely from Molo, or streaming your favorite show. Here are the top reasons your internet might feel sluggish and how you can fix it:

## 1. Router Placement Matters

Place your Wi-Fi router in a central, elevated location in your home. Thick stone walls, metal cabinets, and kitchen appliances can severely degrade 2.4GHz and 5GHz wireless signals.

:::callout[tip]
Keep your router at least 1 meter off the ground and away from microwave ovens or large mirrors.
:::

## 2. Too Many Connected Devices

If multiple family members or staff are simultaneously streaming 4K video, downloading large updates, and gaming, your bandwidth may be saturated. Consider upgrading to our **20 Mbps DS-HOME BASIC** or **25 Mbps DS-HOME PRO** package.

## 3. Background Applications and Downloads

Check your computers and phones for background software updates, cloud syncing (Google Photos, OneDrive, iCloud), and torrent clients that silently consume your upload bandwidth.

## 4. Optical Fiber vs. Old Wireless Connections

Traditional copper cables and congested wireless bands suffer from weather degradation and electromagnetic interference. Upgrading to a pure optical fiber line from Linksys ensures steady, symmetrical speeds rain or shine!

> "A well-positioned router and a clean fiber line solve 95% of everyday speed issues."`
      },
      {
        id: 'post-2',
        slug: 'difference-between-fiber-wireless-and-hotspot-internet',
        title: 'Difference Between Fiber, Wireless, and Hotspot Internet',
        excerpt: 'Understand the difference between fiber, wireless, and hotspot internet and choose the best option for your home or business in Kenya.',
        date: 'Feb 18, 2026',
        readTime: '6 min read',
        category: 'Guide',
        coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
        published: true,
        content: `Choosing the right internet connection in Molo depends on your location, budget, and bandwidth requirements. Let us compare the three primary connection types:

## 1. Fiber Optic Internet (Fastest & Most Reliable)
Fiber transmits data as pulses of light over thin glass strands. It offers virtually unlimited bandwidth, symmetrical upload/download speeds, and zero susceptibility to rain or electrical interference.

- **Best for**: Permanent homes, apartments, offices, hotels, and businesses in Molo CBD and connected estates.

## 2. Fixed Wireless Internet
Wireless uses directional microwave radio antennas installed on rooftops to receive signals from a nearby broadcast mast.

- **Best for**: Areas where underground fiber cable has not yet been trenching (such as outlying farms and rural homesteads around Turi or Kibunja).

## 3. Public Hotspots & Wi-Fi Broadcasting
Public hotspots allow users to connect on-the-go using vouchers or pay-as-you-go access.

- **Best for**: Students, cafes, market stalls, and visitors needing quick, affordable daily access.`
      },
      {
        id: 'post-3',
        slug: 'what-is-fiber-internet-and-how-does-it-work-in-kenya',
        title: 'What is Fiber Internet and How Does It Work in Kenya?',
        excerpt: 'Learn what fiber internet is, how it works in Kenya, and why it is faster and more reliable than traditional internet connections for homes and businesses.',
        date: 'Jan 28, 2026',
        readTime: '4 min read',
        category: 'Technology',
        coverImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1000&auto=format&fit=crop',
        published: true,
        content: `Fiber optic technology has revolutionized internet access across Kenya. By connecting to undersea submarine cables along the Kenyan coast in Mombasa and routing through national fiber backbones to Nakuru and Molo, fiber delivers light-speed connectivity directly to your door.

### Why Molo Residents Are Switching to Fiber:
1. **Zero Buffering**: Instant video streaming and lightning-fast downloads.
2. **Weatherproof**: Unaffected by heavy rains or cold temperatures in Molo.
3. **Affordability**: Fixed monthly billing starting from only KSh 1,500 with zero data limits.`
      },
      {
        id: 'post-4',
        slug: 'the-best-internet-provider-in-molo',
        title: 'The Best Internet Provider in Molo: Why Linksys Fiber Networks Leads',
        excerpt: 'Looking for fast and reliable internet in Molo? Linksys Fiber Networks offers affordable fiber & WiFi packages, wide coverage, and expert IT solutions.',
        date: 'Jan 12, 2026',
        readTime: '5 min read',
        category: 'Molo Internet',
        coverImage: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1000&auto=format&fit=crop',
        published: true,
        content: `When searching for an internet service provider in Molo, you need a partner who combines high speed, affordability, and responsive local support.

### Why Choose Linksys Fiber Networks:
- **Local Molo Office**: Located on the Ground Floor of Generis Hotel Building in Molo CBD.
- **Over 10 Years in Service**: Deep experience serving local homes, businesses, and institutions.
- **Comprehensive Tech Services**: From internet packages to CCTV surveillance, LAN cabling, and IT maintenance.
- **24/7 Dedicated Support**: Call or WhatsApp **0713 366 366** anytime.`
      }
    ]
  },
  contact: {
    sectionLabel: 'Get Connected Today',
    title: 'Ready for Fast, Reliable Internet in Molo?',
    subtitle: 'Contact us today for instant package activation, residential fiber installation, or commercial quotes. Our local Molo team is ready to serve you.',
    email: 'info@linksysfiber.ke',
    ctaText: 'Contact Us Now',
    location: 'Generis Hotel Building, Ground Floor, Molo, Nakuru County',
    socials: [
      {
        id: 'soc-1',
        platform: 'WhatsApp',
        label: 'WhatsApp Chat',
        url: 'https://wa.me/254713366366?text=Hello%20Linksys%20Fiber%20Networks%2C%20I%20would%20like%20to%20make%20an%20inquiry.',
        icon: 'MessageCircle',
        username: '0713 366 366'
      },
      {
        id: 'soc-2',
        platform: 'Facebook',
        label: 'Facebook',
        url: 'https://www.facebook.com/people/Linksys-Fiber-Networks/61558710290221/',
        icon: 'Facebook',
        username: 'Linksys Fiber Networks'
      },
      {
        id: 'soc-3',
        platform: 'Instagram',
        label: 'Instagram',
        url: 'https://www.instagram.com/linksysfiber',
        icon: 'Instagram',
        username: '@linksysfiber'
      },
      {
        id: 'soc-4',
        platform: 'TikTok',
        label: 'TikTok',
        url: 'https://tiktok.com/@linksysfibernet',
        icon: 'Video',
        username: '@linksysfibernet'
      }
    ]
  },
  seo: {
    title: 'Internet Service Provider Molo | Fast Internet in Molo | Linksys Fiber Networks',
    description: 'Linksys is a trusted internet service provider in Molo offering fast, reliable, and affordable Wi-Fi and fiber for homes and businesses. Packages from KSh 1,500/mo.',
    keywords: 'Internet Service Provider Molo, Fast Internet in Molo, Fiber Internet Molo, Linksys Fiber Networks, WiFi Molo, ISP Molo Nakuru, CCTV installation Molo, Affordable WiFi Molo, Home Internet Molo, Business Internet Molo',
    canonicalUrl: 'https://linksysfiber.ke/',
    ogImage: 'https://linksysfiber.ke/api/media/file/hero-linksys%20(1)-2-1200x630.webp',
    twitterCard: 'summary_large_image',
    allowIndexing: true,
    primaryLocation: 'Molo, Nakuru County, Kenya',
    areasServed: [
      'Molo CBD (Generis Hotel Building)',
      'Tayari',
      'Moto',
      'Turi',
      'Kibunja',
      'Promise',
      '20 Acres',
      'Kenyatta 123',
      'Treasure',
      'Upperhill Estate',
      'Mwangaza',
      'Kasino',
      'Keepleft',
      'Mutirithia',
      'Millimani',
      'Nakuru County',
    ],
    pages: {
      '/': {
        path: '/',
        pageName: 'Home Page',
        title: 'Internet Service Provider Molo | Fast Internet in Molo | Linksys Fiber Networks',
        description: 'Linksys is a trusted internet service provider in Molo offering fast, reliable, and affordable Wi-Fi for homes and businesses. Get connected today with fiber or hotspot internet.',
        keywords: 'Internet Service Provider Molo, Fast Internet in Molo, Fiber Internet Molo, Linksys Fiber Networks',
        canonicalUrl: 'https://linksysfiber.ke/',
        noIndex: false,
      },
      '/packages': {
        path: '/packages',
        pageName: 'Internet Packages',
        title: 'Internet Packages in Molo | Affordable Fiber & WiFi Plans — Linksys',
        description: 'Explore unlimited internet packages in Molo starting from KSh 1,500/mo. Speeds from 6 Mbps up to 40 Mbps for homes, students, and businesses.',
        keywords: 'Internet packages Molo, WiFi prices Molo, Cheap internet Molo, Fiber packages Nakuru',
        canonicalUrl: 'https://linksysfiber.ke/packages',
        noIndex: false,
      },
      '/services': {
        path: '/services',
        pageName: 'Services & Solutions',
        title: 'Services & IT Solutions in Molo — Linksys Fiber Networks',
        description: 'Home fiber internet, public Wi-Fi hotspot broadcasting, structured cabling, CCTV security installation, and managed IT services in Molo.',
        keywords: 'CCTV installation Molo, Structured cabling Molo, Hotspot broadcasting Molo, IT services Molo',
        canonicalUrl: 'https://linksysfiber.ke/services',
        noIndex: false,
      },
      '/templates': {
        path: '/templates',
        pageName: 'Hardware & Equipment',
        title: 'Networking Equipment & Bundles — Linksys Fiber Networks Molo',
        description: 'High-gain Wi-Fi routers, optical network terminals, voucher hotspot gateways, and CCTV security kits in Molo.',
        keywords: 'WiFi routers Molo, Hotspot kit Kenya, Optical fiber hardware Molo',
        canonicalUrl: 'https://linksysfiber.ke/templates',
        noIndex: false,
      },
      '/blog': {
        path: '/blog',
        pageName: 'Blog & Internet Guides',
        title: 'Internet Tips, Guides & Tech News — Linksys Fiber Networks Molo',
        description: 'Learn how to fix slow internet, understand fiber optics vs wireless, and get the most from your home or business Wi-Fi connection.',
        keywords: 'Slow internet fix Kenya, Fiber internet guide Molo, Best ISP in Molo',
        canonicalUrl: 'https://linksysfiber.ke/blog',
        noIndex: false,
      },
      '/contact': {
        path: '/contact',
        pageName: 'Contact Us',
        title: 'Contact Linksys Fiber Networks Molo | Generis Hotel Building',
        description: 'Get connected with fast fiber internet in Molo. Visit our office at Generis Hotel Building, Ground Floor or call/WhatsApp 0713 366 366.',
        keywords: 'Contact Linksys Molo, Linksys phone number 0713366366, Generis Hotel Building Molo ISP',
        canonicalUrl: 'https://linksysfiber.ke/contact',
        noIndex: false,
      },
    },
    apis: {
      googleSiteVerification: '',
      googleAnalyticsId: '',
      googleTagManagerId: '',
      bingVerification: '',
      customHeadScript: '',
    },
  },
  footer: {
    copyright: '© 2026 Linksys Fiber Networks LTD. All rights reserved.',
    links: [
      { label: 'Back to top', href: '#top' },
      { label: 'Packages', href: '/packages' },
      { label: 'Services', href: '/services' },
      { label: 'About Us', href: '/#about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Email Us', href: 'mailto:info@linksysfiber.ke' }
    ]
  },
  faq: {
    sectionLabel: 'Got Questions?',
    title: 'Frequently Asked Questions',
    subtitle: "Everything you need to know about getting connected with Linksys Fiber Networks in Molo and its environs.",
    items: [
      {
        id: 'faq-1',
        order: 1,
        question: 'Which areas in Molo do you cover?',
        answer: 'We cover Molo CBD, Tayari, Moto, Turi, Kibunja, Promise, 20 Acres, Kenyatta 123, Treasure, Upperhill Estate, Mwangaza, Kasino, Keepleft, Mutirithia, Millimani, and neighboring areas across Nakuru County. Contact us with your specific estate or landmark to confirm immediate coverage.',
      },
      {
        id: 'faq-2',
        order: 2,
        question: 'How much are your internet packages?',
        answer: 'Our monthly unlimited packages are tailored for all budgets: BASE 6 Mbps is KSh 1,500/mo, STUDENT 10 Mbps is KSh 1,700/mo, DS-HOME BASIC 20 Mbps is KSh 2,000/mo, DS-HOME PRO 25 Mbps is KSh 2,500/mo, BUSINESS 30 Mbps is KSh 3,000/mo, BUSINESS PRO 35 Mbps is KSh 3,500/mo, and BUSINESS PREMIUM 40 Mbps is KSh 4,000/mo.',
      },
      {
        id: 'faq-3',
        order: 3,
        question: 'How fast can you install internet at my home or business?',
        answer: 'In most coverage zones in Molo, we offer same-day or 24-hour installation. Our technicians will conduct a swift site assessment, lay the optical fiber cable or wireless receiver, set up your Wi-Fi router, and test your connection before handing over.',
      },
      {
        id: 'faq-4',
        order: 4,
        question: 'Are there any data caps or Fair Usage Policy (FUP) throttling?',
        answer: 'No. All Linksys Fiber internet packages are truly unlimited with no data caps, no speed throttling during peak hours, and no hidden fair-use restrictions.',
      },
      {
        id: 'faq-5',
        order: 5,
        question: 'What payment methods do you accept?',
        answer: 'We accept convenient monthly payments via M-Pesa (Paybill / Till), bank transfers, and direct cash payments at our Molo office on the Ground Floor of Generis Hotel Building.',
      },
      {
        id: 'faq-6',
        order: 6,
        question: 'Do you provide the Wi-Fi router during installation?',
        answer: 'Yes! We supply and configure a tested high-gain Wi-Fi router optimized for our fiber network, ensuring full signal coverage across your rooms or offices.',
      },
      {
        id: 'faq-7',
        order: 7,
        question: 'What other technical services do you provide besides internet?',
        answer: 'In addition to fiber and wireless internet, Linksys provides public Wi-Fi hotspot broadcasting with voucher systems, structured LAN network cabling, CCTV security camera installations with remote phone viewing, and managed IT support services for businesses and institutions.',
      },
      {
        id: 'faq-8',
        order: 8,
        question: 'What happens if my connection experiences an issue?',
        answer: 'We offer 24/7 dedicated local customer and technical support. You can call or WhatsApp us on 0713 366 366 or email info@linksysfiber.ke. Because our technical team is based right here in Molo, on-site resolution is rapid and efficient.',
      },
      {
        id: 'faq-9',
        order: 9,
        question: 'Can I upgrade or downgrade my package later?',
        answer: 'Yes, you can easily change your speed package at any time at the beginning of your billing cycle by contacting our customer support team.',
      },
      {
        id: 'faq-10',
        order: 10,
        question: 'Where is your physical office located in Molo?',
        answer: 'Our main customer service center and network operations office is located at Generis Hotel Building, Ground Floor, Molo CBD, Nakuru County. You are always welcome to visit us in person.',
      },
    ],
  },
  pageLayouts: defaultPageLayouts,
  lastUpdated: new Date().toISOString()
}
