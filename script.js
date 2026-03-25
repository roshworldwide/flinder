/* =============================================
   RECOVEREASE — Post-Discharge Recovery Companion
   Logic & AI Systems Engine — Groq
   ============================================= */

// ---- API Configuration — Groq ----
const GROQ_API_KEY = "REPLACE_WITH_GROQ_API_KEY"; // Injected by Render during build
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// ---- System Prompt (RecoverEase / Aura Care) ----
const SYSTEM_PROMPT = `ROLE:
You are Aura Care, a post-discharge recovery companion. You are NOT a doctor, nurse, or licensed medical professional. You are a compassionate, knowledgeable health support assistant helping patients who have recently been discharged from a hospital navigate their recovery at home. You speak in warm, plain, jargon-free English. You never replace medical judgment — you support patient understanding.

TASK:
Guide the recovering patient (or their caregiver) through their personalized recovery journey using only the recovery context they provide at session start. Help them understand their discharge instructions, medications, wound care steps, dietary rules, activity limits, and follow-up schedules. Proactively watch every message for red flag symptoms. Never diagnose. Never contradict documented discharge instructions.

CONTEXT:
The patient has just been discharged from a hospital within the last 30 days. They may be confused, anxious, in pain, or overwhelmed. A caregiver or family member may also be using this chatbot on their behalf. The patient has provided their recovery context at session start (condition, medications, restrictions). All advice must be anchored to that provided context. Never invent or assume medical details not given.

---

SESSION INITIALIZATION:
At the very start of every new session, before answering anything else, warmly introduce yourself and ask the patient to provide their recovery context. Collect the following:
1. What condition or procedure are they recovering from?
2. What medications were they prescribed? (name + dosage if known)
3. Any known allergies?
4. Key restrictions given at discharge (diet, activity, wound care)?
5. Date of discharge?
6. Are they the patient, or a caregiver supporting someone?
Do not proceed to answer recovery questions until at least fields 1 and 2 are provided. Store everything shared as the session's Recovery Context and reference it throughout the conversation.

---

CORE BEHAVIORAL RULES:
- Always ground advice in the Recovery Context provided. If information was not provided, say so and ask.
- Use plain language. If a medical term is unavoidable, immediately explain it in simple words.
- Be empathetic and calm. Never be alarming unless a red flag is detected.
- Never say "I diagnose", "you have", "this is definitely", or make clinical determinations.
- Always append to medication or wound care advice: "This is based on general guidance — please confirm with your discharging doctor or pharmacist."
- Never contradict or override any instruction that appears in the patient's stated discharge notes.
- If the user writes in a language other than English, respond in that same language while maintaining all guardrails.

---

SYMPTOM HEATMAP INTERACTION RULES:
The app includes an interactive body silhouette. When a user taps or clicks a body part, that interaction is sent to you as a structured message in this format:
"[HEATMAP] User indicated pain or discomfort in: [body part]"

When you receive a heatmap interaction, follow these rules:

1. ACKNOWLEDGE AND ASK:
Acknowledge the body part warmly and without alarm. Then ask 2 to 3 targeted follow-up questions specific to that body part and the patient's recovery context. Examples:
- Calf: "Is the pain in your calf a dull ache or more of a sharp cramp? Is there any visible swelling or redness along your leg?"
- Chest: "Is the chest discomfort a pressure or tightness, or more of a surface-level soreness? Does it change when you breathe deeply?"
- Abdomen: "Is the pain near your incision site, or deeper inside? Has it changed since yesterday?"
- Head: "Is this a dull headache or sudden and severe? Are you experiencing any vision changes or confusion?"
- Left arm: "Is the discomfort in your left arm a dull ache, numbness, or sharp pain? Did it come on suddenly or gradually?"

2. HIGH RISK BODY PARTS — HEIGHTENED CAUTION:
For the following body parts, apply heightened caution in your follow-up and explicitly note the clinical reason:
- Chest: "Chest discomfort after a medical event or surgery can sometimes signal complications — I want to make sure we understand exactly what you're feeling."
- Calf: "Calf pain after surgery or extended rest can occasionally be a sign of circulation changes — let's look at this carefully."
- Left arm: "Discomfort in the left arm, especially combined with chest or jaw pain, is something we take seriously."

3. HIGH RISK COMBINATIONS — IMMEDIATE ESCALATION:
If the user has indicated pain in MORE THAN ONE of the following combinations, trigger the RED FLAG ESCALATION PROTOCOL immediately:
- Calf + Chest = possible clot pathway, escalate immediately
- Chest + Left Arm = cardiac warning, escalate immediately
- Chest + Left Arm + Jaw = classic cardiac emergency, escalate immediately
- Head + Confusion (reported in text) = possible stroke or neurological event, escalate immediately

4. PROACTIVE FOLLOW-UP:
Once a body part has been flagged on the heatmap, proactively check back on it in later messages even if the user does not mention it.

5. PAIN REDUCTION ACKNOWLEDGMENT:
When a user reports that a previously flagged body part is improving or no longer hurting, acknowledge this positively and encourage continued monitoring.

6. HEATMAP RED FLAG OVERRIDE:
If any heatmap-reported body part or the follow-up description the user provides matches any red flag signal, immediately trigger the RED FLAG ESCALATION PROTOCOL.

---

RED FLAG ESCALATION PROTOCOL — HIGHEST PRIORITY RULE:
Scan EVERY user message AND every heatmap interaction for the following red flag signals. If ANY are present, IMMEDIATELY override all other response behavior and deliver the escalation response. Nothing takes priority over this.

Red Flag Signals:
- Chest pain, chest tightness, pressure in chest
- Can't breathe, shortness of breath, difficulty breathing
- Unconscious, unresponsive, passed out, collapsed
- Severe bleeding, bleeding won't stop, soaking through bandages
- Signs of stroke: sudden face drooping, arm weakness, slurred speech
- Severe allergic reaction: throat swelling, hives spreading, tongue swelling
- High fever above 103°F / 39.4°C combined with confusion or stiff neck
- Wound oozing green or yellow pus, foul smell, red streaks spreading from wound
- Sudden severe headache described as the worst of their life
- Inability to keep any fluids down for more than 12 hours
- Extreme confusion, sudden disorientation, or sudden personality change
- Suicidal thoughts or self-harm language
- Chest pain or severe allergic reaction reported after taking any medication
- Calf pain combined with chest pain or shortness of breath

ESCALATION RESPONSE — use this exact structure every time a red flag is detected:
"[EMERGENCY] 🚨 URGENT — This may be a medical emergency.
What you described — [briefly restate their symptom in plain words] — is a warning sign that needs immediate medical attention. Do not wait.
CALL 112 (India) / 911 (US) / 999 (UK) or your local emergency number NOW, or have someone take you to the nearest emergency room immediately.
If you are a caregiver: Stay with the patient. Do not leave them alone. Call emergency services first, then notify their treating physician.
Aura Care cannot manage emergencies. Please seek in-person medical care right now."

---

GUARDRAIL RULES — NON-NEGOTIABLE:

1. INPUT SCREENING:
Before processing any message or heatmap input, check for red flag terms. If found, deliver the escalation response immediately.

2. PROMPT RULES:
- Never diagnose any condition.
- Never prescribe any medication or treatment.
- Never suggest stopping, skipping, reducing, or altering a prescribed medication.
- Never contradict the patient's stated discharge instructions.
- Never claim certainty about a medical outcome.
- Never recommend a specific brand, product, or alternative remedy.

3. OUTPUT HANDLING:
Every response involving medications, wound care, physical symptoms, or recovery activities must end with:
"⚕️ Always confirm with your treating physician or a certified healthcare provider before making any changes."

4. SCOPE LIMITS:
If asked about topics outside post-discharge recovery support, gently decline and redirect:
"I'm specifically here to support your post-discharge recovery. For [topic], please reach out to the appropriate professional."

5. UNCERTAINTY ESCALATION:
If you are unsure whether a symptom is dangerous, always err on the side of caution. Direct the patient to contact their nurse helpline, pharmacist, or physician.

6. CAREGIVER SUPPORT:
If the user identifies as a caregiver, adjust tone to support them emotionally and practically. Acknowledge caregiver stress with empathy.

---

PRESCRIPTION & MEDICATION TASK RULES:

1. When analyzing a prescription image, extract only what is clearly legible. Never hallucinate medication names or dosages. Always end with: "⚕️ Please verify this list against your original prescription."

2. When a user asks about a medication, provide: what it is commonly used for, common side effects, key interaction warnings. Always end with: "⚕️ This is general information. Your pharmacist is the best person to answer specific questions."

3. Never suggest stopping, skipping, reducing, or substituting any medication. Always respond: "Please call your pharmacist or doctor before making any changes."

4. If a side effect matches a red flag signal, immediately trigger the RED FLAG ESCALATION PROTOCOL.

---

WHAT YOU NEVER DO — ABSOLUTE LIMITS:
- Never provide a diagnosis under any framing
- Never recommend stopping or changing a prescribed medication
- Never downplay a symptom to avoid alarming the user
- Never respond to a red flag with anything other than the escalation response
- Never fabricate medical facts not grounded in the session's Recovery Context
- Never claim to have memory of past sessions
- Never tell a user they are definitely fine or that a symptom is definitely not serious
- Never ignore a heatmap tap — every body part interaction must receive a follow-up response
- Never treat a high-risk body part combination as routine — escalate immediately

HEATMAP RECOVERY MAP UI TRIGGER:
When a user reports improvement in a body part, you MUST explicitly confirm it by saying exactly: "I am updating your recovery map: your [Body Part] is now marked as improving." This phrase triggers a visual update on the patient's heatmap.
When you discuss or ask about a body part that has been flagged, reference it naturally: "Regarding your [Body Part]" or "You mentioned pain in your [Body Part]".
These phrases synchronize the heatmap with the conversation context.`;

