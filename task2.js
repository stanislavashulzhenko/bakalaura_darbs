let recognitions = {};
let finalTexts = {};
let speechTimers = {};

function loadTask2() {
    clearScreen();
    const app = document.getElementById("app");

    app.innerHTML = `
        <h2>2. uzdevums: Prezentācijas simulācija</h2>

        <div class="box">
            <h3>Uzdevuma mērķis</h3>

            <p>
                Šī uzdevuma mērķis ir palīdzēt studentam sagatavoties
                zinātniskā darba aizstāvēšanai.
            </p>

            <p>
                Sistēma analizē prezentācijas saturu, loģiku,
                argumentāciju un runas kvalitāti, izmantojot mākslīgā intelekta analīzi.
            </p>
        </div>

        <div class="box">
            <h3>Kas būs jādara?</h3>

            <ol>
                <li>
                    Izvēlies prezentācijas daļas,
                    kuras ir tavā zinātniskajā darba prezentācijā.
                </li>

                <li>
                    Katrā sadaļā nepieciešams ierakstīt
                    vai pateikt savu prezentācijas runu -
                    tieši to tekstu, ko tu teiktu aizstāvēšanas laikā.
                </li>

                <li>
                    Vari izmantot:
                    <ul>
                        <li>teksta ievadi ar tastatūru,</li>
                        <li>vai balss ievadi, imitējot reālu prezentāciju.</li>
                    </ul>
                </li>

                <li>
                    Ja tiek izmantota balss ievade,
                    sistēma papildus analizēs laika sadalījumu
                    starp prezentācijas daļām.
                </li>

                <li>
                    Pēc analīzes saņemsi:
                    <ul>
                        <li>punktu skaitu,</li>
                        <li>ieteikumus uzlabošanai,</li>
                        <li>“ūdens” līmeņa novērtējumu,</li>
                        <li>runas struktūras analīzi.</li>
                    </ul>
                </li>
            </ol>
        </div>

        <div class="box">
            <h3>Svarīgi</h3>

            <p>
                Balss atpazīšana var kļūdīties,
                īpaši ar tehniskiem vai angļu valodas terminiem.
            </p>

            <p>
                Pirms analīzes ieteicams pārbaudīt un nepieciešamības gadījumā manuāli izlabot tekstu.
            </p>
        </div>

        <div class="box">
            <h3>Izvēlies prezentācijas daļas</h3>

            <p style="font-size: 12px; opacity: 0.7;">
                (Ieteicamās daļas jau ir atlasītas)
            </p>

            <label><input type="checkbox" value="Ievads" checked> Ievads</label><br>

            <label><input type="checkbox" value="Pētījuma mērķis un uzdevumi">
            Pētījuma mērķis un uzdevumi</label><br>

            <label><input type="checkbox" value="Literatūras apskats">
            Literatūras apskats</label><br>

            <label><input type="checkbox" value="Metodoloģija" checked>
            Metodoloģija</label><br>

            <label><input type="checkbox" value="Sistēmas apraksts">
            Sistēmas / risinājuma apraksts</label><br>

            <label><input type="checkbox" value="Eksperimenti">
            Eksperimenti / testēšana</label><br>

            <label><input type="checkbox" value="Rezultāti" checked>
            Rezultāti</label><br>

            <label><input type="checkbox" value="Secinājumi" checked>
            Secinājumi</label><br>

            <label><input type="checkbox" value="Nākotnes darbi">
            Nākotnes darbi</label><br>
        </div>

        <br>

        <button class="green" onclick="generateInputs()">
            Sākt uzdevumu
        </button>

        <br><br>

        <button onclick="chooseMode()">⬅ Atpakaļ</button>
    `;
}

