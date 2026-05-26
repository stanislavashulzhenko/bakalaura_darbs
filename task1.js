let currentTaskIndex = 0;
let levelDifficulty = "easy"; // easy, medium, hard
let selectedLevel = null;
let sessionStats = { 
    errors: {}, 
    startTime: 0,
    earnedTotal: 0,
    maxTotal: 0
};
let currentTaskVariant = null; 
let showExplanations = false;
let levelProgress = {
    easy: { rounds: 0, success: 0, unlocked: true },
    medium: { rounds: 0, success: 0, unlocked: false },
    hard: { rounds: 0, success: 0, unlocked: false }
};

const partExplanations = {
    "Ievads": "Šeit tu pasaki, par ko ir darbs, kāpēc tas ir svarīgi un ko tu gribi noskaidrot (mērķis, problēma, hipotēze).",
    "Metodoloģija": "Šeit apraksti, kā tu veici pētījumu: kādi rīki, kādi dati un kā notika darba process.",
    "Rezultāti": "Šeit parādi faktus: ko tu ieguvi pētījumā (skaitļi, grafiki, novērojumi), bez interpretācijas.",
    "Secinājumi": "Šeit izskaidro, ko nozīmē rezultāti: vai mērķis tika sasniegts un ko no tā var mācīties.",
    "Teorija": "Šeit apkopo, ko citi pētnieki jau ir teikuši par šo tēmu un kāds ir zinātniskais pamats.",
    "Praktiskā daļa": "Šeit parādi, kā tu veidoji risinājumu: prototipu, eksperimentu vai testēšanas procesu.",
    "Nobeigums": "Šeit ir kopsavilkums un ieteikumi, ko var darīt tālāk."
};

const task1Data = {
    easy: [
        [
            { part: "Ievads", items: ["Pētījuma mērķis", "Kāpēc tēma ir svarīga"] },
            { part: "Metodoloģija", items: ["Kā tika veikts pētījums", "Kādi rīki tika izmantoti"] },
            { part: "Rezultāti", items: ["Ko mēs ieguvām", "Datu piemēri"] },
            { part: "Secinājumi", items: ["Galvenie secinājumi"] }
        ],
        [
            { part: "Ievads", items: ["Par ko ir pētījums", "Kāda ir problēma"] },
            { part: "Metodoloģija", items: ["Ko mēs darījām", "Kā tika vākti dati"] },
            { part: "Rezultāti", items: ["Rezultātu attēlojums", "Svarīgākie rezultāti"] },
            { part: "Secinājumi", items: ["Ko nozīmē iegūtie rezultāti"] }
        ],
        [
            { part: "Ievads", items: ["Pētījuma tēma", "Pētījuma mērķis"] },
            { part: "Metodoloģija", items: ["Pētījuma soļi", "Izmantotās metodes"] },
            { part: "Rezultāti", items: ["Ko parāda dati", "Galvenie novērojumi"] },
            { part: "Secinājumi", items: ["Ko var secināt"] }
        ]
    ],

    medium: [
        [
            { part: "Ievads", items: ["Pētījuma jautājums", "Hipotēze"] },
            { part: "Teorija", items: ["Literatūras apskats", "Jēdzienu skaidrojums"] },
            { part: "Praktiskā daļa", items: ["Prototipa izstrāde", "Testēšanas plāns"] },
            { part: "Nobeigums", items: ["Priekšlikumi" ] }
        ],
        [
            { part: "Ievads", items: ["Ierobežojumi ievadā", "Pētījuma nozīme"] },
            { part: "Teorija", items: ["Modeļu salīdzinājums", "Teorētiskais ietvars"] },
            { part: "Praktiskā daļa", items: ["Eksperimenta dizains", "Izmēģinājumu rezultāti"] },
            { part: "Nobeigums", items: ["Turpmākie pētījumi", "Ietekme uz nozari"] }
        ],
        [
            { part: "Ievads", items: ["Pamatojums", "Zinātniski izaicinājumi"] },
            { part: "Teorija", items: ["Galvenās teorijas", "Kritika esošajai literatūrai"] },
            { part: "Praktiskā daļa", items: ["Datu apstrādes soļi", "Validācijas metodes"] },
            { part: "Nobeigums", items: ["Kopsavilkums praktiķiem"] }
        ]
    ],

    hard: [
        [
            { part: "Ievads", items: ["Kāpēc šī tēma ir sarežģīta", "Ko neizdevās atrast citos pētījumos"] },
            { part: "Metodoloģija", items: ["Kā tika vākti dati", "Kāpēc šī metode ir piemērota"] },
            { part: "Rezultāti", items: ["Galvenie skaitļu rādītāji", "Ko rāda diagrammas"] },
            { part: "Secinājumi", items: ["Kāpēc rezultāti ir ticami", "Kur rezultātus var izmantot"] }
        ],
        [
            { part: "Ievads", items: ["Neparedzētas grūtības pētījuma sākumā", "Hipotēzes precizējums"] },
            { part: "Metodoloģija", items: ["Izlases lieluma pamatojums", "Iespējamās kļūdas metodē"] },
            { part: "Rezultāti", items: ["Negaidīti atklājumi", "Kas apstiprinājās, kas ne"] },
            { part: "Secinājumi", items: ["Ierobežojumi, ko nevarēja novērst", "Ko darīt citādi nākamreiz"] }
        ],
        [
            { part: "Ievads", items: ["Pretrunas literatūrā", "Mūsu pētījuma unikālais pienesums"] },
            { part: "Metodoloģija", items: ["Kā tika nodrošināta precizitāte", "Problēmas datu vākšanā"] },
            { part: "Rezultāti", items: ["Svarīgākā atšķirība starp grupām", "Ko rezultāti neparāda"] },
            { part: "Secinājumi", items: ["Praktiski padomi citiem pētniekiem", "Kādi jautājumi palikuši neatbildēti"] }
        ]
    ]
};

