const KnowledgeBase = require('../models/KnowledgeBase');

/**
 * Intelligent Retrieval-Augmented Generation (RAG) Service
 * Searches approved knowledge base articles and produces structured troubleshooting advice.
 */
class AIService {
  /**
   * Search knowledge base for relevant articles using keywords and text search
   */
  async retrieveContext(query) {
    try {
      const cleanQuery = query.toLowerCase();
      const queryTokens = cleanQuery
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((token) => token.length > 2);

      // 1. Full text search if supported
      let articles = await KnowledgeBase.find({
        status: 'Approved',
        $text: { $search: query },
      })
        .limit(4)
        .select('articleId title category tags problemSummary symptoms stepByStepSolution content helpfulVotes');

      // 2. Fallback or augment with regex/keyword matching if few results
      if (!articles || articles.length < 2) {
        const regexConditions = queryTokens.map((token) => ({
          $or: [
            { title: { $regex: token, $options: 'i' } },
            { problemSummary: { $regex: token, $options: 'i' } },
            { tags: { $regex: token, $options: 'i' } },
            { content: { $regex: token, $options: 'i' } },
          ],
        }));

        if (regexConditions.length > 0) {
          const regexArticles = await KnowledgeBase.find({
            status: 'Approved',
            $or: regexConditions,
          })
            .limit(4)
            .select('articleId title category tags problemSummary symptoms stepByStepSolution content helpfulVotes');

          const existingIds = new Set(articles.map((a) => a._id.toString()));
          for (const a of regexArticles) {
            if (!existingIds.has(a._id.toString())) {
              articles.push(a);
            }
          }
        }
      }

      // If still empty, return top 2 most helpful articles as general fallback
      if (articles.length === 0) {
        articles = await KnowledgeBase.find({ status: 'Approved' })
          .sort({ helpfulVotes: -1 })
          .limit(2)
          .select('articleId title category tags problemSummary symptoms stepByStepSolution content');
      }

      return articles;
    } catch (err) {
      console.error('Error retrieving KB context:', err.message);
      return [];
    }
  }

  /**
   * Classify user issue category and priority
   */
  classifyIssue(userMessage) {
    const text = userMessage.toLowerCase();

    let category = 'Software';
    let priority = 'Medium';

    // Category heuristics
    if (text.match(/vpn|wifi|wi-fi|internet|dns|network|connection|router|gateway|ping|firewall/i)) {
      category = 'Network';
    } else if (text.match(/password|login|access|permission|locked|2fa|mfa|sso|credentials|unauthorized/i)) {
      category = 'Access & Security';
    } else if (text.match(/laptop|screen|display|battery|keyboard|mouse|dock|charger|power|hardware|printer|fan|overheating|cable/i)) {
      category = 'Hardware';
    } else if (text.match(/outlook|email|mail|teams|slack|zoom|meeting|calendar|inbox/i)) {
      category = 'Email & Communication';
    } else if (text.match(/aws|azure|gcp|cloud|server|ec2|s3|kubernetes|database|backup/i)) {
      category = 'Cloud Services';
    }

    // Priority heuristics
    if (text.match(/urgent|critical|broken|down|outage|production|blocked|cannot work|all employees|emergency|crash|bsod|blue screen/i)) {
      priority = 'Urgent';
    } else if (text.match(/high|important|deadline|executive|vip|failing|error code|overheating/i)) {
      priority = 'High';
    } else if (text.match(/slow|minor|cosmetic|feature|question|info|request|how to/i)) {
      priority = 'Low';
    }

    return { category, priority };
  }