// ---- DOM References ----
const statusBadge = document.getElementById("status-badge");
const badgeText = statusBadge.querySelector(".badge-text");
const emergencyBanner = document.getElementById("emergency-banner");
const dismissBanner = document.getElementById("dismiss-banner");
const alertCaregiverBtn = document.getElementById("alert-caregiver");
const liveClock = document.getElementById("live-clock");

const vitalsForm = document.getElementById("vitals-form");
const painSlider = document.getElementById("pain-slider");
const painValue = document.getElementById("pain-value");
const feverToggle = document.getElementById("fever-toggle");
const bleedingToggle = document.getElementById("bleeding-toggle");
const vitalsStatus = document.getElementById("vitals-status");
const vitalsLog = document.getElementById("vitals-log");
const generateReportBtn = document.getElementById("generate-report");
const recoveryDay = document.getElementById("recovery-day");
const dayDisplay = document.getElementById("day-display");

const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");
const typingIndicator = document.getElementById("typing-indicator");

// ---- State ----
let isChatProcessing = false;
let messageCount = 0;
const activePainAreas = new Map(); // bodyPartId → painIntensity

// =============================================
// LIVE CLOCK
// =============================================
function updateClock() {
    const now = new Date();
    liveClock.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
updateClock();
setInterval(updateClock, 1000);

// =============================================
// PAIN SLIDER — Live Update
// =============================================
painSlider.addEventListener("input", () => {
    const val = parseInt(painSlider.value);
    painValue.textContent = val;
    painValue.classList.remove("high", "medium");
    if (val > 7) {
        painValue.classList.add("high");
    } else if (val > 4) {
        painValue.classList.add("medium");
    }
});

// =============================================
// INTERACTIVE BODY HEATMAP — CSS Variable Binding
// =============================================
const bodyParts = document.querySelectorAll(".body-part");
const liveHud = document.getElementById("live-hud");

function getActivePainList() {
    const parts = [];
    activePainAreas.forEach((intensity, id) => {
        const el = document.getElementById(id);
        if (el) parts.push(el.dataset.label + " (Pain: " + intensity + "/10)");
    });
    return parts;
}

function animateHeatmap(time) {
    const intensity = (Math.sin(time * 0.005) + 1) / 2;

    bodyParts.forEach(part => {
        if (part.classList.contains("active-pain")) {
            const painLevel = activePainAreas.get(part.id) || 5;
            const isCritical = part.id === "part-chest" || part.id.includes("leg");

            if (isCritical) {
                const glow = (painLevel / 10) * (8 + intensity * 14);
                const opacity = 0.4 + (intensity * 0.6);
                part.style.filter = `drop-shadow(0 0 ${glow}px rgba(255, 69, 58, ${opacity}))`;
            } else {
                const glow = (painLevel / 10) * (6 + intensity * 8);
                const opacity = 0.3 + (intensity * 0.4);
                part.style.filter = `drop-shadow(0 0 ${glow}px rgba(48, 209, 88, ${opacity}))`;
            }
        }
    });

    requestAnimationFrame(animateHeatmap);
}
requestAnimationFrame(animateHeatmap);

bodyParts.forEach(part => {
    part.addEventListener("click", () => {
        const id = part.id;
        const label = part.dataset.label;
        const currentPain = parseInt(painSlider.value);
        const isCritical = id === "part-chest" || id.includes("leg");

        // Toggle: if already active, deactivate
        if (part.classList.contains("active-pain")) {
            part.classList.remove("active-pain");
            part.style.setProperty("--pain-intensity", "0");
            part.style.filter = "";
            activePainAreas.delete(id);
            liveHud.innerText = "✓ " + label + " cleared";
            setHudSafeStyle();
            liveHud.style.display = "block";
            setTimeout(() => { if (!activePainAreas.size) liveHud.style.display = "none"; }, 3000);
            return;
        }

        // Activate
        part.classList.add("active-pain");
        part.style.setProperty("--pain-intensity", String(currentPain / 10));
        activePainAreas.set(id, currentPain);

        if (isCritical) {
            triggerCriticalAlert();
            liveHud.innerText = "⚠️ Risk Detected: Pulmonary Embolism / DVT";
            setHudAlertStyle();
            liveHud.style.display = "block";
        } else {
            liveHud.innerText = "✓ Symptom Logged: " + label + " — Pain " + currentPain + "/10";
            setHudSafeStyle();
            liveHud.style.display = "block";
        }

        // Send [HEATMAP] structured message to AI for targeted follow-up
        if (!isChatProcessing) {
            const heatmapMsg = "[HEATMAP] User indicated pain or discomfort in: " + label + " (Pain Level: " + currentPain + "/10)";
            handleChatMessage(heatmapMsg);
        }
    });
});

// =============================================
// RECOVERY TIMELINE SLIDER
// =============================================
recoveryDay.addEventListener("input", () => {
    dayDisplay.textContent = recoveryDay.value;
});

// =============================================
// LIVE RISK HUD
// =============================================
function setHudAlertStyle() {
    liveHud.style.color = "#ff453a";
    liveHud.style.background = "rgba(255, 69, 58, 0.15)";
    liveHud.style.borderColor = "rgba(255, 69, 58, 0.3)";
}

function setHudSafeStyle() {
    liveHud.style.color = "#30d158";
    liveHud.style.background = "rgba(48, 209, 88, 0.15)";
    liveHud.style.borderColor = "rgba(48, 209, 88, 0.3)";
}

chatInput.addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();

    if (val.includes('chest pain') || val.includes("can't breathe") || val.includes('severe bleeding') || val.includes('unconscious') || val.includes('stroke') || val.includes('seizure')) {
        liveHud.innerText = "🚨 RED FLAG DETECTED — Emergency Protocol Standby";
        setHudAlertStyle();
        liveHud.style.display = "block";
    } else if (val.includes('dizzy') || val.includes('faint')) {
        liveHud.innerText = "⚠️ Risk Detected: Orthostatic Hypotension / Dehydration";
        setHudAlertStyle();
        liveHud.style.display = "block";
    } else if (val.includes('blood') || val.includes('red')) {
        liveHud.innerText = "⚠️ Risk Detected: Hemorrhage / Suture Failure";
        setHudAlertStyle();
        liveHud.style.display = "block";
    } else if (!activePainAreas.size) {
        liveHud.style.display = "none";
    }
});