function saveTask1Progress() {
    let users = loadUsers();
    if (users[currentUserId]) {
        users[currentUserId].task1Progress = {
            easy: levelProgress.easy,
            medium: levelProgress.medium,
            hard: levelProgress.hard
        };
        saveUsers(users);
        console.log("Progress saved for:", currentUserId);
    }
}

function loadTask1Progress() {
    let users = loadUsers();
    let user = users[currentUserId];
    
    if (user && user.task1Progress) {
        levelProgress.easy = user.task1Progress.easy || levelProgress.easy;
        levelProgress.medium = user.task1Progress.medium || levelProgress.medium;
        levelProgress.hard = user.task1Progress.hard || levelProgress.hard;
        console.log("Progress loaded:", levelProgress);
    }
}
function startGame() {
    loadTask1Progress();
    currentTaskIndex = 0;
    sessionStats = { 
        errors: {}, 
        startTime: 0,
        earnedTotal: 0,
        maxTotal: 0
    };
    selectedLevel = null;
    showTask1Intro();
}

function selectLevel(level) {

    if (!levelProgress[level].unlocked) return;

    if (selectedLevel === level) {
        selectedLevel = null;
    } else {
        selectedLevel = level;
    }

    showTask1Intro();
}

function showTask1Intro() {
    clearScreen();
    let app = document.getElementById("app");
    
    let displayLevel = selectedLevel;
    if (!displayLevel) {
        if (levelProgress.hard.unlocked) displayLevel = "hard";
        else if (levelProgress.medium.unlocked) displayLevel = "medium";
        else displayLevel = "easy";
    }

    app.innerHTML = `
        <div class="box intro-box">
            <h2>Uzdevums: Prezentācijas loģika</h2>
            <hr>
            <p><b>Mērķis:</b> Iemācīties pareizi strukturēt bakalaura darba prezentāciju, izvietojot elementus atbilstošajās sadaļās.</p>
            
            <div style="text-align: left; margin: 20px 0;">
                <p><b>Kas jādara?</b></p>
                <ul>
                    <li>Ekrāna augšpusē redzēsi dažādas frāzes vai tēmas.</li>
                    <li>Ar peli (Drag & Drop) aizvelc katru bloku uz pareizo prezentācijas daļu (piem., "Mērķis" -> "Ievads").</li>
                    <li>Sarežģītība: <span class="badge">${levelDifficulty.toUpperCase()}</span></li>
                </ul>
                
                <p><b>Vērtēšana:</b></p>
                <ul>
                    <li>Par katru pareizu izvēli saņemsi punktus.</li>
                    <li>Tiek mērīts arī izpildes laiks!</li>
                </ul>
            </div>

            <div style="margin-top:20px;">
                <h3 style="
                    background:#ffffff;
                    color:#222222;
                    padding:12px 16px;
                    border-radius:14px;
                    margin-bottom:20px;
                    border:1px solid #ffffff;
                    text-align:center;
                ">
                    Sarežģītības līmeņi
                </h3>

                <ul>
                    <li><b>Easy</b> - vienkārši uzdevumi ar pamata struktūru</li>
                    <li><b>Medium</b> - vidējas grūtības uzdevumi ar loģiku un analīzi</li>
                    <li><b>Hard</b> - sarežģīti uzdevumi ar kritisko domāšanu</li>
                </ul>

                <div style="
                    background:#f8f9fb;
                    border:1px solid #e2e6ec;
                    border-radius:16px;
                    padding:18px;
                    margin-top:20px;
                    text-align:left;
                ">

                    <h4 style="margin-top:0;">
                        Kā notiek līmeņu atbloķēšana?
                    </h4>

                    <p>
                        • Lai atbloķētu nākamo līmeni, jāizpilda
                         <b>4 raundi</b> veiksmīgi
                    </p>

                    <p style="white-space: nowrap; font-size: 15px;">
                        • Raunds skaitās veiksmīgs, ja iegūti vismaz 
                        <b>6/7 pareizu atbilžu</b> 
                    </p>

                </div>
            </div>

            <div style="margin-top:20px;">

                <h3 style="margin-bottom:18px;">
                    Sarežģītības progress
                </h3>

                <!-- EASY -->
                <div style="margin-bottom:16px; text-align:left;">

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        margin-bottom:6px;
                        font-size:14px;
                    ">
                        <span>Easy</span>
                        <span>${levelProgress.easy.success}/4</span>
                    </div>

                    <div style="
                        width:100%;
                        height:12px;
                        background:#e5e7eb;
                        border-radius:999px;
                        overflow:hidden;
                    ">
                        <div style="
                            width:${(levelProgress.easy.success / 4) * 100}%;
                            height:100%;
                            background:#4ade80;
                            transition:0.3s;
                        "></div>
                    </div>

                </div>

                <!-- MEDIUM -->
                <div style="margin-bottom:16px; text-align:left;">

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        margin-bottom:6px;
                        font-size:14px;
                    ">
                        <span>Medium</span>
                        <span>${levelProgress.medium.success}/4</span>
                    </div>

                    <div style="
                        width:100%;
                        height:12px;
                        background:#e5e7eb;
                        border-radius:999px;
                        overflow:hidden;
                    ">
                        <div style="
                            width:${(levelProgress.medium.success / 4) * 100}%;
                            height:100%;
                            background:#60a5fa;
                            transition:0.3s;
                        "></div>
                    </div>

                </div>

                <!-- HARD -->
                <div style="text-align:left;">

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        margin-bottom:6px;
                        font-size:14px;
                    ">
                        <span>Hard</span>
                        <span>${levelProgress.hard.success}/4</span>
                    </div>

                    <div style="
                        width:100%;
                        height:12px;
                        background:#e5e7eb;
                        border-radius:999px;
                        overflow:hidden;
                    ">
                        <div style="
                            width:${(levelProgress.hard.success / 4) * 100}%;
                            height:100%;
                            background:#a78bfa;
                            transition:0.3s;
                        "></div>
                    </div>

                </div>

            </div> 
            
            <div style="margin-top:20px;">
                <h3>Izvēlies līmeni</h3>

                <button 
                    onclick="selectLevel('easy')" 
                    class="${selectedLevel === 'easy' ? 'active-level' : ''}"
                    ${!levelProgress.easy.unlocked ? "disabled" : ""}>
                    Easy ${levelProgress.easy.unlocked ? "" : ""}
                </button>

                <button 
                    onclick="selectLevel('medium')" 
                    class="${selectedLevel === 'medium' ? 'active-level' : ''}"
                    ${!levelProgress.medium.unlocked ? "disabled" : ""}>
                    Medium ${levelProgress.medium.unlocked ? "" : ""}
                </button>

                <button 
                    onclick="selectLevel('hard')" 
                    class="${selectedLevel === 'hard' ? 'active-level' : ''}"
                    ${!levelProgress.hard.unlocked ? "disabled" : ""}>
                    Hard ${levelProgress.hard.unlocked ? "" : ""}
                </button>
            </div>
            
            <div style="margin-top: 40px; display:flex; flex-direction:column; gap:10px; align-items:center;">
                <button class="green" onclick="startSelectedLevel()">Esmu gatavs, sākt!</button>
                <button onclick="chooseMode()">⬅ Atpakaļ</button>
            </div>
        </div>
    `;
}

