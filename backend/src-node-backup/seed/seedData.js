const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Asset = require('../models/Asset');
const KnowledgeBase = require('../models/KnowledgeBase');
const Notification = require('../models/Notification');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/servicedesk_pro');
    console.log('[Seeder] Connected to MongoDB...');

    // Clear existing collections
    await User.deleteMany({});
    await Ticket.deleteMany({});
    await Asset.deleteMany({});
    await KnowledgeBase.deleteMany({});
    await Notification.deleteMany({});
    console.log('[Seeder] Cleared previous database records.');

    // 1. Create Users
    console.log('[Seeder] Creating Users...');
    const users = await User.create([
      {
        name: 'David Mitchell (Admin)',
        email: 'admin@servicedesk.pro',
        password: 'Admin@123',
        role: 'Admin',
        department: 'IT Support',
        phone: '+1 (555) 019-2831',
        specialization: 'System Administration & Security',
      },
      {
        name: 'Marcus Vance (IT Manager)',
        email: 'manager@servicedesk.pro',
        password: 'Manager@123',
        role: 'IT Manager',
        department: 'IT Support',
        phone: '+1 (555) 019-4492',
        specialization: 'IT Operations & Infrastructure',
      },
      {
        name: 'Alex Rivera (Sr. Technician)',
        email: 'tech.alex@servicedesk.pro',
        password: 'Tech@123',
        role: 'Technician',
        department: 'IT Support',
        phone: '+1 (555) 019-7711',
        specialization: 'Network & Hardware Support',
      },
      {
        name: 'Sarah Chen (Cloud Technician)',
        email: 'tech.sarah@servicedesk.pro',
        password: 'Tech@123',
        role: 'Technician',
        department: 'IT Support',
        phone: '+1 (555) 019-8833',
        specialization: 'Software & Cloud Services',
      },
      {
        name: 'John Reynolds (Asset Manager)',
        email: 'asset.john@servicedesk.pro',
        password: 'Asset@123',
        role: 'Asset Manager',
        department: 'Operations',
        phone: '+1 (555) 019-3321',
        specialization: 'Hardware Procurement & Audits',
      },
      {
        name: 'Jane Doe (Sr. Software Engineer)',
        email: 'employee.jane@servicedesk.pro',
        password: 'Emp@123',
        role: 'Employee',
        department: 'Engineering',
        phone: '+1 (555) 019-5566',
        specialization: 'Frontend Architecture',
      },
      {
        name: 'Michael Scott (Regional Sales)',
        email: 'employee.mike@servicedesk.pro',
        password: 'Emp@123',
        role: 'Employee',
        department: 'Sales & Marketing',
        phone: '+1 (555) 019-6677',
        specialization: 'Enterprise Accounts',
      },
    ]);

    const admin = users[0];
    const itManager = users[1];
    const techAlex = users[2];
    const techSarah = users[3];
    const assetJohn = users[4];
    const empJane = users[5];
    const empMike = users[6];

    // 2. Create Knowledge Base Articles
    console.log('[Seeder] Creating Knowledge Base Articles...');
    const kbArticles = await KnowledgeBase.create([
      {
        articleId: 'KB-201',
        title: 'Troubleshooting Corporate VPN Connection Failures',
        category: 'Network',
        tags: ['vpn', 'network', 'cisco-anyconnect', 'remote-work', 'tunnel'],
        problemSummary: 'Step-by-step resolution for VPN authentication timeout and connection drops on corporate laptops.',
        symptoms: [
          'VPN client fails at 80% initialization',
          'Error: "Login failed: Certificate validation failure or timeout"',
          'Internet access drops while connected to VPN',
        ],
        stepByStepSolution: [
          'Disconnect from public Wi-Fi or restart your local Wi-Fi router.',
          'Open Cisco AnyConnect / GlobalProtect and verify the gateway server address is "vpn.company.internal".',
          'Ensure your corporate 2FA Authenticator app prompt is approved within 30 seconds.',
          'Flush DNS cache: Open Terminal / Command Prompt and run "ipconfig /flushdns" (Windows) or "sudo killall -HUP mDNSResponder" (macOS).',
          'Restart the VPN client service or reboot your computer.',
        ],
        content: `### VPN Diagnostics Guide\n\nCorporate VPN allows secure encryption for internal development and database servers. Follow the sequence above if connection fails. If error code 403 persists, your Active Directory certificate may have expired and will require an IT technician to reissue credentials.`,
        status: 'Approved',
        author: admin._id,
        views: 142,
        helpfulVotes: 38,
        unhelpfulVotes: 2,
      },
      {
        articleId: 'KB-202',
        title: 'Fixing Outlook / Mail Sync & Authentication Issues',
        category: 'Email & Communication',
        tags: ['outlook', 'email', 'm365', 'sync', 'exchange'],
        problemSummary: 'Resolve stuck outbox, password prompt loops, and disconnected status in Microsoft Outlook.',
        symptoms: [
          'Status bar in Outlook displays "Need Password" or "Disconnected"',
          'New emails not appearing in Inbox without manual refresh',
          'Outbox emails fail to send with error 0x8004210A',
        ],
        stepByStepSolution: [
          'Check Microsoft 365 webmail (https://outlook.office.com) to verify your account credentials are active.',
          'Close Outlook completely. Press Ctrl + Alt + Delete to ensure no background Outlook.exe process is hung.',
          'Open Windows Credential Manager -> Windows Credentials -> Remove all credentials starting with "MicrosoftOffice16_Data".',
          'Reopen Outlook in Safe Mode by running "outlook.exe /safe" and enter your credentials when prompted.',
          'Perform an Office Online Repair from Windows Settings > Installed Apps > Microsoft 365 > Modify > Quick Repair.',
        ],
        content: `### Outlook Email Synchronization Guide\n\nEmail sync issues are typically caused by cached token invalidation after recent Active Directory password changes. Clearing the cached credentials resolves 95% of auth loops.`,
        status: 'Approved',
        author: itManager._id,
        views: 98,
        helpfulVotes: 29,
        unhelpfulVotes: 1,
      },
      {
        articleId: 'KB-203',
        title: 'Laptop Battery Draining Fast & Overheating Mitigation',
        category: 'Hardware',
        tags: ['battery', 'overheating', 'laptop', 'performance', 'hardware'],
        problemSummary: 'Hardware and software optimizations to extend battery runtime and reduce thermal throttling.',
        symptoms: [
          'Battery discharges in under 2 hours',
          'Fan spinning at maximum speed continuously',
          'Laptop base gets hot to the touch during normal tasks',
        ],
        stepByStepSolution: [
          'Open Activity Monitor (macOS) or Task Manager (Windows) and check the "Energy" or "CPU" tab to find runaway background processes.',
          'Lower screen brightness to 60-70% and disable keyboard backlight when working in well-lit rooms.',
          'Ensure the laptop ventilation grilles are unobstructed by setting the device on a flat, hard desk surface.',
          'Update graphics card drivers and system firmware via Lenovo Vantage, Dell Command, or macOS Software Update.',
          'Check battery health status: On macOS hold Option and click Battery menu; on Windows run "powercfg /batteryreport". If cycle count is > 800, request a battery replacement ticket.',
        ],
        content: `### Battery & Thermal Management\n\nCorporate laptops with high-core CPUs require proper airflow. If battery health falls below 80% maximum capacity, an IT asset warranty replacement will be arranged.`,
        status: 'Approved',
        author: techAlex._id,
        views: 85,
        helpfulVotes: 24,
        unhelpfulVotes: 0,
      },
      {
        articleId: 'KB-204',
        title: 'Recovering from Windows Blue Screen of Death (BSOD) or macOS Kernel Panic',
        category: 'Software',
        tags: ['bsod', 'crash', 'kernel-panic', 'windows', 'macos', 'reboot'],
        problemSummary: 'Diagnostic procedures when your operating system crashes with a stop code error.',
        symptoms: [
          'Blue screen error displaying "CRITICAL_PROCESS_DIED" or "DPC_WATCHDOG_VIOLATION"',
          'Sudden automatic restart with kernel panic log',
          'Freeze during sleep / wake transitions',
        ],
        stepByStepSolution: [
          'Disconnect all external USB hubs, docking stations, and secondary monitors, then power cycle the device.',
          'Boot Windows into Safe Mode by holding Shift while selecting Restart > Troubleshoot > Advanced Options > Startup Settings.',
          'Run System File Checker: Open Command Prompt as Administrator and execute "sfc /scannow" followed by "DISM /Online /Cleanup-Image /RestoreHealth".',
          'Review recently installed drivers or system updates in Windows Update History and roll back recent driver updates.',
          'If the BSOD recurs more than twice within 24 hours, escalate immediately with memory dump logs for hardware diagnostics.',
        ],
        content: `### System Crash Troubleshooting\n\nRepeated BSODs often indicate RAM defects or NVMe SSD controller degradation. Save all open work and contact IT support immediately if error persists.`,
        status: 'Approved',
        author: techSarah._id,
        views: 110,
        helpfulVotes: 35,
        unhelpfulVotes: 3,
      },
      {
        articleId: 'KB-205',
        title: 'Requesting & Installing Approved Software Applications',
        category: 'Access & Security',
        tags: ['software', 'install', 'licenses', 'docker', 'jetbrains', 'adobe'],
        problemSummary: 'Self-service software portal instructions and process for requesting commercial licenses.',
        symptoms: [
          'Prompted for Administrator credentials when running installer .exe or .pkg',
          'Need licenses for Docker Desktop, JetBrains All Products, or Adobe Creative Cloud',
        ],
        stepByStepSolution: [
          'Open Company Portal (Windows) or Self Service (macOS) from your application menu.',
          'Browse the "Featured Applications" catalog to install pre-approved software without requiring admin elevation.',
          'For specialized commercial software (e.g. Figma Pro, JetBrains, Postman Enterprise), submit an IT Ticket with your department manager approval attached.',
          'Once approved by IT Management, the license key or SSO invitation will be provisioned to your corporate email within 4 business hours.',
        ],
        content: `### Software Procurement Policy\n\nAll corporate machines are locked by default to prevent unsigned software vulnerabilities. Always utilize the Self Service portal first.`,
        status: 'Approved',
        author: admin._id,
        views: 165,
        helpfulVotes: 52,
        unhelpfulVotes: 1,
      },
      {
        articleId: 'KB-206',
        title: 'Resolving Wi-Fi Disconnections & Slow Speed in Office',
        category: 'Network',
        tags: ['wifi', 'network', 'wireless', 'internet', 'roaming'],
        problemSummary: 'Fix intermittent Wi-Fi drops and slow throughput on corporate 802.1X enterprise network.',
        symptoms: [
          'Wi-Fi switches to "No Internet Access" while walking between conference rooms',
          'Speed test results below 5 Mbps on 5GHz corporate SSID',
          'Certificate prompt appears repeatedly when connecting to "Corp-Secure-WiFi"',
        ],
        stepByStepSolution: [
          'Forget the "Corp-Secure-WiFi" network in Wi-Fi settings and reconnect.',
          'Select EAP method "PEAP" with Phase-2 Authentication "MSCHAPv2" and enter your corporate domain credentials.',
          'Disable MAC address randomization (Private Wi-Fi Address) in OS network settings to allow RADIUS server binding.',
          'Toggle Airplane mode ON for 10 seconds, then toggle OFF to reconnect to the nearest access point.',
          'If issue is isolated to a specific conference room, report room number to IT for access point load-balancing.',
        ],
        content: `### Office Wireless Network Guide\n\nCorporate access points utilize 802.11ax Wi-Fi 6 with seamless fast-roaming (802.11r). Disabling MAC randomization ensures smooth handover across floor zones.`,
        status: 'Approved',
        author: techAlex._id,
        views: 74,
        helpfulVotes: 21,
        unhelpfulVotes: 0,
      },
    ]);

    // 3. Create Hardware & Software Assets
    console.log('[Seeder] Creating IT Assets...');
    const assets = await Asset.create([
      {
        assetTag: 'AST-101',
        name: 'MacBook Pro 16" (M3 Max, 36GB, 1TB SSD)',
        category: 'Laptop',
        model: 'Apple MacBook Pro A2991 Space Black',
        serialNumber: 'C02G8391MD6T',
        vendor: 'Apple Inc.',
        status: 'In Use',
        assignedTo: empJane._id,
        assignedDepartment: 'Engineering',
        purchaseDate: new Date('2024-03-15'),
        purchaseCost: 3499,
        warrantyExpiry: new Date('2027-03-15'),
        location: 'HQ Floor 4 - Engineering Bay',
        specifications: {
          processor: 'Apple M3 Max (14-core CPU, 30-core GPU)',
          ram: '36 GB Unified',
          storage: '1 TB NVMe SSD',
          os: 'macOS Sonoma 14.5',
          macAddress: '3c:22:fb:8a:19:bc',
        },
        repairHistory: [
          {
            date: new Date('2024-08-10'),
            issue: 'USB-C Thunderbolt port 2 loose connection',
            cost: 0,
            performedBy: 'Apple Authorized Service Provider',
            status: 'Completed',
            notes: 'Replaced I/O board under warranty.',
          },
        ],
        notes: 'Primary development laptop for Lead Architect.',
      },
      {
        assetTag: 'AST-102',
        name: 'Dell Latitude 5540 15.6" (Intel i7-1365U, 32GB, 512GB)',
        category: 'Laptop',
        model: 'Dell Latitude 5540 Business Laptop',
        serialNumber: 'DLL-99482-TX',
        vendor: 'Dell Technologies',
        status: 'In Use',
        assignedTo: empMike._id,
        assignedDepartment: 'Sales & Marketing',
        purchaseDate: new Date('2024-01-20'),
        purchaseCost: 1650,
        warrantyExpiry: new Date('2027-01-20'),
        location: 'Remote / Field Sales',
        specifications: {
          processor: 'Intel Core i7-1365U vPro',
          ram: '32 GB DDR5',
          storage: '512 GB PCIe 4.0 SSD',
          os: 'Windows 11 Pro Enterprise',
          macAddress: 'a4:bb:6d:11:09:ef',
        },
        repairHistory: [],
        notes: 'Equipped with LTE mobile broadband eSIM.',
      },
      {
        assetTag: 'AST-103',
        name: 'Dell PowerEdge R750 Rack Server (2x Xeon Gold, 128GB)',
        category: 'Server',
        model: 'Dell PowerEdge R750 2U',
        serialNumber: 'SRV-R750-99201',
        vendor: 'Dell Technologies',
        status: 'In Use',
        assignedTo: admin._id,
        assignedDepartment: 'IT Support',
        purchaseDate: new Date('2023-06-10'),
        purchaseCost: 8900,
        warrantyExpiry: new Date('2026-11-20'), // Expiring soon
        location: 'Server Room Alpha - Rack 3',
        specifications: {
          processor: '2x Intel Xeon Gold 6330 (56 Threads total)',
          ram: '128 GB ECC Registered DDR4',
          storage: '4x 3.84TB SAS SSD RAID-10',
          os: 'Ubuntu Server 22.04 LTS',
          ipAddress: '192.168.10.50',
          macAddress: '00:1e:67:d8:a4:21',
        },
        repairHistory: [
          {
            date: new Date('2024-02-14'),
            issue: 'Power Supply Unit 2 redundancy failure',
            cost: 320,
            performedBy: 'Dell Onsite Support',
            status: 'Completed',
            notes: 'Replaced 1400W hot-swap power supply module.',
          },
        ],
        notes: 'Hosts internal Git repository and staging build runners.',
      },
      {
        assetTag: 'AST-104',
        name: 'Cisco Catalyst 9300 48-Port PoE+ Switch',
        category: 'Network Device',
        model: 'C9300-48P-A',
        serialNumber: 'CSCO-SW-48911',
        vendor: 'Cisco Systems',
        status: 'In Use',
        assignedTo: itManager._id,
        assignedDepartment: 'IT Support',
        purchaseDate: new Date('2023-09-01'),
        purchaseCost: 4500,
        warrantyExpiry: new Date('2028-09-01'),
        location: 'HQ Floor 4 - Network Closet',
        specifications: {
          processor: 'Cisco UADP 2.0 ASIC',
          ram: '16 GB',
          storage: '16 GB Flash',
          ipAddress: '192.168.1.2',
          macAddress: '70:db:98:33:1a:90',
        },
        repairHistory: [],
        notes: 'Main distribution switch for Engineering floor.',
      },
      {
        assetTag: 'AST-105',
        name: 'Adobe Creative Cloud All Apps Pro (Enterprise License)',
        category: 'Software License',
        model: 'Adobe CC Enterprise Subscription',
        serialNumber: 'LIC-ADB-2024-8849',
        vendor: 'Adobe Systems',
        status: 'In Use',
        assignedTo: empMike._id,
        assignedDepartment: 'Sales & Marketing',
        purchaseDate: new Date('2024-01-01'),
        purchaseCost: 960,
        warrantyExpiry: new Date('2027-01-01'),
        location: 'Cloud SaaS',
        specifications: {
          licenseExpiry: new Date('2027-01-01'),
          os: 'Multi-platform',
        },
        repairHistory: [],
        notes: 'Annual recurring commercial license for marketing graphics.',
      },
      {
        assetTag: 'AST-106',
        name: 'Lenovo ThinkPad X1 Carbon Gen 11 (i7, 32GB, 1TB)',
        category: 'Laptop',
        model: 'ThinkPad X1 Carbon Gen 11',
        serialNumber: 'LNV-X1-55018',
        vendor: 'Lenovo',
        status: 'In Storage',
        assignedTo: null,
        assignedDepartment: 'IT Support',
        purchaseDate: new Date('2024-04-10'),
        purchaseCost: 1950,
        warrantyExpiry: new Date('2027-04-10'),
        location: 'IT Inventory Safe - Bin B-4',
        specifications: {
          processor: 'Intel Core i7-1370P vPro',
          ram: '32 GB LPDDR5',
          storage: '1 TB PCIe NVMe SSD',
          os: 'Windows 11 Pro Enterprise',
        },
        repairHistory: [],
        notes: 'Ready for deployment to incoming new hires.',
      },
      {
        assetTag: 'AST-107',
        name: 'Dell UltraSharp 32" 4K USB-C Hub Monitor (U3223QE)',
        category: 'Peripheral',
        model: 'Dell U3223QE IPS Black',
        serialNumber: 'MON-DELL-32910',
        vendor: 'Dell Technologies',
        status: 'Under Repair',
        assignedTo: null,
        assignedDepartment: 'Engineering',
        purchaseDate: new Date('2023-11-15'),
        purchaseCost: 850,
        warrantyExpiry: new Date('2026-11-15'),
        location: 'IT Repair Workshop',
        specifications: {
          storage: '4K UHD (3840 x 2160) 60Hz, 90W Power Delivery',
        },
        repairHistory: [
          {
            date: new Date('2026-10-01'),
            issue: 'Flickering horizontal lines on DisplayPort input',
            cost: 75,
            performedBy: 'Dell Authorized Service',
            status: 'In Progress',
            notes: 'Awaiting replacement mainboard PCB.',
          },
        ],
        notes: 'Sent for warranty panel replacement.',
      },
    ]);

    // 4. Create Realistic Support Tickets
    console.log('[Seeder] Creating Tickets...');
    const now = new Date();

    const tickets = await Ticket.create([
      {
        ticketId: 'TICK-1001',
        title: 'Intermittent Cisco VPN connection drops during remote code deployment',
        description: 'While attempting to push container images through the company staging registry, the VPN tunnel drops connection with error code 403 / TLS Handshake timeout every 25 minutes.',
        category: 'Network',
        priority: 'High',
        status: 'In Progress',
        createdBy: empJane._id,
        assignedTo: techAlex._id,
        assetId: assets[0]._id,
        source: 'Portal',
        slaDeadline: new Date(now.getTime() + 8 * 60 * 60 * 1000), // Within SLA
        slaStatus: 'Within SLA',
        aiTroubleshootingAttempted: true,
        aiSummary: 'User completed KB-201 steps; issue identified as MTU packet fragmentation over ISP fiber.',
        tags: ['vpn', 'network', 'engineering'],
        comments: [
          {
            user: empJane._id,
            message: 'I followed the KB-201 guide to flush DNS, but the tunnel still resets after heavy upload bursts.',
            isInternal: false,
            createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
          },
          {
            user: techAlex._id,
            message: 'Checking the RADIUS and Cisco ASA gateway logs now. It looks like packet fragmentation is causing keepalive drops.',
            isInternal: false,
            createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          },
          {
            user: techAlex._id,
            message: 'Internal Note: Will adjust MTU size to 1350 on user profile config.',
            isInternal: true,
            createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
          },
        ],
        activityLog: [
          {
            action: 'Ticket Created',
            performedBy: empJane._id,
            details: 'Submitted via Employee Portal',
            timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000),
          },
          {
            action: 'Assignment Changed',
            performedBy: itManager._id,
            details: 'Assigned to Alex Rivera (Sr. Technician)',
            timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
          },
          {
            action: 'Status Changed',
            performedBy: techAlex._id,
            details: 'Status transitioned from Open to In Progress',
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          },
        ],
      },
      {
        ticketId: 'TICK-1002',
        title: 'Urgent: Core Database Server Staging Container Outage',
        description: 'Staging Kubernetes cluster node SRV-R750-99201 is unresponsive after scheduled kernel security patch. Staging tests are completely blocked.',
        category: 'Cloud Services',
        priority: 'Urgent',
        status: 'Open',
        createdBy: itManager._id,
        assignedTo: techSarah._id,
        assetId: assets[2]._id,
        source: 'Portal',
        slaDeadline: new Date(now.getTime() + 2 * 60 * 60 * 1000), // Urgent 2 hours remaining
        slaStatus: 'At Risk',
        aiTroubleshootingAttempted: false,
        tags: ['server', 'outage', 'staging', 'critical'],
        comments: [
          {
            user: itManager._id,
            message: 'All QA pipelines are stalled. Please SSH via iDRAC console to inspect panic dump.',
            isInternal: false,
            createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
          },
        ],
        activityLog: [
          {
            action: 'Ticket Created',
            performedBy: itManager._id,
            details: 'Priority flagged as Urgent by IT Manager',
            timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000),
          },
        ],
      },
      {
        ticketId: 'TICK-1003',
        title: 'Outlook Email Sync Authentication Loop on Dell Latitude',
        description: 'Outlook repeatedly prompts for credentials every 10 minutes and shows Disconnected in status bar.',
        category: 'Email & Communication',
        priority: 'Medium',
        status: 'Resolved',
        createdBy: empMike._id,
        assignedTo: techSarah._id,
        assetId: assets[1]._id,
        source: 'AI Chatbot',
        slaDeadline: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        slaStatus: 'Within SLA',
        resolutionNotes: 'Cleared cached M365 authentication tokens from Windows Credential Manager and re-authenticated via Okta SSO. Email sync is now normal.',
        resolvedAt: new Date(now.getTime() - 15 * 60 * 60 * 1000),
        aiTroubleshootingAttempted: true,
        aiSummary: 'Chatbot guided user through credential purge; confirmed fixed by employee.',
        tags: ['outlook', 'm365', 'credentials'],
        comments: [
          {
            user: techSarah._id,
            message: 'Reset the OAuth token refresh period in Azure AD tenant.',
            isInternal: false,
            createdAt: new Date(now.getTime() - 16 * 60 * 60 * 1000),
          },
          {
            user: empMike._id,
            message: 'Works smoothly now, all emails downloaded. Thank you!',
            isInternal: false,
            createdAt: new Date(now.getTime() - 15 * 60 * 60 * 1000),
          },
        ],
        activityLog: [
          {
            action: 'Ticket Created via AI Chatbot',
            performedBy: empMike._id,
            details: 'Created automatically following AI assistant guidance',
            timestamp: new Date(now.getTime() - 20 * 60 * 60 * 1000),
          },
          {
            action: 'Status Changed',
            performedBy: techSarah._id,
            details: 'Status transitioned from In Progress to Resolved. Resolution: Cleared cached tokens.',
            timestamp: new Date(now.getTime() - 15 * 60 * 60 * 1000),
          },
        ],
      },
      {
        ticketId: 'TICK-1004',
        title: 'Requesting Docker Desktop Enterprise License for new microservice project',
        description: 'Need Docker Desktop license activated for local Kubernetes orchestration and testing of the payment processing microservice.',
        category: 'Software',
        priority: 'Low',
        status: 'Open',
        createdBy: empJane._id,
        assignedTo: null, // Unassigned queue
        source: 'Portal',
        slaDeadline: new Date(now.getTime() + 36 * 60 * 60 * 1000),
        slaStatus: 'Within SLA',
        aiTroubleshootingAttempted: false,
        tags: ['docker', 'license', 'software-request'],
        comments: [],
        activityLog: [
          {
            action: 'Ticket Created',
            performedBy: empJane._id,
            details: 'Software license request submitted',
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          },
        ],
      },
      {
        ticketId: 'TICK-1005',
        title: 'Dell 32" 4K Monitor DisplayPort flickering in Engineering Bay',
        description: 'The external 4K monitor at desk 4-B displays horizontal white artifact lines whenever refresh rate is set to 60Hz.',
        category: 'Hardware',
        priority: 'Medium',
        status: 'In Progress',
        createdBy: empJane._id,
        assignedTo: techAlex._id,
        assetId: assets[6]._id,
        source: 'Portal',
        slaDeadline: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Overdue SLA for realism
        slaStatus: 'Breached',
        aiTroubleshootingAttempted: true,
        tags: ['monitor', 'hardware', 'repair'],
        comments: [
          {
            user: techAlex._id,
            message: 'Tested with certified 8K DP cable, issue is in monitor panel. Moved asset AST-107 to Under Repair and requested Dell warranty replacement.',
            isInternal: false,
            createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
          },
        ],
        activityLog: [
          {
            action: 'Ticket Created',
            performedBy: empJane._id,
            details: 'Hardware malfunction reported',
            timestamp: new Date(now.getTime() - 30 * 60 * 60 * 1000),
          },
        ],
      },
    ]);

    // 5. Create Sample Notifications
    console.log('[Seeder] Creating Notifications...');
    await Notification.create([
      {
        recipient: admin._id,
        title: 'SLA Warning: TICK-1005 Overdue',
        message: 'Ticket "Dell 32" 4K Monitor DisplayPort flickering" has breached its resolution SLA.',
        type: 'SLA_ALERT',
        link: `/tickets/${tickets[4]._id}`,
      },
      {
        recipient: techSarah._id,
        title: 'Urgent Ticket Assigned: TICK-1002',
        message: 'Core Database Server Staging Container Outage assigned to you.',
        type: 'TICKET_ASSIGNED',
        link: `/tickets/${tickets[1]._id}`,
      },
      {
        recipient: empJane._id,
        title: 'Comment Added on TICK-1001',
        message: 'Alex Rivera commented on "Intermittent Cisco VPN connection drops"',
        type: 'COMMENT_ADDED',
        link: `/tickets/${tickets[0]._id}`,
      },
    ]);

    console.log('----------------------------------------------------');
    console.log('✅ [Seeder] Database Seeded Successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Login Credentials:');
    console.log('1. Admin:         admin@servicedesk.pro        / Admin@123');
    console.log('2. IT Manager:    manager@servicedesk.pro      / Manager@123');
    console.log('3. Technician:    tech.alex@servicedesk.pro    / Tech@123');
    console.log('4. Technician 2:  tech.sarah@servicedesk.pro   / Tech@123');
    console.log('5. Asset Manager: asset.john@servicedesk.pro   / Asset@123');
    console.log('6. Employee 1:    employee.jane@servicedesk.pro / Emp@123');
    console.log('7. Employee 2:    employee.mike@servicedesk.pro / Emp@123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ [Seeder Error]:', error);
    process.exit(1);
  }
};

seedDB();