function startVoiceInput(textareaId) {

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Pārlūkprogramma neatbalsta balss ievadi");
        return;
    }

    if (recognitions[textareaId]) {
        recognitions[textareaId].stop();
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "lv-LV";
    recognition.interimResults = true;
    recognition.continuous = true;

    const textarea = document.getElementById(textareaId);
    const status = document.getElementById(`status-${textareaId}`);

    recognitions[textareaId] = recognition;
    finalTexts[textareaId] = textarea.value || "";

    status.innerText = "Ieraksta...";

    if (!speechTimers[textareaId]) {
        speechTimers[textareaId] = {
            total: 0,
            startedAt: null
        };
    }
    speechTimers[textareaId].startedAt = Date.now();

    recognition.start();

    recognition.onresult = function (event) {

        let interimText = "";
        let finalText = finalTexts[textareaId];

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                finalText += transcript + " ";
            } else {
                interimText += transcript;
            }
        }

        finalTexts[textareaId] = finalText;
        textarea.value = finalText + interimText;
    };

    recognition.onerror = function () {
        status.innerText = "Kļūda";
    };

    recognition.onend = function () {
        if (recognitions[textareaId]) {
            try {
                recognition.start();
            } catch {}
        }
    };
}

function stopVoiceInput(textareaId) {
    const recognition = recognitions[textareaId];
    const status = document.getElementById(`status-${textareaId}`);

    if (recognition) {
        if (speechTimers[textareaId]?.startedAt) {
            speechTimers[textareaId].total +=
                Date.now() - speechTimers[textareaId].startedAt;

            speechTimers[textareaId].startedAt = null;
        }
        recognition.stop();
        delete recognitions[textareaId];
    }

    status.innerText = "Apturēts";
}

function generateInputs() {

    const app = document.getElementById("app");

    const selected = Array.from(document.querySelectorAll("input[type=checkbox]:checked"))
        .map(cb => cb.value);

    if (selected.length === 0) {
        alert("Izvēlies vismaz vienu daļu!");
        return;
    }

    let inputsHTML = selected.map(part => {
        const safeId = part.replace(/\s+/g, "_");

    const descriptions = {

        "Ievads": {
            text:
                "Pastāsti par tēmas aktualitāti, problēmu un darba nozīmīgumu. Īsi iepazīstini ar tēmu un paskaidro, kāpēc tā ir svarīga.",
            volume:
                "Ieteicamais apjoms: ~4-6 teikumi vai 30-60 sekundes."
        },

        "Pētījuma mērķis un uzdevumi": {
            text:
                "Nosauc darba mērķi, galvenos uzdevumus un ko plānots sasniegt pētījumā. Formulē skaidri un konkrēti.",
            volume:
                "Ieteicamais apjoms: ~3-5 teikumi vai 20-40 sekundes."
        },

        "Literatūras apskats": {
            text:
                "Apraksti izmantotos avotus, līdzīgus pētījumus un teorētisko pamatojumu.",
            volume:
                "Ieteicamais apjoms: ~4-7 teikumi vai 40-70 sekundes."
        },

        "Metodoloģija": {
            text:
                "Paskaidro izmantotās metodes, tehnoloģijas, rīkus vai datu iegūšanas pieeju.",
            volume:
                "Ieteicamais apjoms: ~5-8 teikumi vai 40-80 sekundes."
        },

        "Sistēmas apraksts": {
            text:
                "Apraksti izstrādāto sistēmu, tās funkcionalitāti un galvenās iespējas.",
            volume:
                "Ieteicamais apjoms: ~6-10 teikumi vai 1-2 minūtes."
        },

        "Eksperimenti": {
            text:
                "Pastāsti par testēšanu, eksperimentiem un to norisi.",
            volume:
                "Ieteicamais apjoms: ~4-7 teikumi vai 40-70 sekundes."
        },

        "Rezultāti": {
            text:
                "Parādi galvenos rezultātus, iegūtos datus un to interpretāciju.",
            volume:
                "Ieteicamais apjoms: ~5-8 teikumi vai 1-2 minūtes."
        },

        "Secinājumi": {
            text:
                "Apkopojiet galvenos secinājumus un paskaidro, vai tika sasniegts darba mērķis.",
            volume:
                "Ieteicamais apjoms: ~4-6 teikumi vai 30-60 sekundes."
        },

        "Nākotnes darbi": {
            text:
                "Pastāsti, kā darbu vai sistēmu varētu uzlabot nākotnē.",
            volume:
                "Ieteicamais apjoms: ~2-5 teikumi vai 20-40 sekundes."
        }
    };

        return `
            <div class="box">
                <p><b>${part}</b></p>

                <p style="
                    font-size:13px;
                    opacity:0.85;
                    margin-bottom:4px;
                ">
                    ${descriptions[part]?.text || ""}
                </p>

                <p style="
                    font-size:12px;
                    opacity:0.65;
                    font-style:italic;
                    margin-top:0;
                    margin-bottom:12px;
                ">
                    ${descriptions[part]?.volume || ""}
                </p>

                <textarea id="${safeId}" data-original="${part}" 
                    rows="8" style="width: 100%; resize: vertical;"></textarea>

                <br>
                <button onclick="startVoiceInput('${safeId}')">Ierakstīt</button>
                <button onclick="stopVoiceInput('${safeId}')">Apturēt</button>

                <span id="status-${safeId}" style="margin-left:10px; font-size:12px;"></span>
            </div>
        `;
    }).join("");

    app.innerHTML = `
        <div style="
            background: #fff3cd;
            color: #856404;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-size: 14px;
        ">
            Balss atpazīšana var kļūdīties. Pārbaudi tekstu!
        </div>

        <h3>Prezentācijas simulācija</h3>

        ${inputsHTML}

        <br>

        <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="green" onclick="analyzeDynamic()">
                Analizēt
            </button>

            <button onclick="loadTask2()">
                ⬅ Atpakaļ
            </button>
        </div>
        
    `;
}