function startSelectedLevel() {
    if (selectedLevel) {
        levelDifficulty = selectedLevel;
    } else {
        if (levelProgress.hard.unlocked) levelDifficulty = "hard";
        else if (levelProgress.medium.unlocked) levelDifficulty = "medium";
        else levelDifficulty = "easy";
    }

    currentTaskIndex = 0;
    sessionStats = { 
        errors: {}, 
        startTime: 0,
        earnedTotal: 0,
        maxTotal: 0
    };

    renderTask1();
}


function renderTask1() {
    if (sessionStats.startTime === 0) {
        sessionStats.startTime = Date.now();
    }
    
    clearScreen();
    let app = document.getElementById("app");
    let activeDifficulty = levelDifficulty;
    let variants = task1Data[activeDifficulty];
    let randomIndex = Math.floor(Math.random() * variants.length);
    currentTaskVariant = variants[randomIndex]; 

    let allItems = currentTaskVariant.flatMap(d => d.items).sort(() => Math.random() - 0.5);

    app.innerHTML = `
        <div class="game-header">
            <div class="status-info">
                <span>Līmenis: <b>${activeDifficulty.toUpperCase()}</b></span>  
                <div style="font-size:12px; margin-top:5px;">
                    Veiksmīgi raundi: ${levelProgress[activeDifficulty].success}/4
                </div>
                <span id="timer">Laiks: 0s</span>
            </div>
            <div class="progress-bar">
                <div id="progress-fill" style="width:${(currentTaskIndex / 2) * 100}%"></div>
            </div>
        </div>
        
        <p class="instruction-text">Sakārto elementus pareizajās zonās:</p>

        <div id="drag-source" class="drag-container">
            ${allItems.map(item => `
                <div class="draggable" draggable="true" ondragstart="drag(event)" id="${item}">${item}</div>
            `).join('')}
        </div>

        <div class="drop-zones">
            ${currentTaskVariant.map(d => `
                <div class="drop-zone" ondrop="drop(event)" ondragover="allowDrop(event)" data-part="${d.part}">
                    <h4>${d.part}</h4>
                </div>
            `).join('')}
        </div>

        <button class="green" onclick="checkTask1()">Pārbaudīt atbildes</button>
        <button onclick="startGame()">Iziet</button>
    `;

    startTimer();
}


