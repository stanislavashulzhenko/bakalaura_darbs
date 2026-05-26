function showProfile() {

    clearScreen();

    let app = document.getElementById("app");
    let users = loadUsers();
    let user = loadUsers()[currentUserId];

    const userAch = user.achievements || [];
    let achievementsHTML = achievementsDB.map(ach => {
        const isEarned = userAch.includes(ach.id);
        let progress = "";
        
        if (!isEarned) {
            if (ach.id === 'gen_150_points') progress = `(${user.score || 0}/150)`;
            if (ach.id === 't3_active_student') progress = `(${user.t3_count || 0}/5)`;
        }

        return `
            <div class="ach-item ${isEarned ? 'earned' : 'locked'}">
                <span class="ach-icon" style="font-size:20px;">${ach.icon}</span>
                <div>
                    <div style="font-weight:bold; font-size:13px;">${ach.title}</div>
                    <div style="font-size:11px;">${ach.description} ${progress}</div>
                </div>
            </div>
        `;
    }).join("");


    let task2History = user.task2History || [];
    let task3History = user.task3History || [];
    let lastTask2 = task2History[task2History.length - 1];

    app.innerHTML = `

        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:15px;
        ">
            <h2 style="margin:0;">Profils</h2>

            <button class="profileBtn" onclick="chooseMode()" style="
                position:static;
            ">
                Galvenais ekrāns
            </button>
        </div>

        <div class="box">
            <p><b>Vārds:</b> ${user.name}</p>
            <p><b>Kopējie punkti:</b> ${user.score || 0}</p>
        </div>

        <div class="box">
            <h3>Sasniegumi</h3>
            <div class="achievements-grid">
                ${achievementsHTML}
            </div>
        </div>

        ${lastTask2 ? `
            <div class="box">

                <h3>Pēdējā prezentācijas analīze</h3>

                <p>
                    <b>Punkti:</b>
                    ${lastTask2.totalScore}
                </p>

                <p>
                    <b>Novērtējums:</b>
                    ${lastTask2.summary}
                </p>

                <hr>

                ${Object.entries(lastTask2.parts)
                    .map(([name, text]) => `
                        <div style="margin-bottom:20px;">

                            <h4>${name}</h4>

                            <textarea
                                readonly
                                style="
                                    width:100%;
                                    height:120px;
                                    resize:none;
                                "
                            >${text}</textarea>

                        </div>
                    `).join("")}

            </div>
        ` : ""}

        <div class="box">

            <h3>Q&A vēsture</h3>

            ${task3History.length === 0
                ? "<p>Nav datu</p>"
                : task3History.map(item => `
                    <div style="
                        margin-bottom:15px;
                        padding:10px;
                        border:1px solid #ccc;
                        border-radius:8px;
                    ">

                        <p><b>Jautājums:</b><br> ${item.question}</p>

                        <p><b>Atbilde:</b><br> ${item.answer}</p>

                    <p style="
                        font-weight:bold;
                        color:
                            ${item.score >= 80
                                ? "green"
                                : item.score >= 60
                                    ? "#d4a017"
                                    : "red"
                            };
                    ">
                        ${item.score}/100 punkti
                    </p>

                    ${item.feedback && item.feedback.length > 0 ? `
                        <ul style="margin-top:8px;">
                            ${item.feedback
                                .map(f => `<li>${f}</li>`)
                                .join("")}
                        </ul>
                    ` : ""}

                    </div>
                `).join("")
            }

        </div>

        <button onclick="chooseMode()">
            ⬅ Atpakaļ
        </button>
    `;
}