  /**
   * Main Chatbot processing method with RAG and LLM or Intelligent Engine
   */
  async processChat(userMessage, conversationHistory = [], userContext = {}) {
    const articles = await this.retrieveContext(userMessage);
    const { category, priority } = this.classifyIssue(userMessage);

    const provider = process.env.AI_PROVIDER || 'mock';

    // If an external OpenAI or Gemini key is configured, execute API call
    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      try {
        return await this.callOpenAI(userMessage, conversationHistory, articles, { category, priority }, userContext);
      } catch (err) {
        console.warn('OpenAI API call failed, falling back to Intelligent Engine:', err.message);
      }
    } else if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
      try {
        return await this.callGemini(userMessage, conversationHistory, articles, { category, priority }, userContext);
      } catch (err) {
        console.warn('Gemini API call failed, falling back to Intelligent Engine:', err.message);
      }
    }

    // Default High-Performance Local RAG Intelligence Engine
    return this.generateSmartResponse(userMessage, conversationHistory, articles, { category, priority }, userContext);
  }

  /**
   * Local Smart RAG Response Generator
   */
  generateSmartResponse(userMessage, history, articles, classification, userContext) {
    const text = userMessage.toLowerCase();
    const { category, priority } = classification;

    // Check if user is saying thanks, confirming resolution, or asking general greetings
    if (text.match(/^(hi|hello|hey|good morning|good afternoon|help)\b/i) && text.length < 25) {
      return {
        reply: `Hello ${userContext.name || 'there'}! I'm your **ServiceDesk Pro AI Assistant**. 👋\n\nI can help you diagnose and resolve IT issues immediately, look up company IT policies, guide you through troubleshooting steps, or escalate to our technician team.\n\n**How can I assist you today?** (e.g., VPN issues, password resets, laptop battery, email sync, software installation, or Wi-Fi).`,
        classification: { category: 'General IT', priority: 'Low' },
        sources: [],
        followUpQuestions: [
          'My VPN is not connecting',
          'I need to reset my corporate password',
          'My laptop battery is draining very fast',
          'Outlook is not syncing my emails',
        ],
        canCreateTicket: false,
        ticketDraft: null,
      };
    }

    // Check if user is confirming it worked
    if (text.match(/^(thank you|thanks|it worked|fixed|resolved|awesome|great|perfect|solved)\b/i)) {
      return {
        reply: `That is fantastic news! 🎉 I'm glad we could resolve your issue.\n\nIf you encounter any further difficulties or need assistance with your hardware or software, feel free to ask anytime. Have a productive day!`,
        classification: { category, priority: 'Low' },
        sources: [],
        followUpQuestions: ['View my assigned assets', 'Browse Knowledge Base', 'Check ticket status'],
        canCreateTicket: false,
        ticketDraft: null,
      };
    }

    // Best matching article
    const bestArticle = articles && articles.length > 0 ? articles[0] : null;

    let responseMarkdown = '';
    let steps = [];
    let sources = [];

    if (bestArticle) {
      sources.push({
        articleId: bestArticle.articleId,
        title: bestArticle.title,
        category: bestArticle.category,
      });

      steps = bestArticle.stepByStepSolution && bestArticle.stepByStepSolution.length > 0
        ? bestArticle.stepByStepSolution
        : [
            'Verify all cables and power connections.',
            'Restart the application or reboot your device.',
            'Check for pending operating system and software updates.',
            'Clear application cache and retry.',
          ];

      responseMarkdown = `I've analyzed your issue regarding **"${userMessage}"** and matched it with internal knowledge base article **[${bestArticle.articleId}: ${bestArticle.title}]**.\n\n### 🛠️ Recommended Step-by-Step Troubleshooting:\n\n`;

      steps.forEach((step, index) => {
        responseMarkdown += `${index + 1}. **${step}**\n`;
      });

      responseMarkdown += `\n> 💡 **Tip:** ${bestArticle.problemSummary || 'Ensure your device has an active internet connection during these steps.'}\n\n`;
      responseMarkdown += `Did any of these steps resolve your issue? If the problem persists, I can immediately create an official IT support ticket for our **${category} Support Team**.`;
    } else {
      // General fallback if no direct KB article
      responseMarkdown = `I understand you are experiencing an issue with **${userMessage}**.\n\n### 🛠️ Recommended Initial Checks:\n1. **Reboot your system or application** to clear temporary caches and hung processes.\n2. **Check network stability** and ensure your VPN or Ethernet connection is secure.\n3. **Verify credentials & permissions** if this involves an access or authentication error.\n4. **Review system notifications** for any error codes or security prompts.\n\nSince this might require specialized diagnostics, would you like me to raise an IT support ticket for you?`;
    }

    // Prepare follow-up questions
    const followUpQuestions = [
      'Yes, the issue is resolved! Thank you.',
      'No, I still have the problem. Please create a ticket.',
      'Can you explain step 2 in more detail?',
      'How do I check if my device warranty is valid?',
    ];

    // Prepare ticket proposal
    const ticketDraft = {
      title: userMessage.length > 70 ? userMessage.substring(0, 67) + '...' : userMessage,
      description: `Issue reported via AI Helpdesk Assistant:\n\nUser Query: "${userMessage}"\n\nAI Diagnostic Summary:\n- Identified Category: ${category}\n- Assessed Priority: ${priority}\n- Initial Troubleshooting Attempted: ${bestArticle ? bestArticle.title : 'Standard initial diagnostics'}\n- Requester: ${userContext.name || 'Employee'} (${userContext.department || 'General'})\n\nAction Required: Technician review and resolution.`,
      category,
      priority,
      tags: ['AI-Assisted', category.toLowerCase(), bestArticle ? bestArticle.articleId : 'kb-none'],
      slaHours: priority === 'Urgent' ? 4 : priority === 'High' ? 12 : priority === 'Medium' ? 24 : 48,
    };

    return {
      reply: responseMarkdown,
      classification: { category, priority },
      sources,
      followUpQuestions,
      canCreateTicket: true,
      ticketDraft,
    };
  }

  /**
   * External OpenAI Integration (if key provided)
   */
  async callOpenAI(userMessage, history, articles, classification, userContext) {
    const kbContextText = articles
      .map((a) => `[${a.articleId}] ${a.title}\nCategory: ${a.category}\nSolution Steps:\n${a.stepByStepSolution?.join('\n')}\nContent: ${a.content}`)
      .join('\n\n---\n\n');

    const systemPrompt = `You are ServiceDesk Pro AI, an enterprise IT Helpdesk expert.
User: ${userContext.name || 'Employee'} (Department: ${userContext.department || 'General'})
Classified Category: ${classification.category}, Priority: ${classification.priority}

Approved Internal Knowledge Base Articles:
${kbContextText}

Instructions:
1. Provide a polite, clear, structured markdown response with step-by-step troubleshooting.
2. Reference relevant KB article IDs when applicable.
3. If the problem cannot be resolved by standard steps, offer to create an IT support ticket.
4. Keep the tone professional, helpful, and concise.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map((h) => ({ role: h.sender === 'user' ? 'user' : 'assistant', content: h.text })),
      { role: 'user', content: userMessage },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    const replyText = data.choices[0].message.content;

    return {
      reply: replyText,
      classification,
      sources: articles.map((a) => ({ articleId: a.articleId, title: a.title, category: a.category })),
      followUpQuestions: [
        'It solved my issue!',
        'Create a support ticket for me',
        'Can I speak with a technician?',
      ],
      canCreateTicket: true,
      ticketDraft: {
        title: userMessage.substring(0, 70),
        description: `Reported via AI Helpdesk:\n${userMessage}\n\nAI Advice Provided:\n${replyText.substring(0, 300)}...`,
        category: classification.category,
        priority: classification.priority,
        tags: ['AI-Assisted', 'OpenAI'],
      },
    };
  }

  /**
   * External Gemini Integration (if key provided)
   */
  async callGemini(userMessage, history, articles, classification, userContext) {
    const kbContextText = articles
      .map((a) => `[${a.articleId}] ${a.title}\nCategory: ${a.category}\nSolution Steps:\n${a.stepByStepSolution?.join('\n')}\nContent: ${a.content}`)
      .join('\n\n---\n\n');

    const prompt = `You are ServiceDesk Pro AI, an enterprise IT Helpdesk expert.
User: ${userContext.name || 'Employee'} (Department: ${userContext.department || 'General'})
Classified Category: ${classification.category}, Priority: ${classification.priority}

Approved Internal Knowledge Base Articles:
${kbContextText}

User Query: "${userMessage}"

Provide clear step-by-step troubleshooting, cite relevant KB articles, and offer to create a ticket if unresolved.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();
    const replyText = data.candidates[0].content.parts[0].text;

    return {
      reply: replyText,
      classification,
      sources: articles.map((a) => ({ articleId: a.articleId, title: a.title, category: a.category })),
      followUpQuestions: [
        'It worked, thanks!',
        'Create a support ticket for me',
        'I need help from a human technician',
      ],
      canCreateTicket: true,
      ticketDraft: {
        title: userMessage.substring(0, 70),
        description: `Reported via AI Helpdesk:\n${userMessage}\n\nAI Response Summary:\n${replyText.substring(0, 300)}...`,
        category: classification.category,
        priority: classification.priority,
        tags: ['AI-Assisted', 'Gemini'],
      },
    };
  }
}

module.exports = new AIService();
