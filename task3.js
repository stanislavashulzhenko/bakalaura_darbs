let questions = [];
let currentQ = 0;
let totalScore = 0;
let userAnswers = [];
let questionFeedbacks = [];
let defenseRecognition = null;

function startDefenseSim() {

    clearScreen();

    const savedPresentation =
        JSON.parse(localStorage.getItem("presentationParts")) || null;

    let savedInfoHTML = "";

    if (savedPresentation) {

        const partsList = Object.keys(savedPresentation)
            .map(p => `<li>${p}</li>`)
            .join("");

        savedInfoHTML = `
            <div class="box">
                <h3>Saglabātā prezentācija atrasta</h3>

                <p>
                    Sistēma atrada prezentāciju no 2. uzdevuma.
                </p>

                <p>
                    Jautājumi var tikt ģenerēti,
                    balstoties uz iepriekš ievadīto prezentāciju.
                </p>

                <p><b>Atrastās daļas:</b></p>

                <ul>
                    ${partsList}
                </ul>

                <label>
                    <input type="checkbox" id="useSavedPresentation" checked>
                    Izmantot šo prezentāciju jautājumu ģenerēšanai
                </label>
            </div>
        `;
    }

    document.getElementById("app").innerHTML = `

        <h2>3. uzdevums: Aizstāvēšanas simulācija</h2>

        <div class="box">
            <h3>Uzdevuma mērķis</h3>

            <p>
                Šī uzdevuma mērķis ir simulēt reālu
                zinātniska darba aizstāvēšanu.
            </p>

            <p>
                Sistēma ģenerēs komisijas jautājumus,
                analizēs tavas atbildes un sniegs novērtējumu.
            </p>
        </div>

        <div class="box">
            <h3>Kas būs jādara?</h3>

            <ol>
                <li>Ievadi informāciju par savu darbu vai izmanto iepriekšējo prezentāciju.</li>

                <li>
                    Sistēma ģenerēs dažādas sarežģītības jautājumus:
                    <ul>
                        <li>vieglus,</li>
                        <li>vidējus,</li>
                        <li>sarežģītus.</li>
                    </ul>
                </li>

                <li>
                    Atbildi uz jautājumiem noteiktā laikā.
                </li>

                <li>
                    Pēc katras atbildes saņemsi novērtējumu un ieteikumus.
                </li>
            </ol>
        </div>

        ${savedInfoHTML}

        <div class="box">

            <h3>Darba informācija</h3>

            <input id="topic"
                placeholder="Darba tēma"
                style="width:100%; margin-bottom:10px;">

            <textarea id="structure"
                placeholder="Darba struktūra"
                rows="4"
                style="width:100%; margin-bottom:10px;"></textarea>

            <textarea id="transcript"
                placeholder="Īss darba apraksts"
                rows="6"
                style="width:100%;"></textarea>

        </div>

        <br>

        <button class="green" onclick="generateQuestions()">
            Sākt simulāciju
        </button>

        <br><br>

        <button onclick="chooseMode()">⬅ Atpakaļ</button>
    `;

    if (savedPresentation) {

        const checkbox =
            document.getElementById("useSavedPresentation");
        const structureField =
            document.getElementById("structure");
        const transcriptField =
            document.getElementById("transcript");

        function fillSavedPresentation() {
            if (checkbox.checked) {
                const combinedText = Object.entries(savedPresentation)
                    .map(([part, text]) => `${part}: ${text}`)
                    .join("\n\n");
                structureField.value =
                    Object.keys(savedPresentation).join(", ");
                transcriptField.value =
                    combinedText;

            } else {

                structureField.value = "";
                transcriptField.value = "";
            }
        }
        fillSavedPresentation();
        checkbox.addEventListener("change", fillSavedPresentation);
    }
}