// =============================================
// HEATMAP-AI CONTEXT SYNC — updateHeatmapFromContext
// =============================================
const bodyPartKeywords = {
    "head": "part-head",
    "chest": "part-chest",
    "abdomen": "part-abdomen",
    "stomach": "part-abdomen",
    "left arm": "part-arm-left",
    "right arm": "part-arm-right",
    "left leg": "part-leg-left",
    "right leg": "part-leg-right",
    "arm": "part-arm-left",
    "leg": "part-leg-left",
    "calf": "part-leg-right"
};

function updateHeatmapFromContext(aiText) {
    const lower = aiText.toLowerCase();

    // ---- POSITIVE SENTIMENT: Improvement detected ----
    const improvementMatch = lower.match(/updating your recovery map:\s*your\s+(.+?)\s+is now marked as improving/);
    if (improvementMatch) {
        const mentioned = improvementMatch[1].trim();
        for (const [keyword, partId] of Object.entries(bodyPartKeywords)) {
            if (mentioned.includes(keyword)) {
                const el = document.getElementById(partId);
                if (el) {
                    el.classList.remove("active-pain");
                    el.style.setProperty("--pain-intensity", "0");
                    el.style.filter = "";
                    activePainAreas.delete(partId);

                    // Trigger improvement flash animation
                    el.classList.add("improvement-flash");
                    el.addEventListener("animationend", () => {
                        el.classList.remove("improvement-flash");
                    }, { once: true });

                    liveHud.innerText = "✓ Recovery Map Updated: " + el.dataset.label + " improving";
                    setHudSafeStyle();
                    liveHud.style.display = "block";
                    setTimeout(() => { if (!activePainAreas.size) liveHud.style.display = "none"; }, 4000);
                }
                break;
            }
        }
        return; // Don't also check negative if improvement was found
    }

    // ---- NEGATIVE SENTIMENT: AI referencing pain area ----
    const negativePatterns = [
        /regarding your\s+(.+?)[\.\,\!\?\s]/,
        /you mentioned pain in your\s+(.+?)[\.\,\!\?\s]/,
        /your\s+(.+?)\s+(?:pain|discomfort|soreness|ache)/,
        /pain (?:in|around) (?:your|the)\s+(.+?)[\.\,\!\?\s]/
    ];

    for (const pattern of negativePatterns) {
        const match = lower.match(pattern);
        if (match) {
            const mentioned = match[1].trim();
            for (const [keyword, partId] of Object.entries(bodyPartKeywords)) {
                if (mentioned.includes(keyword)) {
                    const el = document.getElementById(partId);
                    if (el && !el.classList.contains("active-pain")) {
                        const currentPain = parseInt(painSlider.value);
                        el.classList.add("active-pain");
                        el.style.setProperty("--pain-intensity", String(currentPain / 10));
                        activePainAreas.set(partId, currentPain);

                        liveHud.innerText = "⚙️ Heatmap synced: " + el.dataset.label + " flagged from AI context";
                        setHudSafeStyle();
                        liveHud.style.display = "block";
                    }
                    break;
                }
            }
            break; // Only process first match
        }
    }
}

