package com.servicedesk.pro.seed;

import com.servicedesk.pro.model.*;
import com.servicedesk.pro.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final KnowledgeBaseRepository kbRepository;
    private final AssetRepository assetRepository;
    private final TicketRepository ticketRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           KnowledgeBaseRepository kbRepository,
                           AssetRepository assetRepository,
                           TicketRepository ticketRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.kbRepository = kbRepository;
        this.assetRepository = assetRepository;
        this.ticketRepository = ticketRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            System.out.println("[Seeder] Database already contains records. Skipping initial seeding.");
            return;
        }

        System.out.println("[Seeder] Seeding initial ServiceDesk Pro database...");

        // 1. Create Users
        User admin = new User(
                "David Mitchell (Admin)",
                "admin@servicedesk.pro",
                passwordEncoder.encode("Admin@123"),
                "Admin",
                "IT Support",
                "+1 (555) 019-2831",
                "System Administration & Security"
        );
        admin = userRepository.save(admin);

        User itManager = new User(
                "Marcus Vance (IT Manager)",
                "manager@servicedesk.pro",
                passwordEncoder.encode("Manager@123"),
                "IT Manager",
                "IT Support",
                "+1 (555) 019-4492",
                "IT Operations & Infrastructure"
        );
        itManager = userRepository.save(itManager);

        User techAlex = new User(
                "Alex Rivera (Sr. Technician)",
                "tech.alex@servicedesk.pro",
                passwordEncoder.encode("Tech@123"),
                "Technician",
                "IT Support",
                "+1 (555) 019-7711",
                "Network & Hardware Support"
        );
        techAlex = userRepository.save(techAlex);

        User techSarah = new User(
                "Sarah Chen (Cloud Technician)",
                "tech.sarah@servicedesk.pro",
                passwordEncoder.encode("Tech@123"),
                "Technician",
                "IT Support",
                "+1 (555) 019-8833",
                "Software & Cloud Services"
        );
        techSarah = userRepository.save(techSarah);

        User assetJohn = new User(
                "John Reynolds (Asset Manager)",
                "asset.john@servicedesk.pro",
                passwordEncoder.encode("Asset@123"),
                "Asset Manager",
                "Operations",
                "+1 (555) 019-3321",
                "Hardware Procurement & Audits"
        );
        assetJohn = userRepository.save(assetJohn);

        User empJane = new User(
                "Jane Doe (Sr. Software Engineer)",
                "employee.jane@servicedesk.pro",
                passwordEncoder.encode("Emp@123"),
                "Employee",
                "Engineering",
                "+1 (555) 019-5566",
                "Frontend Architecture"
        );
        empJane = userRepository.save(empJane);

        User empMike = new User(
                "Michael Scott (Regional Sales)",
                "employee.mike@servicedesk.pro",
                passwordEncoder.encode("Emp@123"),
                "Employee",
                "Sales & Marketing",
                "+1 (555) 019-6677",
                "Enterprise Accounts"
        );
        empMike = userRepository.save(empMike);

        // 2. Knowledge Base Articles
        KnowledgeBase kb1 = new KnowledgeBase();
        kb1.setArticleId("KB-201");
        kb1.setTitle("Troubleshooting Corporate VPN Connection Failures");
        kb1.setCategory("Network");
        kb1.setTags(Arrays.asList("vpn", "network", "cisco-anyconnect", "remote-work", "tunnel"));
        kb1.setProblemSummary("Step-by-step resolution for VPN authentication timeout and connection drops on corporate laptops.");
        kb1.setSymptoms(Arrays.asList("VPN client fails at 80% initialization", "Error: Login failed: Certificate validation failure or timeout", "Internet access drops while connected to VPN"));
        kb1.setStepByStepSolution(Arrays.asList(
                "Disconnect from public Wi-Fi or restart your local Wi-Fi router.",
                "Open Cisco AnyConnect / GlobalProtect and verify the gateway server address is 'vpn.company.internal'.",
                "Ensure your corporate 2FA Authenticator app prompt is approved within 30 seconds.",
                "Flush DNS cache: Open Terminal / Command Prompt and run 'ipconfig /flushdns' (Windows) or 'sudo killall -HUP mDNSResponder' (macOS).",
                "Restart the VPN client service or reboot your computer."
        ));
        kb1.setContent("### VPN Diagnostics Guide\n\nCorporate VPN allows secure encryption for internal development and database servers. Follow the sequence above if connection fails. If error code 403 persists, your Active Directory certificate may have expired.");
        kb1.setStatus("Approved");
        kb1.setAuthor(admin);
        kb1.setViews(142);
        kb1.setHelpfulVotes(38);
        kb1.setUnhelpfulVotes(2);
        kbRepository.save(kb1);

        KnowledgeBase kb2 = new KnowledgeBase();
        kb2.setArticleId("KB-202");
        kb2.setTitle("Fixing Outlook / Mail Sync & Authentication Issues");
        kb2.setCategory("Email & Communication");
        kb2.setTags(Arrays.asList("outlook", "email", "m365", "sync", "exchange"));
        kb2.setProblemSummary("Resolve stuck outbox, password prompt loops, and disconnected status in Microsoft Outlook.");
        kb2.setSymptoms(Arrays.asList("Status bar in Outlook displays 'Need Password' or 'Disconnected'", "New emails not appearing in Inbox without manual refresh", "Outbox emails fail to send with error 0x8004210A"));
        kb2.setStepByStepSolution(Arrays.asList(
                "Check Microsoft 365 webmail (https://outlook.office.com) to verify your account credentials are active.",
                "Close Outlook completely. Ensure no background Outlook.exe process is hung.",
                "Open Windows Credential Manager -> Windows Credentials -> Remove all credentials starting with 'MicrosoftOffice16_Data'.",
                "Reopen Outlook in Safe Mode by running 'outlook.exe /safe' and enter your credentials when prompted.",
                "Perform an Office Online Repair from Windows Settings > Installed Apps > Microsoft 365 > Modify > Quick Repair."
        ));
        kb2.setContent("### Outlook Email Synchronization Guide\n\nEmail sync issues are typically caused by cached token invalidation after recent Active Directory password changes. Clearing the cached credentials resolves 95% of auth loops.");
        kb2.setStatus("Approved");
        kb2.setAuthor(itManager);
        kb2.setViews(98);
        kb2.setHelpfulVotes(29);
        kb2.setUnhelpfulVotes(1);
        kbRepository.save(kb2);

        KnowledgeBase kb3 = new KnowledgeBase();
        kb3.setArticleId("KB-203");
        kb3.setTitle("Laptop Battery Draining Fast & Overheating Mitigation");
        kb3.setCategory("Hardware");
        kb3.setTags(Arrays.asList("battery", "overheating", "laptop", "performance", "hardware"));
        kb3.setProblemSummary("Hardware and software optimizations to extend battery runtime and reduce thermal throttling.");
        kb3.setSymptoms(Arrays.asList("Battery discharges in under 2 hours", "Fan spinning at maximum speed continuously", "Laptop base gets hot to the touch during normal tasks"));
        kb3.setStepByStepSolution(Arrays.asList(
                "Open Activity Monitor (macOS) or Task Manager (Windows) and check the CPU tab to find runaway background processes.",
                "Lower screen brightness to 60-70% and disable keyboard backlight when working in well-lit rooms.",
                "Ensure the laptop ventilation grilles are unobstructed by setting the device on a flat, hard desk surface.",
                "Update graphics card drivers and system firmware via vendor update utilities.",
                "Check battery health status. If cycle count is > 800, request a battery replacement ticket."
        ));
        kb3.setContent("### Battery & Thermal Management\n\nCorporate laptops with high-core CPUs require proper airflow. If battery health falls below 80% maximum capacity, an IT asset warranty replacement will be arranged.");
        kb3.setStatus("Approved");
        kb3.setAuthor(techAlex);
        kb3.setViews(85);
        kb3.setHelpfulVotes(24);
        kbRepository.save(kb3);

        KnowledgeBase kb4 = new KnowledgeBase();
        kb4.setArticleId("KB-204");
        kb4.setTitle("Recovering from Windows Blue Screen of Death (BSOD) or macOS Kernel Panic");
        kb4.setCategory("Software");
        kb4.setTags(Arrays.asList("bsod", "crash", "kernel-panic", "windows", "macos", "reboot"));
        kb4.setProblemSummary("Diagnostic procedures when your operating system crashes with a stop code error.");
        kb4.setSymptoms(Arrays.asList("Blue screen error displaying 'CRITICAL_PROCESS_DIED' or 'DPC_WATCHDOG_VIOLATION'", "Sudden automatic restart with kernel panic log"));
        kb4.setStepByStepSolution(Arrays.asList(
                "Disconnect all external USB hubs, docking stations, and secondary monitors, then power cycle the device.",
                "Boot Windows into Safe Mode by holding Shift while selecting Restart > Troubleshoot > Advanced Options.",
                "Run System File Checker: Open Command Prompt as Administrator and execute 'sfc /scannow' followed by 'DISM /Online /Cleanup-Image /RestoreHealth'.",
                "Review recently installed drivers or system updates in Windows Update History.",
                "If the BSOD recurs more than twice within 24 hours, escalate immediately with memory dump logs."
        ));
        kb4.setContent("### System Crash Troubleshooting\n\nRepeated BSODs often indicate RAM defects or NVMe SSD controller degradation. Save all open work and contact IT support immediately if error persists.");
        kb4.setStatus("Approved");
        kb4.setAuthor(techSarah);
        kb4.setViews(110);
        kb4.setHelpfulVotes(35);
        kb4.setUnhelpfulVotes(3);
        kbRepository.save(kb4);

        KnowledgeBase kb5 = new KnowledgeBase();
        kb5.setArticleId("KB-205");
        kb5.setTitle("Requesting & Installing Approved Software Applications");
        kb5.setCategory("Access & Security");
        kb5.setTags(Arrays.asList("software", "install", "licenses", "docker", "jetbrains", "adobe"));
        kb5.setProblemSummary("Self-service software portal instructions and process for requesting commercial licenses.");
        kb5.setSymptoms(Arrays.asList("Prompted for Administrator credentials when running installer .exe or .pkg", "Need licenses for Docker Desktop, JetBrains All Products, or Adobe Creative Cloud"));
        kb5.setStepByStepSolution(Arrays.asList(
                "Open Company Portal (Windows) or Self Service (macOS) from your application menu.",
                "Browse the Featured Applications catalog to install pre-approved software without requiring admin elevation.",
                "For specialized commercial software, submit an IT Ticket with your department manager approval attached.",
                "Once approved by IT Management, the license key will be provisioned to your corporate email within 4 business hours."
        ));
        kb5.setContent("### Software Procurement Policy\n\nAll corporate machines are locked by default to prevent unsigned software vulnerabilities. Always utilize the Self Service portal first.");
        kb5.setStatus("Approved");
        kb5.setAuthor(admin);
        kb5.setViews(165);
        kb5.setHelpfulVotes(52);
        kb5.setUnhelpfulVotes(1);
        kbRepository.save(kb5);

        KnowledgeBase kb6 = new KnowledgeBase();
        kb6.setArticleId("KB-206");
        kb6.setTitle("Resolving Wi-Fi Disconnections & Slow Speed in Office");
        kb6.setCategory("Network");
        kb6.setTags(Arrays.asList("wifi", "network", "wireless", "internet", "roaming"));
        kb6.setProblemSummary("Fix intermittent Wi-Fi drops and slow throughput on corporate 802.1X enterprise network.");
        kb6.setSymptoms(Arrays.asList("Wi-Fi switches to 'No Internet Access' while walking between conference rooms", "Speed test results below 5 Mbps on 5GHz corporate SSID"));
        kb6.setStepByStepSolution(Arrays.asList(
                "Forget the 'Corp-Secure-WiFi' network in Wi-Fi settings and reconnect.",
                "Select EAP method 'PEAP' with Phase-2 Authentication 'MSCHAPv2' and enter your corporate domain credentials.",
                "Disable MAC address randomization in OS network settings to allow RADIUS server binding.",
                "Toggle Airplane mode ON for 10 seconds, then toggle OFF to reconnect to the nearest access point.",
                "If issue is isolated to a specific conference room, report room number to IT for access point load-balancing."
        ));
        kb6.setContent("### Office Wireless Network Guide\n\nCorporate access points utilize 802.11ax Wi-Fi 6 with seamless fast-roaming (802.11r). Disabling MAC randomization ensures smooth handover across floor zones.");
        kb6.setStatus("Approved");
        kb6.setAuthor(techAlex);
        kb6.setViews(74);
        kb6.setHelpfulVotes(21);
        kbRepository.save(kb6);

        // 3. Create Assets
        Asset ast1 = new Asset();
        ast1.setAssetTag("AST-101");
        ast1.setName("MacBook Pro 16\" (M3 Max, 36GB, 1TB SSD)");
        ast1.setCategory("Laptop");
        ast1.setModel("Apple MacBook Pro A2991 Space Black");
        ast1.setSerialNumber("C02G8391MD6T");
        ast1.setVendor("Apple Inc.");
        ast1.setStatus("In Use");
        ast1.setAssignedTo(empJane);
        ast1.setAssignedDepartment("Engineering");
        ast1.setPurchaseDate(Instant.parse("2024-03-15T00:00:00Z"));
        ast1.setPurchaseCost(3499);
        ast1.setWarrantyExpiry(Instant.parse("2027-03-15T00:00:00Z"));
        ast1.setLocation("HQ Floor 4 - Engineering Bay");
        ast1.setSpecifications(new AssetSpecifications("Apple M3 Max (14-core CPU, 30-core GPU)", "36 GB Unified", "1 TB NVMe SSD", "macOS Sonoma 14.5", "", "3c:22:fb:8a:19:bc", null));
        ast1.getRepairHistory().add(new RepairRecord("USB-C Thunderbolt port 2 loose connection", 0, "Apple Authorized Service Provider", "Completed", "Replaced I/O board under warranty.", Instant.parse("2024-08-10T00:00:00Z")));
        ast1.setNotes("Primary development laptop for Lead Architect.");
        ast1 = assetRepository.save(ast1);

        Asset ast2 = new Asset();
        ast2.setAssetTag("AST-102");
        ast2.setName("Dell Latitude 5540 15.6\" (Intel i7-1365U, 32GB, 512GB)");
        ast2.setCategory("Laptop");
        ast2.setModel("Dell Latitude 5540 Business Laptop");
        ast2.setSerialNumber("DLL-99482-TX");
        ast2.setVendor("Dell Technologies");
        ast2.setStatus("In Use");
        ast2.setAssignedTo(empMike);
        ast2.setAssignedDepartment("Sales & Marketing");
        ast2.setPurchaseDate(Instant.parse("2024-01-20T00:00:00Z"));
        ast2.setPurchaseCost(1650);
        ast2.setWarrantyExpiry(Instant.parse("2027-01-20T00:00:00Z"));
        ast2.setLocation("Remote / Field Sales");
        ast2.setSpecifications(new AssetSpecifications("Intel Core i7-1365U vPro", "32 GB DDR5", "512 GB PCIe 4.0 SSD", "Windows 11 Pro Enterprise", "", "a4:bb:6d:11:09:ef", null));
        ast2.setNotes("Equipped with LTE mobile broadband eSIM.");
        ast2 = assetRepository.save(ast2);

        Asset ast3 = new Asset();
        ast3.setAssetTag("AST-103");
        ast3.setName("Dell PowerEdge R750 Rack Server (2x Xeon Gold, 128GB)");
        ast3.setCategory("Server");
        ast3.setModel("Dell PowerEdge R750 2U");
        ast3.setSerialNumber("SRV-R750-99201");
        ast3.setVendor("Dell Technologies");
        ast3.setStatus("In Use");
        ast3.setAssignedTo(admin);
        ast3.setAssignedDepartment("IT Support");
        ast3.setPurchaseDate(Instant.parse("2023-06-10T00:00:00Z"));
        ast3.setPurchaseCost(8900);
        ast3.setWarrantyExpiry(Instant.now().plus(Duration.ofDays(15))); // Expiring soon!
        ast3.setLocation("Server Room Alpha - Rack 3");
        ast3.setSpecifications(new AssetSpecifications("2x Intel Xeon Gold 6330", "128 GB ECC Registered DDR4", "4x 3.84TB SAS SSD RAID-10", "Ubuntu Server 22.04 LTS", "192.168.10.50", "00:1e:67:d8:a4:21", null));
        ast3.getRepairHistory().add(new RepairRecord("Power Supply Unit 2 redundancy failure", 320, "Dell Onsite Support", "Completed", "Replaced 1400W hot-swap power supply module.", Instant.parse("2024-02-14T00:00:00Z")));
        ast3.setNotes("Hosts internal Git repository and staging build runners.");
        ast3 = assetRepository.save(ast3);

        Asset ast4 = new Asset();
        ast4.setAssetTag("AST-104");
        ast4.setName("Cisco Catalyst 9300 48-Port PoE+ Switch");
        ast4.setCategory("Network Device");
        ast4.setModel("C9300-48P-A");
        ast4.setSerialNumber("CSCO-SW-48911");
        ast4.setVendor("Cisco Systems");
        ast4.setStatus("In Use");
        ast4.setAssignedTo(itManager);
        ast4.setAssignedDepartment("IT Support");
        ast4.setPurchaseDate(Instant.parse("2023-09-01T00:00:00Z"));
        ast4.setPurchaseCost(4500);
        ast4.setWarrantyExpiry(Instant.parse("2028-09-01T00:00:00Z"));
        ast4.setLocation("HQ Floor 4 - Network Closet");
        ast4.setSpecifications(new AssetSpecifications("Cisco UADP 2.0 ASIC", "16 GB", "16 GB Flash", "", "192.168.1.2", "70:db:98:33:1a:90", null));
        ast4.setNotes("Main distribution switch for Engineering floor.");
        ast4 = assetRepository.save(ast4);

        Asset ast5 = new Asset();
        ast5.setAssetTag("AST-105");
        ast5.setName("Adobe Creative Cloud All Apps Pro (Enterprise License)");
        ast5.setCategory("Software License");
        ast5.setModel("Adobe CC Enterprise Subscription");
        ast5.setSerialNumber("LIC-ADB-2024-8849");
        ast5.setVendor("Adobe Systems");
        ast5.setStatus("In Use");
        ast5.setAssignedTo(empMike);
        ast5.setAssignedDepartment("Sales & Marketing");
        ast5.setPurchaseDate(Instant.parse("2024-01-01T00:00:00Z"));
        ast5.setPurchaseCost(960);
        ast5.setWarrantyExpiry(Instant.parse("2027-01-01T00:00:00Z"));
        ast5.setLocation("Cloud SaaS");
        ast5.setSpecifications(new AssetSpecifications("", "", "", "Multi-platform", "", "", Instant.parse("2027-01-01T00:00:00Z")));
        ast5.setNotes("Annual recurring commercial license for marketing graphics.");
        ast5 = assetRepository.save(ast5);

        Asset ast6 = new Asset();
        ast6.setAssetTag("AST-106");
        ast6.setName("Lenovo ThinkPad X1 Carbon Gen 11 (i7, 32GB, 1TB)");
        ast6.setCategory("Laptop");
        ast6.setModel("ThinkPad X1 Carbon Gen 11");
        ast6.setSerialNumber("LNV-X1-55018");
        ast6.setVendor("Lenovo");
        ast6.setStatus("In Storage");
        ast6.setAssignedTo(null);
        ast6.setAssignedDepartment("IT Support");
        ast6.setPurchaseDate(Instant.parse("2024-04-10T00:00:00Z"));
        ast6.setPurchaseCost(1950);
        ast6.setWarrantyExpiry(Instant.parse("2027-04-10T00:00:00Z"));
        ast6.setLocation("IT Inventory Safe - Bin B-4");
        ast6.setSpecifications(new AssetSpecifications("Intel Core i7-1370P vPro", "32 GB LPDDR5", "1 TB PCIe NVMe SSD", "Windows 11 Pro Enterprise", "", "", null));
        ast6.setNotes("Ready for deployment to incoming new hires.");
        ast6 = assetRepository.save(ast6);

        Asset ast7 = new Asset();
        ast7.setAssetTag("AST-107");
        ast7.setName("Dell UltraSharp 32\" 4K USB-C Hub Monitor (U3223QE)");
        ast7.setCategory("Peripheral");
        ast7.setModel("Dell U3223QE IPS Black");
        ast7.setSerialNumber("MON-DELL-32910");
        ast7.setVendor("Dell Technologies");
        ast7.setStatus("Under Repair");
        ast7.setAssignedTo(null);
        ast7.setAssignedDepartment("Engineering");
        ast7.setPurchaseDate(Instant.parse("2023-11-15T00:00:00Z"));
        ast7.setPurchaseCost(850);
        ast7.setWarrantyExpiry(Instant.parse("2026-11-15T00:00:00Z"));
        ast7.setLocation("IT Repair Workshop");
        ast7.setSpecifications(new AssetSpecifications("", "", "4K UHD (3840 x 2160) 60Hz", "", "", "", null));
        ast7.getRepairHistory().add(new RepairRecord("Flickering horizontal lines on DisplayPort input", 75, "Dell Authorized Service", "In Progress", "Awaiting replacement mainboard PCB.", Instant.now().minus(Duration.ofDays(10))));
        ast7.setNotes("Sent for warranty panel replacement.");
        ast7 = assetRepository.save(ast7);

        // 4. Create Realistic Tickets
        Instant now = Instant.now();

        // TICK-1001
        Ticket t1 = new Ticket();
        t1.setTicketId("TICK-1001");
        t1.setTitle("Intermittent Cisco VPN connection drops during remote code deployment");
        t1.setDescription("While attempting to push container images through the company staging registry, the VPN tunnel drops connection with error code 403 / TLS Handshake timeout every 25 minutes.");
        t1.setCategory("Network");
        t1.setPriority("High");
        t1.setStatus("In Progress");
        t1.setCreatedBy(empJane);
        t1.setAssignedTo(techAlex);
        t1.setAssetId(ast1);
        t1.setSource("Portal");
        t1.setSlaDeadline(now.plus(Duration.ofHours(8)));
        t1.setSlaStatus("Within SLA");
        t1.setAiTroubleshootingAttempted(true);
        t1.setAiSummary("User completed KB-201 steps; issue identified as MTU packet fragmentation over ISP fiber.");
        t1.setTags(Arrays.asList("vpn", "network", "engineering"));
        t1.getComments().add(new Comment(empJane, "I followed the KB-201 guide to flush DNS, but the tunnel still resets after heavy upload bursts.", false, null, now.minus(Duration.ofHours(4))));
        t1.getComments().add(new Comment(techAlex, "Checking the RADIUS and Cisco ASA gateway logs now. It looks like packet fragmentation is causing keepalive drops.", false, null, now.minus(Duration.ofHours(2))));
        t1.getComments().add(new Comment(techAlex, "Internal Note: Will adjust MTU size to 1350 on user profile config.", true, null, now.minus(Duration.ofHours(1))));
        t1.getActivityLog().add(new ActivityLog("Ticket Created", empJane, "Submitted via Employee Portal", now.minus(Duration.ofHours(5))));
        t1.getActivityLog().add(new ActivityLog("Assignment Changed", itManager, "Assigned to Alex Rivera (Sr. Technician)", now.minus(Duration.ofHours(4))));
        t1.getActivityLog().add(new ActivityLog("Status Changed", techAlex, "Status transitioned from Open to In Progress", now.minus(Duration.ofHours(2))));
        t1 = ticketRepository.save(t1);

        // TICK-1002
        Ticket t2 = new Ticket();
        t2.setTicketId("TICK-1002");
        t2.setTitle("Urgent: Core Database Server Staging Container Outage");
        t2.setDescription("Staging Kubernetes cluster node SRV-R750-99201 is unresponsive after scheduled kernel security patch. Staging tests are completely blocked.");
        t2.setCategory("Cloud Services");
        t2.setPriority("Urgent");
        t2.setStatus("Open");
        t2.setCreatedBy(itManager);
        t2.setAssignedTo(techSarah);
        t2.setAssetId(ast3);
        t2.setSource("Portal");
        t2.setSlaDeadline(now.plus(Duration.ofHours(2)));
        t2.setSlaStatus("At Risk");
        t2.setAiTroubleshootingAttempted(false);
        t2.setTags(Arrays.asList("server", "outage", "staging", "critical"));
        t2.getComments().add(new Comment(itManager, "All QA pipelines are stalled. Please SSH via iDRAC console to inspect panic dump.", false, null, now.minus(Duration.ofHours(1))));
        t2.getActivityLog().add(new ActivityLog("Ticket Created", itManager, "Priority flagged as Urgent by IT Manager", now.minus(Duration.ofHours(1))));
        t2 = ticketRepository.save(t2);

        // TICK-1003
        Ticket t3 = new Ticket();
        t3.setTicketId("TICK-1003");
        t3.setTitle("Outlook Email Sync Authentication Loop on Dell Latitude");
        t3.setDescription("Outlook repeatedly prompts for credentials every 10 minutes and shows Disconnected in status bar.");
        t3.setCategory("Email & Communication");
        t3.setPriority("Medium");
        t3.setStatus("Resolved");
        t3.setCreatedBy(empMike);
        t3.setAssignedTo(techSarah);
        t3.setAssetId(ast2);
        t3.setSource("AI Chatbot");
        t3.setSlaDeadline(now.minus(Duration.ofHours(12)));
        t3.setSlaStatus("Within SLA");
        t3.setResolutionNotes("Cleared cached M365 authentication tokens from Windows Credential Manager and re-authenticated via Okta SSO. Email sync is now normal.");
        t3.setResolvedAt(now.minus(Duration.ofHours(15)));
        t3.setAiTroubleshootingAttempted(true);
        t3.setAiSummary("Chatbot guided user through credential purge; confirmed fixed by employee.");
        t3.setTags(Arrays.asList("outlook", "m365", "credentials"));
        t3.getComments().add(new Comment(techSarah, "Reset the OAuth token refresh period in Azure AD tenant.", false, null, now.minus(Duration.ofHours(16))));
        t3.getComments().add(new Comment(empMike, "Works smoothly now, all emails downloaded. Thank you!", false, null, now.minus(Duration.ofHours(15))));
        t3.getActivityLog().add(new ActivityLog("Ticket Created via AI Chatbot", empMike, "Created automatically following AI assistant guidance", now.minus(Duration.ofHours(20))));
        t3.getActivityLog().add(new ActivityLog("Status Changed", techSarah, "Status transitioned from In Progress to Resolved. Resolution: Cleared cached tokens.", now.minus(Duration.ofHours(15))));
        t3 = ticketRepository.save(t3);

        // TICK-1004
        Ticket t4 = new Ticket();
        t4.setTicketId("TICK-1004");
        t4.setTitle("Requesting Docker Desktop Enterprise License for new microservice project");
        t4.setDescription("Need Docker Desktop license activated for local Kubernetes orchestration and testing of the payment processing microservice.");
        t4.setCategory("Software");
        t4.setPriority("Low");
        t4.setStatus("Open");
        t4.setCreatedBy(empJane);
        t4.setAssignedTo(null);
        t4.setSource("Portal");
        t4.setSlaDeadline(now.plus(Duration.ofHours(36)));
        t4.setSlaStatus("Within SLA");
        t4.setAiTroubleshootingAttempted(false);
        t4.setTags(Arrays.asList("docker", "license", "software-request"));
        t4.getActivityLog().add(new ActivityLog("Ticket Created", empJane, "Software license request submitted", now.minus(Duration.ofHours(2))));
        t4 = ticketRepository.save(t4);

        // TICK-1005
        Ticket t5 = new Ticket();
        t5.setTicketId("TICK-1005");
        t5.setTitle("Dell 32\" 4K Monitor DisplayPort flickering in Engineering Bay");
        t5.setDescription("The external 4K monitor at desk 4-B displays horizontal white artifact lines whenever refresh rate is set to 60Hz.");
        t5.setCategory("Hardware");
        t5.setPriority("Medium");
        t5.setStatus("In Progress");
        t5.setCreatedBy(empJane);
        t5.setAssignedTo(techAlex);
        t5.setAssetId(ast7);
        t5.setSource("Portal");
        t5.setSlaDeadline(now.minus(Duration.ofHours(2))); // Overdue for realism
        t5.setSlaStatus("Breached");
        t5.setAiTroubleshootingAttempted(true);
        t5.setTags(Arrays.asList("monitor", "hardware", "repair"));
        t5.getComments().add(new Comment(techAlex, "Tested with certified 8K DP cable, issue is in monitor panel. Moved asset AST-107 to Under Repair and requested Dell warranty replacement.", false, null, now.minus(Duration.ofHours(6))));
        t5.getActivityLog().add(new ActivityLog("Ticket Created", empJane, "Hardware malfunction reported", now.minus(Duration.ofHours(30))));
        t5 = ticketRepository.save(t5);

        // 5. Notifications
        notificationRepository.save(new Notification(
                admin,
                "SLA Warning: TICK-1005 Overdue",
                "Ticket 'Dell 32\" 4K Monitor DisplayPort flickering' has breached its resolution SLA.",
                "SLA_ALERT",
                "/tickets/" + t5.getId()
        ));
        notificationRepository.save(new Notification(
                techSarah,
                "Urgent Ticket Assigned: TICK-1002",
                "Core Database Server Staging Container Outage assigned to you.",
                "TICKET_ASSIGNED",
                "/tickets/" + t2.getId()
        ));
        notificationRepository.save(new Notification(
                empJane,
                "Comment Added on TICK-1001",
                "Alex Rivera commented on 'Intermittent Cisco VPN connection drops'",
                "COMMENT_ADDED",
                "/tickets/" + t1.getId()
        ));

        System.out.println("✅ [Seeder] Spring Boot Database Seeded Successfully!");
    }
}
