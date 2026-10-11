package com.servicedesk.pro.service;

import com.servicedesk.pro.dto.AIDto;
import com.servicedesk.pro.model.KnowledgeBase;
import com.servicedesk.pro.model.User;
import com.servicedesk.pro.repository.KnowledgeBaseRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AIService {

    private final KnowledgeBaseRepository kbRepository;

    public AIService(KnowledgeBaseRepository kbRepository) {
        this.kbRepository = kbRepository;
    }

    public AIDto.ChatResult processChat(String userMessage, List<Map<String, Object>> history, User user) {
        String trimmed = userMessage.trim();
        String lower = trimmed.toLowerCase();

        AIDto.Classification classification = classifyIssue(trimmed);
        List<KnowledgeBase> articles = retrieveContext(trimmed);

        // 1. Check greetings
        if (Pattern.compile("^(hi|hello|hey|good morning|good afternoon|help)\\b", Pattern.CASE_INSENSITIVE).matcher(lower).find()
                && trimmed.length() < 25) {
            AIDto.ChatResult res = new AIDto.ChatResult();
            String userName = (user != null && user.getName() != null) ? user.getName() : "there";
            res.setReply("Hello " + userName + "! I'm your **ServiceDesk Pro AI Assistant**. 👋\n\n" +
                    "I can help you diagnose and resolve IT issues immediately, look up company IT policies, guide you through troubleshooting steps, or escalate to our technician team.\n\n" +
                    "**How can I assist you today?** (e.g., VPN issues, password resets, laptop battery, email sync, software installation, or Wi-Fi).");
            res.setClassification(new AIDto.Classification("General IT", "Low"));
            res.setSources(Collections.emptyList());
            res.setFollowUpQuestions(Arrays.asList(
                    "My VPN is not connecting",
                    "I need to reset my corporate password",
                    "My laptop battery is draining very fast",
                    "Outlook is not syncing my emails"
            ));
            res.setCanCreateTicket(false);
            res.setTicketDraft(null);
            return res;
        }

        // 2. Check thank you / confirmed resolved
        if (Pattern.compile("^(thank you|thanks|it worked|fixed|resolved|awesome|great|perfect|solved)\\b", Pattern.CASE_INSENSITIVE).matcher(lower).find()) {
            AIDto.ChatResult res = new AIDto.ChatResult();
            res.setReply("That is fantastic news! 🎉 I'm glad we could resolve your issue.\n\n" +
                    "If you encounter any further difficulties or need assistance with your hardware or software, feel free to ask anytime. Have a productive day!");
            res.setClassification(new AIDto.Classification(classification.getCategory(), "Low"));
            res.setSources(Collections.emptyList());
            res.setFollowUpQuestions(Arrays.asList("View my assigned assets", "Browse Knowledge Base", "Check ticket status"));
            res.setCanCreateTicket(false);
            res.setTicketDraft(null);
            return res;
        }

        // 3. Local Smart RAG Response
        return generateSmartResponse(trimmed, articles, classification, user);
    }

    public AIDto.Classification classifyIssue(String message) {
        String text = message.toLowerCase();
        String category = "Software";
        String priority = "Medium";

        if (Pattern.compile("vpn|wifi|wi-fi|internet|dns|network|connection|router|gateway|ping|firewall").matcher(text).find()) {
            category = "Network";
        } else if (Pattern.compile("password|login|access|permission|locked|2fa|mfa|sso|credentials|unauthorized").matcher(text).find()) {
            category = "Access & Security";
        } else if (Pattern.compile("laptop|screen|display|battery|keyboard|mouse|dock|charger|power|hardware|printer|fan|overheating|cable").matcher(text).find()) {
            category = "Hardware";
        } else if (Pattern.compile("outlook|email|mail|teams|slack|zoom|meeting|calendar|inbox").matcher(text).find()) {
            category = "Email & Communication";
        } else if (Pattern.compile("aws|azure|gcp|cloud|server|ec2|s3|kubernetes|database|backup").matcher(text).find()) {
            category = "Cloud Services";
        }

        if (Pattern.compile("urgent|critical|broken|down|outage|production|blocked|cannot work|all employees|emergency|crash|bsod|blue screen").matcher(text).find()) {
            priority = "Urgent";
        } else if (Pattern.compile("high|important|deadline|executive|vip|failing|error code|overheating").matcher(text).find()) {
            priority = "High";
        } else if (Pattern.compile("slow|minor|cosmetic|feature|question|info|request|how to").matcher(text).find()) {
            priority = "Low";
        }

        return new AIDto.Classification(category, priority);
    }

    public List<KnowledgeBase> retrieveContext(String query) {
        List<KnowledgeBase> approved = kbRepository.findByStatus("Approved");
        if (approved.isEmpty()) {
            return Collections.emptyList();
        }

        String[] tokens = query.toLowerCase()
                .replaceAll("[^a-zA-Z0-9\\s]", " ")
                .split("\\s+");
        Set<String> searchWords = Arrays.stream(tokens)
                .filter(t -> t.length() > 2)
                .collect(Collectors.toSet());

        if (searchWords.isEmpty()) {
            return approved.stream().limit(3).collect(Collectors.toList());
        }

        // Rank by keyword matches
        List<Map.Entry<KnowledgeBase, Integer>> scored = new ArrayList<>();
        for (KnowledgeBase kb : approved) {
            int score = 0;
            String fullText = (kb.getTitle() + " " + kb.getProblemSummary() + " " + String.join(" ", kb.getTags()) + " " + kb.getContent()).toLowerCase();
            for (String word : searchWords) {
                if (kb.getTitle().toLowerCase().contains(word)) score += 5;
                if (kb.getProblemSummary().toLowerCase().contains(word)) score += 3;
                if (fullText.contains(word)) score += 1;
            }
            if (score > 0) {
                scored.add(new AbstractMap.SimpleEntry<>(kb, score));
            }
        }

        scored.sort((a, b) -> Integer.compare(b.getValue(), a.getValue()));

        if (!scored.isEmpty()) {
            return scored.stream().map(Map.Entry::getKey).limit(3).collect(Collectors.toList());
        }

        return approved.stream()
                .sorted((a, b) -> Integer.compare(b.getHelpfulVotes(), a.getHelpfulVotes()))
                .limit(2)
                .collect(Collectors.toList());
    }

    private AIDto.ChatResult generateSmartResponse(String userMessage, List<KnowledgeBase> articles, AIDto.Classification classification, User user) {
        AIDto.ChatResult res = new AIDto.ChatResult();
        res.setClassification(classification);

        KnowledgeBase bestArticle = (articles != null && !articles.isEmpty()) ? articles.get(0) : null;

        List<AIDto.Source> sources = new ArrayList<>();
        StringBuilder sb = new StringBuilder();

        if (bestArticle != null) {
            sources.add(new AIDto.Source(bestArticle.getArticleId(), bestArticle.getTitle(), bestArticle.getCategory()));
            sb.append("I've analyzed your issue regarding **\"").append(userMessage).append("\"** and matched it with internal knowledge base article **[")
              .append(bestArticle.getArticleId()).append(": ").append(bestArticle.getTitle()).append("]**.\n\n");
            sb.append("### 🛠️ Recommended Step-by-Step Troubleshooting:\n\n");

            List<String> steps = bestArticle.getStepByStepSolution();
            if (steps == null || steps.isEmpty()) {
                steps = Arrays.asList(
                        "Verify all cables and power connections.",
                        "Restart the application or reboot your device.",
                        "Check for pending operating system and software updates.",
                        "Clear application cache and retry."
                );
            }

            for (int i = 0; i < steps.size(); i++) {
                sb.append((i + 1)).append(". **").append(steps.get(i)).append("**\n");
            }

            sb.append("\n> 💡 **Tip:** ").append(bestArticle.getProblemSummary() != null ? bestArticle.getProblemSummary() : "Ensure your device has an active internet connection.").append("\n\n");
            sb.append("Did any of these steps resolve your issue? If the problem persists, I can immediately create an official IT support ticket for our **").append(classification.getCategory()).append(" Support Team**.");
        } else {
            sb.append("I understand you are experiencing an issue with **\"").append(userMessage).append("\"**.\n\n");
            sb.append("### 🛠️ Recommended Initial Checks:\n");
            sb.append("1. **Reboot your system or application** to clear temporary caches and hung processes.\n");
            sb.append("2. **Check network stability** and ensure your VPN or Ethernet connection is secure.\n");
            sb.append("3. **Verify credentials & permissions** if this involves an access or authentication error.\n");
            sb.append("4. **Review system notifications** for any error codes or security prompts.\n\n");
            sb.append("Since this might require specialized diagnostics, would you like me to raise an IT support ticket for you?");
        }

        res.setReply(sb.toString());
        res.setSources(sources);
        res.setFollowUpQuestions(Arrays.asList(
                "Yes, the issue is resolved! Thank you.",
                "No, I still have the problem. Please create a ticket.",
                "Can you explain step 2 in more detail?",
                "How do I check if my device warranty is valid?"
        ));
        res.setCanCreateTicket(true);

        AIDto.TicketDraft draft = new AIDto.TicketDraft();
        draft.setTitle(userMessage.length() > 70 ? userMessage.substring(0, 67) + "..." : userMessage);
        draft.setDescription("Issue reported via AI Helpdesk Assistant:\n\nUser Query: \"" + userMessage + "\"\n\nAI Diagnostic Summary:\n" +
                "- Identified Category: " + classification.getCategory() + "\n" +
                "- Assessed Priority: " + classification.getPriority() + "\n" +
                "- Initial Troubleshooting Attempted: " + (bestArticle != null ? bestArticle.getTitle() : "Standard initial diagnostics") + "\n" +
                "- Requester: " + (user != null ? user.getName() : "Employee") + " (" + (user != null ? user.getDepartment() : "General") + ")\n\n" +
                "Action Required: Technician review and resolution.");
        draft.setCategory(classification.getCategory());
        draft.setPriority(classification.getPriority());
        draft.setTags(Arrays.asList("AI-Assisted", classification.getCategory().toLowerCase(), bestArticle != null ? bestArticle.getArticleId() : "kb-none"));
        draft.setSlaHours(switch (classification.getPriority()) {
            case "Urgent" -> 4;
            case "High" -> 12;
            case "Low" -> 48;
            default -> 24;
        });

        res.setTicketDraft(draft);
        return res;
    }
}