async function generateQuestions() {
    const topic = document.getElementById("topic").value.trim();
    const structure = document.getElementById("structure").value.trim();
    const transcript = document.getElementById("transcript").value.trim();

    const useSaved =
    document.getElementById("useSavedPresentation")?.checked;

    let savedPresentation = null;

    if (useSaved) {
        savedPresentation =
            JSON.parse(localStorage.getItem("presentationParts")) || {};
    }

    if (!topic) {
        alert("Ievadi prezentācijas nosaukumu!");
        return;
    }

    if (!structure || !transcript) {
        alert("Aizpildi prezentācijas informāciju!");
        return;
    }

    document.getElementById("app").innerHTML = `<p>Ģenerē jautājumus...</p>`;

    try {
        const response = await fetch("https://prezentacija-pr.onrender.com/generate-questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                topic,
                structure,
                transcript,
                savedPresentation
            })
        });

        if (!response.ok) throw new Error("Servera kļūda: " + response.status);

        const data = await response.json();

        if (!data.questions || data.questions.length === 0) {
            alert("Neizdevās ģenerēt jautājumus. Mēģini vēlreiz.");
            startDefenseSim();
            return;
        }

        questions = data.questions.map(q => `[${q.level}] ${q.text}`);
        currentQ = 0;
        totalScore = 0;
        showQuestion();

    } catch (e) {
        alert("Kļūda sazinoties ar serveri. Vai serveris darbojas?\n(node server.js)");
        console.error(e);
        startDefenseSim();
    }
}

async function fetchWithRetry(url, options, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        const response = await fetchWithRetry(
            "https://prezentacija-pr.onrender.com/generate-questions",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic, structure, transcript })
            }
        );

        if (response.ok) return response;

        if (response.status === 503) {
            console.log(`Retry ${i + 1}/${retries}...`);
            await new Promise(r => setTimeout(r, delay));
            continue;
        }

        throw new Error("Server error: " + response.status);
    }

    throw new Error("Service still unavailable after retries");
}

function startDefenseVoiceInput() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Pārlūkprogramma neatbalsta balss ievadi");
        return;
    }

    if (defenseRecognition) {
        defenseRecognition.stop();
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "lv-LV";
    recognition.continuous = true;
    recognition.interimResults = true;

    const textarea = document.getElementById("answer");
    const status = document.getElementById("voiceStatus");

    let finalText = textarea.value || "";

    recognition.onstart = () => {
        status.innerText = "Ieraksta...";
    };

    recognition.onresult = (event) => {

        let interim = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {

            const transcript =
                event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                finalText += transcript + " ";
            } else {
                interim += transcript;
            }
        }

        textarea.value = finalText + interim;
    };

    recognition.onerror = () => {
        status.innerText = "Kļūda";
    };

    recognition.onend = () => {

        if (defenseRecognition) {
            try {
                recognition.start();
            } catch {}
        }
    };

    defenseRecognition = recognition;
    recognition.start();
}

function stopDefenseVoiceInput() {

    const status =
        document.getElementById("voiceStatus");

    if (defenseRecognition) {
        defenseRecognition.stop();
        defenseRecognition = null;
    }

    if (status) {
        status.innerText = "Apturēts";
    }
}