function checkLevelUp() {
    let data = levelProgress[levelDifficulty];

    if (data.rounds >= 4 && data.success >= 4) {
        let unlockedNew = false;
        if (levelDifficulty === "easy" && !levelProgress.medium.unlocked) {
            levelProgress.medium.unlocked = true;
            unlockedNew = true;
        } 
        else if (levelDifficulty === "medium" && !levelProgress.hard.unlocked) {
            levelProgress.hard.unlocked = true;
            unlockedNew = true;
        }

        if (unlockedNew) {
            alert("Jauns līmenis atbloķēts!");
        }
        
        data.rounds = 0;
        data.success = 0;
        
        saveTask1Progress();
    }
}

// Drag un Drop funkcijas
function allowDrop(ev) { ev.preventDefault(); }
function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); }
function drop(ev) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    let zone = ev.target.closest('.drop-zone');
    if (zone) zone.appendChild(document.getElementById(data));
}

let timerInterval;
function startTimer() {
    let sec = 0;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        sec++;
        document.getElementById("timer").innerText = `Laiks: ${sec}s`;
    }, 1000);
}

function updateUserProgress(score, maxScore) {
    let users = loadUsers();
    let user = users[currentUserId];
    let duration = (Date.now() - sessionStats.startTime) / 1000;

    user.score += Math.round(score * maxScore); 
    
    user.progress_history.push(score);
    user.times.push(duration);

    user.lastResult = {
        earned: Math.round(score * maxScore),
        max: maxScore
    };

    saveUsers(users);
}

function validateTaskCompletion() {
    let zones = document.querySelectorAll(".drop-zone");
    let dragSource = document.getElementById("drag-source");

    let emptyZones = [];
    let remainingItems = dragSource.querySelectorAll(".draggable").length;

    zones.forEach(zone => {
        let items = zone.querySelectorAll(".draggable").length;

        if (items === 0) {
            zone.classList.add("empty");
            emptyZones.push(zone.getAttribute("data-part"));
        } else {
            zone.classList.remove("empty");
        }
    });

    return {
        isValid: emptyZones.length === 0 && remainingItems === 0,
        emptyZones,
        remainingItems
    };
}

