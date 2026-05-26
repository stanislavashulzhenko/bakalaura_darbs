
function clearScreen() {
    document.getElementById("app").innerHTML = "";
}

function showStartScreen() {
    clearScreen();
    let app = document.getElementById("app");
    let users = loadUsers();

    app.innerHTML += `


        <div class="mainMenu">
            <h2>Laipni lūdzam!</h2>
            <p class="subText">Izvēlieties lietotāju</p>
    `;

    for (let id in users) {
        let u = users[id];

        app.innerHTML += `
            <div class="userRow">
                <button class="userButton" onclick="login('${id}')">
                    <span>${u.name}</span>
                    <span class="points">⭐ ${u.score}</span>
                </button>

                <button class="red deleteBtn" onclick="deleteUser('${id}')">
                    ✕
                </button>
            </div>
        `;
    }

    app.innerHTML += `
            <br>
            <button class="green createBtn" onclick="showCreateUser()">
                + Izveidot lietotāju
            </button>
        </div>
    `;
}

function showCreateUser() {
    clearScreen();

    let app = document.getElementById("app");

    app.innerHTML = `
        <div class="mainMenu">

            <h3>Ievadiet vārdu</h3>

            <input 
                id="nameInput" 
                class="niceInput"
                placeholder="Ievadiet lietotāja vārdu"
            >

            <br><br>

            <button class="green createBtn" onclick="create()">
                Sākt
            </button>

            <button class="backBtn" onclick="showStartScreen()">
                ⬅ Atpakaļ
            </button>

        </div>
    `;

    window.create = function () {
        let name = document.getElementById("nameInput").value.trim();

        if (!name) return;

        currentUserId = createUser(name);
        chooseMode();
    };
}

function chooseMode() {
    clearScreen();

    let app = document.getElementById("app");

    let user = loadUsers()[currentUserId];

    app.innerHTML = `
        <div class="mainMenu">

            <button class="profileBtn" onclick="showProfile()">
                👤 ${user.name}
            </button>

            <h3>Izvēlieties spēli</h3>

            <button class="menuBtn" onclick="startGame()">
                🧩 Prezentāciju plānošana
            </button>

            <br><br>

            <button class="menuBtn blue" onclick="loadTask2()">
                🎙️ Prezentēšanas simulācija
            </button>

            <br><br>

            <button class="menuBtn purple" onclick="startDefenseSim()">
                🛡️ Aizstāvēšanas simulācija
            </button>

        </div>
    `;
}