function showQuestion() {
    if (currentQ >= questions.length) {
        showFinalResult();
        return;
    }

    const questionText = questions[currentQ];
    const lowerQuestion = questionText.toLowerCase();

    let time = 60;

    if (lowerQuestion.includes("[medium]")) {
        time = 90;
    }

    if (lowerQuestion.includes("[hard]")) {
        time = 120;
    }

    document.getElementById("app").innerHTML = `
        <h3>Jautājums ${currentQ + 1} no ${questions.length}</h3>
        <p style="
            font-size:14px;
            opacity:0.7;
            margin-bottom:8px;
        ">
            Sarežģītība:
                ${
                    lowerQuestion.includes("[hard]")
                        ? "Sarežģīta"
                        : lowerQuestion.includes("[medium]")
                            ? "Vidēja"
                            : "Viegla"
                }
        </p>

        <p>
            ${questionText
                .replace(/\[easy\]/gi, "")
                .replace(/\[medium\]/gi, "")
                .replace(/\[hard\]/gi, "")}
        </p>

        <div>Laiks: <span id="timer">${time}</span>s</div>

        <textarea id="answer" rows="5" cols="50" placeholder="Tava atbilde..."></textarea><br><br>

        <div style="
            display:flex;
            gap:10px;
            flex-wrap:wrap;
            margin-bottom:10px;
        ">
            <button onclick="startDefenseVoiceInput()">
                Ierakstīt
            </button>

            <button onclick="stopDefenseVoiceInput()">
                Apturēt
            </button>

            <span id="voiceStatus"
                style="
                    font-size:12px;
                    align-self:center;
                    opacity:0.7;
                ">
            </span>
        </div>

        <button onclick="submitAnswer()">Iesniegt</button>
    `;

    const interval = setInterval(() => {
        time--;
        const timerEl = document.getElementById("timer");
        if (timerEl) timerEl.innerText = time;

        if (time <= 0) {
            clearInterval(interval);
            submitAnswer();
        }
    }, 1000);

    window._defenseInterval = interval;
}

async function submitAnswer() {

    if (window._defenseInterval) {
        clearInterval(window._defenseInterval);
        window._defenseInterval = null;
    }

    stopDefenseVoiceInput();
    await new Promise(resolve =>
        setTimeout(resolve, 500)
    );

    const answerEl = document.getElementById("answer");
    const answer =
        answerEl
            ? answerEl.value.trim()
            : "";

    userAnswers.push({
        question: questions[currentQ],
        answer: answer || "(nav atbildes)"
    });
    currentQ++;
    showQuestion();
}

// http://localhost:3000
// https://prezentacija-pr.onrender.com
async function showFinalResult() {
    document.getElementById("app").innerHTML = `<p>Analizē visas atbildes...</p>`;

    try {
        const response = await fetch("https://prezentacija-pr.onrender.com/analyze-defense", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers: userAnswers })
        });

        const result = await response.json();

        totalScore = result.totalScore || 0;
        questionFeedbacks = result.results || [];

        const avg = questionFeedbacks.length > 0
                ? Math.round(totalScore / questionFeedbacks.length)
                : 0;

        let users = loadUsers();
        let user = users[currentUserId];

        user.score += avg;
        user.progress_history.push(avg / 100);
        user.t3_count = (user.t3_count || 0) + 1;

        saveTask3History(
            user,
            userAnswers,
            questionFeedbacks
        );
        saveUsers(users);

        checkAchievements({
            task: 3,
            score: avg,
            allScoresAbove70: questionFeedbacks.every(r => r.score >= 70),
            totalCommissions: user.t3_count
        });

        let feedbackHTML = questionFeedbacks.map((r, i) => `
            <div class="box">
                <h3>Jautājums ${i + 1}</h3>
                <p><b>${r.question}</b></p>
                <p><b>Punkti:</b> ${r.score}/100</p>
                <ul>
                    ${r.feedback.map(f => `<li>${f}</li>`).join("")}
                </ul>
            </div>
        `).join("");

        document.getElementById("app").innerHTML = `
            <h2>Simulācija pabeigta!</h2>
            <div class="box">
                <p><b>Vidējais vērtējums:</b> ${avg}/100</p>
            </div>
            ${feedbackHTML}
            <br>
            <button onclick="chooseMode()">Galvenais ekrāns</button>
        `;

    } catch (e) {
        console.error(e);
        alert("Kļūda analizējot atbildes");
        chooseMode();
    }
}

function saveTask3History(user, userAnswers, questionFeedbacks) {

    if (!user.task3History) {
        user.task3History = [];
    }

    const historyItems = questionFeedbacks.map((result, index) => {

        const userData = userAnswers[index];

        return {
            date: new Date().toLocaleString(),

            question: userData.question,

            answer: userData.answer,

            score: result.score,

            feedback: result.feedback
        };
    });

    user.task3History.push(...historyItems);

    if (user.task3History.length > 10) {
        user.task3History =
            user.task3History.slice(-10);
    }
}