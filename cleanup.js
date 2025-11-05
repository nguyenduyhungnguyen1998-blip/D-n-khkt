// Auto cleanup: Xóa comment dài, giữ comment ngắn quan trọng
const fs = require('fs');

function cleanup(code) {
    let result = code;
    
    // Xóa comment khối nhiều dòng
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    
    
    result = result.replace(/\/\/(.{15,})$/gm, '');
    
    // Xóa nhiều dòng trống liên tiếp
    result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
    
   
    result = result.replace(/[ \t]+$/gm, '');
    
    return result;
}

// Rút gọn: CHỈ var, KHÔNG đổi ID
function shortenVars(code) {
    const safe = {
        'unlockedAchievements': 'unlockAch',
        'selectedTitleId': 'selTitle',
        'lastUnlockedCount': 'lastUnlock',
        'suppressAchPopup': 'supAch',
        'challengeTimer': 'chTimer',
        'challengeDeadline': 'chDead',
        'challengeLimit': 'chLimit',
        'challengeActive': 'chActive',
        'currentChallengeDifficulty': 'chDiff',
        'pendingChallengeWinPopup': 'pendChWin',
        'sandboxOptions': 'sbOpt',
        'audioElements': 'audEls',
        'moveHistory': 'mvHist',
        'usedAutoSolve': 'usedAuto',
        'themeChanged': 'themeChg',
        'CURRENT_MODE': 'MODE',
        'THEME_EMOJIS': 'EMOJIS'
    };
    
    let result = code;
    for (const [old, neu] of Object.entries(safe)) {
        const regex = new RegExp('\\b' + old + '\\b', 'g');
        result = result.replace(regex, neu);
    }
    return result;
}

const input = process.argv[2] || 'ap2.js';
const output = process.argv[3] || 'ap2.clean.js';

let code = fs.readFileSync(input, 'utf8');
code = cleanup(code);
code = shortenVars(code);

fs.writeFileSync(output, code, 'utf8');
console.log(`✅ Cleaned ${input} -> ${output}`);
console.log(`📊 ${code.length} bytes`);