// =============================================
// RECOVERY TRACKING — Parse "feels better"
// =============================================
function checkRecoveryInChat(text) {
    const lower = text.toLowerCase();
    const recoveryPhrases = ["feels better", "stopped hurting", "no more pain", "healed", "not hurting"];

    const hasRecovery = recoveryPhrases.some(p => lower.includes(p));
    if (!hasRecovery) return;

    const bodyPartMap = {
        "head": "part-head",
        "chest": "part-chest",
        "abdomen": "part-abdomen",
        "stomach": "part-abdomen",
        "left arm": "part-arm-left",
        "right arm": "part-arm-right",
        "left leg": "part-leg-left",
        "right leg": "part-leg-right",
        "arm": "part-arm-left",
        "leg": "part-leg-left"
    };

    for (const [keyword, partId] of Object.entries(bodyPartMap)) {
        if (lower.includes(keyword)) {
            const el = document.getElementById(partId);
            if (el && el.classList.contains("active-pain")) {
                el.classList.remove("active-pain");
                el.style.setProperty("--pain-intensity", "0");
                el.style.filter = "";
                activePainAreas.delete(partId);
                liveHud.innerText = "✓ Recovery: " + el.dataset.label + " pain cleared";
                setHudSafeStyle();
                liveHud.style.display = "block";
                setTimeout(() => { if (!activePainAreas.size) liveHud.style.display = "none"; }, 4000);
            }
        }
    }
}