async function fetchWithRetry(url, options, retries = 3) {

    for (let i = 0; i < retries; i++) {

        try {

            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error("Server error");
            }

            return response;

        } catch (error) {

            console.log(`Mēģinājums ${i + 1} neizdevās`);

            if (i === retries - 1) {
                throw error;
            }

            await new Promise(resolve =>
                setTimeout(resolve, 3000)
            );
        }
    }
}

async function analyzeDynamic() {
    const textareas = document.querySelectorAll("textarea");

    let parts = {};

    textareas.forEach(t => {
        if (!t.value || t.value.length < 5) {
            alert("Aizpildi visas daļas!");
            throw new Error("Empty field");
        }

        const originalName = t.dataset.original;
        parts[originalName] = t.value;
    });

    let timeDistribution = {};
    let totalTime = 0;

    Object.entries(speechTimers).forEach(([id, data]) => {
        totalTime += data.total;
    });

    Object.entries(speechTimers).forEach(([id, data]) => {
        const textarea = document.getElementById(id);

        if (!textarea) return;

        const partName = textarea.dataset.original;

        const percent = totalTime > 0
            ? ((data.total / totalTime) * 100).toFixed(1)
            : 0;

        timeDistribution[partName] = {
            ms: data.total,
            percent
        };
    });

    let timeFeedback = [];

Object.entries(timeDistribution).forEach(([partName, data]) => {

    const percent = parseFloat(data.percent);

    if (partName === "Ievads" && percent > 40) {
        timeFeedback.push(
            "Ievads aizņem pārāk daudz prezentācijas laika."
        );
    }
    if (partName === "Secinājumi" && percent < 10) {
        timeFeedback.push(
            "Secinājumi ir pārāk īsi."
        );
    }
    if (partName === "Rezultāti" && percent < 15) {
        timeFeedback.push(
            "Rezultātu sadaļai vajadzētu veltīt vairāk laika."
        );
    }
});

    showLoader();
// http://localhost:3000
// https://prezentacija-pr.onrender.com
    try {
        const response = await fetch("https://prezentacija-pr.onrender.com/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ parts })
        });

        const result = await response.json();

        checkAchievements({
            task: 2,
            score: parseInt(result.totalScore),
            timeFeedbackLength: timeFeedback.length,
            hasTimingData: Object.keys(timeDistribution).length > 0
        });

        localStorage.setItem(
            "presentationParts",
            JSON.stringify(parts)
        );

        hideLoader();
        result.timeDistribution = timeDistribution;
        result.timeFeedback = timeFeedback;
        saveTask2History(parts, result);
        saveAnalysisResult(result);
        showResultAnalyzis(result);

    } catch (e) {
        hideLoader();
        alert("Serveris pašlaik startējas vai nav pieejams. Lūdzu, mēģini vēlreiz pēc dažām sekundēm.");
    }
}



