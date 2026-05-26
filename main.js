let currentUserId = null;
let tasksData = null;

async function loadTasks() {
    try {
        let response = await fetch("uzdevumi.json");
        if (!response.ok) throw new Error("HTTP " + response.status);
        tasksData = await response.json();
    } catch (e) {
        console.warn("Nevar ielādēt uzdevumi.json:", e);

    }
}

async function init() {
    try {
        await loadTasks();
        showStartScreen();
    } catch (e) {
        console.error("Init kļūda:", e);
        document.getElementById("app").innerHTML =
            `<p style="color:red">Kļūda ielādējot lietotni: ${e.message}</p>
             <pre>${e.stack}</pre>`;
    }
}

init();