function checkTask1() {
    clearInterval(timerInterval);

    let validation = validateTaskCompletion();

    if (!validation.isValid) {
        let box = document.getElementById("warning-box");
        if (!box) {
            let app = document.getElementById("app");
            app.innerHTML += `
                <div id="warning-box" class="warning-box">
                    Lūdzu aizpildi visas sadaļas pirms pārbaudes!
                </div>
            `;
        }
        return;
    }

    clearInterval(timerInterval);
    let zones = document.querySelectorAll(".drop-zone");
    let data = currentTaskVariant; 
    
    let totalItems = data.flatMap(d => d.items).length;
    let correctCount = 0;

    zones.forEach(zone => {
        let partName = zone.getAttribute("data-part");
        let correctItems = data.find(d => d.part === partName).items;
        let placedCards = zone.querySelectorAll(".draggable");

        if (placedCards.length !== correctItems.length) {
            sessionStats.errors[partName] = true; 
        }

        placedCards.forEach(card => {
            if (correctItems.includes(card.id)) {
                card.style.backgroundColor = "#d4edda";
                card.style.borderColor = "#28a745";
                card.style.color = "#155724";
                correctCount++;
            } else {
                card.style.backgroundColor = "#f8d7da";
                card.style.borderColor = "#dc3545";
                card.style.color = "#721c24";

                sessionStats.errors[partName] = true;
            }
        });
    });

    let maxPoints = totalItems;
    let earnedPoints = correctCount;
    let correctRatio = correctCount / totalItems;
    let isSuccessRound = correctRatio >= 0.85; 
    let levelData = levelProgress[levelDifficulty];


    sessionStats.earnedTotal += earnedPoints;
    sessionStats.maxTotal += maxPoints;

    let timeSpent = (Date.now() - sessionStats.startTime) / 1000;

    checkAchievements({
        task: 1,
        errors: Object.keys(sessionStats.errors).length,
        difficulty: levelDifficulty,
        seconds: timeSpent,
        score: earnedPoints
    });

    updateUserProgress(earnedPoints / maxPoints, maxPoints);
    
    document.querySelectorAll(".draggable").forEach(el => {
        el.setAttribute("draggable", "false");
        el.style.cursor = "default";
    });

    let actionBtn = document.querySelector("button.green");
    actionBtn.innerText = "Turpināt";

    actionBtn.onclick = () => {
        let levelData = levelProgress[levelDifficulty];
        levelData.rounds++;
        if (isSuccessRound) {
            levelData.success++;
        }

        checkLevelUp();
        saveTask1Progress(); 

        currentTaskIndex++;
        if (currentTaskIndex < 2) {
            renderTask1(); 
        } else {
            showFinalStats();
        }
    };
}



function toggleExplanations() {
    let errorKeys = Object.keys(sessionStats.errors);
    let box = document.getElementById("explanations-box");

    if (!box) return;

    let html = "";

    errorKeys.forEach(key => {
        if (partExplanations[key]) {
            html += `
                <div style="text-align:left; margin-bottom:12px; padding:10px; border-left:4px solid #007bff;">
                    <b>${key}</b><br>
                    ${partExplanations[key]}
                </div>
            `;
        }
    });

    box.innerHTML = html;

    let btn = document.querySelector(".green");
    if (btn && btn.innerText.includes("Skatīt")) {
        btn.style.display = "none";
    }
}

function showFinalStats() {
    clearScreen();
    let app = document.getElementById("app");

    let errorKeys = Object.keys(sessionStats.errors);

    let user = loadUsers()[currentUserId];
    let earned = sessionStats.earnedTotal;
    let max = sessionStats.maxTotal;

    let feedbackHTML = "";

    if (errorKeys.length > 0) {
        feedbackHTML = `
            <h3>Tev bija kļūdas dažās sadaļās.</h3>
            <p>Vai vēlies redzēt paskaidrojumus?</p>

            <button style="background-color: rgb(179, 201, 237); color: black; margin: 10px auto; display: block;" onclick="toggleExplanations()">
                Skatīt padomus
            </button>

            <div id="explanations-box" style="margin-top:20px;"></div>
        `;
    } else {
        feedbackHTML = `<h3>Izcils darbs! Tev nav nevienas kļūdas.</h3>`;
    }

    app.innerHTML = `
        <div class="box intro-box">
            <h2>Rezultāti</h2>

            <p><b>Punkti:</b> ${earned} / ${max}</p>

            <hr>
            ${feedbackHTML}
            <hr>

            <button style="
                background-color: rgb(172, 234, 152);
                color: black;
                margin: 20px auto 0 auto;
                display: block;"
            onclick="chooseMode()">
                Pabeigt
            </button>
        </div>
    `;
}