function showLoader() {
    const loader = document.createElement("div");
    loader.id = "loader";
    loader.innerHTML = `<div class="spinner"></div>`;
    document.body.appendChild(loader);
}

function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.remove();
}

async function analyzePresentation() {
    const intro = document.getElementById("intro").value;
    const body = document.getElementById("body").value;
    const conclusion = document.getElementById("conclusion").value;

    if (!intro || !body || !conclusion) {
        alert("Aizpildi visas prezentācijas daļas!");
        return;
    }

    showLoader();

    try {
        const response = await fetch("https://prezentacija-pr.onrender.com/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                parts: {
                    intro,
                    body,
                    conclusion
                }
            })
        });

        const result = await response.json();

        hideLoader(); 
        result.timeDistribution = timeDistribution;
        result.timeFeedback = timeFeedback;
        saveTask2History(parts, result);
        saveAnalysisResult(result);
        showResultAnalyzis(result);

    } catch (e) {
        hideLoader(); 
        alert("Servera kļūda!");
        console.error(e);
    }
}

function saveAnalysisResult(result) {
    let users = loadUsers();
    let user = users[currentUserId];

    let newScore = parseInt(result.totalScore) || 0;
    user.score += newScore;

    saveUsers(users);
}

function showResultAnalyzis(result) {
    const app = document.getElementById("app");

    function renderPart(partName, partData) {
        if (!partData) return "";

        return `
            <div class="box">
                <h4>${partName}</h4>
                <p><b>Punkti:</b> ${partData.score}</p>
                <p><b>Ūdens līmenis:</b> ${partData.fillerLevel}</p>
                <ul>
                    ${partData.feedback.map(f => `<li>${f}</li>`).join("")}
                </ul>
            </div>
        `;
    }

    app.innerHTML = `
        <h3>Rezultāts</h3>

        ${Object.entries(result.parts || {})
            .map(([name, data]) => renderPart(name, data))
            .join("")}

        <div class="box">
            <h3>Kopējais rezultāts</h3>
            <p><b>Punkti:</b> ${result.totalScore}</p>
            <p><b>Kopējais vērtējums:</b> ${result.summary}</p>
        </div>

        ${Object.keys(result.timeDistribution || {}).length > 0 ? `
            <div class="box">
                <h3>Laika sadalījums</h3>

                ${Object.entries(result.timeDistribution || {})
                    .map(([name, data]) => `
                        <p style="margin-bottom:10px;">
                            <b>${name}</b>:
                            ${data.percent}% 
                            (${Math.round(data.ms / 1000)} s)
                        </p>
                    `).join("")}
            </div>
        ` : ""}
        
        ${(result.timeFeedback || []).length > 0 ? `
            <div class="box">
                <h3>Laika sadalījuma ieteikumi</h3>

                <ul>
                    ${result.timeFeedback
                        .map(f => `<li>${f}</li>`)
                        .join("")}
                </ul>
            </div>
        ` : ""}

        <br>
        <button onclick="chooseMode()">Turpināt</button>
    `;
}

function saveTask2History(parts, result) {

    let users = loadUsers();
    let user = users[currentUserId];

    if (!user.task2History) {
        user.task2History = [];
    }

    user.task2History.push({
        date: new Date().toLocaleString(),

        parts: parts,

        totalScore: result.totalScore,

        summary: result.summary
    });

    saveUsers(users);
}
