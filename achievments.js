const achievementsDB = [

    { id: 't1_no_errors', title: 'Bez kļūdām', task: 1, description: 'Pabeigt 1. uzdevumu bez nevienas kļūdas.', icon: '🎯' },
    { id: 't1_logic_master', title: 'Loģikas meistars', task: 1, description: 'Pabeigt HARD līmeni bez kļūdām.', icon: '🧠' },
    { id: 't1_fast_thinker', title: 'Ātrs domātājs', task: 1, description: 'Pabeigt uzdevumu ātrāk par 40 sekundēm.', icon: '⚡' },
    
    { id: 't2_first_sim', title: 'Pirmā simulācija', task: 2, description: 'Pirmā simulācija.', icon: '🥇' },
    { id: 't2_high_score', title: 'Augsts novērtējums', task: 2, description: 'Augsts prezentāciju novērtējums.', icon: '🎯' },
    { id: 't2_time_dist', title: 'Labs laika sadalījums', task: 2, description: 'Labs laika sadalījums.', icon: '⏱' },

    { id: 't3_first_def', title: 'Pirmā aizstāvēšana', task: 3, description: 'Pirmā prezentāciju aizstāvēšana.', icon: '🥇' },
    { id: 't3_active_student', title: 'Aktīvs students', task: 3, description: 'Izpildīt 5 Q&A simulācijas.', icon: '🔥' },
    { id: 't3_commission_passed', title: 'Komisija pārvarēta', task: 3, description: 'Atbilžu rezultāti ir virs 70.', icon: '🛡' },
   
    { id: 'gen_150_points', title: '150 punkti', task: 'all', description: 'Iegūt 150 kopējos punktus.', icon: '⭐' }
];

function checkAchievements(context) {
    let users = loadUsers();
    let user = users[currentUserId];
    if (!user.achievements) user.achievements = [];
    
    let newlyEarned = [];

    achievementsDB.forEach(ach => {
        if (user.achievements.includes(ach.id)) return;

        let earned = false;

        switch (ach.id) {
            case 't1_no_errors':
                if (context.task === 1 && context.errors === 0) earned = true;
                break;
            case 't1_logic_master':
                if (context.task === 1 && context.difficulty === 'hard' && context.errors === 0) earned = true;
                break;
            case 't1_fast_thinker':
                if (context.task === 1 && context.seconds < 40) earned = true;
                break;
            case 't2_first_sim':
                if (context.task === 2) earned = true;
                break;
            case 't2_high_score':
                if (context.task === 2 && context.score > 85) earned = true;
                break;
            case 't2_time_dist':
                if (
                    context.task === 2 &&
                    context.hasTimingData &&
                    context.timeFeedbackLength === 0
                ) {
                    earned = true;
                }
                break;
            case 't3_first_def':
                if (context.task === 3) earned = true;
                break;
            case 't3_active_student':
                if (context.task === 3 && (user.t3_count || 0) >= 5) earned = true;
                break;
            case 'gen_150_points':
                if (user.score >= 150) earned = true;
                break;
        }

        if (earned) {
            user.achievements.push(ach.id);
            newlyEarned.push(ach);
        }
    });

    if (newlyEarned.length > 0) {
        saveUsers(users);
        showAchievementNotification(newlyEarned);
    }
}

function showAchievementNotification(list) {

    let container = document.getElementById('achievement-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'achievement-container';
        document.body.appendChild(container);
    }

    list.forEach((ach, index) => {
        const notify = document.createElement('div');
        notify.className = 'achievement-notification';
        notify.innerHTML = `
            <span style="font-size:24px;">${ach.icon}</span>
            <div>
                <div style="font-weight:bold; font-size:14px;">${ach.title}</div>
                <div style="font-size:12px;">${ach.description}</div>
            </div>
        `;
        
        container.appendChild(notify);

        setTimeout(() => notify.classList.add('show'), index * 300 + 100);

        setTimeout(() => {
            notify.classList.remove('show');
            setTimeout(() => notify.remove(), 500);
        }, 4000 + (index * 300));
    });
}