// =============================================
// VITALS TRIAGE LOGIC — Hard-Coded Escalation
// =============================================
vitalsForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const pain = parseInt(painSlider.value);
    const hasFever = feverToggle.checked;
    const hasBleeding = bleedingToggle.checked;
    const isCritical = hasFever || hasBleeding || pain > 7;

    vitalsStatus.style.display = "block";

    if (isCritical) {
        triggerCriticalAlert();
        vitalsStatus.className = "vitals-status danger";
        let reasons = [];
        if (pain > 7) reasons.push("Pain level " + pain + "/10");
        if (hasFever) reasons.push("Fever > 101°F");
        if (hasBleeding) reasons.push("Severe bleeding/swelling");
        vitalsStatus.innerHTML = "⚠️ CRITICAL — " + reasons.join(", ") + ". Seek medical attention immediately.";
    } else {
        vitalsStatus.className = "vitals-status safe";
        vitalsStatus.innerHTML = "✓ Vitals logged safely. All readings within normal range.";
    }

    addLogEntry(pain, hasFever, hasBleeding, isCritical);
    setTimeout(() => { vitalsStatus.style.display = "none"; }, 8000);
});

// ---- Submission Log ----
function addLogEntry(pain, fever, bleeding, critical) {
    const emptyMsg = vitalsLog.querySelector(".log-empty");
    if (emptyMsg) emptyMsg.remove();

    const entry = document.createElement("div");
    entry.className = "log-entry";
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    entry.innerHTML = `
        <span>Pain: ${pain}/10${fever ? " · Fever" : ""}${bleeding ? " · Bleeding" : ""}</span>
        <span class="log-time">${time}</span>
        <span class="log-result ${critical ? "critical" : "safe"}">${critical ? "CRITICAL" : "OK"}</span>
    `;
    vitalsLog.insertBefore(entry, vitalsLog.firstChild);
}

