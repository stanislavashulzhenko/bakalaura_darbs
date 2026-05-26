function loadUsers() {
    return JSON.parse(localStorage.getItem("users") || "{}");
}

function saveUsers(data) {
    localStorage.setItem("users", JSON.stringify(data));
}

function createUser(name) {
    let users = loadUsers();

    for (let id in users) {
        if (users[id].name === name) return id;
    }

    let id = crypto.randomUUID();
    users[id] = {
        name: name,
        score: 0,
        progress_history: [],
        times: [],
        last_improvement: 0,
        task1Progress: {
            easy: 0,
            medium: 0,
            hard: 0
        },
    };

    saveUsers(users);
    return id;
}

function login(id) {
    currentUserId = id;
    chooseMode();
}

function deleteUser(id) {
    let users = loadUsers();
    delete users[id];
    saveUsers(users);
    showStartScreen();
}