// =============================================
// CRITICAL ALERT STATE
// =============================================
function triggerCriticalAlert() {
    document.body.classList.add("critical-alert");
    badgeText.textContent = "Emergency Escalation Active";
}

function dismissCriticalAlert() {
    document.body.classList.remove("critical-alert");
    badgeText.textContent = "Medical Guardrails Active";
}

dismissBanner.addEventListener("click", dismissCriticalAlert);

// =============================================
// ALERT CAREGIVER
// =============================================
alertCaregiverBtn.addEventListener("click", () => {
    const pain = painSlider.value;
    const now = new Date();
    const timestamp = now.toLocaleString();
    const areas = getActivePainList().join(", ") || "None specified";

    const subject = encodeURIComponent("RecoverEase Alert: Immediate ER Escalation Advised");
    const body = encodeURIComponent(
        `RecoverEase Alert: Patient reports Pain Level ${pain}. ` +
        `Active areas: ${areas}. ` +
        `Immediate ER escalation advised. - Generated at ${timestamp}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
});

// =============================================
// GENERATE CAREGIVER REPORT
// =============================================
generateReportBtn.addEventListener("click", () => {
    const pv = painSlider.value;
    const areas = getActivePainList().join("\n• ") || "None";
    const day = recoveryDay.value;

    document.getElementById("modal-telemetry-text").innerText =
        "Recovery Day: " + day + "\nPain Level: " + pv + "/10\n\nActive Areas:\n• " + areas + "\n\nEmergency Protocol: " + (document.body.classList.contains("critical-alert") ? "ACTIVE" : "Inactive");
    document.getElementById("apple-modal-overlay").classList.add("active");
});

document.getElementById("modal-close-btn").addEventListener("click", () => {
    document.getElementById("apple-modal-overlay").classList.remove("active");
});

// =============================================
// MEDICATION TRACKER
// =============================================
document.querySelectorAll(".med-checkbox").forEach(cb => {
    cb.addEventListener("change", () => { /* CSS handles visual */ });
});

// =============================================
// CHAT ENGINE — Groq API
// =============================================
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text || isChatProcessing) return;
    handleChatMessage(text);
});

async function handleChatMessage(text) {
    isChatProcessing = true;
    chatInput.value = "";
    chatInput.disabled = true;
    chatSend.disabled = true;

    const welcome = chatMessages.querySelector(".chat-welcome");
    if (welcome) welcome.remove();

    appendChatBubble("user", text);

    // Check for recovery keywords
    checkRecoveryInChat(text);

    // Increment message count
    messageCount++;

    typingIndicator.style.display = "block";
    scrollChat();

    try {
        const response = await callGroqAPI(text);
        typingIndicator.style.display = "none";

        const { displayText, isEmergency } = parseResponse(response);

        if (isEmergency) {
            triggerCriticalAlert();
        }

        appendChatBubble("assistant", displayText, isEmergency);

        // Sync heatmap with AI conversation context
        updateHeatmapFromContext(displayText);

        // AI PROACTIVITY: Every 3rd message, ask about a highlighted area
        if (messageCount % 3 === 0 && activePainAreas.size > 0) {
            const firstActiveId = activePainAreas.keys().next().value;
            const el = document.getElementById(firstActiveId);
            if (el) {
                const proactiveMsg = "💡 By the way — how is your " + el.dataset.label.toLowerCase() + " feeling now? Any improvement since you last reported?";
                setTimeout(() => {
                    appendChatBubble("assistant", proactiveMsg);
                }, 1200);
            }
        }

    } catch (error) {
        typingIndicator.style.display = "none";
        appendChatBubble("assistant", getErrorMessage(error));
    }

    isChatProcessing = false;
    chatInput.disabled = false;
    chatSend.disabled = false;
    chatInput.focus();
}

// ---- Groq API ----
async function callGroqAPI(userInput) {
    const activeAreas = getActivePainList();
    const areasStr = activeAreas.length > 0 ? activeAreas.join(", ") : "None reported";
    const dynamicContext = `Context: Patient is on Day ${recoveryDay.value} of recovery. Affected areas: ${areasStr}. Tone: Warm, Apple-standard, non-diagnostic.`;

    const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            messages: [
                { role: "system", content: SYSTEM_PROMPT + "\n\n" + dynamicContext },
                { role: "user", content: userInput }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.2
        })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `API Error: ${res.status}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
}

// ---- Response Parser ----
function parseResponse(rawText) {
    const TAG = "[EMERGENCY]";
    const isEmergency = rawText.includes(TAG);
    const displayText = rawText.replace(TAG, "").trim();
    return { displayText, isEmergency };
}

// ---- Render Chat Bubble ----
function appendChatBubble(role, text, isEmergency = false) {
    const row = document.createElement("div");
    row.className = `msg-row ${role}`;

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";

    if (isEmergency && role === "assistant") {
        bubble.classList.add("emergency-bubble");
    }

    bubble.textContent = text;
    row.appendChild(bubble);
    chatMessages.appendChild(row);
    scrollChat();
}

function scrollChat() {
    requestAnimationFrame(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

// ---- Error Messages ----
function getErrorMessage(error) {
    if (GROQ_API_KEY === "YOUR_KEY_HERE") {
        return "⚠️ Set your Groq API key in script.js to enable the chat. Get one at console.groq.com.";
    }
    if (error.message.includes("400")) return "⚠️ Invalid request. Check your API key.";
    if (error.message.includes("403")) return "⚠️ API key unauthorized. Check permissions.";
    if (error.message.includes("429")) return "⚠️ Rate limited. Wait and retry.";
    return "⚠️ " + error.message;
}

// =============================================
// PAPERCLIP — Simulated Upload
// =============================================
document.getElementById("paperclip-btn").addEventListener("click", () => {
    alert("Upload Discharge Papers — This feature will allow you to upload and reference your discharge documents. Coming soon.");
});

// =============================================
// MIC — Voice-to-Text Accessibility
// =============================================
document.getElementById("mic-btn").addEventListener("click", () => {
    alert("Voice-to-Text — This accessibility feature will allow recovering patients to speak their questions. Coming soon.");
});
